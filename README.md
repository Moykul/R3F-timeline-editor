# R3F Timeline Editor

## 🎯 Project Overview

This project is a animation timeline editor with Leva integration for React Three Fiber (R3F) applications. It enables real-time keyframe animation with bidirectional synchronization between a timeline and parameter controls, designed for modern VFX and 3D workflows.

---

## 🚀 Features & Achievements

### 1. Animation Timeline Interface
- Draggable timeline container with Material Design-inspired styling
- Toolbar and layout inspired by [animation-timeline-control demo](https://ievgennaida.github.io/animation-timeline-control/) created by Ievgen Naida (BIG THANKS!!!)
- Keyframe management with visual feedback and interpolation
- Real-time playback controls with frame-accurate scrubbing

### 2. Leva Integration Bridge
- Bidirectional sync between timeline keyframes and Leva parameter controls

### 3. 3D React 3 Fiber Integration
- Real-time parameter processing with effective value computation
- Three.js scene integration with correct canvas/UI layering
- Performance-optimized for smooth animation

---

## 🛠️ Technical Stack
- **React Three Fiber**: 3D rendering and scene management
- **Leva**: Parameter management and UI controls
- **animation-timeline-js**: Core timeline and keyframe logic
- **Material Design**: UI/UX styling principles

---

## 📦 Key Components

- `App.jsx`: Main application entry, sets up the timeline, Leva controls, and 3D scene
- `components/AnimationTimeline.jsx`: Timeline UI and keyframe management
- `components/timelineLevaControl.jsx`: Bridge between timeline and Leva controls
- `components/Scene.jsx`: R3F scene with animated objects and parameter-driven updates
- `components/useTimelineLerp.jsx`: Custom hook for smooth timeline-driven interpolation

---

## 🏁 Getting Started

1. **Install dependencies:**
   ```bash
   npm install
   ```
2. **Start the development server:**
   ```bash
   npm run dev
   ```
3. **Open your browser:**
   Visit [http://localhost:5173](http://localhost:5173) (or the port shown in your terminal)

---

## 💡 Inspiration & References

- **Primary Reference:**
  - [Timeline Demo](https://ievgennaida.github.io/animation-timeline-control/): Toolbar design, button styling, and keyframe visualization
- **Technical Frameworks:**
  - React Three Fiber, Leva, animation-timeline-js, Material Design

---

## 📁 Project Structure

```
src/
  App.jsx
  components/
    AnimationTimeline.jsx
    timelineLevaControl.jsx
    Scene.jsx
    useTimelineLerp.jsx
  hooks/
    useTimelineLerp.jsx
  index.css
  main.jsx
index.html
vite.config.js
tailwind.config.js
postcss.config.js
package.json
```

---

## 📝 License

This project is for educational and demonstration purposes. See `package.json` for dependencies' licenses.
