import * as THREE from 'three';

export function addGlobalLights(scene) {
  const ambientLight = new THREE.AmbientLight(0x3a3a5a, 0.8);
  scene.add(ambientLight);

  const chandelierLight = new THREE.PointLight(0xffd8b1, 5.5, 35);
  chandelierLight.position.set(0, 5.5, 0);
  chandelierLight.castShadow = true;
  scene.add(chandelierLight);

  const fillLight = new THREE.PointLight(0xffffff, 2.0, 20);
  fillLight.position.set(0, 4, 0);
  scene.add(fillLight);

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

  return { chandelierLight };
}