import React, { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import { useTimelineLerp } from './useTimelineLerp';

const Scene = ({
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

  // Check if we have useTimelineLerp props
  const shouldUseTimelineLerp = cubeValues && setCubeValues && isPlayingRef && timelineDrivenRef && prevUserValuesRef;
  
  // Only use timeline lerp when actually playing AND timeline is driving
  const canUseLerp = shouldUseTimelineLerp && isPlaying && isPlayingRef?.current;
  
  // Timeline lerp for smooth animation interpolation
  useTimelineLerp({
    isPlayingRef,
    cubeValues,
    setCubeValues,
    targetValuesRef: targetRef,
    timelineDrivenRef,
    prevUserValuesRef,
    interpolationSpeed: 8.0,
    enabled: canUseLerp
  });

  // Apply transforms with targeted debugging
  useFrame(() => {
    if (!meshRef.current) return;

    // Get position values
    const pos = {
      x: cubePosition.pos_x || 0,
      y: cubePosition.pos_y || 0,
      z: cubePosition.pos_z || 0
    };

    // DEBUG: Only log when values look suspicious
    const isOutOfBounds = Math.abs(pos.x) > 100 || Math.abs(pos.y) > 100 || Math.abs(pos.z) > 100;
    const hasNaN = isNaN(pos.x) || isNaN(pos.y) || isNaN(pos.z);
    
    if (hasNaN || isOutOfBounds) {
      console.warn('🚨 Suspicious cube position:', {
        position: pos,
        isPlaying: isPlayingRef?.current,
        timelineDriven: timelineDrivenRef?.current,
        propsReceived: cubePosition
      });
    }

    // Apply position (with safety check)
    if (!hasNaN) {
      meshRef.current.position.set(pos.x, pos.y, pos.z);
    }
    
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

    // Update target for timeline lerp when needed
    if (timelineDrivenRef?.current) {
      targetRef.current.x = pos.x;
      targetRef.current.y = pos.y;
      targetRef.current.z = pos.z;
    }
  });

  return (
    <>
      {/* Main animated cube */}
      <mesh ref={meshRef} castShadow receiveShadow>
        <boxGeometry args={[0.5, 0.5, 0.5]} />
        <meshStandardMaterial 
          color="#8B5CF6" 
          metalness={0.1}
          roughness={0.2}
          emissive="#2D1B69"
          emissiveIntensity={0.1}
        />
      </mesh>
      
      {/* Reference objects */}
      <mesh position={[2, 0, 0]} castShadow receiveShadow>
        <sphereGeometry args={[0.3, 32, 32]} />
        <meshStandardMaterial 
          color="#10B981"
          metalness={0.2}
          roughness={0.3}
        />
      </mesh>
      
      <mesh position={[-2, 0, 0]} castShadow receiveShadow>
        <cylinderGeometry args={[0.3, 0.3, 1, 32]} />
        <meshStandardMaterial 
          color="#F59E0B"
          metalness={0.3}
          roughness={0.4}
        />
      </mesh>

      <mesh position={[0, 0, 2]} castShadow receiveShadow>
        <coneGeometry args={[0.2, 0.8, 16]} />
        <meshStandardMaterial color="#EF4444" />
      </mesh>

      <mesh position={[0, 0, -2]} castShadow receiveShadow>
        <octahedronGeometry args={[0.25]} />
        <meshStandardMaterial color="#3B82F6" />
      </mesh>
    </>
  );
};

export default Scene;