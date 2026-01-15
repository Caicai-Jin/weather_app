const express = require("express");
const cors = require("cors");
const { getZones } = require("./services/zoneService");
const { getZoneById } = require("./services/zoneService");
const { getCurrentWeatherByCoords, getForecastByCoords } = require("./services/weatherService");
const { getCache, setCache } = require("./utils/cache");


require("dotenv").config();

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Basic route (sanity check)
app.get("/api/health", (req, res) => {
  res.json({
    ok: true,
    message: "WeatherWise backend is running",
    time: new Date().toISOString()
  });
});

// Optional: root route
app.get("/", (req, res) => {
  res.send("WeatherWise backend. Try /api/health");
});

app.get("/api/zones", (req, res) => {
  res.json(getZones());
});

function getZoneOrSend400(req, res) {
  const zoneId = (req.query.zone || "main").toString();
  const zone = getZoneById(zoneId);
  if (!zone) {
    res.status(400).json({
      ok: false,
      error: `Invalid zone '${zoneId}'. Try /api/zones to see valid ids.`
    });
    return null;
  }
  return zone;
}

// Current weather
app.get("/api/weather", async (req, res) => {
  const zone = getZoneOrSend400(req, res);
  if (!zone) return;

  const cacheKey = `weather:${zone.id}`;
  const cached = getCache(cacheKey);
  if (cached) return res.json({ zone: zone.id, ...cached, cached: true });

  try {
    const data = await getCurrentWeatherByCoords(zone.lat, zone.lon);
    setCache(cacheKey, data, 10 * 60 * 1000); // 10 minutes
    res.json({ zone: zone.id, ...data, cached: false });
  } catch (err) {
    res.status(500).json({ ok: false, error: err.message });
  }
});

// Forecast
app.get("/api/forecast", async (req, res) => {
  const zone = getZoneOrSend400(req, res);
  if (!zone) return;

  const cacheKey = `forecast:${zone.id}`;
  const cached = getCache(cacheKey);
  if (cached) return res.json({ zone: zone.id, ...cached, cached: true });

  try {
    const data = await getForecastByCoords(zone.lat, zone.lon);
    setCache(cacheKey, data, 30 * 60 * 1000); // 30 minutes
    res.json({ zone: zone.id, ...data, cached: false });
  } catch (err) {
    res.status(500).json({ ok: false, error: err.message });
  }
});


// Start server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`✅ Server running at http://localhost:${PORT}`);
});
