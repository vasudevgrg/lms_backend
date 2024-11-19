const { redisGetter } = require( "../common/redis-getter");
const { redisSetter } = require( "../common/redis-setter");

 class RoleBuilder {
    constructor(
        getter = redisGetter,
        setter = redisSetter
      ) {
        this.getter = getter;
        this.setter = setter;
      }

      async get(key) {
        const role = await this.getter(key);
        return role;
      }
}

module.exports = RoleBuilder;