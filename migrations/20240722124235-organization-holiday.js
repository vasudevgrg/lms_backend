"use strict";

const { Status } = require('../models/common/status-enum');

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, DataTypes) {
    await queryInterface.createTable("organization_holiday", {
      id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
        allowNull: false,
      },
      uuid: {
        type: DataTypes.UUID,
        allowNull: false,
        defaultValue: DataTypes.fn("uuid_generate_v4"),
      },
      organization_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        unique: "unique_index"
      },
      holiday_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        unique: "unique_index"
      },
      status: {
        type: DataTypes.ENUM(Status.getValues()),
        allowNull: false,
        defaultValue: Status.ENUM.ACTIVE,
      },
      start_date: {
        type: DataTypes.DATE,
        allowNull: true
      },
      end_date: {
        type: DataTypes.DATE,
        allowNull: true
      }
    },
      {
        uniqueKeys: {
          unique_index: {
            fields: ["holiday_id", "organization_id"]
          }
        }
      });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable("organization_holiday");
  },
};
