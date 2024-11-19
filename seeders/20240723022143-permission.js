"use strict";

const { Action } = require("../models/common/action-enum");
const { Permission } = require("../models/common/permission-enum");

module.exports = {
  async up(queryInterface) {
    const permissionData = [
      {
        name: "User Management",
        description: "User Management",
        value: Permission.ENUM.USER_MANAGEMENT,
        actions: [Action.ENUM.READ, Action.ENUM.CREATE,Action.ENUM.UPDATE,Action.ENUM.ACTIVATE,Action.ENUM.DEACTIVATE]
      },
      {
        name: "User Leave Management",
        description: "User Leave Management",
        value: Permission.ENUM.USER_LEAVE_MANAGEMENT,
        actions: [Action.ENUM.READ, Action.ENUM.CREATE,Action.ENUM.UPDATE,Action.ENUM.REPORT,Action.ENUM.DELETE]
      },      {
        name: "User Attendance Management",
        description: "User Attendance Management",
        value: Permission.ENUM.USER_ATTENDANCE_MANAGEMENT,
        actions: [Action.ENUM.READ, Action.ENUM.CHECK_IN,Action.ENUM.CHECK_OUT,Action.ENUM.REPORT]
      },
      {
        name: "Organization Management",
        description: "Organization Management",
        value: Permission.ENUM.ORGANIZATION_MANAGEMENT,
        actions: [Action.ENUM.READ, Action.ENUM.CREATE,Action.ENUM.UPDATE,Action.ENUM.ACTIVATE,Action.ENUM.DEACTIVATE]
      },
      {
        name: "Organization Holiday Management",
        description: "Organization Holiday Management",
        value: Permission.ENUM.ORGANIZATION_HOLIDAY_MANAGEMENT,
        actions: [Action.ENUM.READ, Action.ENUM.CREATE,Action.ENUM.CREATE_BULK,Action.ENUM.ACTIVATE,Action.ENUM.DEACTIVATE]
      },     
      {
        name: "Organization Role Management",
        description: "Organization Role Management",
        value: Permission.ENUM.ORGANIZATION_ROLE_MANAGEMENT,
        actions: [Action.ENUM.READ, Action.ENUM.CREATE ,Action.ENUM.UPDATE,Action.ENUM.ACTIVATE,Action.ENUM.DEACTIVATE]
      },      
      {
        name: "Organization Leave Management",
        description: "Organization Leave Management",
        value: Permission.ENUM.ORGANIZATION_LEAVE_MANAGEMENT,
        actions: [Action.ENUM.READ, Action.ENUM.CREATE,Action.ENUM.UPDATE,Action.ENUM.REPORT]
      },
      {
        name: "Organization User Management",
        description: "Organization User Management",
        value: Permission.ENUM.ORGANIZATION_USER_MANAGEMENT,
        actions: [Action.ENUM.READ, Action.ENUM.CREATE,Action.ENUM.UPDATE]
      },
      {
        name: "Leave Request Management",
        description: "Leave Request Management",
        value: Permission.ENUM.LEAVE_REQUEST_MANAGEMENT,
        actions: [Action.ENUM.READ,Action.ENUM.UPDATE,Action.ENUM.APPROVE,Action.ENUM.REJECT, Action.ENUM.RECOMMEND]

      },
      {
        name: "Holiday Management",
        description: "Holiday Management",
        value: Permission.ENUM.HOLIDAY_MANAGEMENT,
        actions: [Action.ENUM.READ, Action.ENUM.CREATE,Action.ENUM.UPDATE,Action.ENUM.CREATE_BULK]

      },

      {
        name: "Role Management",
        description: "Role Management",
        value: Permission.ENUM.ROLE_MANAGEMENT,
        actions: [Action.ENUM.READ, Action.ENUM.CREATE,Action.ENUM.UPDATE]

      },
      {
        name: "Department Management",
        description: "Department Management",
        value: Permission.ENUM.DEPARTMENT_MANAGEMENT,
        actions: [Action.ENUM.READ, Action.ENUM.CREATE,Action.ENUM.UPDATE,Action.ENUM.ACTIVATE,Action.ENUM.DEACTIVATE]

      },
      {
        name: "Attendance Management",
        description: "Attendance Management",
        value: Permission.ENUM.ATTENDANCE_MANAGEMENT,
        actions: [Action.ENUM.READ, Action.ENUM.CREATE,Action.ENUM.CREATE_BULK]
      },
    ];
    await queryInterface.bulkInsert("permission", permissionData);
  },

  async down(queryInterface) {
    await queryInterface.sequelize.transaction(async (transaction) => {
      await queryInterface.bulkDelete("permission", null, { transaction });
    });
  }
};
