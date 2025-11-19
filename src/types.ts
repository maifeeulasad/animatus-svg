/**
 * SVG Animator - Type Definitions
 * Pure TypeScript SVG animation library
 */

// Animation timing functions
export type EasingFunction = 
  | 'linear'
  | 'ease'
  | 'ease-in'
  | 'ease-out'
  | 'ease-in-out'
  | 'cubic-bezier'
  | string;

// Animation modes for different effects
export type AnimationMode = 
  | 'auto'      // Automatically detect best animation
  | 'draw'      // Stroke drawing effect
  | 'fade'      // Opacity transition
  | 'scale'     // Scale transformation
  | 'slide'     // Position slide
  | 'morph'     // Path morphing
  | 'pulse'     // Pulsing effect
  | 'rotate'    // Rotation animation
  | 'bounce';   // Bounce effect

// Direction for animations
export type AnimationDirection = 
  | 'normal'
  | 'reverse'
  | 'alternate'
  | 'alternate-reverse';

// Fill mode for animations
export type AnimationFillMode = 
  | 'none'
  | 'forwards'
  | 'backwards'
  | 'both';

// Slide directions
export type SlideDirection = 
  | 'left'
  | 'right'
  | 'top'
  | 'bottom';

// Configuration for individual element animations
export interface ElementAnimationConfig {
  mode?: AnimationMode;
  duration?: number;
  delay?: number;
  easing?: EasingFunction;
  direction?: AnimationDirection;
  fillMode?: AnimationFillMode;
  iterations?: number;
  slideFrom?: SlideDirection;
  scaleFrom?: number;
  scaleTo?: number;
  rotateFrom?: number;
  rotateTo?: number;
}

// Main animator configuration
export interface AnimatorConfig {
  // Global settings
  duration?: number;
  delay?: number;
  easing?: EasingFunction;
  stagger?: number;
  direction?: AnimationDirection;
  fillMode?: AnimationFillMode;
  iterations?: number;
  
  // Animation behavior
  mode?: AnimationMode;
  autoPlay?: boolean;
  loop?: boolean;
  
  // Element-specific overrides
  elementConfig?: Record<string, ElementAnimationConfig>;
  
  // Callbacks
  onStart?: () => void;
  onComplete?: () => void;
  onElementStart?: (element: SVGElement, index: number) => void;
  onElementComplete?: (element: SVGElement, index: number) => void;
}

// Parsed SVG element information
export interface ParsedElement {
  element: SVGElement;
  type: SVGElementType;
  id: string;
  index: number;
  pathLength?: number;
  bounds?: DOMRect;
  children?: ParsedElement[];
  computedStyle?: CSSStyleDeclaration;
}

// SVG element types we handle
export type SVGElementType = 
  | 'path'
  | 'circle'
  | 'ellipse'
  | 'rect'
  | 'line'
  | 'polyline'
  | 'polygon'
  | 'text'
  | 'tspan'
  | 'g'
  | 'use'
  | 'image'
  | 'unknown';

// Animation keyframe
export interface AnimationKeyframe {
  offset?: number;
  [property: string]: string | number | undefined;
}

// Generated animation data
export interface GeneratedAnimation {
  element: SVGElement;
  keyframes: AnimationKeyframe[];
  options: KeyframeAnimationOptions;
  cleanup?: () => void;
}

// Animation state
export interface AnimationState {
  isPlaying: boolean;
  isPaused: boolean;
  progress: number;
  currentTime: number;
}

// SVG Animator instance interface
export interface SVGAnimatorInstance {
  // Control methods
  play(): Promise<void>;
  pause(): void;
  resume(): void;
  reset(): void;
  reverse(): void;
  seek(time: number): void;
  
  // State
  getState(): AnimationState;
  
  // Cleanup
  destroy(): void;
}

// Default configuration values
export const DEFAULT_CONFIG: Required<Omit<AnimatorConfig, 'elementConfig' | 'onStart' | 'onComplete' | 'onElementStart' | 'onElementComplete'>> = {
  duration: 1000,
  delay: 0,
  easing: 'ease-out',
  stagger: 50,
  direction: 'normal',
  fillMode: 'forwards',
  iterations: 1,
  mode: 'auto',
  autoPlay: true,
  loop: false,
};
