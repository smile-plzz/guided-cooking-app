const { Sequelize, DataTypes } = require('sequelize');
const path = require('path');

const env = process.env.NODE_ENV || 'development';
const config = require(path.join(__dirname, 'config', 'config.json'))[env];

const sequelize = new Sequelize(config);

const Recipe = sequelize.define('Recipe', {
  title: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  image: {
    type: DataTypes.STRING,
  },
  readyInMinutes: {
    type: DataTypes.INTEGER,
  },
  difficulty: {
    type: DataTypes.STRING,
  },
  starred: {
    type: DataTypes.BOOLEAN,
  },
  extendedIngredients: {
    type: DataTypes.JSON,
    allowNull: true,
  },
  analyzedInstructions: {
    type: DataTypes.JSON,
    allowNull: true,
  },
});

module.exports = { sequelize, Recipe };
