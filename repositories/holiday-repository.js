const { Op, where } = require("sequelize");
const { sequelize } = require("../config/db-connection");
const db = require("../models");
const { BaseRepository } = require("./base-repository");
const { Paginator } = require("./common/pagination");

class HolidayRepository extends BaseRepository {
  constructor(payload) {
    super(payload);
  }

  async getFilteredHolidays({ name, holiday_type, date_observed, organization_uuid, holiday_uuid, date_range }, { order_type, order_column, page: pageOption, limit: limitOption }) {
    const { offset, limit, page } = new Paginator(pageOption, limitOption);
    let criteria = {};
    if (name) criteria.name = { [Op.eq]: name };
    if (holiday_type) criteria.holiday_type = { [Op.eq]: holiday_type };
    if (date_observed) criteria.date_observed = { [Op.eq]: date_observed };
    if (holiday_uuid) criteria.uuid = { [Op.eq]: holiday_uuid };
    if (date_range) criteria.date_observed = { [Op.between]: date_range };
    let paranoid = true;
    const order = [[order_column, order_type]];
    const include = []

    if (organization_uuid) {
      include.push({
        association: this.model.organization_holidays,
        attributes: [],
        where: { organization_id: { [Op.eq]: this.getLiteralFrom("organization", organization_uuid) } },
      })
    };

    const response = await this.findAndCountAll(criteria, include, offset, limit, order, paranoid);
    response.current_page = page + 1;
    response.per_page = limit;
    response.total = await this.count({}, { include, paranoid });
    return response;
  }

  async createHoliday(payload) {
    const { name, date_observed, type, description } = payload;
    const holiday = { name, date_observed, type, description };
    return this.create(holiday);
  }

  async getHolidayById(holiday_uuid) {
    let criteria = { uuid: { [Op.eq]: holiday_uuid } };
    return await this.findOne(criteria);
  }

  async updateHolidayById(holiday_uuid, payload) {
    const criteria = { uuid: { [Op.eq]: holiday_uuid } }
    const holiday = {
      name: payload.name,
      date_observed: payload.date_observed,
      holiday_type: payload.holiday_type,
      description: payload.description,
    };
    return this.update(criteria, holiday);
  }

  async createBulkHolidays(paylaod, transaction) {
    return this.bulkCreate(paylaod, { transaction })
  }
}

module.exports = {
  holidayRepository: new HolidayRepository({
    sequelize: sequelize,
    model: db.holiday,
  }),
};
