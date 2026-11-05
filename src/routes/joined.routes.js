import { Router } from "express";
import { connectDB } from "../config/db.js";
import { verifyJWT } from "../middleware/verifyJWT.js";

const router = Router();

router.get("/", verifyJWT, async (request, response) => {
  const db = await connectDB();
  const events = await db
    .collection("joinedEvents")
    .find({ userEmail: request.user.email })
    .sort({ eventDate: 1 })
    .toArray();

  return response.json(events);
});

export default router;