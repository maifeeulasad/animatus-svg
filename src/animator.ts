/**
 * SVG Animator - Main animation engine
 */

import {
  AnimatorConfig,
  ParsedElement,
  GeneratedAnimation,
  AnimationState,
  SVGAnimatorInstance,
  DEFAULT_CONFIG,
  ElementAnimationConfig,
} from './types';
import { parseSVG, flattenElements } from './parser';
import { createAnimation } from './animations';

/**
 * Main SVG Animator class
 */
export class SVGAnimator implements SVGAnimatorInstance {
  private svg: SVGElement;
  private config: AnimatorConfig;
  private parsedElements: ParsedElement[];
  private animations: GeneratedAnimation[];
  private runningAnimations: Animation[];
  private state: AnimationState;
  private cleanupFunctions: (() => void)[];

  constructor(svg: SVGElement | string, config: Partial<AnimatorConfig> = {}) {
    // Resolve SVG element
    if (typeof svg === 'string') {
      const element = document.querySelector(svg);
      if (!element || !(element instanceof SVGElement)) {
        throw new Error(`SVG element not found: ${svg}`);
      }
      this.svg = element;
    } else {
      this.svg = svg;
    }

    // Merge config with defaults
    this.config = { ...DEFAULT_CONFIG, ...config };
    
    // Initialize state
    this.parsedElements = [];
    this.animations = [];
    this.runningAnimations = [];
    this.cleanupFunctions = [];
    this.state = {
      isPlaying: false,
      isPaused: false,
      progress: 0,
      currentTime: 0,
    };

    // Parse and prepare animations
    this.initialize();

    // Auto-play if configured
    if (this.config.autoPlay) {
      this.play();
    }
  }

  /**
   * Initialize the animator
   */
  private initialize(): void {
    // Parse SVG structure
    this.parsedElements = parseSVG(this.svg);
    
    // Flatten for sequential animation
    const flatElements = flattenElements(this.parsedElements);
    
    // Generate animations for each element
    this.animations = flatElements.map((parsed, index) => {
      const elementConfig = this.buildElementConfig(parsed, index);
      return createAnimation(parsed, elementConfig);
    });
  }

  /**
   * Build configuration for a specific element
   */
  private buildElementConfig(parsed: ParsedElement, index: number): ElementAnimationConfig {
    const { elementConfig = {} } = this.config;
    const specificConfig = elementConfig[parsed.id] || {};
    
    // Calculate staggered delay
    const staggerDelay = (this.config.stagger || 0) * index;
    const baseDelay = this.config.delay || 0;
    
    return {
      mode: specificConfig.mode || this.config.mode || 'auto',
      duration: specificConfig.duration || this.config.duration,
      delay: (specificConfig.delay || 0) + baseDelay + staggerDelay,
      easing: specificConfig.easing || this.config.easing,
      direction: specificConfig.direction || this.config.direction,
      fillMode: specificConfig.fillMode || this.config.fillMode,
      iterations: specificConfig.iterations || this.config.iterations,
      slideFrom: specificConfig.slideFrom,
      scaleFrom: specificConfig.scaleFrom,
      scaleTo: specificConfig.scaleTo,
      rotateFrom: specificConfig.rotateFrom,
      rotateTo: specificConfig.rotateTo,
    };
  }

  /**
   * Play animations
   */
  async play(): Promise<void> {
    if (this.state.isPlaying) return;

    this.state.isPlaying = true;
    this.state.isPaused = false;

    // Call onStart callback
    this.config.onStart?.();

    // Create and start Web Animations
    this.runningAnimations = this.animations.map((anim, index) => {
      const animation = anim.element.animate(
        anim.keyframes as Keyframe[],
        anim.options
      );

      // Store cleanup function
      if (anim.cleanup) {
        this.cleanupFunctions.push(anim.cleanup);
      }

      // Element callbacks
      animation.onfinish = () => {
        this.config.onElementComplete?.(anim.element, index);
      };

      // Call element start callback
      const delay = (anim.options.delay as number) || 0;
      setTimeout(() => {
        this.config.onElementStart?.(anim.element, index);
      }, delay);

      return animation;
    });

    // Wait for all animations to complete
    try {
      await Promise.all(
        this.runningAnimations.map(anim => anim.finished)
      );
      
      this.state.isPlaying = false;
      this.state.progress = 1;
      
      // Call onComplete callback
      this.config.onComplete?.();

      // Handle looping
      if (this.config.loop) {
        this.reset();
        this.play();
      }
    } catch (error) {
      // Animation was cancelled
      this.state.isPlaying = false;
    }
  }

  /**
   * Pause animations
   */
  pause(): void {
    if (!this.state.isPlaying || this.state.isPaused) return;

    this.runningAnimations.forEach(anim => anim.pause());
    this.state.isPaused = true;
  }

  /**
   * Resume paused animations
   */
  resume(): void {
    if (!this.state.isPaused) return;

    this.runningAnimations.forEach(anim => anim.play());
    this.state.isPaused = false;
  }

  /**
   * Reset animations to beginning
   */
  reset(): void {
    // Cancel running animations
    this.runningAnimations.forEach(anim => anim.cancel());
    this.runningAnimations = [];

    // Run cleanup functions
    this.cleanupFunctions.forEach(fn => fn());
    this.cleanupFunctions = [];

    // Reset state
    this.state = {
      isPlaying: false,
      isPaused: false,
      progress: 0,
      currentTime: 0,
    };

    // Re-initialize animations
    this.initialize();
  }

  /**
   * Reverse animation direction
   */
  reverse(): void {
    this.runningAnimations.forEach(anim => anim.reverse());
  }

  /**
   * Seek to specific time
   */
  seek(time: number): void {
    this.runningAnimations.forEach(anim => {
      anim.currentTime = time;
    });
    this.state.currentTime = time;
  }

  /**
   * Get current animation state
   */
  getState(): AnimationState {
    // Update progress based on running animations
    if (this.runningAnimations.length > 0) {
      const totalDuration = this.getTotalDuration();
      const currentTime = Math.max(
        ...this.runningAnimations.map(a => a.currentTime || 0)
      );
      this.state.currentTime = currentTime;
      this.state.progress = totalDuration > 0 ? currentTime / totalDuration : 0;
    }

    return { ...this.state };
  }

  /**
   * Get total animation duration including stagger
   */
  private getTotalDuration(): number {
    const baseDuration = this.config.duration || DEFAULT_CONFIG.duration;
    const stagger = this.config.stagger || DEFAULT_CONFIG.stagger;
    const elementCount = this.animations.length;
    
    return baseDuration + (stagger * (elementCount - 1));
  }

  /**
   * Clean up and destroy animator
   */
  destroy(): void {
    // Cancel all animations
    this.runningAnimations.forEach(anim => anim.cancel());
    this.runningAnimations = [];

    // Run cleanup functions
    this.cleanupFunctions.forEach(fn => fn());
    this.cleanupFunctions = [];

    // Clear references
    this.animations = [];
    this.parsedElements = [];
  }

  /**
   * Get parsed elements (for inspection)
   */
  getElements(): ParsedElement[] {
    return [...this.parsedElements];
  }

  /**
   * Update configuration
   */
  updateConfig(newConfig: Partial<AnimatorConfig>): void {
    this.config = { ...this.config, ...newConfig };
    this.reset();
  }
}

/**
 * Factory function to create animator
 */
export function animate(
  svg: SVGElement | string,
  config?: Partial<AnimatorConfig>
): SVGAnimator {
  return new SVGAnimator(svg, config);
}

/**
 * Animate SVG from string content
 */
export function animateFromString(
  svgString: string,
  container: HTMLElement,
  config?: Partial<AnimatorConfig>
): SVGAnimator {
  // Parse SVG string
  const parser = new DOMParser();
  const doc = parser.parseFromString(svgString, 'image/svg+xml');
  const svg = doc.documentElement as unknown as SVGElement;
  
  // Check for parsing errors
  const parseError = doc.querySelector('parsererror');
  if (parseError) {
    throw new Error('Invalid SVG: ' + parseError.textContent);
  }
  
  // Append to container
  container.appendChild(svg);
  
  return new SVGAnimator(svg, config);
}
