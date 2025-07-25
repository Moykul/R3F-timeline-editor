import React, { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import { useTimelineLerp } from './useTimelineLerp';

const Scene = ({
  // Separated transform props - much cleaner!
  cubePosition = { pos_x: 0, pos_y: 0, pos_z: 0 },
  cubeRotation = { rotation_x: 0, rotation_y: 0, rotation_z: 0 },
  cubeScale = { scale: 1 },
  cubeOpacity = { opacity: 1 },
  
  // Timeline interpolation props
  timelineInterpolation = null,
  cubeValues = null,
  setCubeValues = null,
  isPlayingRef = null,
  timelineDrivenRef = null,
  prevUserValuesRef = null,
  isPlaying = true
}) => {
  const meshRef = useRef();
  const targetRef = useRef({ x: 0, y: 0, z: 0 });
  const currentRef = useRef({ x: 0, y: 0, z: 0 });

  // Check if we have useTimelineLerp props
  const shouldUseTimelineLerp = cubeValues && setCubeValues && isPlayingRef && timelineDrivenRef && prevUserValuesRef;
  
  // Timeline lerp for smooth animation interpolation
  useTimelineLerp({
    isPlayingRef,
    cubeValues,
    setCubeValues,
    targetValuesRef: targetRef,
    timelineDrivenRef,
    prevUserValuesRef,
    interpolationSpeed: 8.0,
    enabled: shouldUseTimelineLerp && isPlaying
  });

  // Apply all transforms to mesh
  useFrame(() => {
    if (!meshRef.current) return;

    // Apply position
    meshRef.current.position.set(
      cubePosition.pos_x || 0,
      cubePosition.pos_y || 0,
      cubePosition.pos_z || 0
    );
    
    // Apply rotation (convert degrees to radians)
    meshRef.current.rotation.set(
      (cubeRotation.rotation_x || 0) * Math.PI / 180,
      (cubeRotation.rotation_y || 0) * Math.PI / 180,
      (cubeRotation.rotation_z || 0) * Math.PI / 180
    );
    
    // Apply scale
    const scaleValue = cubeScale.scale !== undefined ? cubeScale.scale : 1;
    meshRef.current.scale.setScalar(scaleValue);
    
    // Apply opacity
    const opacityValue = cubeOpacity.opacity !== undefined ? cubeOpacity.opacity : 1;
    if (meshRef.current.material) {
      meshRef.current.material.opacity = opacityValue;
      meshRef.current.material.transparent = opacityValue < 1;
    }

    // Update current position for timeline lerp
    currentRef.current.x = cubePosition.pos_x || 0;
    currentRef.current.y = cubePosition.pos_y || 0;
    currentRef.current.z = cubePosition.pos_z || 0;
  });

  return (
    <>
      {/* Main animated cube */}
      <mesh ref={meshRef} castShadow receiveShadow>
        <boxGeometry args={[0.5, 0.5, 0.5]} />
        <meshStandardMaterial 
          color="#8B5CF6" 

        />
      </mesh>
      
      {/* Reference objects */}
      <mesh position={[2, 0, 0]} castShadow receiveShadow>
        <sphereGeometry args={[0.3, 32, 32]} />
        <meshStandardMaterial 
          color="#10B981"

        />
      </mesh>
      
      <mesh position={[-2, 0, 0]} castShadow receiveShadow>
        <cylinderGeometry args={[0.3, 0.3, 1, 32]} />
        <meshStandardMaterial 
          color="#F59E0B"

        />
      </mesh>
    </>
  );
};

export default Scene;