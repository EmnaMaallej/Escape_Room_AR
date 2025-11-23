const CACHE_NAME = 'escape-room-v1';
const ASSETS = [
    './',
    './index.html',
    './src/main.js',
    './src/puzzles/BasePuzzle.js',
    './src/puzzles/clock/ClockPuzzle.js',
    './src/puzzles/clock/ClockView.js',
    './src/textures/wallpaper.jpg',
    './src/textures/wood_floor.jpg',
    './src/textures/carpet.jpg',
    './src/textures/painting.jpg',
    './models/vintage_leather_sofa.glb'
    // Add other assets here as needed
];

self.addEventListener('install', (e) => {
    e.waitUntil(
        caches.open(CACHE_NAME).then((cache) => cache.addAll(ASSETS))
    );
});

self.addEventListener('fetch', (e) => {
    e.respondWith(
        caches.match(e.request).then((response) => response || fetch(e.request))
    );
});
