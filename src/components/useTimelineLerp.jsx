import { useFrame } from '@react-three/fiber';

/**
 * Custom hook for timeline interpolation using useFrame (to be used inside Canvas)
 * FIXED: Added enabled flag to conditionally run the interpolation
 */
export function useTimelineLerp({
  isPlayingRef,
  cubeValues,
  setCubeValues,
  targetValuesRef,
  timelineDrivenRef,
  prevUserValuesRef,
  interpolationSpeed = 8.0,
  enabled = true // FIXED: Add enabled flag
}) {
  // Simple lerp function
  const lerp = (start, end, t) => {
    return start + (end - start) * Math.min(Math.max(t, 0), 1);
  };

  useFrame((_, delta) => {
    // FIXED: Early return if not enabled or required props missing
    if (!enabled || !isPlayingRef || !cubeValues || !setCubeValues || !targetValuesRef || !timelineDrivenRef || !prevUserValuesRef) {
      return;
    }

    if (!isPlayingRef.current) return;

    const current = {
      pos_x: cubeValues.pos_x,
      pos_y: cubeValues.pos_y,
      pos_z: cubeValues.pos_z
    };

    const target = targetValuesRef.current;

    // Check if we need to interpolate
    const needsInterpolation =
      Math.abs(current.pos_x - target.pos_x) > 0.001 ||
      Math.abs(current.pos_y - target.pos_y) > 0.001 ||
      Math.abs(current.pos_z - target.pos_z) > 0.001;

    if (needsInterpolation) {
      // Smooth interpolation using lerp
      const next = {
        pos_x: lerp(current.pos_x, target.pos_x, delta * interpolationSpeed),
        pos_y: lerp(current.pos_y, target.pos_y, delta * interpolationSpeed),
        pos_z: lerp(current.pos_z, target.pos_z, delta * interpolationSpeed)
      };

      // Mark as timeline-driven update
      timelineDrivenRef.current = true;

      setCubeValues(next);

      // Update our tracking references
      prevUserValuesRef.current = { ...next };

      // Reset flag after a frame
      setTimeout(() => {
        timelineDrivenRef.current = false;
      }, 0);
    }
  });
}