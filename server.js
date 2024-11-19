require("dotenv").config();
const { NotFoundError } = require("./middleware/error");
global.argv = process.argv.slice(2);
global.port = global.argv[0] || process.env.APP_PORT;
if (!global.port) {
    console.log("port is not defined. argv = ", global.argv);
    process.exit(128);
}

const express = require("express");
const cors = require("cors");
const app = express();
const RedisStore = require("connect-redis").default;
 
app.use(express.json({ limit: "50mb", extended: true }));
app.use(express.urlencoded({ limit: "50mb", extended: true }));
app.use(cors());

//Redis Connection
const { connectRedisClient } = require("./config/redis");
global.redisClient = connectRedisClient();

require("./config/db-connection").checkConnection();

app.use(require("./middleware/auth-middleware").authenticate);

// Routes declaration
app.use("/", require("./routes"));

app.use((req, res, next) => {
    next(new NotFoundError("Unable to find the requested resource!", "Route not Found."));
});

// Error handling middleware
app.use(require("./middleware/error-middleware").errorMiddleware);

process.on("uncaughtException", function (err) {
    console.error("Uncaught exception:", err);
});

process.on("unhandledRejection", (reason, p) => {
    console.error("Unhandled rejection at:", p, "reason:", reason);
});

const NODE_ENV = process.env.NODE_ENV;

// if (NODE_ENV !== "test")
app.listen(global.port, () => {
    console.log(`${NODE_ENV} Server is listening on port ${global.port}`);
});

module.exports = app;
