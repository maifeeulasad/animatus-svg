/**
 * Animation Strategies - Procedural animation generators for different SVG elements
 */

import {
  ParsedElement,
  AnimationKeyframe,
  ElementAnimationConfig,
  AnimationMode,
  GeneratedAnimation,
  SlideDirection,
} from './../types';
import { hasStroke, hasFill } from './../parser';

/**
 * Generate stroke drawing animation (dash-offset technique)
 */
export function createDrawAnimation(
  parsed: ParsedElement,
  config: ElementAnimationConfig
): GeneratedAnimation {
  const { element, pathLength } = parsed;
  const length = pathLength || 1000;
  
  // Set up stroke-dasharray for drawing effect
  const originalDasharray = element.style.strokeDasharray;
  const originalDashoffset = element.style.strokeDashoffset;
  
  element.style.strokeDasharray = `${length}`;
  element.style.strokeDashoffset = `${length}`;
  
  const keyframes: AnimationKeyframe[] = [
    { offset: 0, strokeDashoffset: length },
    { offset: 1, strokeDashoffset: 0 }
  ];
  
  return {
    element,
    keyframes,
    options: buildAnimationOptions(config),
    cleanup: () => {
      element.style.strokeDasharray = originalDasharray;
      element.style.strokeDashoffset = originalDashoffset;
    }
  };
}

/**
 * Generate fade-in animation
 */
export function createFadeAnimation(
  parsed: ParsedElement,
  config: ElementAnimationConfig
): GeneratedAnimation {
  const { element } = parsed;
  
  const keyframes: AnimationKeyframe[] = [
    { offset: 0, opacity: 0 },
    { offset: 1, opacity: 1 }
  ];
  
  return {
    element,
    keyframes,
    options: buildAnimationOptions(config)
  };
}

/**
 * Generate scale animation
 */
export function createScaleAnimation(
  parsed: ParsedElement,
  config: ElementAnimationConfig
): GeneratedAnimation {
  const { element, bounds } = parsed;
  const scaleFrom = config.scaleFrom ?? 0;
  const scaleTo = config.scaleTo ?? 1;
  
  // Calculate transform origin from bounds
  let originX = '50%';
  let originY = '50%';
  
  if (bounds) {
    originX = `${bounds.x + bounds.width / 2}px`;
    originY = `${bounds.y + bounds.height / 2}px`;
  }
  
  const originalTransformOrigin = element.style.transformOrigin;
  element.style.transformOrigin = `${originX} ${originY}`;
  
  const keyframes: AnimationKeyframe[] = [
    { offset: 0, transform: `scale(${scaleFrom})`, opacity: scaleFrom === 0 ? 0 : 1 },
    { offset: 1, transform: `scale(${scaleTo})`, opacity: 1 }
  ];
  
  return {
    element,
    keyframes,
    options: buildAnimationOptions(config),
    cleanup: () => {
      element.style.transformOrigin = originalTransformOrigin;
    }
  };
}

/**
 * Generate slide animation
 */
export function createSlideAnimation(
  parsed: ParsedElement,
  config: ElementAnimationConfig
): GeneratedAnimation {
  const { element } = parsed;
  const direction = config.slideFrom || 'left';
  
  const slideOffsets: Record<SlideDirection, string> = {
    left: 'translateX(-100%)',
    right: 'translateX(100%)',
    top: 'translateY(-100%)',
    bottom: 'translateY(100%)'
  };
  
  const keyframes: AnimationKeyframe[] = [
    { offset: 0, transform: slideOffsets[direction], opacity: 0 },
    { offset: 1, transform: 'translate(0, 0)', opacity: 1 }
  ];
  
  return {
    element,
    keyframes,
    options: buildAnimationOptions(config)
  };
}

/**
 * Generate rotation animation
 */
export function createRotateAnimation(
  parsed: ParsedElement,
  config: ElementAnimationConfig
): GeneratedAnimation {
  const { element, bounds } = parsed;
  const rotateFrom = config.rotateFrom ?? -180;
  const rotateTo = config.rotateTo ?? 0;
  
  // Set transform origin
  let originX = '50%';
  let originY = '50%';
  
  if (bounds) {
    originX = `${bounds.x + bounds.width / 2}px`;
    originY = `${bounds.y + bounds.height / 2}px`;
  }
  
  const originalTransformOrigin = element.style.transformOrigin;
  element.style.transformOrigin = `${originX} ${originY}`;
  
  const keyframes: AnimationKeyframe[] = [
    { offset: 0, transform: `rotate(${rotateFrom}deg)`, opacity: 0 },
    { offset: 1, transform: `rotate(${rotateTo}deg)`, opacity: 1 }
  ];
  
  return {
    element,
    keyframes,
    options: buildAnimationOptions(config),
    cleanup: () => {
      element.style.transformOrigin = originalTransformOrigin;
    }
  };
}

/**
 * Generate pulse animation
 */
export function createPulseAnimation(
  parsed: ParsedElement,
  config: ElementAnimationConfig
): GeneratedAnimation {
  const { element, bounds } = parsed;
  
  // Set transform origin
  let originX = '50%';
  let originY = '50%';
  
  if (bounds) {
    originX = `${bounds.x + bounds.width / 2}px`;
    originY = `${bounds.y + bounds.height / 2}px`;
  }
  
  const originalTransformOrigin = element.style.transformOrigin;
  element.style.transformOrigin = `${originX} ${originY}`;
  
  const keyframes: AnimationKeyframe[] = [
    { offset: 0, transform: 'scale(0)', opacity: 0 },
    { offset: 0.5, transform: 'scale(1.2)', opacity: 1 },
    { offset: 0.75, transform: 'scale(0.9)', opacity: 1 },
    { offset: 1, transform: 'scale(1)', opacity: 1 }
  ];
  
  return {
    element,
    keyframes,
    options: buildAnimationOptions(config),
    cleanup: () => {
      element.style.transformOrigin = originalTransformOrigin;
    }
  };
}

/**
 * Generate bounce animation
 */
export function createBounceAnimation(
  parsed: ParsedElement,
  config: ElementAnimationConfig
): GeneratedAnimation {
  const { element } = parsed;
  
  const keyframes: AnimationKeyframe[] = [
    { offset: 0, transform: 'translateY(-100%)', opacity: 0 },
    { offset: 0.6, transform: 'translateY(10%)', opacity: 1 },
    { offset: 0.75, transform: 'translateY(-5%)', opacity: 1 },
    { offset: 0.9, transform: 'translateY(2%)', opacity: 1 },
    { offset: 1, transform: 'translateY(0)', opacity: 1 }
  ];
  
  return {
    element,
    keyframes,
    options: buildAnimationOptions(config)
  };
}

/**
 * Automatically determine best animation for element type
 */
export function determineAutoAnimation(parsed: ParsedElement): AnimationMode {
  const { element, type, pathLength } = parsed;
  
  switch (type) {
    case 'path':
    case 'line':
    case 'polyline':
    case 'polygon':
      // Use draw animation if element has stroke
      if (hasStroke(element) && pathLength) {
        return 'draw';
      }
      return 'fade';
    
    case 'circle':
    case 'ellipse':
      return 'scale';
    
    case 'rect':
      // Rectangles look good with scale or slide
      return 'scale';
    
    case 'text':
    case 'tspan':
      return 'fade';
    
    case 'g':
      return 'fade';
    
    case 'image':
      return 'fade';
    
    default:
      return 'fade';
  }
}

/**
 * Create animation based on mode
 */
export function createAnimation(
  parsed: ParsedElement,
  config: ElementAnimationConfig
): GeneratedAnimation {
  const mode = config.mode === 'auto' 
    ? determineAutoAnimation(parsed) 
    : (config.mode || 'fade');
  
  switch (mode) {
    case 'draw':
      return createDrawAnimation(parsed, config);
    case 'scale':
      return createScaleAnimation(parsed, config);
    case 'slide':
      return createSlideAnimation(parsed, config);
    case 'rotate':
      return createRotateAnimation(parsed, config);
    case 'pulse':
      return createPulseAnimation(parsed, config);
    case 'bounce':
      return createBounceAnimation(parsed, config);
    case 'fade':
    default:
      return createFadeAnimation(parsed, config);
  }
}

/**
 * Build KeyframeAnimationOptions from config
 */
function buildAnimationOptions(config: ElementAnimationConfig): KeyframeAnimationOptions {
  return {
    duration: config.duration || 1000,
    delay: config.delay || 0,
    easing: config.easing || 'ease-out',
    direction: config.direction || 'normal',
    fill: config.fillMode || 'forwards',
    iterations: config.iterations || 1,
  };
}
