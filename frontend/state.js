/**
 * PULSE CAD — Shared Telemetry & State Management Engine
 * Production-grade cross-tab synchronization for Metro Fleet Operations.
 * Uses strict system codes, telemetry designations, and persistent LocalStorage.
 */

const PULSE_CHANNEL = new BroadcastChannel('pulse_cad_sync');

const INITIAL_VEHICLES = [
  { id: 232, code: "UNIT-232", status: "LIBRE", type: "BERLINE", zone: "ZONE-01 (CENTRE-VILLE)", lat: 45.5019, lng: -73.5674, speed: 0, phone: "(514) 872-0232", address: "1250 Boul. René-Lévesque Ouest" },
  { id: 65,  code: "UNIT-065", status: "EN_COURSE", type: "TPMR", zone: "ZONE-02 (PLATEAU)", lat: 45.5225, lng: -73.5785, speed: 42, phone: "(514) 872-0065", address: "Avenue du Mont-Royal & St-Denis" },
  { id: 184, code: "UNIT-184", status: "LIBRE", type: "BERLINE", zone: "ZONE-03 (AÉROPORT-YUL)", lat: 45.4705, lng: -73.7408, speed: 0, phone: "(514) 872-0184", address: "Terminal 1 - Départs YUL" },
  { id: 117, code: "UNIT-117", status: "EN_ROUTE", type: "FOURGON", zone: "ZONE-04 (VIEUX-PORT)", lat: 45.5050, lng: -73.5530, speed: 38, phone: "(514) 872-0117", address: "Rue Saint-Paul & Place Jacques-Cartier" },
  { id: 89,  code: "UNIT-089", status: "LIBRE", type: "TPMR", zone: "ZONE-05 (CÔTE-DES-NEIGES)", lat: 45.4965, lng: -73.6180, speed: 0, phone: "(514) 872-0089", address: "Hôpital Général Juif - Côte-des-Neiges" },
  { id: 203, code: "UNIT-203", status: "EN_COURSE", type: "BERLINE", zone: "ZONE-06 (GRIFFINTOWN)", lat: 45.4920, lng: -73.5610, speed: 50, phone: "(514) 872-0203", address: "Rue Peel & Rue Wellington" },
  { id: 156, code: "UNIT-156", status: "LIBRE", type: "VUS", zone: "ZONE-07 (MILE-END)", lat: 45.5280, lng: -73.5950, speed: 0, phone: "(514) 872-0156", address: "Boul. Saint-Laurent & Rue Bernard" },
  { id: 44,  code: "UNIT-044", status: "PAUSE", type: "BERLINE", zone: "ZONE-08 (ROSEMONT)", lat: 45.5450, lng: -73.5820, speed: 0, phone: "(514) 872-0044", address: "Boul. Rosemont & Rue Masson" },
  { id: 198, code: "UNIT-198", status: "LIBRE", type: "BERLINE", zone: "ZONE-09 (WESTMOUNT)", lat: 45.4850, lng: -73.5960, speed: 0, phone: "(514) 872-0198", address: "Avenue Greene & Ste-Catherine O." },
  { id: 71,  code: "UNIT-071", status: "EN_COURSE", type: "FOURGON", zone: "ZONE-10 (OUTREMONT)", lat: 45.5150, lng: -73.6080, speed: 45, phone: "(514) 872-0071", address: "Avenue Laurier Ouest" },
  { id: 134, code: "UNIT-134", status: "LIBRE", type: "VUS", zone: "ZONE-11 (VERDUN)", lat: 45.4580, lng: -73.5720, speed: 0, phone: "(514) 872-0134", address: "Rue Wellington & Rue de l'Église" },
  { id: 267, code: "UNIT-267", status: "LIBRE", type: "BERLINE", zone: "ZONE-01 (CENTRE-VILLE)", lat: 45.5030, lng: -73.5700, speed: 0, phone: "(514) 872-0267", address: "Place Ville Marie" },
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
  static getVehicles() {
    try {
      const raw = localStorage.getItem('pulse_vehicles');
      return raw ? JSON.parse(raw) : INITIAL_VEHICLES;
    } catch (e) {
      console.error('PulseState.getVehicles error:', e);
      return INITIAL_VEHICLES;
    }
  }

  static saveVehicles(vehicles) {
    try {
      localStorage.setItem('pulse_vehicles', JSON.stringify(vehicles));
      PULSE_CHANNEL.postMessage({ type: 'VEHICLES_UPDATED', payload: vehicles });
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

  static resetDemoData() {
    localStorage.setItem('pulse_vehicles', JSON.stringify(INITIAL_VEHICLES));
    localStorage.setItem('pulse_calls', JSON.stringify(INITIAL_CALLS));
    localStorage.setItem('pulse_messages', JSON.stringify(INITIAL_MESSAGES));
    PULSE_CHANNEL.postMessage({ type: 'CALLS_UPDATED', payload: INITIAL_CALLS });
    PULSE_CHANNEL.postMessage({ type: 'VEHICLES_UPDATED', payload: INITIAL_VEHICLES });
    PULSE_CHANNEL.postMessage({ type: 'MESSAGES_UPDATED', payload: INITIAL_MESSAGES });
  }

  static init(force = false) {
    const existingCalls = localStorage.getItem('pulse_calls');
    // Force reset if legacy data with personal names or Laval is detected
    if (force || !existingCalls || existingCalls.includes('Laval') || existingCalls.includes('Benali')) {
      this.resetDemoData();
    }
  }
}

PulseState.init();
window.PulseState = PulseState;
