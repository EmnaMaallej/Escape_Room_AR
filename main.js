import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';

// === Scene Setup ===
const scene = new THREE.Scene();
scene.background = new THREE.Color(0x050510);
scene.fog = new THREE.Fog(0x050510, 12, 30);

const camera = new THREE.PerspectiveCamera(65, window.innerWidth / window.innerHeight, 0.1, 1000);
camera.position.set(15, 10, 15);
camera.lookAt(0, 2, 0);

const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.shadowMap.enabled = true;
document.body.appendChild(renderer.domElement);

const controls = new OrbitControls(camera, renderer.domElement);
controls.enableDamping = true;
controls.target.set(0, 2, 0);

// === Lights (BRIGHTER) ===
const ambientLight = new THREE.AmbientLight(0x3a3a5a, 0.8);
scene.add(ambientLight);

const chandelierLight = new THREE.PointLight(0xffd8b1, 5.5, 35);
chandelierLight.position.set(0, 5.5, 0);
chandelierLight.castShadow = true;
scene.add(chandelierLight);

// Additional fill light for overall brightness
const fillLight = new THREE.PointLight(0xffffff, 2.0, 20);
fillLight.position.set(0, 4, 0);
scene.add(fillLight);

// CORNER LAMPS (BRIGHTER)
const cornerLampPositions = [
    [-5, 2, -5], [5, 2, -5], [-5, 2, 5], [5, 2, 5]
];

cornerLampPositions.forEach(pos => {
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
const wallTexture = new THREE.TextureLoader().load('textures/wallpaper.jpg');
const woodTexture = new THREE.TextureLoader().load('textures/wood_floor.jpg');
const carpetTexture = new THREE.TextureLoader().load('textures/carpet.jpg');
const paintingTexture = new THREE.TextureLoader().load(
    'textures/painting.jpg',
    (texture) => {
        console.log('✅ Painting texture loaded successfully!');
    },
    undefined,
    (error) => {
        console.error('❌ Error loading painting texture:', error);
    }
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

const northWallLeft = new THREE.Mesh(new THREE.BoxGeometry(4, 6, 0.2), wallMat);
northWallLeft.position.set(-4, 3, -6);
scene.add(northWallLeft);

const northWallRight = new THREE.Mesh(new THREE.BoxGeometry(4, 6, 0.2), wallMat);
northWallRight.position.set(4, 3, -6);
scene.add(northWallRight);

const northWallTop = new THREE.Mesh(new THREE.BoxGeometry(4, 2, 0.2), wallMat);
northWallTop.position.set(0, 5, -6);
scene.add(northWallTop);

const eastWall = new THREE.Mesh(new THREE.BoxGeometry(0.2, 6, 12), wallMat);
eastWall.position.set(6, 3, 0);
scene.add(eastWall);

const southWall = new THREE.Mesh(new THREE.BoxGeometry(12, 6, 0.2), wallMat);
southWall.position.set(0, 3, 6);
scene.add(southWall);

const westWall = new THREE.Mesh(new THREE.BoxGeometry(0.2, 6, 12), wallMat);
westWall.position.set(-6, 3, 0);
scene.add(westWall);

const ceiling = new THREE.Mesh(
    new THREE.PlaneGeometry(12, 12),
    new THREE.MeshStandardMaterial({ color: 0x0a0a0a })
);
ceiling.position.y = 6;
ceiling.rotation.x = Math.PI / 2;
scene.add(ceiling);

// === CIRCULAR TABLE ===
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

// Candelabra
const candelabraBase = new THREE.Mesh(
    new THREE.CylinderGeometry(0.2, 0.25, 0.4, 8),
    new THREE.MeshStandardMaterial({ color: 0xd4af37, metalness: 0.9 })
);
candelabraBase.position.set(0, 1.3, 0);
scene.add(candelabraBase);

for (let i = 0; i < 5; i++) {
    const angle = (i / 5) * Math.PI * 2;
    const flame = new THREE.Mesh(
        new THREE.SphereGeometry(0.08, 8, 8),
        new THREE.MeshStandardMaterial({
            color: 0xffaa00,
            emissive: 0xffaa00,
            emissiveIntensity: 1
        })
    );
    flame.position.set(Math.cos(angle) * 0.4, 1.7, Math.sin(angle) * 0.4);
    scene.add(flame);
}

// === DOOR ===
const door = new THREE.Mesh(
    new THREE.BoxGeometry(1.8, 3.5, 0.15),
    new THREE.MeshStandardMaterial({ color: 0x1a0f08, roughness: 0.6 })
);
door.position.set(0, 1.75, -5.92);
door.castShadow = true;
scene.add(door);

const keypad = new THREE.Mesh(
    new THREE.BoxGeometry(0.3, 0.4, 0.08),
    new THREE.MeshStandardMaterial({
        color: 0x0a0a0a,
        emissive: 0x00ffff,
        emissiveIntensity: 0.7
    })
);
keypad.position.set(1, 1.75, -5.87);
scene.add(keypad);

// === GRANDFATHER CLOCK (DARK BROWN & WHITE CLOCK FACE) ===
const clockGroup = new THREE.Group();

// Wood materials - DARK BROWN
const darkWoodMat = new THREE.MeshStandardMaterial({
    color: 0x2b1810,
    roughness: 0.6,
    metalness: 0.1
});

const lightWoodMat = new THREE.MeshStandardMaterial({
    color: 0x3d2415,
    roughness: 0.7,
    metalness: 0.2
});

const brassAgedMat = new THREE.MeshStandardMaterial({
    color: 0xb8860b,
    roughness: 0.4,
    metalness: 0.8
});

// Main body (4.5m tall - PLUS COURT, 1.4m wide - PLUS LARGE)
const clockCase = new THREE.Mesh(
    new THREE.BoxGeometry(1.4, 4.5, 0.5),
    lightWoodMat
);
clockCase.position.y = 2.25;
clockCase.castShadow = true;
clockGroup.add(clockCase);

// Crown molding (top)
const crownMolding = new THREE.Mesh(
    new THREE.BoxGeometry(1.55, 0.25, 0.55),
    darkWoodMat
);
crownMolding.position.y = 4.625;
clockGroup.add(crownMolding);

// Decorative arch top
const archTop = new THREE.Mesh(
    new THREE.CylinderGeometry(0.7, 0.775, 0.15, 32, 1, false, 0, Math.PI),
    darkWoodMat
);
archTop.rotation.z = Math.PI;
archTop.position.set(0, 4.5, 0);
clockGroup.add(archTop);

// Finials
const centerFinial = new THREE.Mesh(
    new THREE.SphereGeometry(0.12, 16, 16),
    brassAgedMat
);
centerFinial.position.y = 4.9;
clockGroup.add(centerFinial);

[-0.5, 0.5].forEach(x => {
    const sideFinial = new THREE.Mesh(
        new THREE.ConeGeometry(0.08, 0.2, 16),
        brassAgedMat
    );
    sideFinial.position.set(x, 4.85, 0);
    clockGroup.add(sideFinial);
});

// Decorative pillars (wider spacing)
[-0.65, 0.65].forEach(x => {
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

// Upper case with clock face
const upperCase = new THREE.Mesh(
    new THREE.BoxGeometry(1.3, 1.4, 0.45),
    new THREE.MeshStandardMaterial({
        color: 0x2a1a10,
        roughness: 0.65
    })
);
upperCase.position.y = 3.55;
clockGroup.add(upperCase);

// WHITE CLOCK FACE (cercle blanc plat)
const clockFace = new THREE.Mesh(
    new THREE.CircleGeometry(0.48, 32),
    new THREE.MeshBasicMaterial({
        color: 0xffffff
    })
);
clockFace.position.set(0, 3.55, 0.24);
clockGroup.add(clockFace);

// CADRE DORÉ autour du cadran (bezel doré)
const goldenBezel = new THREE.Mesh(
    new THREE.TorusGeometry(0.48, 0.03, 16, 32),
    new THREE.MeshStandardMaterial({
        color: 0xd4af37,
        metalness: 0.9,
        roughness: 0.3
    })
);
goldenBezel.position.set(0, 3.55, 0.25);
clockGroup.add(goldenBezel);

// TOUS LES CHIFFRES 1-12
const numbers = [
    { text: '12', angle: 0 },
    { text: '1', angle: Math.PI / 6 },
    { text: '2', angle: Math.PI / 3 },
    { text: '3', angle: Math.PI / 2 },
    { text: '4', angle: 2 * Math.PI / 3 },
    { text: '5', angle: 5 * Math.PI / 6 },
    { text: '6', angle: Math.PI },
    { text: '7', angle: 7 * Math.PI / 6 },
    { text: '8', angle: 4 * Math.PI / 3 },
    { text: '9', angle: 3 * Math.PI / 2 },
    { text: '10', angle: 5 * Math.PI / 3 },
    { text: '11', angle: 11 * Math.PI / 6 }
];

numbers.forEach(({ text, angle }) => {
    const canvas = document.createElement('canvas');
    canvas.width = 64;
    canvas.height = 64;
    const ctx = canvas.getContext('2d');
    ctx.fillStyle = '#000000';
    ctx.font = 'bold 28px Arial';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(text, 32, 32);

    const texture = new THREE.CanvasTexture(canvas);
    const numeral = new THREE.Mesh(
        new THREE.PlaneGeometry(0.12, 0.12),
        new THREE.MeshBasicMaterial({ map: texture, transparent: true })
    );
    numeral.position.set(
        Math.sin(angle) * 0.36,
        3.55 + Math.cos(angle) * 0.36,
        0.26
    );
    clockGroup.add(numeral);
});

// Hour hand (BLACK)
const hourHand = new THREE.Mesh(
    new THREE.BoxGeometry(0.04, 0.22, 0.015),
    new THREE.MeshBasicMaterial({ color: 0x000000 })
);
hourHand.position.set(0, 3.66, 0.27);
clockGroup.add(hourHand);

// Minute hand (BLACK)
const minuteHand = new THREE.Mesh(
    new THREE.BoxGeometry(0.03, 0.32, 0.015),
    new THREE.MeshBasicMaterial({ color: 0x000000 })
);
minuteHand.position.set(0, 3.71, 0.27);
clockGroup.add(minuteHand);

// Glass door
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

// Pendulum
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

const bobDecoration = new THREE.Mesh(
    new THREE.TorusGeometry(0.13, 0.012, 8, 16),
    new THREE.MeshStandardMaterial({ color: 0xd4af37, metalness: 1 })
);
bobDecoration.rotation.x = Math.PI / 2;
bobDecoration.position.y = -1.5;
pendulum.add(bobDecoration);

pendulum.position.set(0, 2.5, 0.13);
clockGroup.add(pendulum);

// Base
const basePlinth = new THREE.Mesh(
    new THREE.BoxGeometry(1.5, 0.25, 0.55),
    darkWoodMat
);
basePlinth.position.y = 0.125;
clockGroup.add(basePlinth);

// Feet
[-0.7, 0.7].forEach(x => {
    const foot = new THREE.Mesh(
        new THREE.SphereGeometry(0.09, 8, 8),
        darkWoodMat
    );
    foot.position.set(x, 0.05, 0.22);
    clockGroup.add(foot);
});

// Position clock on East wall
clockGroup.position.set(5.65, 0, -2);
clockGroup.rotation.y = -Math.PI / 2;
scene.add(clockGroup);

console.log('✅ Clock: perfect white face with golden bezel and all numbers!');

// === PAINTING (SANS LUMIÈRE) ===
const painting = new THREE.Mesh(
    new THREE.PlaneGeometry(1.2, 1.6),
    new THREE.MeshStandardMaterial({
        map: paintingTexture,
        roughness: 0.3,
        emissive: 0xffffff,
        emissiveIntensity: 0.15
    })
);
painting.position.set(5.85, 3, 2);
painting.rotation.y = -Math.PI / 2;
painting.castShadow = true;
scene.add(painting);

console.log('✅ Tableau ajouté avec votre image!');

// === FAUTEUIL NOIR SOUS LE TABLEAU ===
const armchairGroup = new THREE.Group();

// Siège
const armchairSeat = new THREE.Mesh(
    new THREE.BoxGeometry(0.8, 0.15, 0.8),
    new THREE.MeshStandardMaterial({ color: 0x1a1a1a, roughness: 0.8 })
);
armchairSeat.position.y = 0.5;
armchairGroup.add(armchairSeat);

// Dossier
const armchairBack = new THREE.Mesh(
    new THREE.BoxGeometry(0.8, 0.7, 0.15),
    new THREE.MeshStandardMaterial({ color: 0x1a1a1a, roughness: 0.8 })
);
armchairBack.position.set(0, 0.85, -0.325);
armchairGroup.add(armchairBack);

// Accoudoirs (gauche et droite)
[-0.4, 0.4].forEach(x => {
    const armrest = new THREE.Mesh(
        new THREE.BoxGeometry(0.12, 0.5, 0.6),
        new THREE.MeshStandardMaterial({ color: 0x1a1a1a, roughness: 0.8 })
    );
    armrest.position.set(x, 0.65, 0);
    armchairGroup.add(armrest);
});

// Pieds (4 pieds)
[
    [-0.3, -0.3], [0.3, -0.3],
    [-0.3, 0.3], [0.3, 0.3]
].forEach(([x, z]) => {
    const leg = new THREE.Mesh(
        new THREE.CylinderGeometry(0.04, 0.04, 0.5, 8),
        new THREE.MeshStandardMaterial({ color: 0x0a0a0a, roughness: 0.5 })
    );
    leg.position.set(x, 0.25, z);
    armchairGroup.add(leg);
});

// Positionner le fauteuil sous le tableau
armchairGroup.position.set(5.2, 0, 2);
armchairGroup.rotation.y = Math.PI / 2;
armchairGroup.castShadow = true;
scene.add(armchairGroup);

console.log('✅ Fauteuil noir ajouté sous le tableau!');

// === BOOKSHELVES ===
const bookshelf1 = new THREE.Mesh(
    new THREE.BoxGeometry(4, 4, 0.5),
    new THREE.MeshStandardMaterial({ color: 0x2a1810 })
);
bookshelf1.position.set(3, 2, 5.75);
bookshelf1.castShadow = true;
scene.add(bookshelf1);

const bookshelf3 = new THREE.Mesh(
    new THREE.BoxGeometry(0.5, 3, 2.5),
    new THREE.MeshStandardMaterial({ color: 0x2a1810 })
);
bookshelf3.position.set(-5.75, 1.5, -2.5);
bookshelf3.castShadow = true;
scene.add(bookshelf3);

// === DESK WITH NOTE ===
const desk = new THREE.Mesh(
    new THREE.BoxGeometry(2.5, 0.12, 1.5),
    new THREE.MeshStandardMaterial({ color: 0x4b2e05 })
);
desk.position.set(-4, 1, 5);
desk.castShadow = true;
scene.add(desk);

// Note
const noteCanvas = document.createElement('canvas');
noteCanvas.width = 512;
noteCanvas.height = 512;
const noteCtx = noteCanvas.getContext('2d');
noteCtx.fillStyle = '#f5e6d3';
noteCtx.fillRect(0, 0, 512, 512);
noteCtx.fillStyle = '#2a1810';
noteCtx.font = 'bold 28px Georgia';
noteCtx.textAlign = 'center';
noteCtx.fillText('WARNING', 256, 80);
noteCtx.font = '20px Georgia';
noteCtx.fillText('The next time jump will', 256, 150);
noteCtx.fillText('occur in 10 minutes.', 256, 185);
noteCtx.fillText('Solve the three mechanisms', 256, 260);
noteCtx.fillText('to stabilize the portal —', 256, 295);
noteCtx.fillText('or be lost in time forever.', 256, 330);

const noteTexture = new THREE.CanvasTexture(noteCanvas);
const note = new THREE.Mesh(
    new THREE.PlaneGeometry(0.6, 0.6),
    new THREE.MeshStandardMaterial({ map: noteTexture, emissive: 0xffaa44, emissiveIntensity: 0.1 })
);
note.rotation.x = -Math.PI / 2;
note.position.set(-4, 1.07, 5);
scene.add(note);

// Desk lamp
const deskLampStand = new THREE.Mesh(
    new THREE.CylinderGeometry(0.04, 0.06, 0.5, 16),
    new THREE.MeshStandardMaterial({ color: 0xd4af37, metalness: 0.9 })
);
deskLampStand.position.set(-4.8, 1.35, 5);
scene.add(deskLampStand);

const deskLampShade = new THREE.Mesh(
    new THREE.ConeGeometry(0.15, 0.25, 16),
    new THREE.MeshStandardMaterial({
        color: 0xffe4b5,
        emissive: 0xffaa66,
        emissiveIntensity: 0.7
    })
);
deskLampShade.position.set(-4.8, 1.7, 5);
scene.add(deskLampShade);

const deskLampLight = new THREE.SpotLight(0xffaa66, 2.5, 10, Math.PI / 6);
deskLampLight.position.set(-4.8, 1.7, 5);
deskLampLight.target.position.set(-4, 1, 5);
scene.add(deskLampLight);
scene.add(deskLampLight.target);

// === CHAIR ===
const chair = new THREE.Mesh(
    new THREE.BoxGeometry(0.7, 0.9, 0.7),
    new THREE.MeshStandardMaterial({ color: 0x6b4b2a })
);
chair.position.set(-4, 0.6, 3.8);
chair.castShadow = true;
scene.add(chair);

// === GEAR BOX ===
const gearTable = new THREE.Mesh(
    new THREE.BoxGeometry(1.2, 0.12, 1.2),
    new THREE.MeshStandardMaterial({ color: 0x5a3c1a })
);
gearTable.position.set(-4.5, 0.9, 1.5);
gearTable.castShadow = true;
scene.add(gearTable);

const gearBox = new THREE.Mesh(
    new THREE.BoxGeometry(0.7, 0.25, 0.7),
    new THREE.MeshStandardMaterial({
        color: 0x8B7355,
        emissive: 0x4444ff,
        emissiveIntensity: 0.3
    })
);
gearBox.position.set(-4.5, 1.1, 1.5);
gearBox.castShadow = true;
scene.add(gearBox);

// === CHANDELIER ===
const chandelier = new THREE.Mesh(
    new THREE.CylinderGeometry(0.25, 0.35, 0.5, 8),
    new THREE.MeshStandardMaterial({ color: 0xd4af37, metalness: 0.9 })
);
chandelier.position.set(0, 5.2, 0);
scene.add(chandelier);

for (let i = 0; i < 6; i++) {
    const angle = (i / 6) * Math.PI * 2;
    const bulb = new THREE.Mesh(
        new THREE.SphereGeometry(0.12, 16, 16),
        new THREE.MeshStandardMaterial({
            color: 0xffffff,
            emissive: 0xffd8b1,
            emissiveIntensity: 1.5
        })
    );
    bulb.position.set(Math.cos(angle) * 0.6, 4.9, Math.sin(angle) * 0.6);
    scene.add(bulb);
}

// === PARTICLES ===
const particleCount = 300;
const positions = new Float32Array(particleCount * 3);
for (let i = 0; i < particleCount * 3; i += 3) {
    positions[i] = (Math.random() - 0.5) * 12;
    positions[i + 1] = Math.random() * 6;
    positions[i + 2] = (Math.random() - 0.5) * 12;
}
const particles = new THREE.Points(
    new THREE.BufferGeometry().setAttribute('position', new THREE.BufferAttribute(positions, 3)),
    new THREE.PointsMaterial({ color: 0x88aaff, size: 0.02, transparent: true, opacity: 0.5 })
);
scene.add(particles);

// === ANIMATION ===
let time = 0;
function animate() {
    requestAnimationFrame(animate);
    time += 0.01;

    chandelierLight.intensity = 5.5 + Math.sin(time * 2) * 0.8;
    keypad.material.emissiveIntensity = 0.7 + Math.sin(time * 3) * 0.3;
    gearBox.rotation.y += 0.005;

    hourHand.rotation.z += 0.00002;
    minuteHand.rotation.z += 0.0002;
    pendulum.rotation.z = Math.sin(time * 1.8) * 0.12;

    particles.rotation.y += 0.0002;
    controls.update();
    renderer.render(scene, camera);
}
animate();

window.addEventListener('resize', () => {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
});