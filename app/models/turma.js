"use strict";

var  _ = require('underscore');

module.exports = function(sequelize, DataTypes) {
  var Turma = sequelize.define("Turma", {
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
    tableName: 'turmas',
    classMethods: {
      associate: function(models) {

      }
    }
  });

  return Turma;
};



