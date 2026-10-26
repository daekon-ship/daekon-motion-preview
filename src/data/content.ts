// Valódi tartalom – a daekon.hu élő állapotából (2026-10-26) és a tulajdonos által megadott adatokból.
// Új vélemény, referencia vagy állítás csak ellenőrzött forrásból kerülhet ide.

export const LIVE = 'https://daekon.hu'

export const contact = {
  email: 'hello@daekon.hu',
  phone: '+36 30 453 9346',
  phoneHref: 'tel:+36304539346',
  facebook: 'https://www.facebook.com/profile.php?id=61593734641713',
  location: 'Csévharaszt, Magyarország',
}

export const nav = [
  { id: 'munkak', label: 'Munkák' },
  { id: 'szolgaltatasok', label: 'Szolgáltatások' },
  { id: 'tortenet', label: 'Történet' },
  { id: 'velemenyek', label: 'Vélemények' },
  { id: 'kapcsolat', label: 'Kapcsolat' },
] as const

export type Project = {
  slug: string
  name: string
  url: string
  href: string
  label: string
  short: string
  desc: string
  tags: string[]
  alt: string
  note?: string
  caseStudy?: string
}

export const projects: Project[] = [
  {
    slug: 'kiosz',
    name: 'KIOSZ Pizza Napoletana',
    url: 'kioszpizza.hu',
    href: 'https://kioszpizza.hu/',
    label: 'Étterem · Rendelési rendszer',
    short: 'Online rendelési rendszer, Monor',
    desc: 'Saját online rendelési rendszer étteremnek: digitális étlap, kosár és rendelésleadás, rendeléskezelés és adminisztrációs felület.',
    tags: ['Digitális étlap', 'Kosár és rendelés', 'Adminfelület'],
    alt: 'A KIOSZ Pizza online étlapja asztali nézetben',
    caseStudy: `${LIVE}/referenciak/kiosz-pizza/`,
  },
  {
    slug: 'mesegombolyag',
    name: 'Mesegombolyag – Tóth Johanna',
    url: 'mesegombolyag.hu',
    href: 'https://mesegombolyag.hu/',
    label: 'Terápia · Foglalási rendszer',
    short: 'Weboldal, induló foglalási rendszer',
    desc: 'Meseterapeuta weboldala saját időpontfoglaló és programkezelő rendszerrel: egyéni alkalmak, workshopok férőhely-kezeléssel, mobilbarát adminfelület.',
    tags: ['Időpontfoglalás', 'Programkezelés', 'Adminfelület'],
    alt: 'A Mesegombolyag weboldalának nyitóképe a meseterapeutáról',
    note: 'A nyilvános online foglalás indulás előtt áll.',
  },
  {
    slug: 'nefelejcs',
    name: 'Nefelejcs Vendégház',
    url: 'nefelejcsbakonybel.hu',
    href: 'https://nefelejcsbakonybel.hu/',
    label: 'Szállás · Vendégház',
    short: 'Szálláshely-weboldal apartmanokkal',
    desc: 'Bakonybéli vendégház oldala apartmanbemutatóval, külön galériaoldallal és telefonos foglalással.',
    tags: ['Apartmanok', 'Galéria', 'Telefonos foglalás'],
    alt: 'A Nefelejcs Vendégház weboldalának nyitóképe a kerttel és a hegyekkel',
  },
  {
    slug: 'diesel',
    name: 'Diesel Motor Javítás',
    url: 'dieselmotorjavitas.hu',
    href: 'https://dieselmotorjavitas.hu/',
    label: 'Szerviz · Dízelmotor',
    short: 'Szervizweboldal hibabejelentéssel',
    desc: 'Dízelmotor-javító és diagnosztikai szerviz oldala hibabejelentéssel, egyérintéses hívással és géptípusok szerinti felépítéssel.',
    tags: ['Hibabejelentés', 'Géptípusok', 'Mobil szerviz'],
    alt: 'A Diesel Motor Javítás weboldalának nyitóképe egy dízelmotorral',
  },
  {
    slug: 'epuletesmedence',
    name: 'K.T BYGG Hungary Kft.',
    url: 'epuletesmedence.hu',
    href: 'https://epuletesmedence.hu/',
    label: 'Építőipar · Medence',
    short: 'Medence- és házépítő weboldal',
    desc: 'Házépítés, felújítás és medenceépítés: munkafolyamat szerint rendezett galéria és valódi előtte–utána csúszkák.',
    tags: ['Előtte–utána csúszka', 'Fázisos galéria', 'Kattintható hívás'],
    alt: 'A K.T BYGG Hungary Kft. weboldalának nyitóképe',
  },
  {
    slug: 'tetojavito',
    name: 'Kurtán Károly – Tetőjavító Mester',
    url: 'tetojavitomester.hu',
    href: 'https://tetojavitomester.hu/',
    label: 'Építőipar · Tető',
    short: 'Tetőfedő vállalkozás weboldala',
    desc: 'Tetőfedő, kéményjavító és bádogos vállalkozás oldala referenciákkal és helyszíni felmérés kérésével.',
    tags: ['Szolgáltatások', 'Referenciák', 'Felmérés kérése'],
    alt: 'A Tetőjavító Mester weboldalának nyitóképe egy családi házzal',
  },
  {
    slug: 'lapozunk',
    name: 'Lapozunk! – Selyem Róbert',
    url: 'lapozunk.hu',
    href: 'https://lapozunk.hu/',
    label: 'Építőipar · Burkolás',
    short: 'Burkoló weboldal mintalapozóval',
    desc: 'Burkoló vállalkozás oldala interaktív anyagminta-lapozóval és galériával, Kéthelyen és Somogy megyében.',
    tags: ['Anyagminta-lapozó', 'Galéria', 'Kattintható hívás'],
    alt: 'A Lapozunk! weboldalának nyitóképe burkolatmintákkal',
  },
  {
    slug: 'gt',
    name: 'GT-Lakásfelújítás',
    url: 'gt-lakasfelujitas.hu',
    href: 'https://gt-lakasfelujitas.hu/',
    label: 'Építőipar · Felújítás',
    short: 'Felújító vállalkozás weboldala',
    desc: 'Lakás- és házfelújító vállalkozás oldala animált alaprajzos nyitóképpel, szolgáltatásokkal és munkafolyamattal.',
    tags: ['Szolgáltatások', 'Munkafolyamat', 'Működési terület'],
    alt: 'A GT-Lakásfelújítás weboldalának nyitóképe egy alaprajzzal',
  },
  {
    slug: 'rovarirtofiuk',
    name: 'Rovarirtófiúk',
    url: 'rovarirtofiuk.hu',
    href: 'https://rovarirtofiuk.hu/',
    label: 'Szolgáltatás · Kártevőirtás',
    short: 'Kártevőirtó szolgáltatás weboldala',
    desc: 'Kártevőirtó vállalkozás weboldala: szolgáltatások, gyakori kérdések és gyors kapcsolatfelvétel.',
    tags: ['Szolgáltatások', 'GYIK', 'Kapcsolat'],
    alt: 'A Rovarirtófiúk kártevőirtó weboldal nyitóképe asztali nézetben',
  },
]

export type Service = {
  id: string
  no: string
  title: string
  text: string
  more?: { label: string; href: string }
}

// A „more” linkek a daekon.hu meglévő, élő aloldalaira mutatnak.
export const services: Service[] = [
  { id: 'ceges-weboldal', no: '01', title: 'Céges weboldal', text: 'Gyors, mobilbarát oldal, amelyből egyértelmű az ajánlatkérés.', more: { label: 'Weboldalkészítés', href: `${LIVE}/weboldalkeszites/` } },
  { id: 'rendelesi-rendszer', no: '02', title: 'Online rendelési rendszer', text: 'Saját rendelési felület jutalék nélkül, ahogy a KIOSZ Pizzánál.', more: { label: 'Éttermi rendelési rendszer', href: `${LIVE}/ettermi-rendelesi-rendszer/` } },
  { id: 'foglalasi-rendszer', no: '03', title: 'Foglalási rendszer', text: 'Időpontok, ügyfelek és értesítések egy helyen.', more: { label: 'Időpontfoglaló rendszer', href: `${LIVE}/idopontfoglalo-rendszer/` } },
  { id: 'webaruhaz', no: '04', title: 'Webáruház', text: 'Termékek, kosár és rendeléskezelés a saját vállalkozásodra szabva.', more: { label: 'Webáruház', href: `${LIVE}/webshop-keszites/` } },
  { id: 'egyedi-alkalmazas', no: '05', title: 'Egyedi alkalmazás', text: 'A működésedre szabott rendszer, kerülőutak és dupla adminisztráció nélkül.', more: { label: 'Egyedi webalkalmazás', href: `${LIVE}/egyedi-webalkalmazas/` } },
  { id: 'automatizalas', no: '06', title: 'Automatizálás', text: 'Az ismétlődő adminisztrációt automatizálom.', more: { label: 'Üzleti automatizálás', href: `${LIVE}/vallalkozasi-automatizalas/` } },
  { id: 'adminfelulet', no: '07', title: 'Adminfelület', text: 'A tartalmat, a rendeléseket és a foglalásokat te kezeled, fejlesztő nélkül.' },
  { id: 'karbantartas', no: '08', title: 'Karbantartás', text: 'Élesítés után is frissítem és bővítem a rendszert.', more: { label: 'Karbantartás', href: `${LIVE}/weboldal-karbantartas/` } },
]

export const steps = [
  { n: '01', t: 'Megismerem az elképzelésedet', d: 'Átbeszélem veled, mire van szüksége a vállalkozásodnak, hol vész el most idő vagy ügyfél, és mit érdemes fejleszteni.' },
  { n: '02', t: 'Megtervezem', d: 'Elkészítem a látványtervet és a működési tervet, így fejlesztés előtt pontosan látod, mi és hogyan fog működni.' },
  { n: '03', t: 'Kifejlesztem', d: 'Az elfogadott terv alapján, mérföldkövekre bontva építem meg a weboldalt vagy a rendszert. A haladást menet közben is láthatod.' },
  { n: '04', t: 'Tesztelem', d: 'Indulás előtt végigtesztelem a kritikus folyamatokat (rendelés, foglalás, űrlapok, adminfelület) mobilon és asztali gépen.' },
  { n: '05', t: 'Élesítem', d: 'Élesítem, felügyelem és frissítem a rendszert. A további fejlesztések ugyanarra a kódbázisra épülnek.' },
]

// A tulajdonos saját története, szó szerint a daekon.hu „Rólam” szekciójából, idővonalra bontva.
// A 2011 a név korai használata, NEM a vállalkozás alapítási éve.
export const story = [
  {
    mark: '2011',
    title: 'Egy játékosnév és egy WordPress-blog',
    body: [
      'A DAEKON nevet nem a vállalkozásomhoz találtam ki. Már gyerekként ezt használtam az interneten, szinte minden játékban és online közösségben. Egyszerűen hozzám nőtt.',
      'Akkoriban CubeDAEKON néven saját WordPress-blogot is készítettem, ahol játékokról és az engem érdeklő dolgokról írtam. 2011-ben, 14 évesen már saját WordPress-oldalam volt.',
    ],
    link: { label: 'Itt kezdődött minden – CubeDAEKON, 2011', href: 'https://cubedaekon.wordpress.com/' },
  },
  {
    mark: 'Azóta',
    title: 'Minden megváltozott, a név nem',
    body: [
      'Azóta rengeteget változott az internet. A technológia, az eszközök és a lehetőségek is teljesen mások lettek.',
      'Egyvalami viszont nem változott: a DAEKON név.',
    ],
  },
  {
    mark: 'Ma',
    title: 'Saját szoftverfejlesztő vállalkozás',
    body: [
      'Ami 14 évesen egy játékosnév és egy egyszerű WordPress-blog volt, abból mára a saját szoftverfejlesztő vállalkozásom lett.',
      'Vállalkozásoknak fejlesztek weboldalakat, webalkalmazásokat és egyedi szoftvereket. És ami a legjobb? Az első oldalam még mindig elérhető. :)',
    ],
  },
]

export type Review = { name: string; text: string; date: string; approx?: boolean; url: string }

// Szó szerint a daekon.hu/assets/data/reviews.json-ból (frissítve: 2026-10-20). Rövidíteni, átírni tilos.
export const reviews: Review[] = [
  { name: 'Dénes Karner', approx: true, date: '2026-10-16', url: 'https://www.facebook.com/denes.karner/posts/pfbid0HjyDqWW4JNU4o8f34tZGQmbRNfK1P5tX4htTmwfZUprrJnK8DANRFbFFxP3R4pDJl', text: 'A DAEKON munkáin látszik, hogy komolyan veszi, amit csinál. Igényes, modern és egyedi weboldalakat készít, nem csak összedob egy sablont. Az apró részletekre is odafigyel, és törekszik arra, hogy a végeredmény tényleg minőségi legyen. Aki profi weboldalt szeretne, annak bátran ajánlom!' },
  { name: 'Liszkai Rebeka', approx: true, date: '2026-10-15', url: 'https://www.facebook.com/rebeka.liszkai/posts/pfbid03wnfToCTyYkwNSo3pehRyC651TDqGT2GZqTU5RrhT7Hyfbz86LpxAgHrMFNNf4qkl', text: 'Nagyon jó munkát végzett és tényleg odafigyel minden apróságra. Látom, mennyi időt és energiát fektet bele, hogy minden a lehető legjobban sikerüljön.' },
  { name: 'András Vilimszky', approx: true, date: '2026-10-15', url: 'https://www.facebook.com/andras.vilimszky/posts/pfbid02NBbWQP2Ethd8AymTNdaWvpmCyBNcSqqQVkLb4Z6TiDLWToZW6cGo1i8N3aAFXcVYl', text: '100%-os elégedettség, tökéletesre csiszolta minden elvárásomat a honlapommal kapcsolatban.\nCsak ajánlani tudom!' },
  { name: 'Roland Kovács', approx: true, date: '2026-10-15', url: 'https://www.facebook.com/roland.kovacs.7965/posts/pfbid0PGB4DjPGH6zVHrR3XoQAvKwbigQBdgFZ58K3EYzSP2oecJcxuPMgvi1PXXRSfBRCl', text: 'Nagyon igényes, modern és látványos weboldal! Különösen tetszik a letisztult megjelenés és az apró részletekre fordított figyelem. Az egész oldal profi, átgondolt benyomást kelt. Szerintem érdemes megnézni a munkáikat, szép referenciákat mutatnak be!' },
  { name: 'Jenőné Kocsis', approx: true, date: '2026-10-15', url: 'https://www.facebook.com/permalink.php?story_fbid=pfbid0eaNza2eJi1ePXokT1PgKoVBB1y9TLywgjDiTRi5GhoG9QxRmMd4qVwcQtuc9YHhol&id=61567334190570', text: 'Roland nagyon kedves, segítőkész volt. A honlapot nagyon hamar elkészítette, és a szükséges változtatásokat is gyorsan megcsinálta. Ajánlom mindenkinek, ha gyorsan igényes honlapot szeretne.' },
  { name: 'Bense Boglárka', approx: true, date: '2026-10-14', url: 'https://www.facebook.com/boglarka.bense/posts/pfbid034bgUvSeqR4BKmFWDM5vQGaYsHNuFcBz9WyxfFnj72rRLNVZwcoqNHsWLfqpVP4C5l', text: 'Roland nagyon kedves és türelmes volt, minden kérést maximalistán megoldott.' },
  { name: 'Róbert Selyem', approx: true, date: '2026-10-13', url: 'https://www.facebook.com/robert.selyem.37/posts/pfbid0xgQYx4udkJX8t7mWvDj1np4YTFWfkKgo5eZbaVcB9EhWmsPKHExmDBNtZazipAdl', text: 'Nagyon korrekt, meg bízható és kommunikatív!\nCsak ajánlani tudom mindenkinek!' },
  { name: 'András Halász', date: '2026-10-08', url: 'https://www.facebook.com/halassz.andras/posts/pfbid02qcEvxEjgbLxJ1yPCyGEnNgEuKuj9F21VZKtpWYRKXobdSNVBomZPnzkRDC7FT5hTl', text: 'Nagyon elégedett vagyok az elkészült weboldallal. Gyorsan elkészült, minden úgy lett megcsinálva, ahogy kértem, sőt még jobb is lett, mint amire számítottam. A módosításokkal sem volt semmi probléma. Csak ajánlani tudom!' },
]

export const reviewSummary = {
  text: '100% ajánlja · 8 ajánlás a Facebookon',
  checked: '2026. október 20.',
  writeUrl: 'https://www.facebook.com/profile.php?id=61593734641713&sk=reviews',
}

export const faq = [
  { q: 'Mennyibe kerül egy weboldal vagy egyedi rendszer?', a: 'A terjedelemtől és a funkcióktól függ, ezért fix árlistát nem adok. Egy rövid egyeztetés után írásos ajánlatot kapsz, amely pontosan leírja, mit tartalmaz az ár.' },
  { q: 'Mennyi idő alatt készül el?', a: 'A projekt méretétől függ. Az ütemezést az ajánlatban mérföldkövekre bontva adom meg, és menet közben is láthatod, hol tart a munka.' },
  { q: 'Kivel tartom a kapcsolatot a projekt során?', a: 'Velem. A DAEKON egyszemélyes vállalkozás: az egyeztetést, a tervezést, a fejlesztést és az élesítést is én végzem.' },
  { q: 'Csak a környéken vállalsz munkát?', a: 'Nem. Az egész országból vállalok megbízást; az egyeztetés online is működik, a környéken személyesen is.' },
  { q: 'Kezelhetem magam a tartalmat?', a: 'Igen, ha szükséges. Átbeszélem veled, mit szeretnél magad szerkeszteni, és ehhez igazítom az adminfelületet.' },
  { q: 'Mi történik az átadás után?', a: 'Ha kéred, élesítés után is felügyelem és karbantartom a rendszert. A további fejlesztések ugyanarra a kódbázisra épülnek.' },
]

export const legal = [
  { label: 'Adatkezelés', href: `${LIVE}/adatkezeles.html` },
  { label: 'Impresszum', href: `${LIVE}/impresszum.html` },
  { label: 'Felhasználási feltételek', href: `${LIVE}/felhasznalasi-feltetelek.html` },
  { label: 'Ügyfélportál', href: `${LIVE}/projektem/` },
]

export function formatDate(iso: string, approx?: boolean) {
  const [y, m, d] = iso.split('-').map(Number)
  const months = ['január', 'február', 'március', 'április', 'május', 'június', 'július', 'augusztus', 'szeptember', 'október', 'november', 'december']
  return approx ? `${y}. ${months[m - 1]}` : `${y}. ${months[m - 1]} ${d}.`
}
