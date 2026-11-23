import { useState } from "react";
import locations from "../Data/Water.json";
import "../css/water.css";

const waterFields = [
  ["pH", "ph", ""],
  ["Dissolved Oxygen", "dissolvedOxygen", "mg/L"],
  ["Total Dissolved Solids", "tds", "mg/L"],
  ["Chloride", "chloride", "mg/L"],
  ["Nitrate Nitrogen", "nitrateNitrogen", "mg/L"],
  ["Total Hardness", "totalHardness", "mg/L"],
  ["Calcium Hardness", "calciumHardness", "mg/L"],
  ["Magnesium Hardness", "magnesiumHardness", "mg/L"],
  ["Iron", "iron", "mg/L"],
  ["Cadmium", "cadmium", "mg/L"],
  ["Chromium", "chromium", "mg/L"],
  ["Lead", "lead", "mg/L"],
  ["Mercury", "mercury", "mg/L"],
  ["Zinc", "zinc", "mg/L"],
];

const parseDate = (dateString) => {
  if (!dateString) return 0;

  const [datePart] = dateString.split(" ");
  const [day, month, year] = datePart.split("-");

  return new Date(Number(year), Number(month) - 1, Number(day)).getTime();
};

function Water() {
  const [search, setSearch] = useState("");
  const [location, setLocation] = useState(null);
  const [showSuggestions, setShowSuggestions] = useState(false);

  const uniqueLocations = Array.from(
    new Map(locations.map((item) => [item.station, item])).values(),
  );

  const filteredLocations = search.trim()
    ? uniqueLocations
        .filter((item) =>
          [item.station, item.district].some((value) =>
            (value || "").toLowerCase().includes(search.trim().toLowerCase()),
          ),
        )
        .slice(0, 8)
    : [];

  const getLatestRecord = (stationName) => {
    const records = locations
      .filter((item) => item.station === stationName)
      .sort((a, b) => parseDate(b.sampleDate) - parseDate(a.sampleDate));

    return records[0] || null;
  };

  const selectLocation = (stationName) => {
    const latestRecord = getLatestRecord(stationName);

    if (latestRecord) {
      setLocation(latestRecord);
      setSearch("");
      setShowSuggestions(false);
    }
  };

  const handleSearch = (e) => {
    e.preventDefault();

    const found = uniqueLocations.find(
      (item) => item.station.toLowerCase() === search.trim().toLowerCase(),
    );

    if (found) {
      selectLocation(found.station);
    }
  };

  return (
    <section className="water-section">
      <div className="water-location-header">
        <div>
          <span className="water-header-label">WATER MONITORING</span>

          <h1>Water Quality Monitoring</h1>

          <p>Explore water quality monitoring stations</p>
        </div>
      </div>

      <div className="water-search-container">
        <form className="water-search-form" onSubmit={handleSearch}>
          <div className="water-search-wrapper">
            <input
              type="text"
              value={search}
              placeholder="Search water station or district..."
              autoComplete="off"
              aria-label="Search water station"
              onChange={(e) => {
                setSearch(e.target.value);
                setShowSuggestions(true);
              }}
              onFocus={() => setShowSuggestions(true)}
            />

            {showSuggestions && search.trim() && (
              <div className="water-suggestions">
                {filteredLocations.length > 0 ? (
                  filteredLocations.map((item) => (
                    <button
                      type="button"
                      className="water-suggestion-item"
                      key={item.station}
                      onClick={() => selectLocation(item.station)}
                    >
                      <span>{item.station}</span>

                      <small>{item.district || "Unknown district"}</small>
                    </button>
                  ))
                ) : (
                  <p className="water-no-results">
                    No matching water stations found
                  </p>
                )}
              </div>
            )}
          </div>

          <button type="submit" className="water-search-btn">
            Search
          </button>
        </form>
      </div>

      <div className="water-location">
        <div className="water-location-info">
          <span className="water-location-label">MONITORING LOCATION</span>
          <h2>{location?.station || "Select a location"}</h2>
        </div>

        {location && (
          <div className="water-location-details">
            <span>District</span>
            <strong>{location.district || "N/A"}</strong>

            <span>Agency</span>
            <strong>{location.agency || "N/A"}</strong>

            <span>Sample Date</span>
            <strong>{location.sampleDate || "N/A"}</strong>
          </div>
        )}
      </div>

      <div className="water-monitoring-panel">
        <div className="water-panel-heading">
          <div>
            <span className="water-panel-label">WATER ANALYSIS</span>

            <h2>Water Quality Parameters</h2>
          </div>
        </div>

        {!location ? (
          <div className="water-empty-state">
            <div className="water-empty-icon">🌊</div>

            <h3>Select a water station</h3>

            <p>
              Search for a water monitoring station to view its recorded water
              quality measurements.
            </p>
          </div>
        ) : (
          <>
            <div className="water-quality-grid">
              {waterFields.map(([label, key, unit]) => {
                const value = location[key];

                return (
                  <div className="water-quality-card" key={key}>
                    <p>{label}</p>

                    <strong>
                      {value != null
                        ? `${value}${unit ? ` ${unit}` : ""}`
                        : "Unavailable"}
                    </strong>

                    <span className="water-card-status">
                      {value != null
                        ? "Recorded measurement"
                        : "Data unavailable"}
                    </span>
                  </div>
                );
              })}
            </div>
          </>
        )}
      </div>
    </section>
  );
}

export default Water;
