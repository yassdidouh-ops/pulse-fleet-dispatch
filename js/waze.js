/**
 * PULSE CAD — Waze Traffic & Incident Dispatch Integration Module
 * Injects arterial hazards and formats navigation URLs.
 */
const PulseWazeModule = {
  getIncidents() {
    if (typeof window !== 'undefined' && window.PulseState) {
      return window.PulseState.getWazeIncidents();
    }
    return [];
  },
  injectIncident(artery, desc, lat, lng) {
    if (typeof window !== 'undefined' && window.PulseState) {
      return window.PulseState.injectWazeIncident(artery, desc, lat, lng);
    }
    return null;
  },
  getNavigationUrl(address, isNative = false) {
    const encoded = encodeURIComponent(address || 'Montréal, QC');
    if (isNative) {
      return `waze://?q=${encoded}&navigate=yes`;
    }
    return `https://www.waze.com/ul?q=${encoded}&navigate=yes`;
  }
};

if (typeof window !== 'undefined') {
  window.PulseWaze = PulseWazeModule;
}
if (typeof module !== 'undefined') {
  module.exports = PulseWazeModule;
}
