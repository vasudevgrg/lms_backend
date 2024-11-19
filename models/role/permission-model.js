const { Model } = require("sequelize");
const { isValidUUID } = require("../common/validator");
const  PermissionENUM  = require("../common/permission-enum");


module.exports = (sequelize, DataTypes) => {
  class Permission extends Model {
    toJSON() {
      return { ...this.get(), id: undefined };
    }
  }

  Permission.init(
    {
      id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
        allowNull: false,
      },
      uuid: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        unique: true,
        allowNull: false,
        validate: {
          isValidUUID(value) {
            if (isValidUUID(value) === false)
              throw new Error("Invalid UUID format.");
          },
          notEmpty: {
            msg: "UUID is required",
          },
          notNull: {
            msg: "UUID is required",
          },
        },
      },
      name: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: true,
        validate:{
          notEmpty:{
            msg:"Name is required"
          },
          notNull:{
            msg:"Name is required"
          }
        }
      },
      description: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      value:{
        type: DataTypes.ENUM(PermissionENUM.Permission.getValues()),
        allowNull:false,
        validate:{
          notEmpty:{
            msg:"Value is required"
          },
          notNull:{
            msg:"Value is required"
          }
        }
      },
      actions: {
        type: DataTypes.ARRAY(DataTypes.STRING),
        allowNull: false
      }
    },
    {
      sequelize,
      timestamps: false,
      underscored: true,
      tableName: 'permission',
    }
  );
  return Permission;
};
