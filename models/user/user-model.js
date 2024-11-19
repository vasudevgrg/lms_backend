const { Model } = require("sequelize");
const { Status } = require("../common/status-enum");
const { ConflictError } = require("../../middleware/error");
const { EmployementType } = require("./employment-type-enum");
const { isValidPhoneNumber, isValidUUID } = require("../common/validator");

module.exports = (sequelize, DataTypes) => {
  class User extends Model {
    static organization_role;
    static organization;
    static leave_request_managers;
    static department;
    static leave_balances;
    static leave_requests;
    static personal_detail;
    static parent;
    static children;
    static attendances;
    static profile_image;

    static associate(models) {
      this.organization_role = User.belongsTo(models.organization_role, { foreignKey: "organization_role_id", as: "organization_role" });
      this.organization = User.belongsTo(models.organization, { foreignKey: "organization_id", as: "organization" });
      this.department = User.belongsTo(models.department, { foreignKey: "department_id", as: "department" });
      this.leave_request_managers = User.hasMany(models.leave_request_manager, { foreignKey: "user_id", as: "leave_request_managers" });
      this.leave_balances = User.hasMany(models.leave_balance, { foreignKey: "user_id", as: "leave_balances" });
      this.leave_requests = User.hasMany(models.leave_request, { foreignKey: "user_id", as: "leave_requests" });
      this.personal_detail = User.hasOne(models.user_personal_data, { foreignKey: "user_id", as: "personal_detail" });
      this.parent = User.belongsTo(models.user, { foreignKey: "parent_id", as: "parent" });
      this.children = User.hasMany(models.user, { foreignKey: "parent_id", as: "children" });
      this.attendances = User.hasMany(models.attendance, { foreignKey: "user_id", as: "attendances" });
      this.profile_image = User.belongsTo(models.attachment, { foreignKey: 'profile_image_id', as: 'profile_image', });
    }

    toJSON() {
      return {
        ...this.get(),
        id: undefined,
        organization_id: undefined,
        organization_role_id: undefined,
        department_id: undefined,
        password: undefined,
        parent_id: undefined,
      };
    }

    verifyPassword(password) {
      return this.password === password;
    }

    updatePassword(password) {
      this.setDataValue("password", password);
    }

    isActive() {
      return this.getDataValue('status') == Status.ENUM.ACTIVE
    }

    activate() {
      if (this.isActive()) throw new ConflictError("User is already activated.");
      this.setDataValue("status", Status.ENUM.ACTIVE);
    }

    deactivate() {
      if (!this.isActive()) throw new ConflictError("User is already deactivated.");
      this.setDataValue("status", Status.ENUM.INACTIVE);
    }
  }

  User.init(
    {
      id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
        allowNull: false,
      },
      user_id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        allowNull: false,
        validate: {
          isValidUUID(value) {
            if (isValidUUID(value) === false)
              throw new Error("Invalid UUID format.");
          },
          notEmpty: {
            msg: "User ID is required.",
          },
          notNull: {
            msg: "User ID is required.",
          },
        },
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
      status: {
        type: DataTypes.ENUM(Status.getValues()),
        allowNull: false,
        defaultValue: Status.ENUM.ACTIVE,
        validate: {
          isIn: {
            args: [Status.getValues()],
            msg: `Status must be one of: ${Status.getValues().join(", ")}`,
          },
          notNull: {
            msg: "Status is required",
          },
          notEmpty: {
            msg: "Status is required",
          },
        },
      },
      parent_id: {
        type: DataTypes.INTEGER,
        allowNull: true,
        references: {
          model: "user",
          key: "id",
        },
      },
      phone_number: {
        type: DataTypes.STRING,
        allowNull: true,
        validate: {
          isPhoneNumber(value) {
            if (!isValidPhoneNumber(value))
              throw new Error("Invalid phone number");
          },
          notEmpty: {
            msg: "Phone number is required.",
          },
        },
      },
      type: {
        type: DataTypes.ENUM(EmployementType.getValues()),
        allowNull: false,
        defaultValue: EmployementType.ENUM.FULL_TIME,
        validate: {
          isIn: {
            args: [EmployementType.getValues()],
            msg: `Employement Type must be one of: ${EmployementType.getValues().join(", ")}`,
          },
          notNull: {
            msg: "Employement Type is required.",
          },
          notEmpty: {
            msg: "Employement Type is required.",
          },
        },
      },
      email: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: true,
        validate: {
          isEmail: {
            msg: "Invalid email format.",
          },
          notEmpty: {
            msg: "Email is required.",
          },
          notNull: {
            msg: "Email is required.",
          },
        },
      },
      password: {
        type: DataTypes.STRING,
        allowNull: false,
        validate: {
          notEmpty: {
            msg: "Password is required.",
          },
          notNull: {
            msg: "Password is required.",
          },
        },
      },
      profile_image_id: {
        type: DataTypes.INTEGER,
        allowNull: true,
        references: {
            model: 'attachment',
            key: 'id'
        }
      },
      date_of_joining: {
        type: DataTypes.DATE,
        allowNull: false,
        defaultValue: new Date(),
        validate: {
          isDate: {
            msg: "Invalid date format.",
          },
          notNull: {
            msg: "Date of Joining is required.",
          },
          notEmpty: {
            msg: "Date of Joining is required.",
          },
        },
      },
      organization_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
          model: "organization",
          key: "id",
        },
        validate: {
          notEmpty: {
            msg: "Organization ID is required.",
          },
          notNull: {
            msg: "Organization ID is required.",
          },
        }
      },
      department_id: {
        type: DataTypes.INTEGER,
        allowNull: true,
        references: {
          model: "department",
          key: "id",
        },
        validate: {
          notEmpty: {
            msg: "Department ID is required.",
          },
        }
      },
      organization_role_id: {
        type: DataTypes.INTEGER,
        references: {
          model: "organization_role",
          key: "id",
        },
      },
      bradford_score: {
        type: DataTypes.INTEGER,
        allowNull: false,
        defaultValue: 0,
        validate: {
          isInt: true,
          min: 0,
          max: 500,
          notEmpty: {
            msg: "Bradford Score is required.",
          },
          notNull: {
            msg: "Bradford Score is required.",
          },
        },
      },
      // experience: {
      //   type: DataTypes.INTEGER,
      //   allowNull: false,
      //   defaultValue: 0,
      //   validate: {
      //     isInt: true,
      //     min: 0,
      //     notEmpty: {
      //       msg: "Experience is required.",
      //     },
      //     notNull: {
      //       msg: "Experience is required.",
      //     },
      //   },
      // },
    },
    {
      sequelize,
      paranoid: true,
      timestamps: true,
      underscored: true,
      tableName: "user",
      createdAt: "created_at",
      updatedAt: "updated_at",
      deletedAt: "deleted_at",
    }
  );

  return User;
};
