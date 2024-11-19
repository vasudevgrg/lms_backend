const { redisGetter } = require("../common/redis-getter");
const { redisSetter } = require("../common/redis-setter");

class DepartmentBuilder {
    constructor(
        getter = redisGetter,
        setter = redisSetter
    ) {
        this.getter = getter;
        this.setter = setter;

        console.log(this.getter)
    }
}

module.exports = DepartmentBuilder;