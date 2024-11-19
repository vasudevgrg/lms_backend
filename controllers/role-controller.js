const { NotFoundError } = require("../middleware/error");
const { roleService } = require("../services");
const { HTTP_STATUS_CODE } = require("../lib/constants");

exports.getFilteredRoles = async (req, res, next) => {
    try {
        const response = await roleService.getFilteredRoles(req);
        if (!response.total) return res.status(HTTP_STATUS_CODE.ENUM.NO_CONTENT).json({ message: "No role found." });
        res.status(HTTP_STATUS_CODE.ENUM.OK).json(response);
    } catch (error) {
        next(error);
    }
}

exports.getRoleById = async (req, res, next) => {
    try {
        const response = await roleService.getRoleById(req);
        if (!response) throw new NotFoundError("Role not found.");
        res.status(HTTP_STATUS_CODE.ENUM.OK).json(response);
    } catch (error) {
        next(error);
    }
}

exports.createRole = async (req, res, next) => {
    try {
        await roleService.createRole(req);
        res.status(HTTP_STATUS_CODE.ENUM.CREATED).json({ message: "Role created successfully." });
    } catch (error) {
        next(error);
    }
}

exports.updateRole = async (req, res, next) => {
    try {
        await roleService.updateRoleById(req);
        res.status(HTTP_STATUS_CODE.ENUM.OK).json({ message: "Role updated successfully." });
    } catch (error) {
        next(error);
    }
}
