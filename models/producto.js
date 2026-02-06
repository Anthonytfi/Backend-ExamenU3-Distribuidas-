// models/producto.js
const { sequelize, DataTypes } = require("./database");

const Producto = sequelize.define("producto", {
  nombre: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  precio_compra: { // Para calcular ganancias reales
    type: DataTypes.FLOAT,
    allowNull: false,
    defaultValue: 0.0
  },
  precio_venta: { // Precio al público
    type: DataTypes.FLOAT,
    allowNull: false,
  },
  cantidad: { // Stock actual
    type: DataTypes.INTEGER,
    allowNull: false,
  },
  stock_minimo: { // Alerta: Si cantidad < stock_minimo, avisar
    type: DataTypes.INTEGER,
    defaultValue: 5, 
  }
});

module.exports = Producto;