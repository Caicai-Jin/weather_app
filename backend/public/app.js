async function fetchJson(url) {
  const resp = await fetch(url);
  if (!resp.ok) {
    const text = await resp.text();
    throw new Error(`${resp.status} ${text}`);
  }
  return resp.json();
}

function iconFromCondition(condition = "") {
  const c = condition.toLowerCase();
  if (c.includes("clear")) return "☀️";
  if (c.includes("cloud")) return "☁️";
  if (c.includes("rain") || c.includes("drizzle")) return "🌧️";
  if (c.includes("snow")) return "❄️";
  if (c.includes("thunder")) return "⛈️";
  if (c.includes("mist") || c.includes("fog") || c.includes("haze")) return "🌫️";
  return "🌡️";
}

function renderNow(data) {
  const icon = iconFromCondition(data.condition);
  return `
    <div class="row">
      <div class="pill">${icon} ${data.condition || "N/A"}</div>
      <div class="pill">Temp: ${data.temp ?? "?"}°C</div>
      <div class="pill">Feels: ${data.feelsLike ?? "?"}°C</div>
      <div class="pill">Wind: ${data.windSpeed ?? "?"} m/s</div>
      <div class="pill">Humidity: ${data.humidity ?? "?"}%</div>
    </div>
    <div class="small">Updated: ${data.updatedAt} ${data.cached ? "(cached)" : ""}</div>
  `;
}

function renderForecast(data) {
  const items = data.items || [];
  if (items.length === 0) return "<div>No forecast data.</div>";
  return items.map(x => {
    const icon = iconFromCondition(x.condition);
    return `<div class="small">${x.time}: ${icon} ${x.temp ?? "?"}°C (${x.condition || "N/A"})</div>`;
  }).join("");
}

async function loadZones() {
  const zones = await fetchJson("/api/zones");
  const select = document.getElementById("zoneSelect");
  select.innerHTML = zones.map(z => `<option value="${z.id}">${z.name}</option>`).join("");
  return zones;
}

async function loadAll() {
  const zone = document.getElementById("zoneSelect").value || "main";
  document.getElementById("nowContent").textContent = "Loading...";
  document.getElementById("forecastContent").textContent = "Loading...";

  const now = await fetchJson(`/api/weather?zone=${encodeURIComponent(zone)}`);
  document.getElementById("nowContent").innerHTML = renderNow(now);

  const forecast = await fetchJson(`/api/forecast?zone=${encodeURIComponent(zone)}`);
  document.getElementById("forecastContent").innerHTML = renderForecast(forecast);
}

async function main() {
  await loadZones();
  await loadAll();
  document.getElementById("refreshBtn").addEventListener("click", loadAll);
  document.getElementById("zoneSelect").addEventListener("change", loadAll);
}

main().catch(err => {
  document.getElementById("nowContent").textContent = "Error: " + err.message;
  document.getElementById("forecastContent").textContent = "Error: " + err.message;
});
