const router = require("express").Router();
const { Op, Sequelize } = require("sequelize");
const { Chat, Message, Listing, ListingImage, User } = require("../models");
const { authRequired } = require("../middleware/auth");

// POST /chats  { listing_id }
router.post("/", authRequired, async (req, res, next) => {
  try {
    const listingId = Number(req.body.listing_id);
    if (!listingId) return res.status(400).json({ message: "listing_id es requerido" });

    const listing = await Listing.findOne({
      where: { id: listingId, status: "active" },
      include: [{ model: ListingImage, as: "images", attributes: ["id", "url", "sort_order"] }],
    });
    if (!listing) return res.status(404).json({ message: "Publicación no encontrada" });

    const buyerId = Number(req.user.id);
    const sellerId = Number(listing.seller_user_id);
    if (buyerId === sellerId) return res.status(400).json({ message: "No puedes chatear contigo mismo" });

    const [chat] = await Chat.findOrCreate({
      where: { listing_id: listingId, buyer_user_id: buyerId },
      defaults: { listing_id: listingId, buyer_user_id: buyerId, seller_user_id: sellerId },
    });

    res.status(201).json(chat);
  } catch (err) {
    next(err);
  }
});

// GET /chats  (preview WhatsApp)
router.get("/", authRequired, async (req, res, next) => {
  try {
    const me = Number(req.user.id);

    const chats = await Chat.findAll({
      where: { [Op.or]: [{ buyer_user_id: me }, { seller_user_id: me }] },

      attributes: {
        include: [
          // unread_count = mensajes del otro con read_at null
          [
            Sequelize.literal(`(
              SELECT COUNT(*)
              FROM messages m
              WHERE m.chat_id = "Chat".id
                AND m.sender_user_id != ${me}
                AND m.read_at IS NULL
            )`),
            "unread_count",
          ],
        ],
      },

      include: [
        // listing preview + 1 imagen
        {
          model: Listing,
          as: "listing",
          attributes: ["id", "title", "price", "city"],
          include: [
            { model: ListingImage, as: "images", attributes: ["url"], separate: true, limit: 1, order: [["sort_order", "ASC"]] },
          ],
        },

        // buyer/seller (solo nombre)
        { model: User, as: "Buyer", attributes: ["id", "full_name"] },
        { model: User, as: "Seller", attributes: ["id", "full_name"] },

        // last_message (1)
        {
          model: Message,
          as: "messages",
          attributes: ["type", "text", "image_url", "created_at"],
          separate: true,
          limit: 1,
          order: [["created_at", "DESC"]],
        },
      ],

      order: [["last_message_at", "DESC"], ["id", "DESC"]],
    });

    // Normaliza last_message (para que tu front no dependa de messages[0])
    const out = chats.map((c) => {
      const j = c.toJSON();
      return {
        id: String(j.id),
        unread_count: Number(j.unread_count || 0),
        last_message: j.messages?.[0] || null,
        listing: j.listing,
        buyer: j.Buyer,
        seller: j.Seller,
        last_message_at: j.last_message_at,
      };
    });

    res.json(out);
  } catch (err) {
    next(err);
  }
});

module.exports = router;
