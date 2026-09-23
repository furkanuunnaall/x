# MÜHÜR puzzle motoru — sürüm 1

## Kaynak incelemesi

İncelenen CrossWordia revision:
https://github.com/esentis/crosswordia/tree/ece6db323f5b355eb0662c5ddf9a9684724dca23

| Kaynak | Bulgular | MÜHÜR kararı |
| --- | --- | --- |
| `lib/core/extensions/string_extensions.dart` | Harf başına yuvarlanmış ters sıklık toplamı + 10 × uzunluk | `scoring.ts`: kendi hukuk sözlüğümüzden yumuşatılmış sıklık. Dilbilimsel Türkçe sıklık iddiası yok. XP değildir. |
| `lib/core/helpers/find_possible_words.dart`, `find_word_groups.dart` | Harf çokluklarıyla alt küme/anagram gruplama; en çok 7 harflik anahtarlar | Alınmadı: MÜHÜR tanımdan cevap buldurur; uzun hukuk terimleri ve tam klavye korunur. |
| `lib/screens/board/controllers/crossword_board_controller.dart` | Uzun sözcük ilk, ortak harf koordinatlarından adaylar, yatay/dikey kontrol, yerleşmeyenleri tekrar deneme; sözcük/hücre haritaları | `grid.ts`, `model.ts`: seyrek hücre haritası, koordinat/yön sahipliği, simetrik kesişimler, sınırlı tekrar. |
| `lib/screens/board/helpers/{horizontal_check,vertical_check}.dart` | Sınır, önce/sonra boşluk ve yan komşuluk kontrolü | Yön bağımsız tek kontrol. Aynı yönde üst üste binme ve üçüncü kelime kesişimi de reddedilir. |
| `lib/services/levels_service.dart` | Level: id, level, words, letters; harf grupları uzunluğa göre sıralanır; Supabase ile saklanır | `generator.ts`: deterministik, hukuk zorluğu ve kategori çeşitliliği kullanan çevrimdışı taslak üretimi. Supabase yok. |
| `lib/screens/levels/choose_level_screen.dart` | currentLevel öncesi tamamlanan, eşiti mevcut, sonrası kilitli | MÜHÜR'ün mevcut progression sistemi korundu. |
| `lib/services/player_status_service.dart`, board controller | Ayrı oyuncu/bölüm bulduğu-kelimeler durumu; tekrar bulunan sözcük engeli; bulunan sözcüğün hücrelerini görünür kılma | `state.ts`: mevcut entries üzerinden salt okunur tamamlanma/görünürlük. Yeni kayıt veya ödül sistemi yok. |
| `lib/screens/board/widgets/found_words_overlay.dart` | Gridde yer alan ve diğer bulunan sözcükler ayrılır | Bonus kelime davranışı alınmadı. MÜHÜR'de bölümün bütün soruları tamamlanmalıdır. |

## Mimari ve kullanım

Mevcut `Question` alanları (`id`, `term`, `clue`, `explanation`, `difficulty`,
`category`) aynen kalır. `PuzzleWord` sadece bölümdeki bir kelime örneğinin
`questionId`, `letterScore`, `levelWeight`, `gridPosition`, `orientation`,
`crossings` alanlarını tutar. Böylece aynı soru farklı bölümlerde farklı
koordinatlara sahip olabilir. Koordinatlar sıfır tabanlıdır.

```ts
import { getCampaignPuzzle, getCurrentPuzzleProgress, generateLevel } from './src/engine';
const puzzle = getCampaignPuzzle(1); // gerçek mevcut bölüm, soru sırası değişmez
const progress = getCurrentPuzzleProgress(game); // mevcut run.entries okunur
const draft = generateLevel(questions, { id: 31, seed: 'muhur-31-v1' });
```

Motor uygulamanın UI veya reducer modüllerinden bağımsızdır. Bu aşamada
GameScreen motora bağlanarak değiştirilmedi. Campaign adaptörü mevcut 30 bölümü
okuyup gerektiğinde metadata üretir. Başlangıçta grid hesaplanmaz, eski bölümler
üreticiye taşınmaz. `files` içeriği ve tüm soruların sırası fixture ile korunur.

### Taslak üretimi

```sh
pnpm generate:level 31 muhur-31-v1
```

Komut JSON taslağını standart çıktıya verir. Haritaya bölüm eklemez, mevcut
30 bölümü güncellemez, AsyncStorage'a yazmaz. Yayınlanacak yeni bölümler,
içerik kontrolünden sonra ayrı bir sürümlenmiş katalogda sabitlenmelidir.
Aynı korpus + parametreler + seed + motor sürümü aynı çıktıyı üretir;
korpus değişince üretim sonucu da değişebilir. Canlı kayıtlar için her açılışta
bölüm üretmeyin.

- Normal/ödül bölümünde varsayılan 6, her onuncu finalde 9 kelime.
- `difficulty` editoryal ağırlığı baskındır; uzunluk ve sınırlı nadir-harf etkisi eklenir.
- Hedef zorluk, kategori çeşitliliği, ortak harfler ve seed ile aday sıralaması.
- Aynı terim/kimlik bölümde tekrarlanmaz; `excludeIds` ile önceki içerik dışlanabilir.
- 8 sınırlı başlangıç denemesi. Yeni üretim yalnızca tüm kelimeler bağlıysa başarılıdır.
- Grid 3–64, bölüm en çok 12 sözcük, terim en çok 32 harf, üretim havuzu en çok 512 soru.
- Üretici yaklaşık zorluğu hedefler, pedagojik zorluğu garanti etmez. Başarısız üretim
  açık hata verir; kısmi bir bölümü tamamlanmış gibi sunmaz.

### Grid ve state sınırları

`createPuzzle` yerleşemeyen soruları `unplacedWordIds` ile döndürür. Bunlar
sorular listesinden çıkarılmaz. `fullyConnected` yalnızca yerleşim durumudur;
oyuncunun `complete` durumu değildir. Boş puzzle tamamlanmış sayılmaz.
Tamamlanma, yerleşsin veya yerleşmesin bütün soruların mevcut `solved` durumuna bakar.

`puzzleProgress` sadece çözülen kelimelerin ve satın alınmış doğru harflerin
hücrelerini görünür döndürür. Draft tahminleri çözüm kabul edilmez.
`crossingHelp(puzzle, entries)` varsayılan olarak boş liste verir.
`crossingHelp(puzzle, entries, true)` sadece çözülmüş kaynaklardan öneri üretir;
cevap kutularını doldurmaz, kelime çözmez, XP veya Mühür vermez. Bu gelecekteki
mekaniği açmak ayrıca UI/ekonomi kararı gerektirir.

## Kayıt uyumluluğu

Yeni AsyncStorage key'i, migration veya persisted field eklenmedi. Bu motor çalışması Game,
Product, karakter, görev, başarımlar, ekonomi ve navigation dosyalarını değiştirmez.
Bu görevde UI/saklama dosyalarına yazılmadı. İşlem öncesi SHA-256 karşılaştırması
sırasında aynı klasörde dışarıdan eşzamanlı ekran/product güncellemeleri görüldü;
bunlar geri alınmadı. Bu nedenle tüm çalışma klasörü için değişmedi iddiası yoktur.
30 bölümün tüm içeriği `tests/fixtures/campaign-v1.json` ile karşılaştırılır.

## Testler

`tests/engine.test.ts`: Türkçe İ/I ve NFC, sıklık skoru, sınırlar, komşuluk,
ayni yönde çakışma, simetrik kesişim, tüm kampanya gridleri, yerleşmeyenler,
tamamlanma, harf yardımı opt-in, seed/sıra bağımsızlığı, kategori/seçim sınırları,
final/ödül üretimi, zorluk dengesi, imkânsız üretim ve eski oyun verisi.
Mevcut oyun ve persistence testleri de çalıştırılır.

Lisans: [THIRD_PARTY_NOTICES.md](../THIRD_PARTY_NOTICES.md) ve
[CrossWordia MIT metni](../LICENSES/CrossWordia-MIT.txt).

Doğrulama sonucu: TypeScript kontrolü ve güncel 55 test başarılı; pnpm
üretim komutuyla 6 kelimelik bağlı bir Bölüm 31 taslağı üretildi.
