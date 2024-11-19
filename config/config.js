require("dotenv").config();

module.exports = {
    "local": {
        "username": process.env.DB_USER,
        "password": process.env.DB_PASSWORD,
        "database": process.env.DB_DATABASE,
        "host": process.env.DB_HOST,
        "dialect": "postgres",
        "logging": console.log,
        "seederStorage": 'sequelize',
        "define": {
            "underscored": true,
        },
    },
    "test": {
        "username": process.env.DB_USER,
        "password": process.env.DB_PASSWORD,
        "database": "db-test",
        "host": process.env.DB_HOST,
        "dialect": "postgres",
        "logging": false,
        "seederStorage": 'sequelize',
        "define": {
            "underscored": true,
        },
    },
    "development": {
        "username": process.env.DB_USER,
        "password": process.env.DB_PASSWORD,
        "database": process.env.DB_DATABASE,
        "host": process.env.DB_HOST,
        "dialect": "postgres",
        "logging": false,
        "seederStorage": 'sequelize',
        "define": {
            "underscored": true,
        },
    },
    "production": {
        "username": process.env.DB_USER,
        "password": process.env.DB_PASSWORD,
        "database": process.env.DB_DATABASE,
        "host": process.env.DB_HOST,
        "dialect": "postgres",
        "logging": true,
        "seederStorage": 'sequelize',
        "define": {
            "underscored": true,
        },
    }
};
