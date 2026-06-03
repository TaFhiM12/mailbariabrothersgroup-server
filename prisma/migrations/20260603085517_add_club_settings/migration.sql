-- CreateTable
CREATE TABLE "club_settings" (
    "id" TEXT NOT NULL,
    "clubName" TEXT NOT NULL DEFAULT 'Savings Club',
    "monthlySavingAmount" DECIMAL(10,2) NOT NULL,
    "paymentDeadlineDay" INTEGER NOT NULL DEFAULT 10,
    "reminderEnabled" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "club_settings_pkey" PRIMARY KEY ("id")
);
