import { Router } from "express";
import { ObjectId } from "mongodb";
import { getDb } from "../config/db.js";
import { verifyJWT } from "../middleware/verifyJWT.js";
const router = Router();
const escapeRegex = (s) => s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
function validateEvent(body) {
  const { title, description, eventType, thumbnail, location, eventDate } = body;
  if (!title || !description || !eventType || !thumbnail || !location || !eventDate) {
    return "All fields are required";
  }
  const date = new Date(eventDate);
  if (isNaN(date.getTime())) return "Invalid date";
  if (date <= new Date()) return "Event date must be in the future";
  return null;
}
// GET /events?limit=6&type=Cleanup&search=winter (public, upcoming only)
router.get("/", async (req, res) => {
  const db = await getDb();
  const { limit = 0, type, search } = req.query;
  const query = { eventDate: { $gte: new Date() } };
  if (type) query.eventType = type;
  if (search) query.title = { $regex: escapeRegex(search), $options: "i" };
  const events = await db
    .collection("events")
    .find(query)
    .sort({ eventDate: 1 })
    .limit(Number(limit))
    .toArray();
  res.json(events);
});
// GET /events/mine (must come BEFORE "/:id")
router.get("/mine", verifyJWT, async (req, res) => {
  const db = await getDb();
  const events = await db
    .collection("events")
    .find({ creatorEmail: req.user.email })
    .sort({ eventDate: 1 })
    .toArray();
  res.json(events);
});
// GET /events/:id (public)
router.get("/:id", async (req, res) => {
  if (!ObjectId.isValid(req.params.id)) {
    return res.status(400).json({ message: "Invalid event id" });
  }
  const db = await getDb();
  const event = await db
    .collection("events")
    .findOne({ _id: new ObjectId(req.params.id) });
  if (!event) return res.status(404).json({ message: "Event not found" });
  res.json(event);
});
// POST /events (JWT)
router.post("/", verifyJWT, async (req, res) => {
  const error = validateEvent(req.body);
  if (error) return res.status(400).json({ message: error });
  const { title, description, eventType, thumbnail, location, eventDate } = req.body;
  const doc = {
    title,
    description,
    eventType,
    thumbnail,
    location,
    eventDate: new Date(eventDate),
    creatorEmail: req.user.email, // from the token, never from the body
    creatorName: req.user.name,
    createdAt: new Date(),
  };
  const db = await getDb();
  const result = await db.collection("events").insertOne(doc);
  res.status(201).json({ insertedId: result.insertedId });
});
// PUT /events/:id (JWT, owner only)
router.put("/:id", verifyJWT, async (req, res) => {
  const error = validateEvent(req.body);
  if (error) return res.status(400).json({ message: error });
  const { title, description, eventType, thumbnail, location, eventDate } = req.body;
  const db = await getDb();
  const result = await db.collection("events").updateOne(
    { _id: new ObjectId(req.params.id), creatorEmail: req.user.email },
    {
      $set: {
        title, description, eventType, thumbnail, location,
        eventDate: new Date(eventDate),
      },
    }
  );
  if (result.matchedCount === 0) {
    return res.status(403).json({ message: "You can only edit your own events" });
  }
  res.json({ message: "Event updated" });
});
// DELETE /events/:id (JWT, owner only)
router.delete("/:id", verifyJWT, async (req, res) => {
  const db = await getDb();
  const result = await db.collection("events").deleteOne({
    _id: new ObjectId(req.params.id),
    creatorEmail: req.user.email,
  });
  if (result.deletedCount === 0) {
    return res.status(403).json({ message: "You can only delete your own events" });
  }
  res.json({ message: "Event deleted" });
});
// POST /events/:id/join (JWT)
router.post("/:id/join", verifyJWT, async (req, res) => {
  const db = await getDb();
  const event = await db
    .collection("events")
    .findOne({ _id: new ObjectId(req.params.id) });
  if (!event) return res.status(404).json({ message: "Event not found" });
  if (event.eventDate < new Date()) {
    return res.status(400).json({ message: "This event has already passed" });
  }
  try {
    await db.collection("joinedEvents").insertOne({
      eventId: String(event._id),
      userEmail: req.user.email,
      userName: req.user.name,
      title: event.title,
      thumbnail: event.thumbnail,
      location: event.location,
      eventType: event.eventType,
      eventDate: event.eventDate,
      joinedAt: new Date(),
    });
    res.status(201).json({ message: "Joined successfully" });
  } catch (err) {
    if (err.code === 11000) {
      return res.status(409).json({ message: "You already joined this event" });
    }
    throw err;
  }
});
export default router;