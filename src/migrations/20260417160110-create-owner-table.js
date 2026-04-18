'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up (queryInterface, Sequelize) {
    await queryInterface.createTable('owners', {
    id: { type: Sequelize.UUID, defaultValue: Sequelize.UUIDV4, primaryKey: true },
    user_id: { type: Sequelize.UUID, references: { model: 'users', key: 'id' }, onUpdate: 'CASCADE', onDelete: 'CASCADE' },
    name: { type: Sequelize.STRING, allowNull: false },
    phone_number: { type: Sequelize.STRING },
    subscription_active_until: { type: Sequelize.DATE },
    branch_quota: { type: Sequelize.INTEGER, defaultValue: 2 },
    room_quota: { type: Sequelize.INTEGER, defaultValue: 30 },
    created_at: { type: Sequelize.DATE, allowNull: false },
    updated_at: { type: Sequelize.DATE, allowNull: false },
    deleted_at: { type: Sequelize.DATE, allowNull: true },
  });
  },

  async down (queryInterface, Sequelize) {
    await queryInterface.dropTable("owners");
  }
};
