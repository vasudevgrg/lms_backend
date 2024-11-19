const { Model } = require("sequelize");
const { ShiftType } = require("./shift-type-enum");
const { Status } = require("../common/status-enum");
const { ConflictError } = require("../../middleware/error");

module.exports = (sequelize, DataTypes) => {
  class OrganizationRole extends Model {
    static role;
    static organization;
    static users;
    static role_permissions;

    static associate(models) {
      this.role = OrganizationRole.belongsTo(models.role, { foreignKey: 'role_id', as: 'role' });
      this.organization = OrganizationRole.belongsTo(models.organization, { foreignKey: 'organization_id', as: 'organization', });
      this.users = OrganizationRole.hasMany(models.user, { foreignKey: 'organization_role_id', as: 'users' });
      this.role_permissions = OrganizationRole.hasMany(models.role_permission, { foreignKey: 'organization_role_id', as: 'role_permissions' });
    }

    toJSON() {
      return {
        ...this.get(),
        id: undefined,
        role_id: undefined,
        permission_id: undefined,
        organization_id: undefined,
      };
    }

    isActive() {
      return this.getDataValue('status') == Status.ENUM.ACTIVE
    }


    activate() {
      if (this.isActive())
        throw new ConflictError("Organization Role is already activated.");
      this.setDataValue("status", Status.ENUM.ACTIVE);
    }

    deactivate() {
      if (!this.isActive())
        throw new ConflictError("Organization Role is already deactivated.");
      this.setDataValue("status", Status.ENUM.INACTIVE);
    }
  }

  OrganizationRole.init(
    {
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
        defaultValue: DataTypes.UUIDV4
      },
      role_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        unique: {
          name: "unique_index",
          msg: "Same Role Already exist."
        },
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
        allowNull: false,
        unique: {
          name: "unique_index",
          msg: "Same Role Already exist."
        },
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
        validate: {
          isIn: {
            args: [Status.getValues()],
            msg: `Status must be one of: ${Status.getValues().join(", ")}`,
          },
          notNull: {
            msg: "Status is required",
          },
          notEmpty: {
            msg: "Status is required",
          },
        },
      },
    },
    {
      sequelize,
      timestamps: false,
      underscored: true,
      tableName: 'organization_role',
      indexes: [
        {
          name: "unique_index",
          unique: true,
          fields: ["role_id", "organization_id"]
        }
      ],
    }
  );
  return OrganizationRole;
};
