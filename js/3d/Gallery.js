class Gallery {
    constructor(scene) {
        this.imageGroup = new THREE.Group();
        scene.add(this.imageGroup);
        
        this.totalItems = GALAXY_CONFIG.gallery.length;
        this.textureLoader = new THREE.TextureLoader();
        this.textureLoader.setCrossOrigin('anonymous');
        
        this.galleryStarts = new Float32Array(this.totalItems * 3);
        this.galleryTargets = new Float32Array(this.totalItems * 3);
        
        this.initPlanes();
    }
    
    initPlanes() {
        const applySquareCrop = (tex, mesh) => {
            const aspect = tex.image.width / tex.image.height;
            if (aspect > 1) {
                tex.repeat.set(1 / aspect, 1);
                tex.offset.set((1 - 1 / aspect) / 2, 0);
            } else {
                tex.repeat.set(1, aspect);
                tex.offset.set(0, (1 - aspect) / 2);
            }
            mesh.material.map = tex;
            mesh.material.needsUpdate = true;
        };

        GALAXY_CONFIG.gallery.forEach((data, index) => {
            const canvas = document.createElement('canvas');
            canvas.width = 512; canvas.height = 512;
            const ctx = canvas.getContext('2d');
            ctx.fillStyle = '#0088ff';
            ctx.fillRect(0, 0, 512, 512);
            ctx.fillStyle = '#ffffff';
            ctx.font = 'bold 40px Montserrat';
            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';
            ctx.fillText('Đang tải ảnh...', 256, 256);
            const fallbackTexture = new THREE.CanvasTexture(canvas);

            const geo = new THREE.PlaneGeometry(18, 18);
            const mat = new THREE.MeshBasicMaterial({
                map: fallbackTexture,
                side: THREE.DoubleSide,
                transparent: true,
                opacity: 0,
                depthWrite: false
            });
            const mesh = new THREE.Mesh(geo, mat);

            const angle = (index / this.totalItems) * Math.PI * 2 + 0.5;
            const radius = 85 + index * 18;

            mesh.position.x = Math.cos(angle) * radius;
            mesh.position.y = 0;
            mesh.position.z = Math.sin(angle) * radius;

            mesh.userData = data;
            this.imageGroup.add(mesh);

            this.textureLoader.load(
                data.img,
                texture => { applySquareCrop(texture, mesh); },
                undefined,
                err => { console.warn("Failed to load image, maybe CORS error? Ensure the image server allows CORS or use local images.", err); }
            );
        });
    }

    createPoints(pos20Images, posTargetImages) {
        const isMobile = window.innerWidth < 768;
        const galleryGeo = new THREE.BufferGeometry();
        
        for(let i = 0; i < this.totalItems; i++) {
            this.galleryStarts[i*3] = pos20Images[i].x; 
            this.galleryStarts[i*3+1] = pos20Images[i].y; 
            this.galleryStarts[i*3+2] = pos20Images[i].z;
            
            if(posTargetImages && posTargetImages[i]) {
                this.galleryTargets[i*3] = posTargetImages[i].x; 
                this.galleryTargets[i*3+1] = posTargetImages[i].y; 
                this.galleryTargets[i*3+2] = posTargetImages[i].z;
            } else {
                this.galleryTargets[i*3] = pos20Images[i].x; 
                this.galleryTargets[i*3+1] = pos20Images[i].y; 
                this.galleryTargets[i*3+2] = pos20Images[i].z;
            }
        }
        galleryGeo.setAttribute('position', new THREE.BufferAttribute(this.galleryStarts, 3));

        const galleryCanvas = document.createElement('canvas'); galleryCanvas.width = 64; galleryCanvas.height = 64;
        const gCtx = galleryCanvas.getContext('2d');
        const gGrad = gCtx.createRadialGradient(32, 32, 0, 32, 32, 32);
        gGrad.addColorStop(0, 'rgba(255,255,255,1)'); gGrad.addColorStop(0.3, 'rgba(150,200,255,0.8)'); gGrad.addColorStop(1, 'rgba(0,0,0,0)');
        gCtx.fillStyle = gGrad; gCtx.fillRect(0,0,64,64);

        this.galleryMat = new THREE.PointsMaterial({
            size: isMobile ? 8.0 : 7.5, 
            map: new THREE.CanvasTexture(galleryCanvas), 
            transparent: true, 
            blending: THREE.AdditiveBlending, 
            depthWrite: false, 
            opacity: 0.8
        });
        
        this.galleryPoints = new THREE.Points(galleryGeo, this.galleryMat); 
        return this.galleryPoints;
    }
}
