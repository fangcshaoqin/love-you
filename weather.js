(() => {
  const widget = document.querySelector("#weather-widget");
  if (!widget) return;

  const iconElement = document.querySelector("#weather-icon");
  const summaryElement = document.querySelector("#weather-summary");
  const detailsElement = document.querySelector("#weather-details");
  const refreshButton = document.querySelector("#weather-refresh");
  const locationCacheKey = "loveLetterWeatherLocation";
  const locationCacheDuration = 12 * 60 * 60 * 1000;
  let activeRequest;
  let weatherPreviewIndex = -1;
  const weatherPreviews = [
    { code: 0, label: "晴朗", temperature: 24, wind: 8 },
    { code: 3, label: "阴天", temperature: 18, wind: 12 },
    { code: 45, label: "雾气", temperature: 13, wind: 5 },
    { code: 51, label: "毛毛细雨", temperature: 16, wind: 7 },
    { code: 63, label: "中雨", temperature: 15, wind: 14 },
    { code: 65, label: "大雨", temperature: 12, wind: 24 },
    { code: 71, label: "飘雪", temperature: -2, wind: 14 },
    { code: 95, label: "雷雨", temperature: 19, wind: 30 },
  ];

  const weatherDescriptions = {
    0: ["晴朗", "☀"],
    1: ["大致晴朗", "🌤"],
    2: ["多云间晴", "⛅"],
    3: ["阴天", "☁"],
    45: ["有雾", "🌫"],
    48: ["雾凇", "🌫"],
    51: ["零星毛毛雨", "🌦"],
    53: ["毛毛雨", "🌦"],
    55: ["较强毛毛雨", "🌧"],
    56: ["冻毛毛雨", "🌧"],
    57: ["较强冻毛毛雨", "🌧"],
    61: ["小雨", "🌦"],
    63: ["中雨", "🌧"],
    65: ["大雨", "🌧"],
    66: ["冻雨", "🌧"],
    67: ["较强冻雨", "🌧"],
    71: ["小雪", "🌨"],
    73: ["中雪", "🌨"],
    75: ["大雪", "❄"],
    77: ["米雪", "❄"],
    80: ["阵雨", "🌦"],
    81: ["较强阵雨", "🌧"],
    82: ["强阵雨", "🌧"],
    85: ["阵雪", "🌨"],
    86: ["强阵雪", "❄"],
    95: ["雷雨", "⛈"],
    96: ["雷雨伴冰雹", "⛈"],
    99: ["强雷雨伴冰雹", "⛈"],
  };

  function getWeatherTheme(code) {
    if (code === 0 || code === 1) return "clear";
    if (code === 2 || code === 3) return "cloudy";
    if (code === 45 || code === 48) return "fog";
    if (code >= 51 && code <= 57) return "drizzle";
    if ((code >= 61 && code <= 67) || (code >= 80 && code <= 82)) return "rain";
    if ((code >= 71 && code <= 77) || code === 85 || code === 86) return "snow";
    if (code >= 95 && code <= 99) return "storm";
    return "unknown";
  }

  function getWeatherIntensity(code) {
    if ([55, 57, 65, 67, 82, 86, 99].includes(code)) return "heavy";
    if ([53, 56, 63, 66, 73, 81, 96].includes(code)) return "steady";
    if ([51, 61, 71, 77, 80, 85].includes(code)) return "light";
    if (code === 95) return "steady";
    return "calm";
  }

  function applyWeatherTheme(code, isDay, temperature = null, windSpeed = null, source = "live") {
    const root = document.documentElement;
    root.dataset.weather = getWeatherTheme(code);
    root.dataset.weatherPeriod = isDay ? "day" : "night";
    root.dataset.weatherIntensity = getWeatherIntensity(code);
    if (Number.isFinite(temperature)) {
      root.dataset.weatherTemperature = temperature <= 5 ? "cold" : temperature >= 30 ? "hot" : "mild";
    } else {
      delete root.dataset.weatherTemperature;
    }
    if (Number.isFinite(windSpeed)) {
      root.dataset.weatherWind = windSpeed >= 30 ? "strong" : windSpeed >= 16 ? "breezy" : "calm";
      root.style.setProperty("--weather-wind-duration", String(Math.max(0.65, Math.min(1.8, 22 / Math.max(windSpeed, 8)))));
    } else {
      root.dataset.weatherWind = "calm";
      root.style.removeProperty("--weather-wind-duration");
    }
    window.dispatchEvent(new CustomEvent("weatherchange", {
      detail: {
        code,
        condition: root.dataset.weather,
        period: root.dataset.weatherPeriod,
        intensity: root.dataset.weatherIntensity,
        temperature: root.dataset.weatherTemperature || null,
        wind: root.dataset.weatherWind,
        source,
      },
    }));
  }

  function setLoading() {
    widget.dataset.state = "loading";
    widget.setAttribute("aria-busy", "true");
    summaryElement.textContent = "正在查询天气";
    detailsElement.textContent = "按 IP 粗略估算位置";
    iconElement.textContent = "◌";
  }

  function setError(message) {
    widget.dataset.state = "error";
    widget.setAttribute("aria-busy", "false");
    summaryElement.textContent = "暂时无法获取天气";
    detailsElement.textContent = message;
    iconElement.textContent = "!";
  }

  async function fetchJson(url, signal) {
    const response = await fetch(url, { signal, cache: "no-store" });
    if (!response.ok) {
      throw new Error(`Weather service returned HTTP ${response.status}.`);
    }

    return response.json();
  }

  function isValidLocation(location) {
    return location &&
      typeof location.city === "string" &&
      Number.isFinite(location.latitude) &&
      location.latitude >= -90 &&
      location.latitude <= 90 &&
      Number.isFinite(location.longitude) &&
      location.longitude >= -180 &&
      location.longitude <= 180;
  }

  async function getLocation(signal) {
    try {
      const cached = JSON.parse(localStorage.getItem(locationCacheKey) || "null");
      if (
        cached &&
        cached.expiresAt > Date.now() &&
        isValidLocation(cached)
      ) {
        return cached;
      }
    } catch (error) {
      console.warn("Could not use cached weather location.", error);
    }

    const result = await fetchJson("https://ipwho.is/", signal);
    if (result.success !== true || !Number.isFinite(result.latitude) || !Number.isFinite(result.longitude)) {
      throw new Error("IP location lookup did not return valid coordinates.");
    }

    const location = {
      city: typeof result.city === "string" && result.city.trim()
        ? result.city.trim()
        : (typeof result.region === "string" && result.region.trim() ? result.region.trim() : "你所在的地区"),
      latitude: result.latitude,
      longitude: result.longitude,
      timezone: typeof result.timezone?.id === "string" ? result.timezone.id : "auto",
      expiresAt: Date.now() + locationCacheDuration,
    };

    try {
      localStorage.setItem(locationCacheKey, JSON.stringify(location));
    } catch (error) {
      console.warn("Could not cache weather location in this browser.", error);
    }

    return location;
  }

  function describeWeather(code, isDay) {
    const description = weatherDescriptions[code];
    if (!description) {
      throw new Error(`Unknown weather code: ${code}.`);
    }

    if (code === 0 && !isDay) {
      return ["晴朗的夜晚", "☾"];
    }
    if (code === 1 && !isDay) {
      return ["大致晴朗的夜晚", "☾"];
    }
    return description;
  }

  function renderWeather(location, weather) {
    if (weatherPreviewIndex >= 0) return;

    const { current, current_units: units } = weather;
    if (
      !current ||
      !units ||
      !Number.isFinite(current.temperature_2m) ||
      !Number.isFinite(current.weather_code) ||
      typeof current.time !== "string"
    ) {
      throw new Error("Weather response is missing required current conditions.");
    }

    const [condition, icon] = describeWeather(current.weather_code, current.is_day === 1);
    const temperature = Math.round(current.temperature_2m);
    const temperatureUnit = units.temperature_2m || "°C";
    const feelsLike = Number.isFinite(current.apparent_temperature)
      ? `体感 ${Math.round(current.apparent_temperature)}${temperatureUnit}`
      : condition;
    const humidity = Number.isFinite(current.relative_humidity_2m)
      ? `湿度 ${Math.round(current.relative_humidity_2m)}%`
      : "";
    const wind = Number.isFinite(current.wind_speed_10m)
      ? `风速 ${Math.round(current.wind_speed_10m)} km/h`
      : "";
    const measuredAt = current.time.includes("T") ? current.time.split("T")[1] : current.time;
    const secondaryDetails = [feelsLike, humidity, wind].filter(Boolean).join(" · ");

    iconElement.textContent = icon;
    summaryElement.textContent = `${location.city} · ${condition} · ${temperature}${temperatureUnit}`;
    detailsElement.textContent = `${secondaryDetails} · ${measuredAt}更新`;
    applyWeatherTheme(
      current.weather_code,
      current.is_day === 1,
      current.temperature_2m,
      current.wind_speed_10m,
    );
    widget.dataset.state = "ready";
    widget.setAttribute("aria-busy", "false");
  }

  function cyclePreview() {
    weatherPreviewIndex = (weatherPreviewIndex + 1) % weatherPreviews.length;
    const preview = weatherPreviews[weatherPreviewIndex];
    const isDay = document.documentElement.dataset.weatherPeriod !== "night";
    const [condition, icon] = describeWeather(preview.code, isDay);
    iconElement.textContent = icon;
    summaryElement.textContent = `天气氛围预览 · ${preview.label}`;
    detailsElement.textContent = "点击天气刷新按钮，恢复实时天气";
    widget.dataset.state = "ready";
    widget.setAttribute("aria-busy", "false");
    applyWeatherTheme(preview.code, isDay, preview.temperature, preview.wind, "preview");
    return preview.label || condition;
  }

  async function updateWeather() {
    if (weatherPreviewIndex >= 0) return;
    if (activeRequest) activeRequest.abort();
    const controller = new AbortController();
    activeRequest = controller;
    const timeoutId = window.setTimeout(() => controller.abort(), 12_000);
    setLoading();

    try {
      const location = await getLocation(controller.signal);
      const params = new URLSearchParams({
        latitude: String(location.latitude),
        longitude: String(location.longitude),
        current: "temperature_2m,apparent_temperature,relative_humidity_2m,weather_code,wind_speed_10m,is_day",
        timezone: location.timezone,
      });
      const weather = await fetchJson(`https://api.open-meteo.com/v1/forecast?${params}`, controller.signal);
      renderWeather(location, weather);
    } catch (error) {
      if (activeRequest === controller && error.name === "AbortError") {
        setError("请求超时，请点击刷新重试");
      } else if (activeRequest === controller) {
        console.error("Unable to load current weather.", error);
        setError("网络或定位服务不可用，点击重试");
      }
    } finally {
      window.clearTimeout(timeoutId);
      if (activeRequest === controller) activeRequest = null;
    }
  }

  refreshButton.addEventListener("click", () => {
    weatherPreviewIndex = -1;
    updateWeather();
  });
  window.WeatherTheme = Object.freeze({ getWeatherTheme, applyWeatherTheme, cyclePreview });
  updateWeather();
  window.setInterval(updateWeather, 15 * 60 * 1000);
})();
