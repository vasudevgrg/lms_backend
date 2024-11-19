'use strict';

const fs = require('fs'); // module for reading directory contents
const path = require('path'); //module for handling and transforming file paths
const Sequelize = require('sequelize'); //library for handling database interactions 

const basename = path.basename(__filename); //basename holds the name of the current file
const db = {}; //object that will hold all the models and the Sequelize instance

let { sequelize } = require('../config/db-connection');

fs.readdirSync(__dirname) //Reads all files and directories in the current directory (__dirname)
    .forEach(item => {
        const itemPath = path.join(__dirname, item); //full path to the current item
        if (fs.statSync(itemPath).isDirectory()) { //check current item is directory or not
            // Look for files ending with model.js in the directory
            fs.readdirSync(itemPath).forEach(file => { // iterate all files of the current item(directory)
                if (file.endsWith('model.js')) { //check for each file, if it ends with model.js
                    const modelPath = path.join(itemPath, file); // join the current file(ends with model.js) to path - modelpath
                    const model = require(modelPath)(sequelize, Sequelize.DataTypes); //requires the model file, and initializes it with sequelize and Sequelize.DataTypes
                    db[model.tableName] = model; //Adds the model to the db object using the model's tableName as the key
                }
            });
        } else if (item.endsWith('model.js')) {
            // Directly require and configure the model if it's a file ending with model.js
            const model = require(itemPath)(sequelize, Sequelize.DataTypes);
            db[model.tableName] = model;
        }
    });

Object.keys(db).forEach(modelName => {
    if (db[modelName].associate) { //Checks if the model has an associate method
        db[modelName].associate(db); //associate method - sets the all associations/relationship between the tables
    }
});

db.sequelize = sequelize; //Adds the sequelize instance to the db object

module.exports = db;