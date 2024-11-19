const { permissionRepository } = require('../repositories/permission-repository');

exports.getAllPermissions = async () => {
    return permissionRepository.getAllPermissions()
};
