import { describe, expect, it } from "vitest";
import { isSafeHttpUrl } from "./safe-url";

describe("isSafeHttpUrl", () => {
  it.each(["https://app.geotracking.dk/overview", "http://localhost:3000/"])(
    "accepts %s",
    (value) => {
      expect(isSafeHttpUrl(value)).toBe(true);
    },
  );

  it.each([
    "javascript:alert(1)",
    "JavaScript:alert(1)",
    "data:text/html,<script>alert(1)</script>",
    "/overview",
    "not a url",
    "",
  ])("rejects %s", (value) => {
    expect(isSafeHttpUrl(value)).toBe(false);
  });
});
