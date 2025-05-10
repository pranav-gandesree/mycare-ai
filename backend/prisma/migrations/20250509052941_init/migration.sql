-- CreateTable
CREATE TABLE "tools" (
    "id" SERIAL NOT NULL,
    "questionId" TEXT NOT NULL,
    "mainQuestion" TEXT NOT NULL,
    "question" TEXT NOT NULL,
    "answer" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "options" TEXT[],

    CONSTRAINT "tools_pkey" PRIMARY KEY ("id")
);
