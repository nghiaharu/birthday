class Particles {
    constructor(scene, isMobile) {
        this.scene = scene;
        this.isMobile = isMobile;
        
        this.totalImages = isMobile ? 700 : 1500;
        this.totalDust = isMobile ? 10000 : 15000;
        this.heartDustCount = isMobile ? 2000 : 3000;
        this.cakeDustCount = this.heartDustCount;

        this.dustStarts = new Float32Array(this.totalDust * 3);
        this.dustTargets = new Float32Array(this.totalDust * 3);
        this.heartPositions = new Float32Array(this.heartDustCount * 3);
        this.cakePositions = this.heartPositions;
        this.spiralPositions = new Float32Array((this.totalDust - this.heartDustCount) * 3);

        this.heartData = [];

        this.initParticles();
    }

    getInitialPositions(count, scale, zSpread) {
        const canvas = document.createElement('canvas'); canvas.width = 600; canvas.height = 300;
        const ctx = canvas.getContext('2d'); ctx.fillStyle = '#000'; ctx.fillRect(0, 0, 600, 300);
        ctx.font = 'bold 220px Arial, sans-serif';
        ctx.fillStyle = '#fff'; ctx.textAlign = 'center'; ctx.textBaseline = 'middle'; ctx.fillText('❤', 300, 165);

        const imgData = ctx.getImageData(0, 0, 600, 300).data;
        const validPositions = [];
        let minX = 600, maxX = 0, minY = 300, maxY = 0;
        for (let y = 0; y < 300; y += 3) {
            for (let x = 0; x < 600; x += 3) {
                if (imgData[(y * 600 + x) * 4] > 128) {
                    validPositions.push({ x, y });
                    if (x < minX) minX = x;
                    if (x > maxX) maxX = x;
                    if (y < minY) minY = y;
                    if (y > maxY) maxY = y;
                }
            }
        }
        
        const centerX = (minX + maxX) / 2;
        const centerY = (minY + maxY) / 2;

        const positions = [];
        for (let i = 0; i < count; i++) {
            const rPos = validPositions[Math.floor(Math.random() * validPositions.length)];
            positions.push(new THREE.Vector3(
                (rPos.x - centerX) * scale + (Math.random() - 0.5) * 2,
                -(rPos.y - centerY) * scale + (Math.random() - 0.5) * 2,
                (Math.random() - 0.5) * zSpread
            ));
        }
        return positions;
    }

    getHeartPositions(count) {
        const positions = [];
        this.heartData = [];
        for (let i = 0; i < count; i++) {
            const t = Math.random() * Math.PI * 2;
            let speed = t < Math.PI ? -(0.005 + Math.random() * 0.015) : 0.005 + Math.random() * 0.015;
            const scale = (1.3 + Math.random() * 0.9) * 2.45;
            const sX = (Math.random() - 0.5) * 6.0; const sY = (Math.random() - 0.5) * 6.0; const sZ = (Math.random() - 0.5) * 18;
            this.heartData.push({ t, speed, scale, sX, sY, sZ });
            let st = Math.sin(t); let ct = Math.cos(t);
            const x = 16 * st * st * st;
            const y = 13 * ct - 5 * (2*ct*ct-1) - 2 * (4*ct*ct*ct-3*ct) - (8*ct*ct*ct*ct-8*ct*ct+1);
            positions.push(new THREE.Vector3(x * scale + sX, y * scale + sY, sZ));
        }
        return positions;
    }

    getGalaxyPositions(count, innerRadius, outerRadius, branches, thicknessY, spinMod) {
        const positions = [];
        for(let i = 0; i < count; i++) {
            const rRatio = Math.pow(Math.random(), 1.2);
            const radius = innerRadius + rRatio * (outerRadius - innerRadius);
            const spinAngle = radius * spinMod;
            const branchAngle = ((i % branches) / branches) * Math.PI * 2;
            const scatter = (outerRadius - innerRadius) * 0.3 * Math.pow(1 - rRatio, 1.5);
            const x = Math.cos(spinAngle + branchAngle) * radius + (Math.random() - 0.5) * scatter;
            const y = (Math.random() - 0.5) * thicknessY * Math.pow(1 - rRatio, 1.5);
            const z = Math.sin(spinAngle + branchAngle) * radius + (Math.random() - 0.5) * scatter;
            positions.push(new THREE.Vector3(x, y, z));
        }
        return positions;
    }

    getRandomGalaxyPositions(count, maxRadius, thicknessY) {
        const positions = [];
        for(let i = 0; i < count; i++) {
            const r = Math.sqrt(Math.random()) * maxRadius;
            const theta = Math.random() * Math.PI * 2;
            const x = Math.cos(theta) * r;
            const z = Math.sin(theta) * r;
            const y = (Math.random() - 0.5) * thicknessY * (1 - r/maxRadius);
            positions.push(new THREE.Vector3(x, y, z));
        }
        return positions;
    }

    initParticles() {
        this.pos20Images = this.getInitialPositions(this.totalImages, 0.19, 5);
        const pos20Dust = this.getInitialPositions(this.totalDust, 0.19, 10);
        this.posTargetImages = this.getRandomGalaxyPositions(this.totalImages, 180, 45);

        const posTargetHeartDust = this.getHeartPositions(this.heartDustCount);

        const partLayer = Math.floor((this.totalDust - this.heartDustCount) / 3);
        const spiralLayer1 = this.getGalaxyPositions(partLayer, 20, 190, 5, 40, 0.12);
        const spiralLayer2 = this.getGalaxyPositions(partLayer, 40, 200, 5, 60, 0.10);
        const haloCloud = this.getGalaxyPositions(partLayer, 10, 220, 3, 100, 0.05);
        const posTargetDust = [...posTargetHeartDust, ...spiralLayer1, ...spiralLayer2, ...haloCloud];

        const heartColors = new Float32Array(this.heartDustCount * 3);
        const spiralDustCount = this.totalDust - this.heartDustCount;
        const spiralColors = new Float32Array(spiralDustCount * 3);

        for(let i = 0; i < this.totalDust; i++) {
            this.dustStarts[i*3] = pos20Dust[i].x; 
            this.dustStarts[i*3+1] = pos20Dust[i].y; 
            this.dustStarts[i*3+2] = pos20Dust[i].z;
            
            if(posTargetDust[i]) {
                this.dustTargets[i*3] = posTargetDust[i].x; 
                this.dustTargets[i*3+1] = posTargetDust[i].y; 
                this.dustTargets[i*3+2] = posTargetDust[i].z;
            } else {
                this.dustTargets[i*3] = this.dustStarts[i*3]; 
                this.dustTargets[i*3+1] = this.dustStarts[i*3+1]; 
                this.dustTargets[i*3+2] = this.dustStarts[i*3+2];
            }
            
            const c = new THREE.Color();
            if (i < this.heartDustCount) {
                this.heartPositions[i*3] = pos20Dust[i].x; 
                this.heartPositions[i*3+1] = pos20Dust[i].y; 
                this.heartPositions[i*3+2] = pos20Dust[i].z;
                c.setHSL(0.9 + Math.random() * 0.08, 1.0, 0.6 + Math.random() * 0.25);
                heartColors[i*3] = c.r; heartColors[i*3+1] = c.g; heartColors[i*3+2] = c.b;
            } else {
                c.setHSL(0.9 + Math.random() * 0.08, 0.9, 0.65 + Math.random() * 0.2);
                const si = i - this.heartDustCount;
                this.spiralPositions[si*3] = pos20Dust[i].x; 
                this.spiralPositions[si*3+1] = pos20Dust[i].y; 
                this.spiralPositions[si*3+2] = pos20Dust[i].z;
                spiralColors[si*3] = c.r; spiralColors[si*3+1] = c.g; spiralColors[si*3+2] = c.b;
            }
        }

        this.heartGeometry = new THREE.BufferGeometry(); 
        this.heartGeometry.setAttribute('position', new THREE.BufferAttribute(this.heartPositions, 3));
        this.heartGeometry.setAttribute('color', new THREE.BufferAttribute(heartColors, 3));
        this.cakeGeometry = this.heartGeometry;
        
        this.spiralGeometry = new THREE.BufferGeometry(); 
        this.spiralGeometry.setAttribute('position', new THREE.BufferAttribute(this.spiralPositions, 3)); 
        this.spiralGeometry.setAttribute('color', new THREE.BufferAttribute(spiralColors, 3));

        const canvasHa = document.createElement('canvas'); canvasHa.width = 64; canvasHa.height = 64;
        const ctxHa = canvasHa.getContext('2d'); ctxHa.font = 'bold 32px "Dancing Script", cursive'; ctxHa.fillStyle = '#ff66b2'; ctxHa.textAlign = 'center'; ctxHa.textBaseline = 'middle'; ctxHa.fillText('❤', 32, 32);
        this.heartMaterial = new THREE.PointsMaterial({ size: this.isMobile ? 14.0 : 11.2, vertexColors: true, map: new THREE.CanvasTexture(canvasHa), transparent: true, blending: THREE.AdditiveBlending, depthWrite: false, opacity: 0.9 });
        this.cakeMaterial = this.heartMaterial;

        const canvasDust = document.createElement('canvas'); canvasDust.width = 32; canvasDust.height = 32;
        const ctxDust = canvasDust.getContext('2d'); const gradDust = ctxDust.createRadialGradient(16, 16, 0, 16, 16, 16);
        gradDust.addColorStop(0, 'rgba(255,255,255,1)'); gradDust.addColorStop(0.3, 'rgba(255,150,200,0.8)'); gradDust.addColorStop(1, 'rgba(0,0,0,0)');
        ctxDust.fillStyle = gradDust; ctxDust.fillRect(0,0,32,32);

        this.dustMaterial = new THREE.PointsMaterial({ size: this.isMobile ? 4.5 : 3.2, vertexColors: true, map: new THREE.CanvasTexture(canvasDust), transparent: true, blending: THREE.AdditiveBlending, depthWrite: false, opacity: 0.9 });

        this.heartMesh = new THREE.Points(this.heartGeometry, this.heartMaterial); 
        this.cakeMesh = this.heartMesh;
        this.spiralMesh = new THREE.Points(this.spiralGeometry, this.dustMaterial);
        
        this.scene.add(this.heartMesh); 
        this.scene.add(this.spiralMesh);
    }

    spawnShootingStarPair() {
        if (!this.scene) return;
        const color = new THREE.Color(0xffb6c1);
        const angle = Math.random() * Math.PI * 2;
        const radius = 1000 + Math.random() * 500;
        const startX = Math.cos(angle) * radius; const startY = 300 + Math.random() * 400; const startZ = Math.sin(angle) * radius;
        const targetX = -Math.cos(angle) * 1000 + (Math.random() - 0.5) * 400; const targetY = -400 + (Math.random() - 0.5) * 400; const targetZ = -Math.sin(angle) * 1000 + (Math.random() - 0.5) * 400;
        
        const duration = 2.5 + Math.random() * 2.0; 
        
        const material = new THREE.MeshBasicMaterial({ color: color, transparent: true, opacity: 0, blending: THREE.AdditiveBlending, depthWrite: false });
        const geo = new THREE.CylinderGeometry(0.8, 0.0, 250 + Math.random() * 100, 6); geo.rotateX(Math.PI / 2);
        const pairOffset = new THREE.Vector3((Math.random() - 0.5) * 40, (Math.random() - 0.5) * 40, (Math.random() - 0.5) * 40);

        for(let i=0; i<2; i++) {
            const star = new THREE.Mesh(geo, material.clone());
            const curStartX = startX + pairOffset.x * i; const curStartY = startY + pairOffset.y * i; const curStartZ = startZ + pairOffset.z * i;
            const curTargetX = targetX + pairOffset.x * i; const curTargetY = targetY + pairOffset.y * i; const curTargetZ = targetZ + pairOffset.z * i;
            star.position.set(curStartX, curStartY, curStartZ); star.lookAt(new THREE.Vector3(curTargetX, curTargetY, curTargetZ));
            this.scene.add(star);
            const delay = i * (Math.random() * 0.2); 
            const currentDuration = duration + (Math.random() * 0.2 - 0.1);
            
            gsap.to(star.material, { opacity: 0.9, duration: 0.3, delay: delay, onComplete: () => { gsap.to(star.material, { opacity: 0, duration: currentDuration - 0.3, ease: "power2.out" }); } });
            gsap.to(star.position, { x: curTargetX, y: curTargetY, z: curTargetZ, duration: currentDuration, delay: delay, ease: "none", onComplete: () => { this.scene.remove(star); star.geometry.dispose(); star.material.dispose(); } });
        }
    }
}
