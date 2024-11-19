"use strict";

module.exports = {
  async up(queryInterface) {
    const roleData = [
      {
        name: "superadmin",
        description: "superadmin role",
        role_level: 0,
      },
      {
        name: "admin",
        description: "admin role",
        role_level: 1,
      },
      {
        name: "organization",
        description: "organization role",
        role_level: 1,
      },
      {
        name: "hr",
        description: "human resource role",
        role_level: 2,
      },
      {
        name: "techlead",
        description: "tech leader role",
        role_level: 2,
      },
      {
        name: "teamlead",
        description: "team leader role",
        role_level: 2,
      },
      {
        name: "sd1",
        description: "software developer 1 role",
        role_level: 2,
      },
      {
        name: "sd2",
        description: "software developer 2 role",
        role_level: 2
      },
      {
        name: "sd3",
        description: "software developer 3 role",
        role_level: 2
      },
      {
        name: "intern",
        description: "software developer intern role",
        role_level: 2
      },
    ];
    await queryInterface.bulkInsert("role", roleData);
  },

  async down(queryInterface) {
    await queryInterface.sequelize.transaction(async (transaction) => {
      await queryInterface.bulkDelete("role", null, { transaction });
    });
  }
};
