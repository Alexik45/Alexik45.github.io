# alex1k45 Personal Web Workspace

A lightweight, dependency free personal website and interactive development showcase. Built strictly with standard web technologies, running directly in the browser with zero build steps, external frameworks, or package managers.

Hosted on GitHub Pages at [https://alexik45.github.io/](https://alexik45.github.io/)

## Overview

This repository contains the source code for my personal web portal. The project serves as an interactive hub for my self hosted services, bots, and programming experiments, while doubling as a sandbox for vanilla JavaScript graphics and procedural audio synthesis.

The entire interface follows an industrial terminal aesthetic rendered in dark slate tones, featuring reactive canvas simulations, retro display filters, and keyboard driven tools.

## Architecture and Core Systems

1. Interactive Vector Mesh Physics
The background runs on an HTML5 Canvas layer executing a custom point mass physics simulation. Points are arranged in an elastic grid connected by distance constraints. Moving the cursor applies directional force vectors, while clicking or tapping anywhere on the screen detonates radial shockwaves that ripple across the vertex network. Tension, damping, and influence radius can be tuned in realtime via the laboratory control bus.
2. Procedural Web Audio Engine
All interface audio feedback and soundboard triggers are synthesized on the fly using the browser Web Audio API. The engine constructs oscillator nodes with exponential decay curves routed through master gain controllers, removing the need for external MP3 or WAV audio assets.
3. Signal Oscilloscope Simulation
The viewport beside the hero header simulates a hardware oscilloscope. It renders dynamic waveforms across four selectable mathematical algorithms: pure sine, hard clipping square wave, modulated noise, and frequency modulation chirp signals.
4. Terminal Command Line Drawer
Pressing the tilde key or toggling the header control reveals an integrated shell emulator. The command parser accepts standard query commands including help, status, server, stack, ping, and clear, with keyboard navigation and automatic scroll tracking.
5. Dynamic Visit Counter Integration
The header visit indicator asynchronously contacts CounterAPI upon initialization, incrementing the unique visit registry and rendering the historical total alongside session uptime counters.
6. Project Modal Inspector
Work items and infrastructure logs are decoupled from static external links. Clicking any project card launches a focused technical breakdown detailing architecture, deployment mechanisms, and daemon configurations.

## File Structure

```
.
├── index.html
├── css/
│   └── style.css
└── js/
│   └── main.js
└── README.md

```

1. index.html
Contains the complete semantic structure, accessible button markup, modal templates, canvas nodes, and vector icons.
2. css/style.css
Contains the color token system, layout grids, CRT phosphor scanline overlays, drafting corner borders, and mobile responsive adaptations.
3. js/main.js
Implements the background physics loop, procedural synthesizer, oscilloscope calculations, terminal logic, and DOM event listeners.

## Local Setup

No compilers, bundlers, or Node installations are required.

1. Clone the repository:
git clone [https://github.com/Alexik45/Alexik45.github.io.git](https://www.google.com/search?q=https://github.com/Alexik45/Alexik45.github.io.git)
2. Navigate into the directory:
cd Alexik45.github.io
3. Open the file directly in any modern web browser:
Open index.html in Firefox, Chromium, or Edge.

Alternatively, serve the directory with any local static file server such as Python:
python3 -m http.server 8080

## Keyboard Controls

1. Number keys 1 through 6 trigger synthesizer frequencies C3 to G4.
2. Tilde key toggles the interactive terminal drawer.
3. Escape key closes any active modal window or terminal session.
