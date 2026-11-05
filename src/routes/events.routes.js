import { Router } from "express";
import { ObjectId } from "mongodb";
import { connectDB } from "../config/db.js";
import { verifyJWT } from "../middleware/verifyJWT.js";

const router = Router();
const eventFields = [
  "title",
  "description",
  "eventType",
  "thumbnail",
  "location",
  "eventDate",
];
let joinIndexPromise;

function validateEvent(body) {
  if (!body || typeof body !== "object" || Array.isArray(body)) {
    return { error: "Request body must be an object" };
  }

  for (const field of eventFields) {
    if (typeof body[field] !== "string" || !body[field].trim()) {
      return { error: `${field} is required` };
    }
  }

  const eventDate = new Date(body.eventDate);
  if (Number.isNaN(eventDate.getTime())) {
    return { error: "eventDate must be a valid date" };
  }
  if (eventDate <= new Date()) {
    return { error: "Event date must be in the future" };
  }

  try {
    new URL(body.thumbnail);
  } catch {
    return { error: "thumbnail must be a valid URL" };
  }

  return {
    event: {
      title: body.title.trim(),
      description: body.description.trim(),
      eventType: body.eventType.trim(),
      thumbnail: body.thumbnail.trim(),
      location: body.location.trim(),
      eventDate,
    },
  };
}

function validId(id) {
  return ObjectId.isValid(id) && new ObjectId(id).toString() === id;
}

async function ensureJoinIndex(collection) {
  if (!joinIndexPromise) {
    joinIndexPromise = collection
      .createIndex({ eventId: 1, userEmail: 1 }, { unique: true })
      .catch((error) => {
        joinIndexPromise = undefined;
        throw error;
      });
  }

  await joinIndexPromise;
}

router.get("/", async (request, response) => {
  const db = await connectDB();
  const query = { eventDate: { $gte: new Date() } };
  const { type, search } = request.query;

  if (typeof type === "string" && type) {
    query.eventType = type;
  }
  if (typeof search === "string" && search) {
    const escapedSearch = search.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
    query.title = { $regex: escapedSearch, $options: "i" };
  }

  const requestedLimit = Number(request.query.limit);
  const limit =
    Number.isInteger(requestedLimit) && requestedLimit > 0
      ? Math.min(requestedLimit, 100)
      : 100;
  const events = await db
    .collection("events")
    .find(query)
    .sort({ eventDate: 1 })
    .limit(limit)
    .toArray();

  return response.json(events);
});

router.get("/mine", verifyJWT, async (request, response) => {
  const db = await connectDB();
  const events = await db
    .collection("events")
    .find({ creatorEmail: request.user.email })
    .sort({ eventDate: 1 })
    .toArray();

  return response.json(events);
});

router.get("/:id", async (request, response) => {
  if (!validId(request.params.id)) {
    return response.status(400).json({ message: "Invalid event id" });
  }

  const db = await connectDB();
  const event = await db
    .collection("events")
    .findOne({ _id: new ObjectId(request.params.id) });

  if (!event) {
    return response.status(404).json({ message: "Event not found" });
  }

  return response.json(event);
});

router.post("/", verifyJWT, async (request, response) => {
  const validation = validateEvent(request.body);
  if (validation.error) {
    return response.status(400).json({ message: validation.error });
  }

  const db = await connectDB();
  const event = {
    ...validation.event,
    creatorEmail: request.user.email,
    creatorName: request.user.name,
    createdAt: new Date(),
  };
  const result = await db.collection("events").insertOne(event);

  return response.status(201).json({ insertedId: result.insertedId });
});

router.put("/:id", verifyJWT, async (request, response) => {
  if (!validId(request.params.id)) {
    return response.status(400).json({ message: "Invalid event id" });
  }

  const validation = validateEvent(request.body);
  if (validation.error) {
    return response.status(400).json({ message: validation.error });
  }

  const db = await connectDB();
  const result = await db.collection("events").updateOne(
    {
      _id: new ObjectId(request.params.id),
      creatorEmail: request.user.email,
    },
    { $set: validation.event },
  );

  if (result.matchedCount === 0) {
    return response.status(404).json({ message: "Event not found" });
  }

  return response.json({ message: "Event updated" });
});

router.delete("/:id", verifyJWT, async (request, response) => {
  if (!validId(request.params.id)) {
    return response.status(400).json({ message: "Invalid event id" });
  }

  const db = await connectDB();
  const result = await db.collection("events").deleteOne({
    _id: new ObjectId(request.params.id),
    creatorEmail: request.user.email,
  });

  if (result.deletedCount === 0) {
    return response.status(404).json({ message: "Event not found" });
  }

  return response.json({ message: "Event deleted" });
});

router.post("/:id/join", verifyJWT, async (request, response) => {
  if (!validId(request.params.id)) {
    return response.status(400).json({ message: "Invalid event id" });
  }

  const db = await connectDB();
  const event = await db
    .collection("events")
    .findOne({ _id: new ObjectId(request.params.id) });

  if (!event) {
    return response.status(404).json({ message: "Event not found" });
  }
  if (!(event.eventDate instanceof Date) || event.eventDate <= new Date()) {
    return response.status(400).json({ message: "This event is no longer upcoming" });
  }

  const joinedEvents = db.collection("joinedEvents");
  await ensureJoinIndex(joinedEvents);

  try {
    await joinedEvents.insertOne({
      eventId: String(event._id),
      userEmail: request.user.email,
      userName: request.user.name,
      title: event.title,
      thumbnail: event.thumbnail,
      location: event.location,
      eventType: event.eventType,
      eventDate: event.eventDate,
      joinedAt: new Date(),
    });
  } catch (error) {
    if (error.code === 11000) {
      return response.status(409).json({ message: "You already joined this event" });
    }
    throw error;
  }

  return response.status(201).json({ message: "Joined successfully" });
});

export default router;