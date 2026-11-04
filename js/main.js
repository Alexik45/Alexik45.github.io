// Interactive Deformable Vector Grid & Shockwave Physics
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
    if (e.target.tagName !== 'BUTTON' && e.target.tagName !== 'A' && e.target.tagName !== 'INPUT') {
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

// Audio Engine, Synthesizer & Hardware Analyser
let sfxActive = true;
let crtActive = true;
const AudioCtx = window.AudioContext || window.webkitAudioContext;
let audio = null;
let bgSourceNode = null;
let bgAnalyserNode = null;
let audioDataArray = null;

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

// Ado Chronological Discography Queue (Newest to Oldest)
const adoPlaylist = [
    { title: "Ado - Mirror", file: "audio/mirror.mp3" },
    { title: "Ado - RuLe", file: "audio/rule.mp3" },
    { title: "Ado - Chocolat Cadabra", file: "audio/chocolat_cadabra.mp3" },
    { title: "Ado - Value", file: "audio/value.mp3" },
    { title: "Ado - DIGNITY", file: "audio/dignity.mp3" },
    { title: "Ado - Kura Kura", file: "audio/kura_kura.mp3" },
    { title: "Ado - Show", file: "audio/show.mp3" },
    { title: "Ado - I'm a Controversy", file: "audio/im_a_controversy.mp3" },
    { title: "Ado - Rebellion", file: "audio/rebellion.mp3" },
    { title: "Ado - Backlight (逆光)", file: "audio/backlight.mp3" },
    { title: "Ado - New Genesis (新時代)", file: "audio/new_genesis.mp3" },
    { title: "Ado - Ashura-chan", file: "audio/ashura_chan.mp3" },
    { title: "Ado - Yoru no Pierrot", file: "audio/yoru_no_pierrot.mp3" },
    { title: "Ado - Odo (踊)", file: "audio/odo.mp3" },
    { title: "Ado - Gira Gira (ギラギラ)", file: "audio/gira_gira.mp3" },
    { title: "Ado - Readymade", file: "audio/readymade.mp3" },
    { title: "Ado - Usseewa (うっせぇわ)", file: "audio/usseewa.mp3" }
];

let currentTrackIndex = 0;
const bgAudio = document.getElementById('bgAudio');
const musicPlayBtn = document.getElementById('musicPlayBtn');
const musicNextBtn = document.getElementById('musicNextBtn');
const currentTrackTitle = document.getElementById('currentTrackTitle');
const volumeSlider = document.getElementById('volumeSlider');
const volValue = document.getElementById('volValue');

function setupAudioPipeline() {
    if (bgAnalyserNode) return;
    try {
        const ctx = getAudioContext();
        bgAnalyserNode = ctx.createAnalyser();
        bgAnalyserNode.fftSize = 512;
        audioDataArray = new Uint8Array(bgAnalyserNode.frequencyBinCount);

        bgSourceNode = ctx.createMediaElementSource(bgAudio);
        bgSourceNode.connect(bgAnalyserNode);
        bgAnalyserNode.connect(ctx.destination);
    } catch (_) {}
}

function loadTrack(index) {
    currentTrackIndex = (index + adoPlaylist.length) % adoPlaylist.length;
    const track = adoPlaylist[currentTrackIndex];
    bgAudio.src = track.file;
    currentTrackTitle.textContent = track.title;
}

function playTrack() {
    setupAudioPipeline();
    const ctx = getAudioContext();
    if (ctx.state === 'suspended') ctx.resume();

    bgAudio.play().then(() => {
        musicPlayBtn.textContent = '❚❚ PAUSE';
    }).catch(() => {
        musicPlayBtn.textContent = '▶ PLAY';
    });
}

function pauseTrack() {
    bgAudio.pause();
    musicPlayBtn.textContent = '▶ PLAY';
}

bgAudio.volume = 0.15;
loadTrack(0);

bgAudio.addEventListener('ended', () => {
    loadTrack(currentTrackIndex + 1);
    playTrack();
});

musicPlayBtn.addEventListener('click', () => {
    if (bgAudio.paused) {
        playTrack();
    } else {
        pauseTrack();
    }
});

musicNextBtn.addEventListener('click', () => {
    loadTrack(currentTrackIndex + 1);
    playTrack();
    triggerTone(660, 'sine', 0.04, 0.03);
});

volumeSlider.addEventListener('input', (e) => {
    const val = parseFloat(e.target.value);
    bgAudio.volume = val;
    volValue.textContent = `${Math.round(val * 100)}%`;
});

// Autoplay trigger on first genuine page interaction
let interactionUnlocked = false;
function unlockAudioPlayback() {
    if (interactionUnlocked) return;
    interactionUnlocked = true;
    setupAudioPipeline();
    if (bgAudio.paused) {
        playTrack();
    }
    window.removeEventListener('pointerdown', unlockAudioPlayback);
    window.removeEventListener('keydown', unlockAudioPlayback);
}

window.addEventListener('pointerdown', unlockAudioPlayback);
window.addEventListener('keydown', unlockAudioPlayback);

// Multimode Hardware Oscilloscope (Default: AUDIO SYNC)
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

    scopeCtx.fillStyle = '#0d0e10';
    scopeCtx.fillRect(0, 0, scopeCanvas.width, scopeCanvas.height);

    scopeCtx.lineWidth = 1;
    scopeCtx.strokeStyle = 'rgba(72, 72, 77, 0.4)';
    scopeCtx.beginPath();
    scopeCtx.moveTo(0, scopeCanvas.height / 2);
    scopeCtx.lineTo(scopeCanvas.width, scopeCanvas.height / 2);
    scopeCtx.stroke();

    scopeCtx.lineWidth = 1.3;
    scopeCtx.strokeStyle = '#c8cbd0';
    scopeCtx.beginPath();

    const cy = scopeCanvas.height / 2;
    const mode = WAVE_MODES[currentWaveModeIndex];

    if (mode === 'AUDIO SYNC') {
        if (bgAnalyserNode && audioDataArray && !bgAudio.paused) {
            bgAnalyserNode.getByteTimeDomainData(audioDataArray);
            const sliceWidth = scopeCanvas.width / audioDataArray.length;
            let x = 0;

            for (let i = 0; i < audioDataArray.length; i++) {
                const v = audioDataArray[i] / 128.0;
                const y = (v * (scopeCanvas.height / 2));

                if (i === 0) scopeCtx.moveTo(x, y);
                else scopeCtx.lineTo(x, y);

                x += sliceWidth;
            }
        } else {
            // Idle acoustic sweep when audio is paused
            for (let x = 0; x < scopeCanvas.width; x++) {
                const norm = (x / scopeCanvas.width) * Math.PI * 4;
                const y = cy + Math.sin(norm + scopePhase) * 6 * Math.sin(norm * 0.2 + scopePhase * 0.2) + (Math.random() - 0.5);
                if (x === 0) scopeCtx.moveTo(x, y);
                else scopeCtx.lineTo(x, y);
            }
        }
    } else if (mode === 'SINE') {
        for (let x = 0; x < scopeCanvas.width; x++) {
            const norm = (x / scopeCanvas.width) * Math.PI * 4;
            const y = cy + Math.sin(norm + scopePhase) * 32 * Math.sin(norm * 0.4 + scopePhase * 0.5);
            if (x === 0) scopeCtx.moveTo(x, y);
            else scopeCtx.lineTo(x, y);
        }
    } else if (mode === 'SQUARE') {
        for (let x = 0; x < scopeCanvas.width; x++) {
            const norm = (x / scopeCanvas.width) * Math.PI * 4;
            const raw = Math.sin(norm * 1.5 + scopePhase);
            const y = cy + (raw > 0 ? 30 : -30) + (Math.random() - 0.5) * 2;
            if (x === 0) scopeCtx.moveTo(x, y);
            else scopeCtx.lineTo(x, y);
        }
    } else if (mode === 'NOISE') {
        for (let x = 0; x < scopeCanvas.width; x++) {
            const norm = (x / scopeCanvas.width) * Math.PI * 4;
            const y = cy + (Math.random() - 0.5) * 45 * Math.sin(norm * 0.5 + scopePhase);
            if (x === 0) scopeCtx.moveTo(x, y);
            else scopeCtx.lineTo(x, y);
        }
    } else if (mode === 'FM_CHIRP') {
        for (let x = 0; x < scopeCanvas.width; x++) {
            const norm = (x / scopeCanvas.width) * Math.PI * 4;
            const mod = Math.sin(norm * 0.2 + scopePhase) * 5;
            const y = cy + Math.sin(norm * mod + scopePhase * 2) * 30;
            if (x === 0) scopeCtx.moveTo(x, y);
            else scopeCtx.lineTo(x, y);
        }
    }

    scopeCtx.stroke();
    scopePhase += 0.035;
    requestAnimationFrame(renderScope);
}
renderScope();

// Project Details Database & Modal Controller
const projectData = {
    homeserver: {
        id: "01_INFRA",
        tags: "Ubuntu Server / CasaOS / Docker / Tailscale / zrok",
        title: "Self-Hosted Home Server Rig",
        whatIs: "A dedicated 24/7 home server configured on a repurposed low-power machine, tailored for hosting internal web services, microservices, and file backends without high electricity draw.",
        whatDoes: "Runs containerized services around the clock, handles secure remote connections, hosts private Discord bots and automations, and provides a personal cloud environment accessible from anywhere without opening vulnerable router ports.",
        howWorks: "Built on Ubuntu Server with CasaOS acting as a lightweight container orchestrator. Remote access is routed securely through a Tailscale mesh network and encrypted zrok tunnels. Wi-Fi interfaces and network drivers were configured directly in the terminal, while custom systemd daemons keep background containers running reliably through network drops.",
        techList: [
            "Ubuntu Server minimal OS",
            "CasaOS container orchestration & Docker daemon",
            "Tailscale secure mesh VPN & zrok outbound tunnels",
            "TP-Link high-gain Wi-Fi driver compilation & network configs",
            "Zero open ports on router for security"
        ]
    },
    discordbot: {
        id: "02_BOT",
        tags: "Python / discord.py / PM2 / Linux Daemon",
        title: "Discord Bot & Automation Daemon",
        whatIs: "A custom-built community Discord bot running continuously to handle server administration, interactive tools, event tracking, and background automation.",
        whatDoes: "Manages member verification, role assignments, dynamic embeds, server utility commands, automated cleanups, and notifies community channels of updates or server state changes.",
        howWorks: "Written in asynchronous Python utilizing modern discord.py library architecture. Deployed on the home server and managed via process managers (PM2 and systemd services) that monitor memory limits, handle auto-restart on crashes or server reboots, and log all events to disk.",
        techList: [
            "Python 3 with discord.py async framework",
            "PM2 / systemd background process supervisor",
            "Dynamic command handling & permission validation",
            "Webhook dispatchers for server alerts and logging",
            "Local file / lightweight database persistence"
        ]
    },
    cloudstorage: {
        id: "03_STORAGE",
        tags: "Docker / Seafile / AList / Reverse Proxy",
        title: "Private Cloud & Storage Portal",
        whatIs: "A multi-tiered personal storage network designed to completely replace commercial cloud subscriptions with high-speed private syncing.",
        whatDoes: "Syncs workspaces, media files, and backups seamlessly across phones, laptops, and the server. Also provides an aggregated single web dashboard to view and stream stored assets directly.",
        howWorks: "Runs Seafile server inside Docker containers for reliable delta-syncing across client machines, while AList is deployed to mount and aggregate multiple drives into a unified browser explorer. Bound to local network addresses and tunneled securely for mobile access outside the home.",
        techList: [
            "Seafile server backend for delta block syncing",
            "AList file aggregation & web-based explorer interface",
            "Docker persistent volume mapping & permission handling",
            "Encrypted sync connections between Linux & Windows endpoints"
        ]
    },
    gameservers: {
        id: "04_OPS",
        tags: "Bash / Fabric / Minecraft / Cron Daemons",
        title: "Game Server Automation & Daemons",
        whatIs: "Custom management scripts and cron services engineered to operate heavy modded game servers (Fabric, All The Mods, Tekxit) smoothly on local server hardware.",
        whatDoes: "Handles scheduled server restarts, checks memory utilization to prevent Java memory leaks, triggers automated world archive backups, and pings Discord webhooks when players join or crashes occur.",
        howWorks: "Written in Bash and hooked into Linux cron daemons and screen/tmux sessions. The scripts periodically poll the running Java processes, pipe commands into the server console gracefully, compress world folders into backup storage, and notify Discord through HTTP curl webhooks.",
        techList: [
            "Custom Bash shell scripts with cron scheduling",
            "tmux / screen background session management",
            "Garbage collection tuning & automated memory reclamation",
            "Discord webhook notifications for server events",
            "Automated tar.gz rotating backups"
        ]
    },
    portfolio: {
        id: "05_CLIENT",
        tags: "HTML5 / CSS3 / Vanilla JS / Web Audio API / GitHub Pages",
        title: "This Personal Workspace Hub",
        whatIs: "A completely custom, dependency-free personal web application and experimental frontend laboratory created to document projects and explore browser technologies without bulky frameworks.",
        whatDoes: "Renders interactive point-mass physics simulations, processes background audio streams into dynamic oscilloscope waveforms, provides an interactive CLI drawer, and displays infrastructure logs.",
        howWorks: "Built from scratch using native web standards. Physics run on requestAnimationFrame with Verlet/Euler integration for spring constraints. Audio is analyzed using Web Audio API's AnalyserNode, capturing real-time byte time domain amplitudes and mapping them to HTML5 Canvas coordinates.",
        techList: [
            "Semantic HTML5 & modular CSS custom property tokens",
            "Vanilla JavaScript ESNext without bundlers or dependencies",
            "HTML5 Canvas 2D spring grid physics engine",
            "Web Audio API real-time FFT frequency analyser & procedural synth",
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

// Interactive Terminal CLI Drawer
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
                printCliLine('Commands: status, server, stack, ping, ado, next, clear, exit');
            } else if (raw === 'status') {
                printCliLine('SYS: Ubuntu Server 24/7 | CRT: active | SFX: active');
            } else if (raw === 'server') {
                printCliLine('Box: CasaOS / Docker / Tailscale / Seafile / PM2');
            } else if (raw === 'stack') {
                printCliLine('Languages: Python, C, C#, JavaScript, HTML, CSS, SQL');
            } else if (raw === 'ping') {
                printCliLine(`Latency to gateway: ${Math.floor(18 + Math.random() * 8)}ms`);
            } else if (raw === 'ado') {
                printCliLine(`Current track: ${adoPlaylist[currentTrackIndex].title}`);
                playTrack();
            } else if (raw === 'next') {
                loadTrack(currentTrackIndex + 1);
                playTrack();
                printCliLine(`Switched to: ${adoPlaylist[currentTrackIndex].title}`);
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

// Global Shortcuts & Key Listener
window.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
        closeProjectModal();
        if (cliDrawer.classList.contains('active')) toggleCli();
    }
    if (e.key === '`' || e.key === '~') {
        e.preventDefault();
        toggleCli();
    }
    if (['1', '2', '3', '4', '5', '6'].includes(e.key)) {
        const pad = document.querySelector(`.audio-pad[data-key="${e.key}"]`);
        if (pad && document.activeElement !== cliInput) {
            const freq = parseFloat(pad.dataset.freq);
            pad.classList.add('pad-active');
            triggerTone(freq, 'triangle', 0.35, 0.06);
            setTimeout(() => pad.classList.remove('pad-active'), 150);
        }
    }
});

// Soundboard Controls & Arpeggiator
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

// Session Uptime & Gateway Ping Tickers
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

// Global Dynamic Visit Counter
const visitCountEl = document.getElementById('visitCount');
const INITIAL_OFFSET = 7;

async function fetchVisitCount() {
    try {
        const res = await fetch('https://api.counterapi.dev/v1/alex1k45_portfolio_hub/visits/up');
        if (!res.ok) throw new Error();
        const data = await res.json();
        const total = (data.count || 0) + INITIAL_OFFSET;
        if (visitCountEl) visitCountEl.textContent = `VISITS: ${String(total).padStart(4, '0')}`;
    } catch (_) {
        if (visitCountEl) visitCountEl.textContent = `VISITS: ${String(INITIAL_OFFSET + 1).padStart(4, '0')}`;
    }
}
fetchVisitCount();

// Click-to-Copy Discord ID
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

// UI Toggles & Control Bindings
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

document.querySelectorAll('a, button, input, .interactive-card').forEach(el => {
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
