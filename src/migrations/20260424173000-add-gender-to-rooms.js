'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    // Add ENUM values natively first if using PostgreSQL, but Sequelize addColumn often handles basic enum insertion implicitly based on dialect. 
    // Usually simpler to just define string with ENUM values
    await queryInterface.addColumn('rooms', 'gender', {
      type: Sequelize.ENUM('male', 'female', 'mixed'),
      defaultValue: 'mixed',
      allowNull: false
    });
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.removeColumn('rooms', 'gender');
    // Drop enum type manually if using postgres to prevent dangling types
    await queryInterface.sequelize.query('DROP TYPE IF EXISTS "enum_rooms_gender";').catch(() => {});
  }
};
