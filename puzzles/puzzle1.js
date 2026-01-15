import * as THREE from 'three';

export class ClockPuzzle {
    constructor(scene, camera, renderer, clockGroup, hourHand, minuteHand) {
        this.scene = scene;
        this.camera = camera;
        this.renderer = renderer;
        this.clockGroup = clockGroup;

        this.hourHand = hourHand;
        this.minuteHand = minuteHand;

        this.solved = false;
        this.selectedHand = null;

        this.gear = null;
        this.gearLight = null;
        this.floorLight = null;
        this.hasGear = false;

        this.raycaster = new THREE.Raycaster();
        this.mouse = new THREE.Vector2();

        // ANGLES CIBLES pour 6:00
        this.TARGET_HOUR_DEG = 60;
        this.TARGET_MINUTE_DEG = 135;
        this.tolerance = 15;

        this.init();
    }

    init() {
        this.createStickyNote();
        this.setupEventListeners();

        this.baseHourZ = this.hourHand.rotation.z;
        this.baseMinuteZ = this.minuteHand.rotation.z;

        console.log('✅ Clock Puzzle initialized');
        console.log('🎯 Goal: Align clock to 6:00');
        console.log('🎮 Click hands to select, use ← → to rotate');

        // Vérification AUTOMATIQUE toutes les 200ms
        this.checkInterval = setInterval(() => {
            this.autoCheck();
        }, 200);
    }

    createStickyNote() {
        const canvas = document.createElement('canvas');
        canvas.width = 256;
        canvas.height = 256;
        const ctx = canvas.getContext('2d');

        ctx.fillStyle = '#fff740';
        ctx.fillRect(0, 0, 256, 256);

        ctx.fillStyle = '#2a1810';
        ctx.font = 'bold 24px Arial';
        ctx.textAlign = 'center';
        ctx.fillText('HINT', 128, 40);

        ctx.font = '17px Georgia';
        const lines = [
            'Time favours the first light,',
            'when night exhales',
            'and day has barely begun.',
            '',
            'Align the hands',
            'to the moment dawn remembers.'
        ];
        let y = 80;
        for (const line of lines) {
            ctx.fillText(line, 128, y);
            y += 22;
        }

        const texture = new THREE.CanvasTexture(canvas);
        const stickyNote = new THREE.Mesh(
            new THREE.PlaneGeometry(0.3, 0.3),
            new THREE.MeshStandardMaterial({
                map: texture,
                emissive: 0xffff66,
                emissiveIntensity: 0.15
            })
        );

        stickyNote.position.set(5.7, 2.2, -4);
        stickyNote.rotation.y = -Math.PI / 2;
        stickyNote.castShadow = true;

        this.scene.add(stickyNote);
    }

    // VÉRIFICATION AUTOMATIQUE
    autoCheck() {
        if (this.solved) {
            clearInterval(this.checkInterval);
            return;
        }

        let hourRotRad = this.hourHand.rotation.z - this.baseHourZ;
        let minuteRotRad = this.minuteHand.rotation.z - this.baseMinuteZ;

        hourRotRad = this.normalizeAngle(hourRotRad);
        minuteRotRad = this.normalizeAngle(minuteRotRad);

        const hourDeg = THREE.MathUtils.radToDeg(hourRotRad);
        const minuteDeg = THREE.MathUtils.radToDeg(minuteRotRad);

        const hourMatch = this.isAngleClose(hourDeg, this.TARGET_HOUR_DEG, this.tolerance);
        const minuteMatch = this.isAngleClose(minuteDeg, this.TARGET_MINUTE_DEG, this.tolerance);

        if (hourMatch && minuteMatch) {
            console.log('✅ 6:00 ALIGNED! Gear releasing...');
            console.log(`   Hour: ${hourDeg.toFixed(1)}° | Minute: ${minuteDeg.toFixed(1)}°`);
            this.solvePuzzle();
        }
    }

    normalizeAngle(angle) {
        while (angle > Math.PI) angle -= Math.PI * 2;
        while (angle < -Math.PI) angle += Math.PI * 2;
        return angle;
    }

    isAngleClose(angle1, angle2, tolerance) {
        const diff = Math.abs(angle1 - angle2);
        return diff <= tolerance;
    }

    solvePuzzle() {
        if (this.solved) return;
        this.solved = true;

        clearInterval(this.checkInterval);

        console.log('🎉 Puzzle 1 solved!');
        this.showMessage('⚙️ The clock chimes! A mechanism releases...');

        // Créer le gear doré - Position de départ DEVANT l'horloge
        const gearGeom = new THREE.CylinderGeometry(0.3, 0.3, 0.12, 16);
        const gearMat = new THREE.MeshStandardMaterial({
            color: 0xFFD700,
            emissive: 0xFFAA00,
            emissiveIntensity: 2.0,
            metalness: 1.0,
            roughness: 0.15
        });

        this.gear = new THREE.Mesh(gearGeom, gearMat);
        // Position de départ : devant l'horloge en hauteur
        this.gear.position.set(4.2, 3.4, -3.0); // Plus vers le joueur (z=-3.0 au lieu de -3.5)
        this.gear.rotation.x = Math.PI / 2;
        this.gear.castShadow = true;
        this.scene.add(this.gear);

        this.gearLight = new THREE.PointLight(0xFFAA00, 5.0, 5);
        this.gearLight.position.copy(this.gear.position);
        this.scene.add(this.gearLight);

        this.floorLight = new THREE.SpotLight(0xFFAA00, 3.0, 8, Math.PI / 6);
        this.floorLight.position.set(4.2, 2.0, -3.0);
        this.floorLight.target.position.set(4.2, 0.0, -3.0);
        this.scene.add(this.floorLight, this.floorLight.target);

        // Animation de chute
        let fallSpeed = 0;
        const fallInterval = setInterval(() => {
            if (!this.gear) {
                clearInterval(fallInterval);
                return;
            }

            fallSpeed += 0.02;
            this.gear.position.y -= fallSpeed;
            this.gear.rotation.z += 0.18;

            this.gearLight.position.copy(this.gear.position);
            this.floorLight.target.position.set(this.gear.position.x, 0, this.gear.position.z);

            // Le gear s'arrête AU SOL (y=0.15 pour être bien visible)
            if (this.gear.position.y <= 0.15) {
                this.gear.position.y = 0.15;
                clearInterval(fallInterval);

                this.showMessage('⚙️ A golden gear has fallen. Click it to pick it up.');

                let t = 0;
                const pulse = setInterval(() => {
                    if (!this.gear) {
                        clearInterval(pulse);
                        return;
                    }
                    t += 0.15;
                    this.gearLight.intensity = 5 + Math.sin(t * 4) * 2;
                    this.gear.material.emissiveIntensity = 2 + Math.sin(t * 4) * 0.6;
                    if (t > 6) clearInterval(pulse);
                }, 50);
            }
        }, 16);
    }

    showMessage(text) {
        // Supprimer l'ancien message s'il existe
        const oldMsg = document.getElementById('clock-message');
        if (oldMsg) oldMsg.remove();

        const div = document.createElement('div');
        div.id = 'clock-message';
        div.style.cssText = `
            position: fixed;
            top: 20px;
            left: 50%;
            transform: translateX(-50%);
            background: rgba(0, 50, 100, 0.95);
            color: #00ffff;
            padding: 12px 24px;
            border-radius: 8px;
            border: 2px solid #00ffff;
            font-family: Georgia, serif;
            font-size: 16px;
            z-index: 5000;
            box-shadow: 0 0 20px rgba(0,255,255,0.6);
            pointer-events: none;
        `;
        div.textContent = text;
        document.body.appendChild(div);
        setTimeout(() => {
            if (div.parentNode) div.remove();
        }, 2500);
    }

    onClockClick = (event) => {
        if (this.solved) return;

        const rect = this.renderer.domElement.getBoundingClientRect();
        this.mouse.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
        this.mouse.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;

        this.raycaster.setFromCamera(this.mouse, this.camera);

        const hitMeshes = [];
        this.hourHand.traverse((child) => { if (child.isMesh) hitMeshes.push(child); });
        this.minuteHand.traverse((child) => { if (child.isMesh) hitMeshes.push(child); });

        const intersects = this.raycaster.intersectObjects(hitMeshes, false);
        if (!intersects.length) return;

        const hit = intersects[0].object;

        if (this.isChildOf(hit, this.hourHand)) {
            this.selectedHand = 'hour';
            this.showMessage('🕐 Hour hand selected. Use ← → or 4 / 6.');
        } else if (this.isChildOf(hit, this.minuteHand)) {
            this.selectedHand = 'minute';
            this.showMessage('🕐 Minute hand selected. Use ← → or 4 / 6.');
        }
    };

    onGearClick = (event) => {
        if (!this.gear || !this.solved || this.hasGear) return;

        const rect = this.renderer.domElement.getBoundingClientRect();
        this.mouse.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
        this.mouse.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;

        this.raycaster.setFromCamera(this.mouse, this.camera);
        const intersects = this.raycaster.intersectObjects([this.gear], false);

        if (!intersects.length) return;

        console.log('⚙️ Golden gear collected!');
        this.showMessage('⚙️ Gear collected. It might fit somewhere...');

        this.scene.remove(this.gear);
        if (this.gearLight) this.scene.remove(this.gearLight);
        if (this.floorLight) this.scene.remove(this.floorLight);

        this.gear = null;
        this.gearLight = null;
        this.floorLight = null;
        this.hasGear = true;
    };

    onKeyDown = (event) => {
        if (this.solved) return;

        if (event.key === '1') {
            this.selectedHand = 'hour';
            this.showMessage('🕐 Hour hand selected.');
            return;
        }
        if (event.key === '2') {
            this.selectedHand = 'minute';
            this.showMessage('🕐 Minute hand selected.');
            return;
        }

        if (!this.selectedHand) return;

        const rotationSpeed = Math.PI / 12; // 15°

        if (event.key === '6' || event.key === 'ArrowRight') {
            if (this.selectedHand === 'hour') {
                this.hourHand.rotation.z -= rotationSpeed;
            } else {
                this.minuteHand.rotation.z -= rotationSpeed;
            }
            event.preventDefault();
            event.stopPropagation();
        } else if (event.key === '4' || event.key === 'ArrowLeft') {
            if (this.selectedHand === 'hour') {
                this.hourHand.rotation.z += rotationSpeed;
            } else {
                this.minuteHand.rotation.z += rotationSpeed;
            }
            event.preventDefault();
            event.stopPropagation();
        } else if (event.key === 'Escape' || event.key === 'e' || event.key === 'E') {
            this.selectedHand = null;
            this.showMessage('Hand deselected.');
        }
    };

    isChildOf(child, parent) {
        let current = child;
        while (current) {
            if (current === parent) return true;
            current = current.parent;
        }
        return false;
    }

    setupEventListeners() {
        this.renderer.domElement.addEventListener('click', this.onClockClick);
        this.renderer.domElement.addEventListener('click', this.onGearClick);
        window.addEventListener('keydown', this.onKeyDown);
    }

    cleanup() {
        this.renderer.domElement.removeEventListener('click', this.onClockClick);
        this.renderer.domElement.removeEventListener('click', this.onGearClick);
        window.removeEventListener('keydown', this.onKeyDown);

        if (this.checkInterval) clearInterval(this.checkInterval);
        if (this.gearLight) this.scene.remove(this.gearLight);
        if (this.floorLight) this.scene.remove(this.floorLight);
    }
}