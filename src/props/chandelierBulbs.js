import * as THREE from 'three';

export function addChandelierBulbs(scene) {
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
}