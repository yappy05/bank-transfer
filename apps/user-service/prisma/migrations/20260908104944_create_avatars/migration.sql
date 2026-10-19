-- CreateTable
CREATE TABLE "avatars" (
    "id" TEXT NOT NULL,
    "file_path" TEXT NOT NULL,
    "user_id" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "deleted_at" TIMESTAMP(3),

    CONSTRAINT "avatars_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "avatars_id_user_id_idx" ON "avatars"("id", "user_id") where "deleted_at" is null;

-- AddForeignKey
ALTER TABLE "avatars" ADD CONSTRAINT "avatars_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;
