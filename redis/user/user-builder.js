const { removeUuid } = require("../common/common-functions");
const  {redisGetter} = require( "../common/redis-getter");
const  {redisSetter} = require( "../common/redis-setter");

 class UserBuilder {
    constructor(
        getter = redisGetter,
        setter = redisSetter
    ) {
        this.getter = getter;
        this.setter = setter;
    }

    withOrganization(organization) {
        this.organization = organization;
        return this;
    }

    withOrganizationRole(organization_role) {
        this.organization_role = organization_role;
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

   async get(key) {
        const user =await this.getter(key);

        if (!user) {
            return false;
        }

        if (this.organization) {
            user.organization =await this.organization.get(user.organization);
        }

        if(this.organization_role) {
            user.organization_role = await this.organization_role.get(user.organization_role);
            // `organisation_roles:${user.organization_role}`
        }



        return removeUuid(user);
    }
}

module.exports= UserBuilder

// const userClass = new UserClass();
// const organisationClass = new OrganizationClass()
// organisationClass.withOrganizationRole(organisationRoleClass)
// userClass.withOrganization(organisationClass)