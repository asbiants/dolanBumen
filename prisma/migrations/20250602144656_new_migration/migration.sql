-- CreateEnum
CREATE TYPE "JenisKendaraan" AS ENUM ('MOTOR', 'MOBIL', 'BIG_BUS', 'MINI_BUS', 'SEPEDA');

-- CreateEnum
CREATE TYPE "Role" AS ENUM ('super_admin', 'tourism_admin', 'consumer');

-- CreateEnum
CREATE TYPE "UserStatus" AS ENUM ('active', 'inactive');

-- CreateEnum
CREATE TYPE "DestinationStatus" AS ENUM ('active', 'inactive');

-- CreateEnum
CREATE TYPE "PhotoType" AS ENUM ('main', 'gallery');

-- CreateEnum
CREATE TYPE "TicketType" AS ENUM ('weekday', 'weekend', 'holiday');

-- CreateEnum
CREATE TYPE "TicketStatus" AS ENUM ('available', 'unavailable');

-- CreateEnum
CREATE TYPE "ComplaintStatus" AS ENUM ('new', 'in_progress', 'resolved', 'rejected');

-- CreateTable
CREATE TABLE "users" (
    "id" TEXT NOT NULL,
    "name" TEXT,
    "email" TEXT NOT NULL,
    "emailVerified" TIMESTAMP(3),
    "image" TEXT,
    "password" TEXT,
    "phone_number" TEXT,
    "address" TEXT,
    "role" "Role" NOT NULL DEFAULT 'consumer',
    "status" "UserStatus" NOT NULL DEFAULT 'active',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "users_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "booking_transaction" (
    "id" SERIAL NOT NULL,
    "nama" TEXT NOT NULL,
    "phone" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "kendaraan" "JenisKendaraan" NOT NULL,
    "jumlah_kendaraan" INTEGER NOT NULL,
    "customer_bank_name" TEXT NOT NULL,
    "customer_bank_account" TEXT NOT NULL,
    "customer_bank_number" TEXT NOT NULL,
    "proof" TEXT NOT NULL,
    "tanggal" TIMESTAMP(3) NOT NULL,
    "harga_satuan" INTEGER NOT NULL,
    "total_amount" INTEGER NOT NULL,
    "is_paid" BOOLEAN NOT NULL,
    "quantity" INTEGER NOT NULL,
    "booking_trx_id" TEXT NOT NULL,
    "destinasi_wisata_id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,

    CONSTRAINT "booking_transaction_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "pengunjung" (
    "id" SERIAL NOT NULL,
    "nama" TEXT NOT NULL,
    "usia" INTEGER NOT NULL,
    "email" TEXT NOT NULL,
    "destinasi_wisata_id" TEXT NOT NULL,
    "booking_transaction_id" INTEGER NOT NULL,

    CONSTRAINT "pengunjung_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "verification_tokens" (
    "identifier" TEXT NOT NULL,
    "token" TEXT NOT NULL,
    "expires" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "verification_tokens_pkey" PRIMARY KEY ("identifier","token")
);

-- CreateTable
CREATE TABLE "destination_categories" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "icon" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "destination_categories_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "tourist_destinations" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "address" TEXT,
    "latitude" DECIMAL(10,8),
    "longitude" DECIMAL(11,8),
    "category_id" TEXT,
    "admin_id" TEXT,
    "status" "DestinationStatus" NOT NULL DEFAULT 'active',
    "opening_time" TIME,
    "closing_time" TIME,
    "thumbnail_url" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "tourist_destinations_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "destination_photos" (
    "id" TEXT NOT NULL,
    "destination_id" TEXT NOT NULL,
    "file_path" TEXT NOT NULL,
    "caption" TEXT,
    "photo_type" "PhotoType" NOT NULL DEFAULT 'gallery',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "destination_photos_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "tickets" (
    "id" TEXT NOT NULL,
    "destination_id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "ticket_type" "TicketType" NOT NULL,
    "price" DECIMAL(10,2) NOT NULL,
    "quota_per_day" INTEGER NOT NULL,
    "status" "TicketStatus" NOT NULL DEFAULT 'available',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "tickets_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "complaints" (
    "id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "destination_id" TEXT NOT NULL,
    "jenis" TEXT NOT NULL,
    "narahubung" TEXT NOT NULL,
    "deskripsi" TEXT NOT NULL,
    "longitude" TEXT NOT NULL,
    "latitude" TEXT NOT NULL,
    "attachment" TEXT,
    "status" "ComplaintStatus" NOT NULL DEFAULT 'new',
    "response" TEXT,
    "responseDate" TIMESTAMP(3),
    "admin_id" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "complaints_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "destination_reviews" (
    "id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "destination_id" TEXT NOT NULL,
    "rating" INTEGER NOT NULL,
    "comment" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "destination_reviews_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "sessions" (
    "id" TEXT NOT NULL,
    "session_token" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "expires" TIMESTAMP(3) NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "sessions_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "users_email_key" ON "users"("email");

-- CreateIndex
CREATE UNIQUE INDEX "sessions_session_token_key" ON "sessions"("session_token");

-- AddForeignKey
ALTER TABLE "booking_transaction" ADD CONSTRAINT "booking_transaction_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "booking_transaction" ADD CONSTRAINT "booking_transaction_destinasi_wisata_id_fkey" FOREIGN KEY ("destinasi_wisata_id") REFERENCES "tourist_destinations"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "pengunjung" ADD CONSTRAINT "pengunjung_booking_transaction_id_fkey" FOREIGN KEY ("booking_transaction_id") REFERENCES "booking_transaction"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "pengunjung" ADD CONSTRAINT "pengunjung_destinasi_wisata_id_fkey" FOREIGN KEY ("destinasi_wisata_id") REFERENCES "tourist_destinations"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "tourist_destinations" ADD CONSTRAINT "tourist_destinations_category_id_fkey" FOREIGN KEY ("category_id") REFERENCES "destination_categories"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "tourist_destinations" ADD CONSTRAINT "tourist_destinations_admin_id_fkey" FOREIGN KEY ("admin_id") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "destination_photos" ADD CONSTRAINT "destination_photos_destination_id_fkey" FOREIGN KEY ("destination_id") REFERENCES "tourist_destinations"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "tickets" ADD CONSTRAINT "tickets_destination_id_fkey" FOREIGN KEY ("destination_id") REFERENCES "tourist_destinations"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "complaints" ADD CONSTRAINT "complaints_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "complaints" ADD CONSTRAINT "complaints_destination_id_fkey" FOREIGN KEY ("destination_id") REFERENCES "tourist_destinations"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "complaints" ADD CONSTRAINT "complaints_admin_id_fkey" FOREIGN KEY ("admin_id") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "destination_reviews" ADD CONSTRAINT "destination_reviews_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "destination_reviews" ADD CONSTRAINT "destination_reviews_destination_id_fkey" FOREIGN KEY ("destination_id") REFERENCES "tourist_destinations"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "sessions" ADD CONSTRAINT "sessions_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
