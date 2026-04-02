import type { CapacitorConfig } from "@capacitor/cli";

const config: CapacitorConfig = {
  appId: "com.focuspomomi.app",
  appName: "FocusPomomi",
  // webDir is required by Capacitor but unused when server.url is set
  webDir: "out",
  server: {
    // ── Development ──────────────────────────────────────────────────────────
    // Replace with your local IP address when testing on a physical device.
    // Use http://10.0.2.2:3000 for the Android emulator (maps to host localhost).
    // url: "http://192.168.1.19:3000",
    // cleartext: true, // allow plain HTTP in dev builds
    // ── Production ───────────────────────────────────────────────────────────
    url: "https://your-app.vercel.app",
  },
  android: {
    backgroundColor: "#030712",
  },
};

export default config;
