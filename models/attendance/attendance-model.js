const { Model } = require("sequelize");
const { AttendanceStatus } = require("./attendance-status-enum");

module.exports = (sequelize, DataTypes) => {

    class Attendance extends Model {
        static user
        static attendance_log

        static associate(models) {
            this.user = Attendance.belongsTo(models.user, { foreignKey: 'user_id', as: 'user' })
            this.attendance_log = Attendance.hasMany(models.attendance_log, {foreignKey:'attendance_id', as: 'attendance_log'})
        }

        isCheckedIn(){
            return this.getDataValue("check_in")&&!this.getDataValue('check_out')
        }

        isCheckedOut(){
            return !this.getDataValue("check_out")&&this.getDataValue('check_in')
        }

        isOnLeaveOrHoliday () {
            const status=  this.getDataValue('status');
            return status === AttendanceStatus.ENUM.ON_LEAVE || status === AttendanceStatus.ENUM.HOLIDAY
        }

        markCheckOut(status = AttendanceStatus.ENUM.PRESENT) {
            const checkInTime = this.getDataValue("check_in");
            const checkOutTime = new Date().toTimeString().split(" ")[0];
        
            this.setDataValue("check_out", checkOutTime);
            this.setDataValue("status", status);
        
            const today = new Date().toISOString().split("T")[0];
            const checkInDateTime = new Date(`${today}T${checkInTime}`);
            const checkOutDateTime = new Date(`${today}T${checkOutTime}`);
        
            const timeDifferenceInMilliseconds = checkOutDateTime - checkInDateTime;
            const timeDifferenceInHours = timeDifferenceInMilliseconds / (1000 * 60 * 60); 
        
            let affected_hours = parseFloat(this.getDataValue("affected_hours")) || 0;
            affected_hours += timeDifferenceInHours;
        
            this.setDataValue("affected_hours", parseFloat(affected_hours.toFixed(2)));
        }
        
        
        

        markCheckIn(){
            this.setDataValue("check_out", null);
            this.setDataValue("status", AttendanceStatus.ENUM.ON_DUTY);
            this.setDataValue("check_in", new Date().toTimeString().split(" ")[0]);
        }

        toJSON() {
            return {
                ...this.get(),
                id: undefined,
                user_id: undefined,
            };
        }
    }

    Attendance.init({
        id: {
            type: DataTypes.INTEGER,
            primaryKey: true,
            autoIncrement: true,
            allowNull: false,
        },
        user_id: {
            type: DataTypes.INTEGER,
            allowNull: false,
            unique: "attendance_user_id_date_unique",
            references: {
                model: "user",
                key: "id",
            },
        },
        date: {
            type: DataTypes.DATE,
            allowNull: false,
            unique: "attendance_user_id_date_unique",
            validate: {
                notEmpty: {
                    msg: "Attendance date is required.",
                },
                notNull: {
                    msg: "Attendance date is required.",
                }
            },
        },
        check_in: {
            type: DataTypes.TIME,
            allowNull: false,
            validate: {
                notEmpty: {
                    msg: "Check in time is required.",
                },
                notNull: {
                    msg: "Check in time is required.",
                }
            },
        },
        check_out: {
            type: DataTypes.TIME,
            allowNull: true,
            validate: {
                validateCheckOut(value) {
                    if (value && new Date(value).getTime() < new Date(this.getDataValue('check_in')).getTime()) {
                        throw new Error("Check out time cannot be less than check in time.")
                    }
                }
            },
        },
        status: {
            type: DataTypes.ENUM(AttendanceStatus.getValues()),
            values: [AttendanceStatus.getValues()],
            allowNull: false,
            defaultValue: AttendanceStatus.ENUM.ABSENT,
            validate: {
                notEmpty: {
                    msg: "Attendance status is required.",
                },
                notNull: {
                    msg: "Attendance status is required.",
                },
                isIn: {
                    args: [AttendanceStatus.getValues()],
                    msg: "Invalid attendance status."
                }
            },
        },
        affected_hours: {
            type: DataTypes.DECIMAL(10, 2),
            allowNull: true, 
        }
        
    }, {
        sequelize,
        timestamps: false,
        underscored: true,
        tableName: "attendance",
        indexes: [
            {
                name: "attendance_user_id_date_unique",
                unique: true,
                fields: ["user_id", "date"],
            },
        ],
    })

    return Attendance
};