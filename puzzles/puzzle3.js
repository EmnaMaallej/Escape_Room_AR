// src/puzzles/puzzle3.js
import * as THREE from 'three';

export class BookPuzzle {
  constructor(scene, camera, renderer, bookMesh, autoOpen = false, soundManager = null) {
    this.scene = scene;
    this.camera = camera;
    this.renderer = renderer;
    this.bookMesh = bookMesh;
    this.soundManager = soundManager;

    this.raycaster = new THREE.Raycaster();
    this.mouse = new THREE.Vector2();

    this.pages = [
      'LOGBOOK - A5\n\n[Press E to open/close this book]\n[Press ESC to close]\n\nTime has frozen in this chamber.\nOnly those who understand its secrets\nmay find the way forward.',

      'Clue I - Victorian Bookshelf\n\nIn the dwelling of ancient whispers,\nKnowledge stands as eternal keeper.\nWhere light and shadow wed as one,\nSeek what separates the tales begun.\n\nBetween each realm of paper and ink,\nA silent void exists, I think.\nThese invisible borders count and tell,\nThe stories that within them dwell.',

      'Clue II - The Black Beast\n\nThe black beast guards an ancient art,\nNot in its teeth, nor in its heart.\nDescend your gaze to where shadows creep,\nWhere silent servants endless vigil keep.\n\nThey do not speak, they do not sing,\nYet beneath pressure, they change everything.\nCount the unseen masters of the sound,\nHidden where darkness meets the ground.',

      'Clue III - Mirror of Vanity\n\nBefore the gilded glass of vanity\'s throne,\nTwo souls gaze, yet stand alone.\nOne is real, one is deceived,\nBut only one has truly lived and breathed.\n\nIn this dance of light and lies,\nHow many walk beyond the guise?\nCount not the reflections that you see,\nBut those who hold true memory.',

      'Clue IV - The Sacred Assembly\n\nTen holy souls in their eternal stance,\nFrozen in their sacred trance.\nSome turn toward where the sun is born,\nWhere light breaks through the veil of morn.\n\nThese seekers of the eastern glow,\nThe ones who watch the daybreak show-\nTheir gaze is fixed on heaven\'s door,\nCount them well, and nothing more.\n\n===============================\nFINAL CODE: 4 - 3 - 1 - 5\n==============================='
    ];

    this.currentPage = 0;
    this.uiVisible = false;

    this.createUI();
    this.setupEvents();

    console.log('📚 BookPuzzle initialized');

    if (autoOpen) {
      this.showUI();
      console.log('📖 Book opened IMMEDIATELY!');
    }
  }

  // ---------------- UI ----------------

  createUI() {
    const panel = document.createElement('div');
    panel.style.position = 'fixed';
    panel.style.left = '50%';
    panel.style.top = '50%';
    panel.style.transform = 'translate(-50%, -50%)';
    panel.style.padding = '16px 20px';
    panel.style.background = 'rgba(10, 8, 5, 0.96)';
    panel.style.border = '2px solid #c9a773';
    panel.style.borderRadius = '10px';
    panel.style.color = '#f5e6d3';
    panel.style.fontFamily = 'Georgia, serif';
    panel.style.maxWidth = '520px';
    panel.style.whiteSpace = 'pre-line';
    panel.style.display = 'none';
    panel.style.zIndex = '3000';
    panel.style.boxShadow = '0 0 25px rgba(0,0,0,0.9)';

    const title = document.createElement('div');
    title.textContent = 'Ancient Logbook';
    title.style.fontWeight = 'bold';
    title.style.marginBottom = '8px';
    title.style.textAlign = 'center';
    title.style.fontSize = '18px';
    title.style.borderBottom = '1px solid #c9a773';
    title.style.paddingBottom = '8px';
    panel.appendChild(title);

    const textDiv = document.createElement('div');
    textDiv.style.minHeight = '220px';
    textDiv.style.marginBottom = '12px';
    textDiv.style.fontSize = '15px';
    textDiv.style.lineHeight = '1.7';
    panel.appendChild(textDiv);
    this.textDiv = textDiv;

    const controls = document.createElement('div');
    controls.style.display = 'flex';
    controls.style.justifyContent = 'space-between';
    controls.style.gap = '8px';

    const prevBtn = document.createElement('button');
    prevBtn.textContent = '◀ Previous';

    const nextBtn = document.createElement('button');
    nextBtn.textContent = 'Next ▶';

    const closeBtn = document.createElement('button');
    closeBtn.textContent = 'Close';

    [prevBtn, nextBtn, closeBtn].forEach((btn) => {
      btn.style.flex = '1';
      btn.style.background = '#3a2815';
      btn.style.color = '#f5e6d3';
      btn.style.border = '1px solid #c9a773';
      btn.style.padding = '8px 12px';
      btn.style.cursor = 'pointer';
      btn.style.fontFamily = 'Georgia, serif';
      btn.style.borderRadius = '4px';
    });

    prevBtn.onclick = () => this.goPage(-1);
    nextBtn.onclick = () => this.goPage(1);
    closeBtn.onclick = () => this.hideUI();

    controls.appendChild(prevBtn);
    controls.appendChild(closeBtn);
    controls.appendChild(nextBtn);
    panel.appendChild(controls);

    document.body.appendChild(panel);
    this.panel = panel;

    this.refreshPage();
  }

  refreshPage() {
    this.currentPage = Math.max(
      0,
      Math.min(this.pages.length - 1, this.currentPage)
    );
    this.textDiv.textContent = this.pages[this.currentPage];
  }

  goPage(delta) {
    this.currentPage += delta;
    this.refreshPage();
  }

  showUI() {
    this.uiVisible = true;
    this.panel.style.display = 'block';

    // Play book open sound every time
    if (this.soundManager) {
      this.soundManager.playBookOpen();
    }
  }

  hideUI() {
    this.uiVisible = false;
    this.panel.style.display = 'none';
  }

  toggleUI() {
    if (this.uiVisible) this.hideUI();
    else this.showUI();
  }

  // ---------------- EVENTS ----------------

  setupEvents() {
    // Keyboard: E toggles, ESC closes
    this.onKeyDown = (e) => {
      const k = e.key.toLowerCase();

      // Avoid toggling if user is typing in a field (future-proof)
      const tag = document.activeElement?.tagName?.toLowerCase();
      if (tag === 'input' || tag === 'textarea') return;

      if (k === 'e') {
        this.toggleUI();
      }

      if (e.key === 'Escape') {
        this.hideUI();
      }
    };

    window.addEventListener('keydown', this.onKeyDown);

    // Optional: keep click handler attached but do nothing (prevents old bugs)
    this.onClick = () => { };
    this.renderer.domElement.addEventListener('click', this.onClick);
  }

  cleanup() {
    this.renderer.domElement.removeEventListener('click', this.onClick);
    window.removeEventListener('keydown', this.onKeyDown);
    this.hideUI();
  }
}