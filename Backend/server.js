import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import helmet from "helmet";

dotenv.config();

const app = express();
const port = process.env.PORT;

app.use(helmet());
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use((req, res) => {
  res.status(404).json({
    message: "Route not found",
  });
});

app.listen(port, () => {
  console.log(`Server running on ${port}`);
});

export default app;