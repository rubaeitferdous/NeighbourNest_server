import "dotenv/config";
import cors from "cors";
import express from "express";
import eventsRoutes from "./routes/events.routes.js";
import joinedRoutes from "./routes/joined.routes.js";

const app = express();

app.use(cors());
app.use(express.json());

app.get("/health", (_request, response) => {
  response.status(200).json({ status: "ok" });
});

app.use("/events", eventsRoutes);
app.use("/joined", joinedRoutes);

app.use((error, _request, response, _next) => {
  console.error(error);
  response.status(500).json({ message: "Internal server error" });
});

const port = process.env.PORT || 3000;

app.listen(port, () => {
  console.log(`Server listening on port ${port}`);
});

export default app;