import { ExpoConfig, ConfigContext } from 'expo/config';

export default ({ config }: ConfigContext): ExpoConfig => {
  return {
    name: 'Neuchat',
    slug: process.env.EXPO_PUBLIC_APP_SLUG || 'neuchat-app',
    version: '1.0.0',
    orientation: 'portrait',
    icon: './assets/icon.png',
    userInterfaceStyle: 'light',
    newArchEnabled: false,
    scheme: 'neuchatapp',
    splash: {
      image: './assets/splash-icon.png',
      resizeMode: 'contain',
      backgroundColor: '#ffffff',
      enableFullScreenImage_legacy: true,
    },
    ios: {
      supportsTablet: true,
      bundleIdentifier: 'sg.neutron.neuchat',
      infoPlist: {
        NSCameraUsageDescription:
          'This app requires access to the camera to upload images and videos.',
        NSPhotoLibraryUsageDescription:
          'This app requires access to the photo library to upload images.',
        NSMicrophoneUsageDescription: 'This app requires access to the microphone to record audio.',
        NSAppleMusicUsageDescription:
          'This app does not use Apple Music, but a system API may require this permission.',
        UIBackgroundModes: ['fetch', 'remote-notification'],
        ITSAppUsesNonExemptEncryption: false,
      },
      // Firebase iOS config file for FCM
      googleServicesFile: './GoogleService-Info.plist',
      entitlements: { 'aps-environment': 'production' },
      associatedDomains: ['applinks:neuchat.neutron.sg'],
    },
    android: {
      adaptiveIcon: { foregroundImage: './assets/adaptive-icon.png', backgroundColor: '#ffffff' },
      package: 'sg.neutron.neuchat',
      permissions: ['android.permission.CAMERA', 'android.permission.RECORD_AUDIO'],
      // Firebase Android config file for FCM
      googleServicesFile: './google-services.json',
      intentFilters: [
        {
          action: 'VIEW',
          autoVerify: true,
          data: [
            {
              scheme: 'https',
              host: 'neuchat.neutron.sg',
              pathPrefix: '/app/accounts/',
              pathPattern: '/*/conversations/*',
            },
          ],
          category: ['BROWSABLE', 'DEFAULT'],
        },
        {
          action: 'VIEW',
          data: [
            {
              scheme: 'neuchatapp',
            },
          ],
          category: ['BROWSABLE', 'DEFAULT'],
        },
      ],
    },
    extra: {
      eas: {
        projectId: 'f8027f33-7712-4c69-8a2b-93b0eb6a6929',
        storybookEnabled: process.env.EXPO_STORYBOOK_ENABLED,
      },
    },
    owner: 'neutronsg',
    plugins: [
      'expo-font',
      ['react-native-permissions', { iosPermissions: ['Camera', 'PhotoLibrary', 'MediaLibrary'] }],
      process.env.SENTRY_AUTH_TOKEN && process.env.EXPO_PUBLIC_SENTRY_PROJECT_NAME && process.env.EXPO_PUBLIC_SENTRY_ORG_NAME
        ? [
          '@sentry/react-native/expo',
          {
            url: 'https://sentry.io/',
            project: process.env.EXPO_PUBLIC_SENTRY_PROJECT_NAME,
            organization: process.env.EXPO_PUBLIC_SENTRY_ORG_NAME,
          },
        ]
        : null,
      '@react-native-firebase/app',
      '@react-native-firebase/messaging',
      [
        'expo-build-properties',
        {
          // https://github.com/invertase/notifee/issues/808#issuecomment-2175934609
          android: {
            minSdkVersion: 24,
            compileSdkVersion: 35,
            targetSdkVersion: 35,
            enableProguardInReleaseBuilds: true,
          },
          ios: { useFrameworks: 'static' },
        },
      ],
      './with-ffmpeg-pod.js',
    ].filter(Boolean) as ExpoConfig['plugins'],
    androidNavigationBar: { backgroundColor: '#ffffff' },
  };
};
