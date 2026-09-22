#!/bin/zsh
cd -- "${0:A:h}" || exit 1
export DEVELOPER_DIR="/Applications/Xcode.app/Contents/Developer"
if [[ ! -d "$DEVELOPER_DIR" ]]; then
  print 'Önce Xcode uygulamasını Uygulamalar klasörüne taşı ve bir kez aç.'
  print 'İndirme: https://developer.apple.com/download/all/?q=Xcode%2015.2'
  read '?Kapatmak için Enter: '
  exit 1
fi
if ! /usr/bin/xcrun simctl list devices available; then
  print 'Xcode’u açıp ilk kurulumunu tamamla ve iOS Simulator bileşenini indir.'
  read '?Kapatmak için Enter: '
  exit 1
fi
if ! command -v node >/dev/null; then
  export PATH="/Users/cerencelbek/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/bin:$PATH"
fi
if ! command -v node >/dev/null; then
  print 'Node.js bulunamadı. Codex ile kurulumu tamamla.'
  read '?Kapatmak için Enter: '
  exit 1
fi
print 'MÜHÜR iPhone simülatöründe açılıyor. Bu pencereyi oyun boyunca açık tut.'
export EXPO_NO_TELEMETRY=1
node node_modules/expo/bin/cli start --ios --localhost --port 8081
read '?Kapatmak için Enter: '
