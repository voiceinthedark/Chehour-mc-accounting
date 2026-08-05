// filepath: apps/backend/src/controllers/receptionController.js

const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

/**
 * Updates a doctor's base fees and per-service split overrides.
 * serviceSplits: [{ serviceId, splitType: 'PERCENT' | 'FLAT', splitValue }]
 */
async function updateDoctorSettings(req, res) {
  const { id } = req.params;
  const { perPatientFee, perVisitFee, serviceSplits } = req.body;

  try {
    const updatedDoctor = await prisma.$transaction(async (tx) => {
      const doctor = await tx.doctor.update({
        where: { id },
        data: { perPatientFee, perVisitFee },
      });

      if (Array.isArray(serviceSplits)) {
        for (const split of serviceSplits) {
          await tx.doctorServiceSplit.upsert({
            where: {
              doctorId_serviceId: {
                doctorId: id,
                serviceId: split.serviceId,
              },
            },
            update: {
              splitType: split.splitType,
              splitValue: split.splitValue,
            },
            create: {
              doctorId: id,
              serviceId: split.serviceId,
              splitType: split.splitType,
              splitValue: split.splitValue,
            },
          });
        }
      }

      return doctor;
    });

    res.json(updatedDoctor);
  } catch (error) {
    res.status(500).json({ error: "Failed to update doctor settings" });
  }
}

/**
 * Submits the aggregated monthly tally for a doctor.
 */
async function submitMonthlyTally(req, res) {
  const {
    doctorId,
    month,
    year,
    totalVisits,
    regularPatients,
    charityPatients,
    servicesUsed,
  } = req.body;

  try {
    const tally = await prisma.monthlyTally.create({
      data: {
        doctorId,
        month,
        year,
        totalVisits,
        regularPatients,
        charityPatients,
        serviceLogs: {
          create: (servicesUsed || []).map((srv) => ({
            serviceId: srv.serviceId,
            regularCount: srv.regularCount,
            charityCount: srv.charityCount,
          })),
        },
      },
    });

    res.json({ success: true, tally });
  } catch (error) {
    res.status(500).json({ error: "Failed to save monthly tally" });
  }
}

async function addNewDoctor(req, res) {
  const { Name, perPatientFee, perVisitFee, serviceSplits } = req.body;

  try {
    const newDoctor = await prisma.$transaction(async (tx) => {
      const doctor = await tx.doctor.create({
        data: { Name, perPatientFee, perVisitFee },
      });

      if (Array.isArray(serviceSplits)) {
        for (const split of serviceSplits) {
          await tx.doctorServiceSplit.create({
            data: {
              doctorId: doctor.id,
              serviceId: split.serviceId,
              splitType: split.splitType,
              splitValue: split.splitValue,
            },
          });
        }
      }

      return doctor;
    });

    res.json(newDoctor);
  } catch (error) {
    res.status(500).json({ error: "Failed to add new doctor" });
  }
}

async function addNewService(req, res) {
  const { name, price, doctorSplitPercent } = req.body;

  try {
    const newService = await prisma.service.create({
      data: { name, price, doctorSplitPercent },
    });
    res.json(newService);
  } catch (error) {
    res.status(500).json({ error: "Failed to add new service" });
  }
}

async function updateService(req, res) {
  const { id } = req.params;
  const { name, price, doctorSplitPercent } = req.body;

  try {
    const updatedService = await prisma.service.update({
      where: { id },
      data: { name, price, doctorSplitPercent },
    });
    res.json(updatedService);
  } catch (error) {
    res.status(500).json({ error: "Failed to update service" });
  }
}

module.exports = {
  updateDoctorSettings,
  submitMonthlyTally,
  addNewDoctor,
  addNewService,
  updateService,
};
