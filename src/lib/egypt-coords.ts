// Egypt governorate capital coordinates (lat, lng) for map projection
// + Egypt border outline + Nile river path

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

// Egypt border outline (lat, lng) clockwise from NW
export const EGYPT_BORDER: { lat: number; lng: number }[] = [
  { lat: 31.7, lng: 24.8 },
  { lat: 31.7, lng: 27.0 },
  { lat: 31.45, lng: 29.0 },
  { lat: 31.5, lng: 30.5 },
  { lat: 31.5, lng: 32.2 },
  { lat: 31.35, lng: 32.6 },
  { lat: 31.3, lng: 33.7 },
  { lat: 31.3, lng: 34.3 },
  { lat: 29.5, lng: 34.9 },
  { lat: 28.2, lng: 34.55 },
  { lat: 27.0, lng: 34.1 },
  { lat: 25.5, lng: 34.9 },
  { lat: 23.8, lng: 35.6 },
  { lat: 22.0, lng: 36.6 },
  { lat: 22.0, lng: 25.0 },
  { lat: 22.0, lng: 25.0 },
];

// Nile river main path (south → north) then delta branches
export const NILE_MAIN: { lat: number; lng: number }[] = [
  { lat: 24.09, lng: 32.9 },
  { lat: 25.69, lng: 32.64 },
  { lat: 26.0, lng: 32.72 },
  { lat: 26.55, lng: 31.7 },
  { lat: 27.18, lng: 31.19 },
  { lat: 28.1, lng: 30.75 },
  { lat: 29.07, lng: 31.1 },
  { lat: 30.05, lng: 31.25 },
];

export const NILE_DAMIETTA: { lat: number; lng: number }[] = [
  { lat: 30.05, lng: 31.25 },
  { lat: 30.6, lng: 31.5 },
  { lat: 31.05, lng: 31.38 },
  { lat: 31.42, lng: 31.67 },
  { lat: 31.5, lng: 32.2 },
];

export const NILE_ROSETTA: { lat: number; lng: number }[] = [
  { lat: 30.05, lng: 31.25 },
  { lat: 30.41, lng: 30.7 },
  { lat: 31.06, lng: 30.42 },
  { lat: 31.2, lng: 29.92 },
];

// projection bounds
export const MAP_BOUNDS = { lngMin: 24.5, lngMax: 36.7, latMin: 21.5, latMax: 31.9 };
export const MAP_DIMS = { w: 600, h: 720, pad: 30 };

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
