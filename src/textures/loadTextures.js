import * as THREE from 'three';

export async function loadTextures() {
  const loader = new THREE.TextureLoader();

  async function safeLoad(path, label) {
    return new Promise((resolve) => {
      loader.load(
        path,
        tex => resolve(tex),
        undefined,
        err => {
          console.error(`Texture "${label}" failed at path: ${path}`, err);
          // Fallback: plain gray texture
          const fallback = new THREE.Texture(
            document.createElement('canvas')
          );
          resolve(fallback);
        }
      );
    });
  }

  // Adjust paths here if needed:
  // Paths are relative to index.html
  const wallTexture = await safeLoad('./src/textures/wallpaper.jpg', 'wall');
  const woodTexture = await safeLoad('./src/textures/wood_floor.jpg', 'wood floor');
  const carpetTexture = await safeLoad('./src/textures/carpet.jpg', 'carpet');
  const paintingTexture = await safeLoad('./src/textures/painting.jpg', 'painting');

  console.log('✅ Textures loaded (with fallbacks if errors).');
  return { wallTexture, woodTexture, carpetTexture, paintingTexture };
}