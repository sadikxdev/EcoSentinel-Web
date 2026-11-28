import { useEffect, useState } from "react";
import locations from "../Data/Air.json";
import { getAirQuality } from "../api/airApi";
import "../css/air.css";

const airFields = [
  ["PM2.5", "pm2_5", "µg/m³"],
  ["PM10", "pm10", "µg/m³"],
  ["Carbon Monoxide", "carbon_monoxide", "µg/m³"],
  ["Nitrogen Dioxide", "nitrogen_dioxide", "µg/m³"],
  ["Sulphur Dioxide", "sulphur_dioxide", "µg/m³"],
  ["Ozone", "ozone", "µg/m³"],
  ["European AQI", "european_aqi", ""],
  ["US AQI", "us_aqi", ""],
  ["UV Index", "uv_index", ""],
  ["Ammonia", "ammonia", "µg/m³"],
  ["Aerosol Optical Depth", "aerosol_optical_depth", ""],
  ["Dust", "dust", "µg/m³"],
];

const weatherFields = [
  ["Temperature", "temperature_2m", "°C"],
  ["Humidity", "relative_humidity_2m", "%"],
  ["Precipitation", "precipitation", "mm"],
  ["Wind Speed", "wind_speed_10m", "km/h"],
];

const getLevel = (value, key) => {
  if (value == null || !Number.isFinite(Number(value))) return "normal";

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

  const ranges = {
    pm2_5: [25, 50],
    pm10: [50, 100],
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

  const range = ranges[key];

  if (!range) return "normal";
  if (number <= range[0]) return "good";
  if (number <= range[1]) return "moderate";

  return "danger";
};

function Air() {
  const [location, setLocation] = useState(null);
  const [search, setSearch] = useState("");
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [airData, setAirData] = useState(null);
  const [weatherData, setWeatherData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const filteredLocations = search.trim()
    ? locations
        .filter((item) =>
          item.loc.toLowerCase().includes(search.trim().toLowerCase()),
        )
        .slice(0, 8)
    : [];

  useEffect(() => {
    if (!location) return;

    let ignore = false;

    const fetchData = async () => {
      setLoading(true);
      setError("");

      try {
        const result = await getAirQuality(location.lat, location.long);

        if (ignore) return;

        setAirData(result.air);
        setWeatherData(result.weather);
      } catch (err) {
        if (ignore) return;

        setAirData(null);
        setWeatherData(null);

        setError(
          "Unable to load environmental data. Check your internet connection.",
        );
      } finally {
        if (!ignore) {
          setLoading(false);
        }
      }
    };

    setAirData(null);
    setWeatherData(null);

    fetchData();

    return () => {
      ignore = true;
    };
  }, [location]);

  const selectLocation = (item) => {
    if (
      !Number.isFinite(Number(item.lat)) ||
      !Number.isFinite(Number(item.long))
    ) {
      setError("Invalid location coordinates.");
      return;
    }

    setLocation({
      name: item.loc,
      lat: Number(item.lat),
      long: Number(item.long),
    });

    setSearch("");
    setShowSuggestions(false);
    setError("");
  };

  const handleSearch = (e) => {
    e.preventDefault();

    const found = locations.find(
      (item) => item.loc.toLowerCase() === search.trim().toLowerCase(),
    );

    if (!found) {
      setError("Please select a valid location.");
      return;
    }

    selectLocation(found);
  };

  const renderCards = (fields, data) =>
    fields.map(([label, key, unit]) => {
      const value = data?.[key];

      return (
        <div className={`air-card ${getLevel(value, key)}`} key={key}>
          <span className="air-card-label">{label}</span>
          <strong className="air-card-value">
            {value == null ? "N/A" : `${value}${unit ? ` ${unit}` : ""}`}
          </strong>
          <span className="air-card-status">
            {value == null ? "Unavailable" : getLevel(value, key)}
          </span>
        </div>
      );
    });

  return (
    <main className="air-page">
      <section className="air-hero">
        <div className="air-hero-content">
          <span className="air-eyebrow">
            ECOSENTINEL · ENVIRONMENTAL MONITORING
          </span>
          <h1>Air Quality</h1>
          <p>
            Monitor air pollution and atmospheric conditions to understand the
            air around you.
          </p>
        </div>
        <div className="air-hero-decoration" />
      </section>

      <section className="air-search-panel">
        <form className="air-search-form" onSubmit={handleSearch}>
          <div className="air-search-wrapper">
            <input
              type="text"
              value={search}
              placeholder="Search city or location..."
              autoComplete="off"
              aria-label="Search air quality location"
              onChange={(e) => {
                setSearch(e.target.value);
                setShowSuggestions(true);
              }}
              onFocus={() => setShowSuggestions(true)}
            />

            {showSuggestions && search.trim() && (
              <div className="air-suggestions">
                {filteredLocations.length ? (
                  filteredLocations.map((item, index) => (
                    <button
                      type="button"
                      className="air-suggestion"
                      key={`${item.loc}-${index}`}
                      onClick={() => selectLocation(item)}
                    >
                      {item.loc}
                    </button>
                  ))
                ) : (
                  <p className="air-no-results">No matching locations found</p>
                )}
              </div>
            )}
          </div>

          <button className="air-search-button" type="submit">
            Search Location
          </button>
        </form>
      </section>

      <section className="air-location">
        <div className="air-location-info">
          <span className="air-location-label">MONITORING LOCATION</span>
          <h2>{location?.name || "Select a location"}</h2>
        </div>
        {location && (
          <div className="air-coordinate">
            <span>Latitude</span>
            <strong>{location.lat}</strong>
            <span>Longitude</span>
            <strong>{location.long}</strong>
          </div>
        )}
      </section>

      {error && <div className="air-message error">{error}</div>}

      {loading && (
        <div className="air-message loading">
          Loading air quality and weather data...
        </div>
      )}

      {!location && !loading && (
        <div className="air-empty-state">
          <div className="air-empty-icon">🌿</div>
          <h3>Select a location</h3>
          <p>
            Search for a location to view its recorded air quality and weather
            information.
          </p>
        </div>
      )}

      {!loading && airData && (
        <>
          <section className="air-section">
            <div className="air-section-heading">
              <div>
                <span className="air-section-tag">ATMOSPHERE</span>
                <h2>Air Pollution</h2>
                <p>Pollutants and air quality indicators</p>
              </div>
            </div>

            <div className="air-grid">{renderCards(airFields, airData)}</div>
          </section>

          <section className="air-section weather-section">
            <div className="air-section-heading">
              <div>
                <span className="air-section-tag">WEATHER</span>
                <h2>Weather Conditions</h2>
                <p>Current atmospheric weather measurements</p>
              </div>
            </div>

            <div className="air-grid weather-grid">
              {renderCards(weatherFields, weatherData)}
            </div>
          </section>
        </>
      )}
    </main>
  );
}

export default Air;
