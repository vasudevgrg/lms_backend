const { Model } = require("sequelize");
const { isValidUUID } = require("../common/validator");

module.exports = (sequelize, DataTypes) => {

    class Attachment extends Model {
        static user;

        static associate(models) {
            this.user = Attachment.hasOne(models.user, { foreignKey: 'profile_image_id', as: 'profile_image'})
        }


        toJSON() {
            return {
                ...this.get(),
                id: undefined,
            };
        }
    }

    Attachment.init({   
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
                notNull: {
                    msg: "Attachment uuid is required.",
                },
                notEmpty: {
                    msg: "Attachment uuid is required.",
                }
            },
        },
        name: {
            type: DataTypes.STRING,
            allowNull: false,
            validate: {
                notNull: {
                    msg: "Attachment name is required.",
                },
                notEmpty: {
                    msg: "Attachment name is required.",
                }
            }
        },
        url: {
            type: DataTypes.STRING,
            allowNull: false,
            validate: {
                notNull: {
                    msg: "Attachment url is required.",
                },
                notEmpty: {
                    msg: "Attachment url is required.",
                },
                isUrl: {
                    msg: "Invalid url. Please enter a valid URL.",
                },
            },
        },
        size: {
            type: DataTypes.STRING,
            allowNull: false,
            validate: {
                notNull: {
                    msg: "Attachment size is required."
                },
                notEmpty: {
                    msg: "Attachment size is required.",
                },
            },
        },
    }, {
        sequelize,
        paranoid: true,
        timestamps: true,
        underscored: true,
        tableName: "attachment",
        createdAt: "created_at",
        updatedAt: "updated_at",
        deletedAt: "deleted_at",
    });

    return Attachment;
};