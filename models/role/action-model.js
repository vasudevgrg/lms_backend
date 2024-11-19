const { Model } = require("sequelize");

module.exports = (sequelize, DataTypes) => {
    class Action extends Model {
        toJSON() {
            return { ...this.get(), id: undefined };
        }
    }

    Action.init(
        {
            id: {
                type: DataTypes.INTEGER,
                primaryKey: true,
                autoIncrement: true,
                allowNull: false,
            },
            name: {
                type: DataTypes.STRING,
                allowNull: false,
                unique: true,
                validate: {
                    notEmpty: {
                        msg: "Name is required"
                    },
                    notNull: {
                        msg: "Name is required"
                    }
                }
            },
            value: {
                type: DataTypes.STRING,
                allowNull: false,
                validate: {
                    notEmpty: {
                        msg: "Value is required"
                    },
                    notNull: {
                        msg: "Value is required"
                    }
                }
            },
            description: {
                type: DataTypes.STRING,
                allowNull: true
            }
        },
        {
            sequelize,
            paranoid: true,
            timestamps: false,
            underscored: true,
            tableName: 'action',
        }
    );
    return Action;
};
