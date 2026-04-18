'use strict';

const bcrypt = require('bcrypt');
const { v4: uuidv4 } = require('uuid');

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    const userId = uuidv4();
    const ownerId = uuidv4();

    await queryInterface.bulkInsert('users', [
      {
        id: userId,
        email: 'owner@example.com',
        password: await bcrypt.hash('Password123!', 10),
        role: 'OWNER',
        is_active: true,
        created_at: new Date(),
        updated_at: new Date(),
      },
    ]);

    await queryInterface.bulkInsert('owners', [
      {
        id: ownerId,
        user_id: userId,
        name: 'Owner Initial',
        phone_number: '081234567890',
        subscription_active_until: null,
        branch_quota: 2,
        room_quota: 30,
        created_at: new Date(),
        updated_at: new Date(),
      },
    ]);
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.bulkDelete('owners', null, {});
    await queryInterface.bulkDelete('users', { email: 'owner@example.com' });
  },
};
