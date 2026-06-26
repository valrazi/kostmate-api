"use strict";

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.addColumn("branches", "message_notification", {
      type: Sequelize.TEXT,
      allowNull: true,
    });
    await queryInterface.addColumn("branches", "bank_name", {
      type: Sequelize.STRING,
      allowNull: true,
    });
    await queryInterface.addColumn("branches", "bank_number", {
      type: Sequelize.STRING,
      allowNull: true,
    });
    await queryInterface.addColumn("branches", "bank_brand", {
      type: Sequelize.STRING,
      allowNull: true,
    });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.removeColumn("branches", "message_notification");
    await queryInterface.removeColumn("branches", "bank_name");
    await queryInterface.removeColumn("branches", "bank_number");
    await queryInterface.removeColumn("branches", "bank_brand");
  },
};
