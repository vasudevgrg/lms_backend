"use strict";

const { Action } = require("../models/common/action-enum");

module.exports = {
  async up(queryInterface) {
    const rolePermissionData =
    [
      {
        permission_id: 1,
        organization_role_id: 1,
        action: JSON.stringify([Action.ENUM.READ, Action.ENUM.CREATE,Action.ENUM.UPDATE,Action.ENUM.ACTIVATE,Action.ENUM.DEACTIVATE])
      },
      {
        permission_id: 2,
        organization_role_id: 1,
        action: JSON.stringify([Action.ENUM.READ, Action.ENUM.CREATE,Action.ENUM.UPDATE,Action.ENUM.REPORT,Action.ENUM.DELETE])
      },      {
        permission_id: 3,
        organization_role_id: 1,
        action: JSON.stringify([Action.ENUM.READ, Action.ENUM.CHECK_IN,Action.ENUM.CHECK_OUT,Action.ENUM.REPORT])
      },
      {
        permission_id: 4,
        organization_role_id: 1,
        action: JSON.stringify([Action.ENUM.READ, Action.ENUM.CREATE,Action.ENUM.UPDATE,Action.ENUM.ACTIVATE,Action.ENUM.DEACTIVATE])
      },
      {
        permission_id: 5,
        organization_role_id: 1,
        action: JSON.stringify([Action.ENUM.READ, Action.ENUM.CREATE,Action.ENUM.CREATE_BULK,Action.ENUM.ACTIVATE,Action.ENUM.DEACTIVATE])
      },     
      {
        permission_id: 6,
        organization_role_id: 1,
        action: JSON.stringify([Action.ENUM.READ, Action.ENUM.CREATE, Action.ENUM.CREATE_BULK,Action.ENUM.UPDATE,Action.ENUM.ACTIVATE,Action.ENUM.DEACTIVATE])
      },      
      {
        permission_id: 7,
        organization_role_id: 1,
        action: JSON.stringify([Action.ENUM.READ, Action.ENUM.CREATE,Action.ENUM.UPDATE,Action.ENUM.REPORT])
      },
      {
        permission_id: 8,
        organization_role_id: 1,
        action: JSON.stringify([Action.ENUM.READ, Action.ENUM.CREATE,Action.ENUM.UPDATE])
      },
      {
        permission_id: 9,
        organization_role_id: 1,
        action: JSON.stringify([Action.ENUM.READ,Action.ENUM.UPDATE,Action.ENUM.APPROVE,Action.ENUM.REJECT, Action.ENUM.RECOMMEND])

      },
      {
        permission_id: 10,
        organization_role_id: 1,
        action: JSON.stringify([Action.ENUM.READ, Action.ENUM.CREATE,Action.ENUM.UPDATE,Action.ENUM.CREATE_BULK])
      },
      {
        permission_id: 11,
        organization_role_id: 1,
        action: JSON.stringify([Action.ENUM.READ, Action.ENUM.CREATE,Action.ENUM.UPDATE,Action.ENUM.ACTIVATE,Action.ENUM.DEACTIVATE])

      },
      {
        permission_id: 12,
        organization_role_id: 1,
        action: JSON.stringify([Action.ENUM.READ, Action.ENUM.CREATE,Action.ENUM.UPDATE,Action.ENUM.ACTIVATE,Action.ENUM.DEACTIVATE])

      },
      {
        permission_id: 13,
        organization_role_id: 1,
        action: JSON.stringify([Action.ENUM.READ, Action.ENUM.CREATE,Action.ENUM.CREATE_BULK])
      },
    ];
    await queryInterface.bulkInsert("role_permission", rolePermissionData);
  },

  async down(queryInterface) {
    await queryInterface.sequelize.transaction(async (transaction) => {
      await queryInterface.bulkDelete("role_permission", null, { transaction });
    });
  }
};
