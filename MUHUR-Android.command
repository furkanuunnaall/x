#!/bin/zsh

cd -- "${0:A:h}" || exit 1

export ANDROID_HOME="${ANDROID_HOME:-$HOME/Library/Android/sdk}"
export PATH="$ANDROID_HOME/emulator:$ANDROID_HOME/platform-tools:/Users/cerencelbek/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/bin:$PATH"

if [[ ! -d "/Applications/Android Studio.app" && ! -d "$HOME/Applications/Android Studio.app" ]]; then
  print "Android Studio henüz kurulmamış."
  print "Önce Android Studio'yu kur, ardından bu dosyayı yeniden aç."
  read '?Kapatmak için Enter: '
  exit 1
fi

if [[ ! -x "$ANDROID_HOME/emulator/emulator" || ! -x "$ANDROID_HOME/platform-tools/adb" ]]; then
  print "Android SDK veya Emulator henüz kurulmamış."
  print "Android Studio > More Actions > SDK Manager bölümünden Android SDK ve Android Emulator'u kur."
  read '?Kapatmak için Enter: '
  exit 1
fi

if ! "$ANDROID_HOME/emulator/emulator" -list-avds | /usr/bin/grep -q .; then
  print "Henüz bir sanal telefon oluşturulmamış."
  print "Android Studio > More Actions > Virtual Device Manager > Create device yolunu izle."
  print "Önerilen cihaz: Pixel 7; sistem imajı: güncel kararlı Android ARM64."
  read '?Kapatmak için Enter: '
  exit 1
fi

if ! "$ANDROID_HOME/platform-tools/adb" devices | /usr/bin/grep -q $'emulator-.*\tdevice'; then
  AVD_NAME=$("$ANDROID_HOME/emulator/emulator" -list-avds | /usr/bin/head -n 1)
  print "$AVD_NAME adlı sanal telefon açılıyor..."
  "$ANDROID_HOME/emulator/emulator" -avd "$AVD_NAME" -memory 2048 -cores 2 -scale 0.3 -no-boot-anim >/tmp/muhur-android-emulator.log 2>&1 &
  for attempt in {1..90}; do
    if "$ANDROID_HOME/platform-tools/adb" devices | /usr/bin/grep -q $'emulator-.*\tdevice'; then
      break
    fi
    sleep 2
  done
  if ! "$ANDROID_HOME/platform-tools/adb" devices | /usr/bin/grep -q $'emulator-.*\tdevice'; then
    print "Sanal telefon başlatılamadı. Ayrıntı: /tmp/muhur-android-emulator.log"
    read '?Kapatmak için Enter: '
    exit 1
  fi
fi

print "Android'in açılması bekleniyor..."
for attempt in {1..120}; do
  booted=$("$ANDROID_HOME/platform-tools/adb" -e shell getprop sys.boot_completed 2>/dev/null | /usr/bin/tr -d '\r')
  [[ "$booted" == "1" ]] && break
  sleep 2
done
if [[ "$booted" != "1" ]]; then
  print "Telefonun ilk açılışı henüz tamamlanmadı. Biraz bekleyip bu dosyayı tekrar aç."
  read '?Kapatmak için Enter: '
  exit 1
fi

if ! "$ANDROID_HOME/platform-tools/adb" -e shell pm path host.exp.exponent | /usr/bin/grep -q 'package:'; then
  print "Expo Go sanal telefona yükleniyor..."
  if ! "$ANDROID_HOME/platform-tools/adb" -e install -r "$PWD/../../work/android-install/expo-go.apk"; then
    print "Expo Go yüklenemedi. Yukarıdaki hata mesajını Codex'e gönder."
    read '?Kapatmak için Enter: '
    exit 1
  fi
fi

print "MÜHÜR Android emülatöründe açılıyor. Bu pencereyi oyun boyunca açık tut."
if /usr/bin/curl -fsS --max-time 2 http://127.0.0.1:8081/status 2>/dev/null | /usr/bin/grep -q 'packager-status:running'; then
  "$ANDROID_HOME/platform-tools/adb" -e reverse tcp:8081 tcp:8081
  "$ANDROID_HOME/platform-tools/adb" -e shell am start -a android.intent.action.VIEW -d exp://127.0.0.1:8081 host.exp.exponent || exit 1
  read '?MÜHÜR açıldı. Bu pencereyi kapatmak için Enter: '
  exit 0
fi
export EXPO_NO_TELEMETRY=1
# This Mac currently exceeds Metro's file-watcher allowance. The game works
# normally in CI mode; restart this launcher after editing source files.
export CI=1
node node_modules/expo/bin/cli start --android --localhost --port 8081

read '?Kapatmak için Enter: '
