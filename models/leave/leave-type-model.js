const { Model } = require("sequelize");
const { isValidUUID, isValidDate } = require("../common/validator");
const { AccuralPeriod } = require("./accural-period-enum");
const { AccuralApplicableOn } = require("./accural-applicable-on-enum");
const { cleanObject } = require("../common/clean-object");
const { Gender } = require("../common/gender-enum");
const { MaritalStatus } = require("../common/marital-status-enum");

module.exports = (sequelize, DataTypes) => {

    class LeaveType extends Model {
        static leave_balances
        static leave_requests

        static associate(models) {
            this.leave_balances = LeaveType.hasMany(models.leave_balance, { foreignKey: 'leave_type_id', as: 'leave_balances' })
            this.leave_requests = LeaveType.hasMany(models.leave_request, { foreignKey: 'leave_type_id', as: 'leave_requests' })
        }

        getAccural() {
            return this.getDataValue("accural");
        }

        getApplicableFor() {
            return this.getDataValue("applicable_for");
        }

        getCarryForward() {
            return this.getDataValue("carryforward");
        }

        getLeaveCount() {
            return this.getAccural().leave_count;
        }

        toJSON() {
            return {
                ...this.get(),
                id: undefined,
                organization_id: undefined,
            };
        }
    }

    LeaveType.init({
        id: {
            type: DataTypes.INTEGER,
            primaryKey: true,
            autoIncrement: true,
            allowNull: false,
        },
        uuid: {
            type: DataTypes.UUID,
            defaultValue: DataTypes.UUIDV4,
            allowNull: false,
            unique: true,
            validate: {
                isValidUUID(value) {
                    if (isValidUUID(value) === false)
                        throw new Error("Invalid UUID format.")
                },
                notEmpty: {
                    msg: "UUID is required.",
                },
                notNull: {
                    msg: "UUID is required.",
                },
            }
        },
        name: {
            type: DataTypes.STRING,
            allowNull: false,
            set(value) {
                this.setDataValue("name", value?.trim());
            },
            validate: {
                notEmpty: {
                    msg: "Name is required.",
                },
                notNull: {
                    msg: "Name is required.",
                },
            },
        },
        is_paid_leave: {
            type: DataTypes.BOOLEAN,
            allowNull: false,
            defaultValue: true,
        },
        code: {
            type: DataTypes.STRING,
            allowNull: false,
            set(value) {
                this.setDataValue("code", value?.trim()?.toUpperCase());
            },
            unique: {
                name: "unique_index",
                msg: "Organization with Code already exists"
            },
            validate: {
                notEmpty: {
                    msg: "Code is required.",
                },
                notNull: {
                    msg: "Code is required.",
                },
            },

        },
        organization_id: {
            type: DataTypes.INTEGER,
            allowNull: false,
            unique: {
                name: "unique_index",
                msg: "Organization with Code already exists"
            },
            references: {
                model: "organization",
                key: "id",
            },
        },
        start_date: {
            type: DataTypes.DATE,
            allowNull: true,
        },
        end_date: {
            type: DataTypes.DATE,
            allowNull: true,
        },
        description: {
            type: DataTypes.STRING,
            allowNull: true,
            set(value) {
                this.setDataValue("description", value?.trim() || null);
            },
        },
        min_waiting_period: {
            type: DataTypes.INTEGER,
            allowNull: false,
            defaultValue: 0,
        },
        is_attachment_required: {
            type: DataTypes.BOOLEAN,
            allowNull: false,
            defaultValue: false,
        },
        is_sandwich_enabled: {
            type: DataTypes.BOOLEAN,
            allowNull: false,
            defaultValue: false,
        },
        is_clubbing_enabled: {
            type: DataTypes.BOOLEAN,
            allowNull: false,
            defaultValue: false,
        },
        carryforward: {
            type: DataTypes.JSONB,
            allowNull: true,
            set(value) {
                if (!value) return;
                if (typeof value !== "object" || Array.isArray(value))
                    throw new Error("Carry Forward should be a object.")
                this.setDataValue("carryforward", cleanObject(value, ["max_limit", "expiry_date"]));
            },
            validate: {
                validateCarryForward(value) {
                    if (!value) return;

                    if (!value.max_limit) throw new Error("Carry Forward max limit is required.")
                    else if (typeof value.max_limit !== "number") throw new Error("Carry Forward max limit should be a number.")
                    else if(value.max_limit<=0) throw new Error("Carry Forward max limit should be greater than zero.")
                    if (!value.expiry_date) throw new Error("Carry Forward expiry date is required.")
                    else if (!isValidDate(value.expiry_date)) throw new Error("Invalid Carry Forward expiry date.")
                }
            }
        },
        accural: {
            type: DataTypes.JSONB,
            allowNull: true,
            set(value) {
                if (!value) return;
                if (typeof value !== "object" || Array.isArray(value))
                    throw new Error("Accural should be a object.")
                this.setDataValue("accural", cleanObject(value, ["period", "applicable_on", "leave_count"]));
            },
            validate: {
                validateAccural(value) {
                    if (!value) return;

                    if (!value.period) throw new Error("Accural period is required.")
                    else if (!AccuralPeriod.isValidValue(value.period)) throw new Error(`Accural period must be one of: ${AccuralPeriod.getValues().join(", ")}.`)

                    if (!value.applicable_on) throw new Error("Accural applicable on is required.")
                    else if (!AccuralApplicableOn.isValidValue(value.applicable_on)) throw new Error(`Accural Aaplicable On must be one of: ${AccuralApplicableOn.getValues().join(", ")}.`)

                    if (!value.leave_count) throw new Error("Accural leave count is required.")
                    else if (typeof value.leave_count !== "number") throw new Error("Accural leave count should be a number.")
                    else if(value.leave_count<=0 ) throw new Error("Accural leave count should be gretaer than zero.")
                    }
            }
        },
        applicable_for: {
            type: DataTypes.JSONB,
            allowNull: true,
            set(value) {
                if (!value) return;
                if (typeof value !== "object" || Array.isArray(value))
                    throw new Error("Applicable for should be a object.")
                this.setDataValue("applicable_for", cleanObject(value, ["type", "value", "gender", "marital_status", "min_experience"]));
            },
            validate: {
                validateApplicableFor(value) {
                    if (!value) return;

                    if (!value.type) throw new Error("Applicable for type is required.")
                    else if (!["role", "employee"].includes(value.type)) throw new Error("Applicable for type must be one of: role, employee.");

                    if (!value.value) throw new Error("Applicable for value is required.")
                    else if (value.value !== "all" && !Array.isArray(value.value)) throw new Error("Applicable for value should be an array of UUIDs or 'all'.");
                    else if (value.value !== "all" && value.value.length === 0) throw new Error("Applicable for value should have at least one UUID.");
                    else if (value.value !== "all" && value.value.some(uuid => !isValidUUID(uuid))) throw new Error("Invalid UUID in Applicable for value.");

                    if (!value.gender) throw new Error("Applicable for gender is required.")
                    else if (value.gender !== "all" && !Gender.isValidValue(value.gender)) throw new Error(`Gender must be one of: ${Gender.getValues().join(", ")}.`)

                    if (!value.marital_status) throw new Error("Applicable for marital status is required.")
                    else if (value.marital_status !== "all" && !MaritalStatus.isValidValue(value.marital_status)) throw new Error(`Marital Status must be one of: ${MaritalStatus.getValues().join(", ")}.`)

                    if (!value.min_experience) value.min_experience = 0;
                    else if (typeof value.min_experience !== "number") throw new Error("Minimum experience should be a number.")
                    else if (value.min_experience < 0) throw new Error("Minimum experience should be greater than or equal to 0.")
                }
            }
        },
    }, {
        sequelize,
        paranoid: true,
        timestamps: true,
        underscored: true,
        tableName: "leave_type",
        createdAt: "created_at",
        updatedAt: "updated_at",
        deletedAt: "deleted_at",
        indexes: [
            {
                name: "unique_index",
                unique: true,
                fields: ["code", "organization_id"]
            }
        ],
    })

    return LeaveType;
};