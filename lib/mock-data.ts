export type Equipment = {
  espressoMachineBrand: string;
  espressoMachineModel: string;
  grinderBrand: string;
  grinderModel: string;
};

export type CoffeeLine = {
  id: string;
  name: string;
};

export type Cafe = {
  id: string;
  slug: string;
  name: string;
  manager: string;
  phone: string;
  region: string;
  lastQCVisit: string;
  equipment: Equipment;
  coffeeLines: CoffeeLine[];
};

export function generateSlug(name: string) {
  return name
    .toLowerCase()
    .trim()
    .replace(/[^\p{L}\p{N}]+/gu, "-")
    .replace(/^-+|-+$/g, "");
}

export const cafes: Cafe[] = [
  {
    id: "5",
    slug: "کافه-هایدلبرگ",
    name: "کافه هایدلبرگ",
    manager: "علی احمدی",
    phone: "09120000001",
    region: "پاسداران",
    lastQCVisit: "2026-09-14",

    equipment: {
      espressoMachineBrand: "لا مارزوکو",
      espressoMachineModel: "Linea Classic",
      grinderBrand: "مازر",
      grinderModel: "Super Jolly",
    },

    coffeeLines: [
      {
        id: "line-101",
        name: "لاین ۱۰۱",
      },
      {
        id: "ethiopia",
        name: "اتیوپیا",
      },
    ],
  },
  {
    id: "1",
    slug: "کافه-هایدلبرگ",
    name: "کافه هایدلبرگ",
    manager: "علی احمدی",
    phone: "09120000001",
    region: "پاسداران",
    lastQCVisit: "2026-09-14",

    equipment: {
      espressoMachineBrand: "لا مارزوکو",
      espressoMachineModel: "Linea Classic",
      grinderBrand: "مازر",
      grinderModel: "Super Jolly",
    },

    coffeeLines: [
      {
        id: "line-101",
        name: "لاین ۱۰۱",
      },
      {
        id: "ethiopia",
        name: "اتیوپیا",
      },
    ],
  },
  {
    id: "2",
    slug: "کافه-هایدلبرگ",
    name: "کافه هایدلبرگ",
    manager: "علی احمدی",
    phone: "09120000001",
    region: "پاسداران",
    lastQCVisit: "2026-09-14",

    equipment: {
      espressoMachineBrand: "لا مارزوکو",
      espressoMachineModel: "Linea Classic",
      grinderBrand: "مازر",
      grinderModel: "Super Jolly",
    },

    coffeeLines: [
      {
        id: "line-101",
        name: "لاین ۱۰۱",
      },
      {
        id: "ethiopia",
        name: "اتیوپیا",
      },
    ],
  },

  {
    id: "3",
    slug: "کافه-x",
    name: "کافه ایکس",
    manager: "سارا محمدی",
    phone: "09120000002",
    region: "تجریش",
    lastQCVisit: "2026-09-16",

    equipment: {
      espressoMachineBrand: "نووا سیمونلی",
      espressoMachineModel: "Appia",
      grinderBrand: "مازر",
      grinderModel: "Mini",
    },

    coffeeLines: [
      {
        id: "line-102",
        name: "لاین ۱۰۲",
      },
    ],
  },

  {
    id: "4",
    slug: "کافه-y",
    name: "کافه وای",
    manager: "رضا کریمی",
    phone: "09120000003",
    region: "ونک",
    lastQCVisit: "2026-09-10",

    equipment: {
      espressoMachineBrand: "لا مارزوکو",
      espressoMachineModel: "Linea Mini",
      grinderBrand: "اورکا",
      grinderModel: "Atom",
    },

    coffeeLines: [
      {
        id: "line-101-y",
        name: "لاین ۱۰۱",
      },
      {
        id: "line-102-y",
        name: "لاین ۱۰۲",
      },
      {
        id: "ethiopia-y",
        name: "اتیوپیا",
      },
    ],
  },
];
