import express, { type Express } from "express";
import cors from "cors";

const app: Express = express();

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.get("/", (_req, res) => {
  res.json({
    name: "{{pascalName}} API",
    version: "1.0.0",
    status: "running"
  });
});

export default app;
