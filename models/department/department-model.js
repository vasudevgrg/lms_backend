const { Model } = require('sequelize');
const { isValidUUID } = require("../common/validator");
const { Status } = require('../common/status-enum');
const { ConflictError } = require('../../middleware/error');

module.exports = (sequelize, DataTypes) => {
  class Department extends Model {
    static organization;
    static users;

    static associate(models) {
      this.organization = Department.belongsTo(models.organization, { foreignKey: 'organization_id', as: 'organization' });
      this.users = Department.hasMany(models.user, { foreignKey: 'department_id', as: 'users' });
    }

    toJSON() {
      return {
        ...this.get(),
        id: undefined,
        organization_id: undefined,
      };
    }

    isActive() {
      return this.getDataValue('status') == Status.ENUM.ACTIVE
    }


    activate() {
      if (this.isActive())
        throw new ConflictError("Department is already activated.");
      this.setDataValue("status", Status.ENUM.ACTIVE);
    }

    deactivate() {
      if (!this.isActive())
        throw new ConflictError("Department is already deactivated.");
      this.setDataValue("status", Status.ENUM.INACTIVE);
    }
  }

  Department.init(
    {
      id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
        allowNull: false,
      },
      uuid: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        unique: true,
        allowNull: false,
        validate: {
          isValidUUID(value) {
            if (isValidUUID(value) === false)
              throw new Error("Invalid UUID format.")
          },
          notEmpty: {
            msg: "Department uuid is required.",
          }
        }
      },
      organization_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        validate: {
          notEmpty: {
            msg: 'Organization ID is required',
          },
          notNull: {
            msg: 'Organization ID is required',
          },
        },
        references: {
          model: 'organization',
          key: 'id',
        },
      },
      name: {
        type: DataTypes.STRING,
        allowNull: false,
        validate: {
          notEmpty: {
            msg: 'Name is required',
          },
          notNull: {
            msg: 'Name is required',
          },
        },
      },
      description: {
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
      paranoid: true,
      timestamps: true,
      underscored: true,
      tableName: 'department',
      createdAt: 'created_at',
      updatedAt: 'updated_at',
      deletedAt: 'deleted_at',
    }
  );
  return Department;
};
