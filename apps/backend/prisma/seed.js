// filepath: apps/backend/prisma/seed.js

require("dotenv").config();
const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();
const logger = require("../src/utils/logger");

async function main() {
  logger.info("Seeding database...");
  await prisma.$connect();
  await prisma.doctor.deleteMany();
  logger.info("Deleted all doctors");
  await prisma.doctor.createMany({
    data: [
      {
        name: "جهاد الزين",
        perPatientFee: 600000,
        perVisitFee: 5 * 350000,
      },
      {
        name: "علي صوفان",
        perPatientFee: 600000,
        perVisitFee: 0,
      },
      {
        name: "عصام الزين",
        perPatientFee: 600000,
        perVisitFee: 0,
      },
      {
        name: "ابراهيم الأخرس",
        perPatientFee: 600000,
        perVisitFee: 0,
      },
      {
        name: "جوليانو مزرعاني",
        perPatientFee: 600000,
        perVisitFee: 1500000,
      },
      {
        name: "ملاك علامي الدين",
        perPatientFee: 600000,
        perVisitFee: 0,
      },
      {
        name: "محمود فتوني",
        perPatientFee: 600000,
        perVisitFee: 0,
      },
      {
        name: "وديع نجدي",
        perPatientFee: 600000,
        perVisitFee: 0,
      },
      {
        name: "مازن زيتون",
        perPatientFee: 600000,
        perVisitFee: 0,
      },
      {
        name: "فاروق قصير",
        perPatientFee: 600000,
        perVisitFee: 0,
      },
      {
        name: "مريم خليل",
        perPatientFee: 600000,
        perVisitFee: 0,
      },
      {
        name: "خليل ناجي",
        perPatientFee: 600000,
        perVisitFee: 0,
      },
      {
        name: "اسماعيل رومية",
        perPatientFee: 600000,
        perVisitFee: 0,
      },
      {
        name: "حسين شخلب",
        perPatientFee: 600000,
        perVisitFee: 1500000,
      },
      {
        name: "خليل عباس",
        perPatientFee: 600000,
        perVisitFee: 0,
      },
      {
        name: "حسين رمضان",
        perPatientFee: 600000,
        perVisitFee: 0,
      },
      {
        name: "اسراء ترمس",
        perPatientFee: 600000,
        perVisitFee: 0,
      },
      {
        name: "حسن الأخرس",
        perPatientFee: 600000,
        perVisitFee: 0,
      },
      {
        name: "تمام الأخرس",
        perPatientFee: 600000,
        perVisitFee: 0,
      },
      {
        name: "محمد طالب",
        perPatientFee: 600000,
        perVisitFee: 0,
      },
      {
        name: "محمد عون",
        perPatientFee: 600000,
        perVisitFee: 0,
      },
      {
        name: "عبدالله شعبان",
        perPatientFee: 600000,
        perVisitFee: 0,
      },
      {
        name: "محمد خليل",
        perPatientFee: 900000,
        perVisitFee: 0,
      },
      {
        name: "حنان الزين",
        perPatientFee: 300000,
        perVisitFee: 0,
      },
      {
        name: "حسن طلالل يونس",
        perPatientFee: 600000,
        perVisitFee: 0,
      },
      {
        name: "سحر فنيش",
        perPatientFee: 600000,
        perVisitFee: 0,
      },
      {
        name: "فاتن عطوي",
        perPatientFee: 600000,
        perVisitFee: 0,
      },
      {
        name: "وسام غزال",
        perPatientFee: 600000,
        perVisitFee: 0,
      },
      {
        name: "محمد فقيه",
        perPatientFee: 600000,
        perVisitFee: 0,
      },
      {
        name: "سفتلانا فقيه",
        perPatientFee: 600000,
        perVisitFee: 0,
      },
      {
        name: "قاسم سعد",
        perPatientFee: 750000,
        perVisitFee: 0,
      },
      {
        name: "هاشمية الحسيني",
        perPatientFee: 600000,
        perVisitFee: 0,
      },
    ],
    skipDuplicates: true,
  });

  logger.info("Seeded doctors");

  // Seed services
  await prisma.service.createMany({
    data: [
      { name: "ECG", price: 400000, doctorSplitPercent: 0.5 },
      { name: "X-Ray", price: 800000, doctorSplitPercent: 0 },
      { name: "Ultrasound", price: 700000, doctorSplitPercent: 0.4 },
      { name: "Ear Wax Removal", price: 1500000, doctorSplitPercent: 1 },
    ],
    skipDuplicates: true,
  });

  // Seed Ultrasound DoctorServiceSplits
  // All doctors get a flat 300,000 L.L per ultrasound.
  // Abdallah Chaaban is the exception at 500,000 L.L.
  const ultrasound = await prisma.service.findFirst({
    where: { name: "Ultrasound" },
  });

  if (ultrasound) {
    const allDoctors = await prisma.doctor.findMany();
    const chaaban = allDoctors.find((d) => d.name === "Abdallah Chaaban");

    for (const doctor of allDoctors) {
      const splitValue = chaaban && doctor.id === chaaban.id ? 500000 : 300000;
      await prisma.doctorServiceSplit.upsert({
        where: {
          doctorId_serviceId: {
            doctorId: doctor.id,
            serviceId: ultrasound.id,
          },
        },
        update: { splitType: "FLAT", splitValue },
        create: {
          doctorId: doctor.id,
          serviceId: ultrasound.id,
          splitType: "FLAT",
          splitValue,
        },
      });
    }
  }

  logger.info("Seeded services and doctor service splits");

  await prisma.$disconnect();

  logger.info("Database seeding completed successfully.");
}

main();
