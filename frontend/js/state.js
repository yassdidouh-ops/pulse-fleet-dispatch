/**
 * PULSE CAD — Modular State Wrapper
 * Ensures compatibility for scripts loading js/state.js
 */
if (typeof require !== 'undefined' && typeof module !== 'undefined') {
  module.exports = require('../state.js');
} else if (typeof window !== 'undefined' && !window.PulseState) {
  // If state.js was not yet loaded, dynamically load it or evaluate
  const script = document.createElement('script');
  script.src = 'state.js';
  document.head.appendChild(script);
}
