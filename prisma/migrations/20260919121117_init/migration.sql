-- CreateTable
CREATE TABLE "Cafe" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "manager" TEXT,
    "phone" TEXT,
    "region" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Cafe_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Equipment" (
    "id" TEXT NOT NULL,
    "espressoMachineBrand" TEXT,
    "espressoMachineModel" TEXT,
    "grinderBrand" TEXT,
    "grinderModel" TEXT,
    "cafeId" TEXT NOT NULL,

    CONSTRAINT "Equipment_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CoffeeLine" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "cafeId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "CoffeeLine_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "QCVisit" (
    "id" TEXT NOT NULL,
    "cafeId" TEXT NOT NULL,
    "coffeeLineId" TEXT NOT NULL,
    "waterTDS" INTEGER,
    "customerDose" DOUBLE PRECISION,
    "customerExtractionMass" DOUBLE PRECISION,
    "customerTime" DOUBLE PRECISION,
    "customerTemperature" DOUBLE PRECISION,
    "customerExtractionPressure" DOUBLE PRECISION,
    "customerPreInfusionEnabled" BOOLEAN NOT NULL DEFAULT false,
    "customerPreInfusionPressure" DOUBLE PRECISION,
    "customerPreInfusionDuration" DOUBLE PRECISION,
    "customerPostInfusionEnabled" BOOLEAN NOT NULL DEFAULT false,
    "customerPostInfusionPressure" DOUBLE PRECISION,
    "customerPostInfusionDuration" DOUBLE PRECISION,
    "extraction" TEXT,
    "body" TEXT,
    "acidity" TEXT,
    "sweetness" TEXT,
    "bitterness" TEXT,
    "tastingNotes" TEXT,
    "diagnosis" TEXT,
    "adjustedDose" DOUBLE PRECISION,
    "adjustedExtractionMass" DOUBLE PRECISION,
    "adjustedTime" DOUBLE PRECISION,
    "adjustedTemperature" DOUBLE PRECISION,
    "adjustedExtractionPressure" DOUBLE PRECISION,
    "adjustedPreInfusionEnabled" BOOLEAN NOT NULL DEFAULT false,
    "adjustedPreInfusionPressure" DOUBLE PRECISION,
    "adjustedPreInfusionDuration" DOUBLE PRECISION,
    "adjustedPostInfusionEnabled" BOOLEAN NOT NULL DEFAULT false,
    "adjustedPostInfusionPressure" DOUBLE PRECISION,
    "adjustedPostInfusionDuration" DOUBLE PRECISION,
    "notes" TEXT,
    "finalStatus" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "QCVisit_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Cafe_slug_key" ON "Cafe"("slug");

-- CreateIndex
CREATE INDEX "Cafe_name_idx" ON "Cafe"("name");

-- CreateIndex
CREATE INDEX "Cafe_region_idx" ON "Cafe"("region");

-- CreateIndex
CREATE UNIQUE INDEX "Equipment_cafeId_key" ON "Equipment"("cafeId");

-- CreateIndex
CREATE INDEX "CoffeeLine_cafeId_idx" ON "CoffeeLine"("cafeId");

-- CreateIndex
CREATE INDEX "QCVisit_cafeId_idx" ON "QCVisit"("cafeId");

-- CreateIndex
CREATE INDEX "QCVisit_coffeeLineId_idx" ON "QCVisit"("coffeeLineId");

-- CreateIndex
CREATE INDEX "QCVisit_createdAt_idx" ON "QCVisit"("createdAt");

-- AddForeignKey
ALTER TABLE "Equipment" ADD CONSTRAINT "Equipment_cafeId_fkey" FOREIGN KEY ("cafeId") REFERENCES "Cafe"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CoffeeLine" ADD CONSTRAINT "CoffeeLine_cafeId_fkey" FOREIGN KEY ("cafeId") REFERENCES "Cafe"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "QCVisit" ADD CONSTRAINT "QCVisit_cafeId_fkey" FOREIGN KEY ("cafeId") REFERENCES "Cafe"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "QCVisit" ADD CONSTRAINT "QCVisit_coffeeLineId_fkey" FOREIGN KEY ("coffeeLineId") REFERENCES "CoffeeLine"("id") ON DELETE CASCADE ON UPDATE CASCADE;
