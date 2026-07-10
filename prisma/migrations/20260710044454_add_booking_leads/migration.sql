-- CreateTable
CREATE TABLE "BookingLead" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "customerPhone" TEXT NOT NULL,
    "customerName" TEXT,
    "lastService" TEXT,
    "lastContacted" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "isConverted" BOOLEAN NOT NULL DEFAULT false
);
