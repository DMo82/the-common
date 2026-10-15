/** A relevant picture for every story, event and business. Never returns an empty string. */
const RULES: [RegExp, string][] = [
  [/pizza|franco manca/, "/places/pizza.jpg"],
  [/burger|honest/, "/places/burger.jpg"],
  [/ramen|sushi|japanese|taro/, "/places/japanese.jpg"],
  [/portuguese|estrela/, "/places/portuguese.jpg"],
  [/museum|gallery|war|nightingale|palace|cinema museum/, "/places/museum.jpg"],
  [/cinema|bfi|film/, "/places/cinema.jpg"],
  [/theatre|playhouse|old vic|national theatre/, "/news/theatre.jpg"],
  [/park|lido|brockwell/, "/places/park.jpg"],
  [/farm|animal/, "/places/farm.jpg"],
  [/market|village|pop brixton|stall/, "/places/market.jpg"],
  [/eye|shrek|southbank|attraction|river/, "/places/attraction.jpg"],
  [/beauty|studio|nail|lash|wax|be u/, "/places/beu.jpg"],
  [/deli|sandwich|buddy/, "/places/buddys-deli.jpg"],
  [/coffee|cafe|brunch|bakery|bun/, "/places/buddys-coffee.jpg"],
  [/pub|arms|tap|brew|barrel|bar\b/, "/places/pub.jpg"],
  [/bus|road|lane|traffic/, "/news/bus.jpg"],
  [/police|crime/, "/news/tulse-police.jpg"],
  [/hospital|clinic|health/, "/news/stockwell-hospital.jpg"],
  [/library|book/, "/news/norbury-library.jpg"],
  [/water|flood/, "/news/kennington-water.jpg"],
  [/music|jazz|choir|acoustic|band/, "/events/music.jpg"],
  [/art|gallery|poetry|photo|zine/, "/events/arts.jpg"],
  [/family|picnic|play/, "/events/family.jpg"],
  [/food|supper|harvest/, "/events/supper.jpg"],
  [/walk|community/, "/events/community.jpg"],
];

export function pictureFor(text: string, kind: "news" | "event" | "business" | "listing" = "business") {
  const hay = text.toLowerCase();
  for (const [pattern, path] of RULES) if (pattern.test(hay)) return path;
  if (kind === "news") return "/news/brixton.jpg";
  if (kind === "event") return "/events/community.jpg";
  if (kind === "listing") return "/market/table.jpg";
  return "/places/the-common.jpg";
}

export const DEFAULT_LOGO = "/brand/default-logo.png";

/** Uploaded logo first, then a known brand mark, otherwise the circle mark. */
export function logoFor(uploaded?: string, id?: string) {
  if (uploaded) return uploaded;
  if (id && LOGOS[id]) return LOGOS[id];
  return DEFAULT_LOGO;
}

export const LOGOS: Record<string, string> = {
  "biz_c762742e-99e8-6685-dde4-c454d0e62d66": "/logos/iwm.png",
  "biz_9cfc041a-2cdb-a883-d4d6-34a08dbb0074": "/logos/garden-museum.png",
  "biz_4e306ba0-1d4e-4743-8436-a97472478dcd": "/logos/nightingale.png",
  "biz_a946cac4-7f40-6ed3-e74f-4c785792c0b9": "/logos/cinema-museum.png",
  "biz_4ac74d64-e415-f892-0540-ecfd336751c8": "/logos/southbank.png",
  "biz_ea6ebbda-fc8d-f524-ae81-ae83a19caeb3": "/logos/national-theatre.png",
  "biz_0b2ae4d7-a516-c0a6-b2d5-affffae77af0": "/logos/bfi.png",
  "biz_e306f733-f33f-f592-e53f-82db18629f59": "/logos/old-vic.png",
  "biz_f6a2ae7e-b044-5b68-2339-5a1ccfa39431": "/logos/vaults.png",
  "biz_b69631eb-d62e-7402-df02-bb9356b55a0a": "/logos/brixton-village.png",
  "biz_dacbe44e-aad2-3d95-3618-215ca5afcbfc": "/logos/pop-brixton.png",
  "biz_098e1cf2-6a14-2041-130e-b87894e918ab": "/logos/london-eye.png",
  "biz_89de6287-11a9-8b26-c73a-39be82fca42c": "/logos/shrek.png",
  "biz_21b92782-7f56-8b5e-ed9c-d4e8e7765e05": "/logos/city-farm.png",
  "biz_6ce08156-3437-beff-0cf3-b3868d6ac1ef": "/logos/franco-manca.png",
  "biz_9e9b29ea-0f6d-2f06-652c-f7adbf17bb37": "/logos/honest.png",
};
