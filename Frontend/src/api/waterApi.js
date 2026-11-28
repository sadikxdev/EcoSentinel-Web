
const API_URL = "http://localhost:5000/api/water";

export const getWaterQuality = async (search) => {
  const params = new URLSearchParams({
    search,
  });

  const response = await fetch(`${API_URL}?${params}`);

  if (!response.ok) {
    throw new Error("Failed to fetch water quality data");
  }

  const result = await response.json();

  return result.data;
};
