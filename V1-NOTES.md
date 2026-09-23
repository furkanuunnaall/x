# MÜHÜR — offline V1

30 oynanabilir bölüm, 119 farklı kavram ve toplam 189 soru yerleşimi vardır. İlk beş bölüm (q1–q30) olduğu gibi korunur. Sonraki bölümler yeni kavramlarla birlikte tekrar soruları içerir. 10, 20 ve 30. bölümler dokuz soruluk Final Bölümleridir.

## Ekranlar ve akış

İlk açılış: **3 adımlı onboarding → karakter seçimi → Ana Sayfa**. Seçimler sonraki açılışlarda hatırlanır. Önceden kayıtlı oyuncunun ilerlemesi korunur; yeni tanıtım/karakter seçimi bir kez gösterilir.

Alt sekmeler: **Ana Sayfa / Harita / Kavramlar / Profil**. Oyun, günlük bulmaca ve diğer detay ekranlarında alt sekmeler gizlenir.

| Ekran | Erişim ve işlev |
| --- | --- |
| Onboarding | İlk açılışta üç tanıtım adımı |
| Karakter seçimi | İlk kurulum ve Profil; altı kurgusal isim/tema |
| Ana Sayfa | Karakter, mevcut bölüm, günlük bulmaca, görevler, koleksiyon, haftalık hedef |
| Harita | 30 düğüm; kilitli, açık, tamamlanmış ve üç yıldızlı durumlar |
| Game | Korunan Türkçe klavye, otomatik kontrol, soru seçimi, üç mevcut ipucu |
| Bölüm sonucu | Yıldız, kavram, XP, Mühür, hata, ipucu, en uzun seri; sonraki bölüm/harita/tekrar |
| Final girişi | 10/20/30. bölümden önce özel tanıtım |
| Final sonucu | Sonuç ekranının özel final görünümü; bonuslar ve Final Ustası |
| Kilometre taşı | Her beşinci bölümde sabit ödülü alma ekranı; haritadan sonradan da erişilir |
| Günün Şifresi | Yerel takvim gününe göre üç kavram; yarım kalmış oturum kaydedilir |
| Tekrar | Tamamlanan bölümler ve günlük bulmaca için ödülsüz alıştırma |
| Günlük görevler | Üç görev, ilerleme, tek seferlik görev ve tamamı bonusu |
| Kavram koleksiyonu | Ana bölümlerde çözülmüş kavramlar, ilk bölümü, arama, kategori filtresi ve favoriler |
| Başarımlar | Yedi rozet; Profil üzerinden erişim ve açıldığında kısa bildirim |
| Profil | Karakter, seviye, XP, Mühür, seri, bölüm, farklı kavramlar, yıldızlar ve başarımlar |
| Ayarlar | Ses, titreşim, hareket azaltma, hakkında ve iki aşamalı sıfırlama |
| Seviye artışı | Yeni oyuncu seviyesinde +30 Mühür ve Devam penceresi |

Ana oynanış ekranı yeniden yazılmadı. Günlük oyun ve tekrar, ortak bir oturum ekranı kullanır. İkisi de Türkçe klavyeyle cevap oluşturur ve son harfte kontrol eder. Günlük bulmaca ve tekrar oyununun kendi doğru serisi vardır; ana bölüm serisi ve yıldızları etkilenmez.

## Ekonomi

Kaynak olarak mevcut kod korundu. İstekteki çelişen örnek değerler uygulanmadı:

- Doğru cevap: 100 / 110 / 120 / 130 / 150 XP; beşinci ve sonraki doğrular 150.
- Yanlış cevap: ana oyundaki seri sıfırlanır; cevap açıklanmaz.
- Normal bölüm: **+50 Mühür**. Mevcut yıldız hesabı aynıdır; yeni yıldız/perfect para bonusu eklenmedi.
- Harf Aç: **20**, İlk Harfi Aç: **30**, Ek İpucu: **40 Mühür**. Harf havuzu olmadığı için “sahte harf kaldır” eklenmedi.
- Final bölümü: cevap XP toplamına **+250 XP**; normal 50 Mühüre ek **+100**, toplam **150 Mühür**.
- Her 5. bölüm: ayrıca **+50 Mühür ve 1 ücretsiz Harf Aç**. Ödülü Al ile bir kez alınır. Ücretsiz harf kuponu önce kullanılır; yıldız hesabında yine ipucu sayılır.
- Günlük üç kavram: **+100 XP ve +20 Mühür**, tarih başına bir kez. Tekrarı ödülsüzdür.
- Üç günlük görev: 5 kavram, 1 ana bölüm, 3 doğru seri. Her biri **+10 Mühür**; üç ödül alındığında **+30 bonus Mühür**.
- Her yeni oyuncu seviyesi: **+30 Mühür**. Oyuncu seviyesi hâlâ her 1.000 XP’de artar. Eski kaydın geçmiş seviyeleri için geriye dönük ödül verilmez.

Para/XP ödülü ile “alındı” kaydı aynı oyun nesnesinde, aynı AsyncStorage yazmasında tutulur. Tekrar tıklama, yeniden açma ve daha önce oynanan tarihe dönme ödülü çoğaltmaz.

## AsyncStorage ve migration

Yeni bir bağımsız para/kayıt anahtarı açılmadı. Mevcut iki anahtar korunur:

### `@muhur/progress-v1`

Mevcut `version: 1`, `file`, `xp`, `seals`, `combo`, `best`, `solved`, `daily`, `lastDay`, `run`, `results` alanları korunur. Sonuçlara isteğe bağlı `mistakes` eklendi.

Yeni bilgiler `product` nesnesindedir:

- `hasCompletedOnboarding`
- `selectedGender`, `selectedRole`, `selectedCharacter`
- `settings.sound`, `settings.vibration`, `settings.reduceMotion`
- `dailyTasksDate`, `dailyTasks` (tarih başına sayaçlar ve alınmış ödüller)
- `lastDailyPuzzleDate`, `dailyPuzzleCompletedDate`
- `dailyPuzzles`, `dailyPuzzleClaims` (tarih başına oturumlar ve ödül geçmişi)
- `unlockedAchievements`, `notices`
- `claimedMilestones`, `freeLetters`
- `claimedPlayerLevel`
- `replay` (ana bölümden bağımsız tekrar oturumu)

Eksik alanlara varsayılan değerler eklenir. Eski sonuç ve cevaplar taşınırken silinmez; hatalı kayıt otomatik sıfırlanmaz. `solved` mevcut toplam cevap sayacı olarak kalır; koleksiyon/50 ve 100 kavram başarımları farklı soru kimliklerini sayar.

### `@muhur/discovery-v1`

Var olan `favorites` ve eski günlük şifre `days` kayıtları korunur. Favoriler taşınmadan kullanılmaya devam eder. Eski tek kelimelik şifre havuzu sabitlendi; içerik genişlemesi eski cevapları değiştirmez. Yeni üç kavramlık günlük oyun `product.dailyPuzzles` altında tutulur.

Sıfırlama yalnızca oyuncunun onayından sonra iki oyun kaydını başlangıca getirir. Onaydan vazgeçmek veri değiştirmez. Okuma/yazma hatasında tekrar deneme sunulur.

## Doğrulama

- TypeScript kontrolü.
- 38 otomatik oyun, migration, ödül, kayıt ve giriş akışı testi.
- iOS, Android ve web Expo paket üretimi; Expo bağımlılık uyumu.
- Ayrı, sahte yerel kayıt kullanan DOM akış kontrolleri: onboarding/karakter, dört sekme, ana oyun klavyesi, koleksiyon/favoriler, ayarlar/başarımlar, günlük çözüm ve tekrar, sıfırlamada vazgeçme/onaylama, bölüm 5 ödülü, ücretsiz harf, final girişi/sonucu/tekrar.

DOM kontrolleri gerçek tarayıcı görüntüsü veya cihaz testi değildir. Görsel tarayıcı aracı ortam hatası verdi. Gerçek iPhone/Android’de taşma, safe area, ses/titreşim ve dokunma hissi kontrolü henüz yapılmadı. Yerel avatarlar ileride gerçek asset takılabilecek `Avatar` bileşeninde çizilir.

Backend, hesap, reklam, satın alma, abonelik, arkadaş ve online lig yoktur.

## İsim ve profil güncellemesi

İlk kurulum sırası artık onboarding → ad/soyad → karakter seçimidir. `product.firstName` ve `product.lastName` mevcut kayıt içine eklendi; eksik eski alanlar boş olarak tamamlanır. Ad/soyad Profile'den düzenlenebilir. Kurgusal karakter seçimi ayrı tutulur; değiştirilmesi oyuncu adını etkilemez.

Profilde **Oyuncu profilim / Kişisel sıralama** sekmeleri vardır. Altın podyum ve sıralama kartları oyuncunun tamamladığı bölümleri yıldız, ardından XP ile sıralar. Online lig, başka oyuncular, sahte canlı durum veya baro kaydı bulunmaz. Henüz bölüm yoksa gerçek boş durum gösterilir.

39 otomatik test, TypeScript ve yeni ad/soyad → karakter → profil → ad düzenleme DOM kontrolü geçti. iOS, Android ve web paketleri üretildi. Gerçek cihaz/görsel kontrollerin sınırları değişmedi.

## 21 Eylül — giriş, karakter, profil ve bulmaca düzeni

- Ad-soyad girişi: odak durumu, klavyeden sonraki alana geçiş ve kaydetme; mevcut kayıt alanları korunur.
- Karakterler: iki özgün, yerel portre; rol ve görünüm seçimi aynı kayıt akışını kullanır. Avatarlar ana sayfa ve profilde de paylaşılır.
- Profil: oyuncu kartı, XP ve rozet özeti, tek ayar listesi. Kişisel bölüm sıralamasında ilk üç sonuç kürsüde, diğerleri listede; aynı sonuçlar tekrar gösterilmez.
- Oyun: krem kabartmalı cevap kutuları, altın aktif kutu, yeşil tamamlanan satır. Yeterli yüksekliğe sahip ekranlarda soru, aksiyonlar ve Türkçe klavye birlikte sabitlenir; kısa ekran/büyük yazı boyutunda doğal kaydırma kullanılır. Soru değiştirme seçilen satıra kaydırır.
- Gameplay, XP, Mühür, ipucu bedelleri, soru verileri ve storage reducer değişmedi.
- Doğrulama: TypeScript, 39 birim testi, üç platform Expo export; izole DOM ortamında kayıt, profil, normal oyun doğru/yanlış, günlük oyun ve tekrar ödülü, koleksiyon, final ve milestone akışları. DOM kontrolü gerçek cihazdaki görsel kontrolün yerine geçmez.

## Sahne tabanlı hukuk oyunu ana ekranı

Ana sayfa, kullanıcının son görsel referansındaki hiyerarşiyle yeniden düzenlendi: özgün adliye avlusu arka planı; üstte Mühür, günlük seri ve ayarlar; ortada gerçek bölüm numarası ve adı; yanlarda görev/başarım/kavram/harita kısayolları; altta bölüme devam ve günlük bulmaca. Profil alt kenardan açılır. Ana sayfada alt sekme çubuğu gizlenir; diğer ana ekranlarda korunur. Kart düzeni yerine sahne kullanılır, dar/kısa ekranlarda doğal kaydırma vardır. Tüm sayılar mevcut state kaynaklıdır. Ekonomi, soru sistemi ve kalıcı kayıt modeli değişmedi.

Arka plan yerel assets/courtyard.png dosyasından yüklenir; internet gerekmez. Tarayıcı görsel otomasyon aracı ortam hatası nedeniyle çalışmadığından piksel düzeyinde görsel kontrol yapılamadı; bağımsız DOM ortamında akış ve CTA kontrolleri kullanıldı.

## Günlük takvim ve ortak açık sahne teması

- Günlük Bulmaca artık önce aylık takvimi açar. Pazartesi başlayan yedi sütun, ay değiştirme, bugün vurgusu, tamamlanan gün işareti ve gelecek gün kilidi vardır.
- Bugünün erişimi ücretsizdir. Daha önce açılmamış geçmiş bir güne giriş 3 Mühürdür. Ücret butonda yazılıdır; bakiye yetmezse buton devre dışıdır. Ücret ve erişim izni aynı reducer işlemiyle kaydedilir. Açılmış günlere yeniden giriş ücretsizdir.
- Eski sürümde başlamış/tamamlanmış günlük bulmacalar yeniden ücretlendirilmez. Mevcut @muhur/progress-v1/product alanına migration varsayılanı [] olan unlockedDailyDates eklendi. Başka storage anahtarı yoktur.
- Daily takviminden DailyPlay({day}) ekranına geçilir. Her tarihin soru seçimi, taslağı ve sonuçları birbirinden ayrıdır; gece yarısı açık oturumun tarihi değişmez.
- Tarih başına mevcut +100 XP/+20 Mühür ödülü korunur; tekrar verilemez. Arşivde ilk kez çözülen kavramlar oynandıkları gerçek günün görevlerine sayılır, geçmiş günün görev kayıtlarını değiştirmez.
- Tüm aktif ekranlar ortak adliye sahnesi, krem/açık paneller, koyu okunabilir metin, yeşil yuvarlak ana butonlar ve amber detaylara geçirildi. Ana sayfa, oyun, karakter, profil, harita, koleksiyon, görevler, başarımlar, sonuçlar ve ayarlar bu görsel dili paylaşır. Referanstaki yeni para birimleri ve aylık hediye ekonomisi eklenmedi.
- Doğrulama: TypeScript; 54 test (5 yeni arşiv testi dahil); iOS/Android/web export; izole DOM ortamında 390 ve 320 genişlikte takvim/ücret/yeniden açma/yetersiz bakiye akışları ve ana oyun regresyon akışları. Gerçek cihaz/piksel kontrolü henüz yapılmadı.
