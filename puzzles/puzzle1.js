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
        this.raycaster = new THREE.Raycaster();
        this.mouse = new THREE.Vector2();

        this.init();
    }

    init() {
        this.createStickyNote();
        this.setupEventListeners();
        console.log('✅ Puzzle 1 - Clock Alignment - ACTIVÉ!');
        console.log('📌 Instructions:');
        console.log('   1. Cliquez sur une aiguille de l\'horloge');
        console.log('   2. Utilisez ← → (ou touches 4/6) pour la tourner');
        console.log('   3. Réglez l\'heure à 6:00 (heures vers le bas, minutes vers le haut)');
        console.log('   4. Un engrenage doré tombera quand c\'est correct!');
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
        ctx.font = '18px Georgia';
        ctx.fillText('The past aligns', 128, 90);
        ctx.fillText('at dawn;', 128, 115);
        ctx.fillText('the future', 128, 145);
        ctx.fillText('at dusk.', 128, 170);
        ctx.font = 'italic 16px Georgia';
        ctx.fillText('(Set the time)', 128, 210);

        const texture = new THREE.CanvasTexture(canvas);
        const stickyNote = new THREE.Mesh(
            new THREE.PlaneGeometry(0.3, 0.3),
            new THREE.MeshStandardMaterial({
                map: texture,
                emissive: 0xffff00,
                emissiveIntensity: 0.2
            })
        );
        stickyNote.position.set(5.7, 2.2, -2.5);
        stickyNote.rotation.y = -Math.PI / 2;
        this.scene.add(stickyNote);
    }

    checkClockTime() {
        if (this.solved) return;

        // Les aiguilles sont des Groups, donc on vérifie la rotation du Group
        const hourAngle = THREE.MathUtils.radToDeg(this.hourHand.rotation.z) % 360;
        const minuteAngle = THREE.MathUtils.radToDeg(this.minuteHand.rotation.z) % 360;

        // 6:00 = aiguille des heures à 180° (pointing down)
        //        aiguille des minutes à 0° (pointing up)
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
        console.log('🎉 PUZZLE 1 RÉSOLU! L\'engrenage tombe!');

        // ENGRENAGE BRILLANT ET VISIBLE
        const gearGeom = new THREE.CylinderGeometry(0.3, 0.3, 0.12, 8);
        const gearMat = new THREE.MeshStandardMaterial({
            color: 0xFFD700,          // OR BRILLANT
            emissive: 0xFFAA00,       // Lueur orange vif
            emissiveIntensity: 2.0,   // TRÈS LUMINEUX
            metalness: 1.0,
            roughness: 0.1
        });
        this.gear = new THREE.Mesh(gearGeom, gearMat);

        // Position: DEVANT l'horloge (visible, pas dans l'ombre)
        this.gear.position.set(5.0, 3.55, -2);
        this.gear.rotation.x = Math.PI / 2;
        this.gear.castShadow = true;
        this.scene.add(this.gear);

        // LUMIÈRE FORTE autour de l'engrenage
        this.gearLight = new THREE.PointLight(0xFFAA00, 5.0, 5);
        this.gearLight.position.copy(this.gear.position);
        this.scene.add(this.gearLight);

        // Lumière supplémentaire pour le sol
        this.floorLight = new THREE.SpotLight(0xFFAA00, 3.0, 8, Math.PI / 6);
        this.floorLight.position.set(5.0, 2.0, -2);
        this.floorLight.target.position.set(5.0, 0, -2);
        this.scene.add(this.floorLight, this.floorLight.target);

        // Animation de chute
        let fallSpeed = 0;
        const fallInterval = setInterval(() => {
            fallSpeed += 0.02;
            this.gear.position.y -= fallSpeed;
            this.gear.rotation.z += 0.15;

            // Mettre à jour les lumières
            this.gearLight.position.copy(this.gear.position);
            this.floorLight.target.position.set(this.gear.position.x, 0, this.gear.position.z);

            // Arrêter quand l'engrenage touche le sol
            if (this.gear.position.y <= 0.2) {
                this.gear.position.y = 0.2;
                clearInterval(fallInterval);

                // Message
                this.showMessage('⚙️ A GOLDEN GEAR has fallen! Click to pick it up.');

                // Pulse lumineux au sol
                let pulseTime = 0;
                const pulseInterval = setInterval(() => {
                    pulseTime += 0.1;
                    this.gearLight.intensity = 5.0 + Math.sin(pulseTime * 3) * 2.0;
                    this.gear.material.emissiveIntensity = 2.0 + Math.sin(pulseTime * 3) * 0.5;

                    if (pulseTime > 10) clearInterval(pulseInterval);
                }, 50);
            }
        }, 16);
    }

    showMessage(text) {
        const messageDiv = document.createElement('div');
        messageDiv.style.position = 'fixed';
        messageDiv.style.top = '20px';
        messageDiv.style.left = '50%';
        messageDiv.style.transform = 'translateX(-50%)';
        messageDiv.style.backgroundColor = 'rgba(0, 0, 0, 0.8)';
        messageDiv.style.color = '#00ffff';
        messageDiv.style.padding = '15px 30px';
        messageDiv.style.borderRadius = '10px';
        messageDiv.style.fontSize = '20px';
        messageDiv.style.fontFamily = 'Georgia, serif';
        messageDiv.style.zIndex = '1000';
        messageDiv.textContent = text;
        document.body.appendChild(messageDiv);

        setTimeout(() => messageDiv.remove(), 4000);
    }

    onClockClick = (event) => {
        if (this.solved) return;

        const rect = this.renderer.domElement.getBoundingClientRect();
        this.mouse.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
        this.mouse.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;

        this.raycaster.setFromCamera(this.mouse, this.camera);

        // Les aiguilles sont des Groups avec des enfants
        const allClockObjects = [];

        // Ajouter tous les enfants de l'aiguille des heures
        this.hourHand.traverse((child) => {
            if (child.isMesh) allClockObjects.push(child);
        });

        // Ajouter tous les enfants de l'aiguille des minutes
        this.minuteHand.traverse((child) => {
            if (child.isMesh) allClockObjects.push(child);
        });

        const intersects = this.raycaster.intersectObjects(allClockObjects, false);

        if (intersects.length > 0) {
            const clickedObject = intersects[0].object;

            // Vérifier à quel Group appartient l'objet cliqué
            if (this.isChildOf(clickedObject, this.hourHand)) {
                this.selectedHand = 'hour';
                this.showMessage('🕐 Hour hand selected. Use ← → or 4/6 to rotate.');
                console.log('🖱️ Aiguille des HEURES sélectionnée');
            } else if (this.isChildOf(clickedObject, this.minuteHand)) {
                this.selectedHand = 'minute';
                this.showMessage('🕐 Minute hand selected. Use ← → or 4/6 to rotate.');
                console.log('🖱️ Aiguille des MINUTES sélectionnée');
            }
        }
    }

    // Fonction helper pour vérifier si un objet est enfant d'un group
    isChildOf(child, parent) {
        let current = child;
        while (current) {
            if (current === parent) return true;
            current = current.parent;
        }
        return false;
    }

    onGearClick = (event) => {
        if (!this.gear || !this.solved) return;

        const rect = this.renderer.domElement.getBoundingClientRect();
        this.mouse.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
        this.mouse.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;

        this.raycaster.setFromCamera(this.mouse, this.camera);
        const intersects = this.raycaster.intersectObjects([this.gear], false);

        if (intersects.length > 0) {
            console.log('✅ Engrenage ramassé!');
            this.showMessage('⚙️ Gear collected! Find where to use it...');

            // Supprimer l'engrenage et les lumières
            this.scene.remove(this.gear);
            this.scene.remove(this.gearLight);
            this.scene.remove(this.floorLight);
            this.gear = null;
            this.gearLight = null;
            this.floorLight = null;
        }
    }

    onKeyDown = (event) => {
        if (this.solved) return;

        if (!this.selectedHand) {
            return;
        }

        const rotationSpeed = Math.PI / 12; // 15 degrés

        if (event.key === '6' || event.key === 'ArrowRight') {
            if (this.selectedHand === 'hour') {
                this.hourHand.rotation.z -= rotationSpeed;
            } else if (this.selectedHand === 'minute') {
                this.minuteHand.rotation.z -= rotationSpeed;
            }
            this.checkClockTime();
            event.preventDefault();
            event.stopPropagation();
        }
        else if (event.key === '4' || event.key === 'ArrowLeft') {
            if (this.selectedHand === 'hour') {
                this.hourHand.rotation.z += rotationSpeed;
            } else if (this.selectedHand === 'minute') {
                this.minuteHand.rotation.z += rotationSpeed;
            }
            this.checkClockTime();
            event.preventDefault();
            event.stopPropagation();
        }
        else if (event.key === 'Escape' || event.key === 'e' || event.key === 'E') {
            this.selectedHand = null;
            this.showMessage('Aiguille désélectionnée. Cliquez à nouveau pour sélectionner.');
            console.log('❌ Aiguille désélectionnée');
        }
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

        // Nettoyer les lumières si elles existent
        if (this.gearLight) this.scene.remove(this.gearLight);
        if (this.floorLight) this.scene.remove(this.floorLight);
    }
}