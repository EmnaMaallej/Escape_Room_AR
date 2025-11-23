import * as THREE from 'three';

export function addDeskAndChair(scene, onCollision) {
  const desk = new THREE.Mesh(new THREE.BoxGeometry(2.5, 0.12, 1.5), new THREE.MeshStandardMaterial({ color: 0x4b2e05 }));
  desk.position.set(-4, 1, 5); desk.castShadow = true; scene.add(desk);
  if (onCollision) onCollision(desk);

  const deskGroup = new THREE.Group();
  const legGeom = new THREE.BoxGeometry(0.1, 0.9, 0.1);
  const legMat = new THREE.MeshStandardMaterial({ color: 0x3a2204, roughness: 0.7 });
  [[-5.2, 0.45, 4.25], [-5.2, 0.45, 5.75], [-2.8, 0.45, 4.25], [-2.8, 0.45, 5.75]].forEach(p => {
    const leg = new THREE.Mesh(legGeom, legMat);
    leg.position.set(p[0], p[1], p[2]); leg.castShadow = true; deskGroup.add(leg);
    if (onCollision) onCollision(leg);
  });
  scene.add(deskGroup);

  // Note on desk
  const noteCanvas = document.createElement('canvas');
  noteCanvas.width = 512; noteCanvas.height = 512;
  const noteCtx = noteCanvas.getContext('2d');
  noteCtx.fillStyle = '#f5e6d3'; noteCtx.fillRect(0, 0, 512, 512);
  noteCtx.fillStyle = '#2a1810';
  noteCtx.font = 'bold 28px Georgia'; noteCtx.textAlign = 'center';
  noteCtx.fillText('WARNING', 256, 80);
  noteCtx.font = '20px Georgia';
  noteCtx.fillText('The next time jump will', 256, 150);
  noteCtx.fillText('occur in 10 minutes.', 256, 185);
  const noteTexture = new THREE.CanvasTexture(noteCanvas);
  const deskNote = new THREE.Mesh(new THREE.PlaneGeometry(0.6, 0.6), new THREE.MeshStandardMaterial({ map: noteTexture }));
  deskNote.rotation.x = -Math.PI / 2; deskNote.position.set(-4, 1.07, 5); scene.add(deskNote);

  const deskLampLight = new THREE.SpotLight(0xffaa66, 2.5, 10, Math.PI / 6);
  deskLampLight.position.set(-4.8, 1.7, 5); deskLampLight.target.position.set(-4, 1, 5);
  scene.add(deskLampLight, deskLampLight.target);

  // Chair
  const chair = new THREE.Mesh(new THREE.BoxGeometry(0.7, 0.9, 0.7), new THREE.MeshStandardMaterial({ color: 0x6b4b2a }));
  chair.position.set(-4, 0.6, 3.8); chair.castShadow = true; scene.add(chair);
  if (onCollision) onCollision(chair);
}