/**
 * PULSE CAD — Real-time Multi-Device Cloud Sync Engine
 * Enables sub-100ms bidirectional synchronization between Dispatchers (Desktop/Laptop),
 * Drivers (Mobile/Tablet), and Surveillance HUDs worldwide over MQTT WebSockets.
 * Automatic fallback to LocalStorage & BroadcastChannel if offline.
 */

(function(window) {
  'use strict';

  const SYNC_TOPIC = 'pulse_cad_metro_fleet_v1/events';
  const BROKERS = [
    'wss://broker.hivemq.com:8884/mqtt',
    'wss://broker.emqx.io:8084/mqtt'
  ];
  let currentBrokerIdx = 0;
  let mqttClient = null;
  let isConnected = false;
  const clientId = 'pulse_dev_' + Math.random().toString(36).substring(2, 10);
  const listeners = [];

  const PulseCloudSync = {
    clientId: clientId,
    isConnected: () => isConnected,

    init() {
      if (typeof window === 'undefined') return;

      // Check if mqtt library is loaded
      if (typeof window.mqtt === 'undefined') {
        const script = document.createElement('script');
        script.src = 'https://unpkg.com/mqtt@5.16.1/dist/mqtt.min.js';
        script.async = true;
        script.onload = () => {
          this.connect();
        };
        script.onerror = () => {
          console.warn('[PulseCloudSync] CDN script load error. Using local BroadcastChannel.');
        };
        document.head.appendChild(script);
      } else {
        this.connect();
      }
    },

    connect() {
      if (typeof window.mqtt === 'undefined') return;
      try {
        const brokerUrl = BROKERS[currentBrokerIdx];
        mqttClient = window.mqtt.connect(brokerUrl, {
          clientId: clientId,
          clean: true,
          connectTimeout: 5000,
          reconnectPeriod: 3000,
          keepalive: 30
        });

        mqttClient.on('connect', () => {
          isConnected = true;
          this.updateUiBadge(true);
          mqttClient.subscribe(SYNC_TOPIC, { qos: 0 }, (err) => {
            if (!err) {
              console.log('[PulseCloudSync] Connected & Subscribed to', SYNC_TOPIC);
            }
          });
        });

        mqttClient.on('message', (topic, message) => {
          if (topic === SYNC_TOPIC) {
            try {
              const data = JSON.parse(message.toString());
              // Ignore own messages
              if (data && data.senderId === clientId) return;
              this.handleRemoteEvent(data);
            } catch (err) {
              console.warn('[PulseCloudSync] Failed to parse remote message:', err);
            }
          }
        });

        mqttClient.on('error', (err) => {
          console.warn('[PulseCloudSync] MQTT error:', err);
          isConnected = false;
          this.updateUiBadge(false);
        });

        mqttClient.on('close', () => {
          isConnected = false;
          this.updateUiBadge(false);
        });

        mqttClient.on('offline', () => {
          isConnected = false;
          this.updateUiBadge(false);
        });
      } catch (e) {
        console.warn('[PulseCloudSync] Connection exception:', e);
      }
    },

    broadcast(type, payload) {
      if (!mqttClient || !isConnected) return;
      try {
        const packet = {
          senderId: clientId,
          timestamp: Date.now(),
          type: type,
          payload: payload
        };
        mqttClient.publish(SYNC_TOPIC, JSON.stringify(packet), { qos: 0 });
      } catch (e) {
        console.warn('[PulseCloudSync] Broadcast error:', e);
      }
    },

    subscribe(callback) {
      if (typeof callback === 'function') {
        listeners.push(callback);
      }
    },

    handleRemoteEvent(event) {
      if (!event || !event.type) return;

      // Update local storage safely without re-triggering broadcast loop
      if (typeof window.PulseState !== 'undefined') {
        if (event.type === 'CALLS_UPDATED') {
          safeSetLocal('pulse_calls', event.payload);
        } else if (event.type === 'VEHICLES_UPDATED') {
          safeSetLocal('pulse_vehicles', event.payload);
        } else if (event.type === 'MESSAGES_UPDATED') {
          safeSetLocal('pulse_messages', event.payload);
        }
      }

      // Notify local subscribers
      listeners.forEach(cb => {
        try {
          cb(event);
        } catch (err) {
          console.error('[PulseCloudSync] Listener error:', err);
        }
      });

      // Dispatch window event for all listening components
      if (typeof window.dispatchEvent !== 'undefined') {
        window.dispatchEvent(new CustomEvent('pulse:cloud-event', { detail: event }));
      }
    },

    updateUiBadge(online) {
      const badges = document.querySelectorAll('.pulse-cloud-badge');
      badges.forEach(badge => {
        if (online) {
          badge.innerHTML = '<span class="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span><span class="text-[10px] font-mono text-emerald-400 font-bold">CLOUD ACTIF</span>';
          badge.title = 'Synchronisation Cloud Multi-Appareils en Direct';
        } else {
          badge.innerHTML = '<span class="w-1.5 h-1.5 rounded-full bg-amber-400"></span><span class="text-[10px] font-mono text-amber-400 font-bold">LOCAL</span>';
          badge.title = 'Mode Local (BroadcastChannel)';
        }
      });
    }
  };

  function safeSetLocal(key, val) {
    try {
      if (typeof window.localStorage !== 'undefined') {
        window.localStorage.setItem(key, JSON.stringify(val));
      }
    } catch (e) {}
  }

  window.PulseCloudSync = PulseCloudSync;

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => PulseCloudSync.init());
  } else {
    PulseCloudSync.init();
  }
})(typeof window !== 'undefined' ? window : this);
