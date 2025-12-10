import * as THREE from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';

import { ClockPuzzle } from './puzzles/puzzle1.js';
import { GearPuzzle } from './puzzles/puzzle2.js';
import { BookPuzzle } from './puzzles/puzzle3.js';
import { DoorLockPuzzle } from './puzzles/lock.js';



// === Scene Setup ===
const scene = new THREE.Scene();
scene.background = new THREE.Color(0x0a0612);
scene.fog = new THREE.Fog(0x1a1020, 10, 28);

// === Camera FPS ===
const camera = new THREE.PerspectiveCamera(
    75,
    window.innerWidth / window.innerHeight,
    0.1,
    1000
);
camera.position.set(0, 2.2, 5);
camera.rotation.order = 'YXZ';

const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.shadowMap.enabled = true;
document.body.appendChild(renderer.domElement);

// === FPS Controls ===
const moveSpeed = 0.08;
const lookSpeed = 0.002;

const keys = {
    forward: false,
    backward: false,
    left: false,
    right: false,
    sprint: false
};

let yaw = 0;
let pitch = 0;
let isPointerLocked = false;

renderer.domElement.addEventListener('click', () => {
    if (!isPointerLocked) {
        renderer.domElement.requestPointerLock();
    }
});

document.addEventListener('pointerlockchange', () => {
    isPointerLocked = document.pointerLockElement === renderer.domElement;
    if (isPointerLocked) {
        console.log('🎮 FPS mode enabled');
    } else {
        console.log('🖱️ Click to re-enter FPS mode');
    }
});

document.addEventListener('mousemove', (e) => {
    if (!isPointerLocked) return;

    yaw -= e.movementX * lookSpeed;
    pitch -= e.movementY * lookSpeed;

    pitch = Math.max(-Math.PI / 2, Math.min(Math.PI / 2, pitch));

    camera.rotation.y = yaw;
    camera.rotation.x = pitch;
});

window.addEventListener('keydown', (e) => {
    switch (e.key.toLowerCase()) {
        case 'z':
        case 'w':
            keys.forward = true;
            break;
        case 's':
            keys.backward = true;
            break;
        case 'q':
        case 'a':
            keys.left = true;
            break;
        case 'd':
            keys.right = true;
            break;
        case 'shift':
            keys.sprint = true;
            break;
    }
});

window.addEventListener('keyup', (e) => {
    switch (e.key.toLowerCase()) {
        case 'z':
        case 'w':
            keys.forward = false;
            break;
        case 's':
            keys.backward = false;
            break;
        case 'q':
        case 'a':
            keys.left = false;
            break;
        case 'd':
            keys.right = false;
            break;
        case 'shift':
            keys.sprint = false;
            break;
    }
});

function updateMovement() {
    const speed = keys.sprint ? moveSpeed * 2 : moveSpeed;
    const dir = new THREE.Vector3();

    if (keys.forward) dir.z -= 1;
    if (keys.backward) dir.z += 1;
    if (keys.left) dir.x -= 1;
    if (keys.right) dir.x += 1;

    if (dir.length() > 0) dir.normalize();

    const yawQ = new THREE.Quaternion();
    yawQ.setFromAxisAngle(new THREE.Vector3(0, 1, 0), yaw);
    dir.applyQuaternion(yawQ);

    camera.position.x += dir.x * speed;
    camera.position.z += dir.z * speed;

    camera.position.x = Math.max(-5.5, Math.min(5.5, camera.position.x));
    camera.position.z = Math.max(-5.5, Math.min(5.5, camera.position.z));
    camera.position.y = 2.2;
}

console.log('✅ FPS controls ready');

// === Lights (Enhanced Baroque Atmosphere) ===
const ambientLight = new THREE.AmbientLight(0x4a3a2a, 0.6);
scene.add(ambientLight);

const chandelierLight = new THREE.PointLight(0xffd8b1, 6.5, 35);
chandelierLight.position.set(0, 5.5, 0);
chandelierLight.castShadow = true;
chandelierLight.shadow.mapSize.width = 2048;
chandelierLight.shadow.mapSize.height = 2048;
scene.add(chandelierLight);

const fillLight = new THREE.PointLight(0xffcc99, 1.8, 20);
fillLight.position.set(0, 4, 0);
scene.add(fillLight);

// Additional warm accent light for baroque feel
const accentLight = new THREE.PointLight(0xffaa66, 2.5, 15);
accentLight.position.set(3, 3.5, -3);
scene.add(accentLight);

// Corner lamps in the corners of the room (removed left-back for desk)
const cornerLampPositions = [
    [-5, 2, -5],
    [5, 2, -5],
    [5, 2, 5]
];
cornerLampPositions.forEach((pos) => {
    const lampPost = new THREE.Mesh(
        new THREE.CylinderGeometry(0.08, 0.1, 2, 16),
        new THREE.MeshStandardMaterial({ color: 0x3d2817 })
    );
    lampPost.position.set(pos[0], 1, pos[2]);
    lampPost.castShadow = true;
    scene.add(lampPost);

    const lampShade = new THREE.Mesh(
        new THREE.ConeGeometry(0.3, 0.4, 16),
        new THREE.MeshStandardMaterial({
            color: 0xffe4b5,
            emissive: 0xffaa66,
            emissiveIntensity: 0.8
        })
    );
    lampShade.position.set(pos[0], 2.3, pos[2]);
    scene.add(lampShade);

    const lampLight = new THREE.PointLight(0xffaa66, 2.5, 12);
    lampLight.position.set(pos[0], 2, pos[2]);
    scene.add(lampLight);
});

// === Loaders ===
const textureLoader = new THREE.TextureLoader();
const gltfLoader = new GLTFLoader();

const wallTexture = textureLoader.load('textures/wallpaper.jpg');
const woodTexture = textureLoader.load('textures/wood_floor.jpg');
const carpetTexture = textureLoader.load('textures/carpet.jpg');
const paintingTexture = textureLoader.load(
    'textures/painting.jpg',
    () => console.log('✅ Painting texture loaded'),
    undefined,
    (err) => console.error('❌ Painting texture error:', err)
);

// === Room ===
const floor = new THREE.Mesh(
    new THREE.PlaneGeometry(12, 12),
    new THREE.MeshStandardMaterial({ map: woodTexture, roughness: 0.9 })
);
floor.rotation.x = -Math.PI / 2;
floor.receiveShadow = true;
scene.add(floor);

const carpet = new THREE.Mesh(
    new THREE.PlaneGeometry(7, 6),
    new THREE.MeshStandardMaterial({ map: carpetTexture, roughness: 1 })
);
carpet.rotation.x = -Math.PI / 2;
carpet.position.y = 0.01;
scene.add(carpet);

// Walls
const wallMat = new THREE.MeshStandardMaterial({
    map: wallTexture,
    roughness: 0.8,
    side: THREE.DoubleSide
});
const northWallLeft = new THREE.Mesh(
    new THREE.BoxGeometry(4, 6, 0.2),
    wallMat
);
northWallLeft.position.set(-4, 3, -6);
scene.add(northWallLeft);

const northWallRight = new THREE.Mesh(
    new THREE.BoxGeometry(4, 6, 0.2),
    wallMat
);
northWallRight.position.set(4, 3, -6);
scene.add(northWallRight);

const northWallTop = new THREE.Mesh(
    new THREE.BoxGeometry(4, 2, 0.2),
    wallMat
);
northWallTop.position.set(0, 5, -6);
scene.add(northWallTop);

const eastWall = new THREE.Mesh(
    new THREE.BoxGeometry(0.2, 6, 12),
    wallMat
);
eastWall.position.set(6, 3, 0);
scene.add(eastWall);

const southWall = new THREE.Mesh(
    new THREE.BoxGeometry(12, 6, 0.2),
    wallMat
);
southWall.position.set(0, 3, 6);
scene.add(southWall);

const westWall = new THREE.Mesh(
    new THREE.BoxGeometry(0.2, 6, 12),
    wallMat
);
westWall.position.set(-6, 3, 0);
scene.add(westWall);

const ceiling = new THREE.Mesh(
    new THREE.PlaneGeometry(12, 12),
    new THREE.MeshStandardMaterial({
        color: 0x1a1518,
        roughness: 0.7,
        metalness: 0.1
    })
);
ceiling.position.y = 6;
ceiling.rotation.x = Math.PI / 2;
ceiling.receiveShadow = true;
scene.add(ceiling);

// === MOULURES BAROQUES (Ceiling & Wall Moldings) ===
function createBaroqueMoldings() {
    const goldMoldingMat = new THREE.MeshStandardMaterial({
        color: 0xd4af37,
        metalness: 0.85,
        roughness: 0.25,
        emissive: 0x2a1800,
        emissiveIntensity: 0.15
    });

    const darkMoldingMat = new THREE.MeshStandardMaterial({
        color: 0x2a1a12,
        roughness: 0.5
    });

    // Corniche principale au plafond
    const corniches = [
        { pos: [0, 5.9, -5.9], rot: [0, 0, 0], len: 12 },
        { pos: [0, 5.9, 5.9], rot: [0, Math.PI, 0], len: 12 },
        { pos: [-5.9, 5.9, 0], rot: [0, Math.PI / 2, 0], len: 12 },
        { pos: [5.9, 5.9, 0], rot: [0, -Math.PI / 2, 0], len: 12 }
    ];

    corniches.forEach(({ pos, rot, len }) => {
        const corniche = new THREE.Mesh(
            new THREE.BoxGeometry(len, 0.15, 0.25),
            goldMoldingMat
        );
        corniche.position.set(pos[0], pos[1], pos[2]);
        corniche.rotation.set(rot[0], rot[1], rot[2]);
        scene.add(corniche);

        const lowerMolding = new THREE.Mesh(
            new THREE.BoxGeometry(len, 0.08, 0.18),
            darkMoldingMat
        );
        lowerMolding.position.set(pos[0], pos[1] - 0.12, pos[2]);
        lowerMolding.rotation.set(rot[0], rot[1], rot[2]);
        scene.add(lowerMolding);
    });

    // Médaillon central au plafond
    const medallion = new THREE.Group();

    const outerRing = new THREE.Mesh(
        new THREE.TorusGeometry(1.2, 0.08, 16, 48),
        goldMoldingMat
    );
    outerRing.rotation.x = Math.PI / 2;
    medallion.add(outerRing);

    const innerRing = new THREE.Mesh(
        new THREE.TorusGeometry(0.7, 0.05, 16, 32),
        goldMoldingMat
    );
    innerRing.rotation.x = Math.PI / 2;
    medallion.add(innerRing);

    for (let i = 0; i < 12; i++) {
        const angle = (i / 12) * Math.PI * 2;
        const petal = new THREE.Mesh(
            new THREE.BoxGeometry(0.08, 0.02, 0.35),
            goldMoldingMat
        );
        petal.position.set(
            Math.cos(angle) * 0.35,
            0,
            Math.sin(angle) * 0.35
        );
        petal.rotation.y = angle;
        medallion.add(petal);
    }

    medallion.position.set(0, 5.95, 0);
    scene.add(medallion);

    // Plinthes baroques
    const plinthes = [
        { pos: [0, 0.08, -5.85], rot: 0, len: 12 },
        { pos: [0, 0.08, 5.85], rot: 0, len: 12 },
        { pos: [-5.85, 0.08, 0], rot: Math.PI / 2, len: 12 },
        { pos: [5.85, 0.08, 0], rot: Math.PI / 2, len: 12 }
    ];

    plinthes.forEach(({ pos, rot, len }) => {
        const plinthe = new THREE.Mesh(
            new THREE.BoxGeometry(len, 0.18, 0.12),
            darkMoldingMat
        );
        plinthe.position.set(pos[0], pos[1], pos[2]);
        plinthe.rotation.y = rot;
        scene.add(plinthe);

        const goldTrim = new THREE.Mesh(
            new THREE.BoxGeometry(len, 0.03, 0.13),
            goldMoldingMat
        );
        goldTrim.position.set(pos[0], pos[1] + 0.1, pos[2]);
        goldTrim.rotation.y = rot;
        scene.add(goldTrim);
    });
}
createBaroqueMoldings();

// === BAROQUE CENTER TABLE ===
const centerTableGroup = new THREE.Group();

const tableGold = new THREE.MeshStandardMaterial({
    color: 0xd4af37,
    metalness: 0.9,
    roughness: 0.2,
    emissive: 0x2a1800,
    emissiveIntensity: 0.15
});

const tableDarkWood = new THREE.MeshStandardMaterial({
    color: 0x2a1a10,
    roughness: 0.5,
    metalness: 0.1
});

const centerTableTop = new THREE.Mesh(
    new THREE.CylinderGeometry(2, 2, 0.12, 48),
    tableDarkWood
);
centerTableTop.position.y = 1;
centerTableTop.castShadow = true;
centerTableGroup.add(centerTableTop);

const tableRim = new THREE.Mesh(
    new THREE.TorusGeometry(2.02, 0.04, 12, 48),
    tableGold
);
tableRim.rotation.x = Math.PI / 2;
tableRim.position.y = 1.06;
centerTableGroup.add(tableRim);

const tableInlay = new THREE.Mesh(
    new THREE.RingGeometry(0.3, 0.8, 32),
    tableGold
);
tableInlay.rotation.x = -Math.PI / 2;
tableInlay.position.y = 1.07;
centerTableGroup.add(tableInlay);

const centerTableLeg = new THREE.Mesh(
    new THREE.CylinderGeometry(0.35, 0.5, 0.9, 16),
    tableDarkWood
);
centerTableLeg.position.y = 0.45;
centerTableLeg.castShadow = true;
centerTableGroup.add(centerTableLeg);

for (let i = 0; i < 4; i++) {
    const ang = (i / 4) * Math.PI * 2;
    const legOrnament = new THREE.Mesh(
        new THREE.SphereGeometry(0.08, 12, 12),
        tableGold
    );
    legOrnament.position.set(
        Math.cos(ang) * 0.45,
        0.5,
        Math.sin(ang) * 0.45
    );
    centerTableGroup.add(legOrnament);
}

const tableBase = new THREE.Mesh(
    new THREE.CylinderGeometry(0.6, 0.7, 0.15, 16),
    tableDarkWood
);
tableBase.position.y = 0.075;
centerTableGroup.add(tableBase);

for (let i = 0; i < 4; i++) {
    const ang = (i / 4) * Math.PI * 2 + Math.PI / 4;
    const clawFoot = new THREE.Mesh(
        new THREE.SphereGeometry(0.1, 12, 8),
        tableGold
    );
    clawFoot.scale.set(1, 0.5, 1.5);
    clawFoot.position.set(
        Math.cos(ang) * 0.6,
        0.05,
        Math.sin(ang) * 0.6
    );
    clawFoot.rotation.y = ang;
    centerTableGroup.add(clawFoot);
}

scene.add(centerTableGroup);

// Candélabre baroque central
const candelabraGroup = new THREE.Group();

const candelabraBase = new THREE.Mesh(
    new THREE.CylinderGeometry(0.18, 0.25, 0.35, 12),
    tableGold
);
candelabraBase.position.y = 1.18;
candelabraGroup.add(candelabraBase);

const candelabraStem = new THREE.Mesh(
    new THREE.CylinderGeometry(0.05, 0.06, 0.5, 12),
    tableGold
);
candelabraStem.position.y = 1.6;
candelabraGroup.add(candelabraStem);

[1.4, 1.55, 1.7].forEach(y => {
    const ring = new THREE.Mesh(
        new THREE.TorusGeometry(0.07, 0.015, 8, 16),
        tableGold
    );
    ring.rotation.x = Math.PI / 2;
    ring.position.y = y;
    candelabraGroup.add(ring);
});

for (let i = 0; i < 5; i++) {
    const ang = (i / 5) * Math.PI * 2;

    const armLength = 0.25;
    const arm = new THREE.Mesh(
        new THREE.CylinderGeometry(0.02, 0.025, armLength, 8),
        tableGold
    );
    arm.rotation.z = Math.PI / 2;
    arm.position.set(Math.cos(ang) * armLength / 2, 1.85, Math.sin(ang) * armLength / 2);
    arm.rotation.y = ang;
    candelabraGroup.add(arm);

    const cup = new THREE.Mesh(
        new THREE.CylinderGeometry(0.06, 0.045, 0.04, 12),
        tableGold
    );
    cup.position.set(Math.cos(ang) * 0.3, 1.85, Math.sin(ang) * 0.3);
    candelabraGroup.add(cup);

    const candle = new THREE.Mesh(
        new THREE.CylinderGeometry(0.025, 0.03, 0.12, 12),
        new THREE.MeshStandardMaterial({ color: 0xfff8dc })
    );
    candle.position.set(Math.cos(ang) * 0.3, 1.93, Math.sin(ang) * 0.3);
    candelabraGroup.add(candle);

    const flame = new THREE.Mesh(
        new THREE.SphereGeometry(0.035, 8, 8),
        new THREE.MeshStandardMaterial({
            color: 0xffaa00,
            emissive: 0xffaa00,
            emissiveIntensity: 1.5
        })
    );
    flame.position.set(Math.cos(ang) * 0.3, 2.02, Math.sin(ang) * 0.3);
    flame.scale.y = 1.3;
    candelabraGroup.add(flame);
}

scene.add(candelabraGroup);

// === Escape Papers on Center Table ===
const escapePapersGroup = new THREE.Group();
escapePapersGroup.position.set(0.85, 1.08, -0.35);
scene.add(escapePapersGroup);

function makePaperMesh(textLines, options = {}) {
    const {
        w = 0.9,
        h = 0.65,
        title = 'ESCAPE PROTOCOL',
        sub = 'Confidential — Room A5',
        accent = '#8a3d00'
    } = options;

    const canvas = document.createElement('canvas');
    canvas.width = 1024;
    canvas.height = 768;
    const ctx = canvas.getContext('2d');

    ctx.fillStyle = '#f7f1e8';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    ctx.fillStyle = 'rgba(0,0,0,0.06)';
    for (let y = 80; y < canvas.height; y += 40) {
        ctx.fillRect(40, y, canvas.width - 80, 1);
    }

    ctx.fillStyle = accent;
    ctx.font = 'bold 48px Georgia';
    ctx.textAlign = 'left';
    ctx.fillText(title, 48, 70);

    ctx.fillStyle = '#444';
    ctx.font = 'italic 26px Georgia';
    ctx.fillText(sub, 48, 110);

    ctx.fillStyle = '#222';
    ctx.font = '28px Georgia';
    let yy = 170;
    textLines.forEach((line) => {
        if (line === '---') {
            yy += 16;
            return;
        }
        ctx.fillText(line, 60, yy);
        yy += 48;
    });

    ctx.save();
    ctx.translate(canvas.width - 240, canvas.height - 140);
    ctx.rotate(-0.15);
    ctx.strokeStyle = accent;
    ctx.lineWidth = 6;
    ctx.strokeRect(-150, -60, 300, 120);
    ctx.fillStyle = accent;
    ctx.font = 'bold 36px Georgia';
    ctx.textAlign = 'center';
    ctx.fillText('AUTHORIZED', 0, -10);
    ctx.fillText('PERSONNEL', 0, 30);
    ctx.restore();

    const tex = new THREE.CanvasTexture(canvas);
    tex.anisotropy = 8;
    const mat = new THREE.MeshStandardMaterial({
        map: tex,
        roughness: 0.9,
        metalness: 0.0
    });

    const mesh = new THREE.Mesh(new THREE.PlaneGeometry(w, h), mat);
    mesh.rotation.x = -Math.PI / 2;
    mesh.receiveShadow = true;
    mesh.castShadow = true;
    return mesh;
}

const instructions = [
    'When the world balances between sleep and waking,',
    'the hands find the horizon hinted close by.',
    'Shadows are longest as the light just begins to rise,',
    'and the clock remembers its truest rhythm there.'
];

const paperTop = makePaperMesh(instructions, {
    title: 'ESCAPE PROTOCOL',
    sub: 'Follow these steps precisely',
    accent: '#8a3d00',
    w: 0.92,
    h: 0.68
});
paperTop.position.set(0, 0.008, 0);
paperTop.rotation.y = 0.02;
escapePapersGroup.add(paperTop);

// Pencil
const pencil = new THREE.Group();
const pencilBody = new THREE.Mesh(
    new THREE.CylinderGeometry(0.008, 0.008, 0.22, 16),
    new THREE.MeshStandardMaterial({ color: 0xf4c542, roughness: 0.5 })
);
const pencilTip = new THREE.Mesh(
    new THREE.ConeGeometry(0.01, 0.025, 16),
    new THREE.MeshStandardMaterial({ color: 0x2a2a2a })
);
pencilTip.position.y = -0.11;
pencil.add(pencilBody, pencilTip);
pencil.rotation.x = -Math.PI / 2;
pencil.position.set(0.35, 0.012, 0.18);
pencil.rotation.z = 0.3;
escapePapersGroup.add(pencil);

const papersLight = new THREE.PointLight(0xfff2cc, 0.6, 2.2);
papersLight.position.set(0.85, 1.8, -0.35);
scene.add(papersLight);

// Hover
const paperRaycaster = new THREE.Raycaster();
const paperMouse = new THREE.Vector2();
let paperExpanded = false;
const savedPaperState = {
    pos: new THREE.Vector3(),
    rotY: 0,
    scale: 1
};
let hovering = false;

renderer.domElement.addEventListener('pointermove', (e) => {
    const rect = renderer.domElement.getBoundingClientRect();
    paperMouse.x = ((e.clientX - rect.left) / rect.width) * 2 - 1;
    paperMouse.y = -((e.clientY - rect.top) / rect.height) * 2 + 1;
});

function updateHover() {
    paperRaycaster.setFromCamera(paperMouse, camera);
    const hit = paperRaycaster.intersectObjects([paperTop], false).length > 0;

    if (hit && !hovering && !paperExpanded) {
        paperTop.material.emissive = new THREE.Color(0xffffcc);
        paperTop.material.emissiveIntensity = 0.08;
        hovering = true;
    } else if ((!hit || paperExpanded) && hovering) {
        paperTop.material.emissiveIntensity = 0.0;
        hovering = false;
    }
}

// === Door (imported GLB) ===
let door = null;

gltfLoader.load(
    '/models/door__wooden_18_mb.glb',
    (gltf) => {
        door = gltf.scene;
        door.position.set(0, 2, -5.9);
        door.rotation.y = 0;
        door.scale.set(0.7, 0.6, 0.5);

        door.traverse((child) => {
            if (child.isMesh) {
                child.castShadow = true;
                child.receiveShadow = true;
            }
        });

        scene.add(door);
        console.log('✅ Door loaded');
        initDoorPuzzle();
    },
    undefined,
    (error) => console.error('❌ Error loading door:', error)
);

// === Security Pin Pad (imported GLB) ===
let keypad = null;

gltfLoader.load(
    '/models/security_pin_pad.glb',
    (gltf) => {
        keypad = gltf.scene;
        keypad.position.set(2.8, 2, -5.85);
        keypad.rotation.y = 0;
        keypad.scale.set(0.04, 0.04, 0.04);

        keypad.traverse((child) => {
            if (child.isMesh) {
                child.castShadow = true;
                child.receiveShadow = true;
            }
        });

        scene.add(keypad);
        console.log('✅ Security Pin Pad loaded');
        initDoorPuzzle();
    },
    undefined,
    (error) => console.error('❌ Error loading keypad:', error)
);

// === Tableau à droite de la porte (altarpiece) ===
gltfLoader.load(
    '/models/altarpiece_from_preetz_right_wing.glb',
    (gltf) => {
        const tableau = gltf.scene;

        // 1) On remet la position/rotation à zéro pour travailler proprement
        tableau.position.set(0, 0, 0);
        tableau.rotation.set(0, 0, 0);

        // 2) On mesure la taille ORIGINALE
        const box = new THREE.Box3().setFromObject(tableau);
        const size = box.getSize(new THREE.Vector3());
        console.log("📏 Taille originale du tableau :", size);

        // 3) On calcule un scale pour que la hauteur ≈ 2.4 unités
        const desiredHeight = 2.4;
        const scaleFactor = desiredHeight / size.y;
        tableau.scale.setScalar(scaleFactor);
        console.log("🔍 scaleFactor utilisé :", scaleFactor);

        // 4) Après le scale, on recalcule la box et on recentre le pivot
        const boxScaled = new THREE.Box3().setFromObject(tableau);
        const center = boxScaled.getCenter(new THREE.Vector3());
        tableau.position.sub(center); // on met le pivot au centre du modèle

        // 5) Maintenant on place le tableau dans la pièce
        // Mur nord : z ≈ -5.9, porte au centre (x ≈ 0), keypad à x ≈ 2.8
        tableau.position.set(4.2, 2.4, -7.2); // à droite de la porte, un peu devant le mur

        tableau.traverse((child) => {
            if (child.isMesh) {
                child.castShadow = true;
                child.receiveShadow = true;
            }
        });

        scene.add(tableau);
        console.log('✅ Tableau (altarpiece) scaled & placed next to the door');
    },
    undefined,
    (error) => console.error('❌ Error loading tableau:', error)
);


// === Grandfather Clock (imported GLB with original hands) ===
const clockGroup = new THREE.Group();

let hourHand = null;
let minuteHand = null;
let puzzle1 = null;

gltfLoader.load(
    '/models/grandfather_clock.glb',
    (gltf) => {
        const clockModel = gltf.scene;

        // même transform qu'avant
        clockModel.scale.set(2.2, 2.2, 2.2);
        clockModel.position.set(0, 2.2, 0);

        let hourHandNode = null;
        let minuteHandNode = null;
        let clockFaceNode = null;

        clockModel.traverse((child) => {
            if (child.isMesh) {
                child.castShadow = true;
                child.receiveShadow = true;
            }

            if (child.name === 'HourHand_GR')  hourHandNode  = child;
            if (child.name === 'MinuteHand_GR') minuteHandNode = child;
            if (child.name === 'ClockFace_GR')  clockFaceNode = child;
        });

        clockModel.updateWorldMatrix(true, true);

        if (clockFaceNode && hourHandNode && minuteHandNode) {
            // 1) centre du cadran (en world)
            const faceBox = new THREE.Box3().setFromObject(clockFaceNode);
            const faceCenterWorld = new THREE.Vector3();
            faceBox.getCenter(faceCenterWorld);
            console.log('🎯 Centre cadran (world):', faceCenterWorld);

            // 2) même point en local du clockModel
            const faceCenterLocal = faceCenterWorld.clone();
            clockModel.worldToLocal(faceCenterLocal);
            console.log('🎯 Centre cadran (local clockModel):', faceCenterLocal);

            // 3) pivots au centre du cercle
            const hourPivot = new THREE.Object3D();
            const minutePivot = new THREE.Object3D();
            hourPivot.position.copy(faceCenterLocal);
            minutePivot.position.copy(faceCenterLocal);

            clockModel.add(hourPivot);
            clockModel.add(minutePivot);

            // helper pour vérifier
            const axes = new THREE.AxesHelper(0.08);
            hourPivot.add(axes);

            // 4) re-parenter les aiguilles d’origine SANS les bouger visuellement
            hourPivot.attach(hourHandNode);
            minutePivot.attach(minuteHandNode);

            // petit offset vers l'avant pour éviter le z-fighting avec le cadran
            hourHandNode.position.z += 0.002;
            minuteHandNode.position.z += 0.003;

            // le puzzle fera tourner ces pivots
            hourHand = hourPivot;
            minuteHand = minutePivot;

            console.log('✅ Aiguilles ORIGINALES centrées sur le cadran');
        } else {
            console.error(
                '❌ Parties manquantes – Hour:',
                !!hourHandNode,
                'Minute:',
                !!minuteHandNode,
                'ClockFace:',
                !!clockFaceNode
            );
            // fallback si besoin
            hourHand = hourHandNode;
            minuteHand = minuteHandNode;
        }

        clockGroup.add(clockModel);

        if (hourHand && minuteHand) {
            puzzle1 = new ClockPuzzle(
                scene,
                camera,
                renderer,
                clockGroup,
                hourHand,
                minuteHand
            );
            console.log('✅ Puzzle 1 ready avec aiguilles d’origine');
            initPuzzle2();
        }
    },
    undefined,
    (error) => console.error('Error loading clock:', error)
);

clockGroup.position.set(4.8, 0, -3.5);
clockGroup.rotation.y = -Math.PI / 2;
scene.add(clockGroup);

const clockSpot = new THREE.SpotLight(0xfff2cc, 2.6, 6, Math.PI / 10, 0.25, 1.0);
clockSpot.position.set(4.5, 4.6, -3.5);
clockSpot.target.position.set(4.8, 3.55, -3.3);
clockSpot.castShadow = true;
scene.add(clockSpot, clockSpot.target);

const faceGlow = new THREE.PointLight(0xfff2cc, 0.8, 2.4);
faceGlow.position.set(4.8, 3.55, -3.2);
scene.add(faceGlow);

// === Painting ===
const painting = new THREE.Mesh(
    new THREE.PlaneGeometry(1.8, 2.4),
    new THREE.MeshStandardMaterial({ map: paintingTexture, roughness: 0.7 })
);
painting.position.set(5.88, 3.5, 2);
painting.rotation.y = -Math.PI / 2;
painting.castShadow = true;
painting.receiveShadow = true;
scene.add(painting);

// === Victorian Lounge Sofa (imported GLB) ===
gltfLoader.load(
    '/models/victorian_lounge_sofa.glb',
    (gltf) => {
        const sofa = gltf.scene;
        sofa.position.set(5.45, 1, 2);
        sofa.rotation.y = Math.PI;
        sofa.scale.set(3, 3, 3);

        sofa.traverse((child) => {
            if (child.isMesh) {
                child.castShadow = true;
                child.receiveShadow = true;
            }
        });

        scene.add(sofa);
        console.log('✅ Victorian sofa loaded');
    },
    undefined,
    (error) => console.error('❌ Error loading sofa:', error)
);

// === Victorian Bookshelf (imported GLB) ===
gltfLoader.load(
    '/models/victorian_bookshelf.glb',
    (gltf) => {
        const bookshelf = gltf.scene;
        bookshelf.position.set(0, 0, 5.5);
        bookshelf.rotation.y = Math.PI / 2;
        bookshelf.scale.set(6, 3, 3);

        bookshelf.traverse((child) => {
            if (child.isMesh) {
                child.castShadow = true;
                child.receiveShadow = true;
            }
        });

        scene.add(bookshelf);
        console.log('✅ Victorian bookshelf loaded');
    },
    undefined,
    (error) => console.error('❌ Error loading bookshelf:', error)
);

// === Antique Desk (imported GLB) - SMALLER ===
gltfLoader.load(
    '/models/antique_desk.glb',
    (gltf) => {
        const antiqueDesk = gltf.scene;
        antiqueDesk.position.set(-5, 1.5, 4);
        antiqueDesk.rotation.y = Math.PI / 2;
        antiqueDesk.scale.set(1.8, 1.3, 0.7); // Taille équilibrée

        antiqueDesk.traverse((child) => {
            if (child.isMesh) {
                child.castShadow = true;
                child.receiveShadow = true;
            }
        });

        scene.add(antiqueDesk);
        console.log('✅ Antique desk loaded');

        const deskSpot = new THREE.SpotLight(0xffd8b1, 2.5, 6, Math.PI / 5);
        deskSpot.position.set(-4, 4, 4);
        deskSpot.target.position.set(-4, 1, 4.5);
        deskSpot.castShadow = true;
        scene.add(deskSpot, deskSpot.target);
    },
    undefined,
    (error) => console.error('❌ Error loading antique desk:', error)
);

// === Magic Mirror (imported GLB) - REPOSITIONED ===
gltfLoader.load(
    '/models/magic_mirror.glb',
    (gltf) => {
        const mirror = gltf.scene;
        mirror.scale.set(0.015, 0.015, 0.01);
        mirror.position.set(-5.8, 0.3, 1); // Déplacé vers la gauche (vers desk)
        mirror.rotation.y = Math.PI / 2;

        mirror.traverse((child) => {
            if (child.isMesh) {
                child.castShadow = true;
                child.receiveShadow = true;
            }
        });

        scene.add(mirror);
        console.log('✅ Magic mirror loaded');
    },
    undefined,
    (error) => console.error('❌ Error loading mirror:', error)
);

// === Piano (imported GLB) ===
gltfLoader.load(
    '/models/the_storyteller_piano.glb',
    (gltf) => {
        const piano = gltf.scene;
        piano.position.set(-5.2, 0, -3.5);
        piano.rotation.y = Math.PI / 2;
        piano.scale.set(0.42, 0.42, 0.42); // Taille équilibrée

        piano.traverse((child) => {
            if (child.isMesh) {
                child.castShadow = true;
                child.receiveShadow = true;
            }
        });

        scene.add(piano);
        console.log('✅ Piano loaded');

        const pianoSpot = new THREE.SpotLight(0xffd8b1, 2.5, 6, Math.PI / 8);
        pianoSpot.position.set(-5.2, 4, -3.5);
        pianoSpot.target.position.set(-5.2, 0, -3.5);
        pianoSpot.castShadow = true;
        scene.add(pianoSpot, pianoSpot.target);
    },
    undefined,
    (error) => console.error('❌ Error loading piano:', error)
);

// === ROSE DES VENTS AU SOL (Compass Rose) ===
function createCompassRose() {
    const compassGroup = new THREE.Group();

    const outerCircle = new THREE.Mesh(
        new THREE.RingGeometry(1.8, 2.0, 64),
        new THREE.MeshStandardMaterial({
            color: 0xd4af37,
            metalness: 0.8,
            roughness: 0.3,
            side: THREE.DoubleSide
        })
    );
    outerCircle.rotation.x = -Math.PI / 2;
    outerCircle.position.y = 0.012;
    compassGroup.add(outerCircle);

    const innerCircle = new THREE.Mesh(
        new THREE.RingGeometry(0.8, 1.0, 64),
        new THREE.MeshStandardMaterial({
            color: 0xd4af37,
            metalness: 0.8,
            roughness: 0.3,
            side: THREE.DoubleSide
        })
    );
    innerCircle.rotation.x = -Math.PI / 2;
    innerCircle.position.y = 0.012;
    compassGroup.add(innerCircle);

    const center = new THREE.Mesh(
        new THREE.CircleGeometry(0.25, 32),
        new THREE.MeshStandardMaterial({
            color: 0xd4af37,
            metalness: 0.9,
            roughness: 0.2,
            side: THREE.DoubleSide
        })
    );
    center.rotation.x = -Math.PI / 2;
    center.position.y = 0.013;
    compassGroup.add(center);

    const directions = 8;
    for (let i = 0; i < directions; i++) {
        const angle = (i / directions) * Math.PI * 2;
        const isCardinal = i % 2 === 0;
        const length = isCardinal ? 1.7 : 1.3;
        const width = isCardinal ? 0.15 : 0.08;

        const shape = new THREE.Shape();
        shape.moveTo(0, 0);
        shape.lineTo(-width, length * 0.3);
        shape.lineTo(0, length);
        shape.lineTo(width, length * 0.3);
        shape.closePath();

        const geometry = new THREE.ShapeGeometry(shape);
        const material = new THREE.MeshStandardMaterial({
            color: isCardinal ? 0x8B0000 : 0x2a1a10,
            metalness: 0.3,
            roughness: 0.5,
            side: THREE.DoubleSide
        });

        const point = new THREE.Mesh(geometry, material);
        point.rotation.x = -Math.PI / 2;
        point.rotation.z = -angle;
        point.position.y = 0.014;
        compassGroup.add(point);
    }

    const cardinals = [
        { text: 'N', angle: 0 },
        { text: 'E', angle: Math.PI / 2 },
        { text: 'S', angle: Math.PI },
        { text: 'W', angle: -Math.PI / 2 }
    ];

    cardinals.forEach(({ text, angle }) => {
        const canvas = document.createElement('canvas');
        canvas.width = 64;
        canvas.height = 64;
        const ctx = canvas.getContext('2d');
        ctx.fillStyle = '#d4af37';
        ctx.font = 'bold 48px Georgia';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(text, 32, 32);

        const texture = new THREE.CanvasTexture(canvas);
        const letter = new THREE.Mesh(
            new THREE.PlaneGeometry(0.25, 0.25),
            new THREE.MeshBasicMaterial({ map: texture, transparent: true, side: THREE.DoubleSide })
        );
        letter.rotation.x = -Math.PI / 2;
        letter.position.set(
            Math.sin(angle) * 1.5,
            0.015,
            -Math.cos(angle) * 1.5
        );
        compassGroup.add(letter);
    });

    compassGroup.position.set(0, 0, 0);
    scene.add(compassGroup);
}
createCompassRose();

// === LUSTRE BAROQUE ÉLABORÉ ===
const chandelierGroup = new THREE.Group();

const chandelierGold = new THREE.MeshStandardMaterial({
    color: 0xd4af37,
    metalness: 0.95,
    roughness: 0.15,
    emissive: 0x3a2800,
    emissiveIntensity: 0.2
});

const crown = new THREE.Mesh(
    new THREE.TorusGeometry(0.3, 0.05, 16, 24),
    chandelierGold
);
crown.rotation.x = Math.PI / 2;
crown.position.y = 5.6;
chandelierGroup.add(crown);

for (let i = 0; i < 8; i++) {
    const link = new THREE.Mesh(
        new THREE.TorusGeometry(0.04, 0.01, 8, 12),
        chandelierGold
    );
    link.position.y = 5.65 + i * 0.04;
    link.rotation.x = i % 2 === 0 ? 0 : Math.PI / 2;
    chandelierGroup.add(link);
}

const mainBody = new THREE.Mesh(
    new THREE.CylinderGeometry(0.2, 0.35, 0.5, 16),
    chandelierGold
);
mainBody.position.y = 5.3;
chandelierGroup.add(mainBody);

const centerBall = new THREE.Mesh(
    new THREE.SphereGeometry(0.18, 24, 24),
    chandelierGold
);
centerBall.position.y = 4.95;
chandelierGroup.add(centerBall);

const armLevels = [
    { y: 5.1, radius: 0.5, arms: 6, scale: 1 },
    { y: 4.75, radius: 0.7, arms: 6, scale: 0.85 }
];

armLevels.forEach(level => {
    for (let i = 0; i < level.arms; i++) {
        const ang = (i / level.arms) * Math.PI * 2 + (level.y === 4.75 ? Math.PI / 6 : 0);

        const armGroup = new THREE.Group();

        const arm = new THREE.Mesh(
            new THREE.CylinderGeometry(0.025, 0.03, level.radius * 1.2, 12),
            chandelierGold
        );
        arm.rotation.z = Math.PI / 2;
        arm.position.x = level.radius * 0.6;
        armGroup.add(arm);

        const cup = new THREE.Mesh(
            new THREE.CylinderGeometry(0.08, 0.06, 0.05, 12),
            chandelierGold
        );
        cup.position.set(level.radius, -0.05, 0);
        armGroup.add(cup);

        const candle = new THREE.Mesh(
            new THREE.CylinderGeometry(0.025, 0.03, 0.15, 12),
            new THREE.MeshStandardMaterial({ color: 0xfff8dc })
        );
        candle.position.set(level.radius, 0.05, 0);
        armGroup.add(candle);

        const flame = new THREE.Mesh(
            new THREE.SphereGeometry(0.04, 8, 8),
            new THREE.MeshStandardMaterial({
                color: 0xffaa00,
                emissive: 0xffcc44,
                emissiveIntensity: 2.0
            })
        );
        flame.position.set(level.radius, 0.15, 0);
        flame.scale.y = 1.4;
        armGroup.add(flame);

        armGroup.position.y = level.y;
        armGroup.rotation.y = ang;
        armGroup.scale.setScalar(level.scale);
        chandelierGroup.add(armGroup);
    }
});

const finalDrop = new THREE.Mesh(
    new THREE.ConeGeometry(0.08, 0.2, 16),
    new THREE.MeshStandardMaterial({
        color: 0xaaddff,
        transparent: true,
        opacity: 0.8,
        metalness: 0.2,
        roughness: 0.1
    })
);
finalDrop.position.y = 4.65;
finalDrop.rotation.x = Math.PI;
chandelierGroup.add(finalDrop);

for (let i = 0; i < 8; i++) {
    const ang = (i / 8) * Math.PI * 2;
    const crystal = new THREE.Mesh(
        new THREE.OctahedronGeometry(0.04),
        new THREE.MeshStandardMaterial({
            color: 0xffffff,
            transparent: true,
            opacity: 0.7,
            metalness: 0.1,
            roughness: 0.05
        })
    );
    crystal.position.set(
        Math.cos(ang) * 0.25,
        4.85,
        Math.sin(ang) * 0.25
    );
    crystal.scale.y = 2;
    chandelierGroup.add(crystal);
}

scene.add(chandelierGroup);

// === Puzzle 2 Box (GearPuzzle) ===
let puzzle3 = null;
let puzzle2 = null;
let puzzle4 = null;

function initPuzzle2() {
    if (puzzle2) return;

    puzzle2 = new GearPuzzle(scene, camera, renderer, puzzle1, {
        onSolved: (bookMesh) => {
            console.log('📖 Puzzle 2 solved – logbook ready!');
            if (bookMesh && !puzzle3) {
                puzzle3 = new BookPuzzle(scene, camera, renderer, bookMesh, true);
                console.log('📚 Book Puzzle created!');
            }
        }
    });
    console.log('✅ Puzzle 2 initialized');
}

function initDoorPuzzle() {
    if (puzzle4 || !door || !keypad) return;

    puzzle4 = new DoorLockPuzzle(scene, camera, renderer, door, keypad, {
        code: '4619',
        onUnlocked: () => {
            console.log('🎉 ESCAPE SUCCESSFUL!');

            const victoryDiv = document.createElement('div');
            victoryDiv.style.cssText = 'position:fixed;top:50%;left:50%;transform:translate(-50%,-50%);padding:30px;background:rgba(0,0,0,0.95);color:#00ff00;font-size:32px;font-family:Georgia,serif;border-radius:15px;border:3px solid #00ff00;z-index:5000;';
            victoryDiv.textContent = '🎉 YOU ESCAPED! 🎉';
            document.body.appendChild(victoryDiv);
        }
    });
    console.log('✅ Puzzle 4 (Door Lock) initialized');
}

console.log('✅ Puzzle system ready!');

// === Animation Loop ===
const clock = new THREE.Clock();
let time = 0;

function animate() {
    requestAnimationFrame(animate);
    const delta = clock.getDelta();
    time += delta;

    updateMovement();

    chandelierLight.intensity = 6.5 + Math.sin(time * 2) * 0.9 + Math.sin(time * 5) * 0.3;
    fillLight.intensity = 1.8 + Math.sin(time * 1.5) * 0.2;
    accentLight.intensity = 2.5 + Math.sin(time * 3) * 0.4;

    updateHover();
    if (puzzle2) puzzle2.update(delta);
    if (puzzle4) puzzle4.update(delta);

    renderer.render(scene, camera);
}
animate();

window.addEventListener('resize', () => {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
});