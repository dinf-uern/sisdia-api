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
        Turma.belongsTo(models.Sala, {foreignKey: 'salaId', targetKey: 'id'});
        Turma.belongsTo(models.Curso, {foreignKey: 'cursoId', targetKey: 'id'});
      }
    }
  });

  return Turma;
};



