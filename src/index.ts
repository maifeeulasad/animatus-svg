/**
 * SVG Animator - Pure TypeScript SVG Animation Library
 * 
 * Automatically animates SVG elements with procedurally generated animations.
 * Zero dependencies, works with any framework.
 * 
 * @example
 * ```typescript
 * import { animate } from 'animatus-svg';
 * 
 * // Basic usage
 * const animator = animate('#my-svg');
 * 
 * // With configuration
 * const animator = animate('#my-svg', {
 *   duration: 1500,
 *   stagger: 100,
 *   mode: 'auto',
 *   easing: 'ease-out'
 * });
 * 
 * // Control playback
 * animator.pause();
 * animator.resume();
 * animator.reset();
 * animator.reverse();
 * ```
 */

// Main animator
export { SVGAnimator, animate, animateFromString } from './animator';

// Parser utilities
export { 
  parseSVG, 
  flattenElements, 
  getElementType, 
  getPathLength,
  hasStroke,
  hasFill,
  sortByVisualOrder,
  groupByType
} from './parser';

// Animation creators
export {
  createAnimation,
  createDrawAnimation,
  createFadeAnimation,
  createScaleAnimation,
  createSlideAnimation,
  createRotateAnimation,
  createPulseAnimation,
  createBounceAnimation,
  determineAutoAnimation
} from './animations';

// Types
export type {
  AnimatorConfig,
  ElementAnimationConfig,
  AnimationMode,
  AnimationState,
  SVGAnimatorInstance,
  ParsedElement,
  SVGElementType,
  GeneratedAnimation,
  AnimationKeyframe,
  EasingFunction,
  AnimationDirection,
  AnimationFillMode,
  SlideDirection
} from './types';

// Default config
export { DEFAULT_CONFIG } from './types';
