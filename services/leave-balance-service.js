const { isAccrualPeriodEnded } = require("../repositories/common/date-validations");
const { leaveTypeRepository } = require("../repositories/leave-type-repository");
const { transactionRepository } = require("../repositories/transaction-repository");

exports.allotLeaveBalance = async (payload) => {
    const { organization_uuid, leave_type_uuid } = payload.query;
    const transaction = await transactionRepository.startTransaction();
    try {
        const leaveTypes = await leaveTypeRepository.getLeaveTypesByCrireria({ organization_uuid, leave_type_uuid }, transaction);

        await Promise.all(leaveTypes.map(async (leaveType) => {
            return Promise.all(leaveType.leave_balances.map(async (leaveBalance) => {
                if (isAccrualPeriodEnded(leaveBalance.user.date_of_joining, leaveType.accural.period, leaveType.accural.applicable_on)) {
                    leaveBalance.increaseBalanceBy(leaveType.getLeaveCount());
                    await leaveBalance.save({ transaction });
                }
            }));
        }));

        await transactionRepository.commitTransaction(transaction);

        return leaveTypes;
    } catch (error) {
        await transactionRepository.rollbackTransaction(transaction);
        throw error;
    }
}