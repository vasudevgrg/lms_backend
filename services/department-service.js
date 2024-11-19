const { BadRequestError, ForbiddenError, NotFoundError } = require('../middleware/error');
const { isValidUUID } = require('../models/common/validator');
const { departmentRepository } = require('../repositories/department-repository');

exports.validateQueryParameters = async (payload) => {
    let { order, order_column, organization_uuid } = payload.query;

    // Validate and adjust order parameter
    if (order && !(order.toLowerCase() === "asc" || order.toLowerCase() === "desc")) payload.query.order = "DESC";
    else payload.query.order = order?.toUpperCase() || "DESC";

    // Validate and adjust order_column parameter against available columns
    const columns = await departmentRepository.allColumnsName();
    if ((order_column && !columns[order_column]) || !order_column) {
        payload.query.order_column = "updated_at";
    }

    if (!organization_uuid) throw new BadRequestError("Organization uuid is required.", "Organization uuid is required in query.");
    else if (!isValidUUID(organization_uuid)) throw new BadRequestError("Invalid organization uuid.", "Invalid organization uuid.");

    return payload;
};

exports.getFilteredDepartments = async (payload) => {
    payload = await this.validateQueryParameters(payload);
    let { organization_uuid, page = 1, limit = 10, order, order_column, } = payload.query;

    return departmentRepository.getFilteredDepartments({ organization_uuid }, { order_type: order, order_column, page, limit })
};

exports.createDepartment = async (payload) => {
    return departmentRepository.createDepartment(payload.body);
};

exports.getDepartmentById = async (payload) => {
    const { department_uuid } = payload.params;
    return departmentRepository.getDepartmentById(department_uuid);
};

exports.updateDepartmentById = async (payload) => {
    const { department_uuid } = payload.params;

    const department = await departmentRepository.getDepartmentById(department_uuid);
    if(!department.isActive()) throw new ForbiddenError("Department is currently not active.")
    const { name, description } = payload.body
    const departmentData = { name, description };
    const [affectedRows, [response]] = await departmentRepository.updateDepartmentById(department_uuid, departmentData)
    if (!affectedRows) return null;
    return response;
}

exports.activateDepartment = async (payload) => {
    const { department_uuid } = payload.params

    const department = await departmentRepository.getDepartmentById(department_uuid)
    if (!department) throw new NotFoundError("department not found")

    department.activate();

    return department.save();
}

exports.deactivateDepartment = async (payload) => {
    const { department_uuid } = payload.params

    const department = await departmentRepository.getDepartmentById(department_uuid)
    if (!department) throw new NotFoundError("department not found")

    department.deactivate();

    return department.save();
}

// exports.archiveDepartment = async (payload) => {
//     const { department_uuid } = payload.params;
//     const [response] = await departmentRepository.archiveDepartment(department_uuid, transaction);
//     return response;
// };

// exports.restoreDepartment = async (payload) => {
//     const { department_uuid } = payload.params;
//     const [response] = await departmentRepository.restoreDepartment(department_uuid, transaction);
//     return response;
// };