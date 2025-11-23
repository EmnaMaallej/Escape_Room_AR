import * as THREE from 'three';

export function addPainting(scene, paintingTexture) {
  const painting = new THREE.Mesh(
    new THREE.PlaneGeometry(1.8, 2.4),
    new THREE.MeshStandardMaterial({ map: paintingTexture, roughness: 0.7 })
  );
  painting.position.set(5.88, 3.5, 2);
  painting.rotation.y = -Math.PI / 2;
  painting.castShadow = true;
  painting.receiveShadow = true;
  scene.add(painting);
}