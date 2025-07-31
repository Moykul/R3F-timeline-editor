import React, { useState, useCallback, useRef, useMemo } from 'react';
import { useControls, button } from 'leva';
import AnimationTimeline from './AnimationTimeline';
import fileManager from './fileManager';

const TimelineLevaControl = ({ onUpdate, onTimelineData }) => {
  // Enhanced parameter definitions with organized grouping
  const parameterDefinitions = useMemo(() => ({
    // Position parameters
    pos_x: { 
      value: 0, min: -5, max: 5, step: 0.01,
      timelineName: 'positionX',
      displayName: '📍 Position X',
      color: '#3B82F6',
      strokeColor: '#2563EB',
      group: 'position'
    },
    pos_y: { 
      value: 0, min: -5, max: 5, step: 0.01,
      timelineName: 'positionY', 
      displayName: '📍 Position Y',
      color: '#10B981',
      strokeColor: '#059669',
      group: 'position'
    },
    pos_z: { 
      value: 0, min: -5, max: 5, step: 0.01,
      timelineName: 'positionZ',
      displayName: '📍 Position Z', 
      color: '#F59E0B',
      strokeColor: '#D97706',
      group: 'position'
    },

    // Rotation parameters
    rotation_x: {
      value: 0, min: -180, max: 180, step: 1,
      timelineName: 'rotationX',
      displayName: '🔄 Rotation X',
      color: '#EF4444',
      strokeColor: '#DC2626',
      group: 'rotation'
    },
    rotation_y: {
      value: 0, min: -180, max: 180, step: 1,
      timelineName: 'rotationY',
      displayName: '🔄 Rotation Y',
      color: '#F97316',
      strokeColor: '#EA580C',
      group: 'rotation'
    },
    rotation_z: {
      value: 0, min: -180, max: 180, step: 1,
      timelineName: 'rotationZ',
      displayName: '🔄 Rotation Z',
      color: '#84CC16',
      strokeColor: '#65A30D',
      group: 'rotation'
    },

    // Scale parameter
    scale: {
      value: 1, min: 0.1, max: 3, step: 0.01,
      timelineName: 'scale',
      displayName: '📏 Scale',
      color: '#8B5CF6', 
      strokeColor: '#7C3AED',
      group: 'scale'
    },

    // Opacity parameter
    opacity: {
      value: 1, min: 0, max: 1, step: 0.01,
      timelineName: 'opacity',
      displayName: '👻 Opacity',
      color: '#EC4899',
      strokeColor: '#DB2777',
      group: 'opacity'
    }
  }), []);

  // Generate Leva controls from parameter definitions
  const levaConfig = useMemo(() => {
    const config = {};
    Object.entries(parameterDefinitions).forEach(([key, def]) => {
      config[key] = {
        value: def.value,
        min: def.min,
        max: def.max,
        step: def.step
      };
    });
    return config;
  }, [parameterDefinitions]);

  const [cubeValues, set] = useControls('Cube Transform', () => levaConfig);

  // Generate timeline model from parameter definitions
  const timelineModel = useMemo(() => {
    const rows = Object.entries(parameterDefinitions).map(([levaKey, def]) => ({
      name: def.timelineName,
      displayName: def.displayName,
      keyframes: [],
      style: { 
        fillStyle: def.color, 
        strokeColor: def.strokeColor, 
        height: 21 
      },
      _levaKey: levaKey,
      _min: def.min,
      _max: def.max,
      _group: def.group
    }));

    return { rows };
  }, [parameterDefinitions]);

  // Create normalization functions
  const createNormalizeFunctions = useMemo(() => {
    const normalize = {};
    const denormalize = {};
    
    Object.entries(parameterDefinitions).forEach(([levaKey, def]) => {
      const timelineName = def.timelineName;
      const range = def.max - def.min;
      
      normalize[timelineName] = (value) => {
        return (value - def.min) / range;
      };
      
      denormalize[timelineName] = (normalizedValue) => {
        return def.min + (normalizedValue * range);
      };
    });
    
    return { normalize, denormalize };
  }, [parameterDefinitions]);

  // Create parameter mapping
  const parameterMapping = useMemo(() => {
    const timelineToLeva = {};
    const levaToTimeline = {};
    
    Object.entries(parameterDefinitions).forEach(([levaKey, def]) => {
      timelineToLeva[def.timelineName] = levaKey;
      levaToTimeline[levaKey] = def.timelineName;
    });
    
    return { timelineToLeva, levaToTimeline };
  }, [parameterDefinitions]);

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
  const prevUserValuesRef = useRef({ ...cubeValues });

  // Handle timeline updates with organized data structure
  const handleLevaUpdate = useCallback((interpolated) => {
    if (!interpolated) return;
    
    isPlayingRef.current = interpolated.isPlaying || false;
    
    // Convert timeline values to Leva updates
    const updates = {};
    Object.entries(interpolated).forEach(([timelineName, value]) => {
      if (value !== undefined && parameterMapping.timelineToLeva[timelineName]) {
        const levaKey = parameterMapping.timelineToLeva[timelineName];
        updates[levaKey] = value;
      }
    });
    
    if (Object.keys(updates).length > 0) {
      timelineDrivenRef.current = true;
      set(updates);
      setTimeout(() => { timelineDrivenRef.current = false; }, 0);
    }

    // Send updates to parent
    if (onUpdate) onUpdate(updates);
    
    // Create timeline data for useTimelineLerp
    const timelineData = {
      isPlaying: interpolated.isPlaying || false,
      cubeValues: cubeValues,
      setCubeValues: set,
      isPlayingRef: isPlayingRef,
      timelineDrivenRef: timelineDrivenRef,
      prevUserValuesRef: prevUserValuesRef
    };

    if (onTimelineData) onTimelineData(timelineData);
  }, [set, onUpdate, onTimelineData, cubeValues, parameterMapping]);

  const handlePlaybackChange = useCallback((playing) => {
    isPlayingRef.current = playing;
  }, []);

  // FIXED: Handle manual Leva control updates
  React.useEffect(() => {
    // Skip if timeline is driving the changes
    if (timelineDrivenRef.current || isPlayingRef.current) return;
    
    console.log('🎮 Leva values changed:', cubeValues);
    
    // FIXED: Send direct values to parent (not organized)
    if (onUpdate) {
      onUpdate(cubeValues); // Send flat object directly
    }

    // Handle keyframe creation
    const timeline = timelineRef.current;
    if (timeline && timeline.addKeyframe && timeline.isInitialized()) {
      // Check all parameters dynamically
      Object.entries(parameterDefinitions).forEach(([levaKey, def]) => {
        const currentValue = cubeValues[levaKey];
        const prevValue = prevUserValuesRef.current[levaKey];
        
        if (Math.abs(currentValue - prevValue) > (def.step || 0.001)) {
          timeline.addKeyframe(def.timelineName, currentValue, currentTime);
          prevUserValuesRef.current[levaKey] = currentValue;
        }
      });
    }
  }, [cubeValues, currentTime, parameterDefinitions, onUpdate]);

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
        initialModel={timelineModel}
        normalizeFunctions={createNormalizeFunctions}
        parameterMapping={parameterMapping}
      />
    </>
  );
};

export default TimelineLevaControl;