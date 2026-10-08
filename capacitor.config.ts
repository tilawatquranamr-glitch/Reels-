import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.hadithreels.app',
  appName: 'حديث ريلز 1',
  webDir: 'dist',
  server: {
    androidScheme: 'https',
    cleartext: true,
  },
  android: {
    allowMixedContent: true,
    webContentsDebuggingEnabled: false,
  },
  plugins: {
    Filesystem: {},
  },
};

export default config;
