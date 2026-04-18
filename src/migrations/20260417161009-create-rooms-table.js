"use strict";

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable("rooms", {
      id: {
        type: Sequelize.UUID,
        defaultValue: Sequelize.UUIDV4,
        primaryKey: true,
      },
      branch_id: {
        type: Sequelize.UUID,
        references: { model: "branches", key: "id" },
        onUpdate: "CASCADE",
        onDelete: "CASCADE",
      },
      room_number: { type: Sequelize.STRING, allowNull: false },
      status: {
        type: Sequelize.ENUM("available", "filled", "maintenance"),
        defaultValue: "available",
      },
      created_at: { type: Sequelize.DATE, allowNull: false },
      updated_at: { type: Sequelize.DATE, allowNull: false },
      deleted_at: { type: Sequelize.DATE, allowNull: true },
    });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable("rooms");
  },
};
