const router = require("express").Router();
const { Op, Sequelize } = require("sequelize");
const { Listing, ListingImage, Category, User } = require("../models");
const { authRequired } = require("../middleware/auth");

// Helper: Haversine (km) en SQL
function haversineKm(lat, lon) {
  return Sequelize.literal(`
    6371 * acos(
      cos(radians(${lat})) * cos(radians(CAST("Listing"."lat_approx" AS double precision))) *
      cos(radians(CAST("Listing"."lon_approx" AS double precision)) - radians(${lon})) +
      sin(radians(${lat})) * sin(radians(CAST("Listing"."lat_approx" AS double precision)))
    )
  `);
}

/**
 * GET /listings
 * Query:
 *  q=iphone&lat=-0.25&lon=-79.17&radius_km=5
 *  category_id=1
 */
router.get("/", async (req, res) => {
  try {
    const q = (req.query.q || "").trim();
    const lat = req.query.lat !== undefined ? Number(req.query.lat) : null;
    const lon = req.query.lon !== undefined ? Number(req.query.lon) : null;
    const radius = req.query.radius_km !== undefined ? Number(req.query.radius_km) : 10;
    const categoryId = req.query.category_id !== undefined ? Number(req.query.category_id) : null;

    const where = { status: "active" };

    // filtro por texto
    if (q) {
      where[Op.or] = [
        { title: { [Op.iLike]: `%${q}%` } },
        { description: { [Op.iLike]: `%${q}%` } }
      ];
    }

    // filtro por categoría
    if (!Number.isNaN(categoryId) && categoryId) where.category_id = categoryId;

    let attributes = undefined;
    let order = [["id", "DESC"]];

    // si hay lat/lon, filtra por radio y ordena por distancia
    if (lat !== null && lon !== null && !Number.isNaN(lat) && !Number.isNaN(lon)) {
      const distExpr = haversineKm(lat, lon);

      attributes = { include: [[distExpr, "distance_km"]] };

      // filtro por radio dentro del WHERE (sin HAVING)
      where.lat_approx = { [Op.not]: null };
      where.lon_approx = { [Op.not]: null };
      where[Op.and] = [Sequelize.where(distExpr, { [Op.lte]: radius })];

      order = [[Sequelize.literal(`"distance_km"`), "ASC"], ["id", "DESC"]];
    }

    const items = await Listing.findAll({
      where,
      attributes,
      include: [
        { model: ListingImage, as: "images", attributes: ["id", "url", "sort_order"] },

        // ✅ CORREGIDO: Category requiere alias si la asociación lo usa
        { model: Category, as: "category", attributes: ["id", "name"] },

        // ✅ opcional: vendedor (útil para preview moderno)
        { model: User, as: "Seller", attributes: ["id", "full_name"] }
      ],
      order
    });

    res.json(items);
  } catch (err) {
    console.error("listings GET / error:", err.message);
    console.error("sql:", err.sql);
    res.status(500).json({ message: "Error interno", detail: err.message, sql: err.sql || null });
  }
});

/**
 * GET /listings/search
 * Query obligatorio: q, lat, lon
 * Ej: /listings/search?q=iphone&lat=-0.253&lon=-79.175&radius_km=5
 */
router.get("/search", async (req, res) => {
  try {
    const q = (req.query.q || "").trim();
    const lat = req.query.lat !== undefined ? Number(req.query.lat) : null;
    const lon = req.query.lon !== undefined ? Number(req.query.lon) : null;
    const radiusKm = req.query.radius_km !== undefined ? Number(req.query.radius_km) : 10;

    if (!q) return res.status(400).json({ message: "q es requerido" });
    if (lat === null || lon === null || Number.isNaN(lat) || Number.isNaN(lon)) {
      return res.status(400).json({ message: "lat y lon son requeridos" });
    }

    const distExpr = haversineKm(lat, lon);

    const items = await Listing.findAll({
      where: {
        status: "active",
        lat_approx: { [Op.not]: null },
        lon_approx: { [Op.not]: null },
        [Op.or]: [
          { title: { [Op.iLike]: `%${q}%` } },
          { description: { [Op.iLike]: `%${q}%` } }
        ],
        [Op.and]: [Sequelize.where(distExpr, { [Op.lte]: radiusKm })]
      },
      attributes: { include: [[distExpr, "distance_km"]] },
      include: [
        { model: ListingImage, as: "images", attributes: ["id", "url", "sort_order"] },

        // ✅ CORREGIDO
        { model: Category, as: "category", attributes: ["id", "name"] },

        // ✅ opcional
        { model: User, as: "Seller", attributes: ["id", "full_name"] }
      ],
      order: [[Sequelize.literal(`"distance_km"`), "ASC"], ["id", "DESC"]],
    });

    res.json(items);
  } catch (err) {
    console.error("search error message:", err.message);
    console.error("search error sql:", err.sql);
    res.status(500).json({ message: "Internal error", detail: err.message, sql: err.sql || null });
  }
});

// Crear listing (protegido)
router.post("/", authRequired, async (req, res) => {
  const { title, description, price, category_id, city, lat_approx, lon_approx } = req.body;
  if (!title) return res.status(400).json({ message: "title es requerido" });

  const created = await Listing.create({
    seller_user_id: req.user.id,
    title,
    description: description ?? null,
    price: price ?? 0,
    category_id: category_id ?? null,
    city: city ?? null,
    lat_approx: lat_approx ?? null,
    lon_approx: lon_approx ?? null
  });

  res.status(201).json(created);
});

// Detalle listing
router.get("/:id", async (req, res) => {
  const item = await Listing.findOne({
    where: { id: req.params.id },
    include: [
      { model: ListingImage, as: "images", attributes: ["id", "url", "sort_order"] },

      // ✅ CORREGIDO
      { model: Category, as: "category", attributes: ["id", "name"] },

      // ✅ opcional
      { model: User, as: "Seller", attributes: ["id", "full_name"] }
    ]
  });

  if (!item) return res.status(404).json({ message: "No encontrado" });
  res.json(item);
});

// Editar (solo dueño)
router.put("/:id", authRequired, async (req, res) => {
  const item = await Listing.findOne({
    where: { id: req.params.id, seller_user_id: req.user.id }
  });
  if (!item) return res.status(404).json({ message: "No encontrado" });

  const fields = ["title", "description", "price", "category_id", "status", "city", "lat_approx", "lon_approx"];
  for (const f of fields) if (req.body[f] !== undefined) item[f] = req.body[f];

  await item.save();
  res.json(item);
});

// Eliminar (solo dueño)
// DELETE /listings/:id  (solo dueño)  → soft delete + bloquear chats
router.delete("/:id", authRequired, async (req, res, next) => {
  try {
    const listingId = Number(req.params.id);

    const listing = await Listing.findOne({
      where: { id: listingId, seller_user_id: req.user.id }
    });
    if (!listing) return res.status(404).json({ message: "No encontrado" });

    listing.status = "deleted";
    await listing.save();

    const { Chat } = require("../models");
    await Chat.update(
      {
        is_blocked: true,
        blocked_reason: "listing_deleted",
        blocked_at: new Date()
      },
      { where: { listing_id: listingId } }
    );

    res.json({ message: "Listing eliminado y chats bloqueados" });
  } catch (err) {
    next(err);
  }
});

module.exports = router;
