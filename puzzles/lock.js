import * as THREE from 'three';

export class DoorLockPuzzle {
    constructor(scene, camera, renderer, doorMesh, keypadMesh, options = {}) {
        this.scene = scene;
        this.camera = camera;
        this.renderer = renderer;
        this.door = doorMesh;
        this.keypad = keypadMesh;

        this.raycaster = new THREE.Raycaster();
        this.mouse = new THREE.Vector2();

        this.secretCode = options.code || '4271';
        this.inputCode = '';
        this.solved = false;
        this.opening = false;
        this.openProgress = 0;

        this.onUnlocked = options.onUnlocked || (() => {});

        this.createUI();
        this.setupEvents();
    }

    createUI() {
        const panel = document.createElement('div');
        panel.style.position = 'fixed';
        panel.style.right = '30px';
        panel.style.top = '50%';
        panel.style.transform = 'translateY(-50%)';
        panel.style.padding = '14px';
        panel.style.background = 'rgba(5, 5, 8, 0.96)';
        panel.style.border = '2px solid #777';
        panel.style.borderRadius = '8px';
        panel.style.color = '#f2f2f2';
        panel.style.fontFamily = 'monospace';
        panel.style.display = 'none';
        panel.style.zIndex = '3000';
        panel.style.boxShadow = '0 0 20px rgba(0,0,0,0.8)';

        const title = document.createElement('div');
        title.textContent = 'NUMERIC LOCK';
        title.style.fontSize = '14px';
        title.style.marginBottom = '6px';
        panel.appendChild(title);

        const codeDiv = document.createElement('div');
        codeDiv.style.fontSize = '22px';
        codeDiv.style.marginBottom = '10px';
        codeDiv.style.letterSpacing = '4px';
        codeDiv.textContent = '----';
        panel.appendChild(codeDiv);
        this.codeDiv = codeDiv;

        const grid = document.createElement('div');
        grid.style.display = 'grid';
        grid.style.gridTemplateColumns = 'repeat(3, 40px)';
        grid.style.gap = '6px';
        grid.style.marginBottom = '8px';

        const addButton = (label, onClick) => {
            const b = document.createElement('button');
            b.textContent = label;
            b.style.width = '40px';
            b.style.height = '40px';
            b.style.background = '#222';
            b.style.color = '#eee';
            b.style.border = '1px solid #666';
            b.style.cursor = 'pointer';
            b.onclick = onClick;
            grid.appendChild(b);
        };

        for (let i = 1; i <= 9; i++) {
            addButton(String(i), () => this.pressDigit(String(i)));
        }
        addButton('C', () => this.clearCode());
        addButton('0', () => this.pressDigit('0'));
        addButton('OK', () => this.validateCode());

        panel.appendChild(grid);

        const close = document.createElement('button');
        close.textContent = 'Fermer';
        close.style.width = '100%';
        close.style.background = '#333';
        close.style.color = '#eee';
        close.style.border = '1px solid #666';
        close.style.cursor = 'pointer';
        close.onclick = () => this.hideUI();
        panel.appendChild(close);

        document.body.appendChild(panel);
        this.panel = panel;
    }

    showUI() {
        if (this.solved) return;
        this.panel.style.display = 'block';
        this.updateDisplay();
    }

    hideUI() {
        this.panel.style.display = 'none';
    }

    updateDisplay() {
        if (!this.inputCode.length) this.codeDiv.textContent = '----';
        else this.codeDiv.textContent = this.inputCode.padEnd(4, '_');
    }

    pressDigit(d) {
        if (this.inputCode.length >= 4) return;
        this.inputCode += d;
        this.updateDisplay();
    }

    clearCode() {
        this.inputCode = '';
        this.updateDisplay();
    }

    validateCode() {
        if (this.inputCode === this.secretCode) {
            this.solved = true;
            this.hideUI();
            this.opening = true;
            this.openProgress = 0;
            console.log('🔓 Door unlocked!');
            this.onUnlocked();
        } else {
            this.codeDiv.textContent = 'ERR';
            setTimeout(() => this.updateDisplay(), 600);
            this.inputCode = '';
        }
    }

    // ---------- Interaction : clic sur le keypad ----------

    setupEvents() {
        this.onClick = this.handleClick.bind(this);
        this.renderer.domElement.addEventListener('click', this.onClick);
    }

    screenToNDC(event) {
        const rect = this.renderer.domElement.getBoundingClientRect();
        this.mouse.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
        this.mouse.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;
    }

    handleClick(event) {
        if (this.solved) return;

        this.screenToNDC(event);
        this.raycaster.setFromCamera(this.mouse, this.camera);

        const hits = this.raycaster.intersectObject(this.keypad, false);
        if (hits.length > 0) {
            this.showUI();
        }
    }

    // ---------- Animation ouverture porte ----------

    update(delta) {
        if (this.opening && this.openProgress < 1) {
            this.openProgress = Math.min(1, this.openProgress + delta * 0.7);
            const t = this.openProgress;

            // la porte pivote autour de son bord gauche (adapter si besoin)
            const angle = -Math.PI / 2 * t;
            this.door.rotation.y = angle;
        }
    }

    cleanup() {
        this.renderer.domElement.removeEventListener('click', this.onClick);
        this.hideUI();
    }
}
