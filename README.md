# MÜHÜR — Hukuk Kelime Oyunu

Expo (SDK 57) / React Native / TypeScript ile iOS ve Android için hukuk kelime oyunu. Tanımı verilen hukuk kavramını bulup yazarsın. İnternet, hesap veya sunucu gerekmez; ilerleme cihazda saklanır.

- **80 bölüm**, onar bölümlük **8 cilt**; **390 kavram** (Adalet Bakanlığı Hukuk Sözlüğü'nden, en fazla 10 harfli terimler).
- 1. cilt tamamen kolay. Diğer ciltler kendi içinde ilerler: 4 kolay bölüm (4 kelime), 3 orta bölüm (6 kelime), 2 zor bölüm (6 kelime) ve bir final (6 kelime: 4 yeni, 2 tekrar).
- Her beşinci bölümde kilometre taşı ödülü, her onuncu bölümde final.
- Günlük bulmaca (kolay, orta, zor birer kavram), günlük görevler, İSTİKRAR serisi, kavram koleksiyonu, başarımlar, karakter ve profil.
- Zor kelimelerim: yanlış yapılan ve jokerle açılan kavramlar Kavramlar ekranında listelenir; ödülsüz, jokersiz 5 kavramlık tekrar turları (ilk denemede doğru bilinen kavram listeden yavaş yavaş çıkar).
- Gündüz/gece teması telefonun ayarını izler; ayarlardan elle de seçilebilir.
- Günlük hatırlatma: her gün 13:00'te tek bir yerel bildirim (günlük bulmaca çözülmediyse ve/veya İSTİKRAR serisi o gün bitecekse). İzin ilk bölüm bitince sorulur; ayarlardan açılıp kapatılır. İnternet gerekmez.

## Çalıştırma

Node.js LTS gerekir. Bağımlılıklar pnpm kilit dosyasıyla kurulur:

```sh
pnpm install --frozen-lockfile
npx expo start
```

- **Telefonda (Expo Go):** Telefona Expo Go'yu yükle, bilgisayarla aynı Wi-Fi'ye bağlan ve terminaldeki QR kodu okut (iPhone'da kamerayla, Android'de Expo Go içinden). Adres `exp://<bilgisayarın-yerel-IP'si>:8081` biçimindedir.
- **Tarayıcıda:** `npx expo start --web` ve `http://localhost:8081`.

## Android APK (EAS)

Proje EAS'e bağlı (hesap `furkanunal`, proje `muhur`). `eas.json` iki profil tanımlar:

| Profil | Çıktı | Kullanım |
| --- | --- | --- |
| `preview` | APK | Telefona doğrudan kurup test etmek |
| `production` | AAB | Google Play'e yüklemek |

```sh
npx eas-cli build -p android --profile preview
```

Build, EAS sunucularında yapılır. Bitince Expo sayfasında APK indirme linki çıkar; link 14 gün geçerlidir. Build, o anki çalışma klasörünü kullanır; içermesi gereken değişiklikleri önce commit etmek iyi olur. Android imzalama anahtarı EAS'te saklanır.

## Oynanış

- Ana ekrandan bölümü aç. Bir satıra dokun, tanımdan kavramı bul ve telefon klavyesiyle yaz. Son harf girilince cevap kendiliğinden kontrol edilir; doğruysa sonraki kelimeye geçilir. Boş bir yere dokununca klavye kapanır.
- Jokerler kullanılmadan önce onay ister:
  - **İpucu (40 Mühür):** Kelimenin harflerini karışık sırayla ve ek bir açıklamayı soru kartında gösterir.
  - **Harf Aç (20 Mühür):** Rastgele bir harfi açar.
  - **Kelime Aç (60 Mühür):** Kelimenin tamamını açar.
- Günlük bulmaca harf taşlarıyla oynanır; İpucu (40 Mühür) havuzdaki 3 fazla harfi kaldırır, Harf Aç (20 Mühür) sıradaki harfi sabitler (son harf açılmaz). Kelime Aç yoktur.
- Bölüm sonunda XP ve Mühür verilir. Tekrar oyunları ilerlemeyi değiştirmez ve yeniden ödül vermez.
- Ekranlar telefonun kullanılabilir yüksekliğine göre boyutlanır (`src/layout.ts`); sığmayan ekranlar kaydırılır.

## Kod yapısı

| Yer | İçerik |
| --- | --- |
| `App.tsx`, `src/AppNavigation.tsx` | Uygulama kökü ve ekran yönlendirmesi |
| `src/screens/` | Ekranlar (ana ekran, harita, bölüm, sonuç, günlük, profil, ayarlar…) |
| `src/game.ts`, `src/store.tsx` | Bölüm ilerlemesi, jokerler, ödüller ve kayıt |
| `src/product.ts` | Günlük bulmaca, görevler, seri, seviye, kilometre taşları |
| `src/discovery/` | Koleksiyon ve başarımlar (ayrı kayıt) |
| `src/content.ts` | Bütün soruların ve bölümlerin birleştirildiği yer |
| `src/campaignPlan.ts` | 80 bölümün hangi terimlerden oluştuğu ve terim zorlukları |
| `src/campaignWords.ts`, `src/campaignWordsHard.ts` | Kampanya terimleri: soru, ipucu, kategori |
| `src/additionalContent.ts` | İlk sürümden kalan terimler ve ipuçları |
| `src/NativeLetterInput.tsx` | Telefon klavyesinden harf okuyan gizli alan |
| `src/reminders.ts`, `src/notifications.ts` | Günlük hatırlatmanın metni/planı ve telefona planlanması |
| `src/ui.tsx`, `src/themeMode.tsx`, `src/layout.ts` | Ortak bileşenler, tema ve ekran boyutlandırma |
| `assets/` | Arka planlar, karakterler, simge, açılış ekranı ve sesler |

### İçerik değiştirmek

- Bir terimin sorusunu veya ipucunu değiştirmek için ilgili `campaignWords*.ts` ya da `additionalContent.ts` satırını düzenle.
- Bölümlerin kelimeleri `campaignPlan.ts` içindedir.
- İçerik değişince testteki kayıt da güncellenmeli: `tests/fixtures/campaign-v2.json` `files` çıktısının birebir kopyasıdır.
- Günlük bulmacanın kelimeleri soru listesinden hesaplanır. Liste değişirse eski günlerin kayıtlı oturumları geçersiz olabilir.

## Kayıt

İlerleme AsyncStorage'da iki anahtarda tutulur: `@muhur/progress-v1` (oyun) ve `@muhur/discovery-v1` (koleksiyon ve başarımlar). Kayıt okunamazsa uygulama verileri silmez; **Tekrar dene** veya onaylı **Baştan başla** seçenekleri sunar.

## Doğrulama

```sh
npm run typecheck
npm test
```
