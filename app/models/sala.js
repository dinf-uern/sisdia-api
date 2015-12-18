"use strict";

var  _ = require('underscore');

module.exports = function(sequelize, DataTypes) {
  var Sala = sequelize.define("Sala", {
    nome: {
      type: DataTypes.STRING,
      allowNull: false,
      validate: {
        notEmpty: {
          msg: 'O nome deve ser informado.'
        }
      }
    },
    localizacao: {
      type: DataTypes.STRING,
      allowNull: true
    },
    imgUrl: {
      type: DataTypes.STRING,
      allowNull: true
    }
  }, {
    tableName: 'salas',
    classMethods: {
      associate: function(models) {
        Sala.hasMany(models.Turma, {as: 'turmas', foreignKey: 'salaId' });
      }
    }
  });

  return Sala;
};



