/**
 * PULSE CAD — OBD-II CAN Bus & Fleet Telemetry Module
 * Formats ISO-11898 standard vehicle parameters, battery voltage, coolant temp, odometer.
 */
const PulseOBDModule = {
  formatVehicleTelemetry(veh) {
    if (!veh) return null;
    return {
      code: veh.code || 'UNIT-000',
      vin: veh.vin || '2C3CDXAG8KH23209',
      protocol: 'ISO-11898-2 CAN 2.0B (500 kbps)',
      speedKmH: Math.max(0, Number(veh.speed) || 0),
      batteryVolts: Number(veh.batteryVoltage || 14.1),
      coolantTempC: Number(veh.coolantTemp || 91),
      odometerKm: Number(veh.odometerKm || 50000),
      hardwareId: veh.mdtHardwareId || 'MDT-HW-GEN4',
      rssi: Number(veh.networkRssi || -68),
      latencyMs: Number(veh.networkLatencyMs || 24),
      headingDeg: Number(veh.heading || 0),
      gps: {
        lat: Number(veh.lat ? veh.lat.toFixed(6) : 45.5019),
        lng: Number(veh.lng ? veh.lng.toFixed(6) : -73.5674)
      }
    };
  }
};

if (typeof window !== 'undefined') {
  window.PulseOBD = PulseOBDModule;
}
if (typeof module !== 'undefined') {
  module.exports = PulseOBDModule;
}
