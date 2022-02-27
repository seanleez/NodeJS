const Sequelize = require('sequelize');

const sequelize = new Sequelize('node-complete', 'root', 'thaonhinheo0706', {
    dialect: 'mysql',
    host: 'localhost',
});

module.exports = sequelize;
