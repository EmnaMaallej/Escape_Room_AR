// src/puzzles/puzzle3.js
import * as THREE from 'three';

export class BookPuzzle {
  constructor(scene, camera, renderer, bookMesh, autoOpen = false) {
    this.scene = scene;
    this.camera = camera;
    this.renderer = renderer;
    this.bookMesh = bookMesh;

    this.raycaster = new THREE.Raycaster();
    this.mouse = new THREE.Vector2();

    this.pages = [
      'LOGBOOK — A5\n\n[Press E to open/close this book]\n[Press ESC to close]\n\nTime has frozen in this chamber.\nOnly those who understand its secrets\nmay find the way forward.',

      'Clue I — The First Digit\n\nFour sentinels of light stand watch\nat the corners where two walls meet.\nCount them carefully—\neach burns eternal against the encroaching dark.\n\nTheir number is your first key.',

      'Clue II — The Second Digit\n\nThe great clock knows balance.\nWhen both hands point to opposite horizons,\none reaches toward dawn, the other toward dusk.\n\nWhat hour divides the day in perfect symmetry?\nThat number is your second key.',

      'Clue III — The Third Digit\n\nFour walls imprison you.\nThree puzzles challenge your wit.\nTwo hands once moved to unlock the first gate.\n\nBut answer this final truth:\nWhen all mechanisms yield to your cunning,\nwhen all riddles bow before your mind,\nhow many thresholds lead to freedom beyond?\n\nHow many doors separate captivity from liberty?\nThe path is narrow, singular, and absolute.',

      'Clue IV — The Fourth Digit\n\nFour Roman sentinels mark the cardinal points:\nXII commands the north, VI the south,\nIII stands guard to the east, IX to the west.\n\nThe vertical axis holds XII and VI.\nThe horizontal axis bears III and IX.\n\nSum the numbers on the axis of dawn and dusk,\nthen subtract the number that faces the sunrise.\n\nWhat remains is your final answer.\n\nCODE: _ _ _ _'
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
    this.onClick = () => {};
    this.renderer.domElement.addEventListener('click', this.onClick);
  }

  cleanup() {
    this.renderer.domElement.removeEventListener('click', this.onClick);
    window.removeEventListener('keydown', this.onKeyDown);
    this.hideUI();
  }
}
