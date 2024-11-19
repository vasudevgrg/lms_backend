"use strict";

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, DataTypes) {
    await queryInterface.createTable("leave_attachment", {
      id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
        allowNull: false,
      },
      leave_request_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
          model: "leave_request",
          key: "id",
        },
      },
      attachment_id: {
        type: DataTypes.INTEGER,
        allowNull: true,
        references: {
          model: "attachment",
          key: "id",
        },
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
    await queryInterface.dropTable("leave_attachment");
  },
};
