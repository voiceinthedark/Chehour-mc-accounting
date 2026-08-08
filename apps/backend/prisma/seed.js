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
        name: "Jihad Al Zein",
        perPatientFee: 600000,
        perVisitFee: 5 * 350000,
      },
      {
        name: "Ali Sofan",
        perPatientFee: 600000,
        perVisitFee: 0,
      },
      {
        name: "Issam Al Zein",
        perPatientFee: 600000,
        perVisitFee: 0,
      },
      {
        name: "Ibrahim Al Akhrass",
        perPatientFee: 600000,
        perVisitFee: 0,
      },
      {
        name: "Juliano Mazraani",
        perPatientFee: 600000,
        perVisitFee: 1500000,
      },
      {
        name: "Malak Alami al din",
        perPatientFee: 600000,
        perVisitFee: 0,
      },
      {
        name: "Mahmoud Ftouni",
        perPatientFee: 600000,
        perVisitFee: 0,
      },
      {
        name: "Wadih Najdi",
        perPatientFee: 600000,
        perVisitFee: 0,
      },
      {
        name: "Mazen Zaytoun",
        perPatientFee: 600000,
        perVisitFee: 0,
      },
      {
        name: "Farouk Kassir",
        perPatientFee: 600000,
        perVisitFee: 0,
      },
      {
        name: "Maryam Khalil",
        perPatientFee: 600000,
        perVisitFee: 0,
      },
      {
        name: "Khalil Naji",
        perPatientFee: 600000,
        perVisitFee: 0,
      },
      {
        name: "Ismail Roumieh",
        perPatientFee: 600000,
        perVisitFee: 0,
      },
      {
        name: "Hussein Shihab",
        perPatientFee: 600000,
        perVisitFee: 1500000,
      },
      {
        name: "Khalil Abbas",
        perPatientFee: 600000,
        perVisitFee: 0,
      },
      {
        name: "Hussein Ramadan",
        perPatientFee: 600000,
        perVisitFee: 0,
      },
      {
        name: "Israa Turmoss",
        perPatientFee: 600000,
        perVisitFee: 0,
      },
      {
        name: "Hasan al Akhrass",
        perPatientFee: 600000,
        perVisitFee: 0,
      },
      {
        name: "Tammam Al Akhrass",
        perPatientFee: 600000,
        perVisitFee: 0,
      },
      {
        name: "Mohammed Taleb",
        perPatientFee: 600000,
        perVisitFee: 0,
      },
      {
        name: "Mohammed Aoun",
        perPatientFee: 600000,
        perVisitFee: 0,
      },
      {
        name: "Abdallah Chaaban",
        perPatientFee: 600000,
        perVisitFee: 0,
      },
      {
        name: "Mohammed Khalil",
        perPatientFee: 900000,
        perVisitFee: 0,
      },
      {
        name: "Hanan Al Zein",
        perPatientFee: 300000,
        perVisitFee: 0,
      },
      {
        name: "Hassan Talal Younos",
        perPatientFee: 600000,
        perVisitFee: 0,
      },
      {
        name: "Sahar Fneich",
        perPatientFee: 600000,
        perVisitFee: 0,
      },
      {
        name: "Faten Atwi",
        perPatientFee: 600000,
        perVisitFee: 0,
      },
      {
        name: "Wissam Ghazal",
        perPatientFee: 600000,
        perVisitFee: 0,
      },
      {
        name: "Mohammed Fakih",
        perPatientFee: 600000,
        perVisitFee: 0,
      },
      {
        name: "Svetlana Fakih",
        perPatientFee: 600000,
        perVisitFee: 0,
      },
      {
        name: "Kassem Saad",
        perPatientFee: 750000,
        perVisitFee: 0,
      },
      {
        name: "Hashimiya al Husseini",
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
      { name: "X-Ray - Part A", price: 700000, doctorSplitPercent: 0 },
      { name: "X-Ray - Part B", price: 800000, doctorSplitPercent: 0 },
      { name: "X-Ray - Part C", price: 900000, doctorSplitPercent: 0 },
      { name: "Ultrasound", price: 700000, doctorSplitPercent: 0.4 },
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
