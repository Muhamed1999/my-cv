const driveMediaUrl = (path, type = 'video') => {
    if (!path) return '';

    let normalizedPath;
    try {
        normalizedPath = decodeURIComponent(path).replace(/^(?:\.\/|\/)+/, '');
    } catch {
        return '';
    }

    const media = window.driveMediaFiles.find((item) => item.path === normalizedPath);
    if (!media) return '';

    return type === 'image'
        ? `https://drive.google.com/thumbnail?id=${media.id}&sz=w1200`
        : `https://drive.google.com/uc?export=download&id=${media.id}`;
};

const useDrivePreviewOnError = (video, sourceUrl) => {
    video.addEventListener('error', () => {
        const fileId = new URL(sourceUrl).searchParams.get('id');
        if (!fileId || !video.isConnected) return;

        const frame = document.createElement('iframe');
        frame.src = `https://drive.google.com/file/d/${fileId}/preview`;
        frame.title = video.getAttribute('aria-label') || 'Google Drive video';
        frame.allow = 'autoplay';
        frame.allowFullscreen = true;
        frame.loading = 'lazy';
        video.replaceWith(frame);
    }, { once: true });
};

document.querySelectorAll('img[src]').forEach((image) => {
    const driveUrl = driveMediaUrl(image.getAttribute('src'), 'image');
    if (driveUrl) image.src = driveUrl;
});

document.querySelectorAll('video[src]').forEach((video) => {
    const driveUrl = driveMediaUrl(video.getAttribute('src'));
    const posterPath = video.getAttribute('data-drive-poster') || video.getAttribute('poster');
    const posterUrl = driveMediaUrl(posterPath, 'image');

    if (driveUrl) {
        useDrivePreviewOnError(video, driveUrl);
        video.src = driveUrl;
    }
    else video.removeAttribute('src');

    if (posterUrl) video.poster = posterUrl;
    else video.removeAttribute('poster');

    video.preload = 'none';
});

const menuToggle = document.querySelector('.menu-toggle');
const mainNav = document.querySelector('.main-nav');

if (menuToggle && mainNav) {
    menuToggle.addEventListener('click', () => {
        const isOpen = mainNav.classList.toggle('open');
        menuToggle.setAttribute('aria-expanded', String(isOpen));
    });

    mainNav.querySelectorAll('a').forEach((link) => {
        link.addEventListener('click', () => {
            mainNav.classList.remove('open');
            menuToggle.setAttribute('aria-expanded', 'false');
        });
    });
}

const isEditableTarget = (target) => target instanceof Element && target.closest('input, textarea, [contenteditable="true"]');

document.addEventListener('copy', (event) => {
    if (!isEditableTarget(event.target)) event.preventDefault();
});

document.addEventListener('cut', (event) => {
    if (!isEditableTarget(event.target)) event.preventDefault();
});

document.addEventListener('contextmenu', (event) => {
    if (event.target instanceof Element && event.target.closest('.page-shell, .chat-widget')) {
        event.preventDefault();
    }
});

document.addEventListener('dragstart', (event) => {
    if (event.target instanceof Element && event.target.closest('img, video')) {
        event.preventDefault();
    }
});
document.querySelectorAll('.video-carousel').forEach((carousel) => {
    const track = carousel.querySelector('.video-track');

    carousel.querySelectorAll('.carousel-arrow').forEach((button) => {
        button.addEventListener('click', () => {
            track.scrollBy({
                left: Number(button.dataset.direction) * track.clientWidth * 0.8,
                behavior: 'smooth'
            });
        });
    });

    carousel.querySelectorAll('video').forEach((video) => {
        video.addEventListener('play', () => {
            carousel.querySelectorAll('video').forEach((otherVideo) => {
                if (otherVideo !== video) otherVideo.pause();
            });
        });
    });
});

const collaborationCompanies = [
    {
        name: 'Aqua Solo',
        folder: 'aqwa solo',
        images: [
            'Aqua-Solo/gesign/aqwa-solo-logo.png',
            'Aqua-Solo/gesign/Fixed Pro copy.png',
            'Aqua-Solo/gesign/FIXED WATER Logo.png',
            'Aqua-Solo/gesign/fixed- logo copy.png',
            'Aqua-Solo/gesign/logo aqwa solo.png',
            'Aqua-Solo/gesign/new fix ai.png',
            'Aqua-Solo/gesign/Rounded Business Card Mockup 1 copy.jpg',
            'Aqua-Solo/gesign/s.png',
            'Aqua-Solo/gesign/VODA Logo.png'
        ],
        videos: [
            'Aqua-Solo/1.mp4',
            'Aqua-Solo/2.mp4',
            'Aqua-Solo/3.mp4',
            'Aqua-Solo/4.mp4',
            'Aqua-Solo/7lمراحلصشفثق.mp4',
            'Aqua-Solo/809.mp4',
            'Aqua-Solo/aqwasolo storry.mp4',
            'Aqua-Solo/aqwasolo tkbireid.mp4',
            'Aqua-Solo/fixed- logo copy.avi',
            'Aqua-Solo/fixed=id.mp4',
            'Aqua-Solo/ROvoda.mp4',
            'Aqua-Solo/zah2tony.mp4',
            'Aqua-Solo/صيانه فلترك فكيبد.mp4',
            'Aqua-solo reels.mp4',
            'Aqua-solo rells2024.mp4',
            'aqwa (enhanced).mp4',
            'aqwa.mp4',
            'فكسد.mp4'
        ]
    },
    {
        name: 'Mo Media',
        folder: 'mo media',
        images: [
            'ghgfdg].jpg',
            'goldenvoive degigne moam,ed.png',
            'سثؤخىي.png'
        ],
        videos: [
            'edit.mp4',
            'kwitsheko.mp4',
            'mo media for.mp4eeeeeeeeeeeeee.mp4',
            'mo media vedio.mp4',
            'star gold mo media.mp4',
            'WhatsApp Video 2024-06-26 at 02.19.44_03d203f4.mp4',
            'شركه ابو نايف.mp4',
            'هوا دا السبب ورا اعلانك الممول.mp4'
        ]
    }
];

const collaborationContainer = document.getElementById('collaborationCompanies');
const collaborationMediaRoot = 'video work/شركات تم التعاون معها';
const mediaUrl = (path, type) => driveMediaUrl(`${collaborationMediaRoot}/${path}`, type);

const photoDesignFallbackGroups = [
    {
        name: 'General Photos',
        files: ['Capture.JPG', 'IMG_20250419_231604.jpg', 'Untitled-1.jpg', 'بعغن.JPG']
    },
    {
        name: 'Medical Photos',
        files: [
            'doctor/464180096_122106413480570941_7360119215620716251_n.jpg',
            'doctor/5.jpg', 'doctor/abd elshafy.jpg', 'doctor/ahmed ghaber.jpg',
            'doctor/alla hassan.jpg', 'doctor/Amal abdelhafis.jpg', 'doctor/amira.jpg',
            'doctor/gerges.jpg', 'doctor/maha.jpg', 'doctor/mohamed mokhtar.jpg',
            'doctor/photo_5983589330179965510_y.jpg', 'doctor/photo_5983589330179965511_y.jpg',
            'doctor/photo_5983589330179965513_y.jpg', 'doctor/sabah abdllah.jpg'
        ]
    },
    {
        name: 'Logo Designs',
        files: [
            'Logo/1(1).png', 'Logo/1.png', 'Logo/2.png', 'Logo/3.166Z.png', 'Logo/3.png',
            'Logo/4(1).png', 'Logo/4.png', 'Logo/5.png', 'Logo/6.png', 'Logo/facebook.png',
            'Logo/Google_AI_Studio_2025-07-111T13_53_36.128Z.jpg',
            'Logo/Google_AI_Studio_2025-07-11T13_56_21.000Z.png',
            'Logo/Google_AI_Studio_2025-07-11T13_58_03.816Z.png', 'Logo/last kids.jpg',
            'Logo/photo_5999174641215717400_y.jpg', 'Logo/photo_5999174641215717401_y.jpg',
            'Logo/photo_5999174641215717402_y.jpg',
            'Logo/WhatsApp Image 2025-07-11 at 16.58.51_08ce08c4.jpg'
        ]
    },
    {
        name: 'Photo Editing',
        files: [
            'photoshop/photo_5944863259339374966_y.jpg', 'photoshop/photo_5944863259339374967_y.jpg',
            'photoshop/photo_5944863259339374968_y.jpg', 'photoshop/photo_5944863259339374969_y.jpg',
            'photoshop/photo_5944863259339374970_y.jpg', 'photoshop/photo_5944863259339374971_y.jpg',
            'photoshop/photo_5944863259339374972_y.jpg', 'photoshop/photo_5944863259339374973_y.jpg',
            'photoshop/photo_5944863259339374974_y.jpg', 'photoshop/photo_5944863259339374975_y.jpg',
            'photoshop/photo_5985508613625594286_y.jpg', 'photoshop/photo_5985508613625594287_y.jpg',
            'photoshop/photo_5985508613625594288_y.jpg', 'photoshop/photo_5985508613625594289_y.jpg',
            'photoshop/photo_5987614625069383142_y.jpg', 'photoshop/عيد ميلادي.jpg'
        ]
    },
    {
        name: 'Poster Designs',
        files: [
            'poster/photo_5944863259339374946_y.jpg', 'poster/photo_5944863259339374947_y.jpg',
            'poster/photo_5944863259339374948_y.jpg', 'poster/photo_5944863259339374951_y.jpg',
            'poster/photo_5944863259339374952_y.jpg', 'poster/photo_5944863259339374953_y.jpg',
            'poster/photo_5944863259339374954_y.jpg', 'poster/photo_5976318496008683289_y.jpg',
            'poster/photo_5983589330179965507_y.jpg', 'poster/photo_5983589330179965508_y.jpg',
            'poster/photo_5983589330179965509_y.jpg', 'poster/photo_5983589330179965512_y.jpg',
            'poster/photo_5983589330179965514_y.jpg', 'poster/photo_5983589330179965516_y.jpg',
            'poster/photo_5983589330179965588_y.jpg', 'poster/photo_5987760413439279493_y.jpg',
            'poster/photo_5987760413439279494_y.jpg', 'poster/photo_5987760413439279495_y.jpg',
            'poster/photo_5987760413439279496_y.jpg',
            'poster/كرت الامام والخلف في ملف واحد copy.jpg'
        ]
    }
];

const photoDesignGallery = document.getElementById('photoDesignGallery');
const renderPhotoDesignGroups = (groups) => {
    photoDesignGallery.replaceChildren();
    groups.forEach((group) => {
        const section = document.createElement('div');
        section.className = 'photo-design-group';

        const heading = document.createElement('h4');
        heading.textContent = group.name;
        section.appendChild(heading);

        const grid = document.createElement('div');
        grid.className = 'photo-design-grid';

        group.images.forEach((imageData) => {
            const imageUrl = driveMediaUrl(imageData.src, 'image');
            if (!imageUrl) return;

            const image = document.createElement('img');
            image.src = imageUrl;
            image.alt = `${group.name} example`;
            image.loading = 'lazy';
            image.decoding = 'async';
            grid.appendChild(image);
        });

        section.appendChild(grid);
        photoDesignGallery.appendChild(section);
    });
};

const photoDesignLocalGroups = photoDesignFallbackGroups.map((group) => ({
    name: group.name,
    images: group.files.map((file) => ({
        name: file.split('/').pop().replace(/\.[^.]+$/, ''),
        src: `video%20work/photo%20design/${file.split('/').map(encodeURIComponent).join('/')}`
    }))
}));

if (photoDesignGallery) renderPhotoDesignGroups(photoDesignLocalGroups);

const createCollaborationMediaGroup = (label, files, type, company) => {
    if (!files.length) return null;

    const group = document.createElement('div');
    group.className = `collaboration-media-group collaboration-${type}-group`;

    const heading = document.createElement('h5');
    heading.textContent = label;
    group.appendChild(heading);

    const grid = document.createElement('div');
    grid.className = `collaboration-media-grid collaboration-${type}-grid`;
    grid.setAttribute('aria-label', `${label} - ${company.name}`);

    files.forEach((file) => {
        const sourceUrl = mediaUrl(`${company.folder}/${file}`, type === 'image' ? 'image' : 'video');
        if (!sourceUrl) return;

        const card = document.createElement('article');
        card.className = 'collaboration-media-item';

        if (type === 'image') {
            const image = document.createElement('img');
            image.src = sourceUrl;
            image.alt = `${company.name} design`;
            image.loading = 'lazy';
            image.decoding = 'async';
            card.appendChild(image);
        } else {
            const video = document.createElement('video');
            video.controls = true;
            video.playsInline = true;
            const isAvi = /\.avi$/i.test(file);
            video.preload = 'none';
            if (isAvi) {
                video.poster = mediaUrl(`${company.folder}/Aqua-Solo/gesign/fixed- logo copy.png`, 'image');
            }
            video.setAttribute('aria-label', `${company.name} video`);
            useDrivePreviewOnError(video, sourceUrl);
            video.src = sourceUrl;
            card.appendChild(video);
        }

        grid.appendChild(card);
    });

    group.appendChild(grid);
    return group;
};

if (collaborationContainer) {
    collaborationCompanies.forEach((company) => {
        const companySection = document.createElement('section');
        companySection.className = 'collaboration-company';

        const heading = document.createElement('h4');
        heading.textContent = company.name;
        companySection.appendChild(heading);

        const images = createCollaborationMediaGroup('Images & Design', company.images, 'image', company);
        const videos = createCollaborationMediaGroup('Videos', company.videos, 'video', company);
        if (images) companySection.appendChild(images);
        if (videos) companySection.appendChild(videos);
        collaborationContainer.appendChild(companySection);
    });
}

document.querySelectorAll('video').forEach((video) => {
    video.setAttribute('controlslist', 'nodownload noremoteplayback');
    video.setAttribute('disablepictureinpicture', '');
});
const prepareVideoPreview = (video) => {
    if (video.currentSrc.startsWith('https://drive.google.com/')) return;
    if (video.dataset.previewRequested || video.hasAttribute('poster')) return;
    video.dataset.previewRequested = 'true';

    const capturePreview = () => {
        if (!Number.isFinite(video.duration) || video.duration <= 0) return;

        video.dataset.previewSeeking = 'true';
        const handleSeeked = () => {
            video.removeEventListener('seeked', handleSeeked);
            video.dataset.previewSeeking = 'false';
            if (video.dataset.previewCanceled === 'true' || !video.paused || !video.videoWidth) return;

            const canvas = document.createElement('canvas');
            canvas.width = Math.min(video.videoWidth, 480);
            canvas.height = Math.round(canvas.width * video.videoHeight / video.videoWidth);

            try {
                const context = canvas.getContext('2d');
                context.drawImage(video, 0, 0, canvas.width, canvas.height);
                video.poster = canvas.toDataURL('image/jpeg', 0.8);
                video.dataset.previewCaptured = 'true';
            } catch {
                video.currentTime = 0;
            }
        };

        video.addEventListener('seeked', handleSeeked);
        video.currentTime = video.duration / 2;
    };

    video.addEventListener('play', () => {
        if (video.dataset.previewSeeking === 'true') {
            video.dataset.previewCanceled = 'true';
            video.dataset.previewSeeking = 'false';
            video.currentTime = 0;
        } else if (video.dataset.previewCaptured === 'true' && !video.dataset.previewPlayed) {
            video.dataset.previewPlayed = 'true';
            video.currentTime = 0;
        }
    });

    if (video.readyState >= 1) {
        capturePreview();
    } else {
        video.addEventListener('loadedmetadata', capturePreview, { once: true });
    }
};

const videos = document.querySelectorAll('.video-carousel video, .collaboration-media-grid video');
if ('IntersectionObserver' in window) {
    const previewObserver = new IntersectionObserver((entries) => {
        entries.forEach((entry) => {
            if (!entry.isIntersecting) return;
            entry.target.preload = 'metadata';
            entry.target.load();
            prepareVideoPreview(entry.target);
            previewObserver.unobserve(entry.target);
        });
    }, { rootMargin: '250px 300px' });

    videos.forEach((video) => previewObserver.observe(video));
} else {
    videos.forEach(prepareVideoPreview);
}

const chatToggle = document.getElementById('chatToggle');
const chatWidget = document.getElementById('chatWidget');
const chatClose = document.getElementById('chatClose');
const chatForm = document.getElementById('chatForm');
const chatInput = document.getElementById('chatInput');
const chatBody = document.getElementById('chatBody');

const addMessage = (text, type) => {
    const message = document.createElement('div');
    message.className = `message ${type}`;
    message.textContent = text;
    chatBody.appendChild(message);
    chatBody.scrollTop = chatBody.scrollHeight;
    return message;
};

const attachCtaButton = (message, cta) => {
    if (!cta || !cta.href) return;

    const button = document.createElement('a');
    button.href = cta.href;
    button.className = 'chat-cta';
    button.textContent = cta.label || 'Open section';

    if (cta.external) {
        button.target = '_blank';
        button.rel = 'noopener noreferrer';
    }

    message.appendChild(button);
    chatBody.scrollTop = chatBody.scrollHeight;
};

const localChatReply = (question) => {
    const normalized = question.toLowerCase()
        .replace(/[أإآ]/g, 'ا')
        .replace(/ى/g, 'ي')
        .replace(/[\u064b-\u065f\u0670]/g, '')
        .replace(/[^a-z0-9\s\u0600-\u06ff]/g, ' ')
        .replace(/\s+/g, ' ')
        .trim();
    const hasAny = (words) => words.some((word) => normalized.includes(word));

    if (hasAny(['عامل ايه', 'عامل اي', 'ازيك', 'ازايك', 'اخبارك', 'كيفك', 'how are you', 'how are u'])) {
        return { reply: 'I am doing well, thanks! How are you? Welcome to the chat.' };
    }
    if (hasAny(['انت بتضحك عليا', 'بتضحك عليا', 'بتضحك علي', 'are you laughing at me'])) {
        return { reply: 'Not at all. I am just trying to keep things friendly!' };
    }
    if (hasAny(['غبي', 'انت اهبل', 'انت غبي', 'stupid', 'dumb'])) {
        return { reply: 'Give me another try. Rephrase your question and I will do my best to help.' };
    }
    if (hasAny(['مش فاهم', 'مش فاهمه', 'مش واضح', 'مش مفهوم', 'i do not understand', 'dont understand'])) {
        return { reply: 'No problem. Tell me what is unclear and I will explain it step by step.' };
    }
    if (hasAny(['شكرا', 'متشكر', 'تسلم', 'thank you', 'thanks'])) {
        return { reply: 'You are welcome. I am here whenever you need help!' };
    }
    if (hasAny(['باي', 'مع السلامه', 'اشوفك', 'سلام', 'bye', 'goodbye'])) {
        return { reply: 'See you next time. Come back whenever you have another question!' };
    }
    if (hasAny(['اسمك', 'انت مين', 'مين انت', 'who are you', 'your name'])) {
        return { reply: "I am Mohamed Elsayd's assistant. Ask me anything about his work." };
    }
    if (hasAny(['ايه الشات', 'الشات ده', 'ايه ده', 'what is this chat'])) {
        return { reply: "This is Mohamed's portfolio assistant. Ask me about his work or projects." };
    }
    if (hasAny(['ذكاء اصطناعي', 'artificial intelligence', 'روبوت'])) {
        return { reply: "I am an AI assistant here to help you learn about Mohamed and his work." };
    }
    if (hasAny(['اسال ايه', 'اسألك ايه', 'ممكن اسألك', 'اي سؤال', 'اسال براحتك', 'ابدا الكلام', 'ask you anything', 'how do i start'])) {
        return { reply: 'Just type any question you have and I will do my best to help.' };
    }
    if (hasAny(['عندك مشاريع', 'عنده مشاريع', 'مشاريع محمد', 'مشاريع', 'projects'])) {
        return { reply: 'Mohamed has video, motion, perfume, and restaurant projects. Browse them here.', cta: { label: 'Browse projects', href: '#portfolio' } };
    }
    if (hasAny(['كام سنه', 'عنده كام سنه', 'عمر محمد', 'سن محمد', 'how old'])) {
        return { reply: "I do not have verified information about his age, so I will not guess." };
    }
    if (hasAny(['هوايات', 'هوايه', 'بيحب يعمل', 'hobbies', 'hobby'])) {
        return { reply: "I do not have reliable information about Mohamed's hobbies, so I will not guess." };
    }
    if (hasAny(['مشهور', 'famous', 'popular'])) {
        return { reply: 'I cannot confirm that without reliable information.' };
    }
    if (hasAny(['تعرف كل حاجه', 'تعرف كل شيء', 'know everything'])) {
        return { reply: 'No. I can only answer using the information available to me.' };
    }
    if (hasAny(['اقدر اعرف ايه', 'اقدر اعرف اي', 'اقدر اعرفه عن محمد', 'تعرف ايه عن محمد', 'معلومات عن محمد'])) {
        return { reply: 'Ask me about his video editing, photography, content, or projects. Where would you like to start?', cta: { label: 'Browse his work', href: '#portfolio' } };
    }

    if (hasAny(['فين', 'اين', 'أين', 'منين', 'ساكن', 'عايش', 'يقيم', 'مقيم', 'عنوان', 'مكانه', 'المكان', 'location', 'where', 'dubai', 'jvc', 'دبي', 'السكن'])) {
        return { reply: 'Mohamed is based in JVC, Dubai.', cta: { label: 'View profile', href: '#home' } };
    }
    if (['مرحبا', 'hello', 'hi', 'السلام عليكم', 'اهلا', 'اهلين'].includes(normalized)) {
        return { reply: 'Hello! Ask me about Mohamed, his services, or a specific project.' };
    }
    if (hasAny(['سعر', 'اسعار', 'تكلفة', 'بكام', 'كم السعر', 'price', 'cost'])) {
        return { reply: 'Pricing is not listed on the site. Contact Mohamed for a quote based on your request.', cta: { label: 'Contact for pricing', href: '#contact' } };
    }
    if (hasAny(['انستا', 'instagram', 'حساب', 'social account', 'social profile', 'facebook', 'youtube', 'فيسبوك', 'يوتيوب', 'follow'])) {
        return { reply: 'You can follow Mohamed on Instagram.', cta: { label: 'Instagram', href: 'https://www.instagram.com/muhammed_elsayd.official/', external: true } };
    }
    if (hasAny(['واتساب', 'whatsapp', 'تواصل', 'اكلم', 'اتصل', 'كلم محمد', 'contact', 'reach out', 'mail', 'email', 'رقم', 'بريده'])) {
        return { reply: 'You can contact Mohamed using the WhatsApp or email details on this page.', cta: { label: 'Contact', href: '#contact' } };
    }
    if (hasAny(['خبرة', 'سنين', 'سنوات', 'experience'])) {
        return { reply: "The site does not specify his years of experience, but it showcases Mohamed's work and services.", cta: { label: 'View portfolio', href: '#portfolio' } };
    }
    if (hasAny(['motion', 'animation', 'موشن', 'انيميشن', 'أنيميشن'])) {
        return { reply: 'Mohamed creates motion design, animation, and promotional edits.', cta: { label: 'Motion projects', href: '#motion-horizontal' } };
    }
    if (hasAny(['perfume', 'عطور'])) {
        return { reply: 'Browse the perfume videos in the Perfume Projects section.', cta: { label: 'Perfume projects', href: '#perfume-vertical' } };
    }
    if (hasAny(['restaurant', 'مطاعم', 'food', 'resto', 'اكل', 'أكل'])) {
        return { reply: 'Browse the restaurant videos in the vertical video section.', cta: { label: 'Restaurant videos', href: '#reels' } };
    }
    if (hasAny(['تصميم', 'front end', 'frontend', 'website', 'مواقع', 'ui', 'ux', 'web design'])) {
        return { reply: 'Mohamed designs clear, user-friendly interfaces and websites.', cta: { label: 'View portfolio', href: '#portfolio' } };
    }
    if (hasAny(['تصوير', 'صور', 'photo', 'photography', 'shots'])) {
        return { reply: 'Mohamed works in photography and visual content creation.', cta: { label: 'View portfolio', href: '#portfolio' } };
    }
    if (hasAny(['فيديو', 'video', 'reels', 'editing', 'تحرير', 'مونتاج', 'منتاج', 'short form', 'social media', 'سوشيال'])) {
        return { reply: 'Mohamed specializes in short-form, promotional, and social media video editing.', cta: { label: 'Watch videos', href: '#reels' } };
    }
    if (hasAny(['بيعمل', 'يعمل', 'شغال', 'بيشتغل', 'مجاله', 'خدمات', 'مهارات', 'شاطر', 'بيقدم', 'services', 'specialty'])) {
        return { reply: 'Mohamed works in video editing, content creation, photography, and web design.', cta: { label: 'View portfolio', href: '#portfolio' } };
    }
    if (hasAny(['عرفني', 'نبذة', 'نبذه', 'من هو', 'مين هو', 'مين محمد', 'من محمد', 'about', 'who is', 'introduce', 'محمد السيد'])) {
        if (hasAny(['مين محمد', 'من هو', 'who is'])) {
            return { reply: "Mohamed Elsayd owns this portfolio. What would you like to know about him?" };
        }
        return { reply: 'Mohamed Elsayd specializes in short-form and promotional video editing, content creation, photography, and web design. His focus is engaging, practical visual work.', cta: { label: "Browse Mohamed's work", href: '#portfolio' } };
    }
    if (hasAny(['اعرض', 'أعرض', 'ارني', 'وريني', 'اشوف', 'أشوف', 'أعماله', 'اعماله', 'portfolio', 'show me', 'view', 'شغله'])) {
        return { reply: 'Browse the video, motion, perfume, and restaurant projects in the portfolio.', cta: { label: 'Browse portfolio', href: '#portfolio' } };
    }
    return { reply: "I do not have an answer for that yet. Try rephrasing, or ask me about Mohamed's work." };
};

const arabicChatReplies = {
    'I am doing well, thanks! How are you? Welcome to the chat.': 'أنا بخير، شكرًا! وأنت عامل إيه؟ نورت الشات.',
    'Not at all. I am just trying to keep things friendly!': 'لا خالص، بحاول أخلي الكلام ودي ولطيف!',
    'Give me another try. Rephrase your question and I will do my best to help.': 'جرّب تسألني تاني بصياغة مختلفة، وأنا هحاول أساعدك.',
    'No problem. Tell me what is unclear and I will explain it step by step.': 'ولا يهمك. قولي إيه اللي مش واضح وأنا أوضحهولك خطوة بخطوة.',
    'You are welcome. I am here whenever you need help!': 'العفو، أنا موجود لو احتجت أي مساعدة!',
    'See you next time. Come back whenever you have another question!': 'أشوفك على خير، وارجع اسألني وقت ما تحب!',
    "I am Mohamed Elsayd's assistant. Ask me anything about his work.": 'أنا مساعد محمد السيد. اسألني عن شغله في أي وقت.',
    "This is Mohamed's portfolio assistant. Ask me about his work or projects.": 'أنا مساعد معرض أعمال محمد. اسألني عن شغله أو مشاريعه.',
    'I am an AI assistant here to help you learn about Mohamed and his work.': 'أنا مساعد ذكي، أقدر أساعدك تعرف أكتر عن محمد وشغله.',
    'Just type any question you have and I will do my best to help.': 'اكتب أي سؤال عندك وأنا هحاول أساعدك.',
    'Mohamed has video, motion, perfume, and restaurant projects. Browse them here.': 'محمد عنده مشاريع فيديو وموشن وعطور ومطاعم. تقدر تتصفحها من هنا.',
    'I do not have verified information about his age, so I will not guess.': 'ما عنديش معلومة مؤكدة عن عمره، ومش هخمن.',
    "I do not have reliable information about Mohamed's hobbies, so I will not guess.": 'ما عنديش معلومات موثوقة عن هوايات محمد، ومش هخمن.',
    'I cannot confirm that without reliable information.': 'ما أقدرش أأكد المعلومة دي من غير مصدر موثوق.',
    'No. I can only answer using the information available to me.': 'لأ، أقدر أجاوب بس بالمعلومات المتاحة عندي.',
    'Ask me about his video editing, photography, content, or projects. Where would you like to start?': 'اسألني عن المونتاج أو التصوير أو المحتوى أو المشاريع. تحب نبدأ بإيه؟',
    'Mohamed is based in JVC, Dubai.': 'محمد مقيم في منطقة JVC في دبي.',
    'Hello! Ask me about Mohamed, his services, or a specific project.': 'أهلًا! اسألني عن محمد أو خدماته أو أي مشروع معين.',
    'Pricing is not listed on the site. Contact Mohamed for a quote based on your request.': 'الأسعار مش موضحة على الموقع. تواصل مع محمد لمعرفة السعر حسب طلبك.',
    'You can follow Mohamed on Instagram.': 'تقدر تتابع محمد على إنستغرام.',
    'You can contact Mohamed using the WhatsApp or email details on this page.': 'تقدر تتواصل مع محمد من خلال واتساب أو البريد الموجودين في الصفحة.',
    "The site does not specify his years of experience, but it showcases Mohamed's work and services.": 'الموقع ما بيحددش عدد سنوات خبرته، لكنه بيعرض نماذج من شغله وخدماته.',
    'Mohamed creates motion design, animation, and promotional edits.': 'محمد بيقدم أعمال موشن وأنيميشن وفيديوهات دعائية.',
    'Browse the perfume videos in the Perfume Projects section.': 'تقدر تشوف فيديوهات العطور في قسم مشاريع العطور.',
    'Browse the restaurant videos in the vertical video section.': 'تقدر تشوف فيديوهات المطاعم في قسم الفيديوهات الطولية.',
    'Mohamed designs clear, user-friendly interfaces and websites.': 'محمد بيصمم واجهات ومواقع واضحة وسهلة الاستخدام.',
    'Mohamed works in photography and visual content creation.': 'محمد بيشتغل في التصوير وصناعة المحتوى المرئي.',
    'Mohamed specializes in short-form, promotional, and social media video editing.': 'محمد متخصص في مونتاج الفيديوهات القصيرة والدعائية ومحتوى السوشيال ميديا.',
    'Mohamed works in video editing, content creation, photography, and web design.': 'محمد بيشتغل في المونتاج وصناعة المحتوى والتصوير وتصميم المواقع.',
    'Mohamed Elsayd owns this portfolio. What would you like to know about him?': 'محمد السيد هو صاحب معرض الأعمال ده. تحب تعرف عنه إيه؟',
    "Mohamed Elsayd specializes in short-form and promotional video editing, content creation, photography, and web design. His focus is engaging, practical visual work.": 'محمد السيد متخصص في مونتاج الفيديوهات القصيرة والدعائية وصناعة المحتوى والتصوير وتصميم المواقع، وبيقدم شغل بصري جذاب وعملي.',
    'Browse the video, motion, perfume, and restaurant projects in the portfolio.': 'تقدر تتصفح مشاريع الفيديو والموشن والعطور والمطاعم في المعرض.',
    "I do not have an answer for that yet. Try rephrasing, or ask me about Mohamed's work.": 'مش معايا إجابة للسؤال ده حاليًا. جرّب تسأله بطريقة تانية أو اسألني عن شغل محمد.',
    "I can help with Mohamed's work.": 'أقدر أساعدك بمعلومات عن شغل محمد.'
};

const arabicChatCtaLabels = {
    'Browse projects': 'تصفح المشاريع',
    'Browse his work': 'تصفح أعماله',
    'View profile': 'عرض الملف الشخصي',
    'Contact for pricing': 'تواصل لمعرفة الأسعار',
    Contact: 'تواصل',
    'View portfolio': 'عرض معرض الأعمال',
    'Motion projects': 'مشاريع الموشن',
    'Perfume projects': 'مشاريع العطور',
    'Restaurant videos': 'فيديوهات المطاعم',
    'Watch videos': 'شاهد الفيديوهات',
    "Browse Mohamed's work": 'تصفح أعمال محمد',
    'Browse portfolio': 'تصفح المعرض'
};

const localizeChatPayload = (payload, question) => {
    if (!/[\u0600-\u06ff]/.test(question)) return payload;

    const localizedPayload = {
        ...payload,
        reply: arabicChatReplies[payload.reply] || 'مش معايا إجابة للسؤال ده حاليًا. جرّب تسأله بطريقة تانية.'
    };

    if (payload.cta) {
        localizedPayload.cta = {
            ...payload.cta,
            label: arabicChatCtaLabels[payload.cta.label] || 'افتح القسم'
        };
    }

    return localizedPayload;
};

if (chatToggle && chatWidget && chatForm && chatInput && chatBody) {
    const conversation = [];
    const submitButton = chatForm.querySelector('button[type="submit"]');
    const chatNudge = document.createElement('button');
    chatNudge.type = 'button';
    chatNudge.className = 'chat-nudge';
    chatNudge.textContent = 'Have a question about Mohamed?';
    chatNudge.setAttribute('aria-label', 'Open the chat and ask about Mohamed');
    chatNudge.hidden = true;
    document.body.appendChild(chatNudge);

    let userHasSpoken = false;
    let chatWasClosed = false;
    let proactiveTimer;
    const hideChatNudge = () => {
        chatNudge.hidden = true;
    };

    proactiveTimer = window.setTimeout(() => {
        if (userHasSpoken || chatWasClosed) return;
        const proactiveMessage = 'Have a question about Mohamed? Ask me about his work or projects.';
        addMessage(proactiveMessage, 'bot');
        conversation.push({ role: 'assistant', content: proactiveMessage });
        if (!chatWidget.classList.contains('open')) chatNudge.hidden = false;
    }, 60_000);

    chatNudge.addEventListener('click', () => chatToggle.click());

    chatToggle.addEventListener('click', () => {
        const isOpen = chatWidget.classList.toggle('open');
        chatToggle.setAttribute('aria-expanded', String(isOpen));
        if (isOpen) {
            hideChatNudge();
            chatInput.focus();
        } else {
            chatWasClosed = true;
            window.clearTimeout(proactiveTimer);
        }
    });

    chatClose.addEventListener('click', () => {
        chatWasClosed = true;
        hideChatNudge();
        window.clearTimeout(proactiveTimer);
        chatWidget.classList.remove('open');
        chatToggle.setAttribute('aria-expanded', 'false');
    });

    chatForm.addEventListener('submit', (event) => {
        event.preventDefault();

        const question = chatInput.value.trim();
        if (!question) return;

        userHasSpoken = true;
        hideChatNudge();
        window.clearTimeout(proactiveTimer);
        addMessage(question, 'user');
        chatInput.value = '';
        chatInput.disabled = true;
        submitButton.disabled = true;
        const isArabicQuestion = /[\u0600-\u06ff]/.test(question);
        const loadingMessage = addMessage(isArabicQuestion ? 'جاري التفكير...' : 'Thinking...', 'bot');

        conversation.push({ role: 'user', content: question });

        fetch('/api/chat', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ messages: conversation.slice(-10) })
        })
            .then(async (response) => {
                const data = await response.json();
                if (!response.ok) throw new Error(data.error || 'Chat is temporarily unavailable.');
                return data;
            })
            .then((payload) => {
                const localizedPayload = localizeChatPayload(payload, question);
                const reply = localizedPayload.reply || 'I can help with Mohamed\'s work.';
                loadingMessage.textContent = reply;
                attachCtaButton(loadingMessage, localizedPayload.cta);
                conversation.push({ role: 'assistant', content: reply });
                if (conversation.length > 10) conversation.splice(0, conversation.length - 10);
            })
            .catch((error) => {
                const fallback = localizeChatPayload(localChatReply(question), question);
                loadingMessage.textContent = fallback.reply;
                attachCtaButton(loadingMessage, fallback.cta);
                conversation.push({ role: 'assistant', content: fallback.reply });
                if (conversation.length > 10) conversation.splice(0, conversation.length - 10);
            })
            .finally(() => {
                chatInput.disabled = false;
                submitButton.disabled = false;
                chatInput.focus();
                chatBody.scrollTop = chatBody.scrollHeight;
            });
    });
}