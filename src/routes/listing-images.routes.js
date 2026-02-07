const router = require("express").Router();
const { Listing, ListingImage } = require("../models");
const { authRequired } = require("../middleware/auth");
const upload = require("../middleware/upload");
const { uploadBufferToBlob } = require("../services/blob");

// POST /listings/:id/images
router.post("/:id/images", authRequired, upload.any(), async (req, res) => {
  const listingId = req.params.id;

  const listing = await Listing.findOne({
    where: { id: listingId, seller_user_id: req.user.id }
  });
  if (!listing) return res.status(404).json({ message: "Publicación no encontrada" });

  const file = req.files && req.files.length ? req.files[0] : null;
  if (!file) return res.status(400).json({ message: "Debes enviar un archivo (Files)" });

  const url = await uploadBufferToBlob({
    buffer: file.buffer,
    mimeType: file.mimetype,
    filename: (file.originalname || "image.jpg").replace(/\s+/g, "_")
  });

  const img = await ListingImage.create({
    listing_id: listing.id,
    url,
    sort_order: 0
  });

  res.status(201).json(img);
});


// GET /listings/:id/images
router.get("/:id/images", async (req, res) => {
  const listingId = req.params.id;

  const imgs = await ListingImage.findAll({
    where: { listing_id: listingId },
    order: [["sort_order", "ASC"], ["id", "ASC"]]
  });

  res.json(imgs);
});

module.exports = router;
