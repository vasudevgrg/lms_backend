const { transactionRepository } = require("../repositories/transaction-repository");

exports.handleTransaction = async (callback) => {
    const transaction = await transactionRepository.startTransaction();
    try {
        await callback(transaction);
        await transactionRepository.commitTransaction(transaction);
    } catch (error) {
        await transactionRepository.rollbackTransaction(transaction);
        throw error;
    }
};