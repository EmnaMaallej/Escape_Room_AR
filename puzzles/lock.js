import * as THREE from 'three';

export class DoorLockPuzzle {
    constructor(scene, camera, renderer, doorMesh, keypadPosition, options = {}) {
        this.scene = scene;
        this.camera = camera;
        this.renderer = renderer;
        this.door = doorMesh;

        this.raycaster = new THREE.Raycaster();
        this.mouse = new THREE.Vector2();

        this.secretCode = options.code || '4619';
        this.inputCode = '';
        this.solved = false;
        this.opening = false;
        this.openProgress = 0;

        this.onUnlocked = options.onUnlocked || (() => { });

        // Create interactive 3D pin pad
        this.keypadGroup = new THREE.Group();
        this.buttons = {};
        this.screen = null;
        this.screenCanvas = null;
        this.screenContext = null;
        this.screenTexture = null;

        // Position from options or default
        const pos = keypadPosition || { x: 2.8, y: 2, z: -5.85 };
        this.keypadGroup.position.set(pos.x, pos.y, pos.z);
        this.keypadGroup.rotation.y = 0;

        this.buildKeypad();
        this.scene.add(this.keypadGroup);

        this.setupEvents();

        console.log('✅ Interactive 3D Pin Pad created');
        console.log('   Code:', this.secretCode);
        console.log('   Click buttons directly on the wall');
    }

    buildKeypad() {
        // Materials
        const frameMat = new THREE.MeshStandardMaterial({
            color: 0x1a1a1a,
            metalness: 0.3,
            roughness: 0.7
        });

        const buttonMat = new THREE.MeshStandardMaterial({
            color: 0x2a2a2a,
            metalness: 0.2,
            roughness: 0.6
        });

        const buttonLabelMat = new THREE.MeshBasicMaterial({
            color: 0xffffff
        });

        // === FRAME ===
        const frame = new THREE.Mesh(
            new THREE.BoxGeometry(0.4, 0.6, 0.05),
            frameMat
        );
        frame.castShadow = true;
        this.keypadGroup.add(frame);

        // === SCREEN ===
        this.createScreen();

        // === BUTTONS ===
        // Layout: 3x4 grid
        // 1 2 3
        // 4 5 6
        // 7 8 9
        // * 0 #

        const buttonSize = 0.08;  // Smaller buttons
        const gap = 0.11;         // Less space between
        const startX = -gap;
        const startY = 0.08;      // Adjust vertical position

        const layout = [
            [1, 2, 3],
            [4, 5, 6],
            [7, 8, 9],
            ['*', 0, '#']
        ];

        layout.forEach((row, rowIndex) => {
            row.forEach((num, colIndex) => {
                if (num === '*' || num === '#') {
                    // Create star and hash buttons (non-functional)
                    const btn = new THREE.Mesh(
                        new THREE.BoxGeometry(buttonSize, buttonSize, 0.02),
                        buttonMat
                    );
                    const x = startX + colIndex * gap;
                    const y = startY - rowIndex * gap;
                    btn.position.set(x, y, 0.03);
                    btn.castShadow = true;
                    this.keypadGroup.add(btn);

                    // Add label
                    this.addButtonLabel(num.toString(), x, y, 0.04);
                } else {
                    // Create number button
                    const btn = new THREE.Mesh(
                        new THREE.BoxGeometry(buttonSize, buttonSize, 0.02),
                        buttonMat.clone()
                    );
                    const x = startX + colIndex * gap;
                    const y = startY - rowIndex * gap;
                    btn.position.set(x, y, 0.03);
                    btn.castShadow = true;
                    btn.userData.number = num;
                    this.keypadGroup.add(btn);
                    this.buttons[num] = btn;

                    // Add label
                    this.addButtonLabel(num.toString(), x, y, 0.04);
                }
            });
        });

        console.log('✅ Pin pad built with', Object.keys(this.buttons).length, 'buttons');
    }

    addButtonLabel(text, x, y, z) {
        // Create canvas for number
        const canvas = document.createElement('canvas');
        canvas.width = 128;
        canvas.height = 128;
        const ctx = canvas.getContext('2d');

        ctx.fillStyle = '#ffffff';
        ctx.font = 'bold 80px Arial';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(text, 64, 64);

        const texture = new THREE.CanvasTexture(canvas);
        const label = new THREE.Mesh(
            new THREE.PlaneGeometry(0.06, 0.06),  // Smaller labels
            new THREE.MeshBasicMaterial({
                map: texture,
                transparent: true
            })
        );
        label.position.set(x, y, z);
        this.keypadGroup.add(label);
    }

    createScreen() {
        // Create canvas for screen
        const canvas = document.createElement('canvas');
        canvas.width = 512;
        canvas.height = 128;
        const ctx = canvas.getContext('2d');

        this.screenCanvas = canvas;
        this.screenContext = ctx;

        // Draw initial screen
        this.updateScreenDisplay();

        // Create texture
        const texture = new THREE.CanvasTexture(canvas);
        this.screenTexture = texture;

        // Screen mesh
        const screen = new THREE.Mesh(
            new THREE.PlaneGeometry(0.35, 0.12),  // Smaller screen
            new THREE.MeshBasicMaterial({
                map: texture,
                emissive: 0x00ff00,
                emissiveIntensity: 0.8
            })
        );
        screen.position.set(0, 0.24, 0.026);  // Adjusted position
        this.keypadGroup.add(screen);
        this.screen = screen;

        console.log('✅ Screen created');
    }

    updateScreenDisplay() {
        const ctx = this.screenContext;
        const canvas = this.screenCanvas;

        // Black background
        ctx.fillStyle = '#000000';
        ctx.fillRect(0, 0, canvas.width, canvas.height);

        // Green text
        ctx.fillStyle = '#00ff00';
        ctx.font = 'bold 35px monospace';
        ctx.textAlign = 'center';
        ctx.fillText('ENTER', canvas.width / 2, 40);
        ctx.fillText('CODE', canvas.width / 2, 80);

        // If digits entered, show them below
        if (this.inputCode.length > 0) {
            ctx.font = 'bold 40px monospace';
            const display = this.inputCode.padEnd(4, '_');
            ctx.fillText(display, canvas.width / 2, 120);
        }

        // Update texture
        if (this.screenTexture) {
            this.screenTexture.needsUpdate = true;
        }
    }

    showErrorScreen() {
        const ctx = this.screenContext;
        const canvas = this.screenCanvas;

        ctx.fillStyle = '#000000';
        ctx.fillRect(0, 0, canvas.width, canvas.height);

        ctx.fillStyle = '#ff0000';
        ctx.font = 'bold 40px monospace';
        ctx.textAlign = 'center';
        ctx.fillText('ACCESS', canvas.width / 2, 50);
        ctx.fillText('DENIED', canvas.width / 2, 100);

        this.screenTexture.needsUpdate = true;

        setTimeout(() => {
            this.inputCode = '';
            this.updateScreenDisplay();
        }, 1200);
    }

    showSuccessScreen() {
        const ctx = this.screenContext;
        const canvas = this.screenCanvas;

        ctx.fillStyle = '#000000';
        ctx.fillRect(0, 0, canvas.width, canvas.height);

        ctx.fillStyle = '#00ff00';
        ctx.font = 'bold 40px monospace';
        ctx.textAlign = 'center';
        ctx.fillText('ACCESS', canvas.width / 2, 50);
        ctx.fillText('GRANTED', canvas.width / 2, 100);

        this.screenTexture.needsUpdate = true;
    }

    setupEvents() {
        this.onClick = this.handleClick.bind(this);
        this.renderer.domElement.addEventListener('click', this.onClick);
    }

    handleClick(event) {
        if (this.solved) return;

        const rect = this.renderer.domElement.getBoundingClientRect();
        this.mouse.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
        this.mouse.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;

        this.raycaster.setFromCamera(this.mouse, this.camera);

        // Check button clicks
        const buttonMeshes = Object.values(this.buttons);
        const hits = this.raycaster.intersectObjects(buttonMeshes, false);

        if (hits.length > 0) {
            const clickedButton = hits[0].object;
            const number = clickedButton.userData.number;

            if (number !== undefined) {
                // Visual feedback - button press
                clickedButton.position.z = 0.02;
                setTimeout(() => {
                    clickedButton.position.z = 0.03;
                }, 100);

                this.pressDigit(number);
            }
        }
    }

    pressDigit(digit) {
        if (this.inputCode.length >= 4) return;

        this.inputCode += digit.toString();
        console.log('Entered:', this.inputCode);
        this.updateScreenDisplay();

        // Auto-check when 4 digits
        if (this.inputCode.length === 4) {
            setTimeout(() => this.validateCode(), 400);
        }
    }

    validateCode() {
        if (this.inputCode === this.secretCode) {
            this.solved = true;
            this.opening = true;
            this.openProgress = 0;
            console.log('🔓 Door unlocked!');
            this.showSuccessScreen();

            setTimeout(() => {
                this.onUnlocked();
            }, 1500);
        } else {
            console.log('❌ Wrong code');
            this.showErrorScreen();
        }
    }

    update(delta) {
        if (this.opening && this.openProgress < 1) {
            this.openProgress = Math.min(1, this.openProgress + delta * 0.7);
            const t = this.openProgress;
            const angle = -Math.PI / 2 * t;
            this.door.rotation.y = angle;
        }
    }

    cleanup() {
        this.renderer.domElement.removeEventListener('click', this.onClick);
        this.scene.remove(this.keypadGroup);
    }
}