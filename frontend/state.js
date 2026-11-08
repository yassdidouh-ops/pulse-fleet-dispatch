/**
 * PULSE CAD — Shared Telemetry & State Management Engine
 * Production-grade cross-tab synchronization for Metro Fleet Operations.
 * Uses strict system codes, telemetry designations, persistent LocalStorage,
 * dynamic GPS micro-step interpolation, OBD-II CAN bus emulation and waypoint routing.
 */

const PULSE_CHANNEL = new BroadcastChannel('pulse_cad_sync');

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
    lng: -73.578540,
    speed: 42,
    phone: "(514) 872-0065",
    address: "Avenue du Mont-Royal & St-Denis",
    vin: "1FTNE3Y89KH06511",
    mdtHardwareId: "MDT-HW-99065-REV4",
    batteryVoltage: 14.1,
    coolantTemp: 93,
    odometerKm: 112450.8,
    networkLatencyMs: 28,
    networkRssi: -71,
    heading: 140,
    patrolStep: 0,
    patrolPoints: [
      [45.522510, -73.578540],
      [45.525100, -73.575000],
      [45.528400, -73.582000],
      [45.524000, -73.586000],
      [45.522510, -73.578540]
    ]
  },
  {
    id: 184,
    code: "UNIT-184",
    status: "LIBRE",
    type: "BERLINE",
    zone: "ZONE-03 (AÉROPORT-YUL)",
    lat: 45.470512,
    lng: -73.740834,
    speed: 0,
    phone: "(514) 872-0184",
    address: "Terminal 1 - Départs YUL",
    vin: "3FA6P0H78KH18402",
    mdtHardwareId: "MDT-HW-99184-REV4",
    batteryVoltage: 13.8,
    coolantTemp: 89,
    odometerKm: 65980.2,
    networkLatencyMs: 19,
    networkRssi: -62,
    heading: 260,
    patrolStep: 0,
    patrolPoints: [
      [45.470512, -73.740834],
      [45.472100, -73.737000],
      [45.468000, -73.735000],
      [45.467000, -73.742000],
      [45.470512, -73.740834]
    ]
  },
  {
    id: 117,
    code: "UNIT-117",
    status: "EN_ROUTE",
    type: "FOURGON",
    zone: "ZONE-04 (VIEUX-PORT)",
    lat: 45.505018,
    lng: -73.553045,
    speed: 38,
    phone: "(514) 872-0117",
    address: "Rue Saint-Paul & Place Jacques-Cartier",
    vin: "1GDGG3167KH11790",
    mdtHardwareId: "MDT-HW-99117-REV4",
    batteryVoltage: 14.0,
    coolantTemp: 92,
    odometerKm: 98402.6,
    networkLatencyMs: 25,
    networkRssi: -68,
    heading: 45,
    patrolStep: 0,
    patrolPoints: [
      [45.505018, -73.553045],
      [45.508000, -73.550000],
      [45.511000, -73.556000],
      [45.507000, -73.560000],
      [45.505018, -73.553045]
    ]
  },
  {
    id: 89,
    code: "UNIT-089",
    status: "LIBRE",
    type: "TPMR",
    zone: "ZONE-05 (CÔTE-DES-NEIGES)",
    lat: 45.496512,
    lng: -73.618023,
    speed: 26,
    phone: "(514) 872-0089",
    address: "Hôpital Général Juif - Côte-des-Neiges",
    vin: "1FTNE3Y89KH08945",
    mdtHardwareId: "MDT-HW-99089-REV4",
    batteryVoltage: 13.9,
    coolantTemp: 90,
    odometerKm: 76340.0,
    networkLatencyMs: 22,
    networkRssi: -65,
    heading: 195,
    patrolStep: 0,
    patrolPoints: [
      [45.496512, -73.618023],
      [45.499000, -73.614000],
      [45.502000, -73.621000],
      [45.498000, -73.625000],
      [45.496512, -73.618023]
    ]
  },
  {
    id: 203,
    code: "UNIT-203",
    status: "EN_COURSE",
    type: "BERLINE",
    zone: "ZONE-06 (GRIFFINTOWN)",
    lat: 45.492045,
    lng: -73.561012,
    speed: 50,
    phone: "(514) 872-0203",
    address: "Rue Peel & Rue Wellington",
    vin: "2C3CDXAG8KH20311",
    mdtHardwareId: "MDT-HW-99203-REV4",
    batteryVoltage: 14.1,
    coolantTemp: 94,
    odometerKm: 52180.4,
    networkLatencyMs: 21,
    networkRssi: -64,
    heading: 310,
    patrolStep: 0,
    patrolPoints: [
      [45.492045, -73.561012],
      [45.495000, -73.558000],
      [45.498000, -73.564000],
      [45.493000, -73.568000],
      [45.492045, -73.561012]
    ]
  },
  {
    id: 156,
    code: "UNIT-156",
    status: "LIBRE",
    type: "VUS",
    zone: "ZONE-07 (MILE-END)",
    lat: 45.528023,
    lng: -73.595034,
    speed: 31,
    phone: "(514) 872-0156",
    address: "Boul. Saint-Laurent & Rue Bernard",
    vin: "5NMS33CA5KH15689",
    mdtHardwareId: "MDT-HW-99156-REV4",
    batteryVoltage: 13.9,
    coolantTemp: 91,
    odometerKm: 88410.7,
    networkLatencyMs: 27,
    networkRssi: -70,
    heading: 10,
    patrolStep: 0,
    patrolPoints: [
      [45.528023, -73.595034],
      [45.531000, -73.591000],
      [45.534000, -73.598000],
      [45.529000, -73.602000],
      [45.528023, -73.595034]
    ]
  },
  {
    id: 44,
    code: "UNIT-044",
    status: "PAUSE",
    type: "BERLINE",
    zone: "ZONE-08 (ROSEMONT)",
    lat: 45.545012,
    lng: -73.582045,
    speed: 0,
    phone: "(514) 872-0044",
    address: "Boul. Rosemont & Rue Masson",
    vin: "3FA6P0H78KH04432",
    mdtHardwareId: "MDT-HW-99044-REV4",
    batteryVoltage: 13.6,
    coolantTemp: 84,
    odometerKm: 134290.1,
    networkLatencyMs: 31,
    networkRssi: -75,
    heading: 0,
    patrolStep: 0,
    patrolPoints: [
      [45.545012, -73.582045],
      [45.547000, -73.578000],
      [45.550000, -73.585000],
      [45.546000, -73.589000],
      [45.545012, -73.582045]
    ]
  },
  {
    id: 198,
    code: "UNIT-198",
    status: "LIBRE",
    type: "BERLINE",
    zone: "ZONE-09 (WESTMOUNT)",
    lat: 45.485034,
    lng: -73.596012,
    speed: 28,
    phone: "(514) 872-0198",
    address: "Avenue Greene & Ste-Catherine O.",
    vin: "2C3CDXAG8KH19877",
    mdtHardwareId: "MDT-HW-99198-REV4",
    batteryVoltage: 13.9,
    coolantTemp: 90,
    odometerKm: 41890.3,
    networkLatencyMs: 20,
    networkRssi: -63,
    heading: 230,
    patrolStep: 0,
    patrolPoints: [
      [45.485034, -73.596012],
      [45.488000, -73.592000],
      [45.491000, -73.599000],
      [45.487000, -73.603000],
      [45.485034, -73.596012]
    ]
  },
  {
    id: 71,
    code: "UNIT-071",
    status: "EN_COURSE",
    type: "FOURGON",
    zone: "ZONE-10 (OUTREMONT)",
    lat: 45.515023,
    lng: -73.608045,
    speed: 45,
    phone: "(514) 872-0071",
    address: "Avenue Laurier Ouest",
    vin: "1GDGG3167KH07123",
    mdtHardwareId: "MDT-HW-99071-REV4",
    batteryVoltage: 14.1,
    coolantTemp: 93,
    odometerKm: 78912.4,
    networkLatencyMs: 26,
    networkRssi: -69,
    heading: 160,
    patrolStep: 0,
    patrolPoints: [
      [45.515023, -73.608045],
      [45.518000, -73.604000],
      [45.521000, -73.612000],
      [45.516000, -73.616000],
      [45.515023, -73.608045]
    ]
  },
  {
    id: 134,
    code: "UNIT-134",
    status: "LIBRE",
    type: "VUS",
    zone: "ZONE-11 (VERDUN)",
    lat: 45.458012,
    lng: -73.572034,
    speed: 35,
    phone: "(514) 872-0134",
    address: "Rue Wellington & Rue de l'Église",
    vin: "5NMS33CA5KH13444",
    mdtHardwareId: "MDT-HW-99134-REV4",
    batteryVoltage: 13.9,
    coolantTemp: 91,
    odometerKm: 62410.9,
    networkLatencyMs: 23,
    networkRssi: -66,
    heading: 70,
    patrolStep: 0,
    patrolPoints: [
      [45.458012, -73.572034],
      [45.461000, -73.568000],
      [45.464000, -73.575000],
      [45.459000, -73.579000],
      [45.458012, -73.572034]
    ]
  },
  {
    id: 267,
    code: "UNIT-267",
    status: "LIBRE",
    type: "BERLINE",
    zone: "ZONE-01 (CENTRE-VILLE)",
    lat: 45.503045,
    lng: -73.570012,
    speed: 29,
    phone: "(514) 872-0267",
    address: "Place Ville Marie",
    vin: "2C3CDXAG8KH26712",
    mdtHardwareId: "MDT-HW-99267-REV4",
    batteryVoltage: 14.0,
    coolantTemp: 92,
    odometerKm: 34105.6,
    networkLatencyMs: 18,
    networkRssi: -60,
    heading: 110,
    patrolStep: 0,
    patrolPoints: [
      [45.503045, -73.570012],
      [45.506000, -73.566000],
      [45.509000, -73.572000],
      [45.504000, -73.576000],
      [45.503045, -73.570012]
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
    createdAt: "01:22:10",
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
    createdAt: "01:23:45",
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
    createdAt: "01:24:18",
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
    createdAt: "01:25:30",
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
    createdAt: "01:26:05",
    notes: "Transfert patient inter-établissements, bon de commande CUSM #8841."
  }
];

const INITIAL_MESSAGES = [
  {
    id: 201,
    prio: "URGENTE",
    from: "CENTRAL CAD DISPATCH",
    to: "TOUTE LA FLOTTE MÉTROPOLITAINE",
    subject: "FERMETURE DU PONT JACQUES-CARTIER DIRECTION SUD — DÉVIATION CHOPIN",
    date: "AUJOURD'HUI 01:15",
    unread: true,
    body: "AVIS OPÉRATIONNEL CRITIQUE // RÉSEAU MÉTROPOLITAIN :\n\nEn raison d'une intervention des services d'urgence, le Pont Jacques-Cartier est totalement fermé en direction Rive-Sud.\n\nCONSIGNES CAD :\n• Rediriger l'ensemble des courses vers le Pont Samuel-De Champlain ou le Pont Victoria.\n• Informer les clients d'un délai estimé à 20 minutes.\n• Mettre à jour les estimations d'arrivée sur vos terminaux MDT."
  },
  {
    id: 202,
    prio: "NORMALE",
    from: "UNIT-232 // TERMINAL EMBARQUÉ",
    to: "CENTRAL CAD DISPATCH",
    subject: "SIGNALEMENT TRAVAUX BOULEVARD RENÉ-LÉVESQUE ANGLE PEEL",
    date: "AUJOURD'HUI 01:05",
    unread: true,
    body: "Avis système de l'unité 232 :\n\nTravaux de voirie non signalés à l'angle René-Lévesque et Peel, une seule voie ouverte devant la Place du Canada. Ralentissement significatif vers l'ouest."
  },
  {
    id: 203,
    prio: "VIP",
    from: "SUPERVISEUR POSTE AÉROPORT",
    to: "UNIT-184 // TERMINAL EMBARQUÉ",
    subject: "PRISE EN CHARGE VIP // ARRIVÉES INTERNATIONALES YUL",
    date: "AUJOURD'HUI 00:50",
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

  static getVehicles() {
    try {
      const raw = localStorage.getItem('pulse_vehicles');
      return raw ? JSON.parse(raw) : INITIAL_VEHICLES;
    } catch (e) {
      console.error('PulseState.getVehicles error:', e);
      return INITIAL_VEHICLES;
    }
  }

  static saveVehicles(vehicles, skipBroadcast = false) {
    try {
      localStorage.setItem('pulse_vehicles', JSON.stringify(vehicles));
      if (!skipBroadcast) {
        PULSE_CHANNEL.postMessage({ type: 'VEHICLES_UPDATED', payload: vehicles });
      }
    } catch (e) {
      console.error('PulseState.saveVehicles error:', e);
    }
  }

  static getCalls() {
    try {
      const raw = localStorage.getItem('pulse_calls');
      return raw ? JSON.parse(raw) : INITIAL_CALLS;
    } catch (e) {
      console.error('PulseState.getCalls error:', e);
      return INITIAL_CALLS;
    }
  }

  static saveCalls(calls) {
    try {
      localStorage.setItem('pulse_calls', JSON.stringify(calls));
      PULSE_CHANNEL.postMessage({ type: 'CALLS_UPDATED', payload: calls });
    } catch (e) {
      console.error('PulseState.saveCalls error:', e);
    }
  }

  static getMessages() {
    try {
      const raw = localStorage.getItem('pulse_messages');
      return raw ? JSON.parse(raw) : INITIAL_MESSAGES;
    } catch (e) {
      console.error('PulseState.getMessages error:', e);
      return INITIAL_MESSAGES;
    }
  }

  static saveMessages(msgs) {
    try {
      localStorage.setItem('pulse_messages', JSON.stringify(msgs));
      PULSE_CHANNEL.postMessage({ type: 'MESSAGES_UPDATED', payload: msgs });
    } catch (e) {
      console.error('PulseState.saveMessages error:', e);
    }
  }

  static createCall(newCall) {
    const calls = this.getCalls();
    calls.unshift(newCall);
    this.saveCalls(calls);
    return newCall;
  }

  static assignCall(callId, unitId) {
    const calls = this.getCalls();
    const call = calls.find(c => String(c.id) === String(callId));
    if (call) {
      call.status = 'ASSIGNÉ';
      call.assignedUnit = Number(unitId);
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
      const oldUnit = call.assignedUnit;
      call.status = status;
      this.saveCalls(calls);

      if ((status === 'TERMINÉ' || status === 'ANNULÉ') && oldUnit) {
        const vehicles = this.getVehicles();
        const veh = vehicles.find(v => v.id === Number(oldUnit));
        if (veh) {
          veh.status = 'LIBRE';
          this.saveVehicles(vehicles);
        }
      } else if (status === 'EN_ROUTE' && oldUnit) {
        const vehicles = this.getVehicles();
        const veh = vehicles.find(v => v.id === Number(oldUnit));
        if (veh) {
          veh.status = 'EN_ROUTE';
          this.saveVehicles(vehicles);
        }
      } else if (status === 'SUR_PLACE' && oldUnit) {
        const vehicles = this.getVehicles();
        const veh = vehicles.find(v => v.id === Number(oldUnit));
        if (veh) {
          veh.status = 'EN_COURSE';
          this.saveVehicles(vehicles);
        }
      }
    }
  }

  static sendMessage(msg) {
    const msgs = this.getMessages();
    msgs.unshift(msg);
    this.saveMessages(msgs);
    return msg;
  }

  /* -------------------------------------------------------------
   * CAD WAYPOINTS OVERRIDE ROUTING
   * ----------------------------------------------------------- */
  static getWaypoints() {
    return this.activeWaypoints;
  }

  static addWaypoint(lat, lng) {
    const id = this.activeWaypoints.length + 1;
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
    return this.activeIncidents;
  }

  static injectWazeIncident(arteryName, desc, lat, lng) {
    const newInc = {
      id: `INC-0${this.activeIncidents.length + 1}`,
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
    this.simulationRunning = running;
    PULSE_CHANNEL.postMessage({ type: 'SIMULATION_STATE', payload: { running: this.simulationRunning, speed: this.simulationSpeed } });
  }

  static setSimulationSpeed(speed) {
    this.simulationSpeed = Number(speed) || 1;
    this.startSimulationTimer();
    PULSE_CHANNEL.postMessage({ type: 'SIMULATION_STATE', payload: { running: this.simulationRunning, speed: this.simulationSpeed } });
  }

  static startSimulationTimer() {
    if (this.simulationTimer) clearInterval(this.simulationTimer);
    const interval = Math.max(200, Math.floor(1000 / this.simulationSpeed));
    this.simulationTimer = setInterval(() => {
      if (this.simulationRunning) {
        this.tickTelemetry();
      }
    }, interval);
  }

  static tickTelemetry() {
    const vehicles = this.getVehicles();
    let updated = false;

    vehicles.forEach(v => {
      if (v.status === 'PAUSE') return;

      // Ensure points exist
      if (!v.patrolPoints || v.patrolPoints.length === 0) {
        v.patrolPoints = [
          [v.lat, v.lng],
          [v.lat + 0.003, v.lng + 0.003],
          [v.lat - 0.002, v.lng + 0.004],
          [v.lat, v.lng]
        ];
        v.patrolStep = 0;
      }

      // Micro-interpolation along patrol route
      const stepIdx = v.patrolStep || 0;
      const nextIdx = (stepIdx + 1) % v.patrolPoints.length;
      const targetPoint = v.patrolPoints[nextIdx];

      const dLat = targetPoint[0] - v.lat;
      const dLng = targetPoint[1] - v.lng;
      const dist = Math.sqrt(dLat * dLat + dLng * dLng);

      const speedFactor = (v.speed || 30) / 3600 * 0.04 * this.simulationSpeed;

      if (dist < 0.0003) {
        v.patrolStep = nextIdx;
      } else {
        const ratio = Math.min(1, speedFactor / dist);
        v.lat = Number((v.lat + dLat * ratio).toFixed(6));
        v.lng = Number((v.lng + dLng * ratio).toFixed(6));
      }

      // Calculate bearing / heading
      const angle = (Math.atan2(dLng, dLat) * 180 / Math.PI + 360) % 360;
      v.heading = Math.round(angle);

      // Fluctuate OBD-II CAN metrics
      v.odometerKm = Number(((v.odometerKm || 50000) + 0.012 * this.simulationSpeed).toFixed(1));
      v.batteryVoltage = Number((13.8 + (Math.sin(Date.now() / 3000 + v.id) * 0.3)).toFixed(1));
      v.coolantTemp = 90 + (v.id % 4);

      // Waze congestion speed adjustment
      if (v.lat > 45.515 && v.lat < 45.535 && v.lng < -73.640 && v.lng > -73.670) {
        v.speed = 14; // A-15 Sud congestion
      } else if (v.lat > 45.498 && v.lat < 45.505 && v.lng > -73.575 && v.lng < -73.560) {
        v.speed = 22; // René-Lévesque travaux
      } else if (v.lng < -73.680) {
        v.speed = 78; // A-20 Ouest vers YUL
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
    localStorage.setItem('pulse_vehicles', JSON.stringify(INITIAL_VEHICLES));
    localStorage.setItem('pulse_calls', JSON.stringify(INITIAL_CALLS));
    localStorage.setItem('pulse_messages', JSON.stringify(INITIAL_MESSAGES));
    this.activeWaypoints = [];
    PULSE_CHANNEL.postMessage({ type: 'CALLS_UPDATED', payload: INITIAL_CALLS });
    PULSE_CHANNEL.postMessage({ type: 'VEHICLES_UPDATED', payload: INITIAL_VEHICLES });
    PULSE_CHANNEL.postMessage({ type: 'MESSAGES_UPDATED', payload: INITIAL_MESSAGES });
    PULSE_CHANNEL.postMessage({ type: 'WAYPOINTS_UPDATED', payload: [] });
  }

  static init(force = false) {
    const existingVehs = localStorage.getItem('pulse_vehicles');
    if (force || !existingVehs || !existingVehs.includes('vin') || !existingVehs.includes('mdtHardwareId')) {
      this.resetDemoData();
    }
    this.startSimulationTimer();
  }
}

PulseState.init();
window.PulseState = PulseState;
