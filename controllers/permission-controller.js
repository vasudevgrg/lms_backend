const { permissionService } = require("../services");
const { HTTP_STATUS_CODE } = require("../lib/constants");

exports.getAllPermissions = async (req, res, next) => {
    try {
        const response = await permissionService.getAllPermissions(req)
        res.status(HTTP_STATUS_CODE.ENUM.OK).json(response);
    } catch (error) {
        next(error)
    }
}
