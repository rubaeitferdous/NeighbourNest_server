import "dotenv/config";
import express from "express";
import cors from "cors";
import eventsRoutes from "./routes/events.routes.js";
import joinedRoutes from "./routes/joined.routes.js";
const app = express();
const allowedOrigins = new Set(
  [process.env.CLIENT_URL, "https://neighbournest-eight.vercel.app"]
    .filter(Boolean)
    .map((origin) => origin.replace(/\/+$/, ""))
);
app.use(cors({
  origin(origin, callback) {
    callback(null, !origin || allowedOrigins.has(origin.replace(/\/+$/, "")));
  },
}));
app.use(express.json());
app.get("/", (req, res) => res.send("Community Events API is running"));
app.use("/events", eventsRoutes);
app.use("/joined", joinedRoutes);
app.use((err, req, res, next) => {
  console.error(err);
  res.status(500).json({ message: "Something went wrong on the server" });
});
if (process.env.NODE_ENV !== "production") {
  const port = process.env.PORT || 5000;
  app.listen(port, () => console.log(`API running on http://localhost:${port}`));
}
export default app; // Vercel uses this export
