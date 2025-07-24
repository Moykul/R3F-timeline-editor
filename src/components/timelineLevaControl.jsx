import React, { useState, useCallback, useRef } from 'react';
import { useControls, button } from 'leva';
import AnimationTimeline from './AnimationTimeline';
import fileManager from './fileManager';

const TimelineLevaControl = ({ onUpdate, onTimelineData }) => {
  const [cubeValues, set] = useControls('Cube Position', () => ({
    pos_x: { value: 0, min: -5, max: 5, step: 0.01 },
    pos_y: { value: 0, min: -5, max: 5, step: 0.01 },
    pos_z: { value: 0, min: -5, max: 5, step: 0.01 }
  }));

  // Add Leva toggle for timeline visibility and custom export/import controls
  const fileInputRef = useRef();
  const [{ timelineVisible }, setTimelineVisible] = useControls('Timeline', () => ({
    timelineVisible: { value: true, label: 'Show Timeline' },
    exportAnimation: button(() => {
      const timeline = timelineRef.current && timelineRef.current.getTimeline ? timelineRef.current.getTimeline() : null;
      if (!timeline) return;
      const model = timeline.getModel ? timeline.getModel() : null;
      if (!model) return;
      fileManager.saveJSON(model, 'animation-timeline.json');
    }),
    importAnimation: button(() => {
      if (fileInputRef.current) fileInputRef.current.click();
    })
  }));
  const [currentTime, setCurrentTime] = useState(0);
  const timelineRef = useRef(null);
  const timelineDrivenRef = useRef(false);
  const isPlayingRef = useRef(false);
  const prevUserValuesRef = useRef({
    pos_x: cubeValues.pos_x,
    pos_y: cubeValues.pos_y,
    pos_z: cubeValues.pos_z
  });

  // MINIMAL TEST: Just log when timeline tries to update
  const handleLevaUpdate = useCallback((interpolated) => {
    if (!interpolated) return;
    isPlayingRef.current = interpolated.isPlaying || false;
    // If timeline is driving, update Leva values directly for smooth scrubbing
    const updates = {};
    if (interpolated.positionX !== undefined) updates.pos_x = interpolated.positionX;
    if (interpolated.positionY !== undefined) updates.pos_y = interpolated.positionY;
    if (interpolated.positionZ !== undefined) updates.pos_z = interpolated.positionZ;
    if (Object.keys(updates).length > 0) {
      timelineDrivenRef.current = true;
      set(updates); // This updates the Leva UI as well
      setTimeout(() => { timelineDrivenRef.current = false; }, 0);
    }
    // Create timeline data with useTimelineLerp props
    const timelineData = {
      isPlaying: interpolated.isPlaying || false,
      cubeValues: cubeValues,
      setCubeValues: set,
      isPlayingRef: isPlayingRef,
      timelineDrivenRef: timelineDrivenRef,
      prevUserValuesRef: prevUserValuesRef
    };
    if (updates.pos_x !== undefined) timelineData.pos_x = updates.pos_x;
    if (updates.pos_y !== undefined) timelineData.pos_y = updates.pos_y;
    if (updates.pos_z !== undefined) timelineData.pos_z = updates.pos_z;
    if (onTimelineData) {
      onTimelineData(timelineData);
    }
    if (onUpdate) {
      onUpdate(updates);
    }
  }, [set, onUpdate, onTimelineData, cubeValues]);

  const handlePlaybackChange = useCallback((playing) => {
    isPlayingRef.current = playing;
  }, []);

  // Simplified keyframe detection
  React.useEffect(() => {
    if (timelineDrivenRef.current || isPlayingRef.current) return;
    
    if (onUpdate) onUpdate(cubeValues);

    const timeline = timelineRef.current;
    if (timeline && timeline.addKeyframe && timeline.isInitialized()) {
      // Check for changes and add keyframes
      if (Math.abs(cubeValues.pos_x - prevUserValuesRef.current.pos_x) > 0.001) {
        timeline.addKeyframe('positionX', cubeValues.pos_x, currentTime);
        prevUserValuesRef.current.pos_x = cubeValues.pos_x;
      }
      if (Math.abs(cubeValues.pos_y - prevUserValuesRef.current.pos_y) > 0.001) {
        timeline.addKeyframe('positionY', cubeValues.pos_y, currentTime);
        prevUserValuesRef.current.pos_y = cubeValues.pos_y;
      }
      if (Math.abs(cubeValues.pos_z - prevUserValuesRef.current.pos_z) > 0.001) {
        timeline.addKeyframe('positionZ', cubeValues.pos_z, currentTime);
        prevUserValuesRef.current.pos_z = cubeValues.pos_z;
      }
    }
  }, [cubeValues, currentTime]);


  // Import animation from JSON (triggered by hidden file input)
  const handleImport = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    fileManager.loadJSON(file, (model) => {
      const timeline = timelineRef.current && timelineRef.current.getTimeline ? timelineRef.current.getTimeline() : null;
      if (timeline && timeline.setModel) {
        timeline.setModel(model);
      }
    });
  };

  return (
    <>
      {/* Hidden file input for import, triggered by Leva button */}
      <input
        ref={fileInputRef}
        type="file"
        accept="application/json"
        style={{ display: 'none' }}
        onChange={handleImport}
      />
      <AnimationTimeline
        ref={timelineRef}
        visible={timelineVisible}
        duration={5000}
        levaValues={cubeValues}
        onLevaUpdate={handleLevaUpdate}
        onTimeChange={setCurrentTime}
        onPlaybackChange={handlePlaybackChange}
      />
    </>
  );
};

export default TimelineLevaControl;