import { useFrame } from '@react-three/fiber';

/**
 * FIXED Custom hook for timeline interpolation using useFrame
 * Now properly avoids conflicts with manual Leva control updates
 */
export function useTimelineLerp({
  isPlayingRef,
  cubeValues,
  setCubeValues,
  targetValuesRef,
  timelineDrivenRef,
  prevUserValuesRef,
  interpolationSpeed = 8.0,
  enabled = true
}) {
  // Simple lerp function
  const lerp = (start, end, t) => {
    return start + (end - start) * Math.min(Math.max(t, 0), 1);
  };

  useFrame((_, delta) => {
    // FIXED: More comprehensive early return conditions
    if (!enabled || 
        !isPlayingRef || 
        !cubeValues || 
        !setCubeValues || 
        !targetValuesRef || 
        !timelineDrivenRef || 
        !prevUserValuesRef) {
      return;
    }

    // FIXED: Only interpolate when actually playing timeline
    if (!isPlayingRef.current) return;
    
    // FIXED: Don't interfere when timeline is driving updates
    if (timelineDrivenRef.current) return;

    const current = {
      pos_x: cubeValues.pos_x,
      pos_y: cubeValues.pos_y,
      pos_z: cubeValues.pos_z
    };

    const target = targetValuesRef.current;

    // FIXED: More conservative interpolation check
    const INTERPOLATION_THRESHOLD = 0.01; // Larger threshold to avoid micro-adjustments
    const needsInterpolation =
      Math.abs(current.pos_x - target.pos_x) > INTERPOLATION_THRESHOLD ||
      Math.abs(current.pos_y - target.pos_y) > INTERPOLATION_THRESHOLD ||
      Math.abs(current.pos_z - target.pos_z) > INTERPOLATION_THRESHOLD;

    if (needsInterpolation) {
      // FIXED: Check if values are valid numbers
      if (isNaN(target.pos_x) || isNaN(target.pos_y) || isNaN(target.pos_z)) {
        console.warn('⚠️ Invalid target values in useTimelineLerp:', target);
        return;
      }

      // Smooth interpolation using lerp
      const next = {
        pos_x: lerp(current.pos_x, target.pos_x, delta * interpolationSpeed),
        pos_y: lerp(current.pos_y, target.pos_y, delta * interpolationSpeed),
        pos_z: lerp(current.pos_z, target.pos_z, delta * interpolationSpeed)
      };

      // FIXED: Validate interpolated values before applying
      if (isNaN(next.pos_x) || isNaN(next.pos_y) || isNaN(next.pos_z)) {
        console.warn('⚠️ Invalid interpolated values in useTimelineLerp:', next);
        return;
      }

      // Mark as timeline-driven update
      timelineDrivenRef.current = true;

      // Apply the interpolated values
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