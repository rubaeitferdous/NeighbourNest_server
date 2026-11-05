import { createRemoteJWKSet, jwtVerify } from "jose";
// The Next.js app (BetterAuth jwt plugin) publishes its public keys here.
const JWKS = createRemoteJWKSet(
  new URL(`${process.env.CLIENT_URL}/api/auth/jwks`)
);
export async function verifyJWT(req, res, next) {
  const header = req.headers.authorization || "";
  const token = header.startsWith("Bearer ") ? header.slice(7) : null;
  if (!token) {
    return res.status(401).json({ message: "Login required: token missing" });
  }
  try {
    const { payload } = await jwtVerify(token, JWKS);
    req.user = payload; // contains id, email, name
    next();
  } catch (err) {
    return res.status(403).json({ message: "Invalid or expired token" });
  }
}