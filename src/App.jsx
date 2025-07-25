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
  // Organized state for different transform types
  const [cubeTransforms, setCubeTransforms] = useState({
    position: { pos_x: 0, pos_y: 0, pos_z: 0 },
    rotation: { rotation_x: 0, rotation_y: 0, rotation_z: 0 },
    scale: { scale: 1 },
    opacity: { opacity: 1 }
  });
  
  const [timelineData, setTimelineData] = useState(null);

  // Handle organized transform updates from TimelineLevaControl
  const handleCubeUpdate = useCallback((updateData) => {
    setCubeTransforms(prev => {
      const newTransforms = { ...prev };

      // Handle organized updates (from timeline)
      if (updateData.cubePosition) {
        newTransforms.position = { ...prev.position, ...updateData.cubePosition };
      }
      if (updateData.cubeRotation) {
        newTransforms.rotation = { ...prev.rotation, ...updateData.cubeRotation };
      }
      if (updateData.cubeScale) {
        newTransforms.scale = { ...prev.scale, ...updateData.cubeScale };
      }
      if (updateData.cubeOpacity) {
        newTransforms.opacity = { ...prev.opacity, ...updateData.cubeOpacity };
      }

      // Handle direct value updates (from Leva controls)
      Object.entries(updateData).forEach(([key, value]) => {
        if (key.startsWith('pos_')) {
          newTransforms.position[key] = value;
        } else if (key.startsWith('rotation_')) {
          newTransforms.rotation[key] = value;
        } else if (key === 'scale') {
          newTransforms.scale[key] = value;
        } else if (key === 'opacity') {
          newTransforms.opacity[key] = value;
        }
      });

      return newTransforms;
    });
  }, []);

  // Handle timeline data from TimelineLevaControl
  const handleTimelineData = useCallback((data) => {
    setTimelineData(data);
    
    // If timeline data includes organized transforms, update them
    if (data.cubePosition || data.cubeRotation || data.cubeScale || data.cubeOpacity) {
      handleCubeUpdate(data);
    }
  }, [handleCubeUpdate]);

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
          {/* Enhanced Lighting Setup */}
          <ambientLight intensity={0.3} />
          <directionalLight 
            position={[10, 10, 5]} 
            intensity={1.2}
            castShadow
            shadow-mapSize={[2048, 2048]}
            shadow-camera-near={0.1}
            shadow-camera-far={50}
            shadow-camera-left={-10}
            shadow-camera-right={10}
            shadow-camera-top={10}
            shadow-camera-bottom={-10}
          />
          <pointLight position={[-10, -10, -5]} intensity={0.5} color="#4169E1" />
          <pointLight position={[10, -5, 10]} intensity={0.3} color="#FF6B6B" />
          
          {/* Orbit Controls */}
          <OrbitControls 
            enablePan={true}
            enableZoom={true}
            enableRotate={true}
            minDistance={2}
            maxDistance={50}
            autoRotate={false}
            autoRotateSpeed={0.5}
            dampingFactor={0.1}
            enableDamping={true}
          />
          
          {/* Professional Ground Grid */}
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
            infiniteGrid={false}
          />
          
          {/* Scene with ORGANIZED TRANSFORM PROPS */}
          <Scene 
            cubePosition={cubeTransforms.position}
            cubeRotation={cubeTransforms.rotation}
            cubeScale={cubeTransforms.scale}
            cubeOpacity={cubeTransforms.opacity}
            
            timelineInterpolation={timelineData}
            cubeValues={timelineData?.cubeValues}
            setCubeValues={timelineData?.setCubeValues}
            isPlayingRef={timelineData?.isPlayingRef}
            timelineDrivenRef={timelineData?.timelineDrivenRef}
            prevUserValuesRef={timelineData?.prevUserValuesRef}
          />
    
          {/* Performance Stats (debug mode) */}
          {DEBUG && <Stats />}
        </Suspense>
      </Canvas>
    </>
  );
};

export default App;