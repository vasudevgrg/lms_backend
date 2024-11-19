const { redisGetter } = require("../common/redis-getter");
const { redisSetter } = require("../common/redis-setter");

class LeaveTypeBuilder {
    constructor(
        getter = redisGetter,
        setter = redisSetter
    ) {
        this.getter = getter;
        this.setter = setter;
    }

    async get(key) {
        const leave_type = await this.getter(key);

        return leave_type;
    }
}