"use strict";

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable("users", {
      id: {
        type: Sequelize.UUID,
        defaultValue: Sequelize.UUIDV4,
        primaryKey: true,
      },
      email: { type: Sequelize.STRING, unique: true, allowNull: false },
      password: { type: Sequelize.STRING, allowNull: false },
      role: {
        type: Sequelize.ENUM("SUPERADMIN", "OWNER", "STAFF"),
        defaultValue: "OWNER",
      },
      is_active: { type: Sequelize.BOOLEAN, defaultValue: true },
      created_at: { type: Sequelize.DATE, allowNull: false },
      updated_at: { type: Sequelize.DATE, allowNull: false },
      deleted_at: { type: Sequelize.DATE, allowNull: true },
    });
  },

  async down(queryInterface) {
    await queryInterface.dropTable("users");
  },
};
