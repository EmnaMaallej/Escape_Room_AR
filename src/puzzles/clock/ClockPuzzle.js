import * as THREE from 'three';
import { BasePuzzle } from '../BasePuzzle.js';
import { ClockView } from './ClockView.js';

export class ClockPuzzle extends BasePuzzle {
    constructor(scene, camera, renderer, onCollision) {
        super(scene, camera, renderer);
        this.view = new ClockView(scene, onCollision);

        this.selectedHand = null;
        this.raycaster = new THREE.Raycaster();
        this.mouse = new THREE.Vector2();

        // Animation state
        this.gearFalling = false;
        this.gearFallSpeed = 0;
        this.gearLight = null;
        this.floorLight = null;
        this.pulseTime = 0;
        this.pulsing = false;

        this.init();
    }

    init() {
        this.setupEventListeners();
        console.log('✅ Puzzle 1 - Clock Alignment - ACTIVE!');
    }

    setupEventListeners() {
        this.onClockClick = this.onClockClick.bind(this);
        this.onGearClick = this.onGearClick.bind(this);
        this.onKeyDown = this.onKeyDown.bind(this);

        this.renderer.domElement.addEventListener('click', this.onClockClick);
        this.renderer.domElement.addEventListener('click', this.onGearClick);
        window.addEventListener('keydown', this.onKeyDown);
    }

    update(delta) {
        // Pendulum animation
        if (this.view.pendulum) {
            this.view.pendulum.rotation.z = Math.sin(Date.now() * 0.0018) * 0.12;
        }

        // Gear falling animation
        if (this.gearFalling && this.view.gear) {
            this.gearFallSpeed += 0.02;
            this.view.gear.position.y -= this.gearFallSpeed;
            this.view.gear.rotation.z += 0.15;

            if (this.gearLight) this.gearLight.position.copy(this.view.gear.position);
            if (this.floorLight) this.floorLight.target.position.set(this.view.gear.position.x, 0, this.view.gear.position.z);

            if (this.view.gear.position.y <= 0.2) {
                this.view.gear.position.y = 0.2;
                this.gearFalling = false;
                this.pulsing = true;
                this.showMessage('⚙️ A GOLDEN GEAR has fallen! Click to pick it up.');
            }
        }

        // Gear pulsing animation
        if (this.pulsing && this.view.gear) {
            this.pulseTime += delta * 3;
            if (this.gearLight) this.gearLight.intensity = 5.0 + Math.sin(this.pulseTime) * 2.0;
            this.view.gear.material.emissiveIntensity = 2.0 + Math.sin(this.pulseTime) * 0.5;

            if (this.pulseTime > 30) this.pulsing = false; // Stop pulsing after a while
        }
    }

    checkClockTime() {
        if (this.solved) return;

        const hourAngle = THREE.MathUtils.radToDeg(this.view.hourHand.rotation.z) % 360;
        const minuteAngle = THREE.MathUtils.radToDeg(this.view.minuteHand.rotation.z) % 360;

        const hourTarget = 180;
        const minuteTarget = 0;
        const tolerance = 15;

        const hourCorrect = Math.abs((hourAngle + 360) % 360 - hourTarget) < tolerance;
        const minuteCorrect = Math.abs((minuteAngle + 360) % 360 - minuteTarget) < tolerance;

        if (hourCorrect && minuteCorrect) {
            this.solvePuzzle();
        }
    }

    solvePuzzle() {
        if (this.solved) return;
        this.solved = true;
        console.log('🎉 PUZZLE 1 SOLVED!');

        const { gear, gearLight, floorLight } = this.view.spawnGear();
        this.gearLight = gearLight;
        this.floorLight = floorLight;
        this.gearFalling = true;
    }

    onClockClick(event) {
        console.log('Clock click triggered, solved:', this.solved);
        if (this.solved) return;

        if (document.pointerLockElement) {
            this.mouse.x = 0;
            this.mouse.y = 0;
            console.log('Pointer locked - raycasting from center');
        } else {
            const rect = this.renderer.domElement.getBoundingClientRect();
            this.mouse.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
            this.mouse.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;
            console.log('Free mouse - raycasting from:', this.mouse.x, this.mouse.y);
        }

        this.raycaster.setFromCamera(this.mouse, this.camera);

        const allClockObjects = [];
        if (this.view.hourHand) this.view.hourHand.traverse(c => { if (c.isMesh) allClockObjects.push(c); });
        if (this.view.minuteHand) this.view.minuteHand.traverse(c => { if (c.isMesh) allClockObjects.push(c); });

        console.log('Clock objects to check:', allClockObjects.length);
        const intersects = this.raycaster.intersectObjects(allClockObjects, false);
        console.log('Intersections found:', intersects.length);

        if (intersects.length > 0) {
            const clickedObject = intersects[0].object;
            if (this.isChildOf(clickedObject, this.view.hourHand)) {
                this.selectedHand = 'hour';
                console.log('Hour hand selected');
                this.showMessage('🕐 Hour hand selected. Use ← → or 4/6 to rotate.');
            } else if (this.isChildOf(clickedObject, this.view.minuteHand)) {
                this.selectedHand = 'minute';
                console.log('Minute hand selected');
                this.showMessage('🕐 Minute hand selected. Use ← → or 4/6 to rotate.');
            }
        }
    }

    onGearClick(event) {
        if (!this.view.gear || !this.solved) return;

        if (document.pointerLockElement) {
            this.mouse.x = 0;
            this.mouse.y = 0;
        } else {
            const rect = this.renderer.domElement.getBoundingClientRect();
            this.mouse.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
            this.mouse.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;
        }

        this.raycaster.setFromCamera(this.mouse, this.camera);
        const intersects = this.raycaster.intersectObjects([this.view.gear], false);

        if (intersects.length > 0) {
            this.showMessage('⚙️ Gear collected! Find where to use it...');
            this.view.dispose(); // Or just remove gear
            this.view.gear = null; // Prevent further clicks
        }
    }

    onKeyDown(event) {
        if (this.solved || !this.selectedHand) return;

        const rotationSpeed = Math.PI / 12;

        if (event.key === '6' || event.key === 'ArrowRight') {
            if (this.selectedHand === 'hour') this.view.hourHand.rotation.z -= rotationSpeed;
            else this.view.minuteHand.rotation.z -= rotationSpeed;
            this.checkClockTime();
        } else if (event.key === '4' || event.key === 'ArrowLeft') {
            if (this.selectedHand === 'hour') this.view.hourHand.rotation.z += rotationSpeed;
            else this.view.minuteHand.rotation.z += rotationSpeed;
            this.checkClockTime();
        } else if (event.key === 'Escape') {
            this.selectedHand = null;
            this.showMessage('Hand deselected.');
        }
    }

    isChildOf(child, parent) {
        let current = child;
        while (current) {
            if (current === parent) return true;
            current = current.parent;
        }
        return false;
    }

    showMessage(text) {
        const messageDiv = document.createElement('div');
        Object.assign(messageDiv.style, {
            position: 'fixed', top: '20px', left: '50%', transform: 'translateX(-50%)',
            backgroundColor: 'rgba(0, 0, 0, 0.8)', color: '#00ffff', padding: '15px 30px',
            borderRadius: '10px', fontSize: '20px', fontFamily: 'Georgia, serif', zIndex: '1000'
        });
        messageDiv.textContent = text;
        document.body.appendChild(messageDiv);
        setTimeout(() => messageDiv.remove(), 4000);
    }

    dispose() {
        this.view.dispose();
        this.renderer.domElement.removeEventListener('click', this.onClockClick);
        this.renderer.domElement.removeEventListener('click', this.onGearClick);
        window.removeEventListener('keydown', this.onKeyDown);
    }
}
