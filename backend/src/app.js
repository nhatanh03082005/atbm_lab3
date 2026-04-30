import express from "express";
import cors from "cors";
import classRoutes from "./routes/class.routers.js";
import authRoutes from "./routes/auth.routers.js";
import studentRoutes from "./routes/student.routers.js";
import scoreRoutes from "./routes/score.routers.js";

const app = express();

app.use(cors());
app.use(express.json());

app.use("/auth", authRoutes);
app.use("/classes", classRoutes);
app.use("/students", studentRoutes);
app.use("/scores", scoreRoutes);

export default app;
