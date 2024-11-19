const { removeUuid } = require("../common/common-functions");
const { redisGetter } = require("../common/redis-getter");
const { redisSetter } = require("../common/redis-setter");

class HolidayBuilder {
    constructor(
        getter = redisGetter,
        setter = redisSetter
    ) {
        this.getter = getter;
        this.setter = setter;
    }

    async get(key) {
        const holiday = await this.getter(key);

        return removeUuid(holiday);
    }
}

module.exports = HolidayBuilder;