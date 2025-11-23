import * as THREE from 'three';

export function buildRoom(scene, { wallTexture, woodTexture, carpetTexture }, onCollision) {
  // Floor
  const floor = new THREE.Mesh(
    new THREE.PlaneGeometry(12, 12),
    new THREE.MeshStandardMaterial({ map: woodTexture, roughness: 0.9 })
  );
  floor.rotation.x = -Math.PI / 2;
  floor.receiveShadow = true;
  scene.add(floor);

  // Carpet
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
  if (onCollision) onCollision(northWallLeft);

  const northWallRight = new THREE.Mesh(new THREE.BoxGeometry(4, 6, 0.2), wallMat);
  northWallRight.position.set(4, 3, -6);
  scene.add(northWallRight);
  if (onCollision) onCollision(northWallRight);

  const northWallTop = new THREE.Mesh(new THREE.BoxGeometry(4, 2, 0.2), wallMat);
  northWallTop.position.set(0, 5, -6);
  scene.add(northWallTop);
  if (onCollision) onCollision(northWallTop);

  const eastWall = new THREE.Mesh(new THREE.BoxGeometry(0.2, 6, 12), wallMat);
  eastWall.position.set(6, 3, 0);
  scene.add(eastWall);
  if (onCollision) onCollision(eastWall);

  const southWall = new THREE.Mesh(new THREE.BoxGeometry(12, 6, 0.2), wallMat);
  southWall.position.set(0, 3, 6);
  scene.add(southWall);
  if (onCollision) onCollision(southWall);

  const westWall = new THREE.Mesh(new THREE.BoxGeometry(0.2, 6, 12), wallMat);
  westWall.position.set(-6, 3, 0);
  scene.add(westWall);
  if (onCollision) onCollision(westWall);

  // Ceiling
  const ceiling = new THREE.Mesh(
    new THREE.PlaneGeometry(12, 12),
    new THREE.MeshStandardMaterial({ color: 0x0a0a0a })
  );
  ceiling.position.y = 6;
  ceiling.rotation.x = Math.PI / 2;
  scene.add(ceiling);
}