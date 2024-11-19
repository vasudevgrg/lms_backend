const { MethodNotAllowedError } = require("../middleware/error");

const router = require("express").Router();

router.use((req, res, next) => {
    const hasHandler = router.stack.find(layer => layer.route && layer.route.path === req.path);
    if (hasHandler && !hasHandler.route.methods[req.method.toLowerCase()]) {
        next(new MethodNotAllowedError({ method: req.method, path: req.path }));
    } else {
        next();
    }
})

// User route
router.use("/users", require("./user-route"));
router.use("/users", require("./user-attendance-route"));
router.use("/users", require("./user-leave-route"));

// Leave Routes
router.use("/leave-requests", require("./leave-request-route"))
// router.use("/leave-balances", require("./leave-balance-route"))

//organization routes
router.use("/organizations", require("./organization-route"))
router.use("/organizations", require("./organization-role-route"))
router.use("/organizations", require("./organization-holidays-route"))
router.use("/organizations", require("./organization-leave-route"))
router.use("/organizations", require("./organization-user-route"))
// Holiday Routes
router.use("/holidays", require("./holiday-route"))

// Role Routes
router.use("/roles", require("./role-route"))

// Department Routes
router.use("/departments", require("./department-route"))

// Action Routes
router.use("/actions", require("./actions-route"))

// Permission Routes
router.use("/permissions", require("./permissions-route"))

// Attendance Routes
router.use("/attendances", require("./attendance-route"))

module.exports = router;