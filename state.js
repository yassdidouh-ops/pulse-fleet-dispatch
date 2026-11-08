/**
 * PULSE CAD — Shared Telemetry & State Management Engine
 * Production-grade cross-tab synchronization for Metro Fleet Operations.
 * Uses strict system codes, telemetry designations, persistent LocalStorage (with safe fallback),
 * dynamic GPS micro-step interpolation, OBD-II CAN bus emulation and waypoint routing.
 */

// Resilient BroadcastChannel
const PULSE_CHANNEL = (typeof BroadcastChannel !== 'undefined') 
  ? new BroadcastChannel('pulse_cad_sync') 
  : {
      postMessage: () => {},
      addEventListener: () => {},
      removeEventListener: () => {},
      onmessage: null
    };

// Leaflet Default Icon Path Fix (prevents 404 on marker-icon.png)
if (typeof window !== 'undefined' && typeof window.L !== 'undefined' && window.L.Icon && window.L.Icon.Default) {
  window.L.Icon.Default.imagePath = 'https://unpkg.com/leaflet@1.9.4/dist/images/';
}

// In-Memory Storage Fallback for private browsing / blocked storage
const _memoryStore = {};
const safeStorage = {
  getItem(key) {
    try {
      if (typeof window !== 'undefined' && window.localStorage) {
        return window.localStorage.getItem(key);
      }
      return _memoryStore[key] || null;
    } catch (e) {
      return _memoryStore[key] || null;
    }
  },
  setItem(key, value) {
    const str = String(value);
    _memoryStore[key] = str;
    try {
      if (typeof window !== 'undefined' && window.localStorage) {
        window.localStorage.setItem(key, str);
      }
    } catch (e) {
      // Storage quota or permission error
    }
  },
  removeItem(key) {
    delete _memoryStore[key];
    try {
      if (typeof window !== 'undefined' && window.localStorage) {
        window.localStorage.removeItem(key);
      }
    } catch (e) {}
  }
};

const INITIAL_VEHICLES = [
  {
    id: 232,
    code: "UNIT-232",
    status: "LIBRE",
    type: "BERLINE",
    zone: "ZONE-01 (CENTRE-VILLE)",
    lat: 45.501923,
    lng: -73.567412,
    speed: 34,
    phone: "(514) 872-0232",
    address: "1250 Boul. René-Lévesque Ouest",
    vin: "2C3CDXAG8KH23209",
    mdtHardwareId: "MDT-HW-99232-REV4",
    batteryVoltage: 13.9,
    coolantTemp: 91,
    odometerKm: 84219.4,
    networkLatencyMs: 24,
    networkRssi: -67,
    heading: 85,
    patrolStep: 0,
    patrolPoints: [
      [45.501923, -73.567412],
      [45.504210, -73.564100],
      [45.507850, -73.569500],
      [45.503100, -73.573200],
      [45.501923, -73.567412]
    ]
  },
  {
    id: 65,
    code: "UNIT-065",
    status: "EN_COURSE",
    type: "TPMR",
    zone: "ZONE-02 (PLATEAU)",
    lat: 45.522510,
    lng: -73.582100,
    speed: 28,
    phone: "(514) 872-0065",
    address: "Avenue du Mont-Royal / St-Denis",
    vin: "3C6UR5DL7MG19842",
    mdtHardwareId: "MDT-HW-88065-REV3",
    batteryVoltage: 14.1,
    coolantTemp: 89,
    odometerKm: 121054.2,
    networkLatencyMs: 19,
    networkRssi: -62,
    heading: 180,
    patrolStep: 0,
    patrolPoints: [
      [45.522510, -73.582100],
      [45.518500, -73.579000],
      [45.515200, -73.586000],
      [45.522510, -73.582100]
    ]
  },
  {
    id: 184,
    code: "UNIT-184",
    status: "EN_ROUTE",
    type: "BERLINE",
    zone: "ZONE-03 (AÉROPORT YUL)",
    lat: 45.470500,
    lng: -73.740800,
    speed: 78,
    phone: "(514) 872-0184",
    address: "Autoroute 20 Ouest (KM 54)",
    vin: "1FA6P8CF4H519082",
    mdtHardwareId: "MDT-HW-99184-REV4",
    batteryVoltage: 14.2,
    coolantTemp: 94,
    odometerKm: 42910.8,
    networkLatencyMs: 31,
    networkRssi: -71,
    heading: 265,
    patrolStep: 0,
    patrolPoints: [
      [45.470500, -73.740800],
      [45.465000, -73.731000],
      [45.475000, -73.750000],
      [45.470500, -73.740800]
    ]
  },
  {
    id: 112,
    code: "UNIT-112",
    status: "LIBRE",
    type: "FOURGON",
    zone: "ZONE-04 (VIEUX-PORT)",
    lat: 45.503500,
    lng: -73.553200,
    speed: 22,
    phone: "(514) 872-0112",
    address: "Rue de la Commune / Place Jacques-Cartier",
    vin: "WAUZZZ4G9CN04419",
    mdtHardwareId: "MDT-HW-77112-REV2",
    batteryVoltage: 13.8,
    coolantTemp: 90,
    odometerKm: 98402.1,
    networkLatencyMs: 22,
    networkRssi: -65,
    heading: 45,
    patrolStep: 0,
    patrolPoints: [
      [45.503500, -73.553200],
      [45.507000, -73.550000],
      [45.509000, -73.556000],
      [45.503500, -73.553200]
    ]
  },
  {
    id: 409,
    code: "UNIT-409",
    status: "PAUSE",
    type: "BERLINE",
    zone: "ZONE-01 (CENTRE-VILLE)",
    lat: 45.498800,
    lng: -73.572100,
    speed: 0,
    phone: "(514) 872-0409",
    address: "Rue Guy / Sainte-Catherine (Stationnement)",
    vin: "JN8AY2NC7M931084",
    mdtHardwareId: "MDT-HW-99409-REV4",
    batteryVoltage: 12.6,
    coolantTemp: 74,
    odometerKm: 65112.9,
    networkLatencyMs: 18,
    networkRssi: -58,
    heading: 0,
    patrolStep: 0,
    patrolPoints: [
      [45.498800, -73.572100],
      [45.498800, -73.572100]
    ]
  },
  {
    id: 521,
    code: "UNIT-521",
    status: "EN_COURSE",
    type: "FOURGON",
    zone: "ZONE-05 (CÔTE-DES-NEIGES)",
    lat: 45.496500,
    lng: -73.618000,
    speed: 42,
    phone: "(514) 872-0521",
    address: "Chemin de la Côte-des-Neiges",
    vin: "2C4RC1CG5KR10984",
    mdtHardwareId: "MDT-HW-99521-REV3",
    batteryVoltage: 14.0,
    coolantTemp: 92,
    odometerKm: 114503.7,
    networkLatencyMs: 26,
    networkRssi: -69,
    heading: 310,
    patrolStep: 0,
    patrolPoints: [
      [45.496500, -73.618000],
      [45.501000, -73.625000],
      [45.492000, -73.610000],
      [45.496500, -73.618000]
    ]
  },
  {
    id: 304,
    code: "UNIT-304",
    status: "LIBRE",
    type: "BERLINE",
    zone: "ZONE-02 (PLATEAU)",
    lat: 45.529000,
    lng: -73.572000,
    speed: 31,
    phone: "(514) 872-0304",
    address: "Boulevard Saint-Laurent / Laurier",
    vin: "KL4CJASB8HB01923",
    mdtHardwareId: "MDT-HW-99304-REV4",
    batteryVoltage: 14.1,
    coolantTemp: 90,
    odometerKm: 38210.0,
    networkLatencyMs: 20,
    networkRssi: -63,
    heading: 90,
    patrolStep: 0,
    patrolPoints: [
      [45.529000, -73.572000],
      [45.534000, -73.578000],
      [45.526000, -73.568000],
      [45.529000, -73.572000]
    ]
  },
  {
    id: 97,
    code: "UNIT-097",
    status: "EN_ROUTE",
    type: "TPMR",
    zone: "ZONE-04 (VIEUX-PORT)",
    lat: 45.508500,
    lng: -73.548000,
    speed: 36,
    phone: "(514) 872-0097",
    address: "Rue Notre-Dame Est / Bonsecours",
    vin: "SALWR2V45HA82104",
    mdtHardwareId: "MDT-HW-88097-REV2",
    batteryVoltage: 13.9,
    coolantTemp: 93,
    odometerKm: 154820.6,
    networkLatencyMs: 29,
    networkRssi: -73,
    heading: 120,
    patrolStep: 0,
    patrolPoints: [
      [45.508500, -73.548000],
      [45.512000, -73.542000],
      [45.504000, -73.552000],
      [45.508500, -73.548000]
    ]
  },
  {
    id: 718,
    code: "UNIT-718",
    status: "LIBRE",
    type: "BERLINE",
    zone: "ZONE-01 (CENTRE-VILLE)",
    lat: 45.506200,
    lng: -73.571000,
    speed: 29,
    phone: "(514) 872-0718",
    address: "Rue Sherbrooke Ouest / McGill College",
    vin: "5NMS33AG9LH00921",
    mdtHardwareId: "MDT-HW-99718-REV4",
    batteryVoltage: 14.0,
    coolantTemp: 89,
    odometerKm: 51204.3,
    networkLatencyMs: 21,
    networkRssi: -64,
    heading: 230,
    patrolStep: 0,
    patrolPoints: [
      [45.506200, -73.571000],
      [45.510000, -73.565000],
      [45.502000, -73.576000],
      [45.506200, -73.571000]
    ]
  },
  {
    id: 840,
    code: "UNIT-840",
    status: "EN_COURSE",
    type: "BERLINE",
    zone: "ZONE-03 (AÉROPORT YUL)",
    lat: 45.461000,
    lng: -73.715000,
    speed: 72,
    phone: "(514) 872-0840",
    address: "Autoroute Côte-de-Liesse (520 Ouest)",
    vin: "WVWPR7AJ2EP19830",
    mdtHardwareId: "MDT-HW-99840-REV4",
    batteryVoltage: 14.1,
    coolantTemp: 92,
    odometerKm: 73491.5,
    networkLatencyMs: 25,
    networkRssi: -66,
    heading: 280,
    patrolStep: 0,
    patrolPoints: [
      [45.461000, -73.715000],
      [45.466000, -73.725000],
      [45.455000, -73.705000],
      [45.461000, -73.715000]
    ]
  },
  {
    id: 615,
    code: "UNIT-615",
    status: "LIBRE",
    type: "FOURGON",
    zone: "ZONE-02 (PLATEAU)",
    lat: 45.517000,
    lng: -73.590000,
    speed: 25,
    phone: "(514) 872-0615",
    address: "Avenue du Parc / Mont-Royal",
    vin: "3FA6P0HD8LR20912",
    mdtHardwareId: "MDT-HW-99615-REV3",
    batteryVoltage: 13.9,
    coolantTemp: 91,
    odometerKm: 89012.8,
    networkLatencyMs: 23,
    networkRssi: -68,
    heading: 10,
    patrolStep: 0,
    patrolPoints: [
      [45.517000, -73.590000],
      [45.522000, -73.585000],
      [45.512000, -73.595000],
      [45.517000, -73.590000]
    ]
  },
  {
    id: 153,
    code: "UNIT-153",
    status: "PAUSE",
    type: "BERLINE",
    zone: "ZONE-04 (VIEUX-PORT)",
    lat: 45.501000,
    lng: -73.556000,
    speed: 0,
    phone: "(514) 872-0153",
    address: "Quai King-Edward (Stationnement VIP)",
    vin: "1G1BE5SM7J718290",
    mdtHardwareId: "MDT-HW-88153-REV3",
    batteryVoltage: 12.7,
    coolantTemp: 76,
    odometerKm: 62410.9,
    networkLatencyMs: 17,
    networkRssi: -59,
    heading: 0,
    patrolStep: 0,
    patrolPoints: [
      [45.501000, -73.556000],
      [45.501000, -73.556000]
    ]
  }
];

const INITIAL_CALLS = [
  {
    id: "5081",
    client: "CORP-AIR-CANADA // AC-882",
    phone: "(514) 872-4091",
    pickup: "1250 Boulevard René-Lévesque Ouest, Montréal",
    suite: "Tour Bell / Entrée Sud",
    dest: "Aéroport International Montréal-Trudeau (YUL)",
    zone: "ZONE-01 (CENTRE-VILLE)",
    vehType: "BERLINE",
    passengers: 2,
    restrictions: ["RÉSERVATION PRIORITAIRE", "PAIEMENT DÉBIT/CARTE", "AÉROPORT TRUDEAU (YUL)"],
    status: "EN_ATTENTE",
    assignedUnit: null,
    assignedVeh: null,
    createdAt: "01:22:10",
    time: "01:22:10",
    price: 48.50,
    notes: "Hall principal devant les portes tournantes, 2 valises. Vol international AC882."
  },
  {
    id: "5082",
    client: "CIUSS SANTÉ // PROTOCOLE-MED",
    phone: "(514) 890-8000",
    pickup: "1051 Rue Sanguinet, Montréal (CHUM)",
    suite: "Pavillon C - Entrée Ambulatoire",
    dest: "2155 Rue Guy, Montréal",
    zone: "ZONE-01 (CENTRE-VILLE)",
    vehType: "TPMR",
    passengers: 1,
    restrictions: ["FAUTEUIL ROULANT / TPMR", "TRANSPORT MÉDICAL CIUSS"],
    status: "EN_ATTENTE",
    assignedUnit: null,
    assignedVeh: null,
    createdAt: "01:23:45",
    time: "01:23:45",
    price: 24.50,
    notes: "Fauteuil roulant électrique. Accès rampe arrière exigé."
  },
  {
    id: "5083",
    client: "FAIRMONT // CONCIERGE-DESK",
    phone: "(514) 861-3511",
    pickup: "900 Boulevard René-Lévesque Ouest, Montréal",
    suite: "Entrée Voiturier",
    dest: "Casino de Montréal, Île Notre-Dame",
    zone: "ZONE-01 (CENTRE-VILLE)",
    vehType: "FOURGON",
    passengers: 5,
    restrictions: ["PAIEMENT DÉBIT/CARTE", "COFFRE VOLUMINEUX"],
    status: "EN_ATTENTE",
    assignedUnit: null,
    assignedVeh: null,
    createdAt: "01:24:18",
    time: "01:24:18",
    price: 32.00,
    notes: "Groupe corporatif délégations d'affaires, facture directe Fairmont #FA-904."
  },
  {
    id: "5084",
    client: "PALAIS DES CONGRÈS // VIP-ACCESS",
    phone: "(514) 871-8122",
    pickup: "1001 Place Jean-Paul-Riopelle, Montréal",
    suite: "Porte 4 (Avenue Viger)",
    dest: "Gare Centrale de Montréal",
    zone: "ZONE-04 (VIEUX-PORT)",
    vehType: "BERLINE",
    passengers: 1,
    restrictions: ["ACCÈS EXPRESS", "VÉHICULE 100% ÉLECTRIQUE"],
    status: "EN_ATTENTE",
    assignedUnit: null,
    assignedVeh: null,
    createdAt: "01:25:30",
    time: "01:25:30",
    price: 18.00,
    notes: "Client avec train VIA Rail à 02:15."
  },
  {
    id: "5085",
    client: "CUSM // SERVICE HOSPITALIER",
    phone: "(514) 934-1934",
    pickup: "1650 Avenue Cedar, Montréal",
    suite: "Hôpital Général de Montréal (Urgences Porte B)",
    dest: "5415 Boulevard de l'Assomption, Montréal (Maisonneuve-Rosemont)",
    zone: "ZONE-05 (CÔTE-DES-NEIGES)",
    vehType: "TPMR",
    passengers: 1,
    restrictions: ["FAUTEUIL ROULANT / TPMR", "TRANSPORT MÉDICAL CIUSS"],
    status: "EN_ATTENTE",
    assignedUnit: null,
    assignedVeh: null,
    createdAt: "01:26:05",
    time: "01:26:05",
    price: 38.00,
    notes: "Transfert patient inter-établissements, bon de commande CUSM #8841."
  }
];

const INITIAL_MESSAGES = [
  {
    id: 201,
    prio: "URGENTE",
    priority: "URGENTE",
    category: "CAD",
    from: "CENTRAL CAD DISPATCH",
    to: "TOUTE LA FLOTTE MÉTROPOLITAINE",
    subject: "FERMETURE DU PONT JACQUES-CARTIER DIRECTION SUD — DÉVIATION CHOPIN",
    date: "AUJOURD'HUI 01:15",
    time: "01:15",
    unread: true,
    body: "AVIS OPÉRATIONNEL CRITIQUE // RÉSEAU MÉTROPOLITAIN :\n\nEn raison d'une intervention des services d'urgence, le Pont Jacques-Cartier est totalement fermé en direction Rive-Sud.\n\nCONSIGNES CAD :\n• Rediriger l'ensemble des courses vers le Pont Samuel-De Champlain ou le Pont Victoria.\n• Informer les clients d'un délai estimé à 20 minutes.\n• Mettre à jour les estimations d'arrivée sur vos terminaux MDT."
  },
  {
    id: 202,
    prio: "NORMALE",
    priority: "NORMALE",
    category: "VEH",
    from: "UNIT-232 // TERMINAL EMBARQUÉ",
    to: "CENTRAL CAD DISPATCH",
    subject: "SIGNALEMENT TRAVAUX BOULEVARD RENÉ-LÉVESQUE ANGLE PEEL",
    date: "AUJOURD'HUI 01:05",
    time: "01:05",
    unread: true,
    body: "Avis système de l'unité 232 :\n\nTravaux de voirie non signalés à l'angle René-Lévesque et Peel, une seule voie ouverte devant la Place du Canada. Ralentissement significatif vers l'ouest."
  },
  {
    id: 203,
    prio: "VIP",
    priority: "VIP",
    category: "CAD",
    from: "SUPERVISEUR POSTE AÉROPORT",
    to: "UNIT-184 // TERMINAL EMBARQUÉ",
    subject: "PRISE EN CHARGE VIP // ARRIVÉES INTERNATIONALES YUL",
    date: "AUJOURD'HUI 00:50",
    time: "00:50",
    unread: false,
    body: "Unité 184, client exécutif Air Canada à récupérer aux Arrivées Internationales (Porte 7).\nPancarte système : 'AC882 / VIP'. Véhicule conforme protocole exécutif."
  }
];

class PulseState {
  static simulationRunning = true;
  static simulationSpeed = 1; // 1, 2, or 5
  static simulationTimer = null;
  static activeWaypoints = [];
  static activeIncidents = [
    { id: 'INC-01', artery: 'A-15 SUD', desc: 'Congestion majeure 14 km/h (+18m)', lat: 45.525, lng: -73.665, color: '#dc2626' },
    { id: 'INC-02', artery: 'PONT JACQUES-CARTIER', desc: 'Fermeture Sud Urgences', lat: 45.520, lng: -73.525, color: '#7f1d1d' },
    { id: 'INC-03', artery: 'BD RENÉ-LÉVESQUE', desc: 'Travaux angle Peel 22 km/h', lat: 45.5019, lng: -73.5674, color: '#f59e0b' }
  ];

  /* -------------------------------------------------------------
   * VEHICLE FLEET MANAGEMENT
   * ----------------------------------------------------------- */
  static getVehicles() {
    try {
      const raw = safeStorage.getItem('pulse_vehicles');
      if (!raw) return INITIAL_VEHICLES;
      const parsed = JSON.parse(raw);
      return (Array.isArray(parsed) && parsed.length > 0) ? parsed : INITIAL_VEHICLES;
    } catch (e) {
      console.error('PulseState.getVehicles error:', e);
      return INITIAL_VEHICLES;
    }
  }

  static saveVehicles(vehicles, skipBroadcast = false) {
    try {
      safeStorage.setItem('pulse_vehicles', JSON.stringify(vehicles));
      if (!skipBroadcast) {
        PULSE_CHANNEL.postMessage({ type: 'VEHICLES_UPDATED', payload: vehicles });
      }
    } catch (e) {
      console.error('PulseState.saveVehicles error:', e);
    }
  }

  static updateVehicleStatus(vehicleId, newStatus) {
    const vehicles = this.getVehicles();
    const veh = vehicles.find(v => Number(v.id) === Number(vehicleId));
    if (veh) {
      veh.status = newStatus;
      this.saveVehicles(vehicles);
    }
  }

  /* -------------------------------------------------------------
   * CAD DISPATCH CALLS MANAGEMENT
   * ----------------------------------------------------------- */
  static getCalls() {
    try {
      const raw = safeStorage.getItem('pulse_calls');
      if (!raw) return INITIAL_CALLS;
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed) && parsed.length > 0) {
        return parsed.map(c => {
          c.time = c.time || c.createdAt || '--:--';
          c.createdAt = c.createdAt || c.time;
          c.assignedUnit = c.assignedUnit || c.assignedVeh || null;
          c.assignedVeh = c.assignedVeh || c.assignedUnit || null;
          c.price = (typeof c.price === 'number') ? c.price : 35.00;
          return c;
        });
      }
      return INITIAL_CALLS;
    } catch (e) {
      console.error('PulseState.getCalls error:', e);
      return INITIAL_CALLS;
    }
  }

  static saveCalls(calls) {
    try {
      safeStorage.setItem('pulse_calls', JSON.stringify(calls));
      PULSE_CHANNEL.postMessage({ type: 'CALLS_UPDATED', payload: calls });
    } catch (e) {
      console.error('PulseState.saveCalls error:', e);
    }
  }

  static createCall(newCall) {
    const calls = this.getCalls();
    const nowStr = new Date().toLocaleTimeString('fr-CA', { hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: false });
    
    newCall.id = String(newCall.id || Math.floor(5100 + Math.random() * 900));
    newCall.createdAt = newCall.createdAt || nowStr;
    newCall.time = newCall.time || newCall.createdAt;
    newCall.assignedUnit = (newCall.assignedUnit !== undefined) ? newCall.assignedUnit : (newCall.assignedVeh || null);
    newCall.assignedVeh = (newCall.assignedVeh !== undefined) ? newCall.assignedVeh : (newCall.assignedUnit || null);
    newCall.status = newCall.status || 'EN_ATTENTE';
    newCall.price = (typeof newCall.price === 'number') ? newCall.price : 48.50;

    calls.unshift(newCall);
    this.saveCalls(calls);
    return newCall;
  }

  // Backward compatible alias
  static addCall(newCall) {
    return this.createCall(newCall);
  }

  static assignCall(callId, unitId) {
    const calls = this.getCalls();
    const call = calls.find(c => String(c.id) === String(callId));
    if (call) {
      call.status = 'ATTRIBUÉ';
      call.assignedUnit = Number(unitId);
      call.assignedVeh = Number(unitId);
      this.saveCalls(calls);
    }

    const vehicles = this.getVehicles();
    const veh = vehicles.find(v => v.id === Number(unitId));
    if (veh) {
      veh.status = 'EN_ROUTE';
      this.saveVehicles(vehicles);
    }
  }

  static updateCallStatus(callId, status) {
    const calls = this.getCalls();
    const call = calls.find(c => String(c.id) === String(callId));
    if (call) {
      const oldUnit = call.assignedUnit || call.assignedVeh;
      call.status = status;
      this.saveCalls(calls);

      if (oldUnit) {
        const vehicles = this.getVehicles();
        const veh = vehicles.find(v => v.id === Number(oldUnit));
        if (veh) {
          if (status === 'TERMINÉ' || status === 'ANNULÉ') {
            veh.status = 'LIBRE';
            this.saveVehicles(vehicles);
          } else if (status === 'EN_ROUTE') {
            veh.status = 'EN_ROUTE';
            this.saveVehicles(vehicles);
          } else if (status === 'SUR_PLACE' || status === 'EN_COURSE') {
            veh.status = 'EN_COURSE';
            this.saveVehicles(vehicles);
          }
        }
      }
    }
  }

  /* -------------------------------------------------------------
   * MDT 10-4 RADIO MESSAGING
   * ----------------------------------------------------------- */
  static getMessages() {
    try {
      const raw = safeStorage.getItem('pulse_messages');
      if (!raw) return INITIAL_MESSAGES;
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed) && parsed.length > 0) {
        return parsed.map(m => {
          m.time = m.time || m.date || '--:--';
          m.date = m.date || `AUJOURD'HUI ${m.time}`;
          m.priority = m.priority || m.prio || 'NORMALE';
          m.prio = m.prio || m.priority;
          m.category = m.category || 'CAD';
          return m;
        });
      }
      return INITIAL_MESSAGES;
    } catch (e) {
      console.error('PulseState.getMessages error:', e);
      return INITIAL_MESSAGES;
    }
  }

  static saveMessages(msgs) {
    try {
      safeStorage.setItem('pulse_messages', JSON.stringify(msgs));
      PULSE_CHANNEL.postMessage({ type: 'MESSAGES_UPDATED', payload: msgs });
    } catch (e) {
      console.error('PulseState.saveMessages error:', e);
    }
  }

  static addMessage(fromOrObj, subject, body, category = 'CAD', priority = 'NORMALE', to = 'TOUTE LA FLOTTE') {
    const msgs = this.getMessages();
    const nowTime = new Date().toLocaleTimeString('fr-CA', { hour: '2-digit', minute: '2-digit', hour12: false });
    let msgObj;

    if (typeof fromOrObj === 'object' && fromOrObj !== null) {
      msgObj = {
        id: fromOrObj.id || (Date.now() + Math.floor(Math.random() * 1000)),
        from: fromOrObj.from || 'DISPATCH CENTRAL',
        to: fromOrObj.to || 'TOUTE LA FLOTTE',
        subject: fromOrObj.subject || 'TRANSMISSION MDT',
        body: fromOrObj.body || '',
        category: fromOrObj.category || 'CAD',
        prio: fromOrObj.prio || fromOrObj.priority || 'NORMALE',
        priority: fromOrObj.priority || fromOrObj.prio || 'NORMALE',
        time: fromOrObj.time || nowTime,
        date: fromOrObj.date || `AUJOURD'HUI ${nowTime}`,
        unread: (fromOrObj.unread !== undefined) ? fromOrObj.unread : true
      };
    } else {
      msgObj = {
        id: Date.now() + Math.floor(Math.random() * 1000),
        from: fromOrObj || 'DISPATCH CENTRAL',
        to: to || 'TOUTE LA FLOTTE',
        subject: subject || 'TRANSMISSION CAD',
        body: body || '',
        category: category || 'CAD',
        prio: priority || 'NORMALE',
        priority: priority || 'NORMALE',
        time: nowTime,
        date: `AUJOURD'HUI ${nowTime}`,
        unread: true
      };
    }

    msgs.unshift(msgObj);
    this.saveMessages(msgs);
    return msgObj;
  }

  static sendMessage(msg) {
    return this.addMessage(msg);
  }

  static markMessageRead(id) {
    const msgs = this.getMessages();
    const found = msgs.find(m => String(m.id) === String(id));
    if (found) {
      found.unread = false;
      this.saveMessages(msgs);
    }
  }

  /* -------------------------------------------------------------
   * CAD WAYPOINTS OVERRIDE ROUTING
   * ----------------------------------------------------------- */
  static getWaypoints() {
    return this.activeWaypoints || [];
  }

  static addWaypoint(lat, lng) {
    const id = (this.activeWaypoints.length || 0) + 1;
    const wp = {
      id,
      label: `WP-0${id}`,
      lat: Number(lat.toFixed(6)),
      lng: Number(lng.toFixed(6)),
      createdAt: new Date().toLocaleTimeString('fr-CA', { hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: false })
    };
    this.activeWaypoints.push(wp);
    PULSE_CHANNEL.postMessage({ type: 'WAYPOINTS_UPDATED', payload: this.activeWaypoints });
    return wp;
  }

  static clearWaypoints() {
    this.activeWaypoints = [];
    PULSE_CHANNEL.postMessage({ type: 'WAYPOINTS_UPDATED', payload: [] });
  }

  /* -------------------------------------------------------------
   * WAZE ROAD HAZARD INJECTION
   * ----------------------------------------------------------- */
  static getWazeIncidents() {
    return this.activeIncidents || [];
  }

  static injectWazeIncident(arteryName, desc, lat, lng) {
    const newInc = {
      id: `INC-0${(this.activeIncidents.length || 0) + 1}`,
      artery: arteryName || 'A-40 METROPOLITAINE',
      desc: desc || 'Ralentissement inopiné signalé par usagers',
      lat: lat || 45.510,
      lng: lng || -73.650,
      color: '#dc2626'
    };
    this.activeIncidents.push(newInc);
    PULSE_CHANNEL.postMessage({ type: 'WAZE_INCIDENTS_UPDATED', payload: this.activeIncidents });
    return newInc;
  }

  /* -------------------------------------------------------------
   * SIMULATION CONTROL & TICK ENGINE (OBD-II & GPS)
   * ----------------------------------------------------------- */
  static setSimulationRunning(running) {
    this.simulationRunning = Boolean(running);
    PULSE_CHANNEL.postMessage({ type: 'SIMULATION_STATE', payload: { running: this.simulationRunning, speed: this.simulationSpeed } });
  }

  static setSimulationSpeed(speed) {
    this.simulationSpeed = Number(speed) || 1;
    this.startSimulationTimer();
    PULSE_CHANNEL.postMessage({ type: 'SIMULATION_STATE', payload: { running: this.simulationRunning, speed: this.simulationSpeed } });
  }

  static startSimulationTimer() {
    if (typeof clearInterval !== 'undefined' && this.simulationTimer) clearInterval(this.simulationTimer);
    const interval = Math.max(200, Math.floor(1000 / (this.simulationSpeed || 1)));
    if (typeof setInterval !== 'undefined') { this.simulationTimer = setInterval(() => {
      if (this.simulationRunning) {
        this.tickTelemetry();
      }
    }, interval); }
  }

  static tickTelemetry() {
    const vehicles = this.getVehicles();
    let updated = false;

    vehicles.forEach(v => {
      if (v.status === 'PAUSE') return;

      if (!v.patrolPoints || v.patrolPoints.length === 0) {
        v.patrolPoints = [
          [v.lat, v.lng],
          [v.lat + 0.003, v.lng + 0.003],
          [v.lat - 0.002, v.lng + 0.004],
          [v.lat, v.lng]
        ];
        v.patrolStep = 0;
      }

      const stepIdx = v.patrolStep || 0;
      const nextIdx = (stepIdx + 1) % v.patrolPoints.length;
      const targetPoint = v.patrolPoints[nextIdx];

      const dLat = targetPoint[0] - v.lat;
      const dLng = targetPoint[1] - v.lng;
      const dist = Math.sqrt(dLat * dLat + dLng * dLng);

      const speedFactor = (v.speed || 30) / 3600 * 0.04 * (this.simulationSpeed || 1);

      if (dist < 0.0003) {
        v.patrolStep = nextIdx;
      } else {
        const ratio = Math.min(1, speedFactor / dist);
        v.lat = Number((v.lat + dLat * ratio).toFixed(6));
        v.lng = Number((v.lng + dLng * ratio).toFixed(6));
      }

      const angle = (Math.atan2(dLng, dLat) * 180 / Math.PI + 360) % 360;
      v.heading = Math.round(angle);

      // Fluctuate OBD-II CAN metrics
      v.odometerKm = Number(((v.odometerKm || 50000) + 0.012 * (this.simulationSpeed || 1)).toFixed(1));
      v.batteryVoltage = Number((13.8 + (Math.sin(Date.now() / 3000 + v.id) * 0.3)).toFixed(1));
      v.coolantTemp = 90 + (v.id % 4);

      // Waze congestion speed adjustment
      if (v.lat > 45.515 && v.lat < 45.535 && v.lng < -73.640 && v.lng > -73.670) {
        v.speed = 14;
      } else if (v.lat > 45.498 && v.lat < 45.505 && v.lng > -73.575 && v.lng < -73.560) {
        v.speed = 22;
      } else if (v.lng < -73.680) {
        v.speed = 78;
      } else {
        v.speed = Math.max(25, Math.min(55, Math.round(38 + Math.sin(Date.now() / 5000 + v.id) * 12)));
      }

      updated = true;
    });

    if (updated) {
      this.saveVehicles(vehicles, false);
    }
  }

  static resetDemoData() {
    try {
      safeStorage.setItem('pulse_vehicles', JSON.stringify(INITIAL_VEHICLES));
      safeStorage.setItem('pulse_calls', JSON.stringify(INITIAL_CALLS));
      safeStorage.setItem('pulse_messages', JSON.stringify(INITIAL_MESSAGES));
      this.activeWaypoints = [];
      PULSE_CHANNEL.postMessage({ type: 'CALLS_UPDATED', payload: INITIAL_CALLS });
      PULSE_CHANNEL.postMessage({ type: 'VEHICLES_UPDATED', payload: INITIAL_VEHICLES });
      PULSE_CHANNEL.postMessage({ type: 'MESSAGES_UPDATED', payload: INITIAL_MESSAGES });
      PULSE_CHANNEL.postMessage({ type: 'WAYPOINTS_UPDATED', payload: [] });
    } catch (e) {
      console.warn("resetDemoData error:", e);
    }
  }

  static init(force = false) {
    try {
      const existingVehs = safeStorage.getItem('pulse_vehicles');
      if (force || !existingVehs || !existingVehs.includes('vin') || !existingVehs.includes('mdtHardwareId')) {
        this.resetDemoData();
      }
    } catch (e) {
      console.error('PulseState.init error:', e);
      this.resetDemoData();
    }
    this.startSimulationTimer();
  }
}

PulseState.init();
if (typeof window !== 'undefined') {
  window.PulseState = PulseState;
}

// =========================================================================
// SAFE WEB AUDIO MANAGER (PulseAudio)
// =========================================================================
const PulseAudio = {
  ctx: null,
  getAudioContext() {
    try {
      if (!this.ctx && typeof window !== 'undefined') {
        const AudioClass = window.AudioContext || window.webkitAudioContext;
        if (AudioClass) this.ctx = new AudioClass();
      }
      if (this.ctx && this.ctx.state === 'suspended') {
        this.ctx.resume().catch(() => {});
      }
      return this.ctx;
    } catch (e) {
      console.warn("AudioContext error:", e);
      return null;
    }
  },
  unlockAudio() {
    const ctx = this.getAudioContext();
    if (ctx && ctx.state === 'suspended') {
      ctx.resume().catch(() => {});
    }
  },
  playTone(type) {
    try {
      const ctx = this.getAudioContext();
      if (!ctx) return;
      const now = ctx.currentTime;

      if (type === 'incoming_alert') {
        const osc1 = ctx.createOscillator();
        const osc2 = ctx.createOscillator();
        const gain = ctx.createGain();

        osc1.type = 'sine';
        osc2.type = 'triangle';
        osc1.frequency.setValueAtTime(880, now);
        osc1.frequency.setValueAtTime(1174.66, now + 0.12);
        osc2.frequency.setValueAtTime(440, now);

        gain.gain.setValueAtTime(0.2, now);
        gain.gain.exponentialRampToValueAtTime(0.01, now + 0.45);

        osc1.connect(gain);
        osc2.connect(gain);
        gain.connect(ctx.destination);

        osc1.start(now);
        osc2.start(now);
        osc1.stop(now + 0.45);
        osc2.stop(now + 0.45);
      } else if (type === 'ack_success') {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(523.25, now);
        osc.frequency.setValueAtTime(659.25, now + 0.08);
        osc.frequency.setValueAtTime(783.99, now + 0.16);

        gain.gain.setValueAtTime(0.15, now);
        gain.gain.exponentialRampToValueAtTime(0.01, now + 0.35);

        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start(now);
        osc.stop(now + 0.35);
      } else if (type === 'tap') {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(400, now);
        gain.gain.setValueAtTime(0.08, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.08);

        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start(now);
        osc.stop(now + 0.08);
      } else if (type === 'warning') {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'sawtooth';
        osc.frequency.setValueAtTime(300, now);
        osc.frequency.setValueAtTime(200, now + 0.15);
        gain.gain.setValueAtTime(0.15, now);
        gain.gain.exponentialRampToValueAtTime(0.01, now + 0.3);

        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start(now);
        osc.stop(now + 0.3);
      }
    } catch (err) {
      console.warn("PulseAudio.playTone error:", err);
    }
  }
};

// Automatic gesture unlock listener
if (typeof document !== 'undefined') {
  const _unlock = () => {
    PulseAudio.unlockAudio();
  };
  ['click', 'touchstart', 'keydown'].forEach(evt => {
    document.addEventListener(evt, _unlock, { once: true, passive: true });
  });
}

// =========================================================================
// QUÉBEC TAX ENGINE & FARE ITEMIZER (PulseTax)
// =========================================================================
const PulseTax = {
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

// =========================================================================
// OBD-II TELEMETRY & CAN BUS HELPER (PulseOBD)
// =========================================================================
const PulseOBD = {
  formatTelemetry(veh) {
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
        lat: Number(veh.lat.toFixed(6)),
        lng: Number(veh.lng.toFixed(6))
      }
    };
  }
};

// =========================================================================
// WAZE TRAFFIC & NAVIGATION HELPER (PulseWaze)
// =========================================================================
const PulseWaze = {
  getIncidents() {
    return PulseState.getWazeIncidents();
  },
  injectIncident(artery, desc, lat, lng) {
    return PulseState.injectWazeIncident(artery, desc, lat, lng);
  },
  getNavigationUrl(address, isNative = false) {
    const encoded = encodeURIComponent(address || 'Montréal, QC');
    if (isNative) {
      return `waze://?q=${encoded}&navigate=yes`;
    }
    return `https://www.waze.com/ul?q=${encoded}&navigate=yes`;
  }
};

// =========================================================================
// ACTIVE PUBLIC HTTPS TUNNEL & SHARE SYNCHRONIZER
// =========================================================================
const PULSE_TUNNEL_URL = 'https://boys-linda-lafayette-skating.trycloudflare.com';

function getEffectiveOrigin() {
  if (typeof window === 'undefined') return PULSE_TUNNEL_URL;
  const origin = window.location.origin;
  if (origin && origin !== 'null' && !origin.startsWith('file:') && origin !== 'about:blank') {
    return origin;
  }
  return PULSE_TUNNEL_URL;
}

// Fallback clipboard copy using document.execCommand
function fallbackCopyText(text) {
  if (typeof document === 'undefined') return false;
  try {
    const textArea = document.createElement("textarea");
    textArea.value = text;
    textArea.style.position = "fixed";
    textArea.style.top = "0";
    textArea.style.left = "0";
    textArea.style.width = "2em";
    textArea.style.height = "2em";
    textArea.style.padding = "0";
    textArea.style.border = "none";
    textArea.style.outline = "none";
    textArea.style.boxShadow = "none";
    textArea.style.background = "transparent";
    textArea.style.opacity = "0";
    document.body.appendChild(textArea);
    textArea.focus();
    textArea.select();
    const successful = document.execCommand('copy');
    document.body.removeChild(textArea);
    return successful;
  } catch (err) {
    console.warn("Fallback copy failed:", err);
    return false;
  }
}

// Unified clipboard copy with fallback
function copyTextToClipboard(text, onSuccess, onError) {
  if (typeof navigator !== 'undefined' && navigator.clipboard && (window.isSecureContext || window.location.protocol === 'https:')) {
    navigator.clipboard.writeText(text)
      .then(() => {
        if (typeof onSuccess === 'function') onSuccess();
      })
      .catch(() => {
        const ok = fallbackCopyText(text);
        if (ok && typeof onSuccess === 'function') onSuccess();
        else if (!ok && typeof onError === 'function') onError();
      });
  } else {
    const ok = fallbackCopyText(text);
    if (ok && typeof onSuccess === 'function') onSuccess();
    else if (!ok && typeof onError === 'function') onError();
  }
}

// Template for Unified Multi-Module Share Modal
function ensureShareModalInDOM() {
  if (typeof document === 'undefined') return null;
  let modal = document.getElementById('share-modal');
  if (modal) return modal;

  modal = document.createElement('div');
  modal.id = 'share-modal';
  modal.className = 'fixed inset-0 bg-black/75 backdrop-blur-md z-50 flex items-center justify-center p-4';
  modal.style.display = 'none';
  modal.setAttribute('onclick', 'closeShareModalOnBg(event)');

  modal.innerHTML = `
    <div class="bg-royal-900 border border-white/10 rounded-2xl max-w-2xl w-full p-6 shadow-2xl select-none text-white max-h-[90vh] flex flex-col" onclick="event.stopPropagation()">
      <div class="flex items-center justify-between pb-4 border-b border-white/10 mb-4 flex-shrink-0">
        <div class="flex items-center gap-3">
          <div class="w-9 h-9 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400">
            <i data-lucide="share-2" class="w-5 h-5"></i>
          </div>
          <div>
            <div class="flex items-center gap-2">
              <h3 class="font-bold text-base text-white">Partage Multi-Modules CAD & Flotte</h3>
              <span class="px-2 py-0.5 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-[10px] font-mono font-bold flex items-center gap-1">
                <span class="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>TUNNEL ACTIF
              </span>
            </div>
            <p class="text-xs text-zinc-400 mt-0.5">Accès public chiffré SSL en temps réel. Partagez n'importe quel module avec votre équipe :</p>
          </div>
        </div>
        <button onclick="closeShareModal()" class="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 text-zinc-300 flex items-center justify-center font-bold text-sm transition-colors cursor-pointer" title="Fermer (Échap)">✕</button>
      </div>

      <div class="bg-black/40 border border-white/10 rounded-xl p-3 mb-4 flex items-center justify-between flex-shrink-0">
        <div class="flex items-center gap-2.5 overflow-hidden mr-2">
          <i data-lucide="shield-check" class="w-4 h-4 text-emerald-400 flex-shrink-0"></i>
          <div class="truncate">
            <div class="text-[10px] font-mono text-zinc-500 uppercase tracking-wider">Hôte Actif / Passerelle SSL</div>
            <div id="share-modal-base-host" class="text-xs font-mono font-bold text-zinc-200 truncate">${PULSE_TUNNEL_URL}</div>
          </div>
        </div>
        <div class="text-[11px] font-mono text-emerald-400 font-semibold bg-emerald-950/60 border border-emerald-500/20 px-2.5 py-1 rounded-lg whitespace-nowrap">
          7 MODULES DISPONIBLES
        </div>
      </div>

      <div class="space-y-2 overflow-y-auto pr-1 flex-1 text-xs">
        <div class="share-option-card bg-royal-950/80 hover:bg-royal-950 border border-white/5 hover:border-white/15 rounded-xl p-3 flex items-center justify-between gap-3 transition-colors">
          <div class="flex items-center gap-3 min-w-0">
            <div class="w-8 h-8 rounded-lg bg-blue-500/10 border border-blue-500/20 text-blue-400 flex items-center justify-center flex-shrink-0">
              <i data-lucide="layout-dashboard" class="w-4 h-4"></i>
            </div>
            <div class="min-w-0">
              <div class="font-bold text-white text-xs truncate">1. Dashboard Exécutif</div>
              <div class="text-[11px] font-mono text-zinc-400 truncate share-url-label" data-path="/index.html">/index.html</div>
            </div>
          </div>
          <div class="flex items-center gap-2 flex-shrink-0">
            <button onclick="copyShareOption(this, '/index.html')" class="copy-btn px-3 py-1.5 rounded-lg bg-white/10 hover:bg-white/20 text-zinc-200 font-semibold text-xs flex items-center gap-1.5 transition-colors cursor-pointer">
              <i data-lucide="copy" class="w-3.5 h-3.5"></i>
              <span>Copier</span>
            </button>
            <a href="${PULSE_TUNNEL_URL}/index.html" target="_blank" rel="noopener noreferrer" class="share-open-link px-3 py-1.5 rounded-lg bg-emerald-500 hover:bg-emerald-600 text-royal-950 font-bold text-xs flex items-center gap-1.5 transition-colors no-underline">
              <span>Ouvrir</span>
              <i data-lucide="external-link" class="w-3.5 h-3.5"></i>
            </a>
          </div>
        </div>

        <div class="share-option-card bg-royal-950/80 hover:bg-royal-950 border border-white/5 hover:border-white/15 rounded-xl p-3 flex items-center justify-between gap-3 transition-colors">
          <div class="flex items-center gap-3 min-w-0">
            <div class="w-8 h-8 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 flex items-center justify-center flex-shrink-0">
              <i data-lucide="map" class="w-4 h-4"></i>
            </div>
            <div class="min-w-0">
              <div class="font-bold text-white text-xs truncate">2. Carte AVL Flotte Live</div>
              <div class="text-[11px] font-mono text-zinc-400 truncate share-url-label" data-path="/map.html">/map.html</div>
            </div>
          </div>
          <div class="flex items-center gap-2 flex-shrink-0">
            <button onclick="copyShareOption(this, '/map.html')" class="copy-btn px-3 py-1.5 rounded-lg bg-white/10 hover:bg-white/20 text-zinc-200 font-semibold text-xs flex items-center gap-1.5 transition-colors cursor-pointer">
              <i data-lucide="copy" class="w-3.5 h-3.5"></i>
              <span>Copier</span>
            </button>
            <a href="${PULSE_TUNNEL_URL}/map.html" target="_blank" rel="noopener noreferrer" class="share-open-link px-3 py-1.5 rounded-lg bg-emerald-500 hover:bg-emerald-600 text-royal-950 font-bold text-xs flex items-center gap-1.5 transition-colors no-underline">
              <span>Ouvrir</span>
              <i data-lucide="external-link" class="w-3.5 h-3.5"></i>
            </a>
          </div>
        </div>

        <div class="share-option-card bg-royal-950/80 hover:bg-royal-950 border border-white/5 hover:border-white/15 rounded-xl p-3 flex items-center justify-between gap-3 transition-colors">
          <div class="flex items-center gap-3 min-w-0">
            <div class="w-8 h-8 rounded-lg bg-amber-500/10 border border-amber-500/20 text-amber-400 flex items-center justify-center flex-shrink-0">
              <i data-lucide="smartphone" class="w-4 h-4"></i>
            </div>
            <div class="min-w-0">
              <div class="font-bold text-white text-xs truncate">3. Cockpit Chauffeur Mobile</div>
              <div class="text-[11px] font-mono text-zinc-400 truncate share-url-label" data-path="/driver.html?unit=232">/driver.html?unit=232</div>
            </div>
          </div>
          <div class="flex items-center gap-2 flex-shrink-0">
            <button onclick="copyShareOption(this, '/driver.html?unit=232')" class="copy-btn px-3 py-1.5 rounded-lg bg-white/10 hover:bg-white/20 text-zinc-200 font-semibold text-xs flex items-center gap-1.5 transition-colors cursor-pointer">
              <i data-lucide="copy" class="w-3.5 h-3.5"></i>
              <span>Copier</span>
            </button>
            <a href="${PULSE_TUNNEL_URL}/driver.html?unit=232" target="_blank" rel="noopener noreferrer" class="share-open-link px-3 py-1.5 rounded-lg bg-emerald-500 hover:bg-emerald-600 text-royal-950 font-bold text-xs flex items-center gap-1.5 transition-colors no-underline">
              <span>Ouvrir</span>
              <i data-lucide="external-link" class="w-3.5 h-3.5"></i>
            </a>
          </div>
        </div>

        <div class="share-option-card bg-royal-950/80 hover:bg-royal-950 border border-white/5 hover:border-white/15 rounded-xl p-3 flex items-center justify-between gap-3 transition-colors">
          <div class="flex items-center gap-3 min-w-0">
            <div class="w-8 h-8 rounded-lg bg-purple-500/10 border border-purple-500/20 text-purple-400 flex items-center justify-center flex-shrink-0">
              <i data-lucide="list-ordered" class="w-4 h-4"></i>
            </div>
            <div class="min-w-0">
              <div class="font-bold text-white text-xs truncate">4. File d'Attente CAD</div>
              <div class="text-[11px] font-mono text-zinc-400 truncate share-url-label" data-path="/queue.html">/queue.html</div>
            </div>
          </div>
          <div class="flex items-center gap-2 flex-shrink-0">
            <button onclick="copyShareOption(this, '/queue.html')" class="copy-btn px-3 py-1.5 rounded-lg bg-white/10 hover:bg-white/20 text-zinc-200 font-semibold text-xs flex items-center gap-1.5 transition-colors cursor-pointer">
              <i data-lucide="copy" class="w-3.5 h-3.5"></i>
              <span>Copier</span>
            </button>
            <a href="${PULSE_TUNNEL_URL}/queue.html" target="_blank" rel="noopener noreferrer" class="share-open-link px-3 py-1.5 rounded-lg bg-emerald-500 hover:bg-emerald-600 text-royal-950 font-bold text-xs flex items-center gap-1.5 transition-colors no-underline">
              <span>Ouvrir</span>
              <i data-lucide="external-link" class="w-3.5 h-3.5"></i>
            </a>
          </div>
        </div>

        <div class="share-option-card bg-royal-950/80 hover:bg-royal-950 border border-white/5 hover:border-white/15 rounded-xl p-3 flex items-center justify-between gap-3 transition-colors">
          <div class="flex items-center gap-3 min-w-0">
            <div class="w-8 h-8 rounded-lg bg-cyan-500/10 border border-cyan-500/20 text-cyan-400 flex items-center justify-center flex-shrink-0">
              <i data-lucide="phone-call" class="w-4 h-4"></i>
            </div>
            <div class="min-w-0">
              <div class="font-bold text-white text-xs truncate">5. Prise d'Appel CAD</div>
              <div class="text-[11px] font-mono text-zinc-400 truncate share-url-label" data-path="/dispatch.html">/dispatch.html</div>
            </div>
          </div>
          <div class="flex items-center gap-2 flex-shrink-0">
            <button onclick="copyShareOption(this, '/dispatch.html')" class="copy-btn px-3 py-1.5 rounded-lg bg-white/10 hover:bg-white/20 text-zinc-200 font-semibold text-xs flex items-center gap-1.5 transition-colors cursor-pointer">
              <i data-lucide="copy" class="w-3.5 h-3.5"></i>
              <span>Copier</span>
            </button>
            <a href="${PULSE_TUNNEL_URL}/dispatch.html" target="_blank" rel="noopener noreferrer" class="share-open-link px-3 py-1.5 rounded-lg bg-emerald-500 hover:bg-emerald-600 text-royal-950 font-bold text-xs flex items-center gap-1.5 transition-colors no-underline">
              <span>Ouvrir</span>
              <i data-lucide="external-link" class="w-3.5 h-3.5"></i>
            </a>
          </div>
        </div>

        <div class="share-option-card bg-royal-950/80 hover:bg-royal-950 border border-white/5 hover:border-white/15 rounded-xl p-3 flex items-center justify-between gap-3 transition-colors">
          <div class="flex items-center gap-3 min-w-0">
            <div class="w-8 h-8 rounded-lg bg-pink-500/10 border border-pink-500/20 text-pink-400 flex items-center justify-center flex-shrink-0">
              <i data-lucide="message-square" class="w-4 h-4"></i>
            </div>
            <div class="min-w-0">
              <div class="font-bold text-white text-xs truncate">6. Messagerie MDT 10-4</div>
              <div class="text-[11px] font-mono text-zinc-400 truncate share-url-label" data-path="/messages.html">/messages.html</div>
            </div>
          </div>
          <div class="flex items-center gap-2 flex-shrink-0">
            <button onclick="copyShareOption(this, '/messages.html')" class="copy-btn px-3 py-1.5 rounded-lg bg-white/10 hover:bg-white/20 text-zinc-200 font-semibold text-xs flex items-center gap-1.5 transition-colors cursor-pointer">
              <i data-lucide="copy" class="w-3.5 h-3.5"></i>
              <span>Copier</span>
            </button>
            <a href="${PULSE_TUNNEL_URL}/messages.html" target="_blank" rel="noopener noreferrer" class="share-open-link px-3 py-1.5 rounded-lg bg-emerald-500 hover:bg-emerald-600 text-royal-950 font-bold text-xs flex items-center gap-1.5 transition-colors no-underline">
              <span>Ouvrir</span>
              <i data-lucide="external-link" class="w-3.5 h-3.5"></i>
            </a>
          </div>
        </div>

        <div class="share-option-card bg-royal-950/80 hover:bg-royal-950 border border-white/5 hover:border-white/15 rounded-xl p-3 flex items-center justify-between gap-3 transition-colors">
          <div class="flex items-center gap-3 min-w-0">
            <div class="w-8 h-8 rounded-lg bg-rose-500/10 border border-rose-500/20 text-rose-400 flex items-center justify-center flex-shrink-0">
              <i data-lucide="receipt" class="w-4 h-4"></i>
            </div>
            <div class="min-w-0">
              <div class="font-bold text-white text-xs truncate">7. Reçu Thermique 58mm & Taxes</div>
              <div class="text-[11px] font-mono text-zinc-400 truncate share-url-label" data-path="/receipt.html?call=5081">/receipt.html?call=5081</div>
            </div>
          </div>
          <div class="flex items-center gap-2 flex-shrink-0">
            <button onclick="copyShareOption(this, '/receipt.html?call=5081')" class="copy-btn px-3 py-1.5 rounded-lg bg-white/10 hover:bg-white/20 text-zinc-200 font-semibold text-xs flex items-center gap-1.5 transition-colors cursor-pointer">
              <i data-lucide="copy" class="w-3.5 h-3.5"></i>
              <span>Copier</span>
            </button>
            <a href="${PULSE_TUNNEL_URL}/receipt.html?call=5081" target="_blank" rel="noopener noreferrer" class="share-open-link px-3 py-1.5 rounded-lg bg-emerald-500 hover:bg-emerald-600 text-royal-950 font-bold text-xs flex items-center gap-1.5 transition-colors no-underline">
              <span>Ouvrir</span>
              <i data-lucide="external-link" class="w-3.5 h-3.5"></i>
            </a>
          </div>
        </div>
      </div>

      <div class="mt-4 pt-3 border-t border-white/5 flex items-center justify-between text-xs text-zinc-500 flex-shrink-0">
        <div class="flex items-center gap-1.5 text-zinc-400">
          <i data-lucide="info" class="w-3.5 h-3.5 text-emerald-400"></i>
          <span>Synchronisation temps réel par BroadcastChannel & LocalStorage</span>
        </div>
        <button onclick="closeShareModal()" class="text-xs text-zinc-400 hover:text-white px-2.5 py-1 rounded-lg bg-white/5 hover:bg-white/10 transition-colors">
          Fermer
        </button>
      </div>
    </div>
  `;
  document.body.appendChild(modal);
  return modal;
}

function openShareModal() {
  const modal = ensureShareModalInDOM();
  if (!modal) return;

  const base = getEffectiveOrigin();
  const hostDisplay = document.getElementById('share-modal-base-host');
  if (hostDisplay) hostDisplay.textContent = base;

  const cards = modal.querySelectorAll('.share-option-card');
  cards.forEach(card => {
    const label = card.querySelector('.share-url-label');
    const openLink = card.querySelector('.share-open-link');
    if (label) {
      const relPath = label.getAttribute('data-path') || '';
      const fullUrl = base + relPath;
      label.textContent = fullUrl;
      if (openLink) {
        openLink.href = fullUrl;
      }
    }
  });

  modal.classList.remove('hidden');
  modal.style.display = 'flex';
  if (typeof window !== 'undefined' && window.lucide && typeof window.lucide.createIcons === 'function') {
    window.lucide.createIcons();
  }
}

function closeShareModal() {
  const modal = document.getElementById('share-modal');
  if (modal) {
    modal.classList.add('hidden');
    modal.style.display = 'none';
  }
}

function closeShareModalOnBg(e) {
  if (e && e.target === document.getElementById('share-modal')) {
    closeShareModal();
  }
}

function copyShareOption(btn, path) {
  const base = getEffectiveOrigin();
  const fullUrl = base + path;
  const originalHTML = btn ? btn.innerHTML : '';
  
  const doCopy = () => {
    if (btn) {
      btn.innerHTML = `<i data-lucide="check" class="w-3.5 h-3.5 inline"></i> <span class="font-bold">Copié !</span>`;
      btn.className = 'copy-btn px-3 py-1.5 rounded-lg bg-emerald-500/20 text-emerald-400 border border-emerald-500/40 text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer';
      if (typeof window !== 'undefined' && window.lucide && typeof window.lucide.createIcons === 'function') {
        window.lucide.createIcons();
      }
      setTimeout(() => {
        btn.innerHTML = originalHTML;
        btn.className = 'copy-btn px-3 py-1.5 rounded-lg bg-white/10 hover:bg-white/20 text-zinc-200 font-semibold text-xs flex items-center gap-1.5 transition-colors cursor-pointer';
        if (typeof window !== 'undefined' && window.lucide && typeof window.lucide.createIcons === 'function') {
          window.lucide.createIcons();
        }
      }, 2000);
    }
  };

  copyTextToClipboard(fullUrl, doCopy, () => {
    fallbackCopyText(fullUrl);
    doCopy();
  });
}

// Global button helpers for public and share URLs
function copyPublicUrl(btn) {
  const base = getEffectiveOrigin();
  const path = (typeof window !== 'undefined' && window.location.pathname.split('/').pop()) || 'index.html';
  const fullUrl = base + '/' + path + (window.location.search || '');
  copyTextToClipboard(fullUrl, () => {
    if (btn) {
      const orig = btn.innerHTML;
      btn.innerHTML = 'COPIÉ !';
      setTimeout(() => { btn.innerHTML = orig; }, 2000);
    } else {
      alert("LIEN PUBLIC COPIÉ DANS LE PRESSE-PAPIER !");
    }
  });
}

function copyShareUrl(btn) {
  copyPublicUrl(btn);
}

// Global Keyboard Shortcuts
if (typeof window !== 'undefined') {
  window.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
      closeShareModal();
      return;
    }
    const activeTag = document.activeElement ? document.activeElement.tagName.toLowerCase() : '';
    const isInput = activeTag === 'input' || activeTag === 'textarea';

    if (!isInput) {
      if (e.key === 'F1') { e.preventDefault(); window.location.href = 'index.html'; }
      if (e.key === 'F2') { e.preventDefault(); window.location.href = 'dispatch.html'; }
      if (e.key === 'F3') { e.preventDefault(); window.location.href = 'queue.html'; }
      if (e.key === 'F4') { e.preventDefault(); window.location.href = 'map.html'; }
      if (e.key === 'F5') { e.preventDefault(); window.location.href = 'messages.html'; }
      if (e.key === 'F6') { e.preventDefault(); window.location.href = 'driver.html'; }
      if (e.key === 'F7') { e.preventDefault(); window.location.href = 'video.html'; }
    }
  });

  window.PULSE_TUNNEL_URL = PULSE_TUNNEL_URL;
  window.getEffectiveOrigin = getEffectiveOrigin;
  window.openShareModal = openShareModal;
  window.closeShareModal = closeShareModal;
  window.closeShareModalOnBg = closeShareModalOnBg;
  window.copyShareOption = copyShareOption;
  window.copyPublicUrl = copyPublicUrl;
  window.copyShareUrl = copyShareUrl;
  window.copyTextToClipboard = copyTextToClipboard;
  window.fallbackCopyText = fallbackCopyText;
  window.PulseAudio = PulseAudio;
  window.PulseTax = PulseTax;
  window.PulseOBD = PulseOBD;
  window.PulseWaze = PulseWaze;
}
