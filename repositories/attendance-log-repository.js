const { Op } = require("sequelize");
const { BaseRepository } = require("./base-repository");
const { NotFoundError } = require("../middleware/error");
const { sequelize } = require("../config/db-connection");
const db = require("../models");
const { AttendanceLogType } = require("../models/attendance/attendance-log-type-enum");

class AttendanceLogRepository extends BaseRepository {
    constructor(payload) {
        super(payload);
      };

      async getAttendanceLog ({attendance_id, location}) {

        const criteria = {};
        if(attendance_id) criteria.attendance_id= {[Op.eq]: attendance_id};
         if(location) criteria.location= location;
        return this.findAll(criteria);
      }

     async createAttendanceLog ({attendance_id,location, type}, transaction) {
        console.log("inside create attendance log");
        const time= (new Date()).toTimeString().split(" ")[0];
        const payload = {attendance_id, time, location, type};

        return this.create(payload, {transaction});
     }

     async updateAttendanceLog ({attendance_id, location}) {
        //At one opint of time, we can be loggedIn at only one location.
        const check_out = (new Date()).toTimeString().split(" ")[0];
        const criteria = {attendance_id: {[Op.eq]: attendance_id}, location: location};
        const payload = {check_out};

        const updatedResult =await this.update(criteria, payload);

        if(!updatedResult) {
            throw new NotFoundError('Attendence for this check-in is not found.', 'User Attendance is not found')
        }else{
            return true;
        }
     }

     async recordAttendanceLog ({attendance_id, location, updates}, transaction){
       const {check_in, check_out} = updates;

       if(check_in) {
         const payload = {attendance_id, location, type: AttendanceLogType.ENUM.CHECK_IN, time: check_in};
         await this.create(payload, {transaction});
       }
       if(check_out) {
         const payload = {attendance_id, location, type: AttendanceLogType.ENUM.CHECK_OUT, time: check_out};
         await this.create(payload, {transaction});         
       }
       
       return true;
     }

     async bulkCreateAttendanceLog (payload, transaction) {
        return this.bulkCreate(payload, { transaction, updateOnDuplicate: ["check_in", "check_out"] });

     }

}

module.exports = {
    attendanceLogRepository: new AttendanceLogRepository({
      sequelize: sequelize,
      model: db.attendance_log,
    }),
  };