// src/main.js
import * as THREE from 'three';
import { ClockPuzzle } from './puzzles/clock/ClockPuzzle.js'; // Updated import

import { createScene } from './core/scene.js';
import { createCamera } from './core/camera.js';
import { createRenderer } from './core/renderer.js';
import { createFPSControls } from './controls/fpsControls.js';
import { createHeadTrackerSocket } from './controls/headTrackerControls.js';

import { addGlobalLights } from './lights/globalLights.js';
import { loadTextures } from './textures/loadTextures.js';
import { buildRoom } from './room/buildRoom.js';

import { addCenterTable } from './props/centerTable.js';
import { addEscapePapers } from './props/papers.js';
import { addDoorAndKeypad } from './props/doorKeypad.js';
// import { addGrandfatherClock } from './props/grandfatherClock.js'; // Removed, handled by ClockPuzzle
import { addPainting } from './decor/painting.js';
import { addSofa } from './furniture/sofa.js';
import { addBookshelf } from './furniture/bookshelf.js';
import { addDeskAndChair } from './furniture/deskChair.js';
import { addChandelierBulbs } from './props/chandelierBulbs.js';

async function init() {
  const scene = createScene();
  const camera = createCamera();
  const renderer = createRenderer();
  const clock = new THREE.Clock(); // Added Clock

  // instantiate FPS controls (we will recreate if needed)
  let fps = createFPSControls(camera, renderer.domElement, {
    moveSpeed: 0.08,
    lookSpeed: 0.002,
    bounds: { x: 5.5, z: 5.5 }
  });

  // socket head tracker instance (not started until user connects)
  const headTrackerSocket = createHeadTrackerSocket(camera, {
    url: 'ws://localhost:8765',
    smoothing: 0.12
  });

  // default control
  let activeControls = fps;
  let usingHead = false;

  // toggle handler improved: dispose FPS listeners when switching to head-tracker
  window.addEventListener('keydown', async (e) => {
    if (e.key.toLowerCase() !== 'h') return;

    if (!usingHead) {
      // switch to head tracker: stop FPS listeners, start head socket
      try {
        // exit pointer lock to avoid mouse stealing focus
        if (document.pointerLockElement) {
          try { document.exitPointerLock(); } catch (_) { }
        }
        // dispose FPS events
        if (fps && typeof fps.dispose === 'function') {
          try { fps.dispose(); } catch (_) { }
        }
        // start head tracker and use it
        await headTrackerSocket.start();
        activeControls = headTrackerSocket;
        usingHead = true;
        console.log('Switched to head-tracking (socket). Press H to switch back.');
      } catch (err) {
        console.error('Failed to enable head-tracking:', err);
        // try to recreate FPS if disposal left things unusable
        if (!fps || typeof fps.update !== 'function') {
          fps = createFPSControls(camera, renderer.domElement, {
            moveSpeed: 0.08,
            lookSpeed: 0.002,
            bounds: { x: 5.5, z: 5.5 }
          });
          activeControls = fps;
        }
      }
    } else {
      // switch back to FPS: stop head tracker and recreate FPS handlers
      try {
        await headTrackerSocket.stop();
      } catch (err) {
        console.warn('Error stopping head tracker:', err);
      }
      fps = createFPSControls(camera, renderer.domElement, {
        moveSpeed: 0.08,
        lookSpeed: 0.002,
        bounds: { x: 5.5, z: 5.5 }
      });
      activeControls = fps;
      usingHead = false;
      console.log('Switched to mouse FPS controls. Press H to switch to head-tracking.');
    }
  });

  const { chandelierLight } = addGlobalLights(scene);

  const textures = await loadTextures();

  const onCollision = (obj) => {
    if (fps && fps.addCollisionObject) fps.addCollisionObject(obj);
  };

  buildRoom(scene, textures, onCollision);
  addCenterTable(scene, onCollision);
  const papers = addEscapePapers(scene, camera, renderer);
  addDoorAndKeypad(scene, onCollision);

  // Puzzle instantiation
  const puzzle1 = new ClockPuzzle(scene, camera, renderer, onCollision);

  addPainting(scene, textures.paintingTexture);
  addSofa(scene, onCollision);
  addBookshelf(scene, onCollision);
  addDeskAndChair(scene, onCollision);
  addChandelierBulbs(scene);

  let time = 0;
  function animate() {
    requestAnimationFrame(animate);
    const delta = clock.getDelta(); // Use delta
    time += delta;

    if (activeControls && typeof activeControls.update === 'function') {
      activeControls.update();
    }

    chandelierLight.intensity = 5.5 + Math.sin(time * 2) * 0.8;

    // Update Puzzle
    puzzle1.update(delta);

    if (papers && typeof papers.updateHover === 'function') papers.updateHover();

    renderer.render(scene, camera);
  }
  animate();

  window.addEventListener('resize', () => {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
  });

  console.log('Controls: H = toggle Head Tracking (socket) / Mouse look');
}

init().catch(err => {
  console.error('Initialization failed:', err);
});