# animatus-svg

[![npm version](https://badge.fury.io/js/animatus-svg.svg)](https://badge.fury.io/js/animatus-svg)
[![npm downloads](https://img.shields.io/npm/dm/animatus-svg.svg)](https://www.npmjs.com/package/animatus-svg)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

## Installation
```bash
npm i animatus-svg
```

## Example
```js
// step 1: import based on your need
import { animate } from 'animatus-svg/index.mjs';
// import { animate } from 'animatus-svg/index.js';

// step 2: config
const animator = animate('#my-svg', {
  mode: 'auto',         // Auto-detect best animation or auto, draw, fade, scale, slide, rotate, pulse, bounce
  duration: 1500,       // Animation duration in ms
  stagger: 100,         // Delay between elements
  easing: 'ease-out',   // Timing function
  autoPlay: true,       // Start immediately
});

// step 3: play, control the animation
animator.play();      // Start animation
animator.pause();     // Pause
animator.resume();    // Resume
animator.reset();     // Reset to beginning
animator.reverse();   // Play in reverse
```