"use strict";

const { Status } = require('../models/common/status-enum');

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, DataTypes) {
    await queryInterface.createTable("department", {
      id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
        allowNull: false,
      },
      uuid: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.fn("uuid_generate_v4"),
        unique: true,
        allowNull: false,
      },
      organization_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
      name: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      description: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      status: {
        type: DataTypes.ENUM(Status.getValues()),
        allowNull: false,
        defaultValue: Status.ENUM.ACTIVE,
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
    await queryInterface.dropTable("department");
  },
};
