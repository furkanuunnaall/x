import { additionalQuestions } from "./additionalContent";
export type Question = {
  id: string;
  term: string;
  clue: string;
  explanation: string;
  difficulty: 1 | 2 | 3;
  category: string;
};
const rows: [string, string, string, Question["difficulty"], string][] = [
  [
    "FERAGAT",
    "Davacının, davada istediği sonuçtan tamamen ya da kısmen vazgeçmesi.",
    "Dava talebinden tek taraflı vazgeçmeyi anlatır.",
    1,
    "Usul",
  ],
  [
    "ZİLYETLİK",
    "Bir eşya üzerinde fiilen hâkimiyet kurmayı ifade eden kavram.",
    "Eşyayı fiilen elinde bulunduran kişi malik olmak zorunda değildir.",
    1,
    "Medeni",
  ],
  [
    "İBRA",
    "Alacaklı ile borçlunun anlaşarak borcu tamamen veya kısmen sona erdirmesi.",
    "Borç, yerine getirme olmadan da bu anlaşmayla sona erebilir.",
    1,
    "Borçlar",
  ],
  [
    "İKRAR",
    "Bir tarafın, aleyhine ileri sürülen bir vakıanın doğru olduğunu kabul etmesi.",
    "Mahkeme önündeki kabul, o vakıayı çekişmeli olmaktan çıkarabilir.",
    1,
    "Usul",
  ],
  [
    "TEMERRÜT",
    "İfası gereken borcun, gerekli şartlar oluşmasına rağmen zamanında yerine getirilmemesi.",
    "Sadece gecikme her durumda yeterli değildir; ihtar da gerekebilir.",
    2,
    "Borçlar",
  ],
  [
    "TEMYİZ",
    "Bir kararın üst mahkemede hukuka uygunluk yönünden incelenmesini isteyen kanun yolu.",
    "Hukuk yargısında bu incelemeyi Yargıtay yapar.",
    1,
    "Usul",
  ],
  [
    "İSTİNAF",
    "İlk derece kararını hem olay hem hukuk yönünden üst mahkemeye taşıyan kanun yolu.",
    "Hukuk ve ceza yargısında bölge adliye mahkemesine başvurulur.",
    2,
    "Usul",
  ],
  [
    "TEBLİGAT",
    "Hukuki bir işlemin muhatabına kanuni usulle bildirilmesi.",
    "Sürelerin başlaması çoğu kez bu bildirime bağlıdır.",
    1,
    "Usul",
  ],
  [
    "VEKALET",
    "Bir kişinin, başkasının işini görmeyi veya işlemini yapmayı üstlendiği sözleşme.",
    "İşi üstlenen, verilen görevi sadakat ve özenle yürütür.",
    1,
    "Borçlar",
  ],
  [
    "TAZMİNAT",
    "Bir zararın giderilmesi için ödenen para veya sağlanan karşılık.",
    "Maddi ya da manevi zararın giderilmesine yönelik olabilir.",
    1,
    "Borçlar",
  ],
  [
    "VASİYET",
    "Bir kişinin ölümünden sonra sonuç doğurması için açıkladığı son arzusu.",
    "Geçerliliği, kanundaki şekil şartlarına bağlıdır.",
    1,
    "Miras",
  ],
  [
    "TAHLİYE",
    "Kiracının kiralanan yeri boşaltması için kullanılan hukuki terim.",
    "Kira ilişkisi sona erdiğinde taşınmazın geri verilmesi gündeme gelir.",
    1,
    "Borçlar",
  ],
  [
    "İÇTİHAT",
    "Bir hukuki mesele hakkında mahkemenin yorumuyla oluşan yargısal görüş.",
    "Benzer uyuşmazlıkların çözümünde yol gösterir.",
    2,
    "Genel",
  ],
  [
    "İNTİFA",
    "Başkasına ait bir maldan yararlanma ve onu kullanma yetkisi veren sınırlı ayni hak.",
    "Mülkiyet başkasında kalırken malın getirilerinden yararlanılabilir.",
    2,
    "Eşya",
  ],
  [
    "ZAMANAŞIMI",
    "Belirli sürenin geçmesiyle borçluya alacağa karşı savunma imkânı veren kurum.",
    "Borcu kendiliğinden ortadan kaldırmaz; borçlu bunu ileri sürebilir.",
    2,
    "Borçlar",
  ],
  [
    "HACİZ",
    "Bir alacağın tahsili için borçlunun mal veya haklarına icra yoluyla el konulması.",
    "İcra takibinde alacağı karşılayacak malvarlığı hedeflenir.",
    1,
    "İcra",
  ],
  [
    "İPOTEK",
    "Bir alacağı güvenceye almak üzere taşınmaz üzerinde kurulan rehin hakkı.",
    "Taşınmazın mülkiyeti borçluda veya üçüncü kişide kalabilir.",
    2,
    "Eşya",
  ],
  [
    "KEFALET",
    "Başkasının borcunu ödememesinin sonuçlarından alacaklıya karşı sorumlu olma sözleşmesi.",
    "Güvenceyi bir eşya değil, borca teminat veren kişi sağlar.",
    2,
    "Borçlar",
  ],
  [
    "NAFAKA",
    "Kanunun öngördüğü şartlarda bir kişinin geçimi için yapılan parasal katkı.",
    "Aile ilişkilerinden doğan bakım ve yardım yükümlülüğüyle ilgilidir.",
    1,
    "Aile",
  ],
  [
    "VELAYET",
    "Ana ve babanın küçük çocukları üzerindeki bakım, koruma ve temsil yetki ve görevleri.",
    "Çocuğun yararı, bu yetkilerin kullanılmasında esastır.",
    1,
    "Aile",
  ],
  [
    "VESAYET",
    "Velayet altında olmayan küçükleri ve bazı kısıtlıları korumaya yönelik hukuki kurum.",
    "Koruma altındaki kişi için vasi atanabilir.",
    2,
    "Medeni",
  ],
  [
    "MİRAS",
    "Bir kişinin ölümüyle geride bıraktığı ve mirasçılarına geçen malvarlığı ilişkileri.",
    "Haklarla birlikte devredilebilen borçlar da geçebilir.",
    1,
    "Miras",
  ],
  [
    "DELİL",
    "Bir olayın doğru olup olmadığını ispatlamak için başvurulan araç.",
    "Belge, tanık anlatımı veya bilirkişi incelemesi buna örnektir.",
    1,
    "Usul",
  ],
  [
    "TANIK",
    "Uyuşmazlık konusu olay hakkında bildiklerini mahkemeye anlatan kişi.",
    "Kendi algıladığı olayları aktarır; uzman görüşü vermekle görevli değildir.",
    1,
    "Usul",
  ],
  [
    "BİLİRKİŞİ",
    "Çözümü özel veya teknik bilgi gerektiren konuda görüşüne başvurulan uzman.",
    "Hâkime uzmanlık bilgisi sağlar; hükmü kendisi vermez.",
    2,
    "Usul",
  ],
  [
    "BERAAT",
    "Ceza yargılamasında sanığın mahkûm edilmemesine ilişkin hüküm türü.",
    "Suçun sanık tarafından işlendiğinin sabit olmaması da bu sonucu doğurabilir.",
    1,
    "Ceza",
  ],
  [
    "KAST",
    "Suçun kanuni unsurlarını bilerek ve isteyerek gerçekleştirme.",
    "Failin bilgisi ve iradesi, suçun unsurlarına yönelir.",
    2,
    "Ceza",
  ],
  [
    "TAKSİR",
    "Dikkat ve özen yükümlülüğüne aykırılıkla, istenmeyen suç sonucuna neden olma.",
    "Sonuç istenmez; yükümlülüğe aykırı davranış belirleyicidir.",
    2,
    "Ceza",
  ],
  [
    "UZLAŞTIRMA",
    "Bazı suçlarda şüpheli ile mağdurun tarafsız bir kişi aracılığıyla anlaşmasının arandığı süreç.",
    "Ceza uyuşmazlığında taraflar arasında anlaşma sağlanması amaçlanır.",
    2,
    "Ceza",
  ],
  [
    "ARABULUCULUK",
    "Özel hukuk uyuşmazlığında tarafların tarafsız bir üçüncü kişinin yardımıyla çözüm araması.",
    "Çözüm kararını taraflar verir; üçüncü kişi iletişimi kolaylaştırır.",
    2,
    "Usul",
  ],
];
export const questions: Question[] = rows.map(
  ([term, clue, explanation, difficulty, category], i) => ({
    id: `q${i + 1}`,
    term,
    clue,
    explanation,
    difficulty,
    category,
  }),
);
const originalQuestions = [...questions];
questions.push(...additionalQuestions);
// Every bölüm has its own name, and none of them gives away an answer inside that bölüm.
const fileTitles = [
  "İlk İz",
  "Üst Mahkemeye",
  "Güvence Kasası",
  "Aile Meclisi",
  "Mühür Noktası",
  "Adliye Koridoru",
  "Kanıt Peşinde",
  "Barış Masası",
  "Arazi Kaydı",
  "", // final
  "Kişinin Hakları",
  "Yuva Kurmak",
  "İlk Taahhüt",
  "İrade Sakatlığı",
  "Hesap Kapanışı",
  "Suçun İzinde",
  "Savcılık Kapısı",
  "Karakol Gecesi",
  "Son Kelime",
  "", // final
  "İkinci Celse",
  "Doğru Mahkeme",
  "Tarafsız Bakış",
  "Ayni Haklar",
  "Sınır Taşları",
  "Kişiden Aileye",
  "Veraset Defteri",
  "Akdin Kurulması",
  "Gizli Kusur",
  "", // final
];
export const files = Array.from({ length: 30 }, (_, i) => {
  const id = i + 1,
    final = id % 10 === 0;
  const offset = (i - 5) * 6;
  const pool = final
    ? additionalQuestions.filter((q) => q.difficulty >= 2)
    : additionalQuestions;
  return {
    id,
    kind: final
      ? ("final" as const)
      : id % 5 === 0
        ? ("reward" as const)
        : ("normal" as const),
    title: final
      ? `Final Bölümü ${id / 10}`
      : fileTitles[i],
    questions:
      i < 5
        ? originalQuestions.slice(i * 6, i * 6 + 6)
        : Array.from(
            { length: final ? 9 : 6 },
            (_, j) => pool[(offset + j) % pool.length],
          ),
  };
});
