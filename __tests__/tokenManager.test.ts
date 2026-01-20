import { decodeToken, isTokenExpired } from "../services/tokenManager";

// Mock JWT tokens
const validToken =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IkpvaG4gRG9lIiwiaWF0IjoxNTE2MjM5MDIyLCJleHAiOjk5OTk5OTk5OTl9.fake";
const expiredToken =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IkpvaG4gRG9lIiwiaWF0IjoxNTE2MjM5MDIyLCJleHAiOjE2MTYyMzk5OTl9.fake";

describe("tokenManager", () => {
  describe("decodeToken", () => {
    it("should decode a valid JWT", () => {
      const payload = decodeToken(validToken);
      expect(payload).toBeDefined();
      expect(payload?.sub).toBe("1234567890");
      expect(payload?.exp).toBeDefined();
    });

    it("should return null for invalid token format", () => {
      const payload = decodeToken("invalid.token");
      expect(payload).toBeNull();
    });
  });

  describe("isTokenExpired", () => {
    it("should return false for valid token", () => {
      const expired = isTokenExpired(validToken);
      expect(expired).toBe(false);
    });

    it("should return true for expired token", () => {
      const expired = isTokenExpired(expiredToken);
      expect(expired).toBe(true);
    });
  });
});
