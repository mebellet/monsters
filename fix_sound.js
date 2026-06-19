const fs = require('fs');
let content = fs.readFileSync('index.html', 'utf8');

// The original audio context generation is:
// let audioCtx;
// ...
// audioCtx = new (window.AudioContext || window.webkitAudioContext)();
// However, many browsers block AudioContext from starting if it's not strictly initiated inside a user gesture event listener.
// jsPsych handles some of this, but we should make sure playScratch is robust.

const oldPlayScratch = `    function playScratch(level) {
        if (!audioCtx) audioCtx = new (window.AudioContext || window.webkitAudioContext)();
        if (audioCtx.state === 'suspended') audioCtx.resume();

        let duration = 1.5;
        let osc = audioCtx.createOscillator();
        let gainNode = audioCtx.createGain();

        osc.type = 'sawtooth';
        osc.frequency.setValueAtTime(800 + (level * 100), audioCtx.currentTime);
        osc.frequency.linearRampToValueAtTime(1000 + (level * 100), audioCtx.currentTime + duration);

        let volume = baseTolerance * (0.2 + 0.1 * level);
        gainNode.gain.setValueAtTime(volume, audioCtx.currentTime);
        gainNode.gain.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + duration);

        osc.connect(gainNode);
        gainNode.connect(audioCtx.destination);
        osc.start();
        osc.stop(audioCtx.currentTime + duration);
    }`;

const newPlayScratch = `    function playScratch(level) {
        try {
            if (!audioCtx) audioCtx = new (window.AudioContext || window.webkitAudioContext)();
            if (audioCtx.state === 'suspended') audioCtx.resume();

            let duration = 1.5;
            let osc = audioCtx.createOscillator();
            let gainNode = audioCtx.createGain();

            osc.type = 'sawtooth';
            // Start lower for less harshness, but increase as level goes up.
            osc.frequency.setValueAtTime(400 + (level * 80), audioCtx.currentTime);
            osc.frequency.linearRampToValueAtTime(600 + (level * 80), audioCtx.currentTime + duration);

            let volume = baseTolerance * (0.1 + 0.05 * level);
            // Ensure volume doesn't exceed 1.0 to prevent clipping
            volume = Math.min(volume, 1.0);

            gainNode.gain.setValueAtTime(volume, audioCtx.currentTime);
            gainNode.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + duration);

            osc.connect(gainNode);
            gainNode.connect(audioCtx.destination);
            osc.start();
            osc.stop(audioCtx.currentTime + duration);
        } catch(e) {
            console.error("Audio playback failed: ", e);
        }
    }`;

content = content.replace(oldPlayScratch, newPlayScratch);

// Make sure that the Welcome screen clearly initializes the audioCtx. It already has:
// on_finish: function() { audioCtx = new ...; audioCtx.resume(); }

fs.writeFileSync('index.html', content);
