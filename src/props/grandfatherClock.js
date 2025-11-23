import * as THREE from 'three';

export function addGrandfatherClock(scene) {
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

  const clockFace = new THREE.Mesh(
    new THREE.CircleGeometry(0.5, 32),
    new THREE.MeshStandardMaterial({
      color: 0xFFFFFA,
      emissive: 0xFFFBEA,
      emissiveIntensity: 0.25,
      roughness: 0.4
    })
  );
  clockFace.position.set(0, 3.55, 0.24);
  clockGroup.add(clockFace);

  const bezel = new THREE.Mesh(new THREE.TorusGeometry(0.5, 0.04, 16, 32), brassAgedMat);
  bezel.position.set(0, 3.55, 0.25); clockGroup.add(bezel);

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
  const goldHandMat = new THREE.MeshStandardMaterial({
    color: 0xFFD700,
    emissive: 0xFFAA00,
    emissiveIntensity: 0.6,
    metalness: 0.9,
    roughness: 0.2
  });

  const hourHandGroup = new THREE.Group();
  const hourBody = new THREE.Mesh(new THREE.BoxGeometry(0.04, 0.22, 0.02), goldHandMat);
  hourBody.position.y = 0.11;
  hourHandGroup.add(hourBody);

  const hourTipGeom = new THREE.ConeGeometry(0.025, 0.08, 3);
  const hourTip = new THREE.Mesh(hourTipGeom, goldHandMat);
  hourTip.rotation.z = Math.PI;
  hourTip.position.y = 0.26;
  hourHandGroup.add(hourTip);

  hourHandGroup.position.set(0, 3.55, 0.27);
  hourHandGroup.castShadow = true;
  clockGroup.add(hourHandGroup);

  const minuteHandGroup = new THREE.Group();
  const minuteBody = new THREE.Mesh(new THREE.BoxGeometry(0.03, 0.32, 0.02), goldHandMat);
  minuteBody.position.y = 0.16;
  minuteHandGroup.add(minuteBody);

  const minuteTipGeom = new THREE.ConeGeometry(0.02, 0.1, 3);
  const minuteTip = new THREE.Mesh(minuteTipGeom, goldHandMat);
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

  // Position group
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

  return {
    clockGroup,
    hourHand: hourHandGroup,
    minuteHand: minuteHandGroup,
    pendulum
  };
}