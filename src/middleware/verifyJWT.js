import { createRemoteJWKSet, jwtVerify } from "jose";
// The Next.js app (BetterAuth jwt plugin) publishes its public keys here.
const clientUrl = process.env.CLIENT_URL;
if (!clientUrl) {
  throw new Error("CLIENT_URL must be configured before verifying JWTs");
}
const JWKS = createRemoteJWKSet(
  new URL("/api/auth/jwks", clientUrl)
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
    console.error("JWT verification failed", {
      name: err?.name,
      code: err?.code,
      message: err?.message,
    });
    return res.status(403).json({ message: "Invalid or expired token" });
  }
}