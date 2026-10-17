function initUI() {
    document.title = GALAXY_CONFIG.title.browserTab;
    document.querySelector('.term-title').innerText = GALAXY_CONFIG.title.terminalHeader;
    document.querySelector('.envelope-text').innerText = GALAXY_CONFIG.title.envelopeTitle;
    document.getElementById('sender-signature').innerText = GALAXY_CONFIG.title.senderSignature;

    setupModals();
    setupBirthdayAudio();
    startBootSequence();
}

function setupModals() {
    const noteModal = document.getElementById('note-modal');
    
    window.closeModal = function () {
        noteModal.classList.remove('active');
    }

    window.openHiddenModal = function () {
        document.getElementById('hidden-modal').classList.add('active');
    }

    window.closeHiddenModal = function () {
        document.getElementById('hidden-modal').classList.remove('active');
        document.getElementById('hidden-input').value = '';
    }

    window.sendHiddenMessage=async function(){
      const input=document.getElementById('hidden-input');
      const msg=input.value.trim(); if(!msg)return;
      try{await navigator.clipboard.writeText(msg);closeHiddenModal();showToast();}
      catch(e){input.focus();input.select();try{if(document.execCommand('copy')){closeHiddenModal();showToast()}else{alert('Hãy sao chép lời nhắn thủ công nhé.')}}catch(x){alert('Hãy sao chép lời nhắn thủ công nhé.')}}
    }
}

function showToast() {
    const toast = document.getElementById('toast-notification');
    toast.classList.add('show');
    setTimeout(() => {
        toast.classList.remove('show');
    }, 3000);
}


function setupBirthdayAudio() {
 const player=document.getElementById('bg-music'), toggle=document.getElementById('music-toggle');
 if(!player||!toggle) return;
 player.volume=0.6;
 const sync=()=>{toggle.textContent=player.paused?'🔇':'🔊'};
 player.addEventListener('play',sync);player.addEventListener('pause',sync);
 toggle.addEventListener('click',()=>{if(player.paused)player.play().catch(sync);else player.pause();});
 window.startBirthdayMusic=()=>{toggle.hidden=false;player.play().catch(sync);};
}
function startBootSequence() {
    const bootWrapper = document.getElementById('boot-wrapper');
    const bootScreen = document.getElementById('boot-screen');
    const progressBar = document.getElementById('progress-bar');
    const loadingScreen = document.getElementById('loading-screen');
    const introScreen = document.getElementById('intro-screen');
    
    let lineIndex = 0;
    let charIndex = 0;
    let currentLineElement = null;

    function typeBootLine() {
        if (lineIndex >= GALAXY_CONFIG.bootLines.length) {
            progressBar.style.width = '100%';
            setTimeout(() => {
                bootWrapper.style.opacity = '0';
                setTimeout(() => {
                    bootWrapper.style.display = 'none';
                    loadingScreen.style.display = 'flex';
                    setTimeout(() => {
                        loadingScreen.style.opacity = '1';

                        window.dispatchEvent(new Event('start3DMath'));

                        setTimeout(() => {
                            loadingScreen.style.opacity = '0';
                            setTimeout(() => {
                                loadingScreen.style.display = 'none';
                                introScreen.style.opacity = '1';
                                introScreen.style.pointerEvents = 'auto';
                                createStarfieldBackground(introScreen);
                                createFallingParticles(introScreen);
                            }, 200);
                        }, 1500);
                    }, 50);
                }, 200);
            }, 500);
            return;
        }

        if (charIndex === 0) {
            currentLineElement = document.createElement('div');
            currentLineElement.className = 'boot-line';
            currentLineElement.innerHTML = '<span class="text"></span><span class="cursor"></span>';
            bootScreen.appendChild(currentLineElement);

            progressBar.style.width = Math.floor((lineIndex / GALAXY_CONFIG.bootLines.length) * 100) + '%';
        }

        if (charIndex < GALAXY_CONFIG.bootLines[lineIndex].length) {
            currentLineElement.querySelector('.text').innerHTML += GALAXY_CONFIG.bootLines[lineIndex].charAt(charIndex);
            charIndex++;
            setTimeout(typeBootLine, 10);
        } else {
            currentLineElement.querySelector('.cursor').remove();
            lineIndex++;
            charIndex = 0;
            setTimeout(typeBootLine, 50);
        }
    }

    setTimeout(typeBootLine, 10);
}

function createFallingParticles(introScreen) {
    const isMobile = window.innerWidth < 768;
    const icons = ['❤', '✨', '💖', '⭐', '🌸', '🎂', '🌹', '🍰', '🎁'];
    const count = isMobile ? 20 : 40;
    for (let i = 0; i < count; i++) {
        const particle = document.createElement('div');
        particle.className = 'falling-particle';
        particle.innerText = icons[Math.floor(Math.random() * icons.length)];
        particle.style.left = Math.random() * 100 + 'vw';
        particle.style.animationDelay = Math.random() * 5 + 's';
        particle.style.animationDuration = 3 + Math.random() * 4 + 's';

        particle.addEventListener('mousedown', () => particle.style.animationPlayState = 'paused');
        particle.addEventListener('mouseup', () => particle.style.animationPlayState = 'running');
        particle.addEventListener('mouseleave', () => particle.style.animationPlayState = 'running');

        particle.addEventListener('touchstart', () => {
            particle.style.animationPlayState = 'paused';
        }, { passive: true });
        particle.addEventListener('touchend', () => particle.style.animationPlayState = 'running');

        introScreen.appendChild(particle);
    }
}

function createIconBurst() {
    const isMobile = window.innerWidth < 768;
    const icons = ['❤', '✨', '💖', '⭐', '🌸', '🎂', '🎁'];
    const count = isMobile ? 12 : 20;
    if (typeof gsap === 'undefined') return;
    for (let i = 0; i < count; i++) {
        const burst = document.createElement('div');
        burst.innerText = icons[Math.floor(Math.random() * icons.length)];
        burst.style.position = 'absolute';
        burst.style.left = '50%';
        burst.style.top = '50%';
        burst.style.fontSize = (Math.random() * 20 + 20) + 'px';
        burst.style.color = '#ff66b2';
        burst.style.zIndex = '999';
        burst.style.pointerEvents = 'none';
        burst.style.transform = 'translate(-50%, -50%) scale(1)';
        burst.style.willChange = 'transform, opacity';
        document.body.appendChild(burst);

        const angle = Math.random() * Math.PI * 2;
        const dist = Math.random() * (isMobile ? 120 : 200) + 80;
        gsap.to(burst, {
            x: Math.cos(angle) * dist,
            y: Math.sin(angle) * dist,
            opacity: 0,
            scale: Math.random() * 1.5 + 0.5,
            duration: 1.2,
            ease: "power2.out",
            force3D: true,
            onComplete: () => burst.remove()
        });
    }
}

function handleEnvelopeClick(callback) {
    document.getElementById('envelope-btn').addEventListener('click', () => {
        if(window.startBirthdayMusic)window.startBirthdayMusic();
        const introScreen = document.getElementById('intro-screen');
        const canvasContainer = document.getElementById('canvas-container');
        introScreen.style.opacity = '0'; 
        canvasContainer.style.opacity = '1';
        setTimeout(() => { 
            introScreen.style.display = 'none'; 
            callback();
        }, 500);
    });
}

function createStarfieldBackground(introScreen) {
    const canvas = document.createElement('canvas');
    canvas.id = 'starfield-canvas';
    canvas.style.position = 'absolute';
    canvas.style.top = '0';
    canvas.style.left = '0';
    canvas.style.width = '100%';
    canvas.style.height = '100%';
    canvas.style.zIndex = '1';
    canvas.style.pointerEvents = 'none';
    introScreen.appendChild(canvas);

    const ctx = canvas.getContext('2d');
    let width = canvas.width = window.innerWidth;
    let height = canvas.height = window.innerHeight;

    const starCount = window.innerWidth < 768 ? 1000 : 2500;
    const stars = [];

    for (let i = 0; i < starCount; i++) {
        stars.push({
            x: Math.random() * width,
            y: Math.random() * height,
            size: Math.random() * 1.5 + 0.3,
            baseAlpha: Math.random() * 0.4 + 0.15,
            alpha: Math.random() * 0.4 + 0.15,
            twinkleSpeed: Math.random() * 0.015 + 0.005,
            twinkleDir: Math.random() < 0.5 ? 1 : -1,
            color: Math.random() < 0.35 ? '#ffb3da' : (Math.random() < 0.3 ? '#ff99c2' : '#ffffff')
        });
    }

    function render() {
        if (introScreen.style.display === 'none') return;
        ctx.clearRect(0, 0, width, height);
        for (let i = 0; i < starCount; i++) {
            const s = stars[i];
            s.alpha += s.twinkleSpeed * s.twinkleDir;
            if (s.alpha >= s.baseAlpha + 0.25 || s.alpha >= 0.75) {
                s.twinkleDir = -1;
            } else if (s.alpha <= s.baseAlpha - 0.15 || s.alpha <= 0.05) {
                s.twinkleDir = 1;
            }

            ctx.globalAlpha = Math.max(0.05, Math.min(0.8, s.alpha));
            ctx.fillStyle = s.color;
            ctx.beginPath();
            ctx.arc(s.x, s.y, s.size, 0, Math.PI * 2);
            ctx.fill();
        }
        requestAnimationFrame(render);
    }
    render();

    window.addEventListener('resize', () => {
        width = canvas.width = window.innerWidth;
        height = canvas.height = window.innerHeight;
    });
}

