import json
import os
import re
import time
from collections import defaultdict, deque
from http.server import SimpleHTTPRequestHandler, ThreadingHTTPServer
from urllib.parse import quote, urlsplit

ROOT = os.path.dirname(os.path.abspath(__file__))


PORT = int(os.environ.get("PORT", "8000"))
MAX_BODY_BYTES = 20_000
MAX_MESSAGE_CHARS = 4_000
RATE_LIMIT = 12
RATE_WINDOW_SECONDS = 60
requests_by_ip = defaultdict(deque)
PHOTO_IMAGE_EXTENSIONS = {".jpg", ".jpeg", ".png", ".webp", ".gif", ".bmp", ".avif", ".tif", ".tiff"}
PHOTO_GROUP_LABELS = {
    ".": "General Photos",
    "doctor": "Medical Photos",
    "logo": "Logo Designs",
    "photoshop": "Photo Editing",
    "poster": "Poster Designs",
}


def get_photo_design_groups():
    photo_root = os.path.join(ROOT, "video work", "photo design")
    groups = {}

    for current_dir, subdirectories, filenames in os.walk(photo_root):
        subdirectories.sort(key=str.casefold)
        relative_dir = os.path.relpath(current_dir, photo_root)
        group_key = "." if relative_dir == "." else relative_dir
        images = groups.setdefault(group_key, [])

        for filename in sorted(filenames, key=str.casefold):
            if os.path.splitext(filename)[1].lower() not in PHOTO_IMAGE_EXTENSIONS:
                continue

            full_path = os.path.join(current_dir, filename)
            relative_path = os.path.relpath(full_path, ROOT).replace(os.sep, "/")
            images.append({
                "name": os.path.splitext(filename)[0],
                "src": quote(relative_path, safe="/"),
            })

    group_keys = sorted(groups, key=lambda key: (key != ".", key.casefold()))
    return {
        "groups": [
            {
                "name": PHOTO_GROUP_LABELS.get(key.casefold(), key),
                "images": groups[key],
            }
            for key in group_keys
            if groups[key]
        ]
    }


def response(handler, status, payload):
    body = json.dumps(payload, ensure_ascii=False).encode("utf-8")
    handler.send_response(status)
    handler.send_header("Content-Type", "application/json; charset=utf-8")
    handler.send_header("Content-Length", str(len(body)))
    handler.send_header("Cache-Control", "no-store")
    handler.end_headers()
    handler.wfile.write(body)


def normalize_text(value):
    if not value:
        return ""
    value = value.lower().translate(str.maketrans({"أ": "ا", "إ": "ا", "آ": "ا", "ى": "ي"}))
    value = re.sub(r"[\u064b-\u065f\u0670]", "", value)
    value = value.replace("&", " and ")
    value = re.sub(r"[^a-z0-9\s\u0600-\u06ff]", " ", value)
    value = re.sub(r"\s+", " ", value).strip()
    return value


def parse_json_request(raw_body):
    if not raw_body:
        raise ValueError("Empty body")

    for encoding in ("utf-8", "utf-16", "cp1256", "latin-1"):
        try:
            return json.loads(raw_body.decode(encoding))
        except (UnicodeDecodeError, json.JSONDecodeError):
            continue

    return json.loads(raw_body.decode("utf-8", errors="replace"))


def local_chat_reply(question):
    q = normalize_text(question)

    if not q:
        return {"reply": "Ask me anything. If I know the answer, I will be glad to help."}

    if any(phrase in q for phrase in ["عامل ايه", "عامل اي", "ازيك", "ازايك", "ازي", "اخبارك", "كيفك", "how are you", "how are u"]):
        return {"reply": "I am doing well, thanks! How are you? Welcome to the chat."}

    if any(phrase in q for phrase in ["انت بتضحك عليا", "بتضحك عليا", "بتضحك علي", "are you laughing at me"]):
        return {"reply": "Not at all. I am just trying to keep things friendly."}

    if any(phrase in q for phrase in ["غبي", "انت اهبل", "انت غبي", "stupid", "dumb"]):
        return {"reply": "Give me another try. Rephrase your question and I will do my best to help."}

    if any(phrase in q for phrase in ["مش فاهم", "مش فاهمه", "مش واضح", "مش مفهوم", "i do not understand", "dont understand"]):
        return {"reply": "No problem. Tell me what is unclear and I will explain it step by step."}

    if any(phrase in q for phrase in ["شكرا", "شكراً", "متشكر", "تسلم", "thank you", "thanks"]):
        return {"reply": "You are welcome. I am here whenever you need help."}

    if any(phrase in q for phrase in ["باي", "مع السلامه", "اشوفك", "سلام", "bye", "goodbye"]):
        return {"reply": "See you next time. Come back whenever you have another question."}

    if any(phrase in q for phrase in ["اسمك", "انت مين", "مين انت", "who are you", "your name"]):
        return {"reply": "I am Mohamed Elsayd's assistant. Ask me anything about his work."}

    if any(phrase in q for phrase in ["ايه الشات", "الشات ده", "ايه ده", "what is this chat"]):
        return {"reply": "This is Mohamed's portfolio assistant. Ask me about his work or projects."}

    if any(phrase in q for phrase in ["ذكاء اصطناعي", "ai", "artificial intelligence", "روبوت"]):
        return {"reply": "I am an AI assistant here to help you learn about Mohamed and his work."}

    if any(phrase in q for phrase in ["اسال ايه", "اسألك ايه", "ممكن اسالك", "اي سؤال", "اسال براحتك", "ابدأ الكلام", "ابدا الكلام", "ask you anything", "how do i start"]):
        return {"reply": "Just type any question you have and I will do my best to help."}

    if any(phrase in q for phrase in ["عندك مشاريع", "عنده مشاريع", "مشاريع محمد", "مشاريع", "projects"]):
        return {"reply": "Mohamed has video, motion, perfume, and restaurant projects. Browse them here.", "cta": {"label": "Browse projects", "href": "#portfolio"}}

    if any(phrase in q for phrase in ["كام سنه", "كام سنة", "عنده كام سنه", "عمر محمد", "سن محمد", "how old"]):
        return {"reply": "I do not have verified information about his age, so I will not guess."}

    if any(phrase in q for phrase in ["هوايات", "هوايه", "هواية", "بيحب يعمل", "hobbies", "hobby"]):
        return {"reply": "I do not have reliable information about Mohamed's hobbies, so I will not guess."}

    if any(phrase in q for phrase in ["مشهور", "مشهور؟", "famous", "popular"]):
        return {"reply": "I cannot confirm that without reliable information."}

    if any(phrase in q for phrase in ["تعرف كل حاجه", "تعرف كل حاجة", "تعرف كل شيء", "know everything"]):
        return {"reply": "No. I can only answer using the information available to me."}

    if any(phrase in q for phrase in ["اقدر اعرف ايه", "اقدر اعرف اي", "اقدر اعرفه عن محمد", "تعرف ايه عن محمد", "معلومات عن محمد"]):
        return {"reply": "Ask me about his video editing, photography, content, or projects. Where would you like to start?", "cta": {"label": "Browse his work", "href": "#portfolio"}}

    if any(word in q for word in ["فين", "اين", "أين", "منين", "ساكن", "عايش", "يقيم", "مقيم", "عنوان", "مكانه", "المكان", "location", "where", "dubai", "jvc", "دبي", "السكن"]):
        return {"reply": "Mohamed is based in JVC, Dubai.", "cta": {"label": "View profile", "href": "#home"}}

    if q in ["مرحبا", "hello", "hi", "السلام عليكم", "اهلا", "اهلين"]:
        return {"reply": "Hello! Ask me about Mohamed or his work."}

    if any(word in q for word in ["سعر", "اسعار", "تكلفة", "بكام", "كم السعر", "price", "cost"]):
        return {"reply": "Pricing is not listed on the site. Contact Mohamed for a quote based on your request.", "cta": {"label": "Contact for pricing", "href": "#contact"}}

    if any(word in q for word in ["انستا", "instagram", "حساب", "social account", "social profile", "facebook", "youtube", "فيسبوك", "يوتيوب", "follow"]):
        return {"reply": "You can follow Mohamed on Instagram.", "cta": {"label": "Instagram", "href": "https://www.instagram.com/muhammed_elsayd.official/", "external": True}}

    if any(word in q for word in ["واتساب", "whatsapp", "تواصل", "اكلم", "اتصل", "كلم محمد", "contact", "reach out", "mail", "email", "رقم", "بريده"]):
        return {"reply": "You can contact Mohamed using the WhatsApp or email details on this page.", "cta": {"label": "Contact", "href": "#contact"}}

    if any(word in q for word in ["خبرة", "سنين", "سنوات", "experience"]):
        return {"reply": "The site does not specify his years of experience, but it showcases Mohamed's work and services.", "cta": {"label": "View portfolio", "href": "#portfolio"}}

    if any(word in q for word in ["motion", "animation", "موشن", "انيميشن", "أنيميشن"]):
        return {"reply": "Mohamed creates motion design, animation, and promotional edits.", "cta": {"label": "Motion projects", "href": "#motion-horizontal"}}

    if any(word in q for word in ["perfume", "عطور"]):
        return {"reply": "Browse the perfume videos in the Perfume Projects section.", "cta": {"label": "Perfume projects", "href": "#perfume-vertical"}}

    if any(word in q for word in ["restaurant", "مطاعم", "food", "resto"]):
        return {"reply": "Browse the restaurant videos in the vertical video section.", "cta": {"label": "Restaurant videos", "href": "#reels"}}

    if any(word in q for word in ["تصميم", "front end", "frontend", "website", "مواقع", "ui", "ux", "web design"]):
        return {"reply": "Mohamed designs clear, user-friendly interfaces and websites.", "cta": {"label": "View portfolio", "href": "#portfolio"}}

    if any(word in q for word in ["تصوير", "صور", "photo", "photography", "shots"]):
        return {"reply": "Mohamed works in photography and visual content creation.", "cta": {"label": "View portfolio", "href": "#portfolio"}}

    if any(word in q for word in ["فيديو", "video", "reels", "editing", "تحرير", "مونتاج", "منتاج", "short form", "social media", "سوشيال"]):
        return {"reply": "Mohamed specializes in short-form, promotional, and social media video editing.", "cta": {"label": "Watch videos", "href": "#reels"}}

    if any(word in q for word in ["بيعمل", "يعمل", "شغال", "بيشتغل", "مجاله", "خدمات", "مهارات", "شاطر", "بيقدم", "services", "specialty"]):
        return {"reply": "Mohamed works in video editing, content creation, photography, and web design.", "cta": {"label": "View portfolio", "href": "#portfolio"}}

    if any(word in q for word in ["عرفني", "نبذة", "نبذه", "من هو", "مين هو", "مين محمد", "من محمد", "about", "who is", "introduce", "محمد السيد"]):
        if any(phrase in q for phrase in ["مين محمد", "من هو", "who is"]):
            return {"reply": "Mohamed Elsayd owns this portfolio. What would you like to know about him?"}
        return {"reply": "Mohamed Elsayd specializes in short-form and promotional video editing, content creation, photography, and web design. His focus is engaging, practical visual work.", "cta": {"label": "Browse Mohamed's work", "href": "#portfolio"}}

    if any(word in q for word in ["اعرض", "أعرض", "ارني", "وريني", "اشوف", "أشوف", "أعماله", "اعماله", "portfolio", "show me", "view", "شغله"]):
        return {"reply": "Browse the video, motion, perfume, and restaurant projects in the portfolio.", "cta": {"label": "Browse portfolio", "href": "#portfolio"}}

    return {"reply": "I do not have an answer for that yet. Try rephrasing, or ask me about Mohamed's work."}


class PortfolioHandler(SimpleHTTPRequestHandler):
    def __init__(self, *args, **kwargs):
        super().__init__(*args, directory=ROOT, **kwargs)

    def do_GET(self):
        parsed = urlsplit(self.path)
        if parsed.path == "/api/photo-design":
            response(self, 200, get_photo_design_groups())
            return
        if parsed.path in ("", "/"):
            self.path = "/web.html"
        super().do_GET()

    def do_POST(self):
        if self.path != "/api/chat":
            response(self, 404, {"error": "Not found"})
            return

        client_ip = self.client_address[0]
        now = time.time()
        recent = requests_by_ip[client_ip]
        while recent and now - recent[0] > RATE_WINDOW_SECONDS:
            recent.popleft()
        if len(recent) >= RATE_LIMIT:
            response(self, 429, {"error": "Too many messages. Please try again shortly."})
            return

        try:
            length = int(self.headers.get("Content-Length", "0"))
        except ValueError:
            response(self, 400, {"error": "Invalid request"})
            return
        if length <= 0 or length > MAX_BODY_BYTES:
            response(self, 413, {"error": "Message is too large"})
            return

        try:
            raw_body = self.rfile.read(length)
            data = parse_json_request(raw_body)
            messages = data.get("messages", [])
            if not isinstance(messages, list) or not messages or len(messages) > 12:
                raise ValueError("Invalid messages")

            clean_messages = []
            for message in messages:
                role = message.get("role")
                content = message.get("content")
                if role not in ("user", "assistant") or not isinstance(content, str):
                    raise ValueError("Invalid message")
                content = content.strip()
                if not content or len(content) > MAX_MESSAGE_CHARS:
                    raise ValueError("Invalid message length")
                clean_messages.append({"role": role, "content": content})
        except (json.JSONDecodeError, AttributeError, ValueError):
            response(self, 400, {"error": "Please send a valid message."})
            return

        recent.append(now)
        last_question = next((m["content"] for m in reversed(clean_messages) if m["role"] == "user"), "")
        response_payload = local_chat_reply(last_question)
        response(self, 200, response_payload)

    def log_message(self, format_string, *args):
        if self.path.startswith("/api/"):
            return
        super().log_message(format_string, *args)


if __name__ == "__main__":
    server = ThreadingHTTPServer(("127.0.0.1", PORT), PortfolioHandler)
    print(f"Portfolio server running at http://127.0.0.1:{PORT}")
    try:
        server.serve_forever()
    except KeyboardInterrupt:
        print("\nServer stopped")
    finally:
        server.server_close()
