let env, gallery, particles, interaction;
let isGalaxyActive = { value: false };
let isLightOn = false;
let galaxyTransition = { progress: 0 };
let clock;

window.addEventListener('start3DMath', () => {
    const checkLibs = setInterval(() => {
        if (typeof THREE !== 'undefined' && typeof gsap !== 'undefined') {
            clearInterval(checkLibs);
            build3DScene();
        }
    }, 100);
});

function build3DScene() {
    Promise.race([
        document.fonts.ready,
        new Promise(resolve => setTimeout(resolve, 800))
    ]).then(() => {
        const canvasContainer = document.getElementById('canvas-container');
        
        env = new Environment(canvasContainer);
        gallery = new Gallery(env.scene);
        particles = new Particles(env.scene, env.isMobile);
        
        interaction = new Interaction(env.camera, env.renderer, gallery.imageGroup, isGalaxyActive);

        gallery.createPoints(particles.pos20Images, particles.posTargetImages);
        
        clock = new THREE.Clock();

        setInterval(() => particles.spawnShootingStarPair(), 2000);

        animate();
    });
}

function explodeToGalaxy() {
    isGalaxyActive.value = true;
    const textElement = document.getElementById('birthday-text');
    textElement.style.transform = 'translate(-50%, 50px)'; 
    textElement.style.opacity = '0';
    
    gsap.to(env.bloomPass, { strength: 0.1, duration: 1.5, ease: "power2.out" });
    gsap.to(particles.dustMaterial, { opacity: 0.15, duration: 1.5, ease: "power2.out" });
    gsap.to(particles.heartMaterial, { opacity: 0.15, duration: 1.5, ease: "power2.out" });
    gsap.to(env.coreAura.material, { opacity: 0.05, duration: 1.5 });
    gsap.to(gallery.galleryMat, { opacity: 0.15, duration: 1.5, ease: "power2.out" });
    gsap.to(galaxyTransition, { progress: 1, duration: 4.0, ease: "power3.inOut" });

    const targetZ = env.isMobile ? 420 : 300;
    gsap.to(env.camera.position, { x: 0, y: 160, z: targetZ, duration: 4.5, ease: "power2.inOut" });
    gsap.to(env.bloomPass, { strength: 0.5, duration: 2.0, delay: 3.5, ease: "power2.inOut", onComplete: () => { isLightOn = true; } });
    gsap.to(env.coreAura.material, { opacity: 0.4, duration: 2.0, delay: 3.5 });
    gsap.to(particles.dustMaterial, { opacity: 0.6, duration: 2.0, delay: 3.5, ease: "power2.inOut" });
    gsap.to(particles.heartMaterial, { opacity: 0.6, duration: 2.0, delay: 3.5, ease: "power2.inOut" });
    gsap.to(document.getElementById('sender-signature'), { opacity: 1, duration: 2.0, delay: 3.5 });
}

function typeWriter() {
    const textElement = document.getElementById('birthday-text');
    let textIndex = 0;
    
    function type() {
        if (textIndex < GALAXY_CONFIG.loiNhan.length) {
            textElement.innerHTML += GALAXY_CONFIG.loiNhan.charAt(textIndex); 
            textIndex++; 
            setTimeout(type, GALAXY_CONFIG.tocDoGoChu);
        } else { 
            setTimeout(explodeToGalaxy, GALAXY_CONFIG.thoiGianChoDungHinh); 
        }
    }
    type();
}

function animate() {
    requestAnimationFrame(animate);
    env.controls.update();

    const time = clock.getElapsedTime();

    const galaxyRot = time * -0.035;
    gallery.imageGroup.rotation.y = galaxyRot;
    gallery.galleryPoints.rotation.y = galaxyRot;
    particles.heartMesh.rotation.y = galaxyRot;
    particles.spiralMesh.rotation.y = galaxyRot;

    gallery.imageGroup.children.forEach(child => {
        child.lookAt(env.camera.position);
        if (isLightOn && child.material.opacity < 1) { child.material.opacity += 0.01; }
    });

    if (isGalaxyActive.value) {
        const p = galaxyTransition.progress; 
        const galPos = gallery.galleryPoints.geometry.attributes.position.array;
        
        for(let i = 0; i < gallery.totalItems; i++) {
            galPos[i*3] = gallery.galleryStarts[i*3] + (gallery.galleryTargets[i*3] - gallery.galleryStarts[i*3]) * p;
            galPos[i*3+1] = gallery.galleryStarts[i*3+1] + (gallery.galleryTargets[i*3+1] - gallery.galleryStarts[i*3+1]) * p;
            galPos[i*3+2] = gallery.galleryStarts[i*3+2] + (gallery.galleryTargets[i*3+2] - gallery.galleryStarts[i*3+2]) * p;
        }

        for(let i = 0; i < particles.heartDustCount; i++) {
            let data = particles.heartData[i]; data.t += data.speed;
            if (data.speed < 0 && data.t <= 0) data.t = Math.PI;
            if (data.speed > 0 && data.t >= Math.PI * 2) data.t = Math.PI;
            let st = Math.sin(data.t); let ct = Math.cos(data.t);
            let ct2 = 2 * ct * ct - 1; let ct3 = 4 * ct * ct * ct - 3 * ct; let ct4 = 8 * ct * ct * ct * ct - 8 * ct * ct + 1;
            const x = 16 * st * st * st; const y = 13 * ct - 5 * ct2 - 2 * ct3 - ct4;
            particles.dustTargets[i*3] = x * data.scale + data.sX; particles.dustTargets[i*3+1] = y * data.scale + data.sY;
        }
        
        for(let i = 0; i < particles.totalDust; i++) {
            if (p < 1 || i < particles.heartDustCount) {
                const x = particles.dustStarts[i*3] + (particles.dustTargets[i*3] - particles.dustStarts[i*3]) * p;
                const y = particles.dustStarts[i*3+1] + (particles.dustTargets[i*3+1] - particles.dustStarts[i*3+1]) * p;
                const z = particles.dustStarts[i*3+2] + (particles.dustTargets[i*3+2] - particles.dustStarts[i*3+2]) * p;
                if (i < particles.heartDustCount) { 
                    particles.heartPositions[i*3] = x; 
                    particles.heartPositions[i*3+1] = y; 
                    particles.heartPositions[i*3+2] = z; 
                }
                else if (p < 1) { 
                    const si = i - particles.heartDustCount; 
                    particles.spiralPositions[si*3] = x; 
                    particles.spiralPositions[si*3+1] = y; 
                    particles.spiralPositions[si*3+2] = z; 
                }
            }
        }
        
        if (isLightOn) {
            const beat = Math.pow(Math.sin(time * 3.5), 16) * Math.abs(Math.sin(time * 0.5));
            const pulseScale = 1.0 + beat * 0.15 + Math.sin(time * 1.5) * 0.05;
            for(let i = 0; i < particles.heartDustCount; i++) { 
                particles.heartPositions[i*3] *= pulseScale; 
                particles.heartPositions[i*3+1] *= pulseScale; 
                particles.heartPositions[i*3+2] *= pulseScale; 
            }
            gallery.galleryMat.size = (env.isMobile ? 8.0 : 7.5) * (1.0 + beat * 0.08);
            gallery.galleryMat.opacity = 0.6 + beat * 0.2;
        }
        
        particles.heartGeometry.attributes.position.needsUpdate = true; 
        gallery.galleryPoints.geometry.attributes.position.needsUpdate = true;
        
        if (p < 1) particles.spiralGeometry.attributes.position.needsUpdate = true;
    }

    if (isLightOn) {
        const beat = Math.pow(Math.sin(time * 3.5), 16) * Math.abs(Math.sin(time * 0.5));
        env.bloomPass.strength = 0.4 + beat * 0.3; 
        env.coreAura.scale.setScalar(130 + beat * 20); 
        env.coreAura.material.opacity = 0.3 + beat * 0.2;
        particles.dustMaterial.opacity = 0.5 + beat * 0.3; 
        particles.heartMaterial.opacity = 0.5 + beat * 0.3;
    }

    env.bgStars1.rotation.y = time * 0.008; 
    env.bgStars2.rotation.y = time * 0.004; 
    env.bgStars3.rotation.y = time * 0.006;
    env.bgStars1.rotation.x = time * 0.002; 
    env.bgStars3.rotation.x = time * 0.003;

    env.composer.render();
}

initUI();
handleEnvelopeClick(() => typeWriter());
