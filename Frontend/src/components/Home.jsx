import { useEffect, useState } from "react";
import Display from "./Display";
import "../css/home.css";

function Home() {
  const [apiData, setApiData] = useState(null);
  const [weatherData, setWeatherData] = useState(null);

  const [location, setLocation] = useState({
    name: "",
    lat: null,
    long: null,
  });

  const [loading, setLoading] = useState(false);
  const [weatherLoading, setWeatherLoading] = useState(false);
  const [error, setError] = useState("");

  const [openDisplay, setOpenDisplay] = useState(false);

  const getLevel = (value, type) => {
    if (value === null || value === undefined || isNaN(value)) {
      return "normal";
    }

    const number = Number(value);

    if (type === "pm10") {
      if (number <= 50) return "good";
      if (number <= 100) return "moderate";
      return "danger";
    }

    if (type === "pm25") {
      if (number <= 25) return "good";
      if (number <= 50) return "moderate";
      return "danger";
    }

    if (type === "co") {
      if (number <= 4000) return "good";
      if (number <= 10000) return "moderate";
      return "danger";
    }

    if (type === "no2") {
      if (number <= 40) return "good";
      if (number <= 100) return "moderate";
      return "danger";
    }

    if (type === "so2") {
      if (number <= 20) return "good";
      if (number <= 80) return "moderate";
      return "danger";
    }

    if (type === "ozone") {
      if (number <= 100) return "good";
      if (number <= 180) return "moderate";
      return "danger";
    }

    if (type === "europeanAqi") {
      if (number <= 20) return "good";
      if (number <= 40) return "moderate";
      return "danger";
    }

    if (type === "usAqi") {
      if (number <= 50) return "good";
      if (number <= 100) return "moderate";
      return "danger";
    }

    if (type === "uv") {
      if (number <= 2) return "good";
      if (number <= 5) return "moderate";
      return "danger";
    }

    if (type === "ammonia") {
      if (number <= 200) return "good";
      if (number <= 400) return "moderate";
      return "danger";
    }

    if (type === "aod") {
      if (number <= 0.5) return "good";
      if (number <= 1) return "moderate";
      return "danger";
    }

    if (type === "dust") {
      if (number <= 50) return "good";
      if (number <= 100) return "moderate";
      return "danger";
    }

    if (type === "temperature") {
      if (number >= 18 && number <= 30) return "good";
      if (number >= 10 && number <= 35) return "moderate";
      return "danger";
    }

    if (type === "humidity") {
      if (number >= 30 && number <= 60) return "good";
      if (number >= 20 && number <= 70) return "moderate";
      return "danger";
    }

    if (type === "precipitation") {
      if (number <= 2) return "good";
      if (number <= 10) return "moderate";
      return "danger";
    }

    if (type === "wind") {
      if (number <= 20) return "good";
      if (number <= 40) return "moderate";
      return "danger";
    }

    return "normal";
  };

  useEffect(() => {
    const storedUser = localStorage.getItem("user");

    if (!storedUser) {
      setError("User information not found. Please login again.");
      return;
    }

    try {
      const user = JSON.parse(storedUser);

      if (
        user.location_name &&
        user.latitude !== null &&
        user.latitude !== undefined &&
        user.longitude !== null &&
        user.longitude !== undefined
      ) {
        setLocation({
          name: user.location_name,
          lat: Number(user.latitude),
          long: Number(user.longitude),
        });
      } else {
        setError("No saved location found for your account.");
      }
    } catch (error) {
      console.error("Failed to load user:", error);
      setError("Unable to load your saved location.");
    }
  }, []);

  useEffect(() => {
    if (
      location.lat === null ||
      location.long === null ||
      !Number.isFinite(location.lat) ||
      !Number.isFinite(location.long)
    ) {
      return;
    }

    let isMounted = true;
    let refreshTimeout = null;

    const getData = async () => {
      try {
        if (isMounted) {
          setLoading(true);
          setWeatherLoading(true);
          setError("");
        }

        const airQualityUrl =
          `https://air-quality-api.open-meteo.com/v1/air-quality?` +
          `latitude=${location.lat}&` +
          `longitude=${location.long}&` +
          `current=pm10,pm2_5,carbon_monoxide,nitrogen_dioxide,sulphur_dioxide,ozone,european_aqi,us_aqi,uv_index,ammonia,aerosol_optical_depth,dust,alder_pollen,birch_pollen,grass_pollen,mugwort_pollen,olive_pollen,ragweed_pollen`;

        const weatherUrl =
          `https://api.open-meteo.com/v1/forecast?` +
          `latitude=${location.lat}&` +
          `longitude=${location.long}&` +
          `hourly=temperature_2m,relative_humidity_2m,precipitation,wind_speed_10m`;

        const [airResponse, weatherResponse] = await Promise.all([
          fetch(airQualityUrl),
          fetch(weatherUrl),
        ]);

        if (!airResponse.ok) {
          throw new Error("Failed to fetch air quality data");
        }

        if (!weatherResponse.ok) {
          throw new Error("Failed to fetch weather data");
        }

        const airData = await airResponse.json();
        const weatherResult = await weatherResponse.json();

        if (isMounted) {
          setApiData(airData);
          setWeatherData(weatherResult);
        }
      } catch (error) {
        console.error("Data Fetch Error:", error);

        if (isMounted) {
          setApiData(null);
          setWeatherData(null);
          setError("Unable to load air quality and weather data.");
        }
      } finally {
        if (isMounted) {
          setLoading(false);
          setWeatherLoading(false);
        }
      }

      if (isMounted) {
        const now = new Date();

        const tomorrow = new Date(now);
        tomorrow.setDate(now.getDate() + 1);
        tomorrow.setHours(0, 0, 0, 0);

        const millisecondsUntilTomorrow =
          tomorrow.getTime() - now.getTime();

        refreshTimeout = setTimeout(() => {
          getData();
        }, millisecondsUntilTomorrow);
      }
    };

    getData();

    return () => {
      isMounted = false;

      if (refreshTimeout) {
        clearTimeout(refreshTimeout);
      }
    };
  }, [location]);

  const currentWeatherIndex =
    weatherData?.hourly?.time?.length
      ? Math.max(
          0,
          weatherData.hourly.time.findIndex(
            (time) => new Date(time) >= new Date(),
          ),
        )
      : 0;

  const currentWeather =
    weatherData?.hourly?.time?.length
      ? {
          temperature:
            weatherData.hourly.temperature_2m[currentWeatherIndex],
          humidity:
            weatherData.hourly.relative_humidity_2m[currentWeatherIndex],
          precipitation:
            weatherData.hourly.precipitation[currentWeatherIndex],
          windSpeed:
            weatherData.hourly.wind_speed_10m[currentWeatherIndex],
        }
      : null;

  const handleOpenDisplay = () => {
    if (
      !apiData ||
      !weatherData ||
      location.lat === null ||
      location.long === null
    ) {
      return;
    }

    setOpenDisplay(true);
  };

  const handleCloseDisplay = () => {
    setOpenDisplay(false);
  };

  if (openDisplay) {
    return (
      <Display
        displayData={{
          apiData,
          weatherData,
          lat: location.lat,
          long: location.long,
          locationName: location.name,
        }}
        onClose={handleCloseDisplay}
      />
    );
  }

  return (
    <section className="home-section">
      <div className="selected-location-header">
        <h1>{location.name || "Loading location..."}</h1>
      </div>

      {error && (
        <p className="status-message">
          {error}
        </p>
      )}

      <div className="air-quality">
        <h2>Air Quality</h2>

        {loading && (
          <p className="status-message">
            Loading air quality and weather data...
          </p>
        )}

        {!loading && !apiData && !error && (
          <p className="status-message">
            Loading data...
          </p>
        )}

        {apiData && apiData.current && (
          <div className="air-quality-grid">
            <div
              className={`air-quality-card ${getLevel(
                apiData.current.pm10,
                "pm10",
              )}`}
            >
              <p>PM10</p>
              <strong>{apiData.current.pm10}</strong>
            </div>

            <div
              className={`air-quality-card ${getLevel(
                apiData.current.pm2_5,
                "pm25",
              )}`}
            >
              <p>PM2.5</p>
              <strong>{apiData.current.pm2_5}</strong>
            </div>

            <div
              className={`air-quality-card ${getLevel(
                apiData.current.carbon_monoxide,
                "co",
              )}`}
            >
              <p>Carbon Monoxide</p>
              <strong>{apiData.current.carbon_monoxide}</strong>
            </div>

            <div
              className={`air-quality-card ${getLevel(
                apiData.current.nitrogen_dioxide,
                "no2",
              )}`}
            >
              <p>Nitrogen Dioxide</p>
              <strong>{apiData.current.nitrogen_dioxide}</strong>
            </div>

            <div
              className={`air-quality-card ${getLevel(
                apiData.current.sulphur_dioxide,
                "so2",
              )}`}
            >
              <p>Sulphur Dioxide</p>
              <strong>{apiData.current.sulphur_dioxide}</strong>
            </div>

            <div
              className={`air-quality-card ${getLevel(
                apiData.current.ozone,
                "ozone",
              )}`}
            >
              <p>Ozone</p>
              <strong>{apiData.current.ozone}</strong>
            </div>

            <div
              className={`air-quality-card ${getLevel(
                apiData.current.european_aqi,
                "europeanAqi",
              )}`}
            >
              <p>European AQI</p>
              <strong>{apiData.current.european_aqi}</strong>
            </div>

            <div
              className={`air-quality-card ${getLevel(
                apiData.current.us_aqi,
                "usAqi",
              )}`}
            >
              <p>US AQI</p>
              <strong>{apiData.current.us_aqi}</strong>
            </div>

            <div
              className={`air-quality-card ${getLevel(
                apiData.current.uv_index,
                "uv",
              )}`}
            >
              <p>UV Index</p>
              <strong>{apiData.current.uv_index}</strong>
            </div>

            <div
              className={`air-quality-card ${getLevel(
                apiData.current.ammonia,
                "ammonia",
              )}`}
            >
              <p>Ammonia</p>
              <strong>{apiData.current.ammonia ?? "N/A"}</strong>
            </div>

            <div
              className={`air-quality-card ${getLevel(
                apiData.current.aerosol_optical_depth,
                "aod",
              )}`}
            >
              <p>Aerosol Optical Depth</p>
              <strong>
                {apiData.current.aerosol_optical_depth}
              </strong>
            </div>

            <div
              className={`air-quality-card ${getLevel(
                apiData.current.dust,
                "dust",
              )}`}
            >
              <p>Dust</p>
              <strong>{apiData.current.dust}</strong>
            </div>

            {weatherLoading && (
              <div className="air-quality-card normal">
                <p>Weather</p>
                <strong>Loading...</strong>
              </div>
            )}

            {currentWeather && (
              <>
                <div
                  className={`air-quality-card ${getLevel(
                    currentWeather.temperature,
                    "temperature",
                  )}`}
                >
                  <p>Temperature</p>
                  <strong>
                    {currentWeather.temperature} °C
                  </strong>
                </div>

                <div
                  className={`air-quality-card ${getLevel(
                    currentWeather.humidity,
                    "humidity",
                  )}`}
                >
                  <p>Humidity</p>
                  <strong>
                    {currentWeather.humidity} %
                  </strong>
                </div>

                <div
                  className={`air-quality-card ${getLevel(
                    currentWeather.precipitation,
                    "precipitation",
                  )}`}
                >
                  <p>Precipitation</p>
                  <strong>
                    {currentWeather.precipitation} mm
                  </strong>
                </div>

                <div
                  className={`air-quality-card ${getLevel(
                    currentWeather.windSpeed,
                    "wind",
                  )}`}
                >
                  <p>Wind Speed</p>
                  <strong>
                    {currentWeather.windSpeed} km/h
                  </strong>
                </div>
              </>
            )}
          </div>
        )}

        {apiData &&
          weatherData &&
          !loading &&
          !weatherLoading && (
            <button
              className="open-display-btn"
              onClick={handleOpenDisplay}
            >
              Start Display
            </button>
          )}
      </div>
    </section>
  );
}

export default Home;