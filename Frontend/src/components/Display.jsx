import { useEffect, useRef, useState } from "react";
import "../css/display.css";

function Display({ displayData, onClose }) {
  const displayRef = useRef(null);
  const hideButtonTimer = useRef(null);
  const hasClosed = useRef(false);

  const {
    apiData: passedApiData,
    weatherData,
    locationName,
  } = displayData || {};

  const [apiData, setApiData] = useState(passedApiData || null);
  const [images, setImages] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [showStopButton, setShowStopButton] = useState(false);
  const [loading, setLoading] = useState(true);

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
    setApiData(passedApiData || null);
  }, [passedApiData]);

  useEffect(() => {
    const getImages = async () => {
      try {
        const token = localStorage.getItem("token");

        if (!token) {
          setImages([]);
          return;
        }

        const response = await fetch(
          "http://localhost:5000/api/images/my-images",
          {
            method: "GET",
            headers: {
              Authorization: `Bearer ${token}`,
              "Content-Type": "application/json",
            },
          },
        );

        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.message || "Failed to fetch images");
        }

        if (Array.isArray(data.images)) {
          setImages(data.images);
        } else {
          setImages([]);
        }
      } catch (error) {
        console.error("Image fetch error:", error);
        setImages([]);
      } finally {
        setLoading(false);
      }
    };

    getImages();
  }, []);

  useEffect(() => {
    if (loading || !displayRef.current) {
      return;
    }

    const openFullscreen = async () => {
      try {
        if (!document.fullscreenElement) {
          await displayRef.current.requestFullscreen();
        }

        setIsFullscreen(true);
        setCurrentIndex(0);
      } catch (error) {
        console.error("Fullscreen error:", error);
      }
    };

    openFullscreen();
  }, [loading]);

  useEffect(() => {
    const handleFullscreenChange = () => {
      const fullscreen = Boolean(document.fullscreenElement);

      setIsFullscreen(fullscreen);

      if (!fullscreen && !hasClosed.current) {
        hasClosed.current = true;

        if (hideButtonTimer.current) {
          clearTimeout(hideButtonTimer.current);
        }

        setShowStopButton(false);

        if (onClose) {
          onClose();
        }
      }
    };

    document.addEventListener("fullscreenchange", handleFullscreenChange);

    return () => {
      document.removeEventListener("fullscreenchange", handleFullscreenChange);
    };
  }, [onClose]);

  useEffect(() => {
    return () => {
      if (hideButtonTimer.current) {
        clearTimeout(hideButtonTimer.current);
      }
    };
  }, []);

  const currentWeatherIndex = weatherData?.hourly?.time?.length
    ? Math.max(
        0,
        weatherData.hourly.time.findIndex(
          (time) => new Date(time) >= new Date(),
        ),
      )
    : 0;

  const currentWeather = weatherData?.hourly?.time?.length
    ? {
        temperature: weatherData.hourly.temperature_2m[currentWeatherIndex],
        humidity: weatherData.hourly.relative_humidity_2m[currentWeatherIndex],
        precipitation: weatherData.hourly.precipitation[currentWeatherIndex],
        windSpeed: weatherData.hourly.wind_speed_10m[currentWeatherIndex],
      }
    : null;

  const slides = [];

  if (apiData) {
    slides.push({
      type: "air",
      data: apiData,
    });

    for (let i = 0; i < images.length; i += 3) {
      const imageGroup = images.slice(i, i + 3);

      imageGroup.forEach((image) => {
        slides.push({
          type: "image",
          data: image,
        });
      });

      if (i + 3 < images.length) {
        slides.push({
          type: "air",
          data: apiData,
        });
      }
    }
  }

  useEffect(() => {
    if (!isFullscreen || slides.length <= 1) {
      return;
    }

    const interval = setInterval(() => {
      setCurrentIndex((previousIndex) => {
        return (previousIndex + 1) % slides.length;
      });
    }, 3000);

    return () => {
      clearInterval(interval);
    };
  }, [isFullscreen, slides.length]);

  const showStopButtonTemporarily = () => {
    setShowStopButton(true);

    if (hideButtonTimer.current) {
      clearTimeout(hideButtonTimer.current);
    }

    hideButtonTimer.current = setTimeout(() => {
      setShowStopButton(false);
    }, 3000);
  };

  const stopDisplay = async () => {
    try {
      if (hideButtonTimer.current) {
        clearTimeout(hideButtonTimer.current);
      }

      if (document.fullscreenElement) {
        await document.exitFullscreen();
      } else if (onClose) {
        onClose();
      }
    } catch (error) {
      console.error("Exit fullscreen error:", error);
    }
  };

  if (loading) {
    return null;
  }

  const currentSlide = slides[currentIndex];

  return (
    <div
      ref={displayRef}
      className="display-wrapper"
      onMouseMove={() => {
        if (isFullscreen) {
          showStopButtonTemporarily();
        }
      }}
    >
      {isFullscreen && (
        <div className="display-mode">
          {showStopButton && (
            <button className="stop-display-btn" onClick={stopDisplay}>
              Stop Display
            </button>
          )}

          {currentSlide?.type === "air" && (
            <div className="air-display">
              <h1>Air Quality - {locationName}</h1>

              <div className="parameter-grid">
                <div
                  className={`parameter-card ${getLevel(
                    currentSlide.data.current.pm10,
                    "pm10",
                  )}`}
                >
                  <h3>PM10</h3>
                  <p>{currentSlide.data.current.pm10}</p>
                </div>

                <div
                  className={`parameter-card ${getLevel(
                    currentSlide.data.current.pm2_5,
                    "pm25",
                  )}`}
                >
                  <h3>PM2.5</h3>
                  <p>{currentSlide.data.current.pm2_5}</p>
                </div>

                <div
                  className={`parameter-card ${getLevel(
                    currentSlide.data.current.carbon_monoxide,
                    "co",
                  )}`}
                >
                  <h3>Carbon Monoxide</h3>
                  <p>{currentSlide.data.current.carbon_monoxide}</p>
                </div>

                <div
                  className={`parameter-card ${getLevel(
                    currentSlide.data.current.nitrogen_dioxide,
                    "no2",
                  )}`}
                >
                  <h3>Nitrogen Dioxide</h3>
                  <p>{currentSlide.data.current.nitrogen_dioxide}</p>
                </div>

                <div
                  className={`parameter-card ${getLevel(
                    currentSlide.data.current.sulphur_dioxide,
                    "so2",
                  )}`}
                >
                  <h3>Sulphur Dioxide</h3>
                  <p>{currentSlide.data.current.sulphur_dioxide}</p>
                </div>

                <div
                  className={`parameter-card ${getLevel(
                    currentSlide.data.current.ozone,
                    "ozone",
                  )}`}
                >
                  <h3>Ozone</h3>
                  <p>{currentSlide.data.current.ozone}</p>
                </div>

                <div
                  className={`parameter-card ${getLevel(
                    currentSlide.data.current.european_aqi,
                    "europeanAqi",
                  )}`}
                >
                  <h3>European AQI</h3>
                  <p>{currentSlide.data.current.european_aqi}</p>
                </div>

                <div
                  className={`parameter-card ${getLevel(
                    currentSlide.data.current.us_aqi,
                    "usAqi",
                  )}`}
                >
                  <h3>US AQI</h3>
                  <p>{currentSlide.data.current.us_aqi}</p>
                </div>

                <div
                  className={`parameter-card ${getLevel(
                    currentSlide.data.current.uv_index,
                    "uv",
                  )}`}
                >
                  <h3>UV Index</h3>
                  <p>{currentSlide.data.current.uv_index}</p>
                </div>

                <div
                  className={`parameter-card ${getLevel(
                    currentSlide.data.current.ammonia,
                    "ammonia",
                  )}`}
                >
                  <h3>Ammonia</h3>
                  <p>{currentSlide.data.current.ammonia ?? "N/A"}</p>
                </div>

                <div
                  className={`parameter-card ${getLevel(
                    currentSlide.data.current.aerosol_optical_depth,
                    "aod",
                  )}`}
                >
                  <h3>Aerosol Optical Depth</h3>
                  <p>{currentSlide.data.current.aerosol_optical_depth}</p>
                </div>

                <div
                  className={`parameter-card ${getLevel(
                    currentSlide.data.current.dust,
                    "dust",
                  )}`}
                >
                  <h3>Dust</h3>
                  <p>{currentSlide.data.current.dust}</p>
                </div>

                {currentWeather && (
                  <>
                    <div
                      className={`parameter-card ${getLevel(
                        currentWeather.temperature,
                        "temperature",
                      )}`}
                    >
                      <h3>Temperature</h3>
                      <p>{currentWeather.temperature} °C</p>
                    </div>

                    <div
                      className={`parameter-card ${getLevel(
                        currentWeather.humidity,
                        "humidity",
                      )}`}
                    >
                      <h3>Humidity</h3>
                      <p>{currentWeather.humidity} %</p>
                    </div>

                    <div
                      className={`parameter-card ${getLevel(
                        currentWeather.precipitation,
                        "precipitation",
                      )}`}
                    >
                      <h3>Precipitation</h3>
                      <p>{currentWeather.precipitation} mm</p>
                    </div>

                    <div
                      className={`parameter-card ${getLevel(
                        currentWeather.windSpeed,
                        "wind",
                      )}`}
                    >
                      <h3>Wind Speed</h3>
                      <p>{currentWeather.windSpeed} km/h</p>
                    </div>
                  </>
                )}
              </div>
            </div>
          )}

          {currentSlide?.type === "image" && (
            <div className="image-display">
              <img
                src={currentSlide.data.image_url}
                alt={currentSlide.data.original_name || "Uploaded image"}
                onError={(e) => {
                  console.error(
                    "Image failed to load:",
                    currentSlide.data.image_url,
                  );
                  e.currentTarget.style.display = "none";
                }}
              />
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default Display;
