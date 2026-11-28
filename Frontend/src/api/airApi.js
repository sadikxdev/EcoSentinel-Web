
const API_URL = "http://localhost:5000/api/air";

export const getAirQuality = async (latitude, longitude) => {
  const params = new URLSearchParams({
    latitude,
    longitude,
  });

  const response = await fetch(`${API_URL}?${params}`);

  if (!response.ok) {
    throw new Error("Failed to fetch air quality data");
  }

  const result = await response.json();

  return result.data;
};
