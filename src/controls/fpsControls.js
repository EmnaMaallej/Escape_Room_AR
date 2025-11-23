import * as THREE from 'three';

export function createFPSControls(camera, domElement, {
  moveSpeed = 0.08,
  lookSpeed = 0.002,
  bounds = { x: 5.5, z: 5.5 },
} = {}) {
  // State
  const keys = { forward: false, backward: false, left: false, right: false, sprint: false };
  let yaw = 0;
  let pitch = 0;
  let isPointerLocked = false;

  // Listeners
  const onClick = () => {
    if (!isPointerLocked) {
      domElement.requestPointerLock();
    }
  };
  const onPointerLockChange = () => {
    isPointerLocked = document.pointerLockElement === domElement;
    if (isPointerLocked) {
      console.log('🎮 Mode FPS activé - ZQSD pour bouger, Souris pour regarder');
    } else {
      console.log('🖱️ Souris déverrouillée - Cliquez pour réactiver');
    }
  };
  const onMouseMove = (e) => {
    if (!isPointerLocked) return;
    yaw -= e.movementX * lookSpeed;
    pitch -= e.movementY * lookSpeed;
    pitch = Math.max(-Math.PI / 2, Math.min(Math.PI / 2, pitch));
    camera.rotation.y = yaw;
    camera.rotation.x = pitch;
  };
  const onKeyDown = (e) => {
    switch (e.key.toLowerCase()) {
      case 'z':
      case 'w': keys.forward = true; break;
      case 's': keys.backward = true; break;
      case 'q':
      case 'a': keys.left = true; break;
      case 'd': keys.right = true; break;
      case 'shift': keys.sprint = true; break;
    }
  };
  const onKeyUp = (e) => {
    switch (e.key.toLowerCase()) {
      case 'z':
      case 'w': keys.forward = false; break;
      case 's': keys.backward = false; break;
      case 'q':
      case 'a': keys.left = false; break;
      case 'd': keys.right = false; break;
      case 'shift': keys.sprint = false; break;
    }
  };

  domElement.addEventListener('click', onClick);
  document.addEventListener('pointerlockchange', onPointerLockChange);
  document.addEventListener('mousemove', onMouseMove);
  window.addEventListener('keydown', onKeyDown);
  window.addEventListener('keyup', onKeyUp);

  console.log('✅ Contrôles FPS activés!');
  console.log('📌 ZQSD ou WASD = Se déplacer');
  console.log('📌 Souris = Regarder autour');
  console.log('📌 Shift = Sprint');
  console.log('📌 Cliquez pour activer la souris');

  // Collision State
  const collisionObjects = []; // Array of THREE.Box3

  function addCollisionObject(object) {
    const box = new THREE.Box3().setFromObject(object);
    collisionObjects.push(box);
  }

  function checkCollision(position) {
    // Create a small player bounding box at the new position
    const playerRadius = 0.3;
    const playerBox = new THREE.Box3(
      new THREE.Vector3(position.x - playerRadius, 0, position.z - playerRadius),
      new THREE.Vector3(position.x + playerRadius, 2, position.z + playerRadius)
    );

    for (const box of collisionObjects) {
      if (playerBox.intersectsBox(box)) {
        return true;
      }
    }
    return false;
  }

  function update() {
    const speed = keys.sprint ? moveSpeed * 2 : moveSpeed;
    const direction = new THREE.Vector3();
    if (keys.forward) direction.z -= 1;
    if (keys.backward) direction.z += 1;
    if (keys.left) direction.x -= 1;
    if (keys.right) direction.x += 1;
    if (direction.length() > 0) direction.normalize();

    const yawRotation = new THREE.Quaternion();
    yawRotation.setFromAxisAngle(new THREE.Vector3(0, 1, 0), yaw);
    direction.applyQuaternion(yawRotation);

    // Calculate potential new position
    const newPos = camera.position.clone();
    newPos.x += direction.x * speed;
    newPos.z += direction.z * speed;

    // Check Wall Bounds
    if (newPos.x < -bounds.x || newPos.x > bounds.x) newPos.x = camera.position.x;
    if (newPos.z < -bounds.z || newPos.z > bounds.z) newPos.z = camera.position.z;

    // Check Object Collisions
    if (!checkCollision(newPos)) {
      camera.position.x = newPos.x;
      camera.position.z = newPos.z;
    } else {
      // Sliding: Try moving only X or only Z
      const testX = camera.position.clone();
      testX.x += direction.x * speed;
      if (!checkCollision(testX) && testX.x >= -bounds.x && testX.x <= bounds.x) {
        camera.position.x = testX.x;
      }

      const testZ = camera.position.clone();
      testZ.z += direction.z * speed;
      if (!checkCollision(testZ) && testZ.z >= -bounds.z && testZ.z <= bounds.z) {
        camera.position.z = testZ.z;
      }
    }

    camera.position.y = 1.7;
  }

  function dispose() {
    domElement.removeEventListener('click', onClick);
    document.removeEventListener('pointerlockchange', onPointerLockChange);
    document.removeEventListener('mousemove', onMouseMove);
    window.removeEventListener('keydown', onKeyDown);
    window.removeEventListener('keyup', onKeyUp);
  }

  return { update, dispose, addCollisionObject };
}