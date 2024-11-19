const { Model } = require("sequelize");
const { isValidUUID } = require("../common/validator");
const { Status } = require("../common/status-enum");
const { ConflictError } = require("../../middleware/error");

module.exports = (sequelize, DataTypes) => {

    class Organization extends Model {
        static users
        static departments
        static organization_roles
        static organization_holidays
        static organization_setting
        static leave_types

        static associate(models) {
            this.users = Organization.hasMany(models.user, { foreignKey: 'organization_id', as: 'users' })
            this.departments = Organization.hasMany(models.department, { foreignKey: 'organization_id', as: 'departments' })
            this.organization_roles = Organization.hasMany(models.organization_role, { foreignKey: 'organization_id', as: 'user_roles' })
            this.organization_holidays = Organization.hasMany(models.organization_holiday, { foreignKey: 'organization_id', as: 'organization_holidays' })
            this.organization_setting = Organization.hasOne(models.organization_setting, { foreignKey: 'organization_id', as: 'organization_setting' })
            this.leave_types=  Organization.hasMany(models.leave_type,{foreignKey: 'organization_id',as:'leave_types'})
        }

        toJSON() {
            return {
                ...this.get(),
                id: undefined,
            };
        }

        isActive() {
            return this.getDataValue('status') == Status.ENUM.ACTIVE
          }
      
      
          activate() {
            if (this.isActive())
              throw new ConflictError("Organization is already activated.");
            this.setDataValue("status", Status.ENUM.ACTIVE);
          }
      
          deactivate() {
            if (!this.isActive())
              throw new ConflictError("Organization is already deactivated.");
            this.setDataValue("status", Status.ENUM.INACTIVE);
          }
    }

    Organization.init({
        id: {
            type: DataTypes.INTEGER,
            primaryKey: true,
            autoIncrement: true,
            allowNull: false,
        },
        uuid: {
            type: DataTypes.UUID,
            allowNull: false,
            defaultValue: DataTypes.UUIDV4,
            validate: {
                isValidUUID(value) {
                    if (isValidUUID(value) === false)
                        throw new Error("Invalid UUID format.")
                },
                notEmpty: {
                    msg: "Organization uuid is required.",
                }
            }
        },
        name: {
            type: DataTypes.STRING,
            allowNull: false,
            validate: {
                notEmpty: {
                    msg: "Name is required.",
                },
                notNull: {
                    msg: "Name is required.",
                },
            }
        },
        domain: {
            type: DataTypes.STRING,
            allowNull: false,
            validate: {
                notEmpty: {
                    msg: "Domain is required.",
                },
                notNull: {
                    msg: "Domain is required.",
                },
                isUrl: {
                    msg: "Invalid domain URL format.",
                }
            }
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
    }, {
        sequelize,
        paranoid: true,
        timestamps: true,
        underscored: true,
        tableName: "organization",
        createdAt: "created_at",
        updatedAt: "updated_at",
        deletedAt: "deleted_at",
    });

    return Organization;
};
