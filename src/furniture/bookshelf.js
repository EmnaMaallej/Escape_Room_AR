import * as THREE from 'three';

export function addBookshelf(scene, onCollision) {
  const bookcase = new THREE.Group();
  bookcase.position.set(3, 0, 5.75);
  scene.add(bookcase);

  const shelfWidth = 4, shelfHeight = 4, shelfDepth = 0.5;
  const wood = new THREE.MeshStandardMaterial({ color: 0x2a1810, roughness: 0.7 });
  const brass = new THREE.MeshStandardMaterial({ color: 0xd4af37, metalness: 0.9, roughness: 0.25 });

  const back = new THREE.Mesh(new THREE.BoxGeometry(shelfWidth, shelfHeight, 0.05), new THREE.MeshStandardMaterial({ color: 0x1e120b, roughness: 0.9 }));
  back.position.set(0, shelfHeight / 2, -shelfDepth / 2 + 0.025);
  bookcase.add(back);
  if (onCollision) onCollision(back);

  const sideL = new THREE.Mesh(new THREE.BoxGeometry(0.15, shelfHeight, shelfDepth), wood);
  sideL.position.set(-shelfWidth / 2 + 0.075, shelfHeight / 2, 0); bookcase.add(sideL);
  if (onCollision) onCollision(sideL);

  const sideR = sideL.clone(); sideR.position.x = shelfWidth / 2 - 0.075; bookcase.add(sideR);
  if (onCollision) onCollision(sideR);

  const top = new THREE.Mesh(new THREE.BoxGeometry(shelfWidth, 0.12, shelfDepth), wood);
  top.position.set(0, shelfHeight - 0.06, 0); bookcase.add(top);
  if (onCollision) onCollision(top);

  const bottom = new THREE.Mesh(new THREE.BoxGeometry(shelfWidth, 0.12, shelfDepth), wood);
  bottom.position.set(0, 0.06, 0); bookcase.add(bottom);
  if (onCollision) onCollision(bottom);

  [1.0, 2.0, 3.0].forEach(y => {
    const shelf = new THREE.Mesh(new THREE.BoxGeometry(shelfWidth - 0.2, 0.08, shelfDepth - 0.05), wood);
    shelf.position.set(0, y, 0);
    bookcase.add(shelf);
    if (onCollision) onCollision(shelf);
  });

  function leatherColor() {
    const hues = [0x5a2e1a, 0x7a4a2a, 0x2f3b4a, 0x3d2b1f, 0x6a3f2b, 0x2a2a2a, 0x4a2f2f, 0x304035];
    return hues[Math.floor(Math.random() * hues.length)];
  }

  function addStandingBook(x, y, z, h, w = 0.15, d = 0.22, color = leatherColor()) {
    const book = new THREE.Mesh(new THREE.BoxGeometry(w, h, d), new THREE.MeshStandardMaterial({ color, roughness: 0.6 }));
    book.position.set(x, y + h / 2, z);
    book.rotation.y = (Math.random() - 0.5) * 0.12;
    book.castShadow = true;
    bookcase.add(book);
  }

  function addStack(x, y, z, n = 3) {
    let yy = y + 0.05;
    for (let i = 0; i < n; i++) {
      const h = 0.06 + Math.random() * 0.05;
      const w = 0.18 + Math.random() * 0.06;
      const b = new THREE.Mesh(new THREE.BoxGeometry(w, h, 0.24), new THREE.MeshStandardMaterial({ color: leatherColor(), roughness: 0.65 }));
      b.position.set(x, yy + h / 2, z);
      b.castShadow = true;
      bookcase.add(b);
      yy += h + 0.01;
    }
  }

  const zRow = 0.18;
  [-1.7, -1.35, -1.0, -0.65, -0.3, 0.05, 0.4, 0.75, 1.1, 1.45, 1.8].forEach((x) => {
    addStandingBook(x, 0.12, -zRow, 0.5 + Math.random() * 0.35);
    addStandingBook(x, 1.12, -zRow, 0.55 + Math.random() * 0.3);
    addStandingBook(x, 2.12, -zRow, 0.5 + Math.random() * 0.35);
    addStandingBook(x, 3.12, -zRow, 0.45 + Math.random() * 0.25);
  });
  addStack(-1.9, 1.0, -0.12, 3);
  addStack(1.85, 2.0, -0.12, 4);

  const keyGroup = new THREE.Group();
  const keyRing = new THREE.Mesh(new THREE.TorusGeometry(0.05, 0.008, 10, 20), brass);
  keyRing.rotation.x = Math.PI / 2;
  const keyShaft = new THREE.Mesh(new THREE.CylinderGeometry(0.008, 0.008, 0.12, 10), brass);
  keyShaft.position.y = -0.1;
  const keyBit = new THREE.Mesh(new THREE.BoxGeometry(0.06, 0.02, 0.02), brass);
  keyBit.position.set(0, -0.15, 0);
  keyGroup.add(keyRing, keyShaft, keyBit);
  keyGroup.position.set(-1.5, 3.1, -0.12);
  bookcase.add(keyGroup);

  const shelfLight = new THREE.SpotLight(0xffd8a1, 1.6, 6, Math.PI / 4);
  shelfLight.position.set(3, 4.2, 5.0);
  shelfLight.target.position.set(3, 2, 5.75);
  scene.add(shelfLight, shelfLight.target);
}