const { redisGetter } = require("../common/redis-getter");
const { redisSetter } = require("../common/redis-setter");

class LeaveRequestBuilder {
    constructor(
        getter = redisGetter,
        setter = redisSetter
    ) {
        this.getter = getter;
        this.setter = setter;
    }

    withUser (user) {
        this.user = user;
        return this;
    }

    withLeaveType(leave_type) {
        this.getterleave_type = leave_type;
        return this;
    }

    withManager (manager) {
        this.manager = manager;
        return this;
    }

    async getBulk(key) {
        const data = await this.getter(key);
    
       if( data.rows)  data.rows = await Promise.all(
          data.rows.map(async uuid => {
            return this.get(uuid);
          }) 
        )
    
        return data;
      }

    async get (key) {
        const leave_request = await this.getter(key);

        if(this.user) {
            leave_request.user = await this.user.get(leave_request.user);
        }

        if(this.leave_type) {
            leave_request.leave_type = await this.leave_type.get(leave_request.leave_type);
        }

        if(this.manager) {
            leave_request.manager = [
                {remarks: leave_request.manager[0].remarks,
                    user : await this.user.get(leave_request.manager[0].user)
                }

            ]
        }
    }
}

module.exports = LeaveRequestBuilder