import * as THREE from 'three';

export function addDoorAndKeypad(scene, onCollision) {
  const door = new THREE.Mesh(
    new THREE.BoxGeometry(1.8, 3.5, 0.15),
    new THREE.MeshStandardMaterial({ color: 0x1a0f08, roughness: 0.6 })
  );
  door.position.set(0, 1.75, -5.92);
  door.castShadow = true;
  scene.add(door);
  if (onCollision) onCollision(door);

  const keypad = new THREE.Mesh(
    new THREE.BoxGeometry(0.3, 0.4, 0.08),
    new THREE.MeshStandardMaterial({ color: 0x111111 })
  );
  keypad.position.set(1, 1.75, -5.87);
  scene.add(keypad);

  return { door, keypad };
}