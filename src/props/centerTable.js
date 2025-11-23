import * as THREE from 'three';

export function addCenterTable(scene, onCollision) {
  const centerTableTop = new THREE.Mesh(
    new THREE.CylinderGeometry(2, 2, 0.15, 32),
    new THREE.MeshStandardMaterial({ color: 0x4a3c1a, roughness: 0.7 })
  );
  centerTableTop.position.set(0, 1, 0);
  centerTableTop.castShadow = true;
  scene.add(centerTableTop);
  if (onCollision) onCollision(centerTableTop);

  const centerTableLeg = new THREE.Mesh(
    new THREE.CylinderGeometry(0.4, 0.5, 1, 16),
    new THREE.MeshStandardMaterial({ color: 0x3d2817 })
  );
  centerTableLeg.position.set(0, 0.5, 0);
  centerTableLeg.castShadow = true;
  scene.add(centerTableLeg);
  if (onCollision) onCollision(centerTableLeg);

  // Candelabra
  const brass = new THREE.MeshStandardMaterial({ color: 0xd4af37, metalness: 0.9 });
  const candelabraBase = new THREE.Mesh(
    new THREE.CylinderGeometry(0.2, 0.25, 0.4, 8),
    brass
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

  // Paper highlight light
  const papersLight = new THREE.PointLight(0xfff2cc, 0.6, 2.2);
  papersLight.position.set(0.85, 1.8, -0.35);
  scene.add(papersLight);
}