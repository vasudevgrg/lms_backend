const { Model } = require("sequelize");

module.exports = (sequelize, DataTypes) => {

    class LeaveBalance extends Model {

        static user
        static leave_type

        static associate(models) {
            this.user = LeaveBalance.belongsTo(models.user, { foreignKey: 'user_id', as: 'user' })
            this.leave_type = LeaveBalance.belongsTo(models.leave_type, { foreignKey: 'leave_type_id', as: 'leave_type' })
        }

        setSpecialLeaveAllowance(special_leave_allowence) {
            this.setDataValue('special_leave_allowence', special_leave_allowence);
        }

        increaseBalanceBy(value) {
            this.setDataValue('balance', +this.getDataValue('balance') + value);
            this.setDataValue('leaves_allocated', +this.getDataValue('leaves_allocated') + value);
            this.setDataValue('balance_last_updated_at', new Date());
        }

        deductBalanceBy(value) {
            this.setDataValue('balance', +this.getDataValue('balance') - Math.ceil(value));
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

    LeaveBalance.init({
        id: {
            type: DataTypes.INTEGER,
            primaryKey: true,
            autoIncrement: true,
            allowNull: false,
        },
        user_id: {
            type: DataTypes.INTEGER,
            allowNull: false,
            unique: "unique_index",
            validate: {
                notEmpty: {
                    msg: "User id is required.",
                },
                notNull: {
                    msg: "User id is required.",
                },
            },
            references: {
                model: 'user',
                key: 'id'
            }
        },
        leave_type_id: {
            type: DataTypes.INTEGER,
            allowNull: false,
            unique: "unique_index",
            validate: {
                notEmpty: {
                    msg: "Leave type id is required.",
                },
                notNull: {
                    msg: "Leave type id is required.",
                },
            },
            references: {
                model: 'leave_type',
                key: 'id'
            }
        },
        leaves_allocated: {
            type: DataTypes.INTEGER,
            allowNull: false,
            validate: {
                notEmpty: {
                    msg: "Leaves allocated is required.",
                },
                notNull: {
                    msg: "Leaves allocated is required.",
                },
            },
        },
        balance: {
            type: DataTypes.DECIMAL(10, 2),
            allowNull: false,
            validate: {
                notEmpty: {
                    msg: "Balance is required.",
                },
                notNull: {
                    msg: "Balance is required.",
                },
            },
        },
        special_leave_allowence: {
            type: DataTypes.INTEGER,
            allowNull: true,
        },
        // balance_last_updated_at: {
        //     type: DataTypes.DATE,
        //     allowNull: true,
        // },
    }, {
        sequelize,
        paranoid: true,
        timestamps: true,
        underscored: true,
        tableName: "leave_balance",
        createdAt: "created_at",
        updatedAt: "updated_at",
        deletedAt: "deleted_at",
        indexes: [
            {
                name: "unique_index",
                unique: true,
                fields: ["user_id", "leave_type_id"]
            }
        ],
    })

    return LeaveBalance
};