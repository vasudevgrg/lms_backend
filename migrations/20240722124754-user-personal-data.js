"use strict";

const { BloodGroup } = require('../models/user/blood-group-enum');
const { MaritalStatus } = require('../models/common/marital-status-enum');
const { Gender } = require('../models/common/gender-enum');

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, DataTypes) {
    await queryInterface.createTable("user_personal_data", {
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
      user_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
          model: "user",
          key: "id",
        },
      },
      parent_information: {
        type: DataTypes.JSON,
        allowNull: true,
      },
      email: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      gender: {
        type: DataTypes.ENUM(Gender.getValues()),
        allowNull:true
    },
      emergency_contact: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      dob: {
        type: DataTypes.DATE,
        allowNull: true,
      },
      blood_group: {
        type: DataTypes.ENUM(BloodGroup.getValues()),
        allowNull: true,
      },
      marital_status: {
        type: DataTypes.ENUM(MaritalStatus.getValues()),
        allowNull: true,
      },
      current_address: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      permanent_address: {
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
      await queryInterface.dropTable("user_personal_data", { transaction });
      await queryInterface.sequelize.query('DROP TYPE IF EXISTS "enum_user_personal_data_blood_group"', { transaction });
      await queryInterface.sequelize.query('DROP TYPE IF EXISTS "enum_user_personal_data_marital_status"', { transaction });
    });
  },
};
