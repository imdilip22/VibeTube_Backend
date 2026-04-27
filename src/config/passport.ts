import passport from "passport";
import { Strategy as JwtStrategy, ExtractJwt, StrategyOptionsWithoutRequest } from "passport-jwt";
import { Strategy as GoogleStrategy } from "passport-google-oauth20";
import { User, RefreshToken } from "../models";
import { getRefreshTokenExpiry } from "../utils/jwt.utils";
import { generateAccessToken, generateRefreshToken } from "../utils/jwt.utils";

const ACCESS_SECRET = process.env.JWT_ACCESS_SECRET ?? "access_secret_fallback";

// ─── Extract JWT from httpOnly cookie ────────────────────────────────────────
const cookieExtractor = (req: any): string | null => {
  return req?.cookies?.accessToken ?? null;
};

// ─── JWT Strategy ─────────────────────────────────────────────────────────────
// Used by authMiddleware — verifies the access token on every protected route.
const jwtOptions: StrategyOptionsWithoutRequest = {
  jwtFromRequest: ExtractJwt.fromExtractors([cookieExtractor]),
  secretOrKey: ACCESS_SECRET,
};

passport.use(
  "jwt",
  new JwtStrategy(jwtOptions, async (payload, done) => {
    try {
      // payload contains { email, iat, exp }
      // We trust it if passport-jwt verified the signature + expiry
      return done(null, { email: payload.email });
    } catch (err) {
      return done(err, false);
    }
  })
);

// ─── Google OAuth2 Strategy ───────────────────────────────────────────────────
// Authorization Code flow — backend handles the full redirect cycle.
passport.use(
  "google",
  new GoogleStrategy(
    {
      clientID: process.env.GOOGLE_CLIENT_ID ?? "",
      clientSecret: process.env.GOOGLE_CLIENT_SECRET ?? "",
      callbackURL: process.env.GOOGLE_CALLBACK_URL ?? "http://localhost:3000/api/v1/auth/google/callback",
      scope: ["email", "profile"],
    },
    async (_accessToken, _refreshToken, profile, done) => {
      try {
        const email = profile.emails?.[0]?.value;
        const name = profile.displayName ?? profile.emails?.[0]?.value?.split("@")[0];
        const googleId = profile.id;

        if (!email) {
          return done(new Error("No email returned from Google"), undefined);
        }

        // Upsert user
        let user = await User.findOne({ where: { email } });
        if (user) {
          const updates: Record<string, any> = {};
          if (!user.googleId) updates.googleId = googleId;
          if (name && user.name === "User") updates.name = name;
          if (Object.keys(updates).length > 0) await user.update(updates);
        } else {
          user = await User.create({
            email,
            name: name ?? email.split("@")[0],
            password: null,
            googleId,
          });
        }

        // Issue our JWT pair
        const jwtPayload = { email: user.email };
        const accessToken = generateAccessToken(jwtPayload);
        const refreshToken = generateRefreshToken(jwtPayload);

        await RefreshToken.create({
          userEmail: user.email,
          token: refreshToken,
          expiresAt: getRefreshTokenExpiry(),
          revoked: false,
        });

        return done(null, { email: user.email, name: user.name, accessToken, refreshToken });
      } catch (err) {
        return done(err as Error, undefined);
      }
    }
  )
);

export default passport;
