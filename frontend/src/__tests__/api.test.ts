import { describe, it, expect, vi, beforeEach } from "vitest";

// Mock fetch globally
const mockFetch = vi.fn();
vi.stubGlobal("fetch", mockFetch);

describe("API Client", () => {
  beforeEach(() => {
    mockFetch.mockReset();
  });

  it("submitFeedback should call /api/submissions", async () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({
        id: "abc",
        name: "x",
        email: "x@example.com",
        message: "x",
        status: "pending",
        reviewer_notes: null,
        created_at: "2026-01-01T00:00:00Z",
        updated_at: "2026-01-01T00:00:00Z",
      }),
    });

    const { submitFeedback } = await import("@/lib/api");
    const result = await submitFeedback({
      name: "x",
      email: "x@example.com",
      message: "x",
    });

    expect(mockFetch).toHaveBeenCalledWith(
      expect.stringContaining("/api/submissions"),
      expect.objectContaining({ method: "POST" }),
    );
    expect(result.status).toBe("pending");
  });

  it("should throw on API error", async () => {
    mockFetch.mockResolvedValueOnce({
      ok: false,
      status: 404,
      json: async () => ({ detail: "Not found" }),
    });

    const { listSubmissions } = await import("@/lib/api");
    await expect(listSubmissions()).rejects.toThrow("Not found");
  });

  it("login should call auth endpoint", async () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({ message: "Login successful" }),
    });

    const { login } = await import("@/lib/api");
    const result = await login("admin@example.com", "password");

    expect(mockFetch).toHaveBeenCalledWith(
      expect.stringContaining("/api/auth/login"),
      expect.objectContaining({ method: "POST" }),
    );
    expect(result.message).toBe("Login successful");
  });
});
