"use strict";

module.exports = {
  async up(queryInterface) {
    const organizationData = [
      {
        name: "Zenmonk",
        domain: "zenmonk.tech",
      }
    ];
    await queryInterface.bulkInsert("organization", organizationData);
  },

  async down(queryInterface) {
    await queryInterface.sequelize.transaction(async (transaction) => {
      await queryInterface.bulkDelete("organization", null, { transaction });
    });
  }
};
