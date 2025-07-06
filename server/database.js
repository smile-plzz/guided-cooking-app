const { Sequelize, DataTypes } = require('sequelize');
const path = require('path');

const env = process.env.NODE_ENV || 'development';
const config = require(path.join(__dirname, 'config', 'config.json'))[env];

const sequelize = new Sequelize(config);

const Recipe = sequelize.define('Recipe', {
  title: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  image: {
    type: DataTypes.STRING,
  },
  time: {
    type: DataTypes.STRING,
  },
  difficulty: {
    type: DataTypes.STRING,
  },
  starred: {
    type: DataTypes.BOOLEAN,
  },
  ingredients: {
    type: DataTypes.TEXT,
    allowNull: true,
    get: function() {
      return JSON.parse(this.getDataValue('ingredients'));
    },
    set: function(value) {
      this.setDataValue('ingredients', JSON.stringify(value));
    }
  },
  instructions: {
    type: DataTypes.TEXT,
    allowNull: true,
    get: function() {
      return JSON.parse(this.getDataValue('instructions'));
    },
    set: function(value) {
      this.setDataValue('instructions', JSON.stringify(value));
    }
  },
});

module.exports = { sequelize, Recipe };
