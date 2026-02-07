const router = require("express").Router();
const { Category } = require("../models");

// LISTAR
router.get("/", async (req, res) => {
  const items = await Category.findAll({
    where: { user_id: req.user.id },
    order: [["id", "DESC"]]
  });
  res.json(items);
});

// CREAR
router.post("/", async (req, res) => {
  const { name } = req.body;
  if (!name) return res.status(400).json({ message: "name es requerido" });

  const created = await Category.create({ user_id: req.user.id, name });
  res.status(201).json(created);
});

// ACTUALIZAR
router.put("/:id", async (req, res) => {
  const { name } = req.body;
  const item = await Category.findOne({
    where: { id: req.params.id, user_id: req.user.id }
  });
  if (!item) return res.status(404).json({ message: "Categoría no encontrada" });

  item.name = name ?? item.name;
  await item.save();
  res.json(item);
});

// ELIMINAR
router.delete("/:id", async (req, res) => {
  const deleted = await Category.destroy({
    where: { id: req.params.id, user_id: req.user.id }
  });
  if (!deleted) return res.status(404).json({ message: "Categoría no encontrada" });
  res.json({ message: "Eliminado" });
});

module.exports = router;
