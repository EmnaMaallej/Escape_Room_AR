import * as THREE from 'three';
import { ClockPuzzle } from './puzzles/puzzle1.js';
import { GearPuzzle } from './puzzles/puzzle2.js';
import { BookPuzzle } from './puzzles/puzzle3.js';
import { DoorLockPuzzle } from './puzzles/lock.js';



// === Scene Setup ===
const scene = new THREE.Scene();
scene.background = new THREE.Color(0x050510);
scene.fog = new THREE.Fog(0x050510, 12, 30);

// === Camera FPS ===
const camera = new THREE.PerspectiveCamera(
    75,
    window.innerWidth / window.innerHeight,
    0.1,
    1000
);
camera.position.set(0, 1.7, 5);
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
    camera.position.y = 1.7;
}

console.log('✅ FPS controls ready');

// === Lights ===
const ambientLight = new THREE.AmbientLight(0x3a3a5a, 0.8);
scene.add(ambientLight);

const chandelierLight = new THREE.PointLight(0xffd8b1, 5.5, 35);
chandelierLight.position.set(0, 5.5, 0);
chandelierLight.castShadow = true;
scene.add(chandelierLight);

const fillLight = new THREE.PointLight(0xffffff, 2.0, 20);
fillLight.position.set(0, 4, 0);
scene.add(fillLight);

// Corner lamps
const cornerLampPositions = [
    [-5, 2, -5],
    [5, 2, -5],
    [-5, 2, 5],
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

// === Textures ===
const loader = new THREE.TextureLoader();
const wallTexture = loader.load('textures/wallpaper.jpg');
const woodTexture = loader.load('textures/wood_floor.jpg');
const carpetTexture = loader.load('textures/carpet.jpg');
const paintingTexture = loader.load(
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
    new THREE.MeshStandardMaterial({ color: 0x0a0a0a })
);
ceiling.position.y = 6;
ceiling.rotation.x = Math.PI / 2;
scene.add(ceiling);

// === Center Table & Candelabra ===
const centerTableTop = new THREE.Mesh(
    new THREE.CylinderGeometry(2, 2, 0.15, 32),
    new THREE.MeshStandardMaterial({ color: 0x4a3c1a, roughness: 0.7 })
);
centerTableTop.position.set(0, 1, 0);
centerTableTop.castShadow = true;
scene.add(centerTableTop);

const centerTableLeg = new THREE.Mesh(
    new THREE.CylinderGeometry(0.4, 0.5, 1, 16),
    new THREE.MeshStandardMaterial({ color: 0x3d2817 })
);
centerTableLeg.position.set(0, 0.5, 0);
centerTableLeg.castShadow = true;
scene.add(centerTableLeg);

const candelabraBase = new THREE.Mesh(
    new THREE.CylinderGeometry(0.2, 0.25, 0.4, 8),
    new THREE.MeshStandardMaterial({ color: 0xd4af37, metalness: 0.9 })
);
candelabraBase.position.set(0, 1.3, 0);
scene.add(candelabraBase);

for (let i = 0; i < 5; i++) {
    const ang = (i / 5) * Math.PI * 2;
    const flame = new THREE.Mesh(
        new THREE.SphereGeometry(0.08, 8, 8),
        new THREE.MeshStandardMaterial({
            color: 0xffaa00,
            emissive: 0xffaa00,
            emissiveIntensity: 1
        })
    );
    flame.position.set(Math.cos(ang) * 0.4, 1.7, Math.sin(ang) * 0.4);
    scene.add(flame);
}

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

// Hover (visuel seulement)
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

// (si tu veux réactiver l’agrandissement, tu peux remettre un listener click ici)

// === Door & Keypad placeholder ===
const door = new THREE.Mesh(
    new THREE.BoxGeometry(1.8, 3.5, 0.15),
    new THREE.MeshStandardMaterial({ color: 0x1a0f08, roughness: 0.6 })
);
door.position.set(0, 1.75, -5.92);
door.castShadow = true;
scene.add(door);

const keypad = new THREE.Mesh(
    new THREE.BoxGeometry(0.3, 0.4, 0.08),
    new THREE.MeshStandardMaterial({ color: 0x111111 })
);
keypad.position.set(1, 1.75, -5.87);
scene.add(keypad);

// === Grandfather Clock ===
const clockGroup = new THREE.Group();
const darkWoodMat = new THREE.MeshStandardMaterial({
    color: 0x3d2817,
    roughness: 0.6,
    metalness: 0.1
});
const lightWoodMat = new THREE.MeshStandardMaterial({
    color: 0x5a3c1a,
    roughness: 0.7,
    metalness: 0.2
});
const brassAgedMat = new THREE.MeshStandardMaterial({
    color: 0xb8860b,
    roughness: 0.4,
    metalness: 0.8
});

const clockCase = new THREE.Mesh(
    new THREE.BoxGeometry(1.4, 4.5, 0.5),
    lightWoodMat
);
clockCase.position.y = 2.25;
clockCase.castShadow = true;
clockGroup.add(clockCase);

const crownMolding = new THREE.Mesh(
    new THREE.BoxGeometry(1.55, 0.25, 0.55),
    darkWoodMat
);
crownMolding.position.y = 4.625;
clockGroup.add(crownMolding);

const archTop = new THREE.Mesh(
    new THREE.CylinderGeometry(0.7, 0.775, 0.15, 32, 1, false, 0, Math.PI),
    darkWoodMat
);
archTop.rotation.z = Math.PI;
archTop.position.set(0, 4.5, 0);
clockGroup.add(archTop);

const centerFinial = new THREE.Mesh(
    new THREE.SphereGeometry(0.12, 16, 16),
    brassAgedMat
);
centerFinial.position.y = 4.9;
clockGroup.add(centerFinial);

[-0.5, 0.5].forEach((x) => {
    const sideFinial = new THREE.Mesh(
        new THREE.ConeGeometry(0.08, 0.2, 16),
        brassAgedMat
    );
    sideFinial.position.set(x, 4.85, 0);
    clockGroup.add(sideFinial);
});

[-0.65, 0.65].forEach((x) => {
    const column = new THREE.Mesh(
        new THREE.CylinderGeometry(0.06, 0.06, 4, 12),
        darkWoodMat
    );
    column.position.set(x, 2.25, 0.22);
    clockGroup.add(column);

    const capital = new THREE.Mesh(
        new THREE.BoxGeometry(0.13, 0.15, 0.13),
        brassAgedMat
    );
    capital.position.set(x, 4.25, 0.22);
    clockGroup.add(capital);

    const base = new THREE.Mesh(
        new THREE.BoxGeometry(0.13, 0.15, 0.13),
        brassAgedMat
    );
    base.position.set(x, 0.25, 0.22);
    clockGroup.add(base);
});

const upperCase = new THREE.Mesh(
    new THREE.BoxGeometry(1.3, 1.4, 0.45),
    new THREE.MeshStandardMaterial({
        color: 0x4a3520,
        roughness: 0.65
    })
);
upperCase.position.y = 3.55;
clockGroup.add(upperCase);

const clockFace = new THREE.Mesh(
    new THREE.CircleGeometry(0.5, 32),
    new THREE.MeshStandardMaterial({
        color: 0xfffffa,
        emissive: 0xfffbea,
        emissiveIntensity: 0.25,
        roughness: 0.4
    })
);
clockFace.position.set(0, 3.55, 0.24);
clockGroup.add(clockFace);

const bezel = new THREE.Mesh(
    new THREE.TorusGeometry(0.5, 0.04, 16, 32),
    brassAgedMat
);
bezel.position.set(0, 3.55, 0.25);
clockGroup.add(bezel);

// Numerals
const numeralPositions = [
    { text: 'XII', angle: 0 },
    { text: 'III', angle: Math.PI / 2 },
    { text: 'VI', angle: Math.PI },
    { text: 'IX', angle: -Math.PI / 2 }
];
numeralPositions.forEach(({ text, angle }) => {
    const c = document.createElement('canvas');
    c.width = 64;
    c.height = 64;
    const ctx = c.getContext('2d');
    ctx.fillStyle = '#2a1810';
    ctx.font = 'bold 32px Georgia';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(text, 32, 32);
    const tex = new THREE.CanvasTexture(c);

    const numeral = new THREE.Mesh(
        new THREE.PlaneGeometry(0.13, 0.13),
        new THREE.MeshBasicMaterial({ map: tex, transparent: true })
    );
    numeral.position.set(
        Math.sin(angle) * 0.35,
        3.55 + Math.cos(angle) * 0.35,
        0.26
    );
    clockGroup.add(numeral);
});

// Hands
const goldHandMat = new THREE.MeshStandardMaterial({
    color: 0xffd700,
    emissive: 0xffaa00,
    emissiveIntensity: 0.6,
    metalness: 0.9,
    roughness: 0.2
});

const hourHandGroup = new THREE.Group();
const hourBody = new THREE.Mesh(
    new THREE.BoxGeometry(0.04, 0.22, 0.02),
    goldHandMat
);
hourBody.position.y = 0.11;
hourHandGroup.add(hourBody);
const hourTip = new THREE.Mesh(
    new THREE.ConeGeometry(0.025, 0.08, 3),
    goldHandMat
);
hourTip.rotation.z = Math.PI;
hourTip.position.y = 0.26;
hourHandGroup.add(hourTip);
hourHandGroup.position.set(0, 3.55, 0.27);
hourHandGroup.castShadow = true;
clockGroup.add(hourHandGroup);

const minuteHandGroup = new THREE.Group();
const minuteBody = new THREE.Mesh(
    new THREE.BoxGeometry(0.03, 0.32, 0.02),
    goldHandMat
);
minuteBody.position.y = 0.16;
minuteHandGroup.add(minuteBody);
const minuteTip = new THREE.Mesh(
    new THREE.ConeGeometry(0.02, 0.1, 3),
    goldHandMat
);
minuteTip.rotation.z = Math.PI;
minuteTip.position.y = 0.37;
minuteHandGroup.add(minuteTip);
minuteHandGroup.position.set(0, 3.55, 0.28);
minuteHandGroup.castShadow = true;
clockGroup.add(minuteHandGroup);

const centerDot = new THREE.Mesh(
    new THREE.CylinderGeometry(0.04, 0.04, 0.03, 16),
    goldHandMat
);
centerDot.rotation.x = Math.PI / 2;
centerDot.position.set(0, 3.55, 0.29);
clockGroup.add(centerDot);

// Glass & pendulum
const glassFrame = new THREE.Mesh(
    new THREE.BoxGeometry(1.15, 2.5, 0.08),
    darkWoodMat
);
glassFrame.position.set(0, 1.5, 0.21);
clockGroup.add(glassFrame);

const glassDoor = new THREE.Mesh(
    new THREE.PlaneGeometry(1, 2.3),
    new THREE.MeshPhysicalMaterial({
        color: 0x9ab8c0,
        transparent: true,
        opacity: 0.25,
        transmission: 0.85,
        roughness: 0.15
    })
);
glassDoor.position.set(0, 1.5, 0.23);
clockGroup.add(glassDoor);

const pendulum = new THREE.Group();
const pendulumRod = new THREE.Mesh(
    new THREE.CylinderGeometry(0.018, 0.018, 1.5, 8),
    brassAgedMat
);
pendulumRod.position.y = -0.75;
pendulum.add(pendulumRod);
const pendulumBob = new THREE.Mesh(
    new THREE.CylinderGeometry(0.2, 0.2, 0.1, 32),
    brassAgedMat
);
pendulumBob.position.y = -1.5;
pendulum.add(pendulumBob);
const bobDeco = new THREE.Mesh(
    new THREE.TorusGeometry(0.13, 0.012, 8, 16),
    new THREE.MeshStandardMaterial({ color: 0xd4af37, metalness: 1 })
);
bobDeco.rotation.x = Math.PI / 2;
bobDeco.position.y = -1.5;
pendulum.add(bobDeco);
pendulum.position.set(0, 2.5, 0.13);
clockGroup.add(pendulum);

// Base & feet
const basePlinth = new THREE.Mesh(
    new THREE.BoxGeometry(1.5, 0.25, 0.55),
    darkWoodMat
);
basePlinth.position.y = 0.125;
clockGroup.add(basePlinth);
[-0.7, 0.7].forEach((x) => {
    const foot = new THREE.Mesh(
        new THREE.SphereGeometry(0.09, 8, 8),
        darkWoodMat
    );
    foot.position.set(x, 0.05, 0.22);
    clockGroup.add(foot);
});

clockGroup.position.set(5.65, 0, -2);
clockGroup.rotation.y = -Math.PI / 2;
scene.add(clockGroup);

const clockSpot = new THREE.SpotLight(
    0xfff2cc,
    2.6,
    6,
    Math.PI / 10,
    0.25,
    1.0
);
clockSpot.position.set(5.2, 4.6, -2);
clockSpot.target.position.set(5.65, 3.55, -1.8);
clockSpot.castShadow = true;
scene.add(clockSpot, clockSpot.target);

const faceGlow = new THREE.PointLight(0xfff2cc, 0.8, 2.4);
faceGlow.position.set(5.65, 3.55, -1.7);
scene.add(faceGlow);

// Puzzle 1 init
const hourHand = hourHandGroup;
const minuteHand = minuteHandGroup;
const puzzle1 = new ClockPuzzle(
    scene,
    camera,
    renderer,
    clockGroup,
    hourHand,
    minuteHand
);

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

// === Sofa ===
const sofaGroup = new THREE.Group();
const sofaFabric = new THREE.MeshStandardMaterial({
    color: 0x1a1a1a,
    roughness: 0.8
});
const sofaWood = new THREE.MeshStandardMaterial({
    color: 0x2a2a2a,
    roughness: 0.6
});

const sofaSeat = new THREE.Mesh(
    new THREE.BoxGeometry(2.8, 0.6, 1.1),
    sofaFabric
);
sofaSeat.position.y = 0.6;
sofaSeat.castShadow = true;
sofaGroup.add(sofaSeat);

const sofaBack = new THREE.Mesh(
    new THREE.BoxGeometry(2.8, 1.1, 0.25),
    sofaFabric
);
sofaBack.position.set(0, 1.25, -0.425);
sofaBack.castShadow = true;
sofaGroup.add(sofaBack);

const cushionGeom = new THREE.BoxGeometry(1.3, 1.0, 0.18);
[-0.7, 0.7].forEach((x) => {
    const cushion = new THREE.Mesh(cushionGeom, sofaFabric);
    cushion.position.set(x, 1.05, -0.32);
    cushion.castShadow = true;
    sofaGroup.add(cushion);
});

const seatCushionGeom = new THREE.BoxGeometry(1.3, 0.35, 1.05);
[-0.7, 0.7].forEach((x) => {
    const sc = new THREE.Mesh(seatCushionGeom, sofaFabric);
    sc.position.set(x, 0.75, 0);
    sc.castShadow = true;
    sofaGroup.add(sc);
});

const armLeft = new THREE.Mesh(
    new THREE.BoxGeometry(0.25, 1.0, 1.1),
    sofaFabric
);
armLeft.position.set(-1.5, 1.2, 0);
armLeft.castShadow = true;
sofaGroup.add(armLeft);

const armRight = new THREE.Mesh(
    new THREE.BoxGeometry(0.25, 1.0, 1.1),
    sofaFabric
);
armRight.position.set(1.5, 1.2, 0);
armRight.castShadow = true;
sofaGroup.add(armRight);

const footGeom = new THREE.CylinderGeometry(0.06, 0.06, 0.25, 12);
[
    [-1.3, 0.125, 0.45],
    [1.3, 0.125, 0.45],
    [-1.3, 0.125, -0.45],
    [1.3, 0.125, -0.45]
].forEach((p) => {
    const f = new THREE.Mesh(footGeom, sofaWood);
    f.position.set(p[0], p[1], p[2]);
    f.castShadow = true;
    sofaGroup.add(f);
});

sofaGroup.position.set(5.45, 0, 2);
sofaGroup.rotation.y = -Math.PI / 2;
scene.add(sofaGroup);

// === Bookcase (unchanged, purely décor) ===
// (reprend ton code existant pour la bibliothèque)

const bookcase = new THREE.Group();
bookcase.position.set(3, 0, 5.75);
scene.add(bookcase);

const shelfWidth = 4;
const shelfHeight = 4;
const shelfDepth = 0.5;
const wood = new THREE.MeshStandardMaterial({
    color: 0x2a1810,
    roughness: 0.7
});
const brass = new THREE.MeshStandardMaterial({
    color: 0xd4af37,
    metalness: 0.9,
    roughness: 0.25
});

const back = new THREE.Mesh(
    new THREE.BoxGeometry(shelfWidth, shelfHeight, 0.05),
    new THREE.MeshStandardMaterial({
        color: 0x1e120b,
        roughness: 0.9
    })
);
back.position.set(0, shelfHeight / 2, -shelfDepth / 2 + 0.025);
bookcase.add(back);

const sideL = new THREE.Mesh(
    new THREE.BoxGeometry(0.15, shelfHeight, shelfDepth),
    wood
);
sideL.position.set(-shelfWidth / 2 + 0.075, shelfHeight / 2, 0);
bookcase.add(sideL);

const sideR = sideL.clone();
sideR.position.x = shelfWidth / 2 - 0.075;
bookcase.add(sideR);

const topShelf = new THREE.Mesh(
    new THREE.BoxGeometry(shelfWidth, 0.12, shelfDepth),
    wood
);
topShelf.position.set(0, shelfHeight - 0.06, 0);
bookcase.add(topShelf);

const bottomShelf = new THREE.Mesh(
    new THREE.BoxGeometry(shelfWidth, 0.12, shelfDepth),
    wood
);
bottomShelf.position.set(0, 0.06, 0);
bookcase.add(bottomShelf);

[1.0, 2.0, 3.0].forEach((y) => {
    const shelf = new THREE.Mesh(
        new THREE.BoxGeometry(shelfWidth - 0.2, 0.08, shelfDepth - 0.05),
        wood
    );
    shelf.position.set(0, y, 0);
    bookcase.add(shelf);
});

function leatherColor() {
    const hues = [
        0x5a2e1a,
        0x7a4a2a,
        0x2f3b4a,
        0x3d2b1f,
        0x6a3f2b,
        0x2a2a2a,
        0x4a2f2f,
        0x304035
    ];
    return hues[Math.floor(Math.random() * hues.length)];
}

function addStandingBook(x, y, z, h, w = 0.15, d = 0.22) {
    const book = new THREE.Mesh(
        new THREE.BoxGeometry(w, h, d),
        new THREE.MeshStandardMaterial({
            color: leatherColor(),
            roughness: 0.6
        })
    );
    book.position.set(x, y + h / 2, z);
    book.rotation.y = (Math.random() - 0.5) * 0.12;
    book.castShadow = true;
    bookcase.add(book);
}

function addStack(x, y, z, n = 3) {
    let yy = y + 0.05;
    for (let i = 0; i < n; i++) {
        const h = 0.06 + Math.random() * 0.05;
        const w = 0.18 + Math.random() * 0.06;
        const b = new THREE.Mesh(
            new THREE.BoxGeometry(w, h, 0.24),
            new THREE.MeshStandardMaterial({
                color: leatherColor(),
                roughness: 0.65
            })
        );
        b.position.set(x, yy + h / 2, z);
        b.castShadow = true;
        bookcase.add(b);
        yy += h + 0.01;
    }
}

const zRow = 0.18;
[
    -1.7,
    -1.35,
    -1.0,
    -0.65,
    -0.3,
    0.05,
    0.4,
    0.75,
    1.1,
    1.45,
    1.8
].forEach((x) => {
    addStandingBook(x, 0.12, -zRow, 0.5 + Math.random() * 0.35);
    addStandingBook(x, 1.12, -zRow, 0.55 + Math.random() * 0.3);
    addStandingBook(x, 2.12, -zRow, 0.5 + Math.random() * 0.35);
    addStandingBook(x, 3.12, -zRow, 0.45 + Math.random() * 0.25);
});
addStack(-1.9, 1.0, -0.12, 3);
addStack(1.85, 2.0, -0.12, 4);

// === Desk ===
const desk = new THREE.Mesh(
    new THREE.BoxGeometry(2.5, 0.12, 1.5),
    new THREE.MeshStandardMaterial({ color: 0x4b2e05 })
);
desk.position.set(-4, 1, 5);
desk.castShadow = true;
scene.add(desk);

// Pieds du bureau
const deskGroup = new THREE.Group();
const legGeom = new THREE.BoxGeometry(0.1, 0.9, 0.1);
const legMat = new THREE.MeshStandardMaterial({
    color: 0x3a2204,
    roughness: 0.7
});
[
    [-5.2, 0.45, 4.25],
    [-5.2, 0.45, 5.75],
    [-2.8, 0.45, 4.25],
    [-2.8, 0.45, 5.75]
].forEach((p) => {
    const leg = new THREE.Mesh(legGeom, legMat);
    leg.position.set(p[0], p[1], p[2]);
    leg.castShadow = true;
    deskGroup.add(leg);
});
scene.add(deskGroup);
// Note on desk
function createDeskNote(scene) {
    const canvas = document.createElement('canvas');
    canvas.width = 1024;
    canvas.height = 512;
    const ctx = canvas.getContext('2d');

    ctx.fillStyle = '#f5e6d3';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    ctx.fillStyle = '#2a1810';
    ctx.font = 'bold 48px Georgia';
    ctx.textAlign = 'left';
    ctx.fillText('GEAR LOCKBOX — A5', 40, 70);

    ctx.font = '32px Georgia';
    ctx.fillText('Only a recovered cog may wake the lock.', 40, 140);
    ctx.fillText('Seat it within the golden ring.', 40, 190);
    ctx.fillText('Then align both dials to their markers', 40, 240);
    ctx.fillText('to reveal what lies within.', 40, 290);

    ctx.font = 'italic 30px Georgia';
    ctx.fillText('"Time unveils what brass conceals."', 40, 370);

    const texture = new THREE.CanvasTexture(canvas);

    const note = new THREE.Mesh(
        new THREE.PlaneGeometry(0.9, 0.45),
        new THREE.MeshStandardMaterial({
            map: texture,
            roughness: 0.95,
            side: THREE.DoubleSide
        })
    );
    note.scale.set(0.6, 1, 1);
    note.rotation.set(Math.PI / 2, Math.PI, 0);
    note.position.set(-3.15, 1.081, 4.62);
    note.receiveShadow = true;
    scene.add(note);
}
createDeskNote(scene);



// Desk lamp (spot)
const deskLampLight = new THREE.SpotLight(
    0xffaa66,
    2.5,
    10,
    Math.PI / 6
);
deskLampLight.position.set(-4.8, 1.7, 5);
deskLampLight.target.position.set(-4, 1.05, 5);
scene.add(deskLampLight, deskLampLight.target);

// Chair
const chair = new THREE.Mesh(
    new THREE.BoxGeometry(0.7, 0.9, 0.7),
    new THREE.MeshStandardMaterial({ color: 0x6b4b2a })
);
chair.position.set(-4, 0.6, 3.8);
chair.castShadow = true;
scene.add(chair);

// Chandelier top
const chandelier = new THREE.Mesh(
    new THREE.CylinderGeometry(0.25, 0.35, 0.5, 8),
    new THREE.MeshStandardMaterial({ color: 0xd4af37, metalness: 0.9 })
);
chandelier.position.set(0, 5.2, 0);
scene.add(chandelier);
for (let i = 0; i < 6; i++) {
    const ang = (i / 6) * Math.PI * 2;
    const bulb = new THREE.Mesh(
        new THREE.SphereGeometry(0.12, 16, 16),
        new THREE.MeshStandardMaterial({
            color: 0xffffff,
            emissive: 0xffd8b1,
            emissiveIntensity: 1.5
        })
    );
    bulb.position.set(Math.cos(ang) * 0.6, 4.9, Math.sin(ang) * 0.6);
    scene.add(bulb);
}

// === Puzzle 2 Box (GearPuzzle) ===
let puzzle3 = null; // Déclaration pour Puzzle 3

const puzzle2 = new GearPuzzle(scene, camera, renderer, puzzle1, {
    onSolved: (bookMesh) => {
        console.log('📖 Puzzle 2 solved – logbook ready!');

        // Initialiser Puzzle 3 quand le livre apparaît
        if (bookMesh && !puzzle3) {
            puzzle3 = new BookPuzzle(scene, camera, renderer, bookMesh, true);
            console.log('📚 Book Puzzle created and opened IMMEDIATELY!');
        }
    }
});

// === Puzzle 4 - Door Lock ===
const puzzle4 = new DoorLockPuzzle(scene, camera, renderer, door, keypad, {
    code: '4619',
    onUnlocked: () => {
        console.log('🎉 ESCAPE SUCCESSFUL!');

        const victoryDiv = document.createElement('div');
        victoryDiv.style.position = 'fixed';
        victoryDiv.style.top = '50%';
        victoryDiv.style.left = '50%';
        victoryDiv.style.transform = 'translate(-50%, -50%)';
        victoryDiv.style.padding = '30px';
        victoryDiv.style.background = 'rgba(0,0,0,0.95)';
        victoryDiv.style.color = '#00ff00';
        victoryDiv.style.fontSize = '32px';
        victoryDiv.style.fontFamily = 'Georgia, serif';
        victoryDiv.style.borderRadius = '15px';
        victoryDiv.style.border = '3px solid #00ff00';
        victoryDiv.style.zIndex = '5000';
        victoryDiv.textContent = '🎉 YOU ESCAPED! 🎉';
        document.body.appendChild(victoryDiv);
    }
});

console.log('✅ All puzzles initialized!');

// === Animation Loop ===
const clock = new THREE.Clock();
let time = 0;

function animate() {
    requestAnimationFrame(animate);
    const delta = clock.getDelta();
    time += delta;

    updateMovement();

    chandelierLight.intensity = 5.5 + Math.sin(time * 2) * 0.8;
    pendulum.rotation.z = Math.sin(time * 1.8) * 0.12;

    updateHover();
    puzzle2.update(delta);

    renderer.render(scene, camera);
}
animate();

window.addEventListener('resize', () => {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
});
