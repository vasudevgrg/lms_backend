"use strict";

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, DataTypes) {
    await queryInterface.createTable("leave_balance", {
      id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
        allowNull: false,
      },
      user_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        unique: "unique_index",
      },
      leave_type_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        unique: "unique_index",
      },
      leaves_allocated:{
        type: DataTypes.INTEGER,
        allowNull: false,
      },
      balance: {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: false,
      },
      special_leave_allowence: {
        type: DataTypes.INTEGER,
        allowNull: true,
      },
      balance_last_updated_at: {
        type: DataTypes.DATE,
        allowNull: true,
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
    }, {
      uniqueKeys: {
        unique_index: {
          fields: ["user_id", "leave_type_id"]
        }
      }
    });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable("leave_balance");
  },
};
