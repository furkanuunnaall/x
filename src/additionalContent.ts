import type { Question } from "./content";
// Original short clues. IDs are stable; existing q1–q30 remain untouched.
const rows = [
  [
    "DAVA",
    "Bir hakkın korunması için mahkemeden hukuki yardım istenmesi.",
    "Usul",
  ],
  ["DAVACI", "Mahkemede talepte bulunarak davayı açan taraf.", "Usul"],
  ["DAVALI", "Davada kendisine karşı talepte bulunulan taraf.", "Usul"],
  [
    "HÜKÜM",
    "Mahkemenin uyuşmazlığın esası hakkında verdiği son karar.",
    "Usul",
  ],
  ["İLAM", "Mahkeme hükmünün taraflara verilen resmî yazılı örneği.", "Usul"],
  [
    "DURUŞMA",
    "Yargılamada tarafların ve delillerin mahkeme önünde ele alındığı oturum.",
    "Usul",
  ],
  ["DİLEKÇE", "Bir makama istek veya şikâyet bildiren yazılı başvuru.", "Usul"],
  [
    "YETKİ",
    "Bir davaya hangi yer mahkemesinin bakacağını belirleyen alan.",
    "Usul",
  ],
  [
    "GÖREV",
    "Bir davaya hangi tür mahkemenin bakacağını belirleyen alan.",
    "Usul",
  ],
  [
    "İSPAT",
    "Bir vakıanın doğruluğu konusunda mahkemede kanaat oluşturma faaliyeti.",
    "Usul",
  ],
  [
    "KARİNE",
    "Bilinen bir olgudan bilinmeyen bir olgu hakkında çıkarılan sonuç.",
    "Usul",
  ],
  [
    "YEMİN",
    "Kanunun öngördüğü biçimde gerçeği söylediğini doğrulayan beyan.",
    "Usul",
  ],
  [
    "KEŞİF",
    "Mahkemenin bir yer veya nesne hakkında doğrudan gözlem yapması.",
    "Usul",
  ],
  [
    "ISLAH",
    "Tarafın yaptığı usul işlemlerini kanuni koşullarla düzeltmesi.",
    "Usul",
  ],
  [
    "SULH",
    "Tarafların aralarındaki uyuşmazlığı anlaşarak sona erdirmesi.",
    "Usul",
  ],
  [
    "TAHKİM",
    "Uyuşmazlığın devlet mahkemesi yerine hakemlerce çözülmesi yöntemi.",
    "Usul",
  ],
  ["HAKEM", "Tahkimde uyuşmazlığı çözmek üzere görevlendirilen kişi.", "Usul"],
  [
    "TENSİP",
    "Dava açılınca yargılamanın yürütülmesine ilişkin ilk hazırlık kararları.",
    "Usul",
  ],
  [
    "İTİRAZ",
    "Bir işleme veya karara karşı çıkıldığını bildiren hukuki başvuru.",
    "Usul",
  ],
  [
    "MÜLKİYET",
    "Bir şey üzerinde kullanma, yararlanma ve tasarruf yetkileri veren hak.",
    "Eşya",
  ],
  ["PAYDAŞ", "Paylı mülkiyette belirli bir payın sahibi olan kişi.", "Eşya"],
  [
    "İRTİFAK",
    "Bir eşya üzerinde başkası yararına sınırlı yararlanma sağlayan ayni hak.",
    "Eşya",
  ],
  [
    "REHİN",
    "Bir alacağı güvence altına almak için eşya veya hak üzerinde kurulan teminat.",
    "Eşya",
  ],
  ["TAPU", "Taşınmazlar üzerindeki hakların kaydedildiği resmî sicil.", "Eşya"],
  [
    "TESCİL",
    "Bir hakkın veya hukuki durumun ilgili resmî sicile kaydedilmesi.",
    "Eşya",
  ],
  ["TERKİN", "Bir kaydın ilgili sicilden silinmesi işlemi.", "Eşya"],
  [
    "ŞERH",
    "Bir hususun tapu siciline açıklayıcı veya koruyucu kayıt olarak yazılması.",
    "Eşya",
  ],
  [
    "KADASTRO",
    "Taşınmazların sınır ve hukuki durumlarının belirlenip kayıt altına alınması.",
    "Eşya",
  ],
  ["TAŞINMAZ", "Arazi gibi yerinden taşınamayan mal türü.", "Eşya"],
  ["TAŞINIR", "Bir yerden başka yere taşınabilen eşya türü.", "Eşya"],
  [
    "İYİNİYET",
    "Hukuki bir engeli gerekli özeni gösterdiği hâlde bilmemeyi anlatan kavram.",
    "Medeni",
  ],
  [
    "EHLİYET",
    "Hak sahibi olabilme veya hukuki işlem yapabilme yeterliliği.",
    "Medeni",
  ],
  [
    "ERGİNLİK",
    "Kişinin hukukça yetişkin sayılmasını ifade eden durum.",
    "Medeni",
  ],
  [
    "GAİPLİK",
    "Ölüm tehlikesi içinde kaybolan veya uzun süre haber alınamayan kişi hakkında verilen karar.",
    "Medeni",
  ],
  [
    "HISIMLIK",
    "Kişiler arasında soy, evlilik veya evlat edinmeyle oluşan yakınlık bağı.",
    "Medeni",
  ],
  ["SOYBAĞI", "Çocuk ile ana veya babası arasındaki hukuki bağ.", "Aile"],
  ["NİŞANLANMA", "Birbirleriyle evlenmek üzere karşılıklı söz verme.", "Aile"],
  ["BOŞANMA", "Geçerli evliliğin mahkeme kararıyla sona ermesi.", "Aile"],
  ["TEREKE", "Ölen kişinin mirasa konu hak ve borçlarının bütünü.", "Miras"],
  [
    "MİRASÇI",
    "Ölenin mirasında kanun veya ölüme bağlı tasarrufla hak sahibi olan kişi.",
    "Miras",
  ],
  [
    "TENKİS",
    "Saklı payı aşan ölüme bağlı kazandırmaların kanuni sınıra indirilmesi.",
    "Miras",
  ],
  [
    "EDİM",
    "Borç ilişkisinde borçlunun yerine getirmesi gereken davranış.",
    "Borçlar",
  ],
  ["İFA", "Borçlanılan edimin gereği gibi yerine getirilmesi.", "Borçlar"],
  [
    "ALACAK",
    "Borç ilişkisinde karşı taraftan bir edimi isteme hakkı.",
    "Borçlar",
  ],
  [
    "BORÇLU",
    "Bir borç ilişkisinde edimi yerine getirmekle yükümlü kişi.",
    "Borçlar",
  ],
  [
    "ALACAKLI",
    "Borçludan edimin yerine getirilmesini istemeye yetkili kişi.",
    "Borçlar",
  ],
  [
    "SÖZLEŞME",
    "Tarafların birbirine uygun irade açıklamalarıyla kurulan hukuki işlem.",
    "Borçlar",
  ],
  [
    "İCAP",
    "Bir sözleşmeyi kurmaya yönelik bağlayıcı önerinin geleneksel adı.",
    "Borçlar",
  ],
  ["KABUL", "Sözleşme önerisine uygun olumlu irade açıklaması.", "Borçlar"],
  [
    "GABİN",
    "Sözleşmede zor durumdan veya deneyimsizlikten yararlanılarak sağlanan aşırı yararlanmanın eski adı.",
    "Borçlar",
  ],
  [
    "HİLE",
    "Bir kişiyi hukuki işlem yapmaya yöneltmek için aldatma.",
    "Borçlar",
  ],
  [
    "İKRAH",
    "Kişiyi korkutarak hukuki işlem yapmaya yöneltmenin geleneksel adı.",
    "Borçlar",
  ],
  [
    "MUVAZAA",
    "Tarafların gerçek iradelerine uymayan görünüşte bir işlem yapmaları.",
    "Borçlar",
  ],
  [
    "BUTLAN",
    "Bir hukuki işlemin geçerlilik şartlarındaki eksiklik nedeniyle hükümsüz olması.",
    "Borçlar",
  ],
  [
    "FESİH",
    "Süregelen bir sözleşme ilişkisini ileriye etkili sona erdirme.",
    "Borçlar",
  ],
  [
    "TAKAS",
    "Karşılıklı ve aynı türden borçların kanuni şartlarla birbirini sona erdirmesi.",
    "Borçlar",
  ],
  ["TEMLİK", "Bir hak veya alacağın başka bir kişiye devredilmesi.", "Borçlar"],
  [
    "TEVDİ",
    "Bir şeyin korunmak veya teslim edilmek üzere yetkili yere bırakılması.",
    "Borçlar",
  ],
  [
    "RÜCU",
    "Ödeme yapanın koşulları varsa ilgili kişiden bu tutarı geri istemesi.",
    "Borçlar",
  ],
  [
    "İFLAS",
    "Borçlunun malvarlığının alacaklıların topluca tatmini için tasfiyesine ilişkin süreç.",
    "İcra",
  ],
  [
    "KONKORDATO",
    "Borçlunun alacaklılarla kanuni usulde anlaşarak borçlarını yapılandırması yolu.",
    "İcra",
  ],
  [
    "İCRA",
    "Bir hakkın yetkili organlar aracılığıyla zorla yerine getirilmesi.",
    "İcra",
  ],
  [
    "İHALE",
    "Bir mal veya işin belirlenen usulle teklif sahiplerinden birine verilmesi.",
    "Genel",
  ],
  [
    "ŞÜPHELİ",
    "Soruşturma aşamasında suç şüphesi altında bulunan kişi.",
    "Ceza",
  ],
  [
    "SANIK",
    "Kovuşturma başlayınca hükmün kesinleşmesine kadar suç isnadı altındaki kişi.",
    "Ceza",
  ],
  ["MAĞDUR", "İşlenen suçtan doğrudan zarar gören kişi.", "Ceza"],
  [
    "MÜŞTEKİ",
    "Suça ilişkin şikâyette bulunan kişinin yargılamadaki adı.",
    "Ceza",
  ],
  ["İHBAR", "Bir suç şüphesinin yetkili makamlara bildirilmesi.", "Ceza"],
  [
    "ŞİKAYET",
    "Suçtan zarar görenin ilgili fiil için soruşturma yapılmasını istemesi.",
    "Ceza",
  ],
  [
    "SORUŞTURMA",
    "Suç şüphesinin öğrenilmesinden iddianamenin kabulüne kadarki evre.",
    "Ceza",
  ],
  [
    "KOVUŞTURMA",
    "İddianamenin kabulünden hükmün kesinleşmesine kadarki ceza yargılaması evresi.",
    "Ceza",
  ],
  [
    "İDDİANAME",
    "Savcının suç isnadını ve delillerini açıklayarak kamu davası açılmasını istediği belge.",
    "Ceza",
  ],
  [
    "TUTUKLAMA",
    "Kanuni koşullarla kişinin hâkim kararıyla özgürlüğünün geçici sınırlandırılması.",
    "Ceza",
  ],
  [
    "GÖZALTI",
    "Yakalanan kişinin soruşturma için kanuni süre içinde tutulması.",
    "Ceza",
  ],
  [
    "YAKALAMA",
    "Suç şüphesi veya kanuni başka bir nedenle kişinin fiilen denetim altına alınması.",
    "Ceza",
  ],
  [
    "MÜSADERE",
    "Kanuni şartlarda bir eşyanın veya kazancın devlet mülkiyetine geçirilmesi.",
    "Ceza",
  ],
  [
    "TEŞEBBÜS",
    "Suçun icrasına başlanıp elde olmayan nedenlerle tamamlanamaması.",
    "Ceza",
  ],
  ["İŞTİRAK", "Bir suçun işlenmesine birden fazla kişinin katılması.", "Ceza"],
  ["AZMETTİRME", "Bir kişide suç işleme kararının oluşturulması.", "Ceza"],
  [
    "TEKERRÜR",
    "Önceki mahkûmiyetten sonra kanuni şartlarda yeniden suç işlenmesi.",
    "Ceza",
  ],
  [
    "İNFAZ",
    "Kesinleşen cezanın kanuni usule uygun yerine getirilmesi.",
    "Ceza",
  ],
  [
    "SAVUNMA",
    "Bir iddia veya suçlamaya karşı kişinin kendi görüş ve delillerini sunması.",
    "Genel",
  ],
  [
    "MÜDAFİ",
    "Ceza yargılamasında şüpheli veya sanığın savunmasını yapan avukat.",
    "Ceza",
  ],
  [
    "YÜRÜRLÜK",
    "Bir hukuk kuralının uygulanabilir olarak geçerli bulunduğu durum.",
    "Genel",
  ],
  [
    "ANAYASA",
    "Devletin temel yapısını ve temel hakları düzenleyen üstün hukuk metni.",
    "Anayasa",
  ],
  [
    "KANUN",
    "Yasama organınca anayasada öngörülen usulle kabul edilen genel düzenleme.",
    "Anayasa",
  ],
  [
    "YÖNETMELİK",
    "Kanunların uygulanmasını sağlamak üzere yetkili idarece çıkarılan düzenleme.",
    "İdare",
  ],
  [
    "İPTAL",
    "Bir hukuki işlemin geçerliliğinin yetkili karar veya iradeyle kaldırılması.",
    "Genel",
  ],
  [
    "KAMULAŞTIRMA",
    "Kamu yararı için özel mülkiyetteki taşınmazın kanuni usulle idarece edinilmesi.",
    "İdare",
  ],
] as const;
export const additionalQuestions: Question[] = rows.map(
  ([term, clue, category], i) => ({
    id: `v1q${i + 1}`,
    term,
    clue,
    explanation: clue,
    category,
    difficulty: term.length >= 9 ? 3 : 2,
  }),
);
