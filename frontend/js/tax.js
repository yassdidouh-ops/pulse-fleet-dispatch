/**
 * PULSE CAD — Québec Taxi Fiscal & Tax Engine
 * Accurate TPS (5%) and TVQ (9.975%) computation, itemized breakdown and legal rounding.
 */
const PulseTaxModule = {
  TPS_RATE: 0.05,
  TVQ_RATE: 0.09975,
  BASE_FARE: 4.10,
  KM_RATE: 1.95,

  calculate(distanceKm, surcharge = 0.0) {
    const km = Math.max(0, Number(distanceKm) || 0);
    const base = this.BASE_FARE;
    const kmFare = Math.round(km * this.KM_RATE * 100) / 100;
    const extra = Math.max(0, Number(surcharge) || 0);
    const subtotal = Math.round((base + kmFare + extra) * 100) / 100;
    const tps = Math.round(subtotal * this.TPS_RATE * 100) / 100;
    const tvq = Math.round(subtotal * this.TVQ_RATE * 100) / 100;
    const total = Math.round((subtotal + tps + tvq) * 100) / 100;

    return {
      distanceKm: km,
      baseFare: base,
      kmRate: this.KM_RATE,
      kmFare: kmFare,
      surcharge: extra,
      subtotal: subtotal,
      tps: tps,
      tvq: tvq,
      total: total,
      formatted: {
        baseFare: `$${base.toFixed(2)}`,
        kmFare: `$${kmFare.toFixed(2)}`,
        surcharge: `$${extra.toFixed(2)}`,
        subtotal: `$${subtotal.toFixed(2)}`,
        tps: `$${tps.toFixed(2)}`,
        tvq: `$${tvq.toFixed(2)}`,
        total: `$${total.toFixed(2)}`
      }
    };
  }
};

if (typeof window !== 'undefined') {
  window.PulseTax = PulseTaxModule;
}
if (typeof module !== 'undefined') {
  module.exports = PulseTaxModule;
}
