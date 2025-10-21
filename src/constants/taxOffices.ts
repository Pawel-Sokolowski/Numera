/**
 * Polish Tax Offices (Urzędy Skarbowe)
 * Comprehensive list of tax offices in Poland organized by voivodeship
 */

export interface TaxOffice {
  id: string;
  name: string;
  voivodeship: string;
  city: string;
  address?: string;
  postalCode?: string;
  phone?: string;
}

export const TAX_OFFICES: TaxOffice[] = [
  // Mazowieckie (Warsaw and surrounding areas)
  { id: 'US-WAW-BEMOWO', name: 'US Warszawa-Bemowo', voivodeship: 'mazowieckie', city: 'Warszawa' },
  {
    id: 'US-WAW-BIALOLEKA',
    name: 'US Warszawa-Białołęka',
    voivodeship: 'mazowieckie',
    city: 'Warszawa',
  },
  {
    id: 'US-WAW-BIELANY',
    name: 'US Warszawa-Bielany',
    voivodeship: 'mazowieckie',
    city: 'Warszawa',
  },
  {
    id: 'US-WAW-MOKOTOW',
    name: 'US Warszawa-Mokotów',
    voivodeship: 'mazowieckie',
    city: 'Warszawa',
  },
  { id: 'US-WAW-PRAGA', name: 'US Warszawa-Praga', voivodeship: 'mazowieckie', city: 'Warszawa' },
  {
    id: 'US-WAW-SRODMIESCIE',
    name: 'US Warszawa-Śródmieście',
    voivodeship: 'mazowieckie',
    city: 'Warszawa',
  },
  {
    id: 'US-WAW-TARGOWEK',
    name: 'US Warszawa-Targówek',
    voivodeship: 'mazowieckie',
    city: 'Warszawa',
  },
  {
    id: 'US-WAW-URSYNOW',
    name: 'US Warszawa-Ursynów',
    voivodeship: 'mazowieckie',
    city: 'Warszawa',
  },
  { id: 'US-WAW-WAWER', name: 'US Warszawa-Wawer', voivodeship: 'mazowieckie', city: 'Warszawa' },
  { id: 'US-WAW-WOLA', name: 'US Warszawa-Wola', voivodeship: 'mazowieckie', city: 'Warszawa' },
  { id: 'US-RADOM', name: 'US Radom', voivodeship: 'mazowieckie', city: 'Radom' },
  { id: 'US-PLOCK', name: 'US Płock', voivodeship: 'mazowieckie', city: 'Płock' },
  { id: 'US-SIEDLCE', name: 'US Siedlce', voivodeship: 'mazowieckie', city: 'Siedlce' },
  { id: 'US-OSTROLEKA', name: 'US Ostrołęka', voivodeship: 'mazowieckie', city: 'Ostrołęka' },

  // Wielkopolskie (Poznań and surrounding areas)
  {
    id: 'US-POZ-GRUNWALD',
    name: 'US Poznań-Grunwald',
    voivodeship: 'wielkopolskie',
    city: 'Poznań',
  },
  {
    id: 'US-POZ-NOWE-MIASTO',
    name: 'US Poznań-Nowe Miasto',
    voivodeship: 'wielkopolskie',
    city: 'Poznań',
  },
  {
    id: 'US-POZ-WINOGRADY',
    name: 'US Poznań-Winogrady',
    voivodeship: 'wielkopolskie',
    city: 'Poznań',
  },
  { id: 'US-KALISZ', name: 'US Kalisz', voivodeship: 'wielkopolskie', city: 'Kalisz' },
  { id: 'US-KONIN', name: 'US Konin', voivodeship: 'wielkopolskie', city: 'Konin' },
  { id: 'US-PILA', name: 'US Piła', voivodeship: 'wielkopolskie', city: 'Piła' },
  { id: 'US-LESZNO', name: 'US Leszno', voivodeship: 'wielkopolskie', city: 'Leszno' },

  // Małopolskie (Kraków and surrounding areas)
  {
    id: 'US-KRK-KROWODRZA',
    name: 'US Kraków-Krowodrza',
    voivodeship: 'małopolskie',
    city: 'Kraków',
  },
  {
    id: 'US-KRK-NOWA-HUTA',
    name: 'US Kraków-Nowa Huta',
    voivodeship: 'małopolskie',
    city: 'Kraków',
  },
  { id: 'US-KRK-PODGORZE', name: 'US Kraków-Podgórze', voivodeship: 'małopolskie', city: 'Kraków' },
  { id: 'US-KRK-PRADNIK', name: 'US Kraków-Prądnik', voivodeship: 'małopolskie', city: 'Kraków' },
  {
    id: 'US-KRK-STARE-MIASTO',
    name: 'US Kraków-Stare Miasto',
    voivodeship: 'małopolskie',
    city: 'Kraków',
  },
  { id: 'US-NOWY-SACZ', name: 'US Nowy Sącz', voivodeship: 'małopolskie', city: 'Nowy Sącz' },
  { id: 'US-TARNOW', name: 'US Tarnów', voivodeship: 'małopolskie', city: 'Tarnów' },

  // Śląskie (Katowice and surrounding areas)
  { id: 'US-KATOWICE', name: 'US Katowice', voivodeship: 'śląskie', city: 'Katowice' },
  { id: 'US-SOSNOWIEC', name: 'US Sosnowiec', voivodeship: 'śląskie', city: 'Sosnowiec' },
  { id: 'US-BYTOM', name: 'US Bytom', voivodeship: 'śląskie', city: 'Bytom' },
  { id: 'US-GLIWICE', name: 'US Gliwice', voivodeship: 'śląskie', city: 'Gliwice' },
  { id: 'US-ZABRZE', name: 'US Zabrze', voivodeship: 'śląskie', city: 'Zabrze' },
  {
    id: 'US-BIELSKO-BIALA',
    name: 'US Bielsko-Biała',
    voivodeship: 'śląskie',
    city: 'Bielsko-Biała',
  },
  { id: 'US-CZESTOCHOWA', name: 'US Częstochowa', voivodeship: 'śląskie', city: 'Częstochowa' },
  { id: 'US-RYBNIK', name: 'US Rybnik', voivodeship: 'śląskie', city: 'Rybnik' },
  { id: 'US-TYCHY', name: 'US Tychy', voivodeship: 'śląskie', city: 'Tychy' },

  // Dolnośląskie (Wrocław and surrounding areas)
  {
    id: 'US-WRO-FABRYCZNA',
    name: 'US Wrocław-Fabryczna',
    voivodeship: 'dolnośląskie',
    city: 'Wrocław',
  },
  { id: 'US-WRO-KRZYKI', name: 'US Wrocław-Krzyki', voivodeship: 'dolnośląskie', city: 'Wrocław' },
  {
    id: 'US-WRO-PSIE-POLE',
    name: 'US Wrocław-Psie Pole',
    voivodeship: 'dolnośląskie',
    city: 'Wrocław',
  },
  {
    id: 'US-WRO-STARE-MIASTO',
    name: 'US Wrocław-Stare Miasto',
    voivodeship: 'dolnośląskie',
    city: 'Wrocław',
  },
  { id: 'US-WALBRZYCH', name: 'US Wałbrzych', voivodeship: 'dolnośląskie', city: 'Wałbrzych' },
  { id: 'US-LEGNICA', name: 'US Legnica', voivodeship: 'dolnośląskie', city: 'Legnica' },
  {
    id: 'US-JELENIA-GORA',
    name: 'US Jelenia Góra',
    voivodeship: 'dolnośląskie',
    city: 'Jelenia Góra',
  },

  // Pomorskie (Gdańsk and surrounding areas)
  { id: 'US-GDA-POLNOC', name: 'US Gdańsk-Północ', voivodeship: 'pomorskie', city: 'Gdańsk' },
  { id: 'US-GDA-POLUDNIE', name: 'US Gdańsk-Południe', voivodeship: 'pomorskie', city: 'Gdańsk' },
  { id: 'US-GDA-WRZESZCZ', name: 'US Gdańsk-Wrzeszcz', voivodeship: 'pomorskie', city: 'Gdańsk' },
  { id: 'US-GDYNIA', name: 'US Gdynia', voivodeship: 'pomorskie', city: 'Gdynia' },
  { id: 'US-SOPOT', name: 'US Sopot', voivodeship: 'pomorskie', city: 'Sopot' },
  { id: 'US-SLUPSK', name: 'US Słupsk', voivodeship: 'pomorskie', city: 'Słupsk' },

  // Łódzkie (Łódź and surrounding areas)
  { id: 'US-LODZ-BAŁUTY', name: 'US Łódź-Bałuty', voivodeship: 'łódzkie', city: 'Łódź' },
  { id: 'US-LODZ-GORNA', name: 'US Łódź-Górna', voivodeship: 'łódzkie', city: 'Łódź' },
  { id: 'US-LODZ-POLESIE', name: 'US Łódź-Polesie', voivodeship: 'łódzkie', city: 'Łódź' },
  { id: 'US-LODZ-SRODMIESCIE', name: 'US Łódź-Śródmieście', voivodeship: 'łódzkie', city: 'Łódź' },
  {
    id: 'US-PIOTRKOW-TRYBUNALSKI',
    name: 'US Piotrków Trybunalski',
    voivodeship: 'łódzkie',
    city: 'Piotrków Trybunalski',
  },

  // Kujawsko-Pomorskie
  {
    id: 'US-BYDGOSZCZ',
    name: 'US Bydgoszcz',
    voivodeship: 'kujawsko-pomorskie',
    city: 'Bydgoszcz',
  },
  { id: 'US-TORUN', name: 'US Toruń', voivodeship: 'kujawsko-pomorskie', city: 'Toruń' },
  {
    id: 'US-WLOCLAWEK',
    name: 'US Włocławek',
    voivodeship: 'kujawsko-pomorskie',
    city: 'Włocławek',
  },

  // Lubelskie
  { id: 'US-LUBLIN', name: 'US Lublin', voivodeship: 'lubelskie', city: 'Lublin' },
  { id: 'US-ZAMOSC', name: 'US Zamość', voivodeship: 'lubelskie', city: 'Zamość' },
  {
    id: 'US-BIALA-PODLASKA',
    name: 'US Biała Podlaska',
    voivodeship: 'lubelskie',
    city: 'Biała Podlaska',
  },
  { id: 'US-CHELM', name: 'US Chełm', voivodeship: 'lubelskie', city: 'Chełm' },

  // Lubuskie
  {
    id: 'US-GORZOW-WIELKOPOLSKI',
    name: 'US Gorzów Wielkopolski',
    voivodeship: 'lubuskie',
    city: 'Gorzów Wielkopolski',
  },
  { id: 'US-ZIELONA-GORA', name: 'US Zielona Góra', voivodeship: 'lubuskie', city: 'Zielona Góra' },

  // Opolskie
  { id: 'US-OPOLE', name: 'US Opole', voivodeship: 'opolskie', city: 'Opole' },

  // Podkarpackie
  { id: 'US-RZESZOW', name: 'US Rzeszów', voivodeship: 'podkarpackie', city: 'Rzeszów' },
  { id: 'US-KROSNO', name: 'US Krosno', voivodeship: 'podkarpackie', city: 'Krosno' },
  { id: 'US-PRZEMYSL', name: 'US Przemyśl', voivodeship: 'podkarpackie', city: 'Przemyśl' },
  { id: 'US-TARNOBRZEG', name: 'US Tarnobrzeg', voivodeship: 'podkarpackie', city: 'Tarnobrzeg' },

  // Podlaskie
  { id: 'US-BIALYSTOK', name: 'US Białystok', voivodeship: 'podlaskie', city: 'Białystok' },
  { id: 'US-LOMZA', name: 'US Łomża', voivodeship: 'podlaskie', city: 'Łomża' },
  { id: 'US-SUWALKI', name: 'US Suwałki', voivodeship: 'podlaskie', city: 'Suwałki' },

  // Świętokrzyskie
  { id: 'US-KIELCE', name: 'US Kielce', voivodeship: 'świętokrzyskie', city: 'Kielce' },

  // Warmińsko-Mazurskie
  { id: 'US-OLSZTYN', name: 'US Olsztyn', voivodeship: 'warmińsko-mazurskie', city: 'Olsztyn' },
  { id: 'US-ELBLAG', name: 'US Elbląg', voivodeship: 'warmińsko-mazurskie', city: 'Elbląg' },
  { id: 'US-ELBLAG', name: 'US Elbląg', voivodeship: 'warmińsko-mazurskie', city: 'Elbląg' },

  // Zachodniopomorskie
  { id: 'US-SZCZECIN', name: 'US Szczecin', voivodeship: 'zachodniopomorskie', city: 'Szczecin' },
  { id: 'US-KOSZALIN', name: 'US Koszalin', voivodeship: 'zachodniopomorskie', city: 'Koszalin' },
];

/**
 * Get tax offices by voivodeship
 */
export function getTaxOfficesByVoivodeship(voivodeship: string): TaxOffice[] {
  return TAX_OFFICES.filter((office) => office.voivodeship === voivodeship);
}

/**
 * Get all voivodeships (unique list)
 */
export function getVoivodeships(): string[] {
  const voivodeships = new Set(TAX_OFFICES.map((office) => office.voivodeship));
  return Array.from(voivodeships).sort();
}

/**
 * Find tax office by ID
 */
export function getTaxOfficeById(id: string): TaxOffice | undefined {
  return TAX_OFFICES.find((office) => office.id === id);
}

/**
 * Get tax offices by city
 */
export function getTaxOfficesByCity(city: string): TaxOffice[] {
  return TAX_OFFICES.filter((office) => office.city.toLowerCase() === city.toLowerCase());
}
