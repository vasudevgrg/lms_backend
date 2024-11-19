"use strict";

const { UserIdPattern } = require('../models/organization/id-pattern-enum');
const { WorkDay } = require('../models/organization/work-day-enum');

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, DataTypes) {
    await queryInterface.createTable("organization_setting", {
      id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
        allowNull: false,
      },
      organization_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
          model: "organization",
          key: "id",
        },
      },
      work_day: {
        type: DataTypes.ENUM(WorkDay.getValues()),
        allowNull: false,
      },
      start_time: {
        type: DataTypes.TIME,
        allowNull: false,
      },
      end_time: {
        type: DataTypes.TIME,
        allowNull: false,
      },
      organization_logo_id: {
        type: DataTypes.INTEGER,
        allowNull: true,
        references: {
          model: "attachment",
          key: "id",
        },
      },
      employee_id_pattern_type: {
        type: DataTypes.ENUM(UserIdPattern.getValues()),
        allowNull: false,
      },
      employee_id_pattern_value: {
        type: DataTypes.STRING,
        allowNull: false,
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
      await queryInterface.dropTable("organization_setting", { transaction });
      await queryInterface.sequelize.query('DROP TYPE IF EXISTS "enum_organization_setting_work_day"', { transaction });
      await queryInterface.sequelize.query('DROP TYPE IF EXISTS "enum_organization_setting_employee_id_pattern_type"', { transaction });
    });
  },
};
