import React, { useEffect, useState, useCallback } from 'react';
import { Canvas } from '@react-three/fiber';
import { OrbitControls, Grid, Stats } from '@react-three/drei';
import { Suspense } from 'react';
import Scene from './components/Scene';
import TimelineLevaControl from './components/timelineLevaControl';
import './components/anim-timeline-r3f.css';

// Debug flag - enable for troubleshooting
const DEBUG = false;

// Function to fix Three.js HTML elements
function fixThreeJsHTML() {
  const style = document.createElement('style');
  style.textContent = `
    /* Make Canvas appear below UI elements */
    canvas {
      position: fixed !important;
      top: 0 !important;
      left: 0 !important;
      width: 100% !important;
      height: 100% !important;
      z-index: 0 !important;
    }
    
    /* Timeline overlay styling */
    .timeline-overlay {
      position: fixed !important;
      top: 20px !important;
      left: 20px !important;
      z-index: 2000 !important;
      max-width: 400px !important;
      background: rgba(31, 41, 55, 0.95) !important;
      border-radius: 8px !important;
      padding: 10px !important;
      backdrop-filter: blur(10px) !important;
      border: 1px solid rgba(75, 85, 99, 0.5) !important;
    }
    
    /* Leva panel styling */
    .leva-c_leva__root {
      position: fixed !important;
      top: 20px !important;
      left: 440px !important;
      z-index: 3000 !important;
      max-height: 80vh !important;
      overflow-y: auto !important;
    }
    
    .leva-c_leva {
      background: rgba(31, 41, 55, 0.95) !important;
      backdrop-filter: blur(10px) !important;
      border-radius: 8px !important;
      border: 1px solid rgba(75, 85, 99, 0.5) !important;
    }
  `;
  document.head.appendChild(style);
}

const App = () => {
  const [cubePosition, setCubePosition] = useState({ pos_x: 0, pos_y: 0, pos_z: 0 });
  const [timelineData, setTimelineData] = useState(null);

  // Handle cube position updates from TimelineLevaControl
  const handleCubeUpdate = (newPosition) => {
    setCubePosition(prev => ({ ...prev, ...newPosition }));
  };

  // Handle timeline data from TimelineLevaControl
  const handleTimelineData = (data) => {
    setTimelineData(data);
  };

  useEffect(() => {
    fixThreeJsHTML();
    
    return () => {
      document.removeEventListener('visibilitychange', fixThreeJsHTML);
    };
  }, []);

  return (
    <>
      <TimelineLevaControl 
        onUpdate={handleCubeUpdate} 
        onTimelineData={handleTimelineData}
      />

      {/* 3D Canvas */}
      <Canvas
        shadows
        camera={{ 
          position: [5, 5, 5], 
          fov: 75,
          near: 0.1,
          far: 1000
        }}
        gl={{ 
          antialias: true,
          alpha: false,
          powerPreference: "high-performance" 
        }}
        style={{
          position: 'fixed',
          top: 0,
          left: 0,
          width: '100%',
          height: '100%',
          zIndex: 0,
          background: 'radial-gradient(ellipse at center, #1a1a2e 0%, #16213e 50%, #0f0f23 100%)'
        }}
      >
        <Suspense fallback={null}>
          {/* Lighting Setup */}
          <ambientLight intensity={0.3} />
          <directionalLight 
            position={[10, 10, 5]} 
            intensity={1}
            castShadow
            shadow-mapSize={[2048, 2048]}
          />
          <pointLight position={[-10, -10, -5]} intensity={0.5} color="#4169E1" />
          
          {/* Orbit Controls */}
          <OrbitControls 
            enablePan={true}
            enableZoom={true}
            enableRotate={true}
            minDistance={2}
            maxDistance={50}
            autoRotate={false}
            autoRotateSpeed={0.5}
          />
          
          {/* Ground Grid */}
          <Grid 
            position={[0, -2, 0]}
            args={[20, 20]}
            cellSize={1}
            cellThickness={0.5}
            cellColor="#333"
            sectionSize={5}
            sectionThickness={1}
            sectionColor="#666"
            fadeDistance={24}
            fadeStrength={1}
          />
          
          {/* Scene with Reference Objects - NOW WITH useTimelineLerp PROPS */}
          <Scene 
            cubePosition={cubePosition} 
            timelineInterpolation={timelineData}
            cubeValues={timelineData?.cubeValues}
            setCubeValues={timelineData?.setCubeValues}
            isPlayingRef={timelineData?.isPlayingRef}
            timelineDrivenRef={timelineData?.timelineDrivenRef}
            prevUserValuesRef={timelineData?.prevUserValuesRef}
          />
    
          {/* Performance Stats (optional) */}
          {DEBUG && <Stats />}
        </Suspense>
      </Canvas>
    </>
  );
};

export default App;