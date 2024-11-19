const { roleRepository } = require('../repositories/role-repository');

exports.validateQueryParameters = async (payload) => {
    let { order, order_column } = payload.query;

    // Validate and adjust order parameter
    if (order && !(order.toLowerCase() === "asc" || order.toLowerCase() === "desc")) payload.query.order = "DESC";
    else payload.query.order = order?.toUpperCase() || "DESC";

    // Validate and adjust order_column parameter against available columns
    const columns = await roleRepository.allColumnsName();
    if ((order_column && !columns[order_column]) || !order_column) {
        payload.query.order_column = "updated_at";
    }

    return payload;
};

exports.getFilteredRoles = async (payload) => {
    payload = await this.validateQueryParameters(payload);
    let { page = 1, limit = 10, order, order_column, } = payload.query;

    return roleRepository.getFilteredRoles({ order_type: order, order_column, page, limit })
};

exports.createRole = async (payload) => {
    return roleRepository.createRole(payload.body);
};

exports.getRoleById = async (payload) => {
    const { role_uuid } = payload.params;
    return roleRepository.getRoleById(role_uuid);
};

exports.updateRoleById = async (payload) => {
    const { role_uuid } = payload.params;
    const { name, description } = payload.body
    const roleData = { name, description };
    const response = await roleRepository.updateRoleById(role_uuid, roleData)

    if (response) {
        return roleRepository.getRoleById(role_uuid)
    }
    return null;
}
