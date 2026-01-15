// backend/services/zoneService.js

// A simple list of zones with IDs and approximate center coordinates.
// You can refine these coordinates later.
const ZONES = [
  {
    id: "main",
    name: "Main Campus",
    lat: 42.3047,
    lon: -83.0663
  },
  {
    id: "downtown",
    name: "Downtown Campus",
    lat: 42.3174,
    lon: -83.0409
  },
  {
    id: "hk_toldo",
    name: "Human Kinetics / Toldo Lancer Centre",
    lat: 42.3009,
    lon: -83.0706
  }
];

// Return all zones
function getZones() {
  return ZONES;
}

// Find a zone by its id (ex: "main")
function getZoneById(zoneId) {
  return ZONES.find((z) => z.id === zoneId) || null;
}

module.exports = {
  getZones,
  getZoneById
};
