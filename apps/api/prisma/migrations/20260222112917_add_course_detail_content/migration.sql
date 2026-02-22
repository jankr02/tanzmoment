-- AlterTable
ALTER TABLE "courses" ADD COLUMN     "detailContent" JSONB,
ADD COLUMN     "metaDescription" TEXT,
ADD COLUMN     "metaTitle" TEXT,
ADD COLUMN     "ogImageUrl" TEXT;
