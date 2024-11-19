"use strict";

const { AttendanceStatus } = require('../models/attendance/attendance-status-enum');

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, DataTypes) {
    await queryInterface.createTable("attendance", {
      id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
        allowNull: false,
      },
      user_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        unique: "attendance_user_id_date_unique",
        references: {
          model: "user",
          key: "id",
        },
      },
      date: {
        type: DataTypes.DATE,
        allowNull: false,
        unique: "attendance_user_id_date_unique",
      },
      check_in: {
        type: DataTypes.TIME,
        allowNull: false,
      },
      check_out: {
        type: DataTypes.TIME,
        allowNull: true,
      },
      status: {
        type: DataTypes.ENUM(AttendanceStatus.getValues()),
        allowNull: false,
        defaultValue: AttendanceStatus.ENUM.ON_DUTY,
      },
      affected_hours : {
        type: DataTypes.DECIMAL(10,2),
        allowNull: false,
        defaultValue:0
      }
    }, {
      uniqueKeys: {
        attendance_user_id_date_unique: {
          fields: ["user_id", "date"],
        },
      },
    });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.sequelize.transaction(async (transaction) => {
      await queryInterface.dropTable("attendance", { transaction });
      await queryInterface.sequelize.query("DROP TYPE IF EXISTS \"enum_attendance_status\";", { transaction });
    });
  },
};
