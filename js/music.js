
class GameMusic {

    constructor() {
        this.audio = null;
        this.master = null;
        this.isPlaying = false;
        this.timer = null;
        this.step = 0;
        this.bpm = 100;

        this.melody = [
            523.25, 659.25, 783.99, 659.25,
            587.33, 698.46, 880.00, 698.46,
            523.25, 659.25, 783.99, 880.00,
            987.77, 880.00, 783.99, 659.25
        ];

        this.bass = [
            130.81, 146.83, 164.81, 146.83
        ];
    }

    async start() {

        if (this.isPlaying) return;

        const AudioContextClass =
            window.AudioContext ||
            window.webkitAudioContext;

        if (!AudioContextClass) {
            alert("Web Audio API is not supported!");
            return;
        }

        this.audio = new AudioContextClass();

        await this.audio.resume();

        this.master = this.audio.createGain();
        this.master.gain.value = 0.99;

        this.master.connect(this.audio.destination);

        this.isPlaying = true;
        this.step = 0;

        this.playMusic();

        this.timer = setInterval(() => {
            this.playMusic();
        }, 60000 / this.bpm / 2);
    }

    playTone(freq, duration, volume, type) {

        const oscillator = this.audio.createOscillator();
        const gain = this.audio.createGain();

        oscillator.type = type;
        oscillator.frequency.value = freq;

        gain.gain.setValueAtTime(
            0.001,
            this.audio.currentTime
        );

        gain.gain.exponentialRampToValueAtTime(
            volume,
            this.audio.currentTime + 0.05
        );

        gain.gain.exponentialRampToValueAtTime(
            0.001,
            this.audio.currentTime + duration
        );

        oscillator.connect(gain);
        gain.connect(this.master);

        oscillator.start();
        oscillator.stop(this.audio.currentTime + duration);
    }

    playMusic() {

        const note = this.melody[
            this.step % this.melody.length
        ];

        // Main melody
        this.playTone(note, 0.65, 0.16, "triangle");

        // Soft harmony
        if (this.step % 2 === 0) {

            this.playTone(
                note / 2,
                1.0,
                0.07,
                "sine"
            );
        }

        // Bass
        if (this.step % 4 === 0) {

            const bassNote = this.bass[
                Math.floor(this.step / 4) % this.bass.length
            ];

            this.playTone(
                bassNote,
                1.2,
                0.12,
                "sine"
            );
        }

        this.step++;
    }

    stop() {

        if (!this.isPlaying) return;

        clearInterval(this.timer);

        this.isPlaying = false;

        const oldAudio = this.audio;

        this.audio = null;
        this.master = null;

        oldAudio.close();
    }
}

const gameMusic = new GameMusic();

