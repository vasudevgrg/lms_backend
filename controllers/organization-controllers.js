const { NotFoundError } = require("../middleware/error");
const { organizationService, userService, leaveTypeService } = require("../services");
const { HTTP_STATUS_CODE } = require("../lib/constants");

exports.getFilteredOrganization = async (req, res, next) => {
  try {
    const response = await organizationService.getFilteredOrganizations(req);
    if (!response.total)
      return res
        .status(HTTP_STATUS_CODE.ENUM.NO_CONTENT)
        .json({ message: "No organization found." });
    res.status(HTTP_STATUS_CODE.ENUM.OK).json(response);
  } catch (err) {
    next(err);
  }
};

exports.createOrganization = async (req, res, next) => {
  try {
    await organizationService.createOrganization(req);
    res.status(HTTP_STATUS_CODE.ENUM.CREATED).json({ message: "Organization created successfully." });
  } catch (err) {
    next(err);
  }
};

exports.getOrganizationById = async (req, res, next) => {
  try {
    const response = await organizationService.getOrganizationById(req);
    if (!response)
      throw new NotFoundError("Organization not found.");
    res.status(HTTP_STATUS_CODE.ENUM.OK).json(response);
  } catch (err) {
    next(err);
  }
};

exports.updateOrganization = async (req, res, next) => {
  try {
    await organizationService.updateOrganizationById(req);
    res.status(HTTP_STATUS_CODE.ENUM.OK).json({ message: "Organization updated successfully." });
  } catch (err) {
    next(err);
  }
};

exports.getOrganizationRoles = async (req, res, next) => {
  try {
    const response = await organizationService.getOrganizationRoles(req);
    if (!response)
      throw new NotFoundError("Organization role not found.");
    res.status(HTTP_STATUS_CODE.ENUM.OK).json(response);
  } catch (error) {
    next(error);
  }
}

exports.addOrganizationRole = async (req, res, next) => {
  try {
    await organizationService.addOrganizationRole(req);
    res.status(HTTP_STATUS_CODE.ENUM.CREATED).json({ message: "Role added successfully." });
  } catch (error) {
    next(error);
  }
}

exports.getOrganizationRoleByIds = async (req, res, next) => {
  try {
    const response = await organizationService.getOrganizationRoleByIds(req);
    if (!response)
      throw new NotFoundError("Organization role not found.");
    res.status(HTTP_STATUS_CODE.ENUM.OK).json(response);
  } catch (error) {
    next(error);
  }
}

exports.bulkAddOrganizationRoles = async (req, res, next) => {
  try {
    await organizationService.bulkAddOrganizationRoles(req);
    res.status(HTTP_STATUS_CODE.ENUM.CREATED).json({ message: " Roles added successfully." });
  } catch (error) {
    next(error);
  }
}

exports.updateOrganizationRoleByIds = async (req, res, next) => {
  try {
    await organizationService.updateOrganizationRoleByIds(req);
    res.status(HTTP_STATUS_CODE.ENUM.OK).json({ message: "Role updated successfully." });
  } catch (error) {
    next(error);
  }
}

exports.updateOrganizationRolePermissions = async (req, res, next) => {
  try {
    await organizationService.updateOrganizationRolePermissions(req);
    res.status(HTTP_STATUS_CODE.ENUM.OK).json({ message: "Role permissions updated successfully." });
  } catch (error) {
    next(error);
  }
}

exports.getOrganizationUsers = async (req, res, next) => {
  try {
    req.query.organization_uuid = req.params.organization_uuid;
    const response = await userService.getFilteredUsers(req);
    res.status(HTTP_STATUS_CODE.ENUM.OK).json(response);
  } catch (error) {
    next(error);
  }
}

exports.addOrganizationUser = async (req, res, next) => {
  try {
    req.body.organization_uuid = req.params.organization_uuid;
    await userService.createUser(req);
    res.status(HTTP_STATUS_CODE.ENUM.CREATED).json({ message: "User added successfully." });
  } catch (error) {
    next(error);
  }
}

exports.getOrganizationUserById = async (req, res, next) => {
  try {
    const response = await userService.getUserById(req);
    if (!response) throw new NotFoundError("User not found.");
    res.status(HTTP_STATUS_CODE.ENUM.OK).json(response);
  } catch (error) {
    next(error);
  }
}

exports.updateOrganizationUserById = async (req, res, next) => {
  try {
    await userService.updateUserById(req);
    res.status(HTTP_STATUS_CODE.ENUM.OK).json({ message: "Organization user updated successfully." });
  } catch (error) {
    next(error);
  }
}

exports.addOrganizationLeaveType = async (req, res, next) => {
  try {
      await leaveTypeService.createLeaveType(req);
      res.status(HTTP_STATUS_CODE.ENUM.CREATED).json({ message: "Organization leave type added successfully." });
  } catch (err) {
      next(err);
  }
}

exports.getOrganizationLeaveTypes = async (req, res, next) => {
  try {
      const response = await leaveTypeService.getFilteredLeaveTypes(req);
      if (!response.total) return res.status(HTTP_STATUS_CODE.ENUM.NO_CONTENT).json({ message: "No leave type found." });
      res.status(HTTP_STATUS_CODE.ENUM.OK).json(response);
  } catch (err) {
      next(err);
  }
}

exports.getOrganizationLeaveTypeById = async (req, res, next) => {
  try {
      const response = await leaveTypeService.getLeaveTypeById(req);
      if (!response) throw new NotFoundError("Leave Type not found.");
      res.status(HTTP_STATUS_CODE.ENUM.OK).json(response);
  } catch (err) {
      next(err);
  }
}

exports.updateOrganizationLeaveTypeById = async (req, res, next) => {
  try {
      await leaveTypeService.updateLeaveTypeById(req);
      res.status(HTTP_STATUS_CODE.ENUM.OK).json({ message: "Organization leave type updated successfully." });
  } catch (err) {
      next(err);
  }
}


exports.getOrganizationLeaveReport = async (req, res, next) => {
  try {
      const response = await organizationService.getOrganizationLeaveReport(req);
      res.status(HTTP_STATUS_CODE.ENUM.OK).json(response);
  } catch (err) {
      next(err);
  }
}

exports.activateOrganization = async (req, res, next) => {
  try {
      await organizationService.activateOrganization(req);
      res.status(HTTP_STATUS_CODE.ENUM.OK).json({ message: "Organization activated successfully." });
  } catch (err) {
      next(err);
  }
}

exports.deactivateOrganization= async (req, res, next) => {
  try {
      await organizationService.deactivateOrganization(req);
      res.status(HTTP_STATUS_CODE.ENUM.OK).json({ message: "Organization deactivated successfully." });
  } catch (err) {
      next(err);
  }
}

exports.activateOrganizationRole = async (req, res, next) => {
  try {
      await organizationService.activateOrganizationRole(req);
      res.status(HTTP_STATUS_CODE.ENUM.OK).json({ message: "Organization Role activated successfully." });
  } catch (err) {
      next(err);
  }
}

exports.deactivateOrganizationRole= async (req, res, next) => {
  try {
      await organizationService.deactivateOrganizationRole(req);
      res.status(HTTP_STATUS_CODE.ENUM.OK).json({ message: "Organization Role deactivated successfully." });
  } catch (err) {
      next(err);
  }
}

exports.getFilteredOrganizationHoliday = async (req, res, next) => {
  try {
      const response = await organizationService.getFilteredOrganizationHoliday(req);
      res.status(HTTP_STATUS_CODE.ENUM.OK).json(response);
  } catch (err) {
      next(err);
  }
}

exports.createOrganizationHoliday = async (req, res, next) => {
  try {
      await organizationService.createOrganizationHoliday(req);
      res.status(HTTP_STATUS_CODE.ENUM.CREATED).json({ message: "Organization holiday created successfully." });
  } catch (err) {
      next(err);
  }
}

exports.bulkCreateOrganizationHolidays = async (req, res, next) => {
  try {
      await organizationService.bulkCreateOrganizationHolidays(req);
      res.status(HTTP_STATUS_CODE.ENUM.CREATED).json({ message: "Organization holidays created successfully in bulk." });
  } catch (err) {
      next(err);
  }
}


exports.activateOrganizationHoliday = async (req, res, next) => {
  try {
      await organizationService.activateOrganizationHoliday(req);
      res.status(HTTP_STATUS_CODE.ENUM.OK).json({ message: "Organization Holiday activated successfully." });
  } catch (err) {
      next(err);
  }
}

exports.deactivateOrganizationHoliday= async (req, res, next) => {
  try {
      await organizationService.deactivateOrganizationHoliday(req);
      res.status(HTTP_STATUS_CODE.ENUM.OK).json({ message: "Organization Holiday deactivated successfully." });
  } catch (err) {
      next(err);
  }
}
