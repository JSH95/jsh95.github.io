import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.weavus.app',
  appName: 'react',
  webDir: 'build',
  android: {},
  plugins: {
    SplashScreen: {
      launchShowDuration: 0,
      androidScaleType: 'CENTER_CROP',
      backgroundColor: '#ffffff',
      showSpinner: false,
    },
    PushNotifications: {
      presentationOptions: ['alert', 'badge', 'sound'],
    },
  },
};

export default config;
