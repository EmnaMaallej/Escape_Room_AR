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
const loader = new THREE.TextureLoader();
const wallTexture = loader.load('textures/wallpaper.jpg');
const woodTexture = loader.load('textures/wood_floor.jpg');
const carpetTexture = loader.load('textures/carpet.jpg');
const paintingTexture = loader.load(
  'textures/painting.jpg',
  () => console.log('✅ Painting texture loaded successfully!'),
  undefined,
  (error) => console.error('❌ Error loading painting texture:', error)
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

// === Center Circular Table ===
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

// === Papers with Instructions (moved BESIDE lamp) ===
const escapePapersGroup = new THREE.Group();
escapePapersGroup.position.set(0.85, 1.08, -0.35); // beside the lamp, not under it
scene.add(escapePapersGroup);

function makePaperMesh(textLines, options = {}) {
  const {
    w = 0.9, h = 0.65,
    title = 'ESCAPE PROTOCOL',
    sub = 'Confidential — Room A5',
    accent = '#8a3d00'
  } = options;

  const canvas = document.createElement('canvas');
  canvas.width = 1024; canvas.height = 768;
  const ctx = canvas.getContext('2d');

  // Paper background & lines
  ctx.fillStyle = '#f7f1e8';
  ctx.fillRect(0, 0, canvas.width, canvas.height);
  ctx.fillStyle = 'rgba(0,0,0,0.06)';
  for (let y = 80; y < canvas.height; y += 40) ctx.fillRect(40, y, canvas.width - 80, 1);

  // Header
  ctx.fillStyle = accent;
  ctx.font = 'bold 48px Georgia';
  ctx.textAlign = 'left';
  ctx.fillText(title, 48, 70);
  ctx.fillStyle = '#444';
  ctx.font = 'italic 26px Georgia';
  ctx.fillText(sub, 48, 110);

  // Body
  ctx.fillStyle = '#222';
  ctx.font = '28px Georgia';
  let yy = 170, li = 1;
  textLines.forEach(line => {
    if (line === '---') { yy += 16; return; }
    ctx.fillText(`${li}. ${line}`, 60, yy);
    yy += 48; li++;
  });

  // Stamp
  ctx.save();
  ctx.translate(canvas.width - 240, canvas.height - 140);
  ctx.rotate(-0.15);
  ctx.strokeStyle = accent; ctx.lineWidth = 6;
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
    map: tex, roughness: 0.9, metalness: 0.0, emissive: 0x000000, emissiveIntensity: 0.0
  });
  const mesh = new THREE.Mesh(new THREE.PlaneGeometry(w, h), mat);
  mesh.rotation.x = -Math.PI / 2;
  mesh.receiveShadow = true; mesh.castShadow = true;
  return mesh;
}

const instructions = [
  'Inspect the grandfather clock — note the bright dial.',
  'Set the clock hands to 10:15 using the hint hidden nearby.',
  'Open the desk drawers: collect the brass token & note fragment.',
  'Assemble the 3 note fragments to reveal a 4-digit code.',
  'Enter the code on the door keypad to unlock the exit.'
];
const paperBottom = makePaperMesh(
  ['Pre-Check: Lights stable • Tools ready • Team roles set', '---', 'Begin when the chime rings once.'],
  { title: 'SESSION NOTES', sub: 'Operator Log — Room A5', accent: '#6b3b00', w: 0.92, h: 0.68 }
);
paperBottom.position.set(0.02, 0.000, -0.04); paperBottom.rotation.y = 0.06;

const paperMiddle = makePaperMesh(
  ['Inventory: Candle x5 • Gearbox intact • Keypad active', '---', 'Clue cache moved to DESK (right drawer).'],
  { title: 'INVENTORY', sub: 'Audit — Pre-Run', accent: '#7a2f2a', w: 0.9, h: 0.66 }
);
paperMiddle.position.set(-0.03, 0.004, 0.03); paperMiddle.rotation.y = -0.08;

const paperTop = makePaperMesh(instructions, {
  title: 'ESCAPE PROTOCOL', sub: 'Follow these steps precisely', accent: '#8a3d00', w: 0.92, h: 0.68
});
paperTop.position.set(0, 0.008, 0); paperTop.rotation.y = 0.02;

escapePapersGroup.add(paperBottom, paperMiddle, paperTop);

// pencil prop
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

// soft reading light above new paper position
const papersLight = new THREE.PointLight(0xfff2cc, 0.6, 2.2);
papersLight.position.set(0.85, 1.8, -0.35);
scene.add(papersLight);

// interaction: click to expand top paper
const raycaster = new THREE.Raycaster();
const mouse = new THREE.Vector2();
let paperExpanded = false;
const savedPaperState = { pos: new THREE.Vector3(), rotY: 0, scale: 1 };

function onPointerMove(e) {
  const rect = renderer.domElement.getBoundingClientRect();
  mouse.x = ((e.clientX - rect.left) / rect.width) * 2 - 1;
  mouse.y = -((e.clientY - rect.top) / rect.height) * 2 + 1;
}
function onClick() {
  raycaster.setFromCamera(mouse, camera);
  const hits = raycaster.intersectObjects([paperTop], false);
  if (!hits.length) return;

  if (!paperExpanded) {
    savedPaperState.pos.copy(paperTop.position);
    savedPaperState.rotY = paperTop.rotation.y;
    savedPaperState.scale = paperTop.scale.x;

    const worldTarget = new THREE.Vector3(0, 2.0, 0);
    paperTop.parent.worldToLocal(worldTarget);
    paperTop.position.copy(worldTarget);
    paperTop.rotation.y = 0;
    paperTop.scale.set(2.0, 2.0, 2.0);
    paperExpanded = true;
  } else {
    paperTop.position.copy(savedPaperState.pos);
    paperTop.rotation.y = savedPaperState.rotY;
    paperTop.scale.setScalar(savedPaperState.scale);
    paperExpanded = false;
  }
}
renderer.domElement.addEventListener('pointermove', onPointerMove);
renderer.domElement.addEventListener('click', onClick);

let hovering = false;
function updateHover() {
  raycaster.setFromCamera(mouse, camera);
  const hit = raycaster.intersectObjects([paperTop], false).length > 0;
  if (hit && !hovering && !paperExpanded) {
    paperTop.material.emissive = new THREE.Color(0xffffcc);
    paperTop.material.emissiveIntensity = 0.08;
    hovering = true;
  } else if ((!hit || paperExpanded) && hovering) {
    paperTop.material.emissiveIntensity = 0.0;
    hovering = false;
  }
}

// === Door & Keypad (no blue) ===
const door = new THREE.Mesh(
  new THREE.BoxGeometry(1.8, 3.5, 0.15),
  new THREE.MeshStandardMaterial({ color: 0x1a0f08, roughness: 0.6 })
);
door.position.set(0, 1.75, -5.92);
door.castShadow = true;
scene.add(door);

const keypad = new THREE.Mesh(
  new THREE.BoxGeometry(0.3, 0.4, 0.08),
  new THREE.MeshStandardMaterial({ color: 0x111111, emissive: 0x000000, emissiveIntensity: 0.0 })
);
keypad.position.set(1, 1.75, -5.87);
scene.add(keypad);

// === Grandfather Clock (brighter face) ===
const clockGroup = new THREE.Group();
const darkWoodMat = new THREE.MeshStandardMaterial({ color: 0x3d2817, roughness: 0.6, metalness: 0.1 });
const lightWoodMat = new THREE.MeshStandardMaterial({ color: 0x5a3c1a, roughness: 0.7, metalness: 0.2 });
const brassAgedMat = new THREE.MeshStandardMaterial({ color: 0xb8860b, roughness: 0.4, metalness: 0.8 });

const clockCase = new THREE.Mesh(new THREE.BoxGeometry(1.4, 4.5, 0.5), lightWoodMat);
clockCase.position.y = 2.25; clockCase.castShadow = true; clockGroup.add(clockCase);

const crownMolding = new THREE.Mesh(new THREE.BoxGeometry(1.55, 0.25, 0.55), darkWoodMat);
crownMolding.position.y = 4.625; clockGroup.add(crownMolding);

const archTop = new THREE.Mesh(new THREE.CylinderGeometry(0.7, 0.775, 0.15, 32, 1, false, 0, Math.PI), darkWoodMat);
archTop.rotation.z = Math.PI; archTop.position.set(0, 4.5, 0); clockGroup.add(archTop);

const centerFinial = new THREE.Mesh(new THREE.SphereGeometry(0.12, 16, 16), brassAgedMat);
centerFinial.position.y = 4.9; clockGroup.add(centerFinial);

[-0.5, 0.5].forEach(x => {
  const sideFinial = new THREE.Mesh(new THREE.ConeGeometry(0.08, 0.2, 16), brassAgedMat);
  sideFinial.position.set(x, 4.85, 0); clockGroup.add(sideFinial);
});

[-0.65, 0.65].forEach(x => {
  const column = new THREE.Mesh(new THREE.CylinderGeometry(0.06, 0.06, 4, 12), darkWoodMat);
  column.position.set(x, 2.25, 0.22); clockGroup.add(column);
  const capital = new THREE.Mesh(new THREE.BoxGeometry(0.13, 0.15, 0.13), brassAgedMat);
  capital.position.set(x, 4.25, 0.22); clockGroup.add(capital);
  const base = new THREE.Mesh(new THREE.BoxGeometry(0.13, 0.15, 0.13), brassAgedMat);
  base.position.set(x, 0.25, 0.22); clockGroup.add(base);
});

const upperCase = new THREE.Mesh(new THREE.BoxGeometry(1.3, 1.4, 0.45), new THREE.MeshStandardMaterial({ color: 0x4a3520, roughness: 0.65 }));
upperCase.position.y = 3.55; clockGroup.add(upperCase);

// Brighter ivory clock face
const clockFace = new THREE.Mesh(
  new THREE.CircleGeometry(0.5, 32),
  new THREE.MeshStandardMaterial({
    color: 0xFFFFFA,        // lighter ivory / near-white
    emissive: 0xFFFBEA,     // subtle warm backlight
    emissiveIntensity: 0.25,
    roughness: 0.4
  })
);
clockFace.position.set(0, 3.55, 0.24);
clockGroup.add(clockFace);

const bezel = new THREE.Mesh(new THREE.TorusGeometry(0.5, 0.04, 16, 32), brassAgedMat);
bezel.position.set(0, 3.55, 0.25); clockGroup.add(bezel);

// Numerals
const numeralPositions = [
  { text: 'XII', angle: 0 },
  { text: 'III', angle: Math.PI / 2 },
  { text: 'VI', angle: Math.PI },
  { text: 'IX', angle: -Math.PI / 2 }
];
numeralPositions.forEach(({ text, angle }) => {
  const canvas = document.createElement('canvas');
  canvas.width = 64; canvas.height = 64;
  const ctx = canvas.getContext('2d');
  ctx.fillStyle = '#2a1810';
  ctx.font = 'bold 32px Georgia';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText(text, 32, 32);
  const texture = new THREE.CanvasTexture(canvas);
  const numeral = new THREE.Mesh(
    new THREE.PlaneGeometry(0.13, 0.13),
    new THREE.MeshBasicMaterial({ map: texture, transparent: true })
  );
  numeral.position.set(Math.sin(angle) * 0.35, 3.55 + Math.cos(angle) * 0.35, 0.26);
  clockGroup.add(numeral);
});

// Hands
const hourHand = new THREE.Mesh(new THREE.BoxGeometry(0.04, 0.24, 0.015), brassAgedMat);
hourHand.position.set(0, 3.67, 0.27); clockGroup.add(hourHand);

const minuteHand = new THREE.Mesh(new THREE.BoxGeometry(0.03, 0.34, 0.015), brassAgedMat);
minuteHand.position.set(0, 3.72, 0.27); clockGroup.add(minuteHand);

// Glass door & pendulum
const glassFrame = new THREE.Mesh(new THREE.BoxGeometry(1.15, 2.5, 0.08), darkWoodMat);
glassFrame.position.set(0, 1.5, 0.21); clockGroup.add(glassFrame);

const glassDoor = new THREE.Mesh(
  new THREE.PlaneGeometry(1, 2.3),
  new THREE.MeshPhysicalMaterial({ color: 0x9ab8c0, transparent: true, opacity: 0.25, transmission: 0.85, roughness: 0.15 })
);
glassDoor.position.set(0, 1.5, 0.23); clockGroup.add(glassDoor);

const pendulum = new THREE.Group();
const pendulumRod = new THREE.Mesh(new THREE.CylinderGeometry(0.018, 0.018, 1.5, 8), brassAgedMat);
pendulumRod.position.y = -0.75; pendulum.add(pendulumRod);
const pendulumBob = new THREE.Mesh(new THREE.CylinderGeometry(0.2, 0.2, 0.1, 32), brassAgedMat);
pendulumBob.position.y = -1.5; pendulum.add(pendulumBob);
const bobDecoration = new THREE.Mesh(new THREE.TorusGeometry(0.13, 0.012, 8, 16), new THREE.MeshStandardMaterial({ color: 0xd4af37, metalness: 1 }));
bobDecoration.rotation.x = Math.PI / 2; bobDecoration.position.y = -1.5; pendulum.add(bobDecoration);
pendulum.position.set(0, 2.5, 0.13); clockGroup.add(pendulum);

// Base & feet
const basePlinth = new THREE.Mesh(new THREE.BoxGeometry(1.5, 0.25, 0.55), darkWoodMat);
basePlinth.position.y = 0.125; clockGroup.add(basePlinth);
[-0.7, 0.7].forEach(x => {
  const foot = new THREE.Mesh(new THREE.SphereGeometry(0.09, 8, 8), darkWoodMat);
  foot.position.set(x, 0.05, 0.22); clockGroup.add(foot);
});

// Place clock + lighting
clockGroup.position.set(5.65, 0, -2);
clockGroup.rotation.y = -Math.PI / 2;
scene.add(clockGroup);

const clockSpot = new THREE.SpotLight(0xfff2cc, 2.6, 6, Math.PI / 10, 0.25, 1.0);
clockSpot.position.set(5.2, 4.6, -2);
clockSpot.target.position.set(5.65, 3.55, -1.8);
clockSpot.castShadow = true;
scene.add(clockSpot, clockSpot.target);

const faceGlow = new THREE.PointLight(0xfff2cc, 0.8, 2.4);
faceGlow.position.set(5.65, 3.55, -1.7);
scene.add(faceGlow);

// === Painting ===
const painting = new THREE.Mesh(
  new THREE.PlaneGeometry(1.2, 1.6),
  new THREE.MeshStandardMaterial({ map: paintingTexture, roughness: 0.5, emissive: 0x333333, emissiveIntensity: 0.3 })
);
painting.position.set(5.9, 3, 2);
painting.rotation.y = -Math.PI / 2;
painting.castShadow = true;
scene.add(painting);

const frame = new THREE.Mesh(
  new THREE.BoxGeometry(1.3, 1.7, 0.08),
  new THREE.MeshStandardMaterial({ color: 0xd4af37, metalness: 0.85, roughness: 0.25 })
);
frame.position.set(5.88, 3, 2);
frame.rotation.y = -Math.PI / 2;
frame.castShadow = true;
scene.add(frame);

const paintingLight = new THREE.SpotLight(0xffaa66, 4.0, 8, Math.PI / 6);
paintingLight.position.set(5.6, 4.5, 2);
paintingLight.target.position.set(5.9, 3, 2);
paintingLight.castShadow = true;
scene.add(paintingLight, paintingLight.target);

// === BOOKSHELF AREA (structured, filled, mysterious) ===
// We'll replace the old single box shelf with a detailed group.
const bookcase = new THREE.Group();
bookcase.position.set(3, 0, 5.75); // base at floor, front near south wall
scene.add(bookcase);

// Frame sizes
const shelfWidth = 4;    // X
const shelfHeight = 4;   // Y total
const shelfDepth = 0.5;  // Z
const wood = new THREE.MeshStandardMaterial({ color: 0x2a1810, roughness: 0.7 });
const brass = new THREE.MeshStandardMaterial({ color: 0xd4af37, metalness: 0.9, roughness: 0.25 });

// Back panel
const back = new THREE.Mesh(new THREE.BoxGeometry(shelfWidth, shelfHeight, 0.05), new THREE.MeshStandardMaterial({ color: 0x1e120b, roughness: 0.9 }));
back.position.set(0, shelfHeight / 2, -shelfDepth / 2 + 0.025);
bookcase.add(back);

// Side panels & top/bottom
const sideL = new THREE.Mesh(new THREE.BoxGeometry(0.15, shelfHeight, shelfDepth), wood);
sideL.position.set(-shelfWidth/2 + 0.075, shelfHeight/2, 0); bookcase.add(sideL);

const sideR = sideL.clone(); sideR.position.x = shelfWidth/2 - 0.075; bookcase.add(sideR);

const top = new THREE.Mesh(new THREE.BoxGeometry(shelfWidth, 0.12, shelfDepth), wood);
top.position.set(0, shelfHeight - 0.06, 0); bookcase.add(top);

const bottom = new THREE.Mesh(new THREE.BoxGeometry(shelfWidth, 0.12, shelfDepth), wood);
bottom.position.set(0, 0.06, 0); bookcase.add(bottom);

// 4 inner shelves
const shelvesY = [1.0, 2.0, 3.0]; // heights for inner planks
shelvesY.forEach(y => {
  const shelf = new THREE.Mesh(new THREE.BoxGeometry(shelfWidth - 0.2, 0.08, shelfDepth - 0.05), wood);
  shelf.position.set(0, y, 0);
  bookcase.add(shelf);
});

// Helper: random leather/book colors
function leatherColor() {
  const hues = [0x5a2e1a, 0x7a4a2a, 0x2f3b4a, 0x3d2b1f, 0x6a3f2b, 0x2a2a2a, 0x4a2f2f, 0x304035];
  return hues[Math.floor(Math.random() * hues.length)];
}

// Add books standing on each shelf
function addStandingBook(x, y, z, h, w = 0.15, d = 0.22, color = leatherColor()) {
  const book = new THREE.Mesh(
    new THREE.BoxGeometry(w, h, d),
    new THREE.MeshStandardMaterial({ color, roughness: 0.6 })
  );
  book.position.set(x, y + h/2, z);
  book.rotation.y = (Math.random() - 0.5) * 0.12;
  book.castShadow = true;
  bookcase.add(book);
  return book;
}

// Add a stack of books lying down
function addStack(x, y, z, n = 3) {
  let yy = y + 0.05;
  for (let i = 0; i < n; i++) {
    const h = 0.06 + Math.random() * 0.05;
    const w = 0.18 + Math.random() * 0.06;
    const d = 0.24;
    const b = new THREE.Mesh(new THREE.BoxGeometry(w, h, d), new THREE.MeshStandardMaterial({ color: leatherColor(), roughness: 0.65 }));
    b.position.set(x, yy + h/2, z);
    b.rotation.y = (Math.random() - 0.5) * 0.08;
    b.castShadow = true;
    bookcase.add(b);
    yy += h + 0.01;
  }
}

// Fill each shelf with rows of books
const zRow = 0.18; // forward from back panel
[-1.7, -1.35, -1.0, -0.65, -0.3, 0.05, 0.4, 0.75, 1.1, 1.45, 1.8].forEach((x) => {
  addStandingBook(x, 0.12, -zRow, 0.5 + Math.random()*0.35);
  addStandingBook(x, 1.12, -zRow, 0.55 + Math.random()*0.3);
  addStandingBook(x, 2.12, -zRow, 0.5 + Math.random()*0.35);
  addStandingBook(x, 3.12, -zRow, 0.45 + Math.random()*0.25);
});
// stacks (a few)
addStack(-1.9, 1.0, -0.12, 3);
addStack(1.85, 2.0, -0.12, 4);

// Mysterious props
// Glowing orb
const orb = new THREE.Mesh(
  new THREE.SphereGeometry(0.2, 16, 16),
  new THREE.MeshStandardMaterial({ color: 0x4444ff, emissive: 0x4444ff, emissiveIntensity: 0.9 })
);
orb.position.set(1.2, 2.5, -0.15);
bookcase.add(orb);
const orbLight = new THREE.PointLight(0x4444ff, 0.7, 2.5);
orbLight.position.set(1.2, 2.5, -0.15);
bookcase.add(orbLight);
orb.visible = false; 
orbLight.visible = false;
// Antique key
const keyGroup = new THREE.Group();
const keyRing = new THREE.Mesh(new THREE.TorusGeometry(0.05, 0.008, 10, 20), brass);
keyRing.rotation.x = Math.PI/2;
const keyShaft = new THREE.Mesh(new THREE.CylinderGeometry(0.008, 0.008, 0.12, 10), brass);
keyShaft.position.y = -0.1;
const keyBit = new THREE.Mesh(new THREE.BoxGeometry(0.06, 0.02, 0.02), brass);
keyBit.position.set(0, -0.15, 0);
keyGroup.add(keyRing, keyShaft, keyBit);
keyGroup.position.set(-1.5, 3.1, -0.12);
keyGroup.rotation.y = 0.2;
bookcase.add(keyGroup);

// Locked box
const lockBox = new THREE.Mesh(new THREE.BoxGeometry(0.28, 0.18, 0.22), new THREE.MeshStandardMaterial({ color: 0x1b1b1f, roughness: 0.8 }));
lockBox.position.set(0.2, 1.1, -0.1);
const lockPlate = new THREE.Mesh(new THREE.BoxGeometry(0.06, 0.08, 0.01), brass);
lockPlate.position.set(0.2, 1.1, 0.01);
bookcase.add(lockBox, lockPlate);

// Small statue (bust-like)
const statue = new THREE.Mesh(new THREE.SphereGeometry(0.11, 16, 16), new THREE.MeshStandardMaterial({ color: 0x888888, metalness: 0.2, roughness: 0.8 }));
statue.position.set(-0.6, 2.08, -0.1);
const statueBase = new THREE.Mesh(new THREE.CylinderGeometry(0.08, 0.08, 0.05, 16), new THREE.MeshStandardMaterial({ color: 0x555555, roughness: 0.9 }));
statueBase.position.set(-0.6, 2.035, -0.1);
bookcase.add(statue, statueBase);

// Warm spotlight for bookshelf
const shelfLight = new THREE.SpotLight(0xffd8a1, 1.6, 6, Math.PI / 4);
shelfLight.position.set(3, 4.2, 5.0);
shelfLight.target.position.set(3, 2, 5.75);
shelfLight.castShadow = true;
scene.add(shelfLight, shelfLight.target);

// === Secondary shelf (left wall) kept simple (you can enhance similarly if you want) ===
const bookshelf3 = new THREE.Mesh(new THREE.BoxGeometry(0.5, 3, 2.5), new THREE.MeshStandardMaterial({ color: 0x2a1810 }));
bookshelf3.position.set(-5.75, 1.5, -2.5);
bookshelf3.castShadow = true;
scene.add(bookshelf3);

// === Desk with Drawers ===
const desk = new THREE.Mesh(new THREE.BoxGeometry(2.5, 0.12, 1.5), new THREE.MeshStandardMaterial({ color: 0x4b2e05 }));
desk.position.set(-4, 1, 5); desk.castShadow = true; scene.add(desk);

const deskGroup = new THREE.Group();
const legGeom = new THREE.BoxGeometry(0.1, 0.9, 0.1);
const legMat  = new THREE.MeshStandardMaterial({ color: 0x3a2204, roughness: 0.7 });
[[-5.2,0.45,4.25],[-5.2,0.45,5.75],[-2.8,0.45,4.25],[-2.8,0.45,5.75]].forEach(p=>{
  const leg = new THREE.Mesh(legGeom, legMat);
  leg.position.set(p[0],p[1],p[2]); leg.castShadow = true; deskGroup.add(leg);
});
const carcass = new THREE.Mesh(new THREE.BoxGeometry(0.8,0.6,1.2), new THREE.MeshStandardMaterial({ color: 0x4b2e05, roughness: 0.65 }));
carcass.position.set(-3.15,0.6,5); carcass.castShadow = true; deskGroup.add(carcass);

const drawerMat = new THREE.MeshStandardMaterial({ color: 0x5d3a0d, roughness: 0.55 });
const drawerGeom = new THREE.BoxGeometry(0.76,0.24,1.16);
const drawer1 = new THREE.Mesh(drawerGeom, drawerMat); drawer1.position.set(-3.15,0.72,5); drawer1.castShadow = true;
const drawer2 = drawer1.clone(); drawer2.position.y = 0.48;
deskGroup.add(drawer1, drawer2);

const handleMat = new THREE.MeshStandardMaterial({ color: 0xd4af37, metalness: 0.85, roughness: 0.2 });
function addHandle(d) {
  const h = new THREE.Mesh(new THREE.CylinderGeometry(0.01,0.01,0.12,12), handleMat);
  h.rotation.z = Math.PI/2; h.position.set(d.position.x, d.position.y, 5.74); h.castShadow = true; deskGroup.add(h);
}
addHandle(drawer1); addHandle(drawer2);
scene.add(deskGroup);

// Desk note
const noteCanvas = document.createElement('canvas');
noteCanvas.width = 512; noteCanvas.height = 512;
const noteCtx = noteCanvas.getContext('2d');
noteCtx.fillStyle = '#f5e6d3'; noteCtx.fillRect(0,0,512,512);
noteCtx.fillStyle = '#2a1810';
noteCtx.font = 'bold 28px Georgia'; noteCtx.textAlign = 'center';
noteCtx.fillText('WARNING', 256, 80);
noteCtx.font = '20px Georgia';
noteCtx.fillText('The next time jump will', 256, 150);
noteCtx.fillText('occur in 10 minutes.', 256, 185);
noteCtx.fillText('Solve the three mechanisms', 256, 260);
noteCtx.fillText('to stabilize the portal —', 256, 295);
noteCtx.fillText('or be lost in time forever.', 256, 330);
const noteTexture = new THREE.CanvasTexture(noteCanvas);
const deskNote = new THREE.Mesh(new THREE.PlaneGeometry(0.6, 0.6), new THREE.MeshStandardMaterial({ map: noteTexture, emissive: 0xffaa44, emissiveIntensity: 0.1 }));
deskNote.rotation.x = -Math.PI/2; deskNote.position.set(-4,1.07,5); scene.add(deskNote);

// Desk lamp
const deskLampStand = new THREE.Mesh(new THREE.CylinderGeometry(0.04,0.06,0.5,16), new THREE.MeshStandardMaterial({ color: 0xd4af37, metalness: 0.9 }));
deskLampStand.position.set(-4.8,1.35,5); scene.add(deskLampStand);
const deskLampShade = new THREE.Mesh(new THREE.ConeGeometry(0.15,0.25,16), new THREE.MeshStandardMaterial({ color: 0xffe4b5, emissive: 0xffaa66, emissiveIntensity: 0.7 }));
deskLampShade.position.set(-4.8,1.7,5); scene.add(deskLampShade);
const deskLampLight = new THREE.SpotLight(0xffaa66, 2.5, 10, Math.PI/6);
deskLampLight.position.set(-4.8,1.7,5); deskLampLight.target.position.set(-4,1,5);
scene.add(deskLampLight, deskLampLight.target);

// Chair
const chair = new THREE.Mesh(new THREE.BoxGeometry(0.7, 0.9, 0.7), new THREE.MeshStandardMaterial({ color: 0x6b4b2a }));
chair.position.set(-4, 0.6, 3.8); chair.castShadow = true; scene.add(chair);

// Gear table + box (no blue)
const gearTable = new THREE.Mesh(new THREE.BoxGeometry(1.2,0.12,1.2), new THREE.MeshStandardMaterial({ color: 0x5a3c1a }));
gearTable.position.set(-4.5,0.9,1.5); gearTable.castShadow = true; scene.add(gearTable);
const gearBox = new THREE.Mesh(new THREE.BoxGeometry(0.7,0.25,0.7), new THREE.MeshStandardMaterial({ color: 0x8B7355, emissive: 0x000000, emissiveIntensity: 0.0 }));
gearBox.position.set(-4.5,1.1,1.5); gearBox.castShadow = true; scene.add(gearBox);

// Chandelier bulbs
const chandelier = new THREE.Mesh(new THREE.CylinderGeometry(0.25, 0.35, 0.5, 8), new THREE.MeshStandardMaterial({ color: 0xd4af37, metalness: 0.9 }));
chandelier.position.set(0, 5.2, 0); scene.add(chandelier);
for (let i = 0; i < 6; i++) {
  const angle = (i / 6) * Math.PI * 2;
  const bulb = new THREE.Mesh(
    new THREE.SphereGeometry(0.12, 16, 16),
    new THREE.MeshStandardMaterial({ color: 0xffffff, emissive: 0xffd8b1, emissiveIntensity: 1.5 })
  );
  bulb.position.set(Math.cos(angle) * 0.6, 4.9, Math.sin(angle) * 0.6);
  scene.add(bulb);
}

// Particles (warm)
const particleCount = 300;
const positions = new Float32Array(particleCount * 3);
for (let i = 0; i < particleCount * 3; i += 3) {
  positions[i] = (Math.random() - 0.5) * 12;
  positions[i + 1] = Math.random() * 6;
  positions[i + 2] = (Math.random() - 0.5) * 12;
}
const particles = new THREE.Points(
  new THREE.BufferGeometry().setAttribute('position', new THREE.BufferAttribute(positions, 3)),
  new THREE.PointsMaterial({ color: 0xffe7c6, size: 0.02, transparent: true, opacity: 0.35 })
);
scene.add(particles);
scene.remove(particles);
particles.geometry.dispose();
particles.material.dispose();

// === ANIMATION ===
let time = 0;
function animate() {
  requestAnimationFrame(animate);
  time += 0.01;

  chandelierLight.intensity = 5.5 + Math.sin(time * 2) * 0.8;
  gearBox.rotation.y += 0.005;

  // clock animation
  hourHand.rotation.z += 0.0001;
  minuteHand.rotation.z += 0.001;
  pendulum.rotation.z = Math.sin(time * 1.8) * 0.12;

  particles.rotation.y += 0.0002;

  updateHover();
  controls.update();
  renderer.render(scene, camera);
}
animate();

window.addEventListener('resize', () => {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
});
