import React, { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import { useTimelineLerp } from './useTimelineLerp';

const Scene = ({
  cubePosition = { pos_x: 0, pos_y: 0, pos_z: 0 },
  timelineInterpolation = null,
  cubeValues = null,
  setCubeValues = null,
  isPlayingRef = null,
  timelineDrivenRef = null,
  prevUserValuesRef = null,
  isPlaying = true // default true for backward compatibility
}) => {
  const meshRef = useRef();
  const targetRef = useRef({ x: 0, y: 0, z: 0 });
  const currentRef = useRef({ x: 0, y: 0, z: 0 });

  // Check if we have useTimelineLerp props
  const shouldUseTimelineLerp = cubeValues && setCubeValues && isPlayingRef && timelineDrivenRef && prevUserValuesRef;
  
  // FIXED: Always call useTimelineLerp, but make it conditional inside
  useTimelineLerp({
    isPlayingRef,
    cubeValues,
    setCubeValues,
    targetValuesRef: targetRef,
    timelineDrivenRef,
    prevUserValuesRef,
    interpolationSpeed: 8.0,
    enabled: shouldUseTimelineLerp && isPlaying // Only interpolate if playing
  });

  // Always update mesh position so timeline scrubbing updates the render even when paused
  useFrame(() => {
    currentRef.current.x = cubePosition.pos_x;
    currentRef.current.y = cubePosition.pos_y;
    currentRef.current.z = cubePosition.pos_z;
    if (meshRef.current) {
      meshRef.current.position.set(
        currentRef.current.x,
        currentRef.current.y,
        currentRef.current.z
      );
    }
  });

  return (
    <>
      <mesh ref={meshRef} castShadow receiveShadow>
        <boxGeometry args={[0.5, 0.5, 0.5]} />
        <meshStandardMaterial color="#8B5CF6" />
      </mesh>
      
      <mesh position={[2, 0, 0]} castShadow receiveShadow>
        <sphereGeometry args={[0.3, 32, 32]} />
        <meshStandardMaterial color="#10B981" />
      </mesh>
      
      <mesh position={[-2, 0, 0]} castShadow receiveShadow>
        <cylinderGeometry args={[0.3, 0.3, 1, 32]} />
        <meshStandardMaterial color="#F59E0B" />
      </mesh>
    </>
  );
};

export default Scene;