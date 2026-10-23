import "@testing-library/jest-dom/vitest";
import { vi } from "vitest";

vi.mock("@mux/mux-player-react", () => {
  const React = require("react");
  const MockPlayer = (props: Record<string, unknown>) =>
    React.createElement("div", { "data-testid": "mux-player", ...props });
  return { default: MockPlayer };
});
