"use strict";

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, DataTypes) {
    await queryInterface.createTable("leave_type", {
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
      name: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      is_paid_leave: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: true,
      },
      code: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: "unique_index",
      },
      organization_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        unique: "unique_index",
        references: {
          model: "organization",
          key: "id",
        },
      },
      start_date: {
        type: DataTypes.DATE,
        allowNull: true,
      },
      end_date: {
        type: DataTypes.DATE,
        allowNull: true,
      },
      description: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      min_waiting_period: {
        type: DataTypes.INTEGER,
        allowNull: false,
        defaultValue: 0,
      },
      is_attachment_required: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: false,
      },
      is_sandwich_enabled: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: false,
      },
      is_clubbing_enabled: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: false,
      },
      carryforward: {
        type: DataTypes.JSONB,
        allowNull: true,
      },
      accural: {
        type: DataTypes.JSONB,
        allowNull: true,
      },
      applicable_for: {
        type: DataTypes.JSONB,
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
          fields: ["code", "organization_id"]
        }
      }
    });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable("leave_type");
  },
};
