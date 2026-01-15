# Mysterious Room VR

A WebXR-enabled Escape Room experience built with Three.js. This project transforms a standard 3D scene into an immersive Progressive Web App (PWA) with Virtual Reality support.

## 🌟 Features

### 🕶️ WebXR & Virtual Reality

- **Immersive VR Support**: Compatible with WebXR-enabled headsets (Meta Quest, HTC Vive, etc.).
- **Hybrid Controls**:
  - **Desktop**: FPS-style controls (WASD + Mouse Look).
  - **VR**: Head tracking for looking, "Exit VR" button overlay.
- **Stereoscopic Rendering**: Automatically switches to dual-eye rendering when a headset is detected.

### 📱 Progressive Web App (PWA)

- **Installable**: Can be installed as a standalone app on desktop and mobile.
- **Offline Capable**: Integrated Service Worker caches assets (models, textures) for offline play.
- **Mobile Optimized**: Enhanced viewport settings and touch-friendly interface.

### 🧩 Gameplay

- Explore a mysterious baroque-style room.
- Solve puzzles involving clocks, gears, and hidden codes.
- Interactive glowing objects and dynamic lighting.

## 🚀 Getting Started

### Prerequisites

- Node.js (for local development)
- A WebXR-compatible browser (Chrome, Edge, Firefox Reality, Oculus Browser)

### Installation

1. Clone the repository:
   ```bash
   git clone https://github.com/EmnaMaallej/Escape_Room_VR.git
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Run the development server:
   ```bash
   npm run dev
   ```

### CDN & Import Maps

The project utilizes modern ES modules and Import Maps to load Three.js via CDN, ensuring quick load times and easy dependency management without heavy bundling for the runtime.

## 🎮 Controls

| Mode        | Action   | Control                           |
| ----------- | -------- | --------------------------------- |
| **Desktop** | Move     | WASD / Arrows                     |
|             | Look     | Mouse                             |
|             | Sprint   | Shift                             |
|             | Interact | Left Click                        |
| **VR**      | Look     | Headset Movement                  |
|             | Exit     | 'Exit VR Mode' Button (Top Right) |

## 🛠️ Built With

- [Three.js](https://threejs.org/) - 3D Library
- [Vite](https://vitejs.dev/) - Build Tool
- [WebXR API](https://immersiveweb.dev/) - VR/AR Standard

## 📄 License

This project is open source.
