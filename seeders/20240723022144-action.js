"use strict";

const { Action } = require("../models/common/action-enum");

module.exports = {
  async up(queryInterface) {
    const actions = [
      {
        name: "Create",
        value: Action.ENUM.CREATE,
      },
      {
        name: "Read",
        value: Action.ENUM.READ,
      },
      {
        name: "Update",
        value: Action.ENUM.UPDATE,
      },
      {
        name: "Delete",
        value: Action.ENUM.DELETE,
      },
      {
        name: "Approve",
        value: Action.ENUM.APPROVE,
      },
      {
        name: "Reject",
        value: Action.ENUM.REJECT,
      },
      {
        name: "Recommend",
        value: Action.ENUM.RECOMMEND,
      },
      {
        name: "Cancel",
        value: Action.ENUM.CANCEL,
      },
      {
        name: "Check In",
        value: Action.ENUM.CHECK_IN,
      },
      {
        name: "Check Out",
        value: Action.ENUM.CHECK_OUT,
      },
      {
        name: "Activate",
        value: Action.ENUM.ACTIVATE,
      },
      {
        name: "Deactivate",
        value: Action.ENUM.DEACTIVATE,
      },
      {
        name: "Create Bulk",
        value: Action.ENUM.CREATE_BULK,
      },
      {
        name: "Report",
        value: Action.ENUM.REPORT,
      }
    ];
    await queryInterface.bulkInsert("action", actions);
  },

  async down(queryInterface) {
    await queryInterface.sequelize.transaction(async (transaction) => {
      await queryInterface.bulkDelete("action", null, { transaction });
    });
  }
};
