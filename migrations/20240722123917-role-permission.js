'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, DataTypes) {
    await queryInterface.createTable("role_permission", {
      id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
        allowNull: false,
      },
      permission_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        unique: "unique_index",
        references: {
          model: 'role_permission',
          key: 'id',
        },
        validate: {
          notNull: {
            msg: 'Permission ID is required',
          },
          notEmpty: {
            msg: 'Permission ID cannot be empty',
          },
        }
      },
      organization_role_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        unique: "unique_index",
        references: {
          model: 'organization_role',
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
      action: {
        type: DataTypes.JSON,
        allowNull: false,
        defaultValue: '[]',
        validate: {
          validateActions(value) {
            if (!Array.isArray(value)) throw new Error("Action must be an Array");
          }
        }
      },
    }, {
      uniqueKeys: {
        unique_index: {
          fields: ["permission_id", "organization_role_id"]
        }
      }
    });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable("role_permission");
  }
};
