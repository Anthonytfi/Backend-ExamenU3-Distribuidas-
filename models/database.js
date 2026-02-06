// models/database.js
const { Sequelize, DataTypes, Op } = require("sequelize");

// Asegúrate de crear esta base de datos 'MiNegocioDB' en tu pgAdmin primero
const sequelize = new Sequelize("MiNegocioDB", "postgres", "espe", {
  host: "localhost",
  dialect: "postgres",
  port: 5432,
  logging: false, // Para limpiar la consola
});

module.exports = { sequelize, DataTypes, Op };