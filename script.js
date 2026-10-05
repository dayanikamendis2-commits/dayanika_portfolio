let soundEnabled = true;

function playPageFlipSound() {
    if (!soundEnabled) return;
    try {
        const audioCtx = new (window.AudioContext || window.webkitAudioContext)();
        const oscillator = audioCtx.createOscillator();
        const gainNode = audioCtx.createGain();
        oscillator.type = 'triangle';
        oscillator.frequency.setValueAtTime(120, audioCtx.currentTime);
        oscillator.frequency.exponentialRampToValueAtTime(40, audioCtx.currentTime + 0.15);
        gainNode.gain.setValueAtTime(0.3, audioCtx.currentTime);
        gainNode.gain.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + 0.15);
        oscillator.connect(gainNode);
        gainNode.connect(audioCtx.destination);
        oscillator.start();
        oscillator.stop(audioCtx.currentTime + 0.15);
    } catch(e) {}
}

function toggleSound() {
    soundEnabled = !soundEnabled;
    const icon = document.getElementById('soundIcon');
    const text = document.getElementById('soundText');
    if (soundEnabled) {
        icon.className = "fa-solid fa-volume-high";
        text.textContent = "Sound: ON";
    } else {
        icon.className = "fa-solid fa-volume-xmark";
        text.textContent = "Sound: OFF";
    }
}

function toggleTheme() {
    document.body.classList.toggle('light-theme');
    const icon = document.getElementById('themeIcon');
    if (document.body.classList.contains('light-theme')) {
        icon.className = "fa-solid fa-moon";
    } else {
        icon.className = "fa-solid fa-sun";
    }
}

let pageFlip;

document.addEventListener('DOMContentLoaded', () => {
    const bookElem = document.getElementById('book');
    
    if (bookElem && typeof St !== 'undefined') {
        // Screen size eka balala mobile & desktop width/height adjust kirima
        let bookWidth = window.innerWidth < 768 ? 320 : 480;
        let bookHeight = window.innerWidth < 768 ? 450 : 620;

        pageFlip = new St.PageFlip(bookElem, {
            width: bookWidth,
            height: bookHeight,
            size: "stretch",
            minWidth: 280,
            maxWidth: 900,
            minHeight: 350,
            maxHeight: 1100,
            maxShadowOpacity: 0.5,
            showCover: true,
            mobileScrollSupport: true // Mobile touch scrolling support eka active kirima
        });
        
        pageFlip.loadFromHTML(document.querySelectorAll('.page'));
        
        const prevBtn = document.getElementById('prevBtn');
        const nextBtn = document.getElementById('nextBtn');
        const pageInfo = document.getElementById('pageInfo');
        
        if (prevBtn) {
            prevBtn.addEventListener('click', () => {
                pageFlip.flipPrev();
            });
        }
        
        if (nextBtn) {
            nextBtn.addEventListener('click', () => {
                pageFlip.flipNext();
            });
        }
        
        pageFlip.on('flip', (e) => {
            if (pageInfo) {
                pageInfo.textContent = `Page ${e.data + 1} of ${pageFlip.getPageCount()}`;
            }
            playPageFlipSound();
        });
    }

    // --- CERTIFICATE CARDS CLICK FIX ---
    document.querySelectorAll('.cert-card').forEach(card => {
        card.addEventListener('click', (e) => {
            e.preventDefault();
            e.stopPropagation();
            e.stopImmediatePropagation();
            const title = card.getAttribute('data-title');
            const issuer = card.getAttribute('data-issuer');
            const desc = card.getAttribute('data-desc');
            const img = card.getAttribute('data-img');
            openCertModal(title, issuer, desc, img);
            return false;
        }, true);
    });

    // --- PROJECT CARDS CLICK FIX ---
    document.querySelectorAll('.project-card').forEach(card => {
        card.addEventListener('click', (e) => {
            e.preventDefault();
            e.stopPropagation();
            e.stopImmediatePropagation();
            const title = card.getAttribute('data-title');
            const tech = card.getAttribute('data-tech');
            const desc = card.getAttribute('data-desc');
            const extra = card.getAttribute('data-extra');
            const images = JSON.parse(card.getAttribute('data-images') || '[]');
            openProjectModal(title, tech, desc, extra, images);
            return false;
        }, true);
    });
});

function goToPage(pageNum) {
    if (pageFlip) {
        pageFlip.flip(pageNum - 1);
    }
}

function openProjectModal(title, tech, desc, extra, images) {
    const titleElem = document.getElementById('modalProjTitle');
    const techElem = document.getElementById('modalProjTech');
    const descElem = document.getElementById('modalProjDesc');
    const galleryElem = document.getElementById('modalProjGallery');
    const modalElem = document.getElementById('projectModal');
    
    if (titleElem) titleElem.textContent = title;
    if (techElem) techElem.textContent = "Technologies: " + tech;
    if (descElem) descElem.textContent = desc + " " + extra;
    
    if (galleryElem) {
        galleryElem.innerHTML = "";
        images.forEach(imgSrc => {
            const imgTag = document.createElement('img');
            imgTag.src = imgSrc;
            imgTag.alt = title + " Screenshot";
            imgTag.className = "w-full h-32 object-cover rounded border border-ink/10 shadow";
            galleryElem.appendChild(imgTag);
        });
    }
    
    if (modalElem) modalElem.style.display = 'flex';
}

function closeProjectModal() {
    const modalElem = document.getElementById('projectModal');
    if (modalElem) modalElem.style.display = 'none';
}

function openCvModal() {
    const modalElem = document.getElementById('cvModal');
    if (modalElem) modalElem.style.display = 'flex';
}

function closeCvModal() {
    const modalElem = document.getElementById('cvModal');
    if (modalElem) modalElem.style.display = 'none';
}

function openCertModal(title, issuer, desc, imgPath) {
    const titleElem = document.getElementById('certModalTitle');
    const issuerElem = document.getElementById('certModalIssuer');
    const descElem = document.getElementById('certModalDesc');
    const imgElem = document.getElementById('certModalImg');
    const modalElem = document.getElementById('certModal');
    
    if (titleElem) titleElem.textContent = title;
    if (issuerElem) issuerElem.textContent = issuer;
    if (descElem) descElem.textContent = desc;
    if (imgElem) imgElem.src = imgPath;
    if (modalElem) modalElem.style.display = 'flex';
}

function closeCertModal() {
    const modalElem = document.getElementById('certModal');
    if (modalElem) modalElem.style.display = 'none';
}