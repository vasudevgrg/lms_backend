const db = require("../models");
const { sequelize } = require("../config/db-connection");
const { BaseRepository } = require("./base-repository");
const { Op, where } = require("sequelize");
const { Paginator } = require("./common/pagination");

class RoleRepository extends BaseRepository {
  constructor(payload) {
    super(payload);
  }

  async getFilteredRoles({ order_type, order_column, page: pageOption, limit: limitOption }) {
    let criteria = {};
    const { offset, limit, page } = new Paginator(pageOption, limitOption);
    const order = [[order_column, order_type]];
    const response = await this.findAndCountAll(criteria, [], offset, limit, order);
    response.current_page = page + 1;
    response.per_page = limit;
    response.total = await this.count();
    return response;
  }

  async createRole(payload) {
    const { name, description } = payload;
    const rolePayload = {
      name,
      description,
    };
    return this.create(rolePayload);
  }

  async getRoleById(roleUUID) {
    let criteria = { uuid: { [Op.eq]: roleUUID } };
    const attributes = { exclude: ["id"] };
    const include = [
      {
        association: this.model.organization_roles,
        include: [
          {
            association: db.organization_role.role_permissions,
            include: [
              {
                association: db.role_permission.permission,
              }
            ],
          },
          {
            association: db.organization_role.organization
          }
        ]
      }
    ];
    const options = {};
    return await this.findOne(criteria, include, true, attributes, null, options);
  }

  async getRoleByCriteria({ organization_role_id }, transaction) {
    const criteria = {};
    const include = [];
    if (organization_role_id) {
      include.push({
        association: db.role.organization_roles,
        where: { id: organization_role_id }
      });
    }
    return this.findOne(criteria, include, undefined, undefined, transaction);
  }

  async updateRoleById(roleUUID, payload) {
    const criteria = { uuid: { [Op.eq]: roleUUID } };
    return await this.update(criteria, payload);
  }
}

module.exports = {
  roleRepository: new RoleRepository({
    sequelize: sequelize,
    model: db.role,
  }),
};
