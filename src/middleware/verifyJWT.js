import { createRemoteJWKSet, errors, jwtVerify } from "jose";

let jwksUrl;
let jwks;

const invalidTokenCodes = new Set([
  "ERR_JWT_CLAIM_VALIDATION_FAILED",
  "ERR_JWT_EXPIRED",
  "ERR_JWT_INVALID",
  "ERR_JWS_INVALID",
  "ERR_JWS_SIGNATURE_VERIFICATION_FAILED",
  "ERR_JWKS_INVALID",
  "ERR_JWKS_NO_MATCHING_KEY",
  "ERR_JWKS_MULTIPLE_MATCHING_KEYS",
]);

export async function verifyJWT(request, response, next) {
  const authorization = request.get("authorization");
  const match = authorization?.match(/^Bearer\s+(\S+)$/i);

  if (!match) {
    return response.status(401).json({ message: "A bearer token is required" });
  }

  const clientUrl = process.env.CLIENT_URL;
  if (!clientUrl) {
    return next(new Error("CLIENT_URL is not configured"));
  }

  try {
    const currentJwksUrl = new URL("/api/auth/jwks", clientUrl).href;
    if (jwksUrl !== currentJwksUrl) {
      jwksUrl = currentJwksUrl;
      jwks = createRemoteJWKSet(new URL(currentJwksUrl));
    }

    const { payload } = await jwtVerify(match[1], jwks);
    if (
      typeof payload.sub !== "string" ||
      typeof payload.email !== "string" ||
      !payload.email
    ) {
      return response.status(401).json({ message: "Token is missing user identity" });
    }

    request.user = {
      id: payload.sub,
      email: payload.email,
      name: typeof payload.name === "string" ? payload.name : "",
    };

    return next();
  } catch (error) {
    if (error instanceof errors.JOSEError && invalidTokenCodes.has(error.code)) {
      return response.status(401).json({ message: "Invalid or expired token" });
    }

    return next(error);
  }
}