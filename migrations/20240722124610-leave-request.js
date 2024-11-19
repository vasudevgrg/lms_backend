"use strict";
const { LeaveRequestStatus } = require("../models/leave/leave-request-status-enum");
const { LeaveRequestType } = require("../models/leave/leave-request-type-enum");

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, DataTypes) {
    await queryInterface.createTable("leave_request", {
      id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
        allowNull: false,
      },
      uuid: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.fn("uuid_generate_v4"),
        allowNull: false,
        unique: true,
      },
      user_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
          model: "user",
          key: "id",
        },
      },
      leave_type_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
          model: "leave_type",
          key: "id",
        },
      },
      start_date: {
        type: DataTypes.DATE,
        allowNull: false,
      },
      end_date: {
        type: DataTypes.DATE,
        allowNull: false,
      },
      type: {
        type: DataTypes.ENUM(LeaveRequestType.getValues()),
        allowNull: false,
      },
      leave_duration: {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: false,
      },
      reason: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      status: {
        type: DataTypes.ENUM(LeaveRequestStatus.getValues()),
        allowNull: false,
        defaultValue: LeaveRequestStatus.ENUM.PENDING,
      },
      status_changed_by: {
        type: DataTypes.STRING,
        allowNull: true
      },
      createdAt: {
        type: DataTypes.DATE,
        field: "created_at",
        defaultValue: DataTypes.fn("now"),
        allowNull: false,
      },
      updatedAt: {
        type: DataTypes.DATE,
        field: "updated_at",
        defaultValue: DataTypes.fn("now"),
        allowNull: false,
      },
      deletedAt: {
        type: DataTypes.DATE,
        field: "deleted_at",
      },
    });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.sequelize.transaction(async (transaction) => {
      await queryInterface.dropTable("leave_request");
      await queryInterface.sequelize.query('DROP TYPE IF EXISTS "enum_leave_request_status"');
      await queryInterface.sequelize.query('DROP TYPE IF EXISTS "enum_leave_request_type"');
    });
  },
};
