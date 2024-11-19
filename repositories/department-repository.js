const db = require("../models");
const { sequelize } = require("../config/db-connection");
const { BaseRepository } = require("./base-repository");
const { Op } = require("sequelize");
const { Paginator } = require("./common/pagination");

class DepartmentRepository extends BaseRepository {
  constructor(payload) {
    super(payload);
  }

  async getFilteredDepartments({ organization_uuid }, { order_type, order_column, page: pageOption, limit: limitOption }) {
    let criteria = {};
    const { offset, limit, page } = new Paginator(pageOption, limitOption);
    const order = [[order_column, order_type]];

    if (organization_uuid) {
      criteria.organization_id = { [Op.eq]: this.getLiteralFrom('organization', organization_uuid) };
    }

    const response = await this.findAndCountAll(criteria, [], offset, limit, order);
    response.current_page = page + 1;
    response.per_page = limit;
    response.total = await this.count(criteria);
    return response;
  }

  async createDepartment(payload) {
    const { name, description, organization_uuid } = payload;
    const department = {
      name,
      description,
      organization_id: this.getLiteralFrom('organization', organization_uuid),
    };
    return this.create(department);
  }

  async getDepartmentById(departmentId) {
    let criteria = { uuid: { [Op.eq]: departmentId } };
    const include = [
      {
        association: this.model.organization,
      },
    ];
    return await this.findOne(criteria, include);
  }

  async updateDepartmentById(departmentId, departmentData) {
    const criteria = { uuid: { [Op.eq]: departmentId } };
    return this.update(criteria, departmentData);
  }
}

module.exports = {
  departmentRepository: new DepartmentRepository({
    sequelize: sequelize,
    model: db.department,
  }),
};
