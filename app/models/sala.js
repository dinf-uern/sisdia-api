"use strict";

var  _ = require('underscore'),
    httpErrors = require('httperrors');

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
        Sala.hasMany(models.Turma, {as: 'turmas', foreignKey: 'salaId', targetKey: "id" });
      }
    }
  });

  function checarExistenciaTurmaVinculada(sala, options){
    var self = this;
    return sala.getTurmas().then(function(result){
      if (result.length > 0)
        throw new httpErrors.BadRequest('Há turma vinculada!')
    });
  }

  Sala.addHook('beforeDestroy', 'checarExistenciaTurmaVinculada', checarExistenciaTurmaVinculada);

  return Sala;
};



