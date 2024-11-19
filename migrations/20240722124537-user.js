"use strict";
const { Status } = require("../models/common/status-enum");
const { EmployementType } = require("../models/user/employment-type-enum");

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, DataTypes) {
    await queryInterface.createTable("user", {
      id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
        allowNull: false,
      },
      user_id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.fn("uuid_generate_v4"),
        allowNull: false,
      },
      name: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      status: {
        type: DataTypes.ENUM(Status.getValues()),
        allowNull: false,
        defaultValue: Status.ENUM.ACTIVE,
      },
      phone_number: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      type: {
        type: DataTypes.ENUM(EmployementType.getValues()),
        allowNull: false,
      },
      email: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: true,
      },
      password: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      profile_image_id: {
        type: DataTypes.INTEGER,
        allowNull:true,
        references: {
            model: 'attachment',
            key: 'id'
        }
      },
      date_of_joining: {
        type: DataTypes.DATE,
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
      department_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
          model: "department",
          key: "id",
        },
      },
      organization_role_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
          model: "organization_role",
          key: "id",
        },
      },
      bradford_score: {
        type: DataTypes.INTEGER,
        allowNull: false,
        defaultValue: 0,
      },
      experience: {
        type: DataTypes.INTEGER,
        allowNull: false,
        defaultValue: 0,
      },
      parent_id: {
        type: DataTypes.INTEGER,
        allowNull: true,
        references: {
          model: "user",
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
    await queryInterface.sequelize.transaction(async (transaction) => {
      await queryInterface.dropTable("user", { transaction });
      await queryInterface.sequelize.query('DROP TYPE IF EXISTS "enum_user_status"', { transaction });
      await queryInterface.sequelize.query('DROP TYPE IF EXISTS "enum_user_type"', { transaction });
    });
  },
};
