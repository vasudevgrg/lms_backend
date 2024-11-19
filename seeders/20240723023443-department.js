"use strict";

module.exports = {
  async up(queryInterface) {
    const departmentData = [
      {
        organization_id: 1,
        name: "administration",
        description: "Administration department",
      },
      {
        organization_id: 1,
        name: "human resources",
        description: "Human resources department",
      },
      {
        organization_id: 1,
        name: "it",
        description: "Information technology department",
      }
    ];
    await queryInterface.bulkInsert("department", departmentData);
  },

  async down(queryInterface) {
    await queryInterface.sequelize.transaction(async (transaction) => {
      await queryInterface.bulkDelete("department", null, { transaction });
    });
  }
};
