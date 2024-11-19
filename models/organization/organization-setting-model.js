const { Model } = require("sequelize");
const { WorkDay } = require("./work-day-enum");
const { UserIdPattern } = require("./id-pattern-enum");

module.exports = (sequelize, DataTypes) => {

    class OrganizationSetting extends Model {
        static user;
        static logo;

        static associate(models) {
            this.user = OrganizationSetting.belongsTo(models.user, { foreignKey: 'user_id', as: 'user', });
            this.logo = OrganizationSetting.belongsTo(models.attachment, { foreignKey: 'company_logo_id', as: 'logo', });
        }

        toJSON() {
            return {
                ...this.get(),
                id: undefined,
                company_id: undefined,
                company_logo_id: undefined,
            };
        }
    }

    OrganizationSetting.init({
        id: {
            type: DataTypes.INTEGER,
            primaryKey: true,
            autoIncrement: true,
            allowNull: false,
        },
        organiozation_id: {
            type: DataTypes.INTEGER,
            allowNull: false,
            validate: {
                notEmpty: {
                    msg: "Organization id is required.",
                },
                notNull: {
                    msg: "Organization id is required.",
                },
            },
            references: {
                model: 'user',
                key: 'id'
            }
        },
        work_day: {
            type: DataTypes.ENUM(WorkDay.getValues()),
            allowNull: false,
            validate: {
                isIn: {
                    args: [WorkDay.getValues()],
                    msg: `Work day must be one of these values: ${WorkDay.getValues().join(", ")}`,
                },
                notEmpty: {
                    msg: "Work day is required.",
                },
                notNull: {
                    msg: "Work day is required.",
                },
            },
        },
        start_time: {
            type: DataTypes.TIME,
            allowNull: false,
            validate: {
                notEmpty: {
                    msg: "Start time is required.",
                },
                notNull: {
                    msg: "Start time is required.",
                },
            },
        },
        end_time: {
            type: DataTypes.TIME,
            allowNull: false,
            validate: {
                notEmpty: {
                    msg: "End time is required.",
                },
                notNull: {
                    msg: "End time is required.",
                },
                validateEndTime(value) {
                    if (value <= this.start_time)
                        throw new Error("End time must be greater than start time.");
                }
            },
        },
        company_logo_id: {
            type: DataTypes.INTEGER,
            allowNull: true,
            references: {
                model: 'attachment',
                key: 'id'
            }
        },
        employee_id_pattern_type: {
            type: DataTypes.ENUM(UserIdPattern.getValues()),
            allowNull: false,
            validate: {
                isIn: {
                    args: [UserIdPattern.getValues()],
                    msg: `ID pattern type must be one of these values: ${UserIdPattern.getValues().join(", ")}`,
                },
                notEmpty: {
                    msg: "ID pattern type is required.",
                },
                notNull: {
                    msg: "ID pattern type is required.",
                },
            },
        },
        employee_id_pattern_value: {
            type: DataTypes.STRING,
            allowNull: false,
            validate: {
                notEmpty: {
                    msg: "ID pattern value is required.",
                },
                notNull: {
                    msg: "ID pattern value is required.",
                },
            },
        },
    }, {
        sequelize,
        paranoid: true,
        timestamps: true,
        underscored: true,
        tableName: "organization_setting",
        createdAt: "created_at",
        updatedAt: "updated_at",
        deletedAt: "deleted_at",
    });

    return OrganizationSetting;
};