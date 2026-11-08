# PULSE CAD — Enterprise Fleet Dispatch & AVL Telemetry Console

Console opérationnelle de gestion et répartition de flotte métropolitaine temps réel. Développée selon les standards industriels d'ingénierie et de sécurité opérationnelle.

---

## 🏛️ Piliers Architecturaux

- **Design System « Brut Blanc & Bloc Noir »** : Interface aérospatiale/CAD à fort contraste (`#09090b` / `#ffffff`), zéro effet luminescent ou dégradé néon, typographies normées **Plus Jakarta Sans** (chrome UI) et **IBM Plex Mono** (télémétrie, horodatages, télématique).
- **Moteur de Cartographie Multi-Couches** :
  - **Esri World Street Map** : Navigation urbaine complète avec réseau d'artères, boulevards et autoroutes de Montréal.
  - **Calque Trafic Waze en Direct** : Segments de congestion dynamique (A-15 Sud, René-Lévesque travaux angle Peel, A-20 Ouest YUL) et balises d'alertes routières.
  - **Sélecteur de Carte Tactique** : Bascule instantanée entre Rues Réelles (Esri), Vue Satellite HD, Carto Voyager et CAD Minimaliste.
- **Télémétrie GPS Live & Bus CAN OBD-II** :
  - Interpolation des coordonnées à 6 décimales (`LAT 45.501923, LNG -73.567412`).
  - Terminal de diagnostic véhicule complet : tension batterie 13.9V, température moteur, odomètre, liaison 4G/LTE (ping 24ms, RSSI -68 dBm, chiffrement AES-256).
- **Routage Forcé par Points de Passage (CAD Waypoints)** : Pose de jalons obligatoires (`WP-01`, `WP-02`) pour contraindre dynamiquement les vecteurs d'approche.
- **Synchronisation Inter-Terminaux** : Architecture temps réel sans rechargement via `BroadcastChannel('pulse_cad_sync')`.

---

## 🚀 Démarrage Rapide

### 1. Lancement Local
```bash
git clone git@github.com:yassdidouh-ops/pulse-fleet-dispatch.git
cd pulse-fleet-dispatch/frontend
python3 -m http.server 8091
```
Ouvrez ensuite votre navigateur sur `http://localhost:8091`.

### 2. Raccourcis Clavier CAD
- `[F1]` : Tableau de bord exécutif (`index.html`)
- `[F2]` : Console de répartition & prise d'appel (`dispatch.html`)
- `[F3]` : File d'attente des courses (`queue.html`)
- `[F4]` : Carte flotte AVL & trafic Waze (`map.html`)
- `[F5]` : Terminal de messagerie radio MDT (`messages.html`)
- `[F7]` : Réinitialisation du formulaire en cours
- `[Entrée]` : Diffusion immédiate de l'ordre de mission

---

## 👥 Collaboration & Multi-Terminaux
Toute modification apportée sur un terminal ou via un agent Antigravity est immédiatement synchronisée.
Pour récupérer les dernières mises à jour de vos collaborateurs :
```bash
git pull origin main
```
Pour diffuser vos modifications :
```bash
git add .
git commit -m "feat: mise a jour systeme"
git push origin main
```
