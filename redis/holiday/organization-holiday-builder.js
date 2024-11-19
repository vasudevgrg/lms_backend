const { removeUuid } = require("../common/common-functions");
const { redisGetter } = require("../common/redis-getter");
const { redisSetter } = require("../common/redis-setter");

class OrganizationHolidayBuilder {
    constructor(
        getter = redisGetter,
        setter = redisSetter
    ) {
        this.getter = getter;
        this.setter = setter;
    }

    withHoliday(holiday) {
        this.holiday = holiday;
        return this;
    }

    async getBulkOrganizationHolidays(key) {
        const data = await this.getter(key);
    
       if( data.rows)  data.rows = await Promise.all(
          data.rows.map(async uuid => {
            return this.get(uuid);
          }) 
        )
        return data;
      }

    async get(key) {
        const organization_holiday = await this.getter(key);
        
        if(this.holiday) {
            organization_holiday.holiday = await this.holiday.get(organization_holiday.holiday);
        }
        console.log('organization_holiday: ', organization_holiday);

        return removeUuid(organization_holiday);
    }
}

module.exports = OrganizationHolidayBuilder