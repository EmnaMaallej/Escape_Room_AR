import * as THREE from 'three';

export function addEscapePapers(scene, camera, renderer) {
  const escapePapersGroup = new THREE.Group();
  escapePapersGroup.position.set(0.85, 1.08, -0.35);
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

    ctx.fillStyle = '#f7f1e8';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    ctx.fillStyle = 'rgba(0,0,0,0.06)';
    for (let y = 80; y < canvas.height; y += 40) ctx.fillRect(40, y, canvas.width - 80, 1);

    ctx.fillStyle = accent;
    ctx.font = 'bold 48px Georgia';
    ctx.textAlign = 'left';
    ctx.fillText(title, 48, 70);
    ctx.fillStyle = '#444';
    ctx.font = 'italic 26px Georgia';
    ctx.fillText(sub, 48, 110);

    ctx.fillStyle = '#222';
    ctx.font = '28px Georgia';
    let yy = 170, li = 1;
    textLines.forEach(line => {
      if (line === '---') { yy += 16; return; }
      ctx.fillText(`${li}. ${line}`, 60, yy);
      yy += 48; li++;
    });

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
      map: tex, roughness: 0.9, metalness: 0.0
    });
    const mesh = new THREE.Mesh(new THREE.PlaneGeometry(w, h), mat);
    mesh.rotation.x = -Math.PI / 2;
    mesh.receiveShadow = true; mesh.castShadow = true;
    return mesh;
  }

  const instructions = [
    'Inspect the grandfather clock — note the bright dial.',
    'Set the clock hands to 6:00 using the hint hidden nearby.',
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

  // Interaction handlers
  const raycaster = new THREE.Raycaster();
  const mouse = new THREE.Vector2();
  let paperExpanded = false;
  const savedPaperState = { pos: new THREE.Vector3(), rotY: 0, scale: 1 };
  let hovering = false;

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

  renderer.domElement.addEventListener('pointermove', onPointerMove);
  renderer.domElement.addEventListener('click', onClick);

  function dispose() {
    renderer.domElement.removeEventListener('pointermove', onPointerMove);
    renderer.domElement.removeEventListener('click', onClick);
  }

  return { updateHover, dispose, group: escapePapersGroup };
}