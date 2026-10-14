// Map data: Africa + Middle East/Gulf region
// Governorate capitals (Egypt) + regional city nodes + coastlines

export const GOV_COORDS: Record<string, { lat: number; lng: number }> = {
  Cairo: { lat: 30.05, lng: 31.25 },
  Giza: { lat: 29.99, lng: 31.13 },
  Alexandria: { lat: 31.2, lng: 29.92 },
  Qalyubia: { lat: 30.33, lng: 31.22 },
  "Port Said": { lat: 31.27, lng: 32.3 },
  Suez: { lat: 29.97, lng: 32.53 },
  Dakahlia: { lat: 31.05, lng: 31.38 },
  Sharqia: { lat: 30.6, lng: 31.5 },
  "Kafr El Sheikh": { lat: 31.11, lng: 30.94 },
  Gharbia: { lat: 30.87, lng: 31.04 },
  Monufia: { lat: 30.41, lng: 30.7 },
  Beheira: { lat: 31.06, lng: 30.42 },
  Ismailia: { lat: 30.6, lng: 32.26 },
  Faiyum: { lat: 29.31, lng: 30.84 },
  "Beni Suef": { lat: 29.07, lng: 31.1 },
  Minya: { lat: 28.1, lng: 30.75 },
  Asyut: { lat: 27.18, lng: 31.19 },
  Sohag: { lat: 26.55, lng: 31.7 },
  Qena: { lat: 26.0, lng: 32.72 },
  Luxor: { lat: 25.69, lng: 32.64 },
  Aswan: { lat: 24.09, lng: 32.9 },
  "Red Sea": { lat: 27.0, lng: 33.8 },
  "New Valley": { lat: 25.52, lng: 30.8 },
  Matrouh: { lat: 31.35, lng: 27.23 },
  "North Sinai": { lat: 31.1, lng: 33.83 },
  "South Sinai": { lat: 28.0, lng: 34.4 },
  Damietta: { lat: 31.42, lng: 31.67 },
};

// Regional city nodes (Gulf + major African cities) — regional network reach
export const REGIONAL_CITIES: { lat: number; lng: number; name: string; nameAr: string }[] = [
  { lat: 24.7, lng: 46.7, name: "Riyadh", nameAr: "الرياض" },
  { lat: 25.2, lng: 55.3, name: "Dubai", nameAr: "دبي" },
  { lat: 25.3, lng: 51.5, name: "Doha", nameAr: "الدوحة" },
  { lat: 29.4, lng: 48.0, name: "Kuwait City", nameAr: "الكويت" },
  { lat: 23.6, lng: 58.5, name: "Muscat", nameAr: "مسقط" },
  { lat: 26.2, lng: 50.6, name: "Manama", nameAr: "المنامة" },
  { lat: 15.5, lng: 32.5, name: "Khartoum", nameAr: "الخرطوم" },
  { lat: 9.0, lng: 38.7, name: "Addis Ababa", nameAr: "أديس أبابا" },
  { lat: -1.3, lng: 36.8, name: "Nairobi", nameAr: "نيروبي" },
  { lat: 6.5, lng: 3.4, name: "Lagos", nameAr: "لاغوس" },
  { lat: 33.6, lng: -7.6, name: "Casablanca", nameAr: "الدار البيضاء" },
  { lat: -26.2, lng: 28.0, name: "Johannesburg", nameAr: "جوهانسبرغ" },
  { lat: 36.8, lng: 3.1, name: "Algiers", nameAr: "الجزائر" },
  { lat: 36.8, lng: 10.2, name: "Tunis", nameAr: "تونس" },
  { lat: 32.9, lng: 13.2, name: "Tripoli", nameAr: "طرابلس" },
];

// Africa coastline (simplified, clockwise from NW Morocco)
export const AFRICA_BORDER: { lat: number; lng: number }[] = [
  { lat: 35.8, lng: -6 }, { lat: 33, lng: -8 }, { lat: 28, lng: -10 }, { lat: 24, lng: -14 },
  { lat: 20, lng: -16 }, { lat: 16, lng: -16 }, { lat: 10, lng: -13 }, { lat: 6, lng: -3 },
  { lat: 4, lng: 2 }, { lat: 0, lng: 8 }, { lat: -5, lng: 12 }, { lat: -10, lng: 13 },
  { lat: -15, lng: 12 }, { lat: -20, lng: 14 }, { lat: -28, lng: 16 }, { lat: -34, lng: 18 },
  { lat: -34, lng: 23 }, { lat: -30, lng: 31 }, { lat: -25, lng: 33 }, { lat: -15, lng: 40 },
  { lat: -5, lng: 39 }, { lat: 2, lng: 46 }, { lat: 8, lng: 50 }, { lat: 11.5, lng: 51 },
  { lat: 11, lng: 43 }, { lat: 15, lng: 40 }, { lat: 19, lng: 37 }, { lat: 22, lng: 37 },
  { lat: 24, lng: 35 }, { lat: 27, lng: 34 }, { lat: 29.5, lng: 34.5 }, { lat: 31, lng: 32.5 },
  { lat: 31, lng: 27 }, { lat: 31, lng: 20 }, { lat: 32, lng: 15 }, { lat: 34, lng: 10 },
  { lat: 35, lng: -1 },
];

// Middle East / Arabian Peninsula + Levant outline (simplified, clockwise from Sinai)
export const MIDEAST_BORDER: { lat: number; lng: number }[] = [
  { lat: 29.5, lng: 34.9 }, { lat: 31, lng: 34.5 }, { lat: 33, lng: 35.3 }, { lat: 35, lng: 35.5 },
  { lat: 36, lng: 36 }, { lat: 37, lng: 38 }, { lat: 37, lng: 41 }, { lat: 36, lng: 42 },
  { lat: 33, lng: 44 }, { lat: 30, lng: 47 }, { lat: 28, lng: 48.5 }, { lat: 26, lng: 50 },
  { lat: 24, lng: 51 }, { lat: 25, lng: 53 }, { lat: 25, lng: 56 }, { lat: 26, lng: 56.5 },
  { lat: 22, lng: 59 }, { lat: 17, lng: 55 }, { lat: 12, lng: 45 }, { lat: 13, lng: 43 },
  { lat: 16, lng: 43 }, { lat: 18, lng: 39 }, { lat: 20, lng: 39 }, { lat: 24, lng: 38 },
  { lat: 28, lng: 35 },
];

// Nile river main path + delta branches
export const NILE_MAIN: { lat: number; lng: number }[] = [
  { lat: 24.09, lng: 32.9 }, { lat: 25.69, lng: 32.64 }, { lat: 26.0, lng: 32.72 },
  { lat: 26.55, lng: 31.7 }, { lat: 27.18, lng: 31.19 }, { lat: 28.1, lng: 30.75 },
  { lat: 29.07, lng: 31.1 }, { lat: 30.05, lng: 31.25 },
];
export const NILE_DAMIETTA: { lat: number; lng: number }[] = [
  { lat: 30.05, lng: 31.25 }, { lat: 30.6, lng: 31.5 }, { lat: 31.05, lng: 31.38 },
  { lat: 31.42, lng: 31.67 }, { lat: 31.5, lng: 32.2 },
];
export const NILE_ROSETTA: { lat: number; lng: number }[] = [
  { lat: 30.05, lng: 31.25 }, { lat: 30.41, lng: 30.7 }, { lat: 31.06, lng: 30.42 },
  { lat: 31.2, lng: 29.92 },
];

// projection bounds — now covers Africa + Middle East/Gulf
export const MAP_BOUNDS = { lngMin: -17, lngMax: 61, latMin: -35, latMax: 38 };
export const MAP_DIMS = { w: 760, h: 700, pad: 24 };

export function project(lat: number, lng: number) {
  const { lngMin, lngMax, latMin, latMax } = MAP_BOUNDS;
  const { w, h, pad } = MAP_DIMS;
  const innerW = w - pad * 2;
  const innerH = h - pad * 2;
  const x = pad + ((lng - lngMin) / (lngMax - lngMin)) * innerW;
  const y = pad + ((latMax - lat) / (latMax - latMin)) * innerH;
  return { x: Math.round(x * 10) / 10, y: Math.round(y * 10) / 10 };
}

export function pathFromCoords(coords: { lat: number; lng: number }[]) {
  return coords
    .map((c, i) => {
      const p = project(c.lat, c.lng);
      return `${i === 0 ? "M" : "L"} ${p.x} ${p.y}`;
    })
    .join(" ");
}
