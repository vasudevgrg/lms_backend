const { Model } = require("sequelize");
const { isValidPhoneNumber } = require("../common/validator");
const { BloodGroup } = require("./blood-group-enum");
const { MaritalStatus } = require("../common/marital-status-enum");
const { Gender } = require("../common/gender-enum");
const { isValidUUID } = require("../common/validator");


module.exports = (sequelize, DataTypes) => {

    class UserPersonalData extends Model {
        static user;
        static user_attachments;

        static associate(models) {
            this.user = UserPersonalData.belongsTo(models.user, { foreignKey: 'user_id', as: 'user', });
            this.user_attachments = UserPersonalData.hasMany(models.user_attachment, { foreignKey: 'user_id', as: 'user_attachments', });
        }

        toJSON() {
            return {
                ...this.get(),
                id: undefined,
                user_id: undefined,
            };
        }
    }

    UserPersonalData.init({
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
        parent_information: {
            type: DataTypes.JSON,
            allowNull: true,
            validate: {
                validateInformation(value) {
                    if (value && typeof value !== 'object') {
                        throw new Error("Invalid parent information format.");
                    }
                    if (value && value.father_name && typeof value.father_name !== 'string') {
                        throw new Error("Father name must be a string.");
                    }
                    if (value && value.mother_name && typeof value.mother_name !== 'string') {
                        throw new Error("Mother name must be a string.");
                    }
                    if (value && value.father_phone && !isValidPhoneNumber(value.father_phone)) {
                        throw new Error("Invalid father phone number.");
                    }
                    if (value && value.mother_phone && !isValidPhoneNumber(value.mother_phone)) {
                        throw new Error("Invalid mother phone number.");
                    }
                }
            }
        },
        email: {
            type: DataTypes.STRING,
            allowNull: true,
            validate: {
                isEmail: {
                    msg: "Invalid email format."
                },
                len: {
                    args: [0, 255],
                    msg: "Email cannot exceed 255 characters."
                }
            }
        },
        gender: {
            type: DataTypes.ENUM(Gender.getValues()),
            allowNull:true
        },
        emergency_contact: {
            type: DataTypes.STRING,
            allowNull: true,
            validate: {
                validatePhoneNumber(value) {
                    if (value && !isValidPhoneNumber(value)) {
                        throw new Error("Invalid emergency contact number.");
                    }
                }
            }
        },
        dob: {
            type: DataTypes.DATE,
            allowNull: true,
            validate: {
                isDate: {
                    msg: "Invalid date format."
                }
            }
        },
        blood_group: {
            type: DataTypes.ENUM(BloodGroup.getValues()),
            allowNull: true,
            validate: {
                isIn: {
                    args: [BloodGroup.getValues()],
                    msg: "Invalid blood group."
                }
            }
        },
        marital_status: {
            type: DataTypes.ENUM(MaritalStatus.getValues()),
            allowNull: true,
            validate: {
                isIn: {
                    args: [MaritalStatus.getValues()],
                    msg: "Invalid marital status."
                }
            }
        },
        current_address: {
            type: DataTypes.STRING,
            allowNull: true,
            validate: {
                len: {
                    args: [0, 255],
                    msg: "Current address cannot exceed 255 characters."
                }
            }
        },
        permanent_address: {
            type: DataTypes.STRING,
            allowNull: true,
            validate: {
                len: {
                    args: [0, 255],
                    msg: "Permanent address cannot exceed 255 characters."
                }
            }
        }
    }, {
        sequelize,
        paranoid: true,
        timestamps: true,
        underscored: true,
        tableName: "user_personal_data",
        createdAt: "created_at",
        updatedAt: "updated_at",
        deletedAt: "deleted_at",
    });

    return UserPersonalData;
};