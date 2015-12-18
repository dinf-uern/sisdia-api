"use strict";

var  _ = require('underscore');

module.exports = function(sequelize, DataTypes) {
  var Tag = sequelize.define("Tag", {
    nome: {
      type: DataTypes.STRING,
      allowNull: false,
      validate: {
        notEmpty: {
          msg: 'O nome deve ser informado.'
        }
      }
    }
  }, {
    tableName: 'tags',
    classMethods: {
      associate: function(models) {

      }
    }
  });

  return Tag;
};



