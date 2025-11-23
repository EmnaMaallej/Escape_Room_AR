import * as THREE from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';

export function addSofa(scene, onLoaded) {
  const loader = new GLTFLoader();
  const path = '/models/vintage_leather_sofa.glb';

  console.log('Loading GLB Sofa from: ' + path);

  loader.load(
    path,
    (gltf) => {
      const model = gltf.scene;

      // Calculate original bounding box
      const box = new THREE.Box3().setFromObject(model);
      const size = new THREE.Vector3();
      box.getSize(size);

      console.log(`Sofa Loaded! Size: ${size.x.toFixed(2)} x ${size.y.toFixed(2)} x ${size.z.toFixed(2)}`);

      // Auto-scale to ~2.0 meters wide
      const targetWidth = 2.0;
      if (size.x > 0) {
        const scaleFactor = targetWidth / size.x;
        model.scale.setScalar(scaleFactor);
      }

      // Re-center geometry
      const center = new THREE.Vector3();
      box.getCenter(center);
      model.position.sub(center.multiplyScalar(model.scale.x)); // Center it

      // Align bottom to floor (y=0)
      const scaledHeight = size.y * model.scale.y;
      const yOffset = scaledHeight / 2;

      // Position next to the East wall (x=6), facing West (-x)
      model.position.add(new THREE.Vector3(4.75, yOffset, 2));

      // Rotate to face the room (West)
      model.rotation.y = 0;

      model.traverse((child) => {
        if (child.isMesh) {
          child.castShadow = true;
          child.receiveShadow = true;
          // Ensure material is visible and double-sided
          if (child.material) {
            child.material.side = THREE.DoubleSide;
            child.material.needsUpdate = true;
          }
        }
      });

      scene.add(model);

      if (onLoaded) onLoaded(model);

      console.log('✅ GLB Sofa loaded successfully');
    },
    (xhr) => {
      // Progress
    },
    (err) => {
      console.error('Failed to load Sofa GLB:', err);

      // Fallback: Create a placeholder box if loading fails
      const placeholder = new THREE.Mesh(
        new THREE.BoxGeometry(2, 1, 1),
        new THREE.MeshStandardMaterial({ color: 0xff0000, wireframe: true })
      );
      placeholder.position.set(5.45, 0.5, 2);
      scene.add(placeholder);
    }
  );
}