# animatus-svg

## Installation
```bash
npm i animatus-svg
```

## Example
```js
// Import the library
import { animate } from 'animatus-svg/index.mjs';

// Animate any SVG element
const animator = animate('#my-svg', {
  mode: 'auto',         // Auto-detect best animation
  duration: 1500,       // Animation duration in ms
  stagger: 100,         // Delay between elements
  easing: 'ease-out',   // Timing function
  autoPlay: true,       // Start immediately
});

// Control the animation
animator.play();      // Start animation
animator.pause();     // Pause
animator.resume();    // Resume
animator.reset();     // Reset to beginning
animator.reverse();   // Play in reverse

// Animation modes: auto, draw, fade, scale, slide, rotate, pulse, bounce
```