-- CreateTable
CREATE TABLE "budgets" (
    "id" TEXT NOT NULL,
    "project_id" TEXT NOT NULL,
    "image_url" TEXT NOT NULL,
    "thumbnail_url" TEXT,
    "file_name" TEXT NOT NULL,
    "file_size" INTEGER NOT NULL,
    "order_index" INTEGER NOT NULL DEFAULT 0,
    "uploaded_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "budgets_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "electronic_invoices" (
    "id" TEXT NOT NULL,
    "project_id" TEXT NOT NULL,
    "image_url" TEXT NOT NULL,
    "thumbnail_url" TEXT,
    "file_name" TEXT NOT NULL,
    "file_size" INTEGER NOT NULL,
    "order_index" INTEGER NOT NULL DEFAULT 0,
    "uploaded_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "electronic_invoices_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "budgets_project_id_idx" ON "budgets"("project_id");

-- CreateIndex
CREATE INDEX "budgets_project_id_order_index_idx" ON "budgets"("project_id", "order_index");

-- CreateIndex
CREATE INDEX "electronic_invoices_project_id_idx" ON "electronic_invoices"("project_id");

-- CreateIndex
CREATE INDEX "electronic_invoices_project_id_order_index_idx" ON "electronic_invoices"("project_id", "order_index");

-- AddForeignKey
ALTER TABLE "budgets" ADD CONSTRAINT "budgets_project_id_fkey" FOREIGN KEY ("project_id") REFERENCES "projects"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "electronic_invoices" ADD CONSTRAINT "electronic_invoices_project_id_fkey" FOREIGN KEY ("project_id") REFERENCES "projects"("id") ON DELETE CASCADE ON UPDATE CASCADE;
