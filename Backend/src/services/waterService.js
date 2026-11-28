
import fs from "fs/promises";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const waterDataPath = path.join(__dirname, "../data/Water.json");

export const fetchWaterQuality = async (search) => {
  const fileData = await fs.readFile(waterDataPath, "utf-8");

  const waterData = JSON.parse(fileData);

  const searchTerm = search.toLowerCase().trim();

  const filteredData = waterData.filter((item) =>
    [item.station, item.district].some((value) =>
      (value || "").toLowerCase().includes(searchTerm)
    )
  );

  return filteredData;
};
