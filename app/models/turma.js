"use strict";

var _ = require('underscore'),
    moment = require('moment');

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
    },
    periodoInscricoes: {
      allowNull: false,
      type: DataTypes.JSONB,
      validate: {
        terminoMaiorOuIgualAInicio: function(value){
          if (!value.inicio || !moment(value.inicio).isValid())
            throw new Error('Informe uma data válida para o início das inscrições!');

          if (!value.termino || !moment(value.termino).isValid())
            throw new Error('Informe uma data válida para o término das inscrições!');

          if (moment(value.inicio) > moment(value.termino))
            throw new Error('A data de início das inscrições não pode ser maior que a de término!');
        }
      }
    },
    periodoAulas: {
      allowNull: false,
      type: DataTypes.JSONB,
      validate: {
        terminoMaiorOuIgualAInicio: function(value){
          if (!value.inicio || !moment(value.inicio).isValid())
            throw new Error('Informe uma data válida para o início das aulas!');

          if (!value.termino || !moment(value.termino).isValid())
            throw new Error('Informe uma data válida para o término das aulas!');

          if (moment(value.inicio) > moment(value.termino))
            throw new Error('A data de início das aulas não pode ser maior que a de término!');
        }
      }
    },
    horarioAulas: {
      allowNull: false,
      type: DataTypes.JSONB,
      validate: {
        dias: function(value){
          if (!value.dias || !(value.dias.constructor === Array) || value.dias.length <= 0)
            throw new Error('Informe os dias de aula!');
        },
        horario: function(value){
          if (!value.horaInicio || !moment(value.horaInicio).isValid())
            throw new Error('Informe uma hora de início válilda para as aulas!');

          if (!value.horaTermino || !moment(value.horaTermino).isValid())
            throw new Error('Informe uma hora de término válilda para as aulas!');
        }
      }
    }
  }, {
    tableName: 'turmas',
    classMethods: {
      associate: function(models) {
        Turma.belongsTo(models.Sala, {as:'sala', foreignKey: 'salaId', targetKey: 'id'});
        Turma.belongsTo(models.Curso, {as:'curso', foreignKey: 'cursoId', targetKey: 'id'});
      }
    },
    validate: {
      dataInscricoesVsAulas: function(){
        var self = this;

        if (moment(self.periodoInscricoes.termino) > moment(self.periodoAulas.inicio))
          throw new Error('A data de término das inscrições não pode ser maior do que a data de início das aulas!');
      }
    }
  });

  return Turma;
};



