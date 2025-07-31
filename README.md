# React Three Fiber Animation Timeline Editor

A procedural animation timeline system for React Three Fiber that generates timeline tracks automatically from Leva control definitions. Create keyframe animations by adjusting sliders and playing them back in 3D scenes.

## What Is This?

This is an experimental tool that combines:
- **Leva controls** for real-time 3D object manipulation
- **Animation Timeline JS** for keyframe-based animation
- **React Three Fiber** for 3D rendering
- **Procedural track generation** - define parameters once, get both controls and timeline tracks

It's designed for prototyping 3D animations, educational purposes, and experimenting with timeline-based workflows in React.

**What works well:**
- Real-time parameter adjustment with immediate 3D feedback
- Automatic timeline track generation from parameter definitions
- JSON export/import for animation data
- Timeline scrubbing, playback, and looping
- Organized transform props (position, rotation, scale, opacity)

**What's a bit rough:**
- Built around a specific use case (animating transform properties)
- Depends on `animation-timeline-js` which isn't actively maintained
- CSS styling is somewhat brittle
- No comprehensive error handling
- Limited to basic interpolation
- Timeline UI can be finicky when dragging
- Not optimized for complex scenes or many objects

**This it's NOT!:**
- A production-ready animation library
- A replacement for professional animation tools
- Suitable for complex character animation
- Performance optimized for mobile devices

## Installation

### Prerequisites
- Node.js 16+
- React 18+

### Setup

1. Clone or copy the project files
2. Install dependencies:

```bash
npm install react react-dom
npm install @react-three/fiber @react-three/drei
npm install leva
npm install animation-timeline-js
```

3. Copy the component files to your project:
```
src/
  components/
    AnimatedScene.jsx
    AnimationTimeline.jsx
    Scene.jsx
    timelineLevaControl.jsx
    useTimelineLerp.jsx
    fileManager.jsx
    anim-timeline-r3f.css
    standalone-player.css
  App.jsx
  main.jsx
  index.css
```

4. Import the CSS in your main CSS file:
```css
@import './components/anim-timeline-r3f.css';
```

## Basic Usage

### 1. Define Your Parameters

The magic happens in `timelineLevaControl.jsx` where you define parameters once:

```jsx
const parameterDefinitions = useMemo(() => ({
  pos_x: { 
    value: 0, min: -5, max: 5, step: 0.01,
    timelineName: 'positionX',
    displayName: '📍 Position X',
    color: '#3B82F6',
    group: 'position'
  },
  // Add more parameters...
}), []);
```

This automatically creates:
- ✅ Leva control slider
- ✅ Timeline track with custom color
- ✅ Proper value normalization
- ✅ Keyframe support

### 2. Use in Your Scene

Apply the generated values to your 3D objects:

```jsx
const Scene = ({ cubePosition, cubeRotation, cubeScale }) => {
  const meshRef = useRef();
  
  useFrame(() => {
    if (meshRef.current) {
      meshRef.current.position.set(
        cubePosition.pos_x || 0,
        cubePosition.pos_y || 0,
        cubePosition.pos_z || 0
      );
      // Apply rotation, scale, etc.
    }
  });

  return (
    <mesh ref={meshRef}>
      <boxGeometry />
      <meshStandardMaterial />
    </mesh>
  );
};
```

### 3. Basic Workflow

1. **Adjust Leva controls** → See immediate changes in 3D
2. **Scrub timeline** → Move to different time positions  
3. **Adjust controls at different times** → Creates keyframes automatically
4. **Press Play** → Watch your animation
5. **Export JSON** → Save your animation data
6. **Import JSON** → Load saved animations

## Adding New Parameters

Want to animate opacity? Just add it to `parameterDefinitions`:

```jsx
opacity: {
  value: 1, min: 0, max: 1, step: 0.01,
  timelineName: 'opacity',
  displayName: '👻 Opacity',
  color: '#EC4899',
  group: 'opacity'
}
```

The system automatically:
- Creates a Leva slider (0 to 1)
- Generates a timeline track (pink color)  
- Handles normalization
- Groups it in `cubeOpacity` prop
- Supports keyframing

## File Structure

```
src/
├── components/
│   ├── AnimationTimeline.jsx      # Timeline UI and logic
│   ├── Scene.jsx                  # 3D scene with animated objects
│   ├── timelineLevaControl.jsx    # Parameter definitions & Leva controls  
│   ├── useTimelineLerp.jsx        # Smooth animation interpolation
│   ├── fileManager.jsx            # JSON import/export utilities
│   └── *.css                      # Styling for timeline and UI
├── App.jsx                        # Main app component
└── main.jsx                       # Entry point
```

## Configuration

### Timeline Settings
- **Duration**: Default 5000ms (5 seconds)
- **FPS**: 30fps for frame calculations
- **Interpolation**: Linear between keyframes

### Parameter Types
Currently supports:
- **Position**: -5 to +5 range
- **Rotation**: -180° to +180°  
- **Scale**: 0.1 to 3.0
- **Opacity**: 0 to 1

## Known Issues

1. **Timeline drag** can sometimes break the UI
2. **Rapid parameter changes** during playback may cause conflicts
3. **Large animations** (many keyframes) can become sluggish
4. **CSS specificity** issues with some UI frameworks
5. **Timeline visibility toggle** occasionally needs a page refresh

## Contributing

This is an experimental project. If you want to improve it:

1. Fork the repo
2. Make your changes
3. Test thoroughly with different parameter combinations
4. Submit a PR with clear description

**Useful contributions:**
- Better error handling
- Performance optimizations  
- Additional parameter types
- UI/UX improvements
- Documentation improvements

## License

MIT License - use it however you want, but don't blame us if it breaks.

## Dependencies

- `react` ^18.0.0
- `@react-three/fiber` ^8.0.0
- `@react-three/drei` ^9.0.0
- `leva` ^0.9.0
- `animation-timeline-js` ^1.4.2

## Browser Support

Works in modern browsers that support:
- ES6 modules
- WebGL 2.0
- CSS custom properties
- Flexbox

Tested primarily in Chrome/Firefox. Safari should work but may have styling quirks.

---

*Built for experimentation, education, and creative coding. Not recommended for production use without significant additional development.*