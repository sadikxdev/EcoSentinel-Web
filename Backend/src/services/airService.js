
const AIR_API = "https://air-quality-api.open-meteo.com/v1/air-quality";
const WEATHER_API = "https://api.open-meteo.com/v1/forecast";

export const fetchAirQuality = async (latitude, longitude) => {
  const lat = Number(latitude);
  const lon = Number(longitude);

  if (
    !Number.isFinite(lat) ||
    !Number.isFinite(lon) ||
    lat < -90 ||
    lat > 90 ||
    lon < -180 ||
    lon > 180
  ) {
    throw new Error("Invalid latitude or longitude");
  }

  const coordinates = {
    latitude: lat,
    longitude: lon,
  };

  const airParams = new URLSearchParams({
    ...coordinates,
    current: [
      "pm2_5",
      "pm10",
      "carbon_monoxide",
      "nitrogen_dioxide",
      "sulphur_dioxide",
      "ozone",
      "european_aqi",
      "us_aqi",
      "uv_index",
      "ammonia",
      "aerosol_optical_depth",
      "dust",
    ].join(","),
    timezone: "auto",
  });

  const weatherParams = new URLSearchParams({
    ...coordinates,
    current: [
      "temperature_2m",
      "relative_humidity_2m",
      "precipitation",
      "wind_speed_10m",
    ].join(","),
    timezone: "auto",
  });

  const [airResponse, weatherResponse] = await Promise.all([
    fetch(`${AIR_API}?${airParams}`),
    fetch(`${WEATHER_API}?${weatherParams}`),
  ]);

  if (!airResponse.ok || !weatherResponse.ok) {
    throw new Error("Failed to fetch environmental data");
  }

  const [airResult, weatherResult] = await Promise.all([
    airResponse.json(),
    weatherResponse.json(),
  ]);

  return {
    air: airResult.current,
    weather: weatherResult.current,
  };
};
