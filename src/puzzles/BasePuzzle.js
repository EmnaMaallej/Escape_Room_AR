export class BasePuzzle {
    constructor(scene, camera, renderer) {
        this.scene = scene;
        this.camera = camera;
        this.renderer = renderer;
        this.solved = false;
    }

    /**
     * Initialize the puzzle (load assets, create objects)
     */
    async load() {
        console.warn('load() not implemented');
    }

    /**
     * Update loop for animations and logic
     * @param {number} delta - Time since last frame
     */
    update(delta) {
        // Override me
    }

    /**
     * Handle interactions (clicks, etc)
     */
    onInteract(event) {
        // Override me
    }

    /**
     * Clean up resources
     */
    dispose() {
        // Override me
    }
}
