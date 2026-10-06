# MÜHÜR — offline V1

Expo managed / React Native / TypeScript ile iOS ve Android için hukuk kelime oyunu. 80 bölüm (onar bölümlük 8 cilt, kolaydan zora), 390 kavram; sekiz final bölümü, günlük bulmaca/görevler, karakterler, koleksiyon ve başarımlar.

**[V1 ekranları, navigation, ekonomi ve kayıt modeli](V1-NOTES.md)**

## Bu Mac’te açma

1. Telefonuna **Expo Go** yükle. Proje SDK 57 kullanıyor; uyumlu sürümü https://expo.dev/go adresinden kontrol edebilirsin.
2. Bilgisayar ve telefon aynı Wi-Fi ağına bağlı olsun.
3. Bu klasördeki **Baslat.command** dosyasına çift tıkla. iPhone için `i`, Android için `a` yazıp Enter'a bas. Terminal penceresini açık bırak.
4. iPhone seçersen bilgisayarda Expo hesabına giriş yapman istenir. Telefonda Expo Go içinde de aynı hesaba giriş yap. Hesabın yoksa https://expo.dev/signup adresinden ücretsiz oluştur. Şifreni yalnız Terminaldeki Expo giriş ekranına yaz.
5. `HAZIR` yazısını bekle. Terminaldeki yeni QR kodunu iPhone kamerasıyla veya Android’de Expo Go ile okut. Yerel ağ erişimi sorulursa izin ver.

Başlatıcı dolu bağlantı noktalarını atlar ve yeni sunucunun QR kodunu üretir. Önceki mesajdaki QR yerine yeni Terminal QR kodunu kullan. Bağlantı olmazsa telefonun yerel ağ iznini ve bilgisayarın güvenlik duvarını kontrol et. `Baslat.command` bu Mac’teki dosya izleme limitini aşmak için otomatik kod yenilemeyi kapatır. Kod değişince Control+C ile sunucuyu kapatıp tekrar açabilirsin.

## Başka bilgisayarda

Node.js LTS kur. Terminalde proje klasörüne gir ve sırayla çalıştır:

```sh
npm install
npm start
```

Kilitli bağımlılıklarla kurulum için pnpm kullanılabilir: `pnpm install --frozen-lockfile`. Mac’te izleme sınırına takılırsan `CI=1 npm start` kullan. Standart `npm start` otomatik kod yenilemeyi destekler. Xcode, Android Studio, Swift veya Kotlin gerekmez.

## Nasıl oynanır?

İlk açılışta üç kısa tanıtımdan geç ve kurgusal karakterini seç. Ana sayfada **Devam Et** ile mevcut bölümü aç. İstediğin satıra dokun, tanımdan kavramı bul ve Türkçe klavyeyle yaz. Son harfte cevap otomatik kontrol edilir. Açılmış ipucu harfleri korunur; yanlışta doğru cevap gösterilmez.

Bölüm bitince **Sonraki Bölüm**, **Haritaya Dön** veya **Tekrar Oyna**. Her beşinci bölümde sabit kilometre taşı ödülü; her onuncu bölümde altı kavramlık final vardır. Tekrar oyunları ana ilerlemeyi değiştirmez ve yeniden ödül vermez.

Alt sekmeler: **Ana Sayfa, Harita, Kavramlar, Profil**. Günlük üç kavramlık bulmaca ve görevler ana sayfadan; karakter, başarımlar ve ayarlar profilden açılır. Ayarlardaki sıfırlama ayrı bir onay ister.

## Geliştirici doğrulaması

```sh
npm run typecheck
npm test
npx expo install --check
npx expo export --platform all
```

İlerleme AsyncStorage ile bu cihazda saklanır. Backend veya hesap yoktur. Eski kayıtlar migration ile korunur. Mevcut ekonomiyle yeni ödüllerin ayrıntıları V1 notlarında açıklanır.

Gerçek cihaz/görsel kontroller tamamlanmadı; otomatik testler ve paket üretimi fiziksel cihaz testinin yerine geçmez.
