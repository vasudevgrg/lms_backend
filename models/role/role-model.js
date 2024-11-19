
const { Model } = require("sequelize");
const { Status } = require("../common/status-enum");
const { ConflictError } = require("../../middleware/error");

module.exports = (sequelize, DataTypes) => {

    class Role extends Model {
        static organization_roles;

        static associate(models) {
            this.organization_roles = Role.hasMany(models.organization_role, { foreignKey: 'role_id', as: 'user_roles' });
        }

        toJSON() {
            return {
                ...this.get(),
                id: undefined,
                role_level: undefined,
            };
        }
    }

    Role.init({
        id: {
            type: DataTypes.INTEGER,
            primaryKey: true,
            autoIncrement: true,
            allowNull: false,
        },
        uuid: {
            type: DataTypes.UUID,
            allowNull: false,
            defaultValue: DataTypes.UUIDV4
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
        description: {
            type: DataTypes.STRING,
            allowNull: true,
        },
        role_level: {
            type: DataTypes.INTEGER,
            allowNull: false,
            defaultValue: 3,
            set(value) {
                this.setDataValue("role_level", 3);
            }
        },
    }, {
        sequelize,
        paranoid: true,
        timestamps: true,
        underscored: true,
        tableName: "role",
        createdAt: "created_at",
        updatedAt: "updated_at",
        deletedAt: "deleted_at",
    });

    return Role;
};
