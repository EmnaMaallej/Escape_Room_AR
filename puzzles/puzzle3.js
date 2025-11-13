// src/puzzles/puzzle3.js
import * as THREE from 'three';

export class BookPuzzle {
    constructor(scene, camera, renderer, bookMesh) {
        this.scene = scene;
        this.camera = camera;
        this.renderer = renderer;
        this.bookMesh = bookMesh;

        this.raycaster = new THREE.Raycaster();
        this.mouse = new THREE.Vector2();

        // Texte des pages – à adapter pour tes indices
        this.pages = [
`LOGBOOK — A5

Somewhere in this room,
a door answers only to numbers.`,
`Clue I
When the world awakens,
the hour hand of the great clock
whispers the first digit.`,
`Clue II
The minute hand,
pointing toward the eastern wall,
marks the second digit.`,
`Clue III
Count the corner lamps still burning
when the clock shows that hour.
That is the third digit.`,
`Clue IV
The last digit belongs
to the lock that guarded this very book.
Its gears remember.`
        ];
        this.currentPage = 0;
        this.uiVisible = false;

        this.createUI();
        this.setupEvents();
    }

    // ---------- UI HTML du livre ----------

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
        title.textContent = 'Logbook – A5';
        title.style.fontWeight = 'bold';
        title.style.marginBottom = '8px';
        panel.appendChild(title);

        const textDiv = document.createElement('div');
        textDiv.style.minHeight = '220px';
        textDiv.style.marginBottom = '12px';
        panel.appendChild(textDiv);
        this.textDiv = textDiv;

        const controls = document.createElement('div');
        controls.style.display = 'flex';
        controls.style.justifyContent = 'space-between';
        controls.style.gap = '8px';

        const prevBtn = document.createElement('button');
        prevBtn.textContent = '◀ Page';
        const nextBtn = document.createElement('button');
        nextBtn.textContent = 'Page ▶';
        const closeBtn = document.createElement('button');
        closeBtn.textContent = 'Fermer';

        [prevBtn, nextBtn, closeBtn].forEach(btn => {
            btn.style.flex = '1';
            btn.style.background = '#3a2815';
            btn.style.color = '#f5e6d3';
            btn.style.border = '1px solid #c9a773';
            btn.style.padding = '6px 10px';
            btn.style.cursor = 'pointer';
            btn.style.fontFamily = 'Georgia, serif';
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
        this.currentPage = Math.max(0, Math.min(this.pages.length - 1, this.currentPage));
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

    // ---------- Interaction 3D : clic sur le livre ----------

    setupEvents() {
        this.onClick = this.handleClick.bind(this);
        this.renderer.domElement.addEventListener('click', this.onClick);
    }

    screenToNDC(event) {
        const rect = this.renderer.domElement.getBoundingClientRect();
        this.mouse.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
        this.mouse.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;
    }

    handleClick(event) {
        if (!this.bookMesh || !this.bookMesh.visible) return;

        this.screenToNDC(event);
        this.raycaster.setFromCamera(this.mouse, this.camera);

        const hits = this.raycaster.intersectObject(this.bookMesh, false);
        if (hits.length > 0) {
            if (this.uiVisible) this.hideUI();
            else this.showUI();
        }
    }

    cleanup() {
        this.renderer.domElement.removeEventListener('click', this.onClick);
        this.hideUI();
    }
}
