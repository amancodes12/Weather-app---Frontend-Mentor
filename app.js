// =======================
// Utility Functions
// =======================

// Get current date
function currentDate() {
  const options = { weekday: "short", year: "numeric", month: "short", day: "numeric" };
  const today = new Date();
  document.getElementById("date").textContent = today.toLocaleDateString("en-US", options);
}
currentDate();

// Weather icons mapping
const weatherIcons = {
  snow: "icon-snow.webp",
  fog: "icon-fog.webp",
  drizzle: "icon-drizzle.webp",
  partlyCloudy: "icon-partly-cloudy.webp",
  sunny: "icon-sunny.webp",
  overcast: "icon-overcast.webp",
  rain: "icon-rain.webp",
  storm: "icon-storm.webp",
};

// Convert Celsius ↔ Fahrenheit
function toFahrenheit(c) { return (c * 9) / 5 + 32; }
function toCelsius(f) { return ((f - 32) * 5) / 9; }

// Update all displayed temperatures based on selected unit
function updateTemperatureUnit(unit) {
  document.querySelectorAll("[data-celsius]").forEach((el) => {
    const celsius = parseFloat(el.dataset.celsius);
    if (!isNaN(celsius)) {
      el.textContent = unit === "imperial"
        ? `${toFahrenheit(celsius).toFixed(1)}°F`
        : `${celsius.toFixed(1)}°C`;
    }
  });
}

// Dropdown listener
document.getElementById("unitSelector").addEventListener("change", function () {
  updateTemperatureUnit(this.value);
});

// =======================
// Default Weather (Berlin)
// =======================
async function getDefaultWeather() {
  const url = "https://api.open-meteo.com/v1/forecast?latitude=52.52&longitude=13.41&current_weather=true&hourly=relative_humidity_2m,precipitation&timezone=auto";

  try {
    const response = await fetch(url);
    if (!response.ok) throw new Error("Failed to fetch weather data");

    const data = await response.json();
    const temp = data.current_weather?.temperature;
    const wind = data.current_weather?.windspeed;
    const humidity = data.hourly?.relative_humidity_2m?.[0];
    const precipitation = data.hourly?.precipitation?.[0];

    // Current Temp
    const dispTemp = document.getElementById("current_temp");
    const temperatureEl = document.getElementById("temperature");
    if (dispTemp) { dispTemp.dataset.celsius = temp; dispTemp.textContent = `${temp}°C`; }
    if (temperatureEl) temperatureEl.innerHTML = `<h2>Temperature</h2><h3 data-celsius="${temp}">${temp}°C</h3>`;

    // Weather icon
    const img = document.getElementById("img");
    if (img) {
      let icon = temp <= 0 ? "snow"
               : temp <= 10 ? "fog"
               : temp <= 18 ? "drizzle"
               : temp <= 24 ? "partlyCloudy"
               : temp <= 30 ? "sunny"
               : temp <= 35 ? "overcast"
               : temp <= 40 ? "rain"
               : "storm";
      img.innerHTML = `<img src="${weatherIcons[icon]}" style="height:100px;width:140px;" alt="Weather icon">`;
    }

    // Humidity
    const humidityEl = document.getElementById("humidity");
    if (humidityEl) humidityEl.innerHTML = `<h2>Humidity</h2><h3>${humidity} <span style="font-size:16px;">%</span></h3>`;

    // Wind
    const windEl = document.getElementById("wind");
    if (windEl) windEl.innerHTML = `<h2>Wind</h2><h3>${wind} <span style="font-size:16px;">km/h</span></h3>`;

    // Precipitation
    const precipitationEl = document.getElementById("precipitation");
    if (precipitationEl) precipitationEl.innerHTML = `<h2>Precipitation</h2><h3>${precipitation} <span style="font-size:16px;">mm</span></h3>`;

    // Apply initial unit
    const defaultUnit = document.getElementById("unitSelector").value;
    updateTemperatureUnit(defaultUnit);

  } catch (err) {
    console.error(err);
  }
}
getDefaultWeather();

// =======================
// Daily Forecast
// =======================
async function defaultDaily() {
  const url = "https://api.open-meteo.com/v1/forecast?latitude=52.52&longitude=13.41&daily=temperature_2m_max,temperature_2m_min&timezone=auto";

  try {
    const response = await fetch(url);
    if (!response.ok) throw new Error("Failed to fetch daily forecast");

    const data = await response.json();
    const maxTemps = data.daily.temperature_2m_max;
    const minTemps = data.daily.temperature_2m_min;

    document.querySelectorAll(".daily-forcast > div").forEach((div, i) => {
      const max = maxTemps[i];
      const min = minTemps[i];
      if (max == null || min == null) return;

      const imgContainer = div.querySelector(".dailyImg");
      const tempH2 = div.querySelector("h2");

      // Icon
      let icon = max <= 0 ? "snow"
               : max <= 10 ? "fog"
               : max <= 18 ? "drizzle"
               : max <= 24 ? "partlyCloudy"
               : max <= 30 ? "sunny"
               : max <= 35 ? "overcast"
               : max <= 40 ? "rain"
               : "storm";
      if (imgContainer) imgContainer.innerHTML = `<img src="${weatherIcons[icon]}" style="height:40px;width:50px;" alt="icon">`;

      // Temp
      if (tempH2) tempH2.innerHTML = `
        <div class="temp-container">
          <span class="max-temp" data-celsius="${max}">${Math.round(max)}°C</span>
          <span class="min-temp" data-celsius="${min}">${Math.round(min)}°C</span>
        </div>`;
    });

    // Apply initial unit
    updateTemperatureUnit(document.getElementById("unitSelector").value);

  } catch (err) {
    console.error(err);
  }
}
defaultDaily();

// =======================
// Hourly Forecast
// =======================
async function getDefaultTime() {
  const url = "https://api.open-meteo.com/v1/forecast?latitude=52.52&longitude=13.41&hourly=temperature_2m";

  try {
    const response = await fetch(url);
    if (!response.ok) throw new Error("Failed to fetch hourly forecast");

    const data = await response.json();
    const times = data.hourly.time;
    const temps = data.hourly.temperature_2m;

    const iconDivs = document.querySelectorAll(".hour-forcast > div > .hourly-img");
    const timeDivs = document.querySelectorAll(".hour-forcast > div > .hour");
    const tempDivs = document.querySelectorAll(".hour-forcast > div > .hour-temp");

    const now = new Date();
    const currentHour = now.toISOString().slice(0, 13) + ":00";
    const index = times.indexOf(currentHour);

    if (index !== -1) {
      const nextHours = times.slice(index, index + 8);
      const nextTemps = temps.slice(index, index + 8);

      nextHours.forEach((t, i) => {
        if (timeDivs[i]) timeDivs[i].textContent = t.slice(11, 16);
        if (tempDivs[i]) {
          const temp = nextTemps[i];
          tempDivs[i].dataset.celsius = temp;
          tempDivs[i].textContent = `${temp}°C`;
        }

        if (iconDivs[i]) {
          const temp = nextTemps[i];
          const icon = temp <= 0 ? "snow"
                     : temp <= 10 ? "fog"
                     : temp <= 18 ? "drizzle"
                     : temp <= 24 ? "partlyCloudy"
                     : temp <= 30 ? "sunny"
                     : temp <= 35 ? "overcast"
                     : temp <= 40 ? "rain"
                     : "storm";
          iconDivs[i].innerHTML = `<img src="${weatherIcons[icon]}" style="height:35px;width:35px;" alt="icon">`;
        }
      });

      // Apply initial unit
      updateTemperatureUnit(document.getElementById("unitSelector").value);
    }

  } catch (err) {
    console.error(err);
  }
}
getDefaultTime();
