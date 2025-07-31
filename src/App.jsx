import React, { useEffect, useState, useCallback } from 'react';
import { Canvas } from '@react-three/fiber';
import { OrbitControls, Grid, Stats } from '@react-three/drei';
import { Suspense } from 'react';
import Scene from './components/Scene';
import TimelineLevaControl from './components/timelineLevaControl';
import './components/anim-timeline-r3f.css';

const DEBUG = false;

function fixThreeJsHTML() {
  const style = document.createElement('style');
  style.textContent = `
    canvas {
      position: fixed !important;
      top: 0 !important;
      left: 0 !important;
      width: 100% !important;
      height: 100% !important;
      z-index: 0 !important;
    }
    
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
  // SIMPLIFIED: Single state object instead of nested structure
  const [cubeTransforms, setCubeTransforms] = useState({
    pos_x: 0, pos_y: 0, pos_z: 0,
    rotation_x: 0, rotation_y: 0, rotation_z: 0,
    scale: 1,
    opacity: 1
  });
  
  const [timelineData, setTimelineData] = useState(null);

  // FIXED: Direct, simple update handler
  const handleCubeUpdate = useCallback((updateData) => {
    // Handle both direct Leva updates and organized timeline updates
    setCubeTransforms(prev => {
      const newState = { ...prev };
      
      // Direct property updates (from Leva)
      Object.entries(updateData).forEach(([key, value]) => {
        if (typeof value === 'number' && !isNaN(value)) {
          newState[key] = value;
        }
      });
      
      // Organized updates (from timeline)
      if (updateData.cubePosition) {
        Object.assign(newState, updateData.cubePosition);
      }
      if (updateData.cubeRotation) {
        Object.assign(newState, updateData.cubeRotation);
      }
      if (updateData.cubeScale) {
        Object.assign(newState, updateData.cubeScale);
      }
      if (updateData.cubeOpacity) {
        Object.assign(newState, updateData.cubeOpacity);
      }

      return newState;
    });
  }, []);

  const handleTimelineData = useCallback((data) => {
    setTimelineData(data);
    // Also update transforms from timeline data
    handleCubeUpdate(data);
  }, [handleCubeUpdate]);

  useEffect(() => {
    fixThreeJsHTML();
    return () => {
      document.removeEventListener('visibilitychange', fixThreeJsHTML);
    };
  }, []);

  // FIXED: Create organized props from flat state
  const organizedProps = {
    cubePosition: {
      pos_x: cubeTransforms.pos_x,
      pos_y: cubeTransforms.pos_y,
      pos_z: cubeTransforms.pos_z
    },
    cubeRotation: {
      rotation_x: cubeTransforms.rotation_x,
      rotation_y: cubeTransforms.rotation_y,
      rotation_z: cubeTransforms.rotation_z
    },
    cubeScale: {
      scale: cubeTransforms.scale
    },
    cubeOpacity: {
      opacity: cubeTransforms.opacity
    }
  };

  return (
    <>
      <TimelineLevaControl 
        onUpdate={handleCubeUpdate} 
        onTimelineData={handleTimelineData}
      />

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
          <ambientLight intensity={0.3} />
          <directionalLight 
            position={[10, 10, 5]} 
            intensity={1.2}
            castShadow
            shadow-mapSize={[2048, 2048]}
          />
          <pointLight position={[-10, -10, -5]} intensity={0.5} color="#4169E1" />
          <pointLight position={[10, -5, 10]} intensity={0.3} color="#FF6B6B" />
          
          <OrbitControls 
            enablePan={true}
            enableZoom={true}
            enableRotate={true}
            minDistance={2}
            maxDistance={50}
            dampingFactor={0.1}
            enableDamping={true}
          />
          
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
          
          {/* FIXED: Pass organized props directly */}
          <Scene 
            {...organizedProps}
            
            // Timeline props
            timelineInterpolation={timelineData}
            cubeValues={timelineData?.cubeValues}
            setCubeValues={timelineData?.setCubeValues}
            isPlayingRef={timelineData?.isPlayingRef}
            timelineDrivenRef={timelineData?.timelineDrivenRef}
            prevUserValuesRef={timelineData?.prevUserValuesRef}
          />
    
          {DEBUG && <Stats />}
        </Suspense>
      </Canvas>
    </>
  );
};

export default App;