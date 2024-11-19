
const { Model } = require("sequelize");
const { isValidUUID, isValidDate } = require("../common/validator");
const { ForbiddenError, ConflictError, BadRequestError } = require("../../middleware/error");
const { LeaveRequestStatus } = require("./leave-request-status-enum");
const { LeaveRequestType } = require("./leave-request-type-enum");

module.exports = (sequelize, DataTypes) => {

    class LeaveRequest extends Model {
        static user
        static leave_attachments
        static leave_type
        static managers
        // static leave_balance

        static associate(models) {
            this.user = LeaveRequest.belongsTo(models.user, { foreignKey: 'user_id', as: 'user' })
            this.leave_attachments = LeaveRequest.hasMany(models.leave_attachment, { foreignKey: 'leave_request_id', as: 'leave_attachments' })
            this.leave_type = LeaveRequest.belongsTo(models.leave_type, { foreignKey: 'leave_type_id', as: 'leave_type' })
            this.managers = LeaveRequest.hasMany(models.leave_request_manager, { foreignKey: 'leave_request_id', as: 'managers' })
            // this.leave_balance = LeaveRequest.hasOne(models.leave_balance, { foreignKey: 'leave_request_id', as: 'leave_balance' })
        }

        static calculateLeaveDuration(payload) {
            const { start_date, end_date } = payload;
            if (!isValidDate(start_date) || !isValidDate(end_date)) throw new BadRequestError("Invalid date format.", "Invalid date format.");
            const startDate = new Date(start_date);
            const endDate = new Date(end_date);
            const diffTime = Math.abs(endDate - startDate);
            const diffDays = diffTime / (1000 * 60 * 60 * 24);
            return diffDays;
        }

        isPending() {
            return this.getDataValue("status") === LeaveRequestStatus.ENUM.PENDING;
        }

        isApproved() {
            return this.getDataValue("status") === LeaveRequestStatus.ENUM.APPROVED;
        }

        isRejected() {
            return this.getDataValue("status") === LeaveRequestStatus.ENUM.REJECTED;
        }

        isCancelled() {
            return this.getDataValue("status") === LeaveRequestStatus.ENUM.CANCELLED;
        }

        isRecommended() {
            return this.getDataValue("status") === LeaveRequestStatus.ENUM.RECOMMENDED;
        }

        approve(user) {
            if (this.isApproved()) throw new ConflictError({ message: `Leave Request is already ${this.getDataValue("status")}` })
            if (this.isCancelled() || this.isRejected()) throw new ForbiddenError({ message: `Leave Request is already ${this.getDataValue("status")}` })
            this.setDataValue("status", LeaveRequestStatus.ENUM.APPROVED)
            this.setDataValue("status_changed_by", user.email);
        }

        recommend(user) {
            if (this.isRecommended()) throw new ConflictError({ message: `Leave Request is already ${this.getDataValue("status")}` })
            if (!this.isPending()) throw new ForbiddenError({ message: `Leave Request is already ${this.getDataValue("status")}` })
            this.setDataValue("status", LeaveRequestStatus.ENUM.RECOMMENDED);
            this.setDataValue("status_changed_by", user.email);
        }

        reject(user) {
            if (this.isRejected()) throw new ConflictError({ message: `Leave Request is already ${this.getDataValue("status")}` })
            if (this.isCancelled() || this.isApproved()) throw new ForbiddenError({ message: `Leave Request is already ${this.getDataValue("status")}` })
            this.setDataValue("status", LeaveRequestStatus.ENUM.REJECTED);
            this.setDataValue("status_changed_by", user.email);
        }

        cancel(user) {
            if (this.isCancelled()) throw new ConflictError({ message: `Leave Request is already ${this.getDataValue("status")}` })
            if (this.isApproved() || this.isRejected()) throw new ForbiddenError({ message: `Leave Request is ${this.getDataValue("status")}` })
            if (this.user.user_id !== user.user_id) throw new ForbiddenError({ message: "You are not authorized to perform this action." })
            this.setDataValue("status", LeaveRequestStatus.ENUM.CANCELLED)
        }

        toJSON() {
            return {
                ...this.get(),
                id: undefined,
                user_id: undefined,
                leave_type_id: undefined,
            };
        }

    }

    LeaveRequest.init({
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
                    if (!isValidUUID(value)) {
                        throw new Error("Invalid UUID.");
                    }
                },
                notEmpty: {
                    msg: "Leave Request UUID is required.",
                },
                notNull: {
                    msg: "Leave Request UUID is required.",
                }
            }
        },
        user_id: {
            type: DataTypes.INTEGER,
            allowNull: false,
            references: {
                model: 'user',
                key: 'id'
            },  
            validate: {
                notEmpty: {
                    msg: "User id is required.",
                },
                notNull: {
                    msg: "User id is required.",
                },
            },
        },
        leave_type_id: {
            type: DataTypes.INTEGER,
            allowNull: false,
            references: {
                model: 'leave_type',
                key: 'id'
            },
            validate: {
                notEmpty: {
                    msg: "Leave Type id is required.",
                },
                notNull: {
                    msg: "Leave Type id is required.",
                },
            },
        },
        start_date: {
            type: DataTypes.DATE,
            allowNull: false,
            validate: {
                notNull: {
                    msg: "Start Date is required."
                },
                notEmpty: {
                    msg: "Start Date is required."
                },
                isDate: {
                    msg: "Invalid date format."
                },
                isDateBeforeEndDate(value) {
                    if (value >= this.end_date) {
                        throw new Error("Start Date should be less than end_date.");
                    }
                }
            }
        },
        end_date: {
            type: DataTypes.DATE,
            allowNull: false,
            validate: {
                notNull: {
                    msg: "End Date is required."
                },
                notEmpty: {
                    msg: "End Date is required."
                },
                isDate: {
                    msg: "Invalid date format."
                },
                isDateAfterStartDate(value) {
                    if (value <= this.start_date) {
                        throw new Error("End Date should be greater than start_date.");
                    }
                }
            }
        },
        type: {
            type: DataTypes.ENUM(LeaveRequestType.getValues()),
            allowNull: false,
            validate: {
                notNull: {
                    msg: "Leave Type is required."
                },
                notEmpty: {
                    msg: "Leave Type is required."
                },
                isIn: {
                    args: [LeaveRequestType.getValues()],
                    msg: `Leave Request Type must be one of: ${LeaveRequestType.getValues().join(", ")}.`
                }
            },
        },
        leave_duration: {
            type: DataTypes.DECIMAL(10, 2),
            allowNull: false,
            validate: {
                notNull: {
                    msg: "Leave Duration is required."
                },
                notEmpty: {
                    msg: "Leave Duration is required."
                },
                isPositive(value) {
                    if (value < 0) {
                        throw new Error("Leave Duration should be positive.");
                    }
                    if (value > 365) {
                        throw new Error("Leave Duration should not be greater than 365 days.")
                    }
                }
            },
            set(value) {
                if (value === 1 && this.getDataValue("type") === LeaveRequestType.ENUM.HALF_DAY) {
                    value = 0.5;
                } else if (value === 1 && this.getDataValue("type") === LeaveRequestType.ENUM.SHORT_LEAVE) {
                    value = 0.25;
                }
                this.setDataValue("leave_duration", value);
            }
        },
        reason: {
            type: DataTypes.STRING,
            allowNull: true,
        },
        status: {
            type: DataTypes.ENUM(LeaveRequestStatus.getValues()),
            allowNull: false,
            defaultValue: LeaveRequestStatus.ENUM.PENDING,
            validate: {
                notNull: {
                    msg: "Status is required."
                },
                notEmpty: {
                    msg: "Status is required."
                },
                isValidStatus(value) {
                    if (!LeaveRequestStatus.isValidValue(value)) {
                        throw new Error("Invalid leave request status.");
                    }
                }
            }
        },
        status_changed_by: {
            type: DataTypes.STRING,
            allowNull: true
        },
    }, {
        sequelize,
        paranoid: true,
        timestamps: true,
        underscored: true,
        tableName: "leave_request",
        createdAt: "created_at",
        updatedAt: "updated_at",
        deletedAt: "deleted_at",
    });

    return LeaveRequest;
};

