"use strict";

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable("customers", {
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
      name: { type: Sequelize.STRING, allowNull: false },
      whatsapp_number: { type: Sequelize.STRING, allowNull: false },
      gender: {type: Sequelize.ENUM("male", "female"), allowNull: false},
      emergency_contact_name: { type: Sequelize.STRING, allowNull: false },
      emergency_phone_number: { type: Sequelize.STRING, allowNull: false },
      identity_url: { type: Sequelize.STRING, allowNull: false },
      created_at: { type: Sequelize.DATE, allowNull: false },
      updated_at: { type: Sequelize.DATE, allowNull: false },
      deleted_at: { type: Sequelize.DATE, allowNull: true },
    });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable("customers");
  },
};
