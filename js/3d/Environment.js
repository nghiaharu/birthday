class Environment {
    constructor(canvasContainer) {
        this.isMobile = window.innerWidth < 768;
        this.scene = new THREE.Scene();
        this.scene.fog = new THREE.FogExp2(0x0a0005, 0.001);

        this.camera = new THREE.PerspectiveCamera(60, window.innerWidth / window.innerHeight, 0.1, 4000);
        this.camera.position.set(0, 0, 110);

        this.renderer = new THREE.WebGLRenderer({ antialias: false, powerPreference: "high-performance" });
        this.renderer.setSize(window.innerWidth, window.innerHeight);
        this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, this.isMobile ? 2 : 1.5));
        this.renderer.toneMapping = THREE.ReinhardToneMapping;
        canvasContainer.appendChild(this.renderer.domElement);

        this.renderScene = new THREE.RenderPass(this.scene, this.camera);
        this.bloomPass = new THREE.UnrealBloomPass(new THREE.Vector2(window.innerWidth, window.innerHeight), 1.5, 0.4, 0.85);
        this.bloomPass.threshold = 0.25;
        this.bloomPass.strength = 0.25;
        this.bloomPass.radius = 0.6;

        this.composer = new THREE.EffectComposer(this.renderer);
        this.composer.addPass(this.renderScene);
        this.composer.addPass(this.bloomPass);

        this.controls = new THREE.OrbitControls(this.camera, this.renderer.domElement);
        this.controls.enableDamping = true;
        this.controls.dampingFactor = 0.05;
        this.controls.autoRotate = true;
        this.controls.autoRotateSpeed = 0.8;
        this.controls.enablePan = false;

        this.createLights();
        this.createCoreAura();
        this.createBackgroundStars();

        window.addEventListener('resize', this.onWindowResize.bind(this));
    }

    createLights() {
        const ambientLight = new THREE.AmbientLight(0xffffff, 0.9);
        this.scene.add(ambientLight);
        const dirLight = new THREE.DirectionalLight(0xffe6f2, 1.2);
        dirLight.position.set(50, 80, 50);
        this.scene.add(dirLight);
    }

    createCoreAura() {
        const auraCanvas = document.createElement('canvas');
        auraCanvas.width = 512; auraCanvas.height = 512;
        const auraCtx = auraCanvas.getContext('2d');
        const auraGrad = auraCtx.createRadialGradient(256, 256, 0, 256, 256, 256);
        auraGrad.addColorStop(0, 'rgba(255, 105, 180, 0.6)');
        auraGrad.addColorStop(0.5, 'rgba(255, 182, 193, 0.2)');
        auraGrad.addColorStop(1, 'rgba(0, 0, 0, 0)');
        auraCtx.fillStyle = auraGrad;
        auraCtx.fillRect(0, 0, 512, 512);

        const auraMat = new THREE.SpriteMaterial({
            map: new THREE.CanvasTexture(auraCanvas),
            transparent: true,
            blending: THREE.AdditiveBlending,
            depthWrite: false,
            opacity: 0
        });
        this.coreAura = new THREE.Sprite(auraMat);
        this.coreAura.scale.set(130, 130, 1);
        this.scene.add(this.coreAura);
    }

    createBackgroundStars() {
        const createStarfield = (count, size, spreadOuter, spreadInner) => {
            const starGeo = new THREE.BufferGeometry();
            const positions = []; const colors = [];
            for(let i = 0; i < count; i++) {
                let x = (Math.random() - 0.5) * spreadOuter;
                let y = (Math.random() - 0.5) * spreadOuter;
                let z = (Math.random() - 0.5) * spreadOuter;

                if (Math.abs(x) < spreadInner && Math.abs(y) < spreadInner && Math.abs(z) < spreadInner) {
                    x += spreadInner * Math.sign(x);
                    y += spreadInner * Math.sign(y);
                    z += spreadInner * Math.sign(z);
                }
                positions.push(x, y, z);
                const color = new THREE.Color();
                color.setHSL(Math.random() * 0.15 + 0.85, 0.9, Math.random() * 0.5 + 0.4);
                colors.push(color.r, color.g, color.b);
            }
            starGeo.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3));
            starGeo.setAttribute('color', new THREE.Float32BufferAttribute(colors, 3));
            const starMat = new THREE.PointsMaterial({ size: size, vertexColors: true, transparent: true, opacity: 0.9, fog: false });
            return new THREE.Points(starGeo, starMat);
        }

        this.bgStars1 = createStarfield(this.isMobile ? 3500 : 12000, 1.2, 3500, 400);
        this.bgStars2 = createStarfield(this.isMobile ? 1500 : 6000, 2.5, 4500, 400);
        this.bgStars3 = createStarfield(this.isMobile ? 2000 : 8000, 1.8, 5000, 400);
        
        this.scene.add(this.bgStars1); 
        this.scene.add(this.bgStars2); 
        this.scene.add(this.bgStars3);
    }

    onWindowResize() {
        this.camera.aspect = window.innerWidth / window.innerHeight; 
        this.camera.updateProjectionMatrix();
        this.renderer.setSize(window.innerWidth, window.innerHeight); 
        this.composer.setSize(window.innerWidth, window.innerHeight);
    }
}
