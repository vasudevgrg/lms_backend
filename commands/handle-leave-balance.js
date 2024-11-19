require("dotenv").config();
const { Command } = require("commander");
const { dbConnection } = require("../config");
const { leaveBalanceService } = require("../services");

const program = new Command();

program
    .name("handle-leave-balances")
    .option('-o, --organization_uuid <organization uuid>', 'Organization UUID')
    .option('-l, --leave_type_uuid <leave type uuid>', 'Leave Type UUID')
    .description("Dispatch messages with an optional limit")
    .action(async (option) => {
        const { organization_uuid, leave_type_uuid } = option;
        try {
            await dbConnection.checkConnection();

            await leaveBalanceService.allotLeaveBalance({ query: { organization_uuid, leave_type_uuid } });
            process.exit(0);
        } catch (error) {
            console.log('error: ', error);
            process.exit(1)
        }
    });

program.parse(process.argv);