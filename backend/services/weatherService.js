// backend/services/weatherService.js

const BASE_URL = "https://api.openweathermap.org/data/2.5";

function requireApiKey() {
  const key = process.env.OPENWEATHER_API_KEY;
  if (!key) {
    throw new Error("Missing OPENWEATHER_API_KEY in .env");
  }
  return key;
}

// Normalize current weather into a small object your frontend will like
function normalizeCurrent(data) {
  return {
    temp: data.main?.temp,
    feelsLike: data.main?.feels_like,
    tempMin: data.main?.temp_min,
    tempMax: data.main?.temp_max,
    humidity: data.main?.humidity,
    windSpeed: data.wind?.speed,
    condition: data.weather?.[0]?.main,
    description: data.weather?.[0]?.description,
    iconCode: data.weather?.[0]?.icon,
    updatedAt: new Date().toISOString()
  };
}

async function getCurrentWeatherByCoords(lat, lon) {
  const apiKey = requireApiKey();

  const url =
    `${BASE_URL}/weather?lat=${lat}&lon=${lon}` +
    `&appid=${apiKey}&units=metric`;

  const resp = await fetch(url);
  if (!resp.ok) {
    const text = await resp.text();
    throw new Error(`OpenWeather current weather error: ${resp.status} ${text}`);
  }

  const data = await resp.json();
  return normalizeCurrent(data);
}

async function getForecastByCoords(lat, lon) {
  const apiKey = requireApiKey();

  // 5 day / 3 hour forecast endpoint
  const url =
    `${BASE_URL}/forecast?lat=${lat}&lon=${lon}` +
    `&appid=${apiKey}&units=metric`;

  const resp = await fetch(url);
  if (!resp.ok) {
    const text = await resp.text();
    throw new Error(`OpenWeather forecast error: ${resp.status} ${text}`);
  }

  const data = await resp.json();

  // Keep it simple: return the next 12 timestamps (~36 hours, since 3-hour steps)
  const items = (data.list || []).slice(0, 12).map((x) => ({
    time: x.dt_txt,                 // "YYYY-MM-DD HH:MM:SS"
    temp: x.main?.temp,
    feelsLike: x.main?.feels_like,
    condition: x.weather?.[0]?.main,
    description: x.weather?.[0]?.description,
    iconCode: x.weather?.[0]?.icon,
    windSpeed: x.wind?.speed
  }));

  return {
    city: data.city?.name,
    timezone: data.city?.timezone,
    items,
    updatedAt: new Date().toISOString()
  };
}

module.exports = {
  getCurrentWeatherByCoords,
  getForecastByCoords
};
