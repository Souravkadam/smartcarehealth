import { Router } from "express";
import { Hospital } from "../../database/models/Hospital.js";
import { Doctor } from "../../database/models/Doctor.js";
import { Service } from "../../database/models/Service.js";

const router = Router();

// GET /api/hospitals — list all, with optional ?search=, ?level=, ?city=
router.get("/", async (req, res) => {
  try {
    const { search, level, city } = req.query;
    const filter: Record<string, unknown> = {};

    if (level) filter.level = level;
    if (city) filter.city = city;
    if (search) {
      filter.$text = { $search: search as string };
    }

    const hospitals = await Hospital.find(filter).lean();

    // Attach doctors and services counts / data
    const ids = hospitals.map((h) => h._id);
    const [doctors, services] = await Promise.all([
      Doctor.find({ hospitalId: { $in: ids } }).lean(),
      Service.find({ hospitalId: { $in: ids } }).lean(),
    ]);

    const result = hospitals.map((h) => ({
      ...h,
      id: h._id.toString(),
      doctors: doctors
        .filter((d) => d.hospitalId.toString() === h._id.toString())
        .map((d) => ({ ...d, id: d._id.toString() })),
      services: services
        .filter((s) => s.hospitalId.toString() === h._id.toString())
        .map((s) => ({ ...s, id: s._id.toString() })),
    }));

    res.json(result);
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch hospitals" });
  }
});

// GET /api/hospitals/:id
router.get("/:id", async (req, res) => {
  try {
    const hospital = await Hospital.findById(req.params.id).lean();
    if (!hospital) return res.status(404).json({ error: "Hospital not found" });

    const [doctors, services] = await Promise.all([
      Doctor.find({ hospitalId: hospital._id }).lean(),
      Service.find({ hospitalId: hospital._id }).lean(),
    ]);

    res.json({
      ...hospital,
      id: hospital._id.toString(),
      doctors: doctors.map((d) => ({ ...d, id: d._id.toString() })),
      services: services.map((s) => ({ ...s, id: s._id.toString() })),
    });
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch hospital" });
  }
});

// PATCH /api/hospitals/:id — update hospital images
router.patch("/:id", async (req, res) => {
  try {
    const { image, images } = req.body;
    const hospital = await Hospital.findByIdAndUpdate(
      req.params.id,
      { ...(image !== undefined && { image }), ...(images !== undefined && { images }) },
      { new: true }
    );
    if (!hospital) return res.status(404).json({ error: "Hospital not found" });
    res.json({ ...hospital.toObject(), id: hospital._id.toString() });
  } catch {
    res.status(500).json({ error: "Failed to update hospital" });
  }
});

export default router;
