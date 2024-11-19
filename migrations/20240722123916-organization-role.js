'use strict';

const { Status } = require('../models/common/status-enum');
const { ShiftType } = require('../models/role/shift-type-enum');

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, DataTypes) {
    await queryInterface.createTable("organization_role", {
      id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
        allowNull: false,
      },
      uuid: {
        type: DataTypes.UUID,
        allowNull: false,
        unique: true,
        defaultValue: DataTypes.fn("uuid_generate_v4"),
      },
      role_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        unique: "unique_index",
        references: {
          model: 'role',
          key: 'id',
        },
        validate: {
          notNull: {
            msg: 'Role ID is required',
          },
          notEmpty: {
            msg: 'Role ID cannot be empty',
          },
        }
      },
      organization_id: {
        type: DataTypes.INTEGER,
        unique: "unique_index",
        allowNull: false,
        references: {
          model: 'organization',
          key: 'id',
        },
        validate: {
          notNull: {
            msg: 'Organization ID is required',
          },
          notEmpty: {
            msg: 'Organization ID cannot be empty',
          },
        }
      },
      shift_type: {
        type: DataTypes.ENUM(ShiftType.getValues()),
        allowNull: false,
        defaultValue: ShiftType.ENUM.DAY,
        validate: {
          isIn: {
            args: [ShiftType.getValues()],
            msg: `Shift Type must be one of: ${ShiftType.getValues().join(", ")}`
          }
        }
      },
      role_description: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      status: {
        type: DataTypes.ENUM(Status.getValues()),
        allowNull: false,
        defaultValue: Status.ENUM.ACTIVE,
      },
    }, {
      uniqueKeys: {
        unique_index: {
          fields: ["role_id", "organization_id"]
        }
      }
    });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable("organization_role");
  }
};
