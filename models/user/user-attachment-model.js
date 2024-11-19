const { Model } = require("sequelize");
const { AttachmentType } = require("./user-attachment-type-enum");

module.exports = (sequelize, DataTypes) => {

    class UserAttachment extends Model {
        static user_personal_data;
        static attachment;

        static associate(models) {
            this.user_personal_data = UserAttachment.belongsTo(models.user_personal_data, { foreignKey: 'user_id', as: 'user_personal_data', });
            this.attachment = UserAttachment.belongsTo(models.attachment, { foreignKey: 'attachment_id', as: 'attachment', });
        }

        toJSON() {
            return {
                ...this.get(),
                id: undefined,
                user_id: undefined,
                attachment_id: undefined,
            };
        }
    }

    UserAttachment.init({
        id: {
            type: DataTypes.INTEGER,
            primaryKey: true,
            autoIncrement: true,
            allowNull: false,
        },
        user_id: {
            type: DataTypes.INTEGER,
            allowNull: false,
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
        attachment_id: {
            type: DataTypes.INTEGER,
            allowNull: false,
            validate: {
                notEmpty: {
                    msg: "Attachment id is required.",
                },
                notNull: {
                    msg: "Attachment id is required.",
                },
            },
            references: {
                model: 'attachment',
                key: 'id'
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
            },
        },
        type: {
            type: DataTypes.ENUM(AttachmentType.getValues()),
            allowNull: false,
            validate: {
                isIn: {
                    args: [AttachmentType.getValues()],
                    msg: `Type must be one of: ${AttachmentType.getValues().join(", ")}`,
                },
                notEmpty: {
                    msg: "Type is required.",
                },
                notNull: {
                    msg: "Type is required.",
                },
            },
        },
        additional_data: {
            type: DataTypes.TEXT,
            allowNull: true,
        },
    }, {
        sequelize,
        timestamps: false,
        underscored: true,
        tableName: "user_attachment",
    });

    return UserAttachment;
};