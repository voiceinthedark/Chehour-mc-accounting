// filepath: apps/backend/src/controllers/receptionController.js

const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

/**
 * Normalizes a numeric form field: treats "", null, undefined, or NaN
 * as missing, falling back to the provided default instead of sending
 * null/NaN to Prisma (which rejects null for non-nullable Decimal columns).
 */
function toDecimalOrDefault(value, fallback) {
  if (value === undefined || value === null || value === "") return fallback;
  const num = Number(value);
  return Number.isNaN(num) ? fallback : num;
}

/**
 * Updates a doctor's base fees and per-service split overrides.
 * serviceSplits: [{ serviceId, splitType: 'PERCENT' | 'FLAT', splitValue }]
 */
async function updateDoctorSettings(req, res) {
  const { id } = req.params;
  const { name, perPatientFee, doctorPatientCut, perVisitFee, serviceSplits } =
    req.body;

  const normalizedPerPatientFee = toDecimalOrDefault(perPatientFee, undefined);
  if (normalizedPerPatientFee === undefined) {
    return res.status(400).json({ error: "perPatientFee is required" });
  }

  try {
    const updatedDoctor = await prisma.$transaction(async (tx) => {
      const doctor = await tx.doctor.update({
        where: { id },
        data: {
          ...(name ? { name } : {}),
          perPatientFee: normalizedPerPatientFee,
          // Defaults to the center's patient fee if left blank, since most
          // doctors receive the full amount unless explicitly overridden.
          doctorPatientCut: toDecimalOrDefault(
            doctorPatientCut,
            normalizedPerPatientFee,
          ),
          // Defaults to 0 (no guaranteed per-visit rate) if left blank.
          perVisitFee: toDecimalOrDefault(perVisitFee, 0),
        },
      });

      if (Array.isArray(serviceSplits)) {
        // Delete any splits that are no longer in the submitted list
        const incomingServiceIds = serviceSplits.map((s) => s.serviceId);
        await tx.doctorServiceSplit.deleteMany({
          where: {
            doctorId: id,
            serviceId: { notIn: incomingServiceIds },
          },
        });

        // Upsert the remaining/new splits
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
      } else {
        // If serviceSplits is not provided, remove all splits for this doctor
        await tx.doctorServiceSplit.deleteMany({ where: { doctorId: id } });
      }

      return doctor;
    });

    res.json(updatedDoctor);
  } catch (error) {
    console.error("Update doctor settings error:", error);
    res.status(500).json({
      error: "Failed to update doctor settings",
      detail: error.message,
    });
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
    coveredVisits,
    coveredPatients,
    regularPatients,
    charityPatients,
    servicesUsed,
  } = req.body;

  try {
    // Use upsert so re-submitting the same month updates instead of crashing
    const tally = await prisma.$transaction(async (tx) => {
      const existing = await tx.monthlyTally.findUnique({
        where: { doctorId_month_year: { doctorId, month, year } },
      });

      if (existing) {
        // Delete old service logs before replacing them
        await tx.monthlyServiceLog.deleteMany({
          where: { tallyId: existing.id },
        });

        return tx.monthlyTally.update({
          where: { id: existing.id },
          data: {
            totalVisits,
            coveredVisits: coveredVisits ?? 0,
            coveredPatients: coveredPatients ?? 0,
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
      }

      return tx.monthlyTally.create({
        data: {
          doctorId,
          month,
          year,
          totalVisits,
          coveredVisits: coveredVisits ?? 0,
          coveredPatients: coveredPatients ?? 0,
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
    });

    res.json({ success: true, tally });
  } catch (error) {
    res.status(500).json({ error: "Failed to save monthly tally" });
  }
}

async function addNewDoctor(req, res) {
  const { name, perPatientFee, doctorPatientCut, perVisitFee, serviceSplits } =
    req.body;

  if (!name || !name.trim()) {
    return res.status(400).json({ error: "Doctor name is required" });
  }

  const normalizedPerPatientFee = toDecimalOrDefault(perPatientFee, undefined);
  if (normalizedPerPatientFee === undefined) {
    return res.status(400).json({ error: "perPatientFee is required" });
  }

  try {
    const newDoctor = await prisma.$transaction(async (tx) => {
      const doctor = await tx.doctor.create({
        data: {
          name: name.trim(),
          perPatientFee: normalizedPerPatientFee,
          // Defaults to the center's patient fee if left blank, since most
          // doctors receive the full amount unless explicitly overridden.
          doctorPatientCut: toDecimalOrDefault(
            doctorPatientCut,
            normalizedPerPatientFee,
          ),
          // Defaults to 0 (no guaranteed per-visit rate) if left blank.
          perVisitFee: toDecimalOrDefault(perVisitFee, 0),
        },
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
    console.error("Add new doctor error:", error);
    res
      .status(500)
      .json({ error: "Failed to add new doctor", detail: error.message });
  }
}

async function addNewService(req, res) {
  const { name, price, doctorSplitPercent } = req.body;

  if (!name || !name.trim()) {
    return res.status(400).json({ error: "Service name is required" });
  }

  const normalizedPrice = toDecimalOrDefault(price, undefined);
  if (normalizedPrice === undefined) {
    return res.status(400).json({ error: "price is required" });
  }

  try {
    const newService = await prisma.service.create({
      data: {
        name: name.trim(),
        price: normalizedPrice,
        // Defaults to 0% if left blank (e.g. services the doctor doesn't
        // get a cut of, like standalone lab tests).
        doctorSplitPercent: toDecimalOrDefault(doctorSplitPercent, 0),
      },
    });
    res.json(newService);
  } catch (error) {
    console.error("Add new service error:", error);
    res
      .status(500)
      .json({ error: "Failed to add new service", detail: error.message });
  }
}

async function updateService(req, res) {
  const { id } = req.params;
  const { name, price, doctorSplitPercent } = req.body;

  try {
    const updatedService = await prisma.service.update({
      where: { id },
      data: {
        ...(name ? { name: name.trim() } : {}),
        ...(price !== undefined && price !== ""
          ? { price: toDecimalOrDefault(price, undefined) }
          : {}),
        ...(doctorSplitPercent !== undefined && doctorSplitPercent !== ""
          ? {
              doctorSplitPercent: toDecimalOrDefault(
                doctorSplitPercent,
                undefined,
              ),
            }
          : {}),
      },
    });
    res.json(updatedService);
  } catch (error) {
    console.error("Update service error:", error);
    res
      .status(500)
      .json({ error: "Failed to update service", detail: error.message });
  }
}

// ==========================================
// READ / LIST / DELETE
// ==========================================

async function getDoctors(req, res) {
  try {
    const doctors = await prisma.doctor.findMany({
      include: { serviceSplits: true },
      orderBy: { name: "asc" },
    });
    res.json(doctors);
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch doctors" });
  }
}

async function getDoctorById(req, res) {
  const { id } = req.params;

  try {
    const doctor = await prisma.doctor.findUnique({
      where: { id },
      include: { serviceSplits: { include: { service: true } } },
    });

    if (!doctor) return res.status(404).json({ error: "Doctor not found" });
    res.json(doctor);
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch doctor" });
  }
}

async function deleteDoctor(req, res) {
  const { id } = req.params;

  try {
    await prisma.doctor.delete({ where: { id } });
    res.json({ success: true });
  } catch (error) {
    // Likely a foreign key constraint (existing tallies) — block deletion
    res.status(409).json({
      error:
        "Failed to delete doctor. They likely have existing monthly tallies attached.",
    });
  }
}

async function getServices(req, res) {
  try {
    const services = await prisma.service.findMany({
      orderBy: { name: "asc" },
    });
    res.json(services);
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch services" });
  }
}

async function getServiceById(req, res) {
  const { id } = req.params;

  try {
    const service = await prisma.service.findUnique({ where: { id } });
    if (!service) return res.status(404).json({ error: "Service not found" });
    res.json(service);
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch service" });
  }
}

async function deleteService(req, res) {
  const { id } = req.params;

  try {
    await prisma.service.delete({ where: { id } });
    res.json({ success: true });
  } catch (error) {
    res.status(409).json({
      error:
        "Failed to delete service. It likely has existing service logs attached.",
    });
  }
}

async function deleteDoctorServiceSplit(req, res) {
  const { doctorId, serviceId } = req.params;

  try {
    await prisma.doctorServiceSplit.delete({
      where: { doctorId_serviceId: { doctorId, serviceId } },
    });
    res.json({ success: true });
  } catch (error) {
    res.status(404).json({ error: "Split override not found" });
  }
}

async function deleteMonthlyTally(req, res) {
  const { id } = req.params;

  try {
    const tally = await prisma.monthlyTally.findUnique({ where: { id } });

    if (!tally) {
      return res.status(404).json({ error: "Monthly tally not found" });
    }

    if (tally.isPaidOut) {
      return res.status(409).json({
        error: "Cannot delete a tally that has already been paid out",
      });
    }

    await prisma.monthlyTally.delete({ where: { id } });
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: "Failed to delete monthly tally" });
  }
}

module.exports = {
  updateDoctorSettings,
  submitMonthlyTally,
  addNewDoctor,
  addNewService,
  updateService,
  getDoctors,
  getDoctorById,
  deleteDoctor,
  getServices,
  getServiceById,
  deleteService,
  deleteDoctorServiceSplit,
  deleteMonthlyTally,
};
