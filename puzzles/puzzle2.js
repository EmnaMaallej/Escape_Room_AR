// src/puzzles/puzzle2.js
import * as THREE from 'three';

export class GearPuzzle {
    constructor(scene, camera, renderer, clockPuzzle, options = {}) {
        this.scene = scene;
        this.camera = camera;
        this.renderer = renderer;
        this.clockPuzzle = clockPuzzle; // expects .hasGear boolean
        this.onSolved = options.onSolved || (() => { });

        this.group = new THREE.Group();

        this.raycaster = new THREE.Raycaster();
        this.mouse = new THREE.Vector2();

        this.solved = false;
        this.gearPlaced = false;
        this.leftState = 0;
        this.rightState = 0;

        this.lidPivot = null;
        this.lid = null;
        this.leftDial = null;
        this.rightDial = null;
        this.gearSocket = null;
        this.socketGear = null;
        this.book = null;

        this.opening = false;
        this.openProgress = 0;

        this.init();
    }

    // ================= INIT =================

    init() {
        this.buildBox();
        this.setupEvents();
        console.log('Puzzle 2 – Gear Lockbox ready.');
        console.log('  • Place the golden gear into the central ring.');
        console.log('  • Align both brass dials to their marks.');
    }

    // ================= GEOMETRY =================

    buildBox() {
        const woodDark = new THREE.MeshStandardMaterial({
            color: 0x3a2414,
            roughness: 0.8,
            metalness: 0.1
        });
        const woodLight = new THREE.MeshStandardMaterial({
            color: 0x9b6b3b,
            roughness: 0.7,
            metalness: 0.05
        });
        const brass = new THREE.MeshStandardMaterial({
            color: 0xd4af37,
            metalness: 0.95,
            roughness: 0.28,
            emissive: 0x2a1a00,
            emissiveIntensity: 0.25
        });

        const width = 1.0;
        const depth = 0.55;
        const bodyHeight = 0.26;
        const lidThickness = 0.06;

        // Base fermée
        const body = new THREE.Mesh(
            new THREE.BoxGeometry(width, bodyHeight, depth),
            woodLight
        );
        body.castShadow = true;
        body.receiveShadow = true;
        body.position.y = bodyHeight / 2;
        this.group.add(body);

        // Liseré sombre (léger cadre)
        const frame = new THREE.Mesh(
            new THREE.BoxGeometry(width * 1.02, bodyHeight * 1.02, depth * 1.02),
            woodDark
        );
        frame.position.copy(body.position);
        frame.material.transparent = true;
        frame.material.opacity = 0.22;
        this.group.add(frame);

        // PIVOT DU COUVERCLE : charnière sur l'arête AVANT (autre côté)
        const lidPivot = new THREE.Group();
        lidPivot.position.set(0, bodyHeight + lidThickness / 2, depth / 2);
        this.group.add(lidPivot);
        this.lidPivot = lidPivot;

        // COUVERCLE rectangulaire qui s'ouvre vers l'AVANT
        const lid = new THREE.Mesh(
            new THREE.BoxGeometry(width, lidThickness, depth),
            woodLight
        );
        lid.position.set(0, 0, -depth / 2);
        lid.castShadow = true;
        lidPivot.add(lid);
        this.lid = lid;

        // Bandes laiton sur le couvercle
        const bandGeom = new THREE.BoxGeometry(0.04, lidThickness * 0.7, depth * 0.9);
        [-width / 3, 0, width / 3].forEach(x => {
            const band = new THREE.Mesh(bandGeom, brass);
            band.position.set(x, 0, 0);
            lid.add(band);
        });

        // === SOCKET CENTRAL POUR LA GEAR (bien visible) ===

        // anneau doré légèrement en relief
        const socketOuter = new THREE.Mesh(
            new THREE.TorusGeometry(0.08, 0.012, 14, 32),
            new THREE.MeshStandardMaterial({
                color: 0xd4af37,
                metalness: 1,
                roughness: 0.3,
                emissive: 0x3a2400,
                emissiveIntensity: 0.7
            })
        );
        socketOuter.rotation.x = Math.PI / 2;
        socketOuter.position.set(0, lidThickness * 0.45, 0);
        lid.add(socketOuter);

        // disque noir au centre pour l’effet de “trou”
        const socketInner = new THREE.Mesh(
            new THREE.CircleGeometry(0.06, 32),
            new THREE.MeshStandardMaterial({
                color: 0x000000,
                emissive: 0x000000,
                metalness: 0.1,
                roughness: 1,
                side: THREE.DoubleSide
            })
        );
        socketInner.rotation.x = -Math.PI / 2;
        socketInner.position.set(0, lidThickness * 0.449, 0);
        lid.add(socketInner);

        this.gearSocket = socketOuter;

        // légère lueur dans le socket
        const socketLight = new THREE.PointLight(0xffaa44, 0.4, 0.4);
        socketLight.position.set(0, lidThickness * 0.6, 0);
        lid.add(socketLight);

        // === DIALS EN LAITON ===
        const dialGeom = new THREE.CylinderGeometry(0.06, 0.06, 0.028, 24);

        // gauche
        const leftDial = new THREE.Mesh(dialGeom, brass);
        leftDial.rotation.x = Math.PI / 2;
        leftDial.position.set(-0.27, lidThickness * 0.45, depth * 0.12);
        leftDial.castShadow = true;
        lid.add(leftDial);
        this.leftDial = leftDial;

        // droite
        const rightDial = new THREE.Mesh(dialGeom, brass);
        rightDial.rotation.x = Math.PI / 2;
        rightDial.position.set(0.27, lidThickness * 0.45, depth * 0.12);
        rightDial.castShadow = true;
        lid.add(rightDial);
        this.rightDial = rightDial;

        // petites marques de référence devant les dials
        const markGeom = new THREE.BoxGeometry(0.018, 0.01, 0.03);
        const markL = new THREE.Mesh(markGeom, brass);
        markL.position.set(-0.27, lidThickness * 0.2, depth * 0.2);
        lid.add(markL);
        const markR = markL.clone();
        markR.position.x = 0.27;
        lid.add(markR);

        // Positionner le box sur le bureau
        this.group.position.set(0, 1.4, 0);
        this.scene.add(this.group);

        // ===== CLICK HITBOX (big invisible collider) =====
        const hitbox = new THREE.Mesh(
            new THREE.BoxGeometry(1.2, 0.8, 0.9), // bigger than the box
            new THREE.MeshBasicMaterial({ transparent: true, opacity: 0 })
        );

        hitbox.position.set(0, 0.4, 0); // centered above the table
        this.group.add(hitbox);
        this.clickHitbox = hitbox;

    }

    // ================= EVENTS =================

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

        const targets = [
            this.leftDial,
            this.rightDial,
            this.gearSocket,
            this.socketGear
        ].filter(Boolean);

        if (!targets.length) return;

        const hits = this.raycaster.intersectObjects(targets, false);
        if (!hits.length) return;

        const hit = hits[0].object;

        if (hit === this.gearSocket || hit === this.socketGear) {
            this.handleSocket();
        } else if (hit === this.leftDial) {
            this.handleLeftDial();
        } else if (hit === this.rightDial) {
            this.handleRightDial();
        }
    }

    // ================= GEAR SOCKET =================

    handleSocket() {
        if (this.solved) return;

        // Placer la gear
        if (!this.gearPlaced) {
            if (!this.clockPuzzle || !this.clockPuzzle.hasGear) {
                this.showMessage('A hollow ring waits for a missing cog.');
                return;
            }

            const gGeom = new THREE.CylinderGeometry(0.08, 0.08, 0.035, 16);
            const gMat = new THREE.MeshStandardMaterial({
                color: 0xffd700,
                emissive: 0xffaa00,
                emissiveIntensity: 1.4,
                metalness: 1.0,
                roughness: 0.2
            });
            const gear = new THREE.Mesh(gGeom, gMat);
            gear.rotation.x = Math.PI / 2;
            gear.position.copy(this.gearSocket.position).add(new THREE.Vector3(0, 0.014, 0));
            gear.castShadow = true;
            this.lid.add(gear);

            this.socketGear = gear;
            this.gearPlaced = true;
            this.clockPuzzle.hasGear = false; // consommée

            this.showMessage('⚙️ The cog clicks into place. The lock hums softly.');
            this.checkSolved();
        } else {
            this.showMessage('The cog is already engaged.');
        }
    }

    // ================= DIALS =================

    updateDialVisuals() {
        if (this.leftDial) {
            this.leftDial.rotation.z = this.leftState === 0 ? 0 : Math.PI / 2;
        }
        if (this.rightDial) {
            this.rightDial.rotation.z = this.rightState === 0 ? 0 : -Math.PI / 2;
        }
    }

    handleLeftDial() {
        if (!this.gearPlaced) {
            this.showMessage('The sigil resists. Power the lock first.');
            return;
        }
        this.leftState = this.leftState ? 0 : 1;
        this.updateDialVisuals();
        this.checkSolved();
    }

    handleRightDial() {
        if (!this.gearPlaced) {
            this.showMessage('The sigil resists. Power the lock first.');
            return;
        }
        this.rightState = this.rightState ? 0 : 1;
        this.updateDialVisuals();
        this.checkSolved();
    }

    // ================= RESOLUTION =================

    checkSolved() {
        if (this.solved) return;

        if (this.gearPlaced && this.leftState === 1 && this.rightState === 1) {
            this.solve();
        }
    }

    solve() {
        this.solved = true;
        this.showMessage('📖 Hidden latches release. The lockbox begins to open...');
        this.opening = true;
        this.openProgress = 0;

        // Livre / artefact à l’intérieur (posé dans le fond de la box)
        const bookGeom = new THREE.BoxGeometry(0.4, 0.05, 0.24);
        const bookMat = new THREE.MeshStandardMaterial({
            color: 0x2b1b10,
            roughness: 0.6
        });
        const book = new THREE.Mesh(bookGeom, bookMat);

        // centre de la boîte : y très faible pour qu'il soit "dedans"
        book.position.set(0, 0.04, 0);
        book.visible = false;       // il apparaîtra pendant l’anim
        book.castShadow = true;
        this.group.add(book);
        this.book = book;

        if (this.onSolved) this.onSolved(this.book); // <-- on passe le livre à l'ext
    }


    // ================= UPDATE =================

    update(delta) {
        if (this.gearPlaced && this.socketGear && !this.opening) {
            this.socketGear.rotation.z += delta * 1.8;
        }

        // ouverture du couvercle vers l'AVANT
        if (this.opening && this.openProgress < 1) {
            this.openProgress = Math.min(1, this.openProgress + delta * 1.4);
            const t = this.openProgress;

            this.lidPivot.rotation.x = Math.PI / 2 * t;

            if (this.book && t > 0.4) {
                this.book.visible = true;
            }
        }
    }

    // ================= UTILS =================

    showMessage(text) {
        const div = document.createElement('div');
        div.style.position = 'fixed';
        div.style.bottom = '22px';
        div.style.left = '50%';
        div.style.transform = 'translateX(-50%)';
        div.style.padding = '8px 16px';
        div.style.background = 'rgba(0,0,0,0.9)';
        div.style.color = '#ffd27a';
        div.style.fontFamily = 'Georgia, serif';
        div.style.fontSize = '13px';
        div.style.borderRadius = '8px';
        div.style.zIndex = '2000';
        div.textContent = text;
        document.body.appendChild(div);
        setTimeout(() => div.remove(), 2600);
    }

    cleanup() {
        this.renderer.domElement.removeEventListener('click', this.onClick);
        this.scene.remove(this.group);
    }
}