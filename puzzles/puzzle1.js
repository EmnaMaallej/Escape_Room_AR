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
        this.hasInteracted = false; // Ne vérifie pas avant interaction

        this.gear = null;
        this.gearLight = null;
        this.floorLight = null;

        this.hasGear = false; // <-- utilisé par Puzzle 2

        this.raycaster = new THREE.Raycaster();
        this.mouse = new THREE.Vector2();

        this.init();
    }

    init() {
        this.createStickyNote();
        this.setupEventListeners();

        console.log('Puzzle 1 – Clock Alignment activated.');
        console.log('   - Press 1 to select hour hand, 2 for minute hand');
        console.log('   - Use ← → or 4 / 6 to rotate.');
        console.log('   - The hint near the clock speaks of dawn and balance...');
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

    checkClockTime() {
        if (this.solved || !this.hasInteracted) return;

        // Rotation sur l'axe Z
        let hourAngle = THREE.MathUtils.radToDeg(this.hourHand.rotation.z) % 360;
        let minuteAngle = THREE.MathUtils.radToDeg(this.minuteHand.rotation.z) % 360;

        if (hourAngle < 0) hourAngle += 360;
        if (minuteAngle < 0) minuteAngle += 360;

        console.log('Angles - Hour:', hourAngle.toFixed(1), 'Minute:', minuteAngle.toFixed(1));

        // Target: 6:00
        const hourTarget = 180;
        const minuteTarget = 0;
        const tolerance = 15;

        const hourDiff = Math.abs(hourAngle - hourTarget);
        const minuteDiff = Math.min(minuteAngle, 360 - minuteAngle);

        if (hourDiff < tolerance && minuteDiff < tolerance) {
            this.solvePuzzle();
        }
    }

    solvePuzzle() {
        if (this.solved) return;
        this.solved = true;

        console.log('✅ Puzzle 1 solved – golden gear released.');

        // Gear visible
        const gearGeom = new THREE.CylinderGeometry(0.3, 0.3, 0.12, 16);
        const gearMat = new THREE.MeshStandardMaterial({
            color: 0xFFD700,
            emissive: 0xFFAA00,
            emissiveIntensity: 2.0,
            metalness: 1.0,
            roughness: 0.15
        });

        this.gear = new THREE.Mesh(gearGeom, gearMat);
        this.gear.position.set(5.0, 3.4, -3.5); // commence sous le cadran
        this.gear.rotation.x = Math.PI / 2;
        this.gear.castShadow = true;
        this.scene.add(this.gear);

        // Lumière sur la gear
        this.gearLight = new THREE.PointLight(0xFFAA00, 5.0, 5);
        this.gearLight.position.copy(this.gear.position);
        this.scene.add(this.gearLight);

        // Spot vers le sol
        this.floorLight = new THREE.SpotLight(0xFFAA00, 3.0, 8, Math.PI / 6);
        this.floorLight.position.set(5.0, 2.0, -3.5);
        this.floorLight.target.position.set(5.0, 0.0, -3.5);
        this.scene.add(this.floorLight, this.floorLight.target);

        // Animation de chute simple
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
            this.floorLight.target.position.set(
                this.gear.position.x,
                0,
                this.gear.position.z
            );

            if (this.gear.position.y <= 0.2) {
                this.gear.position.y = 0.2;
                clearInterval(fallInterval);

                this.showMessage('⚙️ A golden gear has fallen. Click it to pick it up.');

                // Petit pulse visuel
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
        const div = document.createElement('div');
        div.style.position = 'fixed';
        div.style.top = '20px';
        div.style.left = '50%';
        div.style.transform = 'translateX(-50%)';
        div.style.backgroundColor = 'rgba(0,0,0,0.85)';
        div.style.color = '#00ffff';
        div.style.padding = '10px 22px';
        div.style.borderRadius = '8px';
        div.style.fontFamily = 'Georgia, serif';
        div.style.fontSize = '16px';
        div.style.zIndex = '2000';
        div.textContent = text;
        document.body.appendChild(div);
        setTimeout(() => div.remove(), 3200);
    }

    onClockClick = (event) => {
        if (this.solved) return;

        const rect = this.renderer.domElement.getBoundingClientRect();
        this.mouse.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
        this.mouse.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;

        this.raycaster.setFromCamera(this.mouse, this.camera);

        const hitMeshes = [];
        // Traverse pivot groups to find meshes
        this.hourHand.traverse((child) => {
            if (child.isMesh) hitMeshes.push(child);
        });
        this.minuteHand.traverse((child) => {
            if (child.isMesh) hitMeshes.push(child);
        });

        console.log('🖱️ Clock click - found meshes:', hitMeshes.length);

        const intersects = this.raycaster.intersectObjects(hitMeshes, false);
        console.log('🎯 Intersects:', intersects.length);

        if (!intersects.length) return;

        const hit = intersects[0].object;
        console.log('✅ Hit object:', hit.name);

        // Check if hit is child of hour or minute pivot
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

        // Ramasser la gear
        console.log('⚙️ Golden gear collected for the next mechanism.');
        this.showMessage('⚙️ Gear collected. It might fit a waiting mechanism.');

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

        // Sélection des aiguilles avec 1 et 2
        if (event.key === '1') {
            this.selectedHand = 'hour';
            this.showMessage('🕐 Hour hand selected. Use ← → or 4 / 6.');
            return;
        }
        if (event.key === '2') {
            this.selectedHand = 'minute';
            this.showMessage('🕐 Minute hand selected. Use ← → or 4 / 6.');
            return;
        }

        if (!this.selectedHand) return;

        const rotationSpeed = Math.PI / 12; // 15°
        this.hasInteracted = true;

        // Essayer rotation.z (axe perpendiculaire au cadran dans le modèle)
        if (event.key === '6' || event.key === 'ArrowRight') {
            if (this.selectedHand === 'hour') {
                this.hourHand.rotation.z -= rotationSpeed;
                console.log('Hour Z:', this.hourHand.rotation.z.toFixed(2));
            } else {
                this.minuteHand.rotation.z -= rotationSpeed;
                console.log('Minute Z:', this.minuteHand.rotation.z.toFixed(2));
            }
            this.checkClockTime();
            event.preventDefault();
            event.stopPropagation();
        } else if (event.key === '4' || event.key === 'ArrowLeft') {
            if (this.selectedHand === 'hour') {
                this.hourHand.rotation.z += rotationSpeed;
                console.log('Hour Z:', this.hourHand.rotation.z.toFixed(2));
            } else {
                this.minuteHand.rotation.z += rotationSpeed;
                console.log('Minute Z:', this.minuteHand.rotation.z.toFixed(2));
            }
            this.checkClockTime();
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

        if (this.gearLight) this.scene.remove(this.gearLight);
        if (this.floorLight) this.scene.remove(this.floorLight);
    }
}