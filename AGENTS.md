# Expo HAS CHANGED

Read the exact versioned docs at https://docs.expo.dev/versions/v54.0.0/ before writing any code.

Note: this project targets **SDK 54**, not the latest SDK. The API surface differs from
newer versions in ways that break silently — for example `NativeTabs.Trigger.Label` does
not exist here (`Label` and `Icon` are standalone exports from
`expo-router/unstable-native-tabs`), `expo-router` does not re-export `ThemeProvider`, and
`ColorSchemeName` has no `'unspecified'` member. When a doc page and the installed
package disagree, trust the type definitions in `node_modules`.

SDK 54 is pinned because Expo Go on the Apple App Store is capped at SDK 54; upgrading
would leave the app untestable on iPhone without a paid Apple Developer account.

## Native modules

The project now depends on `react-native-google-mobile-ads` and `react-native-purchases`,
which are **not available in Expo Go**. Code that touches them must degrade gracefully so
the rest of the app still runs in Expo Go during development — see `src/lib/native-modules.ts`.
Testing ads or purchases requires a development build.
