const { removeUuid, isUUID } = require("../common/common-functions");
const { redisGetter } = require("../common/redis-getter");
const { redisSetter } = require("../common/redis-setter");
const HolidayBuilder = require("../holiday/holiday-builder");
const UserBuilder = require("../user/user-builder");

class OrganizationBuilder {
  constructor(
    getter = redisGetter,
    setter = redisSetter
  ) {
    this.getter = getter;
    this.setter = setter;
    this.users = null;
  }

  withUsers() {
    this.users = [];
    return this;
  }

  async getBulkHolidays (key) {
    console.log('key: ', key);
    const data = await this.getter(key);
    console.log('data: ', data);
    const holiday = new HolidayBuilder();

    if( data.rows && data.rows.length>0 && isUUID(data.rows[0]))  data.rows = await Promise.all(
       data.rows.map(async uuid => {
       return holiday.get(uuid);
       }) 
     )
 
     return data;
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
    const organization = await this.getter(key);

    if (organization && this.users) {
      const userBuilder = new UserBuilder();

      this.users = await Promise.all(
       organization.users.map(async (user) => {
          return userBuilder.get(user);
        })
      );

      organization.users = this.users;
    }

    return removeUuid( organization);
  }
}

module.exports = OrganizationBuilder;
