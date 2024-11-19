const { redisGetter } = require( "../common/redis-getter");
const { redisSetter } = require( "../common/redis-setter");

 class OrganizationRoleBuilder {
    constructor(
        getter = redisGetter,
        setter = redisSetter
      ) {
        this.getter = getter;
        this.setter = setter;
      }

      withRole(role) {
        this.role = role;
        return this;
      }

      async get(key) {
        const organization_role = await this.getter(key);

        if(this.role) {
            organization_role.role = await this.role.get(organization_role.role);
        }
        return organization_role;
      }

}

module.exports = OrganizationRoleBuilder;