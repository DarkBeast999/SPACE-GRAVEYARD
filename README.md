# 🚀 SPACE GRAVEYARD — They Never Came Home
### *An Interactive 3D Digital Space Exploration Museum*

An educational platform for students, curious minds, and space enthusiasts documenting humanity's abandoned spacecraft, rovers, landers, and scientific hardware left across the Solar System.

---

## 🌟 Key Features

- **🌐 The 3D Universe (Flagship Experience):**
  - Interactive 3D WebGL Solar System built with Three.js.
  - OrbitControls: Drag to rotate, scroll to zoom, smooth camera glide navigation.
  - Interactive **3D Mars Globe** featuring procedural iron-oxide terrain and pins for 10 historical landing sites (*Opportunity, Spirit, Curiosity, Perseverance & Ingenuity, Viking 1 & 2, Pathfinder, Phoenix, InSight*).
  - Interactive **3D Moon Globe** featuring lunar maria and pins for Apollo 11, Surveyor 3 & Apollo 12, Apollo 17, Lunokhod, and Chang'e.
  - **360° Panoramic Look Around**: Interactive surface panoramic viewer featuring authentic NASA mosaics (Perseverance Valley Sol 5000 and Apollo 12 Surveyor Crater) with clickable hotspots.
  - **Can You Reach It? Tool**: Speed-of-light radio delay calculator modeling signal propagation to distant spacecraft like Voyager 1 (> 23 hours one-way).

- **🏛️ The Permanent Collection (Explore):**
  - 28 curated photographic cards with natural language status badges (*Still Operating*, *Resting on Surface*, *Travelling Deep Space*).
  - Natural destination and status filtering with zero technical barriers.
  - Direct deep-links to examine each landing site directly in the 3D Universe.

- **📖 Story-First Explorer Profiles:**
  - Designed around visitor curiosity: *What is this machine? What happened to it? What did it discover? Where is it now?*
  - Authentic creative reconstruction disclosures on interpretive diary entries.
  - Integrated **Commemorative Postcard Studio**: Write a personal tribute and render a collector-grade $1600 \times 1000$ PNG postcard.
  - Expandable technical drawer preserving peer-reviewed NASA NSSDCA citations and exact coordinates.

- **⏳ The Cosmic Timeline (1957–Present):**
  - Chronological journey across four distinct historical eras.
  - Screen-edge navigation controls and keyboard arrow navigation.

- **🎮 Space Play Hub:**
  - **Space Quiz**: Fast-paced multiple-choice space trivia with instant explanations and score tracking.
  - **Asteroid Defender**: Action reaction game deflecting asteroids from deep-space probes.
  - **Mission Repair**: Approachable multi-stage puzzle solving real spacecraft engineering challenges (power buses, antenna alignment, solar dust clearing).

- **📚 Space Knowledge Centre:**
  - Structured educational reference covering *Spacecraft Engineering*, *Worlds We Explore*, *Science & Discoveries*, *Famous Missions*, and *Space Communication*.

- **🔇 Global Master Audio Engine:**
  - Strict sound gating enforcing **absolute silence** when sound is toggled OFF.
  - Synthesizes procedural carrier frequencies and radio chimes with zero external audio assets.

---

## ⚡ Quick Start

### Option A: Standalone Single-File (100% Offline)
Open **`SPACE_GRAVEYARD.html`** in any web browser. It contains all code, Three.js 3D engine, WOFF2 fonts, and images inlined into one portable 2.14 MB file.

### Option B: Run Source with Node.js
```bash
# 1. Install dependencies
npm install

# 2. Run local development server
npm run dev
# Opens at http://localhost:5173

# 3. Compile standalone single-file production build
npm run build
```

---

## 🛠️ Technology Stack

- **3D Graphics Engine:** Three.js (WebGL, OrbitControls, Raycasting, Procedural Canvas 2D Textures)
- **UI Framework:** React 18 + TypeScript + Vite
- **Single-File Bundler:** `vite-plugin-singlefile`
- **Styling:** Tailwind CSS + Custom Editorial Typography
- **Animations:** Framer Motion + Canvas 2D Context API
- **State Management:** Zustand (with LocalStorage persistence)
- **Routing:** React Router v6 (`HashRouter` for universal offline and server compatibility)
- **Audio:** Web Audio API (Native browser synthesis with global master mute)
- **Archival Data:** NASA NSSDCA, NASA Horizons API, UNOOSA Registry

---

*Submitted for the NASA Space Apps Challenge.*
