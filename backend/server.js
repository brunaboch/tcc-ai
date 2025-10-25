import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import uploadRouter from "./routes/upload.js";

dotenv.config();
const app = express();

app.use(cors());
app.use(express.json());

app.use("/uploads", express.static("uploads"));

app.use("/upload", uploadRouter);

app.use(express.static(path.join(process.cwd(), "frontend", "build")));

//Health check
app.get("/health", (_, res) => res.send("OK"));

app.get("*", (req, res) => {
  res.sendFile(path.join(process.cwd(), "frontend", "build", "index.html"));
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));