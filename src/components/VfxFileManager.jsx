// VfxFileManager.jsx - File operations for VFX settings with Gravity Support
//
// USAGE:
// import VfxFileManager from './VfxFileManager';
// 
// const fileManager = VfxFileManager({
//   onSave: handleSave,
//   onLoad: handleLoad,
//   onError: handleError
// });
//
import React from 'react';
import * as THREE from 'three';

const VfxFileManager = ({
  onSave,
  onLoad,
  onError
}) => {
  
  // Process and validate settings for saving - Enhanced with gravity
  const processSettingsForSave = (settings) => {
    // Convert THREE.js blend mode constants to strings for JSON serialization
    const getBlendModeString = (blendMode) => {
      switch (blendMode) {
        case THREE.AdditiveBlending: return 'Additive';
        case THREE.NormalBlending: return 'Normal';
        case THREE.MultiplyBlending: return 'Multiply';
        case THREE.SubtractiveBlending: return 'Subtractive';
        default: return 'Additive';
      }
    };

    const processedSettings = {
      // Transform
      positionX: typeof settings.positionX === 'number' ? settings.positionX : 0,
      positionY: typeof settings.positionY === 'number' ? settings.positionY : 0,
      positionZ: typeof settings.positionZ === 'number' ? settings.positionZ : 0,
      rotationX: typeof settings.rotationX === 'number' ? settings.rotationX : 0,
      rotationY: typeof settings.rotationY === 'number' ? settings.rotationY : 0,
      rotationZ: typeof settings.rotationZ === 'number' ? settings.rotationZ : 0,
      scaleX: typeof settings.scaleX === 'number' ? settings.scaleX : 1,
      scaleY: typeof settings.scaleY === 'number' ? settings.scaleY : 1,
      scaleZ: typeof settings.scaleZ === 'number' ? settings.scaleZ : 1,
      
      // Basic properties
      particleCount: typeof settings.particleCount === 'number' ? settings.particleCount : 800,
      animationDuration: typeof settings.animationDuration === 'number' ? settings.animationDuration : 3.0,
      particleSize: typeof settings.particleSize === 'number' ? settings.particleSize : 0.1,
      spreadRadius: typeof settings.spreadRadius === 'number' ? settings.spreadRadius : 2,
      
      // Colors & effects
      color: typeof settings.color === 'string' ? settings.color : '#ff6030',
      colorEnd: typeof settings.colorEnd === 'string' ? settings.colorEnd : '#ff0030',
      useGradient: typeof settings.useGradient === 'boolean' ? settings.useGradient : false,
      opacity: typeof settings.opacity === 'number' ? settings.opacity : 1.0,
      blendMode: getBlendModeString(settings.blendMode),
      
      // Shape & pattern
      shape: typeof settings.shape === 'string' ? settings.shape : 'explosion',
      shapeHeight: typeof settings.shapeHeight === 'number' ? settings.shapeHeight : 2.0,
      shapeAngle: typeof settings.shapeAngle === 'number' ? settings.shapeAngle : 0,
      heightMultiplier: typeof settings.heightMultiplier === 'number' ? settings.heightMultiplier : 1.0,
      sizeVariation: typeof settings.sizeVariation === 'number' ? settings.sizeVariation : 0.5,
      timeVariation: typeof settings.timeVariation === 'number' ? settings.timeVariation : 0.4,
      
      // Physics & forces - Enhanced with gravity
      directionalForceX: typeof settings.directionalForceX === 'number' ? settings.directionalForceX : 0,
      directionalForceY: typeof settings.directionalForceY === 'number' ? settings.directionalForceY : 0,
      directionalForceZ: typeof settings.directionalForceZ === 'number' ? settings.directionalForceZ : 0,
      gravity: typeof settings.gravity === 'number' ? settings.gravity : 0, // NEW: Gravity field
      turbulence: typeof settings.turbulence === 'number' ? settings.turbulence : 0,
      streakLength: typeof settings.streakLength === 'number' ? settings.streakLength : 0,
      
      // Animation & texture
      animationPreset: typeof settings.animationPreset === 'string' ? settings.animationPreset : 'none',
      particleTexture: typeof settings.particleTexture === 'string' ? settings.particleTexture : 'Circle',
      motionBlur: typeof settings.motionBlur === 'boolean' ? settings.motionBlur : false,
      
      // Helper settings
      showHelpers: typeof settings.showHelpers === 'boolean' ? settings.showHelpers : false,
      helperOpacity: typeof settings.helperOpacity === 'number' ? settings.helperOpacity : 0.3,
      fileName: typeof settings.fileName === 'string' ? settings.fileName : 'my-vfx-settings',
      
      // Metadata - Enhanced
      version: '2.1', // Updated version to indicate gravity support
      timestamp: new Date().toISOString(),
      engineType: 'VfxEngine',
      features: ['gravity', 'directionalForces', 'turbulence', 'streakLength'], // NEW: Feature list
      gravityPresets: { // NEW: Include common gravity presets for reference
        earth: -9.8,
        moon: -1.6,
        mars: -3.7,
        zero: 0,
        reverse: 5
      }
    };

    return processedSettings;
  };

  // Process loaded settings and convert back to THREE.js format - Enhanced with gravity
  const processLoadedSettings = (loadedData) => {
    // Convert blend mode string back to THREE.js constant
    const getBlendModeConstant = (blendModeString) => {
      switch (blendModeString) {
        case 'Normal': return THREE.NormalBlending;
        case 'Multiply': return THREE.MultiplyBlending;
        case 'Subtractive': return THREE.SubtractiveBlending;
        case 'Additive':
        default: return THREE.AdditiveBlending;
      }
    };

    const processedSettings = {
      // Transform
      positionX: typeof loadedData.positionX === 'number' ? loadedData.positionX : 0,
      positionY: typeof loadedData.positionY === 'number' ? loadedData.positionY : 0,
      positionZ: typeof loadedData.positionZ === 'number' ? loadedData.positionZ : 0,
      rotationX: typeof loadedData.rotationX === 'number' ? loadedData.rotationX : 0,
      rotationY: typeof loadedData.rotationY === 'number' ? loadedData.rotationY : 0,
      rotationZ: typeof loadedData.rotationZ === 'number' ? loadedData.rotationZ : 0,
      scaleX: typeof loadedData.scaleX === 'number' ? loadedData.scaleX : 1,
      scaleY: typeof loadedData.scaleY === 'number' ? loadedData.scaleY : 1,
      scaleZ: typeof loadedData.scaleZ === 'number' ? loadedData.scaleZ : 1,
      
      // Basic properties
      particleCount: typeof loadedData.particleCount === 'number' ? loadedData.particleCount : 800,
      animationDuration: typeof loadedData.animationDuration === 'number' ? loadedData.animationDuration : 3.0,
      particleSize: typeof loadedData.particleSize === 'number' ? loadedData.particleSize : 0.1,
      spreadRadius: typeof loadedData.spreadRadius === 'number' ? loadedData.spreadRadius : 2,
      
      // Colors & effects
      color: typeof loadedData.color === 'string' ? loadedData.color : '#ff6030',
      colorEnd: typeof loadedData.colorEnd === 'string' ? loadedData.colorEnd : '#ff0030',
      useGradient: typeof loadedData.useGradient === 'boolean' ? loadedData.useGradient : false,
      opacity: typeof loadedData.opacity === 'number' ? loadedData.opacity : 1.0,
      blendMode: getBlendModeConstant(loadedData.blendMode),
      
      // Shape & pattern
      shape: typeof loadedData.shape === 'string' ? loadedData.shape : 'explosion',
      shapeHeight: typeof loadedData.shapeHeight === 'number' ? loadedData.shapeHeight : 2.0,
      shapeAngle: typeof loadedData.shapeAngle === 'number' ? loadedData.shapeAngle : 0,
      heightMultiplier: typeof loadedData.heightMultiplier === 'number' ? loadedData.heightMultiplier : 1.0,
      sizeVariation: typeof loadedData.sizeVariation === 'number' ? loadedData.sizeVariation : 0.5,
      timeVariation: typeof loadedData.timeVariation === 'number' ? loadedData.timeVariation : 0.4,
      
      // Physics & forces - Enhanced with gravity backward compatibility
      directionalForceX: typeof loadedData.directionalForceX === 'number' ? loadedData.directionalForceX : 0,
      directionalForceY: typeof loadedData.directionalForceY === 'number' ? loadedData.directionalForceY : 0,
      directionalForceZ: typeof loadedData.directionalForceZ === 'number' ? loadedData.directionalForceZ : 0,
      gravity: typeof loadedData.gravity === 'number' ? loadedData.gravity : 0, // NEW: Load gravity with default fallback
      turbulence: typeof loadedData.turbulence === 'number' ? loadedData.turbulence : 0,
      streakLength: typeof loadedData.streakLength === 'number' ? loadedData.streakLength : 0,
      
      // Animation & texture - Handle backwards compatibility
      animationPreset: typeof loadedData.animationPreset === 'string' ? loadedData.animationPreset : 'none',
      particleTexture: typeof loadedData.particleTexture === 'string' ? loadedData.particleTexture : 
                      (typeof loadedData.textureIndex === 'number' ? `Particle ${loadedData.textureIndex + 1}` : 'Circle'),
      motionBlur: typeof loadedData.motionBlur === 'boolean' ? loadedData.motionBlur : false,
      
      // Helper settings
      showHelpers: typeof loadedData.showHelpers === 'boolean' ? loadedData.showHelpers : false,
      helperOpacity: typeof loadedData.helperOpacity === 'number' ? loadedData.helperOpacity : 0.3,
      fileName: typeof loadedData.fileName === 'string' ? loadedData.fileName : 'my-vfx-settings'
    };

    // Log gravity loading for debugging
    console.log('🌍 Gravity settings loaded:', {
      hasGravity: 'gravity' in loadedData,
      gravityValue: loadedData.gravity,
      processedGravity: processedSettings.gravity,
      version: loadedData.version || 'legacy'
    });

    return processedSettings;
  };

  // Validate settings structure - Enhanced with gravity validation
  const validateSettings = (settings) => {
    const errors = [];
    
    // Check required numeric fields
    const numericFields = [
      'particleCount', 'animationDuration', 'particleSize', 'spreadRadius',
      'positionX', 'positionY', 'positionZ', 'opacity', 'gravity' // NEW: Include gravity
    ];
    
    numericFields.forEach(field => {
      if (typeof settings[field] !== 'number' || isNaN(settings[field])) {
        errors.push(`${field} must be a valid number`);
      }
    });
    
    // Check required string fields
    const stringFields = ['color', 'colorEnd', 'shape', 'particleTexture'];
    stringFields.forEach(field => {
      if (typeof settings[field] !== 'string' || settings[field].trim() === '') {
        errors.push(`${field} must be a non-empty string`);
      }
    });
    
    // Validate color format
    const colorRegex = /^#[0-9A-F]{6}$/i;
    if (!colorRegex.test(settings.color)) {
      errors.push('color must be a valid hex color (e.g., #ff6030)');
    }
    if (!colorRegex.test(settings.colorEnd)) {
      errors.push('colorEnd must be a valid hex color (e.g., #ff0030)');
    }
    
    // Validate ranges
    if (settings.particleCount < 1 || settings.particleCount > 5000) {
      errors.push('particleCount must be between 1 and 5000');
    }
    
    if (settings.opacity < 0 || settings.opacity > 1) {
      errors.push('opacity must be between 0 and 1');
    }
    
    // NEW: Validate gravity range
    if (settings.gravity < -50 || settings.gravity > 50) {
      errors.push('gravity must be between -50 and 50 (reasonable physics range)');
    }
    
    // NEW: Validate physics forces
    const forceFields = ['directionalForceX', 'directionalForceY', 'directionalForceZ'];
    forceFields.forEach(field => {
      if (Math.abs(settings[field]) > 100) {
        errors.push(`${field} should be between -100 and 100 for realistic effects`);
      }
    });
    
    return {
      isValid: errors.length === 0,
      errors
    };
  };

  // Save settings to file - Enhanced logging
  const saveSettings = (settings) => {
    try {
      const processedSettings = processSettingsForSave(settings);
      
      // Validate before saving
      const validation = validateSettings(processedSettings);
      if (!validation.isValid) {
        const errorMessage = `Settings validation failed:\n${validation.errors.join('\n')}`;
        console.error('❌ Save validation failed:', validation.errors);
        onError?.({
          type: 'validation',
          message: errorMessage,
          errors: validation.errors
        });
        return false;
      }
      
      const dataStr = JSON.stringify(processedSettings, null, 2);
      const dataUri = 'data:application/json;charset=utf-8,'+ encodeURIComponent(dataStr);
      
      const timestamp = new Date().toISOString().slice(0, 19).replace(/:/g, '-');
      const fileName = processedSettings.fileName || 'my-vfx-settings';
      const exportFileDefaultName = `${fileName}-${timestamp}.json`;
      
      console.log('💾 Saving VFX settings with gravity:', {
        fileName: exportFileDefaultName,
        dataSize: dataStr.length,
        settingsCount: Object.keys(processedSettings).length,
        gravity: processedSettings.gravity,
        version: processedSettings.version,
        features: processedSettings.features
      });
      
      const linkElement = document.createElement('a');
      linkElement.setAttribute('href', dataUri);
      linkElement.setAttribute('download', exportFileDefaultName);
      linkElement.click();
      
      console.log('✅ Save initiated successfully');
      onSave?.({
        fileName: exportFileDefaultName,
        settings: processedSettings,
        success: true
      });
      
      return true;
    } catch (error) {
      console.error('❌ Save failed:', error);
      onError?.({
        type: 'save',
        message: `Save failed: ${error.message}`,
        error
      });
      return false;
    }
  };

  // Load settings from file - Enhanced logging for gravity
  const loadSettings = () => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.json';
    input.style.display = 'none';
    
    input.onchange = (event) => {
      const file = event.target.files[0];
      if (!file) return;

      // Validate file type
      if (!file.name.toLowerCase().endsWith('.json')) {
        onError?.({
          type: 'file',
          message: 'Please select a valid JSON file (.json)',
          fileName: file.name
        });
        return;
      }

      // Validate file size (max 10MB)
      if (file.size > 10 * 1024 * 1024) {
        onError?.({
          type: 'file',
          message: 'File is too large. Maximum size is 10MB.',
          fileName: file.name,
          fileSize: file.size
        });
        return;
      }

      const reader = new FileReader();
      
      reader.onload = (e) => {
        try {
          const jsonText = e.target.result;
          
          if (!jsonText || jsonText.trim() === '') {
            throw new Error('File is empty or contains no valid content');
          }
          
          console.log('📂 Loading VFX settings from:', file.name);
          
          const rawData = JSON.parse(jsonText);
          
          if (!rawData || typeof rawData !== 'object') {
            throw new Error('Invalid file format - expected JSON object');
          }
          
          const processedSettings = processLoadedSettings(rawData);
          
          // Validate loaded settings
          const validation = validateSettings(processedSettings);
          if (!validation.isValid) {
            console.warn('⚠️ Loaded settings have validation issues:', validation.errors);
          }
          
          // Check for gravity support
          const hasGravitySupport = 'gravity' in rawData;
          const isLegacyFile = !rawData.version || parseFloat(rawData.version) < 2.1;
          
          console.log('✅ VFX settings loaded successfully:', {
            fileName: file.name,
            version: rawData.version || 'legacy',
            settingsCount: Object.keys(processedSettings).length,
            hasGravity: hasGravitySupport,
            gravityValue: processedSettings.gravity,
            isLegacy: isLegacyFile,
            features: rawData.features || []
          });
          
          // Show info message for legacy files
          if (isLegacyFile && !hasGravitySupport) {
            console.info('ℹ️ Loaded legacy VFX file - gravity defaults to 0');
          }
          
          onLoad?.({
            fileName: file.name,
            settings: processedSettings,
            version: rawData.version || 'legacy',
            hasGravitySupport: hasGravitySupport,
            success: true
          });
          
        } catch (error) {
          console.error('❌ Error loading VFX settings:', error);
          onError?.({
            type: 'load',
            message: `Failed to load settings file: ${error.message}`,
            fileName: file.name,
            error
          });
        }
      };
      
      reader.onerror = () => {
        onError?.({
          type: 'file_read',
          message: 'Failed to read the file. Please try again.',
          fileName: file.name
        });
      };
      
      reader.readAsText(file);
    };
    
    document.body.appendChild(input);
    input.click();
    document.body.removeChild(input);
  };

  // Component returns object with methods
  return {
    saveSettings,
    loadSettings,
    validateSettings,
    processSettingsForSave,
    processLoadedSettings
  };
};

export default VfxFileManager;