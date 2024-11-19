"use strict";

const { Status } = require("../models/common/status-enum");
const { EmployementType } = require("../models/user/employment-type-enum");

module.exports = {
  async up(queryInterface) {
    const userData = [
      {
        user_id: "a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11",
        name: "admin",
        email: "admin@admin.in",
        status: Status.ENUM.ACTIVE,
        type: EmployementType.ENUM.FULL_TIME,
        phone_number: "0000000000",
        password: "admin",
        date_of_joining: new Date(),
        organization_id: 1,
        department_id: 1,
        organization_role_id: 1,
        bradford_score: 0,
      },
      {
        user_id: "a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a12",
        name: "hr",
        email: "hr@hr.in",
        status: Status.ENUM.ACTIVE,
        type: EmployementType.ENUM.FULL_TIME,
        phone_number: "0000000000",
        password: "hr",
        date_of_joining: new Date(),
        organization_id: 1,
        department_id: 2,
        organization_role_id: 4,
        bradford_score: 0,
      },
      {
        user_id: "a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a13",
        name: "teamlead",
        email: "teamlead@teamlead.in",
        status: Status.ENUM.ACTIVE,
        type: EmployementType.ENUM.FULL_TIME,
        phone_number: "0000000000",
        password: "teamlead",
        date_of_joining: new Date(),
        organization_id: 1,
        department_id: 3,
        organization_role_id: 6,
        bradford_score: 0,
      },
      {
        user_id: "a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a14",
        name: "sd1",
        email: "sd1@sd1.in",
        status: Status.ENUM.ACTIVE,
        type: EmployementType.ENUM.FULL_TIME,
        phone_number: "0000000000",
        password: "sd1",
        date_of_joining: new Date(),
        organization_id: 1,
        department_id: 3,
        organization_role_id: 7,
        bradford_score: 0,
      },
      {
        user_id: "a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a15",
        name: "intern",
        email: "intern@intern.in",
        status: Status.ENUM.ACTIVE,
        type: EmployementType.ENUM.INTERN,
        phone_number: "0000000000",
        password: "intern",
        date_of_joining: new Date(),
        organization_id: 1,
        department_id: 3,
        organization_role_id: 10,
        bradford_score: 0,
      },
    ];
    await queryInterface.bulkInsert("user", userData);
  },

  async down(queryInterface) {
    await queryInterface.sequelize.transaction(async (transaction) => {
      await queryInterface.bulkDelete("user", null, { transaction });
    });
  }
};
