const apiKey = '616a8b64aba1413f814170920250307'; // Replace with your real key

function getWeather(selected) {
  let loc = selected || document.getElementById('locationInput').value;
  if (!loc) return alert('Please enter a location');

  fetch(`https://api.weatherapi.com/v1/forecast.json?key=${apiKey}&q=${loc}&days=7&aqi=yes&alerts=yes`)
    .then(res => res.json())
    .then(data => {
      showCurrent(data);
      showHourly(data);
      showForecast(data);
      dynamicBackground(data.current.condition.text);
    })
    .catch(() => alert('Location not found or API limit reached!'));
}

function showCurrent(data) {
  const c = data.current;
  const l = data.location;
  const aqi = c.air_quality.pm2_5.toFixed(1);
  const alertText = data.alerts && data.alerts.alert.length > 0 ? data.alerts.alert[0].headline : '';

  document.getElementById('currentWeather').innerHTML = `
    <h2>${l.name}, ${l.country}</h2>
    <img src="https:${c.condition.icon}">
    <p><strong>${c.temp_c}°C</strong> (${c.temp_f}°F), Feels like ${c.feelslike_c}°C</p>
    <p>${c.condition.text}</p>
    <div class="time-sun">
      <div id="localTime">🕒 Local Time: --</div>
      <div>🌅 Sunrise: ${data.forecast.forecastday[0].astro.sunrise}</div>
      <div>🌇 Sunset: ${data.forecast.forecastday[0].astro.sunset}</div>
    </div>
    <div class="weather-details">
      <div>💧 Humidity: ${c.humidity}%</div>
      <div>💨 Wind: ${c.wind_kph} kph</div>
      <div>🌡 Pressure: ${c.pressure_mb} mb</div>
      <div>🔆 UV: ${c.uv}</div>
      <div>🫁 AQI (PM2.5): ${aqi}</div>
    </div>
    ${alertText ? `<div class="alert">⚠ ${alertText}</div>` : ''}
  `;
  document.getElementById('currentWeather').style.display = 'block';
  startClock(data.location.localtime);
}

function showHourly(data) {
  const hours = data.forecast.forecastday[0].hour;
  let html = '';
  hours.forEach(h => {
    html += `
      <div class="hourly-item">
        <p>${h.time.split(' ')[1]}</p>
        <img src="https:${h.condition.icon}">
        <p>${h.temp_c}°C</p>
      </div>
    `;
  });
  document.getElementById('hourlyScroll').innerHTML = html;
  document.getElementById('hourlyWeather').style.display = 'block';
}

function showForecast(data) {
  const days = data.forecast.forecastday;
  let html = '';
  days.forEach(d => {
    const emoji = getWeatherEmoji(d.day.condition.text);
    html += `
      <div class="forecast-day">
        <p>${d.date}</p>
        <img src="https:${d.day.condition.icon}">
        <p>${d.day.avgtemp_c}°C ${emoji}</p>
        <p>${d.day.condition.text}</p>
      </div>
    `;
  });
  document.getElementById('forecastGrid').innerHTML = html;
  document.getElementById('forecastWeather').style.display = 'block';
}

function getWeatherEmoji(condition) {
  if (condition.includes('Sunny') || condition.includes('Clear')) return '🌞';
  if (condition.includes('Cloudy')) return '☁️';
  if (condition.includes('Rain')) return '🌧️';
  if (condition.includes('Snow')) return '❄️';
  if (condition.includes('Wind')) return '🌬️';
  return '🌥️';
}

function autoSuggest() {
  let q = document.getElementById('locationInput').value;
  if (q.length < 2) return document.getElementById('suggestions').innerHTML = '';
  fetch(`https://api.weatherapi.com/v1/search.json?key=${apiKey}&q=${q}`)
    .then(res => res.json())
    .then(data => {
      let html = '';
      data.forEach(loc => {
        html += `<div onclick="selectLocation('${loc.name}, ${loc.country}')">${loc.name}, ${loc.country}</div>`;
      });
      document.getElementById('suggestions').innerHTML = html;
    });
}

function selectLocation(loc) {
  document.getElementById('locationInput').value = loc;
  document.getElementById('suggestions').innerHTML = '';
  getWeather(loc);
}

function dynamicBackground(condition) {
  let bg;
  if (condition.includes('Sunny') || condition.includes('Clear')) bg = 'linear-gradient(to right, #fceabb, #f8b500)';
  else if (condition.includes('Cloudy')) bg = 'linear-gradient(to right, #bdc3c7, #2c3e50)';
  else if (condition.includes('Rain')) bg = 'linear-gradient(to right, #4b79a1, #283e51)';
  else if (condition.includes('Snow')) bg = 'linear-gradient(to right, #e6dada, #274046)';
  else bg = 'linear-gradient(to right, #83a4d4, #b6fbff)';
  document.body.style.background = bg;
}

function startClock(localtime) {
  let time = new Date(localtime);
  function update() {
    time.setMinutes(time.getMinutes() + 1);
    let h = time.getHours().toString().padStart(2, '0');
    let m = time.getMinutes().toString().padStart(2, '0');
    document.getElementById('localTime').innerText = `🕒 Local Time: ${h}:${m}`;
  }
  update();
  setInterval(update, 60000);
}
