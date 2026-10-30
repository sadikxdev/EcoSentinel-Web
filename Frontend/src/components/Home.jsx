import { useEffect, useState } from "react";
import locations from "../Data/Data.json";
import "../css/home.css";

const limits = {
  pm10: [50, 100],
  pm2_5: [25, 50],
  carbon_monoxide: [4000, 10000],
  nitrogen_dioxide: [40, 100],
  sulphur_dioxide: [20, 80],
  ozone: [100, 180],
  european_aqi: [20, 40],
  us_aqi: [50, 100],
  uv_index: [2, 5],
  ammonia: [200, 400],
  aerosol_optical_depth: [0.5, 1],
  dust: [50, 100],
  precipitation: [2, 10],
  wind_speed_10m: [20, 40],
};

const airFields = [
  ["PM10", "pm10"],
  ["PM2.5", "pm2_5"],
  ["Carbon Monoxide", "carbon_monoxide"],
  ["Nitrogen Dioxide", "nitrogen_dioxide"],
  ["Sulphur Dioxide", "sulphur_dioxide"],
  ["Ozone", "ozone"],
  ["European AQI", "european_aqi"],
  ["US AQI", "us_aqi"],
  ["UV Index", "uv_index"],
  ["Ammonia", "ammonia"],
  ["Aerosol Optical Depth", "aerosol_optical_depth"],
  ["Dust", "dust"],
];

const weatherFields = [
  ["Temperature", "temperature_2m", "°C"],
  ["Humidity", "relative_humidity_2m", "%"],
  ["Precipitation", "precipitation", "mm"],
  ["Wind Speed", "wind_speed_10m", "km/h"],
];

const getLevel = (value, key) => {
  if (value == null || !Number.isFinite(Number(value))) {
    return "normal";
  }

  const number = Number(value);

  if (key === "temperature_2m") {
    if (number >= 18 && number <= 30) return "good";
    if (number >= 10 && number <= 35) return "moderate";
    return "danger";
  }

  if (key === "relative_humidity_2m") {
    if (number >= 30 && number <= 60) return "good";
    if (number >= 20 && number <= 70) return "moderate";
    return "danger";
  }

  const range = limits[key];

  if (!range) return "normal";
  if (number <= range[0]) return "good";
  if (number <= range[1]) return "moderate";

  return "danger";
};

function Home() {
  const [location, setLocation] = useState(null);
  const [search, setSearch] = useState("");
  const [showSuggestions, setShowSuggestions] = useState(false);

  const [apiData, setApiData] = useState(null);
  const [weatherData, setWeatherData] = useState(null);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const filteredLocations = search.trim()
    ? locations
        .filter((item) =>
          item.loc.toLowerCase().includes(search.trim().toLowerCase())
        )
        .slice(0, 8)
    : [];

  useEffect(() => {
    if (!location) return;

    const controller = new AbortController();
    let timeout;

    const getData = async () => {
      setLoading(true);
      setError("");

      try {
        const coordinates = new URLSearchParams({
          latitude: location.lat,
          longitude: location.long,
        });

        const airUrl =
          `https://air-quality-api.open-meteo.com/v1/air-quality?${coordinates}` +
          `&current=${airFields.map((field) => field[1]).join(",")}`;

        const weatherUrl =
          `https://api.open-meteo.com/v1/forecast?${coordinates}` +
          `&current=${weatherFields.map((field) => field[1]).join(",")}`;

        const [airResponse, weatherResponse] = await Promise.all([
          fetch(airUrl, { signal: controller.signal }),
          fetch(weatherUrl, { signal: controller.signal }),
        ]);

        if (!airResponse.ok || !weatherResponse.ok) {
          throw new Error("Failed to fetch environmental data");
        }

        const [airResult, weatherResult] = await Promise.all([
          airResponse.json(),
          weatherResponse.json(),
        ]);

        if (controller.signal.aborted) return;

        setApiData(airResult.current);
        setWeatherData(weatherResult.current);
      } catch (err) {
        if (controller.signal.aborted) return;

        console.error(err);
        setApiData(null);
        setWeatherData(null);
        setError("Unable to load air quality and weather data.");
      } finally {
        if (!controller.signal.aborted) {
          setLoading(false);
        }
      }

      if (!controller.signal.aborted) {
        const now = new Date();
        const tomorrow = new Date(now);

        tomorrow.setDate(now.getDate() + 1);
        tomorrow.setHours(0, 0, 0, 0);

        timeout = setTimeout(
          getData,
          tomorrow.getTime() - now.getTime()
        );
      }
    };

    setApiData(null);
    setWeatherData(null);
    getData();

    return () => {
      controller.abort();
      clearTimeout(timeout);
    };
  }, [location]);

  const handleSearch = (e) => {
    e.preventDefault();

    const found = locations.find(
      (item) =>
        item.loc.toLowerCase() === search.trim().toLowerCase()
    );

    if (!found) {
      setError("Please select a valid location.");
      return;
    }

    if (
      !Number.isFinite(Number(found.lat)) ||
      !Number.isFinite(Number(found.long))
    ) {
      setError("Invalid location coordinates.");
      return;
    }

    setLocation({
      name: found.loc,
      lat: Number(found.lat),
      long: Number(found.long),
    });

    setSearch("");
    setShowSuggestions(false);
    setError("");
  };

  const cards = [
    ...airFields.map(([label, key]) => ({
      label,
      key,
      value: apiData?.[key],
      unit: "",
    })),
    ...weatherFields.map(([label, key, unit]) => ({
      label,
      key,
      value: weatherData?.[key],
      unit,
    })),
  ];

  return (
    <section className="home-section">
      <div className="selected-location-header">
        <h1>{location?.name || "Select a location"}</h1>
      </div>

      <div className="location-search-container">
        <form className="location-search-form" onSubmit={handleSearch}>
          <div className="location-search-wrapper">
            <input
              type="text"
              value={search}
              placeholder="Search location..."
              autoComplete="off"
              aria-label="Search location"
              onChange={(e) => {
                setSearch(e.target.value);
                setShowSuggestions(true);
              }}
              onFocus={() => setShowSuggestions(true)}
            />

            {showSuggestions && search.trim() && (
              <div className="location-suggestions">
                {filteredLocations.length ? (
                  filteredLocations.map((item, index) => (
                    <button
                      type="button"
                      className="location-suggestion-item"
                      key={`${item.loc}-${index}`}
                      onClick={() => {
                        setSearch(item.loc);
                        setShowSuggestions(false);
                      }}
                    >
                      {item.loc}
                    </button>
                  ))
                ) : (
                  <p className="location-no-results">
                    No matching locations found
                  </p>
                )}
              </div>
            )}
          </div>

          <button type="submit" className="location-search-btn">
            Search
          </button>
        </form>
      </div>

      {error && <p className="status-message">{error}</p>}

      <div className="air-quality">
        <h2>Air Quality</h2>

        {loading && (
          <p className="status-message">
            Loading air quality and weather data...
          </p>
        )}

        {!loading && apiData && weatherData && (
          <div className="air-quality-grid">
            {cards.map(({ label, key, value, unit }) => (
              <div
                key={key}
                className={`air-quality-card ${getLevel(value, key)}`}
              >
                <p>{label}</p>
                <strong>
                  {value == null ? "N/A" : `${value}${unit ? ` ${unit}` : ""}`}
                </strong>
              </div>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}

export default Home;
