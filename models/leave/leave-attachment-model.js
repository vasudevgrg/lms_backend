const { Model } = require("sequelize");

module.exports = (sequelize, DataTypes) => {

    class LeaveAttachment extends Model {
        static user;
        static attachment;

        static associate(models) {
            this.user = LeaveAttachment.belongsTo(models.leave_request, { foreignKey: 'leave_request_id', as: 'user', });
            this.attachment = LeaveAttachment.belongsTo(models.attachment, { foreignKey: 'attachment_id', as: 'attachment', });
        }

        toJSON() {
            return {
                ...this.get(),
                id: undefined,
                leave_request_id: undefined,
                attachment_id: undefined,
            };
        }
    }

    LeaveAttachment.init({
        id: {
            type: DataTypes.INTEGER,
            primaryKey: true,
            autoIncrement: true,
            allowNull: false,
        },
        leave_request_id: {
            type: DataTypes.INTEGER,
            allowNull: false,
            validate: {
                notEmpty: {
                    msg: "Leave Request id is required.",
                },
                notNull: {
                    msg: "Leave Request id is required.",
                },
            },
            references: {
                model: 'leave_request',
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
    }, {
        sequelize,
        timestamps: false,
        underscored: true,
        tableName: "leave_attachment",
    });

    return LeaveAttachment;
};