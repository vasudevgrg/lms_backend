"use strict";

const { ShiftType } = require("../models/role/shift-type-enum");

module.exports = {
  async up(queryInterface) {
    const organizationRoleData = [
      {
        organization_id: 1,
        role_id: 1,
        shift_type: ShiftType.ENUM.DAY,
      },
      {
        organization_id: 1,
        role_id: 2,
        shift_type: ShiftType.ENUM.DAY,
      },
      {
        organization_id: 1,
        role_id: 3,
        shift_type: ShiftType.ENUM.DAY,
      },
      {
        organization_id: 1,
        role_id: 4,
        shift_type: ShiftType.ENUM.DAY,
      },
      {
        organization_id: 1,
        role_id: 5,
        shift_type: ShiftType.ENUM.DAY,
      },
      {
        organization_id: 1,
        role_id: 6,
        shift_type: ShiftType.ENUM.DAY,
      },
      {
        organization_id: 1,
        role_id: 7,
        shift_type: ShiftType.ENUM.DAY,
      },
      {
        organization_id: 1,
        role_id: 8,
        shift_type: ShiftType.ENUM.DAY,
      },
      {
        organization_id: 1,
        role_id: 9,
        shift_type: ShiftType.ENUM.DAY,
      },
      {
        organization_id: 1,
        role_id: 10,
        shift_type: ShiftType.ENUM.DAY,
      }
    ];
    await queryInterface.bulkInsert("organization_role", organizationRoleData);
  },

  async down(queryInterface) {
    await queryInterface.sequelize.transaction(async (transaction) => {
      await queryInterface.bulkDelete("organization_role", null, { transaction });
    });
  }
};
