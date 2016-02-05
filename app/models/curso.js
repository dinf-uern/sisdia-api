"use strict";

var  _ = require('underscore'),
    httpErrors = require('httperrors');

module.exports = function(sequelize, DataTypes) {
  var Curso = sequelize.define("Curso", {
    nome: {
      type: DataTypes.STRING,
      allowNull: false,
      validate: {
        notEmpty: {
          msg: 'O nome deve ser informado.'
        }
      }
    },
    cargaHoraria: {
      type: DataTypes.INTEGER,
      allowNull: false,
      validate: {
        notEmpty: {
          msg: 'A carga horária deve ser informada.'
        }
      }
    },
    descricao: {
      type: DataTypes.STRING,
      allowNull: false,
      validate: {
        notEmpty: {
          msg: 'A descrição deve ser informada.'
        }
      }
    },
    imgUrl: {
      type: DataTypes.STRING,
      allowNull: true
    }
  }, {
    hooks: {
      beforeCreate: function(curso, options){
        console.log('before validate');
      }
    },
    tableName: 'cursos',
    classMethods: {
      associate: function(models) {
        Curso.belongsToMany(models.Tag, { as: 'tags', through: 'curso_tags', foreignKey: 'cursoId', targetKey: "id" });
        Curso.hasMany(models.Turma, {as: 'turmas', foreignKey: 'cursoId', targetKey: "id" });
      }
    }
  });

  function checarExistenciaTurmaVinculada(curso, options){
    var self = this;
    return curso.getTurmas().then(function(result){
      if (result.length > 0)
        throw new httpErrors.BadRequest('Há turma vinculada!')
    });
  }

  Curso.addHook('beforeDestroy', 'checarExistenciaTurmaVinculada', checarExistenciaTurmaVinculada);

  return Curso;
};



