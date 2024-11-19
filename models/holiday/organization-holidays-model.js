const { Model } = require("sequelize");
const { ConflictError, NotFoundError } = require("../../middleware/error");
const { Status } = require("../common/status-enum");
const { isValidUUID } = require("../common/validator");


module.exports = (sequelize, DataTypes) => {

    class OrganizationHoliday extends Model {
        static organization
        static holiday

        static associate(models) {
            this.organization = OrganizationHoliday.belongsTo(models.organization, { foreignKey: 'organization_id', as: 'organization' })
            this.holiday = OrganizationHoliday.belongsTo(models.holiday, { foreignKey: 'holiday_id', as: 'holiday' })
        }

        toJSON() {
            return {
                ...this.get(),
                id: undefined,
                organization_id: undefined,
                holiday_id: undefined,
            };
        }

        isActive() {
            return this.getDataValue('status') == Status.ENUM.ACTIVE
        }


        activate() {
            if (this.isActive()) throw new ConflictError("Organization Holiday is already activated.");
            this.setDataValue("status", Status.ENUM.ACTIVE);
        }

        deactivate() {
            if (!this.isActive()) throw new ConflictError("Organization Holiday is already deactivated.");
            this.setDataValue("status", Status.ENUM.INACTIVE);
        }
    }

    OrganizationHoliday.init({
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
        organization_id: {
            type: DataTypes.INTEGER,
            allowNull: false,
            unique: "unique_index",
            validate: {
                notEmpty: {
                    msg: "Organization id is required.",
                },
                notNull: {
                    msg: "Organization id is required.",
                }
            },
            references: {
                model: 'organization',
                key: 'id'
            }
        },
        holiday_id: {
            type: DataTypes.INTEGER,
            allowNull: false,
            unique: "unique_index",
            validate: {
                notEmpty: {
                    msg: "Holiday id is required.",
                },
                notNull: {
                    msg: "Holiday id is required.",
                }
            },
            references: {
                model: 'holiday',
                key: 'id'
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
        start_date: {
            type: DataTypes.DATE,
            allowNull: true,
            validate: {
                isDate: {
                    msg: "Start date must be a valid date."
                },
                validate_start_date(start_date) {
                    if (start_date && !this.getDataValue(end_date)) {
                        throw new NotFoundError("end_date must exist");
                    }
                }
            }
        },
        end_date: {
            type: DataTypes.DATE,
            allowNull: true,
            validate: {
                isDate: {
                    msg: "End date must be a valid date."
                },
                validate_start_date(end_date) {
                    if (end_date && !this.getDataValue(start_date)) {
                        throw new NotFoundError("start_date must exist");
                    }
                }
            }
        }
    }, {
        sequelize,
        timestamps: false,
        underscored: true,
        tableName: "organization_holiday",
        indexes: [
            {
                name: "unique_index",
                unique: true,
                fields: ["holiday_id", "organization_id"]
            }
        ],
    })

    return OrganizationHoliday
};