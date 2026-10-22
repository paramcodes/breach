import { colors, radii } from "@/shared/design-tokens/tokens";
import { Button } from "@/shared/ui/button";

import { ThemeToggle } from "./theme-toggle";

export default function Home() {
  return (
    <main style={{ padding: "24px" }}>
      <section
        style={{
          background: colors.cta,
          color: "#ffffff",
          borderRadius: radii.card,
          padding: "24px",
          marginBottom: "16px",
        }}
      >
        <h1>Orange community</h1>
        <p>Live streams, chat, and creators.</p>
        <Button variant="secondary" style={{ color: "#ffffff", borderColor: "#ffffff" }}>
          Sign Up
        </Button>
      </section>
      <ThemeToggle />
    </main>
  );
}
