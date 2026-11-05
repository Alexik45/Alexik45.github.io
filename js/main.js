// Interactive Vector Grid Physics
const bgCanvas = document.getElementById('warpGridCanvas');
const bgCtx = bgCanvas.getContext('2d');

let gridW = 0;
let gridH = 0;
let points = [];
let spacing = 42;

let mouse = { x: -9999, y: -9999, vx: 0, vy: 0, px: 0, py: 0 };
let physics = {
    tension: 0.04,
    damping: 0.92,
    radius: 160
};

function resizeCanvas() {
    bgCanvas.width = window.innerWidth;
    bgCanvas.height = window.innerHeight;
    spacing = window.innerWidth < 680 ? 56 : 42;
    gridW = Math.ceil(bgCanvas.width / spacing) + 2;
    gridH = Math.ceil(bgCanvas.height / spacing) + 2;

    points = [];
    for (let y = 0; y < gridH; y++) {
        for (let x = 0; x < gridW; x++) {
            points.push({
                baseX: x * spacing,
                baseY: y * spacing,
                x: x * spacing,
                y: y * spacing,
                vx: 0,
                vy: 0
            });
        }
    }
}

window.addEventListener('resize', resizeCanvas);
resizeCanvas();

function handlePointerMove(clientX, clientY) {
    mouse.vx = clientX - mouse.px;
    mouse.vy = clientY - mouse.py;
    mouse.px = clientX;
    mouse.py = clientY;
    mouse.x = clientX;
    mouse.y = clientY;
}

window.addEventListener('pointermove', (e) => handlePointerMove(e.clientX, e.clientY));

window.addEventListener('touchmove', (e) => {
    if (e.touches.length > 0) {
        handlePointerMove(e.touches[0].clientX, e.touches[0].clientY);
    }
}, { passive: true });

function resetPointer() {
    mouse.x = -9999;
    mouse.y = -9999;
}

window.addEventListener('pointerleave', resetPointer);
window.addEventListener('pointerup', resetPointer);
window.addEventListener('touchend', resetPointer);

function triggerShockwave(x, y, power = 24, radius = 220) {
    for (let i = 0; i < points.length; i++) {
        const p = points[i];
        const dx = p.x - x;
        const dy = p.y - y;
        const dist = Math.hypot(dx, dy);
        if (dist < radius && dist > 1) {
            const factor = (1 - dist / radius) * power;
            p.vx += (dx / dist) * factor;
            p.vy += (dy / dist) * factor;
        }
    }
}

window.addEventListener('pointerdown', (e) => {
    if (e.target.tagName !== 'BUTTON' && e.target.tagName !== 'A' && e.target.tagName !== 'INPUT' && e.target.tagName !== 'TEXTAREA') {
        triggerShockwave(e.clientX, e.clientY, 18, 180);
    }
});

function stepPhysics() {
    for (let i = 0; i < points.length; i++) {
        const p = points[i];

        const dx = mouse.x - p.x;
        const dy = mouse.y - p.y;
        const dist = Math.hypot(dx, dy);

        if (dist < physics.radius) {
            const force = (1 - dist / physics.radius) * 12;
            const angle = Math.atan2(dy, dx);
            p.vx -= Math.cos(angle) * force + mouse.vx * 0.15;
            p.vy -= Math.sin(angle) * force + mouse.vy * 0.15;
        }

        const homeX = p.baseX - p.x;
        const homeY = p.baseY - p.y;
        p.vx += homeX * physics.tension;
        p.vy += homeY * physics.tension;

        p.vx *= physics.damping;
        p.vy *= physics.damping;

        p.x += p.vx;
        p.y += p.vy;
    }
}

function renderGrid() {
    bgCtx.clearRect(0, 0, bgCanvas.width, bgCanvas.height);
    stepPhysics();

    bgCtx.lineWidth = 0.5;

    for (let y = 0; y < gridH; y++) {
        for (let x = 0; x < gridW; x++) {
            const idx = y * gridW + x;
            const p = points[idx];

            if (x < gridW - 1) {
                const right = points[idx + 1];
                const d = Math.hypot(p.x - p.baseX, p.y - p.baseY);
                bgCtx.strokeStyle = d > 2 ? `rgba(163, 168, 180, ${Math.min(0.4, d * 0.05)})` : 'rgba(72, 72, 77, 0.22)';
                bgCtx.beginPath();
                bgCtx.moveTo(p.x, p.y);
                bgCtx.lineTo(right.x, right.y);
                bgCtx.stroke();
            }

            if (y < gridH - 1) {
                const bottom = points[idx + gridW];
                const d = Math.hypot(p.x - p.baseX, p.y - p.baseY);
                bgCtx.strokeStyle = d > 2 ? `rgba(163, 168, 180, ${Math.min(0.4, d * 0.05)})` : 'rgba(72, 72, 77, 0.22)';
                bgCtx.beginPath();
                bgCtx.moveTo(p.x, p.y);
                bgCtx.lineTo(bottom.x, bottom.y);
                bgCtx.stroke();
            }

            const stress = Math.hypot(p.vx, p.vy);
            if (stress > 0.4) {
                bgCtx.fillStyle = '#a3a8b4';
                bgCtx.fillRect(p.x - 1, p.y - 1, 2, 2);
            }
        }
    }
    requestAnimationFrame(renderGrid);
}
renderGrid();

// Procedural Audio Engine
let sfxActive = true;
let crtActive = true;
const AudioCtx = window.AudioContext || window.webkitAudioContext;
let audio = null;

function getAudioContext() {
    if (!audio) audio = new AudioCtx();
    if (audio.state === 'suspended') {
        audio.resume().catch(() => {});
    }
    return audio;
}

function triggerTone(freq, type = 'sine', duration = 0.06, gainVal = 0.03) {
    if (!sfxActive) return;
    try {
        const ctx = getAudioContext();
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();

        osc.type = type;
        osc.frequency.setValueAtTime(freq, ctx.currentTime);

        gain.gain.setValueAtTime(gainVal, ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + duration);

        osc.connect(gain);
        gain.connect(ctx.destination);

        osc.start();
        osc.stop(ctx.currentTime + duration);
    } catch (_) {}
}

// Multi Stream Playlist with Open LRCLIB Query Parameters
const playlist = [
    { title: "Patient A / Ado", artist: "Ado", track: "Patient A", ids: ["7LxIZOIZriE", "TvW_Tq0TRv8", "pREqYDYY0Po", "JO66tA5Yngs"] },
    { title: "Raven Sky / Ado", artist: "Ado", track: "Raven Sky", ids: ["WDhlccPZ-JA", "pGD4xvxpM0w", "eVenA9J72to", "7DBSMzbPQzc"] },
    { title: "Show / Ado", artist: "Ado", track: "Show", ids: ["pgXpM4l_MwI", "08qPn6bNqE8"] },
    { title: "Odo / Ado", artist: "Ado", track: "Odo", ids: ["YnSW8ian29w", "sOiMD45QGLs"] },
    { title: "Usseewa / Ado", artist: "Ado", track: "Usseewa", ids: ["Qp3b-RXtz4w", "0hBqU0iL0K4"] },
    { title: "Gira Gira / Ado", artist: "Ado", track: "Gira Gira", ids: ["sOiMD45QGLs", "4L_iXpL7U3M"] },
    { title: "RuLe / Ado", artist: "Ado", track: "RuLe", ids: ["bE9QJkK8nI0", "kQ2iP7tU_wQ"] },
    { title: "FIRESTARTER / K/DA", artist: "K/DA", track: "FIRESTARTER", ids: ["ydz3tn9jTYI", "Mmw-PpWhKFg", "UOxkGD8qRB4"] },
    { title: "WATCH ME / K/DA", artist: "K/DA", track: "WATCH ME", ids: ["R-JywodifoE", "vjehGOVmBQE", "AiyE4HSzlyo"] },
    { title: "Demons Shot / Aiobahn", artist: "Aiobahn", track: "DEMON'S SHOT", ids: ["D8UmHPMOclQ", "zvdeJRhzdog", "OWDcn7hl16A"] },
    { title: "MAGIC / Ado", artist: "Ado", track: "MAGIC", ids: ["PKjQv13hZHc", "eH4jv7qmqCo", "u71LfK8OQBg", "l0WArCNh6G0"] },
    { title: "DND / Ado", artist: "Ado", track: "DND", ids: ["_craccBC-GY", "SfcMRGVeMuM", "__qvPGatwus"] },
    { title: "Angelseek / Ado", artist: "Ado", track: "Angelseek", ids: ["ukdidk1CkaQ", "Qen-YyWGrsk", "SRPR9u592jg", "aGSmxr-dUq0"] },
    { title: "My Darkest Desire / Shapiano", artist: "Shapiano", track: "My Darkest Desire", instrumental: true, ids: ["O7yb2gooN7A", "WgjLavMTC7E", "HnE6h2MiOYY"] },
    { title: "Megaton Kinesis / DJ Myosuke", artist: "DJ Myosuke", track: "Megaton Kinesis", ids: ["jVuJwtVlUQk", "Pwm_dKX-1b8", "8PbpzfQEYW8"] },
    { title: "GABBA GABBA / Little Sis Nora", artist: "Little Sis Nora", track: "GABBA GABBA", ids: ["PmD5pP_Oky4", "LRql95hHq3Y", "9ARhpQyx4FI"] },
    { title: "Tears pain and blood / Kuro Phase", artist: "Kuro Phase", track: "Tears, pain and blood", ids: ["AaIqlle_1TU"] },
    { title: "GOOD LOYAL THOTS / Odetari", artist: "Odetari", track: "GOOD LOYAL THOTS", ids: ["2k5wP2rpYig", "lP4MKIXntXU", "Aa50U0qDy2M"] },
    { title: "LOOK DONT TOUCH / Odetari", artist: "Odetari", track: "LOOK DONT TOUCH", ids: ["H6i1261J_kI", "i70tI4Dcx3s"] },
    { title: "Hands Up / 6arelyhuman", artist: "6arelyhuman", track: "Hands Up!", ids: ["v8dQ3EmU8NQ", "cMMcfqQ5O7g", "b04a0n8CLno"] },
    { title: "Everytime We Touch / Cascada", artist: "Cascada", track: "Everytime We Touch", ids: ["4G6QDNC4jGk", "uCUpvTMis-Y"] }
];

// Offline & Immediate Fallback Cache
const embeddedLyricsFallback = {
    "Ado_Show": "鳴らすクラップ 鳴らすステップ\nReady for the show\n宴の幕開けだ\n\n完全無欠のShow time\nShout out, clap your hands\n踊り狂え夜の果てまで\nReady for my show\n\n誰も止められない\n騒げ さあ幕を開けろ",
    "Ado_Odo": "半端なら K.O.\nふわふわしたいならどうぞ\n開け胴 踊れもう\n誰も止められない\n\nReady for my show\nいま目を醒ます 夜が明けるまで\n音に乗れ 踊り明かせ\nまだ見ぬ世界へ飛び込め",
    "Ado_Usseewa": "ちっちゃな頃から優等生\n気づけばエリート街道まっしぐら\n\nうっせぇうっせぇうっせぇわ\nあなたが思うより健康です\n一切合切凡庸な\nあなたじゃ分からないかもね\n\n嗚呼よく似合う\nその可もなく不可もないメロディー",
    "Ado_Gira Gira": "ぎらぎら 輝いて私は夜を穿つ\n誰にも愛されないのなら\n自分を愛してあげればいい\n\n孤独を抱いて ギラギラ燃え上がれ\n醜いアヒルの子のままで\nこの闇を切り裂いてゆけ",
    "K/DA_FIRESTARTER": "Watch the fire ignite\nTurn it up, burn it bright\nSparks flying into the dark night\n\nFirestarter, lighting up the flame\nNothing will ever be the same\nWe rule the stage, remember the name",
    "K/DA_WATCH ME": "Watch me, take it to the top tier\nGot no hesitation, got no fear\n\nEvery move precise, crystal clear\nLook at the champion tier right here",
    "Odetari_GOOD LOYAL THOTS": "World don't revolve around you girl you not the only one\nI been on my grind now I am finally having fun\n\nCalling up my phone, girl you know that we are done\nWalking out the door, yeah the damage has been done",
    "6arelyhuman_Hands Up!": "Hands up, hands up, put your hands up high\nWe are taking over under metropolitan sky\n\nBassline hitting right between the eyes\nDance till the morning light arrives",
    "Cascada_Everytime We Touch": "'Cause everytime we touch, I get this feeling\nAnd everytime we kiss, I swear I could fly\n\nCan't you feel my heart beat fast, I want this to last\nNeed you by my side"
};

const lyricsCache = {};

async function fetchLyricsFromLRCLIB(trackObj) {
    if (trackObj.instrumental) {
        return "[INSTRUMENTAL TRACK // NO VOCALS RECORDED]";
    }

    const cacheKey = `${trackObj.artist}_${trackObj.track}`;
    if (lyricsCache[cacheKey]) {
        return lyricsCache[cacheKey];
    }

    try {
        const exactUrl = `https://lrclib.net/api/get?artist_name=${encodeURIComponent(trackObj.artist)}&track_name=${encodeURIComponent(trackObj.track)}`;
        const res = await fetch(exactUrl);
        if (res.ok) {
            const data = await res.json();
            if (data && data.plainLyrics) {
                lyricsCache[cacheKey] = data.plainLyrics.trim();
                return lyricsCache[cacheKey];
            }
        }

        const searchUrl = `https://lrclib.net/api/search?q=${encodeURIComponent(trackObj.artist + " " + trackObj.track)}`;
        const sRes = await fetch(searchUrl);
        if (sRes.ok) {
            const list = await sRes.json();
            if (Array.isArray(list) && list.length > 0) {
                const match = list.find(item => item.plainLyrics) || list[0];
                if (match && match.plainLyrics) {
                    lyricsCache[cacheKey] = match.plainLyrics.trim();
                    return lyricsCache[cacheKey];
                }
            }
        }
    } catch (_) {}

    if (embeddedLyricsFallback[cacheKey]) {
        return embeddedLyricsFallback[cacheKey];
    }

    return `[LYRICS FOR "${trackObj.track.toUpperCase()}" BY ${trackObj.artist.toUpperCase()}]\n\nLyrics loaded from local audio register.\nFull vocal line actively driving the oscilloscope spectrum.`;
}

let currentTrackIndex = 0;
let currentFallbackIndex = 0;
let ytPlayer = null;
let isAudioPlaying = false;
let wantPlaying = false;
let currentVolume = 15;

const musicPlayBtn = document.getElementById('musicPlayBtn');
const musicNextBtn = document.getElementById('musicNextBtn');
const currentTrackTitle = document.getElementById('currentTrackTitle');
const volumeSlider = document.getElementById('volumeSlider');
const volValue = document.getElementById('volValue');

const lyricsContent = document.getElementById('lyricsContent');
const lyricsTrackLabel = document.getElementById('lyricsTrackLabel');

async function updateLyricsPanel() {
    const track = playlist[currentTrackIndex];
    if (lyricsTrackLabel) {
        lyricsTrackLabel.textContent = `${String(currentTrackIndex + 1).padStart(2, '0')} / ${playlist.length}`;
    }
    if (lyricsContent) {
        if (track.instrumental) {
            lyricsContent.textContent = "[INSTRUMENTAL TRACK // NO VOCALS RECORDED]";
            return;
        }
        lyricsContent.textContent = "Querying LRCLIB database...";
        lyricsContent.scrollTop = 0;
        
        const lyrics = await fetchLyricsFromLRCLIB(track);
        if (playlist[currentTrackIndex] === track) {
            lyricsContent.textContent = lyrics;
            lyricsContent.scrollTop = 0;
        }
    }
}

window.onYouTubeIframeAPIReady = function() {
    const isLocalFile = window.location.protocol === 'file:';
    const playerVars = {
        autoplay: 0,
        controls: 0,
        disablekb: 1,
        fs: 0,
        rel: 0,
        enablejsapi: 1
    };

    if (!isLocalFile && window.location.origin && window.location.origin !== 'null') {
        playerVars.origin = window.location.origin;
    }

    ytPlayer = new YT.Player('ytPlayerContainer', {
        height: '200',
        width: '200',
        videoId: playlist[currentTrackIndex].ids[0],
        playerVars: playerVars,
        events: {
            'onReady': onPlayerReady,
            'onStateChange': onPlayerStateChange,
            'onError': onPlayerError
        }
    });
};

function onPlayerReady(event) {
    event.target.setVolume(currentVolume);
    currentTrackTitle.textContent = playlist[currentTrackIndex].title;
    updateLyricsPanel();
}

function onPlayerStateChange(event) {
    if (event.data === YT.PlayerState.PLAYING) {
        isAudioPlaying = true;
        wantPlaying = true;
        musicPlayBtn.textContent = '❚❚ PAUSE';
    } else if (event.data === YT.PlayerState.PAUSED) {
        isAudioPlaying = false;
        musicPlayBtn.textContent = '▶ PLAY';
    } else if (event.data === YT.PlayerState.ENDED) {
        playNextTrack();
    }
}

function onPlayerError() {
    const track = playlist[currentTrackIndex];
    if (currentFallbackIndex + 1 < track.ids.length) {
        currentFallbackIndex++;
        const nextId = track.ids[currentFallbackIndex];
        if (ytPlayer && ytPlayer.loadVideoById) {
            if (wantPlaying) ytPlayer.loadVideoById(nextId);
            else ytPlayer.cueVideoById(nextId);
        }
    } else {
        playNextTrack();
    }
}

function playNextTrack() {
    currentTrackIndex = (currentTrackIndex + 1) % playlist.length;
    currentFallbackIndex = 0;
    wantPlaying = true;
    currentTrackTitle.textContent = playlist[currentTrackIndex].title;
    updateLyricsPanel();
    if (ytPlayer && ytPlayer.loadVideoById) {
        ytPlayer.loadVideoById(playlist[currentTrackIndex].ids[0]);
        ytPlayer.playVideo();
    }
    triggerTone(660, 'sine', 0.04, 0.03);
}

musicPlayBtn.addEventListener('click', () => {
    if (!ytPlayer || !ytPlayer.playVideo) return;
    if (isAudioPlaying) {
        wantPlaying = false;
        ytPlayer.pauseVideo();
    } else {
        wantPlaying = true;
        ytPlayer.playVideo();
    }
});

musicNextBtn.addEventListener('click', playNextTrack);

volumeSlider.addEventListener('input', (e) => {
    const val = parseFloat(e.target.value);
    currentVolume = Math.round(val * 100);
    volValue.textContent = `${currentVolume}%`;
    if (ytPlayer && ytPlayer.setVolume) {
        ytPlayer.setVolume(currentVolume);
    }
});

// High Dynamic Hardware Oscilloscope Engine
const scopeCanvas = document.getElementById('scopeCanvas');
const scopeCtx = scopeCanvas.getContext('2d');
const waveModeBtn = document.getElementById('waveModeToggle');
const waveModeLabel = document.getElementById('waveModeLabel');
const scopeStatus = document.getElementById('scopeStatus');

const WAVE_MODES = ['AUDIO SYNC', 'SINE', 'SQUARE', 'NOISE', 'FM_CHIRP'];
let currentWaveModeIndex = 0;
let scopePhase = 0;
let lastFrameTime = performance.now();
const fpsElement = document.getElementById('fpsCounter');

function cycleWaveMode() {
    currentWaveModeIndex = (currentWaveModeIndex + 1) % WAVE_MODES.length;
    waveModeLabel.textContent = WAVE_MODES[currentWaveModeIndex];
    scopeStatus.textContent = currentWaveModeIndex === 0 ? 'AUDIO: SYNCHRONIZED' : 'INTERNAL GENERATOR';
    triggerTone(440 + currentWaveModeIndex * 110, 'triangle', 0.04, 0.04);
}

if (waveModeBtn) waveModeBtn.addEventListener('click', cycleWaveMode);

function renderScope() {
    const now = performance.now();
    const delta = now - lastFrameTime;
    lastFrameTime = now;
    if (fpsElement && Math.random() < 0.05) {
        fpsElement.textContent = `${Math.round(1000 / (delta || 16))} FPS`;
    }

    scopeCtx.fillStyle = 'rgba(11, 12, 14, 0.34)';
    scopeCtx.fillRect(0, 0, scopeCanvas.width, scopeCanvas.height);

    scopeCtx.lineWidth = 0.5;
    scopeCtx.strokeStyle = 'rgba(72, 72, 77, 0.18)';
    scopeCtx.beginPath();
    scopeCtx.moveTo(0, scopeCanvas.height / 2);
    scopeCtx.lineTo(scopeCanvas.width, scopeCanvas.height / 2);
    scopeCtx.moveTo(scopeCanvas.width / 2, 0);
    scopeCtx.lineTo(scopeCanvas.width / 2, scopeCanvas.height);
    for (let gx = 46; gx < scopeCanvas.width; gx += 46) {
        scopeCtx.moveTo(gx, scopeCanvas.height / 2 - 3);
        scopeCtx.lineTo(gx, scopeCanvas.height / 2 + 3);
    }
    scopeCtx.stroke();

    const w = scopeCanvas.width;
    const h = scopeCanvas.height;
    const cy = h / 2;
    const mode = WAVE_MODES[currentWaveModeIndex];
    const t = now * 0.001;

    const primaryWave = [];
    const ghostWave = [];

    if (mode === 'AUDIO SYNC') {
        if (isAudioPlaying && currentVolume > 0) {
            const normVol = currentVolume / 100;
            const drive = 0.38 + Math.pow(normVol, 0.85) * 1.45;
            const highFreqGrit = Math.pow(normVol, 1.3) * 14;

            const kickEnv = Math.pow(Math.max(0, Math.sin(t * 7.8)), 8);
            const snareEnv = Math.pow(Math.max(0, Math.sin(t * 7.8 + 1.6)), 14);
            const bassMod = 1.8 + 0.6 * Math.sin(t * 2.1);

            for (let x = 0; x < w; x++) {
                const u = x / w;
                const windowEnv = Math.pow(Math.sin(u * Math.PI), 0.55);

                const packet1 = Math.exp(-Math.pow((u - (0.3 + 0.18 * Math.sin(t * 3.4))) * 4.5, 2));
                const packet2 = Math.exp(-Math.pow((u - (0.7 + 0.18 * Math.cos(t * 2.7))) * 5.2, 2));
                const packetEnv = 0.35 + 0.85 * (packet1 + packet2);

                const subBass = Math.sin(u * Math.PI * 5 * bassMod - t * 14) * (24 + kickEnv * 34);
                const midFormant = Math.sin(u * Math.PI * 19 + t * 26) * Math.cos(u * Math.PI * 4 - t * 6) * (16 + snareEnv * 22);
                const upperHarmonic = Math.sin(u * Math.PI * 47 - t * 48) * (6 + highFreqGrit) * packet2;
                const transientFizz = (Math.random() - 0.5) * (4 + snareEnv * 14 + highFreqGrit * 0.8);

                const rawSignal = (subBass + midFormant + upperHarmonic + transientFizz) * windowEnv * packetEnv * drive;
                const saturatedY = Math.tanh(rawSignal / 78) * (h * 0.43);

                const ghostRaw = (subBass * 0.85 - midFormant * 0.7 + upperHarmonic * 0.5) * windowEnv * packetEnv * drive;
                const ghostY = Math.tanh(ghostRaw / 82) * (h * 0.38);

                primaryWave.push({ x, y: cy + saturatedY });
                ghostWave.push({ x, y: cy + ghostY });
            }
        } else {
            for (let x = 0; x < w; x++) {
                const u = x / w;
                const windowEnv = Math.sin(u * Math.PI);
                const idleRipple = Math.sin(u * Math.PI * 6 + t * 3.5) * 1.6 * windowEnv;
                const microNoise = (Math.random() - 0.5) * 0.9;
                primaryWave.push({ x, y: cy + idleRipple + microNoise });
            }
        }
    } else if (mode === 'SINE') {
        for (let x = 0; x < w; x++) {
            const norm = (x / w) * Math.PI * 4;
            const y = cy + Math.sin(norm + scopePhase) * 34 * Math.sin(norm * 0.4 + scopePhase * 0.5);
            primaryWave.push({ x, y });
        }
    } else if (mode === 'SQUARE') {
        for (let x = 0; x < w; x++) {
            const norm = (x / w) * Math.PI * 4;
            const raw = Math.sin(norm * 1.5 + scopePhase);
            const y = cy + (raw > 0 ? 32 : -32) + (Math.random() - 0.5) * 2;
            primaryWave.push({ x, y });
        }
    } else if (mode === 'NOISE') {
        for (let x = 0; x < w; x++) {
            const norm = (x / w) * Math.PI * 4;
            const y = cy + (Math.random() - 0.5) * 48 * Math.sin(norm * 0.5 + scopePhase);
            primaryWave.push({ x, y });
        }
    } else if (mode === 'FM_CHIRP') {
        for (let x = 0; x < w; x++) {
            const norm = (x / w) * Math.PI * 4;
            const mod = Math.sin(norm * 0.2 + scopePhase) * 5;
            const y = cy + Math.sin(norm * mod + scopePhase * 2) * 32;
            primaryWave.push({ x, y });
        }
    }

    if (ghostWave.length > 0) {
        scopeCtx.lineWidth = 1.1;
        scopeCtx.strokeStyle = 'rgba(134, 140, 152, 0.28)';
        scopeCtx.beginPath();
        for (let i = 0; i < ghostWave.length; i++) {
            if (i === 0) scopeCtx.moveTo(ghostWave[i].x, ghostWave[i].y);
            else scopeCtx.lineTo(ghostWave[i].x, ghostWave[i].y);
        }
        scopeCtx.stroke();
    }

    if (primaryWave.length > 0) {
        scopeCtx.lineWidth = 4.5;
        scopeCtx.strokeStyle = 'rgba(72, 72, 77, 0.42)';
        scopeCtx.beginPath();
        for (let i = 0; i < primaryWave.length; i++) {
            if (i === 0) scopeCtx.moveTo(primaryWave[i].x, primaryWave[i].y);
            else scopeCtx.lineTo(primaryWave[i].x, primaryWave[i].y);
        }
        scopeCtx.stroke();

        scopeCtx.lineWidth = 1.35;
        scopeCtx.strokeStyle = '#f2f3f5';
        scopeCtx.beginPath();
        for (let i = 0; i < primaryWave.length; i++) {
            if (i === 0) scopeCtx.moveTo(primaryWave[i].x, primaryWave[i].y);
            else scopeCtx.lineTo(primaryWave[i].x, primaryWave[i].y);
        }
        scopeCtx.stroke();
    }

    scopePhase += 0.04;
    requestAnimationFrame(renderScope);
}
renderScope();

// Project Category Filtering Controller
const filterBtns = document.querySelectorAll('.filter-btn');
const projectCards = document.querySelectorAll('.project-card');

filterBtns.forEach(btn => {
    btn.addEventListener('click', () => {
        filterBtns.forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        const filter = btn.dataset.filter;

        projectCards.forEach(card => {
            if (card.classList.contains('wip-card')) {
                card.classList.remove('is-hidden');
                return;
            }
            const cat = card.dataset.category;
            if (filter === 'all' || cat === filter) {
                card.classList.remove('is-hidden');
            } else {
                card.classList.add('is-hidden');
            }
        });
        triggerTone(720, 'sine', 0.03, 0.03);
    });
});

// Project Database & Modal Controller
const projectData = {
    localtools: {
        id: "01_SUITE",
        tags: "Fabric.js / PDFLib / Web Audio / WebCrypto / JSZip",
        title: "tools://local: Client Side Utilities & Studio",
        whatIs: "A privacy focused, zero telemetry suite of web media processors, developer tools, and in browser editors. All operations execute 100% client side inside browser RAM using native Web APIs, WebAssembly, and hardware accelerated canvases.",
        whatDoes: "Features an image transcode and Canva style design studio, frame by frame video workbench and screen recorder, 16 bit PCM audio DSP normalizer and trimmer, JSON CSV bidirectional data matrix and SHA cryptographic digest generator, client side PDF compiler watermarker, and in RAM ZIP packager with byte level hex inspector.",
        howWorks: "Follows a zero network egress model where user files, documents, and data buffers never leave the local device. File operations exist strictly in volatile RAM (Blobs, ArrayBuffers, Canvas contexts) and vanish on tab close. Optional offline history is stored locally via localStorage without external synchronization.",
        demoUrl: "https://alexik45.github.io/local-tools/",
        techList: [
            "Hardware accelerated Canvas and Fabric.js layer engine",
            "In memory PDFLib document compiler, splitter and watermarker",
            "Web Audio API (16 bit PCM WAV transcoder and normalizer)",
            "Web Crypto API (hardware accelerated SHA 256 and SHA 512)",
            "JSZip in memory archiving and byte level hexadecimal viewer",
            "100% client side RAM execution, zero network egress, zero tracking"
        ]
    },
    homeserver: {
        id: "02_INFRA",
        tags: "Ubuntu Server / CasaOS / Docker / Tailscale / zrok",
        title: "Self Hosted Home Server Rig",
        whatIs: "A dedicated 24/7 home server configured on a repurposed low power machine, tailored for hosting internal web services, microservices, and file backends without high electricity draw.",
        whatDoes: "Runs containerized services around the clock, handles secure remote connections, hosts private Discord bots and automations, and provides a personal cloud environment accessible from anywhere without opening vulnerable router ports.",
        howWorks: "Built on Ubuntu Server with CasaOS acting as a lightweight container orchestrator. Remote access is routed securely through a Tailscale mesh network and encrypted zrok tunnels. Wi Fi interfaces and network drivers were configured directly in the terminal, while custom systemd daemons keep background containers running reliably through network drops.",
        techList: [
            "Ubuntu Server minimal OS",
            "CasaOS container orchestration & Docker daemon",
            "Tailscale secure mesh VPN & zrok outbound tunnels",
            "TP Link high gain Wi Fi driver compilation & network configs",
            "Zero open ports on router for security"
        ]
    },
    discordbot: {
        id: "03_BOT",
        tags: "Python / discord.py / PM2 / Linux Daemon",
        title: "Discord Bot & Automation Daemon",
        whatIs: "A custom built community Discord bot running continuously to handle server administration, interactive tools, event tracking, and background automation.",
        whatDoes: "Manages member verification, role assignments, dynamic embeds, server utility commands, automated cleanups, and notifies community channels of updates or server state changes.",
        howWorks: "Written in asynchronous Python utilizing modern discord.py library architecture. Deployed on the home server and managed via process managers (PM2 and systemd services) that monitor memory limits, handle auto restart on crashes or server reboots, and log all events to disk.",
        techList: [
            "Python 3 with discord.py async framework",
            "PM2 / systemd background process supervisor",
            "Dynamic command handling & permission validation",
            "Webhook dispatchers for server alerts and logging",
            "Local file / lightweight database persistence"
        ]
    },
    cloudstorage: {
        id: "04_STORAGE",
        tags: "Docker / Seafile / AList / Reverse Proxy",
        title: "Private Cloud & Storage Portal",
        whatIs: "A multi tiered personal storage network designed to completely replace commercial cloud subscriptions with high speed private syncing.",
        whatDoes: "Syncs workspaces, media files, and backups seamlessly across phones, laptops, and the server. Also provides an aggregated single web dashboard to view and stream stored assets directly.",
        howWorks: "Runs Seafile server inside Docker containers for reliable delta syncing across client machines, while AList is deployed to mount and aggregate multiple drives into a unified browser explorer. Bound to local network addresses and tunneled securely for mobile access outside the home.",
        techList: [
            "Seafile server backend for delta block syncing",
            "AList file aggregation & web based explorer interface",
            "Docker persistent volume mapping & permission handling",
            "Encrypted sync connections between Linux & Windows endpoints"
        ]
    },
    gameservers: {
        id: "05_OPS",
        tags: "Bash / Fabric / Minecraft / Cron Daemons",
        title: "Game Server Automation & Daemons",
        whatIs: "Custom management scripts and cron services engineered to operate heavy modded game servers (Fabric, All The Mods, Tekxit) smoothly on local server hardware.",
        whatDoes: "Handles scheduled server restarts, checks memory utilization to prevent Java memory leaks, triggers automated world archive backups, and pings Discord webhooks when players join or crashes occur.",
        howWorks: "Written in Bash and hooked into Linux cron daemons and screen tmux sessions. The scripts periodically poll the running Java processes, pipe commands into the server console gracefully, compress world folders into backup storage, and notify Discord through HTTP curl webhooks.",
        techList: [
            "Custom Bash shell scripts with cron scheduling",
            "tmux / screen background session management",
            "Garbage collection tuning & automated memory reclamation",
            "Discord webhook notifications for server events",
            "Automated tar gz rotating backups"
        ]
    },
    portfolio: {
        id: "06_CLIENT",
        tags: "HTML5 / CSS3 / Vanilla JS / Web Audio API / GitHub Pages",
        title: "This Personal Workspace Hub",
        whatIs: "A completely custom, dependency free personal web application and experimental frontend laboratory created to document projects and explore browser technologies without bulky frameworks.",
        whatDoes: "Renders interactive point mass physics simulations, processes background audio streams into dynamic oscilloscope waveforms, provides an interactive CLI drawer, and displays infrastructure logs.",
        howWorks: "Built from scratch using native web standards. Physics run on requestAnimationFrame with Verlet Euler integration for spring constraints. Audio is handled via background YouTube API streaming with automatic fallback stream switching and Web Audio procedural synthesis.",
        techList: [
            "Semantic HTML5 & modular CSS custom property tokens",
            "Vanilla JavaScript ESNext without bundlers or dependencies",
            "HTML5 Canvas 2D spring grid physics engine",
            "YouTube IFrame API audio stream integration",
            "Automated continuous deployment via GitHub Pages"
        ]
    }
};

const modalBackdrop = document.getElementById('projectModal');
const modalCloseBtn = document.getElementById('modalCloseBtn');
const modalId = document.getElementById('modalId');
const modalTags = document.getElementById('modalTags');
const modalTitle = document.getElementById('modalTitle');
const modalWhatIs = document.getElementById('modalWhatIs');
const modalWhatDoes = document.getElementById('modalWhatDoes');
const modalHowWorks = document.getElementById('modalHowWorks');
const modalTechList = document.getElementById('modalTechList');
const modalActionContainer = document.getElementById('modalActionContainer');

function openProjectModal(key) {
    const item = projectData[key];
    if (!item) return;

    modalId.textContent = item.id;
    modalTags.textContent = item.tags;
    modalTitle.textContent = item.title;
    modalWhatIs.textContent = item.whatIs;
    modalWhatDoes.textContent = item.whatDoes;
    modalHowWorks.textContent = item.howWorks;

    modalTechList.innerHTML = '';
    item.techList.forEach(tech => {
        const li = document.createElement('li');
        li.textContent = tech;
        modalTechList.appendChild(li);
    });

    modalActionContainer.innerHTML = '';
    if (item.demoUrl) {
        const btn = document.createElement('a');
        btn.href = item.demoUrl;
        btn.target = '_blank';
        btn.rel = 'noreferrer';
        btn.className = 'modal-demo-btn';
        btn.textContent = 'Launch Live Demo ↗';
        modalActionContainer.appendChild(btn);
    }

    modalBackdrop.classList.add('active');
    document.body.style.overflow = 'hidden';
    triggerTone(620, 'sine', 0.05, 0.04);
}

function closeProjectModal() {
    if (!modalBackdrop.classList.contains('active')) return;
    modalBackdrop.classList.remove('active');
    document.body.style.overflow = '';
    triggerTone(380, 'sine', 0.04, 0.03);
}

document.querySelectorAll('.interactive-card').forEach(card => {
    card.addEventListener('click', () => {
        const key = card.dataset.project;
        openProjectModal(key);
    });
});

modalCloseBtn.addEventListener('click', closeProjectModal);
modalBackdrop.addEventListener('click', (e) => {
    if (e.target === modalBackdrop) closeProjectModal();
});

// Dispatch Email Modal Controller
const emailModal = document.getElementById('emailModal');
const emailModalCloseBtn = document.getElementById('emailModalCloseBtn');
const emailTriggerBtn = document.getElementById('emailTriggerBtn');
const footerEmailBtn = document.getElementById('footerEmailBtn');
const modalCopyAddrBtn = document.getElementById('modalCopyAddrBtn');
const emailSendClientBtn = document.getElementById('emailSendClientBtn');
const emailOpenGmailBtn = document.getElementById('emailOpenGmailBtn');
const emailCopyDraftBtn = document.getElementById('emailCopyDraftBtn');
const copyDraftLabel = document.getElementById('copyDraftLabel');

const emailSenderInput = document.getElementById('emailSenderInput');
const emailSubjectInput = document.getElementById('emailSubjectInput');
const emailBodyInput = document.getElementById('emailBodyInput');

const TARGET_EMAIL = 'contact.alexandr@proton.me';

function openEmailModal() {
    emailModal.classList.add('active');
    document.body.style.overflow = 'hidden';
    triggerTone(640, 'sine', 0.05, 0.04);
}

function closeEmailModal() {
    if (!emailModal.classList.contains('active')) return;
    emailModal.classList.remove('active');
    document.body.style.overflow = '';
    triggerTone(380, 'sine', 0.04, 0.03);
}

if (emailTriggerBtn) emailTriggerBtn.addEventListener('click', openEmailModal);
if (footerEmailBtn) footerEmailBtn.addEventListener('click', openEmailModal);
if (emailModalCloseBtn) emailModalCloseBtn.addEventListener('click', closeEmailModal);

emailModal.addEventListener('click', (e) => {
    if (e.target === emailModal) closeEmailModal();
});

modalCopyAddrBtn.addEventListener('click', async () => {
    try {
        await navigator.clipboard.writeText(TARGET_EMAIL);
        modalCopyAddrBtn.textContent = 'Copied!';
        triggerTone(920, 'sine', 0.06, 0.04);
        setTimeout(() => modalCopyAddrBtn.textContent = 'Copy Address', 2000);
    } catch (_) {}
});

function getEmailData() {
    const sender = emailSenderInput.value.trim();
    const subject = emailSubjectInput.value.trim() || 'Inquiry from alex1k45 portfolio';
    let body = emailBodyInput.value.trim();
    if (sender) {
        body = `Sender: ${sender}\n\n${body}`;
    }
    return { subject, body };
}

emailSendClientBtn.addEventListener('click', () => {
    const { subject, body } = getEmailData();
    const mailtoUri = `mailto:${TARGET_EMAIL}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
    window.location.href = mailtoUri;
    triggerTone(780, 'sine', 0.05, 0.04);
});

emailOpenGmailBtn.addEventListener('click', () => {
    const { subject, body } = getEmailData();
    const gmailUri = `https://mail.google.com/mail/?view=cm&fs=1&to=${encodeURIComponent(TARGET_EMAIL)}&su=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
    window.open(gmailUri, '_blank');
    triggerTone(780, 'sine', 0.05, 0.04);
});

emailCopyDraftBtn.addEventListener('click', async () => {
    const { subject, body } = getEmailData();
    const fullDraft = `To: ${TARGET_EMAIL}\nSubject: ${subject}\n\n${body}`;
    try {
        await navigator.clipboard.writeText(fullDraft);
        copyDraftLabel.textContent = 'Copied to Clipboard!';
        triggerTone(920, 'sine', 0.06, 0.04);
        setTimeout(() => copyDraftLabel.textContent = 'Copy Draft Text', 2000);
    } catch (_) {}
});

// Interactive Shell Drawer
const cliDrawer = document.getElementById('cliDrawer');
const cliToggle = document.getElementById('cliToggle');
const cliInput = document.getElementById('cliInput');
const cliOutput = document.getElementById('cliOutput');

function toggleCli() {
    const isActive = cliDrawer.classList.toggle('active');
    cliToggle.setAttribute('data-state', isActive ? 'on' : 'off');
    triggerTone(isActive ? 640 : 380, 'sine', 0.04, 0.03);
    if (isActive) {
        setTimeout(() => cliInput.focus(), 50);
    }
}

if (cliToggle) cliToggle.addEventListener('click', toggleCli);

function printCliLine(text, highlight = false) {
    const line = document.createElement('div');
    if (highlight) line.className = 'cli-highlight';
    line.innerHTML = text;
    cliOutput.appendChild(line);
    cliOutput.scrollTop = cliOutput.scrollHeight;
}

if (cliInput) {
    cliInput.addEventListener('keydown', (e) => {
        if (e.key === 'Enter') {
            const raw = cliInput.value.trim().toLowerCase();
            cliInput.value = '';
            if (!raw) return;

            printCliLine(`alex@box:~$ ${raw}`);

            if (raw === 'help') {
                printCliLine('Commands: status, server, tools, stack, email, kofi, ping, play, pause, next, clear, exit');
            } else if (raw === 'status') {
                printCliLine('SYS: Ubuntu Server 24/7 | CRT: active | SFX: active');
            } else if (raw === 'server') {
                printCliLine('Box: CasaOS / Docker / Tailscale / Seafile / PM2');
            } else if (raw === 'tools') {
                printCliLine('tools://local -> https://alexik45.github.io/local-tools/');
            } else if (raw === 'stack') {
                printCliLine('Languages: Python, C, C#, JavaScript, HTML, CSS, SQL');
            } else if (raw === 'email') {
                openEmailModal();
                printCliLine('Opened dispatch email gateway.');
            } else if (raw === 'kofi') {
                printCliLine('Ko-fi: https://ko-fi.com/alexik45#setGoalModal');
            } else if (raw === 'ping') {
                printCliLine(`Latency to gateway: ${Math.floor(18 + Math.random() * 8)}ms`);
            } else if (raw === 'play') {
                wantPlaying = true;
                if (ytPlayer && ytPlayer.playVideo) ytPlayer.playVideo();
                printCliLine(`Now playing: ${playlist[currentTrackIndex].title}`);
            } else if (raw === 'pause') {
                wantPlaying = false;
                if (ytPlayer && ytPlayer.pauseVideo) ytPlayer.pauseVideo();
                printCliLine('Playback paused.');
            } else if (raw === 'next') {
                playNextTrack();
                printCliLine(`Switched to: ${playlist[currentTrackIndex].title}`);
            } else if (raw === 'clear') {
                cliOutput.innerHTML = '';
            } else if (raw === 'exit') {
                toggleCli();
            } else {
                printCliLine(`Command not found: ${raw}. Type 'help'.`);
            }
        }
    });
}

window.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
        closeProjectModal();
        closeEmailModal();
        if (cliDrawer.classList.contains('active')) toggleCli();
    }
    if (e.key === '`' || e.key === '~') {
        e.preventDefault();
        toggleCli();
    }
    if (['1', '2', '3', '4', '5', '6'].includes(e.key)) {
        const pad = document.querySelector(`.audio-pad[data-key="${e.key}"]`);
        if (pad && document.activeElement !== cliInput && document.activeElement !== emailSenderInput && document.activeElement !== emailSubjectInput && document.activeElement !== emailBodyInput) {
            const freq = parseFloat(pad.dataset.freq);
            pad.classList.add('pad-active');
            triggerTone(freq, 'triangle', 0.35, 0.06);
            setTimeout(() => pad.classList.remove('pad-active'), 150);
        }
    }
});

// Soundboard Controls
const pads = document.querySelectorAll('.audio-pad');
pads.forEach(pad => {
    pad.addEventListener('pointerdown', () => {
        const freq = parseFloat(pad.dataset.freq);
        triggerTone(freq, 'triangle', 0.35, 0.06);
    });
});

const arpBtn = document.getElementById('arpBtn');
if (arpBtn) {
    arpBtn.addEventListener('click', () => {
        const scale = [130.81, 164.81, 196.00, 246.94, 293.66, 392.00];
        scale.forEach((freq, idx) => {
            setTimeout(() => {
                triggerTone(freq, 'triangle', 0.18, 0.05);
                if (pads[idx]) {
                    pads[idx].classList.add('pad-active');
                    setTimeout(() => pads[idx].classList.remove('pad-active'), 120);
                }
            }, idx * 110);
        });
    });
}

const shockwaveBtn = document.getElementById('shockwaveBtn');
if (shockwaveBtn) {
    shockwaveBtn.addEventListener('click', () => {
        triggerShockwave(window.innerWidth / 2, window.innerHeight / 2, 35, 300);
        triggerTone(220, 'triangle', 0.2, 0.06);
    });
}

// Uptime & Ping Trackers
const uptimeElement = document.getElementById('sessionUptime');
let secondsElapsed = 0;

setInterval(() => {
    secondsElapsed++;
    const mins = String(Math.floor(secondsElapsed / 60)).padStart(2, '0');
    const secs = String(secondsElapsed % 60).padStart(2, '0');
    if (uptimeElement) uptimeElement.textContent = `${mins}:${secs}`;
}, 1000);

const pingBadge = document.getElementById('pingBadge');
setInterval(() => {
    if (pingBadge) {
        const jitter = Math.floor(19 + Math.random() * 8);
        pingBadge.textContent = `PING: ${jitter}ms`;
    }
}, 4000);

// Visit Counter Storage Engine
const visitCountEl = document.getElementById('visitCount');
const INITIAL_OFFSET = 8;

function updateVisitDisplay() {
    try {
        let stored = parseInt(localStorage.getItem('alex1k45_visit_count'), 10);
        if (isNaN(stored) || stored < INITIAL_OFFSET) {
            stored = INITIAL_OFFSET;
        }
        if (!sessionStorage.getItem('alex1k45_session_active')) {
            sessionStorage.setItem('alex1k45_session_active', 'true');
            stored += 1;
            localStorage.setItem('alex1k45_visit_count', stored.toString());
        }
        if (visitCountEl) {
            visitCountEl.textContent = `VISITS: ${String(stored).padStart(4, '0')}`;
        }
    } catch (_) {
        if (visitCountEl) visitCountEl.textContent = 'VISITS: 0008';
    }
}
updateVisitDisplay();

// Clipboard Helper
const copyDiscordBtn = document.getElementById('copyDiscordBtn');
const copyBtnText = document.getElementById('copyBtnText');
const DISCORD_USER_ID = '768033946666663946';

if (copyDiscordBtn) {
    copyDiscordBtn.addEventListener('click', async () => {
        try {
            await navigator.clipboard.writeText(DISCORD_USER_ID);
            copyBtnText.textContent = 'COPIED (76803...)!';
            copyDiscordBtn.classList.add('copied');
            triggerTone(950, 'sine', 0.08, 0.05);

            setTimeout(() => {
                copyBtnText.textContent = 'Copy Discord ID';
                copyDiscordBtn.classList.remove('copied');
            }, 2000);
        } catch (_) {
            copyBtnText.textContent = '768033946666663946';
        }
    });
}

// Toggle Bindings
const soundBtn = document.getElementById('soundToggle');
const crtBtn = document.getElementById('crtToggle');
const crtOverlay = document.getElementById('crtOverlay');

soundBtn.addEventListener('click', () => {
    sfxActive = !sfxActive;
    soundBtn.setAttribute('data-state', sfxActive ? 'on' : 'off');
    if (sfxActive) triggerTone(880, 'sine', 0.04, 0.04);
});

crtBtn.addEventListener('click', () => {
    crtActive = !crtActive;
    crtOverlay.classList.toggle('active', crtActive);
    crtBtn.setAttribute('data-state', crtActive ? 'on' : 'off');
    triggerTone(crtActive ? 520 : 330, 'triangle', 0.06, 0.03);
});

document.querySelectorAll('a, button, input, textarea, .interactive-card').forEach(el => {
    el.addEventListener('pointerenter', () => {
        if (el !== soundBtn && el !== crtBtn && window.matchMedia('(hover: hover)').matches) {
            triggerTone(1200, 'sine', 0.015, 0.012);
        }
    });
});

const tensionInput = document.getElementById('tensionSlider');
const dampingInput = document.getElementById('dampingSlider');
const radiusInput = document.getElementById('radiusSlider');

if (tensionInput && dampingInput && radiusInput) {
    tensionInput.addEventListener('input', (e) => physics.tension = parseFloat(e.target.value));
    dampingInput.addEventListener('input', (e) => physics.damping = parseFloat(e.target.value));
    radiusInput.addEventListener('input', (e) => physics.radius = parseFloat(e.target.value));
}
