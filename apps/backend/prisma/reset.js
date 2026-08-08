// filepath: apps/backend/prisma/reset.js

const { PrismaClient } = require("@prisma/client");
const logger = require("../src/utils/logger");

const prisma = new PrismaClient();

async function resetDatabase() {
  try {
    logger.info("Resetting database...");
    prisma.$connect();
    logger.info("Connected to database");
    await prisma.labOrder.deleteMany({});
    logger.info("Deleted lab orders");
    await prisma.ledgerTransaction.deleteMany({});
    logger.info("Deleted ledger transactions");
    await prisma.monthlyServiceLog.deleteMany({});
    logger.info("Deleted monthly service logs");
    await prisma.monthlyTally.deleteMany({});
    logger.info("Deleted monthly tallies");
    await prisma.doctorServiceSplit.deleteMany({});
    logger.info("Deleted doctor service splits");
    await prisma.service.deleteMany({});
    logger.info("Deleted services");
    await prisma.doctor.deleteMany({});
    logger.info("Deleted doctors");
  } catch (error) {
    console.error("Error resetting database:", error);
    logger.error("Error resetting database:", error);
  }
}

resetDatabase();
