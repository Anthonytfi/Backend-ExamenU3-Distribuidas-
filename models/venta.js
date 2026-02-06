// models/venta.js
const { sequelize, DataTypes } = require("./database");

const Venta = sequelize.define("venta", {
  fecha: {
    type: DataTypes.DATEONLY, // Solo nos interesa el día para las stats
    defaultValue: DataTypes.NOW
  },
  total_venta: {
    type: DataTypes.FLOAT,
    allowNull: false,
  },
  ganancia_total: { // Se calcula: (precio_venta - precio_compra) * cantidad
    type: DataTypes.FLOAT,
    allowNull: false,
  },
  productos_vendidos: { // Guardaremos un JSON simple con el detalle para la factura
    type: DataTypes.JSON, 
    allowNull: false
  }
});

module.exports = Venta;