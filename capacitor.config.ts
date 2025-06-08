
import { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'app.lovable.68de21be8dfb45ac88dd2da960ee8f93',
  appName: 'alprax-flow',
  webDir: 'dist',
  server: {
    url: 'https://68de21be-8dfb-45ac-88dd-2da960ee8f93.lovableproject.com?forceHideBadge=true',
    cleartext: true
  },
  ios: {
    contentInset: 'always'
  },
  android: {
    captureInput: true
  }
};

export default config;
