class Interaction {
    constructor(camera, renderer, imageGroup, isGalaxyActiveRef) {
        this.camera = camera;
        this.renderer = renderer;
        this.imageGroup = imageGroup;
        this.isGalaxyActiveRef = isGalaxyActiveRef;

        this.raycaster = new THREE.Raycaster(); 
        this.mouse = new THREE.Vector2();
        
        this.pointerDownX = 0; 
        this.pointerDownY = 0; 
        this.centerClickCount = 0; 
        this.centerClickTimer = null;
        this.noteModal = document.getElementById('note-modal');
        this.modalImg = document.getElementById('modal-img');
        this.modalText = document.getElementById('modal-text');

        this.bindEvents();
    }

    bindEvents() {
        this.renderer.domElement.addEventListener('pointerdown', event => { 
            this.pointerDownX = event.clientX; 
            this.pointerDownY = event.clientY; 
        });

        this.renderer.domElement.addEventListener('pointerup', event => {
            if (!this.isGalaxyActiveRef.value) return;
            const cx = window.innerWidth / 2; const cy = window.innerHeight / 2;
            const distToCenter = Math.sqrt(Math.pow(event.clientX - cx, 2) + Math.pow(event.clientY - cy, 2));

            if (distToCenter < 60) {
                this.centerClickCount++; 
                clearTimeout(this.centerClickTimer);
                if (this.centerClickCount >= 5) { 
                    this.centerClickCount = 0; 
                    if(window.openHiddenModal) window.openHiddenModal(); 
                    return; 
                }
                else { 
                    this.centerClickTimer = setTimeout(() => { this.centerClickCount = 0; }, 3000); 
                }
            }

            if (this.noteModal.classList.contains('active') || document.getElementById('hidden-modal').classList.contains('active')) return;
            if (Math.abs(event.clientX - this.pointerDownX) + Math.abs(event.clientY - this.pointerDownY) > 15) return;

            this.mouse.x = (event.clientX / window.innerWidth) * 2 - 1; 
            this.mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;
            
            this.raycaster.setFromCamera(this.mouse, this.camera);
            const intersects = this.raycaster.intersectObjects(this.imageGroup.children);
            if (intersects.length === 0) return;

            createIconBurst();
            let selectedData = intersects[0].object.userData;
            this.modalImg.src = selectedData.img;
            this.modalText.innerText = selectedData.note; 
            this.noteModal.classList.add('active');
        });
    }
}
