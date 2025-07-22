import React, { useState, useRef, useEffect, useImperativeHandle, useCallback, useMemo } from 'react';
import { Timeline } from 'animation-timeline-js';

/**
 * FIXED Animation Timeline Component
 * SOLUTION: Use ref for isPlaying to avoid stale closure in event handler
 */
const AnimationTimeline = React.forwardRef(({ 
  visible = true,
  duration = 10000,
  onTimeChange = () => {},
  onKeyframeChange = () => {},
  onPlaybackChange = () => {},
  levaValues = {},
  onLevaUpdate = () => {},
  className = ''
}, ref) => {
  const timelineRef = useRef(null);
  const containerRef = useRef(null);
  const [timeline, setTimeline] = useState(null);
  const [currentTime, setCurrentTime] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  
  // FIX: Use ref to avoid stale closure in event handler
  const isPlayingRef = useRef(false);
  
  const playbackRef = useRef(null);
  const [isInitialized, setIsInitialized] = useState(false);

  // Drag state
  const [isDragging, setIsDragging] = useState(false);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });

  const TOTAL_FRAMES = Math.round((duration / 1000) * 30);
  const FPS = 30;
  
  const timeToFrame = (time) => Math.round((time / duration) * TOTAL_FRAMES);
  const frameToTime = (frame) => (frame / TOTAL_FRAMES) * duration;

  // FIX: Update ref whenever state changes
  useEffect(() => {
    isPlayingRef.current = isPlaying;
      console.log('🔧 isPlaying state changed:', isPlaying);
  }, [isPlaying]);

  // Initialize timeline using official pattern
  useEffect(() => {
    if (!visible || !containerRef.current) return;
    
    const timelineInstance = new Timeline({ id: containerRef.current });
    
    const initialModel = {
      rows: [
        {
          name: 'positionX',
          displayName: '📍 Position X',
          keyframes: [],
          style: { fillStyle: '#3B82F6', strokeStyle: '#2563EB', height: 21 }
        },
        {
          name: 'positionY',
          displayName: '📍 Position Y',
          keyframes: [],
          style: { fillStyle: '#10B981', strokeStyle: '#059669', height: 21 }
        },
        {
          name: 'positionZ',
          displayName: '📍 Position Z',
          keyframes: [],
          style: { fillStyle: '#F59E0B', strokeStyle: '#D97706', height: 21 }
        }
      ]
    };

    timelineInstance.setModel(initialModel);
    timelineInstance.setTime(0);
    
    // FIX: Use ref instead of state in event handler
    timelineInstance.onTimeChanged((event) => {
      const time = event.val;
      // console.log('🔧 TIMELINE TIME CHANGED:', time, 'isPlayingRef:', isPlayingRef.current);
      
      setCurrentTime(time);
      onTimeChange(time);
      
      // FIX: Use ref instead of stale state
      if (isPlayingRef.current) {
        // console.log('🔧 Timeline is playing - checking for keyframes');
        
        const model = timelineInstance.getModel();
        const hasKeyframes = model && model.rows && model.rows.some(row => row.keyframes.length > 0);
        
        // console.log('🔧 Has keyframes:', hasKeyframes);
        
        if (hasKeyframes) {
          const interpolatedValues = interpolateValuesAtTime(time, model);
          
          // console.log('🔧 Interpolated values:', interpolatedValues);
          
          const timelineData = {
            ...interpolatedValues,
            isPlaying: isPlayingRef.current, // Use ref
            currentTime: time,
            timelineActive: true,
            trigger: true
          };
          
          // console.log('🔧 Calling onLevaUpdate');
          onLevaUpdate(timelineData);
        } else {
          // console.log('🔧 No keyframes found - not calling onLevaUpdate');
        }
      } else {
        // console.log('🔧 Timeline not playing - skipping onLevaUpdate');
      }
    });

    timelineInstance.onKeyframeChanged((event) => {
      onKeyframeChange(event);
    });

    setTimeline(timelineInstance);
    setIsInitialized(true);

    return () => {
      if (playbackRef.current) {
        cancelAnimationFrame(playbackRef.current);
      }
      if (timelineInstance) {
        timelineInstance.dispose();
      }
    };
  }, [visible, duration]); // FIXED: Remove function dependencies that change every render

  // Interpolate values at a specific time
  const interpolateValuesAtTime = useCallback((time, model) => {
    const interpolated = {};
    
    if (!model || !model.rows) return interpolated;
    
    model.rows.forEach((row) => {
      const keyframes = row.keyframes.sort((a, b) => a.val - b.val);
      
      if (keyframes.length === 0) return;
      
      if (keyframes.length === 1) {
        interpolated[row.name] = denormalizeValue(row.name, keyframes[0].data?.value || 0);
        return;
      }
      
      let beforeFrame = null;
      let afterFrame = null;
      
      for (let i = 0; i < keyframes.length - 1; i++) {
        if (keyframes[i].val <= time && keyframes[i + 1].val >= time) {
          beforeFrame = keyframes[i];
          afterFrame = keyframes[i + 1];
          break;
        }
      }
      
      if (!beforeFrame && !afterFrame) {
        if (time <= keyframes[0].val) {
          interpolated[row.name] = denormalizeValue(row.name, keyframes[0].data?.value || 0);
        } else {
          interpolated[row.name] = denormalizeValue(row.name, keyframes[keyframes.length - 1].data?.value || 0);
        }
        return;
      }
      
      if (beforeFrame && afterFrame) {
        const timeDiff = afterFrame.val - beforeFrame.val;
        const progress = timeDiff === 0 ? 0 : (time - beforeFrame.val) / timeDiff;
        
        const beforeValue = beforeFrame.data?.value || 0;
        const afterValue = afterFrame.data?.value || 0;
        
        const interpolatedValue = beforeValue + (afterValue - beforeValue) * progress;
        
        interpolated[row.name] = denormalizeValue(row.name, interpolatedValue);
      }
    });
    
    return interpolated;
  }, []);

  // Helper functions for value conversion
  const denormalizeValue = (parameterName, normalizedValue) => {
    switch (parameterName) {
      case 'positionX':
      case 'positionY':
      case 'positionZ': return (normalizedValue * 10) - 5;
      default: return normalizedValue;
    }
  };

  const normalizeValue = (parameterName, value) => {
    switch (parameterName) {
      case 'positionX':
      case 'positionY':
      case 'positionZ': return (value + 5) / 10;
      default: return Math.max(0, Math.min(1, value));
    }
  };

  const getRowIndexByName = (parameterName) => {
    const nameMap = {
      'positionX': 0,
      'positionY': 1,
      'positionZ': 2,
    };
    return nameMap[parameterName] !== undefined ? nameMap[parameterName] : -1;
  };

  // Expose timeline methods through ref
  useImperativeHandle(ref, () => ({
    getTimeline: () => timeline,
    getCurrentTime: () => currentTime,
    setCurrentTime: (time) => setCurrentTime(time),
    setTime: (time) => {
      if (timeline && timeline.setTime) {
        try {
          timeline.setTime(time);
          setCurrentTime(time);
        } catch (error) {
          console.error('Error setting timeline time:', error);
        }
      }
    },
    play: () => {
      setIsPlaying(true);
    },
    pause: () => {
      setIsPlaying(false);
    },
    isPlaying: () => isPlaying,
    isInitialized: () => isInitialized,
    
    addKeyframe: (parameterName, value, time) => {
      if (!timeline || !isInitialized) {
        return false;
      }
      
      try {
        const model = timeline.getModel();
        if (!model || !model.rows) {
          return false;
        }
        
        const rowIndex = getRowIndexByName(parameterName);
          
        if (rowIndex < 0 || !model.rows[rowIndex]) {
          console.warn(`Invalid row index ${rowIndex} for parameter ${parameterName}`);
          return false;
        }
        
        const normalizedValue = normalizeValue(parameterName, value);
        
        const row = model.rows[rowIndex];
        const keyframes = row.keyframes;
        
        const EPSILON = 50;
        const existingIndex = keyframes.findIndex(kf => Math.abs(kf.val - time) < EPSILON);
        
        if (existingIndex >= 0) {
          keyframes[existingIndex].data = { value: normalizedValue };
        } else {
          keyframes.push({
            val: time,
            selected: false,
            data: { value: normalizedValue }
          });
          
          keyframes.sort((a, b) => a.val - b.val);
        }
        
        timeline.setModel(model);
        
        setTimeout(() => {
          if (timeline.redraw) {
            timeline.redraw();
          }
        }, 50);
        
        return true;
      } catch (error) {
        console.error('Keyframe creation failed:', error);
        return false;
      }
    }
  }), [timeline, currentTime, isPlaying, isInitialized]);

  // FIX: Updated play function with proper state management
  const play = useCallback(() => {
    if (!timeline || !isInitialized || isPlaying) return;
    
    if (playbackRef.current) {
      cancelAnimationFrame(playbackRef.current);
      playbackRef.current = null;
    }
    
    let startTime = currentTime;
    if (currentTime >= duration - 100) {
      startTime = 0;
      timeline.setTime(0);
      setCurrentTime(0);
    }
    
    // console.log('🔧 Starting playback from time:', startTime);
    
    // FIX: Set state and ref together
    setIsPlaying(true);
    isPlayingRef.current = true;
    onPlaybackChange(true);
    
    let performanceStartTime = null;
  
    const animate = (timestamp) => {
      try {
        if (performanceStartTime === null) {
          performanceStartTime = timestamp;
        }
        
        const elapsed = timestamp - performanceStartTime;
        const newTime = Math.min(startTime + elapsed, duration);
        
        timeline.setTime(newTime);
        setCurrentTime(newTime);
        
        if (newTime < duration) {
          playbackRef.current = requestAnimationFrame(animate);
        } else {
          // console.log('🔧 Playback ended');
          playbackRef.current = null;
          setIsPlaying(false);
          isPlayingRef.current = false;
          onPlaybackChange(false);
        }
      } catch (error) {
        // console.log('🔧 Playback error:', error);
        playbackRef.current = null;
        setIsPlaying(false);
        isPlayingRef.current = false;
        onPlaybackChange(false);
      }
    };
    
    playbackRef.current = requestAnimationFrame(animate);
  }, [timeline, isInitialized, isPlaying, currentTime, duration, onPlaybackChange]);

  const stop = useCallback(() => {
    if (playbackRef.current) {
      cancelAnimationFrame(playbackRef.current);
      playbackRef.current = null;
    }
    
    setIsPlaying(false);
    isPlayingRef.current = false;

    if (timeline && timeline.setTime) {
      try {
        timeline.setTime(0);
        setCurrentTime(0);
      } catch (error) {
        console.error('Error stopping timeline:', error);
      }
    }
    onPlaybackChange(false);
  }, [timeline, onPlaybackChange]);

  // Drag functionality (keeping original)
  const handleDragStart = useCallback((e) => {
    setIsDragging(true);
    const timelineContainer = e.currentTarget.closest('.timeline-container');
    const rect = timelineContainer.getBoundingClientRect();
    
    timelineContainer.classList.add('dragging');
    timelineContainer.style.width = '360px';
    timelineContainer.style.right = 'auto';
    
    setDragOffset({
      x: e.clientX - rect.left,
      y: e.clientY - rect.top
    });
    e.preventDefault();
  }, []);

  const handleDragMove = useCallback((e) => {
    if (!isDragging) return;
    
    const timelineContainer = document.querySelector('.timeline-container');
    if (timelineContainer) {
      timelineContainer.style.left = `${e.clientX - dragOffset.x}px`;
      timelineContainer.style.top = `${e.clientY - dragOffset.y}px`;
    }
    e.preventDefault();
  }, [isDragging, dragOffset]);

  const handleDragEnd = useCallback(() => {
    setIsDragging(false);
    
    const timelineContainer = document.querySelector('.timeline-container');
    if (timelineContainer) {
      timelineContainer.classList.remove('dragging');
    }
    
    if (timeline && timeline.redraw) {
      setTimeout(() => {
        try {
          timeline.redraw();
        } catch (error) {
          console.error('Error redrawing timeline after drag:', error);
        }
      }, 100);
    }
  }, [timeline]);

  useEffect(() => {
    if (isDragging) {
      document.addEventListener('mousemove', handleDragMove);
      document.addEventListener('mouseup', handleDragEnd);
      return () => {
        document.removeEventListener('mousemove', handleDragMove);
        document.removeEventListener('mouseup', handleDragEnd);
      };
    }
  }, [isDragging, handleDragMove, handleDragEnd]);

  if (!visible) return null;

  return (
    <div className={`timeline-container ${className}`}>
      {!isInitialized && (
        <div style={{ padding: '10px', color: '#888', fontSize: '12px' }}>
          Initializing timeline...
        </div>
      )}
      
      <div className="timeline-toolbar">
        <div 
          className="timeline-drag-handle"
          title="Drag to move timeline"
          onMouseDown={handleDragStart}
        >
          <svg width="20" height="10" viewBox="0 0 28 14" xmlns="http://www.w3.org/2000/svg">
            <circle cx="2" cy="2" r="2"></circle>
            <circle cx="14" cy="2" r="2"></circle>
            <circle cx="26" cy="2" r="2"></circle>
            <circle cx="2" cy="12" r="2"></circle>
            <circle cx="14" cy="12" r="2"></circle>
            <circle cx="26" cy="12" r="2"></circle>
          </svg>
        </div>
        
        <button
          className="timeline-tool-button"
          title="Go to start"
          onClick={() => {
            if (timeline && timeline.setTime && isInitialized) {
              try {
                if (playbackRef.current) {
                  cancelAnimationFrame(playbackRef.current);
                  playbackRef.current = null;
                }
                setIsPlaying(false);
                isPlayingRef.current = false;
                timeline.setTime(0);
                setCurrentTime(0);
              } catch (error) {
                console.error('Error going to start:', error);
              }
            }
          }}
          disabled={!isInitialized}
        >
          ⏮
        </button>
        
        <button
          className="timeline-tool-button"
          title="Play timeline"
          onClick={play}
          disabled={isPlaying || !isInitialized}
        >
          ▶
        </button>
        
        <button
          className="timeline-tool-button"
          title="Stop timeline"
          onClick={stop}
          disabled={!isInitialized}
        >
          ⏹
        </button>
        
        <button
          className="timeline-tool-button"
          title="Go to end"
          onClick={() => {
            if (timeline && timeline.setTime && isInitialized) {
              try {
                timeline.setTime(duration);
                setCurrentTime(duration);
              } catch (error) {
                console.error('Error going to end:', error);
              }
            }
          }}
          disabled={!isInitialized}
        >
          ⏭
        </button>
        
        <div className="timeline-spacer"></div>
        
        <div className="timeline-info">
          {isInitialized ? (
            <>Frame {timeToFrame(currentTime)} / {TOTAL_FRAMES} | {Math.round(currentTime)}ms</>
          ) : (
            <>Initializing...</>
          )}
        </div>
      </div>

      <div className="timeline-main">
        <div className="timeline-track-labels">
          <div className="timeline-track-label">📍 Position X</div>
          <div className="timeline-track-label">📍 Position Y</div>
          <div className="timeline-track-label">📍 Position Z</div>
        </div>
        
        <div 
          ref={containerRef}
          className="timeline-canvas"
          style={{ 
            minHeight: '200px', 
            minWidth: '400px',
            backgroundColor: '#1a1a1a',
            border: isInitialized ? 'none' : '1px dashed #666'
          }}
        />
      </div>
    </div>
  );
});

export default AnimationTimeline;