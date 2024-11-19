const db = require("../models");
const { sequelize } = require("../config/db-connection");
const { BaseRepository } = require("./base-repository");
const { Op } = require("sequelize");

class OrganizationRoleRepository extends BaseRepository {
  constructor(payload) {
    super(payload);
  }

  _getAsociation(withPermissions = false) {
    const include = [{
      association: db.organization_role.role
    }];

    if (withPermissions) {
      include.push({
        association: db.organization_role.role_permissions,
        include: [
          {
            association: db.role_permission.permission,
          }
        ],
      });
    }
    return include;
  }

  async createOrganizationRole(payload, transaction) {
    const include = this._getAsociation(true);
    return this.create(payload, { include, transaction });
  }

  async bulkCreateOrganizationRoles(payload, transaction) {
    return this.bulkCreate(payload, { transaction });
  }

  async getOrganizationRolesByOrganizationUUID(organizationUUID) {
    let criteria = { organization_id: { [Op.eq]: this.getLiteralFrom("organization", organizationUUID) } };
    const include = this._getAsociation();
    return this.findAll(criteria, include);
  }

  async getOrganizationRoleByIds(organizationUUID, roleUUID) {
    const criteria = { organization_id: { [Op.eq]: this.getLiteralFrom("organization", organizationUUID) }, role_id: { [Op.eq]: this.getLiteralFrom("role", roleUUID) } };
    const include = this._getAsociation(true);
    return this.findOne(criteria, include);
  }

  async getOrganizationRoleByUUID(organizationRoleUUID) {
    const criteria = { uuid: { [Op.eq]: organizationRoleUUID } };
    return this.findOne(criteria);
  }

  async updateOrganizationRoleByIds(organizationUUID, roleUUID, payload) {
    const criteria = { organization_id: { [Op.eq]: this.getLiteralFrom("organization", organizationUUID) }, role_id: { [Op.eq]: this.getLiteralFrom("role", roleUUID) } };
    const include = this._getAsociation(true);
    return this.update(criteria, payload, include);
  }
}

module.exports = {
  organizationRoleRepository: new OrganizationRoleRepository({
    sequelize: sequelize,
    model: db.organization_role,
  }),
};
