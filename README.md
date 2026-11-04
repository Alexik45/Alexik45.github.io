# alex1k45 Personal Web Workspace

A lightweight, dependency free personal website and interactive development showcase. Built strictly with standard web technologies, running directly in the browser with zero build steps, external frameworks, or package managers.

Hosted on GitHub Pages at [https://alexik45.github.io/](https://alexik45.github.io/)

## Overview

This repository contains the source code for my personal web portal. The project serves as an interactive hub for my self hosted services, bots, and programming experiments, while doubling as a sandbox for vanilla JavaScript graphics, physics models, and audio experiments.

The interface follows an industrial terminal aesthetic rendered in dark slate tones, featuring reactive canvas simulations, retro CRT display filters, audio streaming controls, and keyboard driven tools.

## Architecture and Core Systems

1. Interactive Vector Mesh Physics
The background runs on an HTML5 Canvas layer executing a custom point mass physics simulation. Points are arranged in an elastic grid connected by distance constraints. Moving the cursor applies directional force vectors, while clicking or tapping anywhere on the screen detonates radial shockwaves that ripple across the vertex network. Tension, damping, and influence radius can be tuned in realtime via the laboratory control bus.
2. Procedural Web Audio Engine
All interface audio feedback and soundboard triggers are synthesized on the fly using the browser Web Audio API. The engine constructs oscillator nodes with exponential decay curves routed through master gain controllers, removing the need for external sound sample files. An automated arpeggiator sweeps through frequency scales on demand.
3. Hardware Oscilloscope Simulation
The viewport beside the hero header simulates a hardware cathode-ray oscilloscope. In default mode, it renders a multi-harmonic audio sync waveform with phosphor decay persistence, electron beam blooming, and transient kick spikes. Clicking the mode control cycles through algorithmic generator modes: pure sine, hard clipping square wave, modulated noise, and frequency modulation chirp signals.
4. Background Stream Integration
Audio playback operates through a hidden YouTube IFrame API client, eliminating copyright liabilities and bandwidth overhead by pulling officially licensed streams directly from source servers. The custom player panel provides master gain attenuation, manual play and pause states, track queue progression, and track label dispatching for curated selections from Ado, K/DA, and Aiobahn.
5. Terminal Command Line Drawer
Pressing the tilde key or toggling the header control reveals an integrated shell emulator. The command parser accepts standard query and media control commands including help, status, server, stack, ping, play, pause, next, clear, and exit, with keyboard navigation and automatic scroll tracking.
6. Session Metrics and Dynamic Visit Counter
The header visit indicator asynchronously contacts CounterAPI upon initialization, incrementing the unique visit registry and rendering the historical total. A session uptime timer tracks client connection duration in seconds, while a latency badge computes simulated gateway jitter.
7. Project Modal Inspector
Work items and infrastructure logs are decoupled from static external links. Clicking any project card launches a focused technical breakdown detailing architecture, deployment mechanisms, and daemon configurations for the home server, Discord bots, storage systems, and the portfolio client itself.

## File Structure

```
.
├── index.html
├── css/
│   └── style.css
└── js/
    └── main.js
└── README.md

```

1. index.html
Contains semantic layout structures, accessible button elements, modal templates, canvas nodes, player controls, and third party API script references.
2. css/style.css
Contains custom color tokens, layout grids, CRT phosphor scanline overlays, drafting corner borders, custom sliders, and mobile responsive adaptations.
3. js/main.js
Implements the background physics loop, procedural synthesizer, YouTube stream bindings, oscilloscope canvas renderer, terminal command loop, and DOM event listeners.

## Local Setup

No compilers, bundlers, or Node installations are required.

1. Clone the repository:
git clone [https://github.com/Alexik45/Alexik45.github.io.git](https://github.com/Alexik45/Alexik45.github.io.git)
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
