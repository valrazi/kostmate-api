"use strict";

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable("rentals", {
      id: {
        type: Sequelize.UUID,
        defaultValue: Sequelize.UUIDV4,
        primaryKey: true,
      },
      branch_id: {
        type: Sequelize.UUID,
        references: { model: "branches", key: "id" },
      },
      room_id: {
        type: Sequelize.UUID,
        references: { model: "rooms", key: "id" },
      },
      customer_id: {
        type: Sequelize.UUID,
        references: { model: "customers", key: "id" },
      },
      start_date: { type: Sequelize.DATEONLY, allowNull: false },
      rent_type: {
        type: Sequelize.ENUM("daily", "weekly", "monthly"),
        defaultValue: "monthly",
      },
      due_date_day: { type: Sequelize.DATEONLY, allowNull: false },
      notification_day: { type: Sequelize.DATEONLY, allowNull: false },
      monthly_price: { type: Sequelize.DECIMAL(12, 2), allowNull: false },
      status: {
        type: Sequelize.ENUM("active", "finished", "overdue"),
        defaultValue: "active",
      },
      notes: { type: Sequelize.TEXT },
      created_at: { type: Sequelize.DATE, allowNull: false },
      updated_at: { type: Sequelize.DATE, allowNull: false },
      deleted_at: { type: Sequelize.DATE, allowNull: true },
    });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable("rentals");
  },
};
