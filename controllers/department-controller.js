const { NotFoundError } = require("../middleware/error");
const { departmentService } = require("../services");
const { HTTP_STATUS_CODE } = require("../lib/constants");

exports.getFilteredDepartments = async (req, res, next) => {
  try {
    const response = await departmentService.getFilteredDepartments(req);
    if (!response.total) 
      return res.status(HTTP_STATUS_CODE.ENUM.NO_CONTENT).json({ message: "No department found." });
    res.status(HTTP_STATUS_CODE.ENUM.OK).json(response);
  } catch (error) {
    next(error);
  }
};

exports.createDepartment = async (req, res, next) => {
  try {
    await departmentService.createDepartment(req);
    res.status(HTTP_STATUS_CODE.ENUM.CREATED).json({ message: "Department created successfully." });
  } catch (error) {
    next(error);
  }
};

exports.getDepartmentById = async (req, res, next) => {
  try {
    const response = await departmentService.getDepartmentById(req);
    if (!response) throw new NotFoundError("Department not found.");
    res.status(HTTP_STATUS_CODE.ENUM.OK).json(response);
  } catch (error) {
    next(error);
  }
};

exports.updateDepartment = async (req, res, next) => {
  try {
    await departmentService.updateDepartmentById(req);
    res.status(HTTP_STATUS_CODE.ENUM.OK).json({ message: "Department updated successfully." });
  } catch (error) {
    next(error);
  }
};

exports.activateDepartment = async (req, res, next) => {
  try {
      await departmentService.activateDepartment(req);
      res.status(HTTP_STATUS_CODE.ENUM.OK).json({ message: "Department  activated successfully." });
  } catch (err) {
      next(err);
  }
}

exports.deactivateDepartment = async (req, res, next) => {
  try {
      await departmentService.deactivateDepartment(req);
      res.status(HTTP_STATUS_CODE.ENUM.OK).json({ message: "Department deactivated successfully." });
  } catch (err) {
      next(err);
  }
}
