// soundEffects_WebSpeech.js
export class SoundManager {
    constructor() {
        this.audioContext = null;
        this.speechSynth = window.speechSynthesis;
        this.femaleVoice = null;
        this.started = false;
        this.timeRemaining = 300;
        this.timerRunning = false;
        this.timerDisplay = null;
        this.musicPlaying = false;

        this.initVoice();
        this.createTimerDisplay();
        console.log('🔊 Sound Manager initialized');
    }

    initVoice() {
        const setVoice = () => {
            const voices = this.speechSynth.getVoices();
            this.femaleVoice = voices.find(v =>
                v.name.includes('Female') || v.name.includes('Zira') ||
                v.name.includes('Google UK English Female') || v.name.includes('Samantha')
            ) || voices.find(v => v.lang.startsWith('en'));
            if (this.femaleVoice) console.log('✅ Voice:', this.femaleVoice.name);
        };
        if (this.speechSynth.getVoices().length > 0) setVoice();
        else this.speechSynth.addEventListener('voiceschanged', setVoice);
    }

    speak(text, rate = 1.0, pitch = 1.1) {
        if (!this.audioContext) this.audioContext = new (window.AudioContext || window.webkitAudioContext)();
        const utterance = new SpeechSynthesisUtterance(text);
        if (this.femaleVoice) utterance.voice = this.femaleVoice;
        utterance.rate = rate;
        utterance.pitch = pitch;
        utterance.volume = 1.0;
        this.speechSynth.speak(utterance);
        return utterance;
    }

    playBeep(frequency = 800, duration = 100, volume = 0.3) {
        if (!this.audioContext) this.audioContext = new (window.AudioContext || window.webkitAudioContext)();
        const oscillator = this.audioContext.createOscillator();
        const gainNode = this.audioContext.createGain();
        oscillator.connect(gainNode);
        gainNode.connect(this.audioContext.destination);
        oscillator.frequency.value = frequency;
        oscillator.type = 'sine';
        gainNode.gain.setValueAtTime(volume, this.audioContext.currentTime);
        gainNode.gain.exponentialRampToValueAtTime(0.01, this.audioContext.currentTime + duration / 1000);
        oscillator.start(this.audioContext.currentTime);
        oscillator.stop(this.audioContext.currentTime + duration / 1000);
    }

    playWakeUpSequence() {
        if (this.started) return;
        this.started = true;
        console.log('🌅 Game starting...');
        setTimeout(() => this.playWelcomeMessage(), 500);
    }

    playWelcomeMessage() {
        console.log('📢 Welcome message');
        this.startBackgroundMusic();
        this.speak("Welcome to the room. You have five minutes to exit.", 1.0, 1.1);
        setTimeout(() => {
            this.speak("Your time starts now!", 1.1, 1.2);
            this.startTimer();
        }, 4000);
    }

    playPuzzleSolved() {
        console.log('✅ Puzzle solved!');
        this.speak("Good job! You're on the right path.", 1.0, 1.1);
        setTimeout(() => this.speak("Now find the next puzzle.", 1.0, 1.1), 2500);
    }

    playGearFall() {
        console.log('⚙️ Gear fall!');
        this.playBeep(150, 200, 0.5);
        setTimeout(() => this.playBeep(100, 300, 0.4), 200);
    }

    playGearPlaced() {
        console.log('🔧 Gear placed!');
        this.playBeep(800, 150, 0.4);
        setTimeout(() => this.playBeep(1000, 100, 0.3), 150);
    }

    playDialTurn() {
        console.log('🔄 Dial!');
        this.playBeep(400, 80, 0.3);
    }

    playBoxUnlock() {
        console.log('🔓 Unlock!');
        this.playBeep(600, 200, 0.4);
        setTimeout(() => this.playBeep(800, 150, 0.35), 200);
        setTimeout(() => this.playBeep(1000, 200, 0.4), 400);
    }

    playBookOpen() {
        console.log('📖 Book!');
        this.playBeep(300, 100, 0.2);
        setTimeout(() => this.playBeep(350, 80, 0.15), 100);
    }

    playPinClick() { this.playBeep(600, 100, 0.3); }
    playPinError() { this.playBeep(200, 500, 0.4); }
    playPinSuccess() {
        this.playBeep(1200, 300, 0.4);
        setTimeout(() => this.playBeep(1400, 200, 0.3), 150);
    }

    startBackgroundMusic() {
        if (this.musicPlaying) return;
        if (!this.audioContext) this.audioContext = new (window.AudioContext || window.webkitAudioContext)();
        const createDrone = (freq, vol) => {
            const osc = this.audioContext.createOscillator();
            const gain = this.audioContext.createGain();
            osc.connect(gain);
            gain.connect(this.audioContext.destination);
            osc.frequency.value = freq;
            osc.type = 'sine';
            gain.gain.value = vol;
            osc.start();
            return { osc, gain };
        };
        this.drones = [createDrone(55, 0.03), createDrone(110, 0.02), createDrone(165, 0.015), createDrone(220, 0.01)];
        this.musicPlaying = true;
        console.log('🎵 Music started');
    }

    stopBackgroundMusic() {
        if (!this.musicPlaying || !this.drones) return;
        this.drones.forEach(({ osc, gain }) => {
            gain.gain.exponentialRampToValueAtTime(0.001, this.audioContext.currentTime + 1);
            setTimeout(() => osc.stop(), 1100);
        });
        this.drones = null;
        this.musicPlaying = false;
    }

    createTimerDisplay() {
        const timerDiv = document.createElement('div');
        timerDiv.id = 'game-timer';
        timerDiv.style.cssText = `
            position: fixed; top: 20px; left: 50%; transform: translateX(-50%);
            font-size: 48px; font-family: monospace; color: #888;
            text-shadow: 0 0 5px rgba(0,0,0,0.5); background: rgba(0,0,0,0.7);
            padding: 10px 30px; border-radius: 10px; border: 2px solid #555;
            z-index: 1000;
        `;
        timerDiv.textContent = '5:00';
        document.body.appendChild(timerDiv);
        this.timerDisplay = timerDiv;
        console.log('⏱️ Timer created');
    }

    startTimer() {
        if (this.timerRunning) return;
        this.timerRunning = true;
        console.log('⏱️ Timer started!');
        this.timerDisplay.style.color = '#00ff00';
        this.timerDisplay.style.textShadow = '0 0 10px #00ff00, 0 0 20px #00ff00';
        this.timerDisplay.style.borderColor = '#00ff00';

        this.timerInterval = setInterval(() => {
            this.timeRemaining--;
            const minutes = Math.floor(this.timeRemaining / 60);
            const seconds = this.timeRemaining % 60;
            this.timerDisplay.textContent = `${minutes}:${seconds.toString().padStart(2, '0')}`;

            if (this.timeRemaining <= 30) {
                this.timerDisplay.style.color = '#ff0000';
                this.timerDisplay.style.textShadow = '0 0 10px #ff0000';
                this.timerDisplay.style.borderColor = '#ff0000';
            } else if (this.timeRemaining <= 60) {
                this.timerDisplay.style.color = '#ffaa00';
                this.timerDisplay.style.textShadow = '0 0 10px #ffaa00';
                this.timerDisplay.style.borderColor = '#ffaa00';
            }

            // Voice warnings
            if (this.timeRemaining === 60) {
                this.speak("One minute remaining!", 1.1, 1.2);
            } else if (this.timeRemaining === 30) {
                this.speak("Thirty seconds left! Hurry!", 1.2, 1.3);
            } else if (this.timeRemaining <= 10 && this.timeRemaining > 0) {
                // Countdown from 10 to 1
                this.speak(this.timeRemaining.toString(), 1.3, 1.2);
            } else if (this.timeRemaining === 0) {
                this.speak("Zero!", 1.3, 1.2);
                setTimeout(() => this.gameOver(), 1000);
            }
        }, 1000);
    }

    stopTimer() {
        this.timerRunning = false;
        if (this.timerInterval) clearInterval(this.timerInterval);
    }

    gameOver() {
        this.stopTimer();
        this.speak("Failed!", 1.2, 1.0);
        setTimeout(() => {
            alert('TIME UP! You failed to escape...');
            window.location.reload();
        }, 2000);
    }

    victory() {
        this.stopTimer();
        this.speak("Congratulations! You've escaped the room!", 1.0, 1.2);
        this.timerDisplay.style.color = '#00ff00';
        this.timerDisplay.textContent = 'ESCAPED!';
        console.log('🎉 VICTORY!');
    }

    cleanup() {
        this.stopTimer();
        this.stopBackgroundMusic();
        this.speechSynth.cancel();
    }
}