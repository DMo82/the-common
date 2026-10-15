import type { CapacitorConfig } from "@capacitor/cli";

const serverUrl = process.env.CAPACITOR_SERVER_URL || "https://branch-frost-lagoon-brick.grok.me";

const config: CapacitorConfig = {
  appId: "uk.thecommon.community",
  appName: "The Common",
  webDir: "capacitor",
  server: {
    url: serverUrl,
    androidScheme: "https",
    cleartext: false,
  },
  ios: {
    contentInset: "automatic",
  },
};

export default config;
