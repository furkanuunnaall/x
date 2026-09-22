#!/bin/zsh
set -e
cd "$(dirname "$0")"
if ! command -v node >/dev/null 2>&1; then
  export PATH="/Users/cerencelbek/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/bin:$PATH"
fi
if ! command -v node >/dev/null 2>&1; then
  echo 'Node.js LTS kurulmalı: https://nodejs.org'
  read -r '?Kapatmak için Enter tuşuna basın.'
  exit 1
fi
if [ ! -d node_modules/expo ]; then
  echo 'Önce bu klasörde npm install komutunu çalıştırın.'
  read -r '?Kapatmak için Enter tuşuna basın.'
  exit 1
fi
export __UNSAFE_EXPO_HOME_DIRECTORY="$PWD/.expo-local"
export EXPO_NO_TELEMETRY=1
export DOTSLASH_CACHE_DIR="$PWD/.expo-local/dotslash"
echo 'Telefon ve bilgisayar aynı Wi-Fi ağına bağlı olmalı.'
echo 'iPhone için i, Android için a yazıp Enter tuşuna basın.'
read -r phone_type
if [[ "$phone_type" == [iI] ]]; then
  echo 'Expo hesabınızla giriş yapın. Telefonda da AYNI hesabı kullanın.'
  echo 'Hesabınız yoksa https://expo.dev/signup adresinden ücretsiz oluşturun.'
  node node_modules/expo/bin/cli login
elif [[ "$phone_type" != [aA] ]]; then
  echo 'Telefon seçimi anlaşılmadı. Komutu yeniden çalıştırıp i veya a yazın.'
  exit 1
fi
echo 'Bu test modu otomatik kod yenilemeyi kapatır; ilerlemeniz kaydedilir.'
node scripts/start-phone.cjs
