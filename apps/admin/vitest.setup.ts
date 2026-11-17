import { afterEach } from "vitest";
import { cleanup } from "@testing-library/react";

// Without Vitest globals, Testing Library does not unmount between tests on its own.
afterEach(() => {
  cleanup();
});
