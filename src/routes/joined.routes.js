import { Router } from "express";
import { getDb } from "../config/db.js";
import { verifyJWT } from "../middleware/verifyJWT.js";
const router = Router();
// GET /joined -> my joined events sorted by event date
router.get("/", verifyJWT, async (req, res) => {
  const db = await getDb();
  const joined = await db
    .collection("joinedEvents")
    .find({ userEmail: req.user.email })
    .sort({ eventDate: 1 })
    .toArray();
  res.json(joined);
});
export default router;