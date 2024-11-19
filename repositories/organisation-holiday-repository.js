const { Op } = require("sequelize");
const { sequelize } = require("../config/db-connection");
const db = require("../models");
const { BaseRepository } = require("./base-repository");

class OrganizationHolidayRepository extends BaseRepository {
  constructor(payload) {
    super(payload);
  }

  async createOrganizationHoliday(payload, transaction) {
    const { organization_uuid, holiday_uuid } = payload;
    console.log(' organization_uuid, holiday_uuid: ',  organization_uuid, holiday_uuid);
    const organization_id = await this.getLiteralFrom('organization', organization_uuid, 'uuid');
    console.log('organization_id: ', organization_id);
    const holiday_id = await this.getLiteralFrom('holiday', holiday_uuid, 'uuid');
    console.log('holiday_id: ', holiday_id);
    return await this.create({ organization_id, holiday_id }, { transaction });
  };

  async getFilteredOrganizationHolidays(payload, transaction) {
    const { organization_uuid, holiday_uuid, date_range } = payload;
    const holidayCriteria = {};
    const criteria = {};
    if (organization_uuid) {
      criteria.organization_id = { [Op.eq]: this.getLiteralFrom('organization', organization_uuid) }
    };

    if (holiday_uuid) {
      criteria.holiday_id = { [Op.eq]: this.getLiteralFrom('holiday', holiday_uuid) };
      holidayCriteria.id = { [Op.eq]: this.getLiteralFrom('holiday', holiday_uuid) };
    }

    if (date_range) {
      holidayCriteria.date_observed = { [Op.between]: date_range }
    }

    const include = [
      {
        association: this.model.holiday,
        attributes: ['date_observed', 'name', 'uuid'],
        where: holidayCriteria
      }
    ];

    return await this.findAndCountAll(criteria, include);
  }

  async getHolidaysCount({ organization_uuid, date_range }) {
    const criteria = {};
    const holidayCriteria = {};

    console.log({ organization_uuid, date_range });

    if (organization_uuid) {
      criteria.organization_id = { [Op.eq]: this.getLiteralFrom('organization', organization_uuid) };
    }
    if (date_range) {
      holidayCriteria.date_observed = { [Op.between]: date_range };
    }

    const include = [
      {
        association: this.model.holiday,
        where: holidayCriteria,
        attributes: []
      }
    ]

    const attributes = [
      [this.sequelize.fn('COUNT', this.sequelize.col('holiday.id')), 'count']
    ];

    const result = await this.findAll(criteria, include, true, attributes, undefined, { group: ['holiday.id'] });

    if (!result || result.length === 0) {
      return 0;
    }

    return Number(result[0].toJSON().count);
  }

  async getOrganizationHolidayByIds(organizationUUID, holidayUUID) {
    const criteria = { organization_id: { [Op.eq]: this.getLiteralFrom("organization", organizationUUID) }, holiday_id: { [Op.eq]: this.getLiteralFrom("holiday", holidayUUID) } };
    return this.findOne(criteria);
  }

  async bulkCreateOrganizationHoliday (payload) {
    return this.bulkCreate(payload);
  }
}

module.exports = {
  organizationHolidayRepository: new OrganizationHolidayRepository({
    sequelize: sequelize,
    model: db.organization_holiday
  })
}