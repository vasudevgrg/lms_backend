const { actionRepository } = require('../repositories/action-repository');

exports.getActions = async () => {
  return actionRepository.getActions();
};