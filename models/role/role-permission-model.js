const { Model } = require("sequelize");

module.exports = (sequelize, DataTypes) => {
  class RolePermission extends Model {
    static permission;
    static organization_role;

    static associate(models) {
      this.permission = RolePermission.belongsTo(models.permission, { foreignKey: 'permission_id', as: 'permission', });
      this.organization_role = RolePermission.belongsTo(models.organization_role, { foreignKey: 'organization_role_id', as: 'user_role', });
    }

    toJSON() {
      return {
        ...this.get(),
        id: undefined,
        role_id: undefined,
        permission_id: undefined,
        organization_role_id: undefined
      };
    }
  }

  RolePermission.init(
    {
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
          model: 'permission',
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
    },
    {
      sequelize,
      timestamps: false,
      underscored: true,
      tableName: 'role_permission',
      indexes: [
        {
          name: "unique_index",
          unique: true,
          fields: ["permission_id", "organization_role_id"]
        }
      ],
    }
  );
  return RolePermission;
};
