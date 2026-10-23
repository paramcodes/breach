import type { Metadata } from "next";
import type { ReactNode } from "react";

export const metadata: Metadata = {
  title: "Watch | Twitch Clone",
};

export default function WatchLayout({ children }: { children: ReactNode }) {
  return (
    <div
      style={{
        minHeight: "100vh",
        background: "#0e0e10",
        color: "#efeff1",
      }}
    >
      {children}
    </div>
  );
}
