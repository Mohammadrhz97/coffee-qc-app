export type Equipment = {
  id?: string;

  espressoMachineBrand: string | null;
  espressoMachineModel: string | null;

  grinderBrand: string | null;
  grinderModel: string | null;
};

export type CoffeeLine = {
  id: string;
  name: string;
};

export type Cafe = {
  id: string;
  name: string;
  slug: string;

  manager: string | null;
  phone: string | null;
  region: string | null;

  equipment: Equipment | null;
  coffeeLines: CoffeeLine[];
};
