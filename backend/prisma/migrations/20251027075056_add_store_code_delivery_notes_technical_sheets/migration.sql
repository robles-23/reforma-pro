-- AlterTable
ALTER TABLE "projects" ADD COLUMN     "store_code" TEXT;

-- CreateTable
CREATE TABLE "delivery_notes" (
    "id" TEXT NOT NULL,
    "project_id" TEXT NOT NULL,
    "image_url" TEXT NOT NULL,
    "thumbnail_url" TEXT,
    "file_name" TEXT NOT NULL,
    "file_size" INTEGER NOT NULL,
    "order_index" INTEGER NOT NULL DEFAULT 0,
    "uploaded_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "delivery_notes_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "technical_sheets" (
    "id" TEXT NOT NULL,
    "project_id" TEXT NOT NULL,
    "product_name" TEXT NOT NULL,
    "pdf_url" TEXT NOT NULL,
    "file_name" TEXT NOT NULL,
    "file_size" INTEGER NOT NULL,
    "order_index" INTEGER NOT NULL DEFAULT 0,
    "uploaded_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "technical_sheets_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "delivery_notes_project_id_idx" ON "delivery_notes"("project_id");

-- CreateIndex
CREATE INDEX "delivery_notes_project_id_order_index_idx" ON "delivery_notes"("project_id", "order_index");

-- CreateIndex
CREATE INDEX "technical_sheets_project_id_idx" ON "technical_sheets"("project_id");

-- CreateIndex
CREATE INDEX "technical_sheets_project_id_order_index_idx" ON "technical_sheets"("project_id", "order_index");

-- AddForeignKey
ALTER TABLE "delivery_notes" ADD CONSTRAINT "delivery_notes_project_id_fkey" FOREIGN KEY ("project_id") REFERENCES "projects"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "technical_sheets" ADD CONSTRAINT "technical_sheets_project_id_fkey" FOREIGN KEY ("project_id") REFERENCES "projects"("id") ON DELETE CASCADE ON UPDATE CASCADE;
