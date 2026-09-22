# Android installation on this Mac

Installed on 22 September 2026:
- Android Studio Quail 4 Patch 1 (Apple Silicon) in `~/Applications/Android Studio.app`.
- SDK under `~/Library/Android/sdk`: platform-tools 37.0.1, emulator 37.2.10, Android 35 Google APIs ARM64 image revision 9, command-line tools.
- AVD `MUHUR_Pixel_7`.
- Expo Go 57.0.9 APK downloaded to `work/android-install/expo-go.apk` (relative to task root).
- One-click launcher `~/Applications/MUHUR.command`, delegating to the project launcher.

The official Studio SHA-256, emulator SHA-1, platform-tools SHA-1, and system-image SHA-1 matched the publisher's metadata. Studio's DMG could not be mounted by the agent, so its app bundle was extracted with official 7-Zip and moved to the user's Applications directory. Java and AVD creation were verified.

The development server runs on port 8081. A native Android bundle was successfully requested. CI mode disables watching to avoid Metro's EMFILE error on this machine.

**Not yet verified:** emulator boot and actual in-emulator gameplay. The agent environment denies processor sysctl access; the GUI emulator exits with Qt's “Incompatible processor … neon”, although hardware acceleration detection succeeds. The headless attempt also exits. Computer-use tooling separately fails on TIOCSTI. The launcher must be started by the user in ordinary macOS Terminal outside the agent environment; it boots the AVD, waits for Android, installs the downloaded Expo Go, and opens MÜHÜR. No security checks or quarantine settings were disabled.
