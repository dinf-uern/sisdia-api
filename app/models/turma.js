"use strict";

var _ = require('underscore'),
    moment = require('moment'),
    httpErrors = require('httperrors');

module.exports = function(sequelize, DataTypes) {

  var diaBase = moment([1970]);
  var inicioTarde = diaBase.clone().add(12, 'hour');
  var fimTarde = diaBase.clone().add(18, 'hour');


  function getTurno(hora){
    var result;

    if (moment(hora).isBefore(inicioTarde))
      result = 'manhã';

    if (moment(hora).isSame(inicioTarde) || moment(hora).isSame(fimTarde) || moment(hora).isBetween(inicioTarde, fimTarde))
      result = 'tarde';

    if (moment(hora).isAfter(fimTarde))
      result = 'noite';

    return result;
  }

  function checarConflitoHorario(turma, options){
    var self = this;

    var promise = new Promise(function (resolve, reject) {

      var opt = {
        where: {$and: []}
      };

      var criterioPeriodo = {$or: []};
      var criterioHorario = {$or: []};
      var criterioDias = {$or: []};

      if (turma.id)
        opt.where.$and.push({id: {$ne: turma.id}});

      opt.where.salaId = turma.salaId;

      criterioPeriodo.$or.push({'periodoAulas.inicio': {$and: [{$gte: turma.periodoAulas.inicio}, {$lte: turma.periodoAulas.termino}]}});
      criterioPeriodo.$or.push({'periodoAulas.termino': {$and: [{$gte: turma.periodoAulas.inicio}, {$lte: turma.periodoAulas.termino}]}});

      criterioHorario.$or.push({'horarioAulas.horaInicio': {$and: [{$gte: turma.horarioAulas.horaInicio}, {$lt: turma.horarioAulas.horaTermino}]}});
      criterioHorario.$or.push({'horarioAulas.horaTermino': {$and: [{$gt: turma.horarioAulas.horaInicio}, {$lte: turma.horarioAulas.horaTermino}]}});

      _.each(turma.horarioAulas.dias, function (dia) {
        criterioDias.$or.push({'horarioAulas': {$contains: {dias: [dia]}}});//'.replace('$1', data.horarioAulas.dias)}});
      });

      opt.where.$and.push(criterioPeriodo);
      opt.where.$and.push(criterioHorario);
      opt.where.$and.push(criterioDias);

      return self.findAll(opt)
        .then(function (turmas) {
          if (turmas.length > 0) {
            reject(new httpErrors.BadRequest('Há um conflito de horário!'));
          } else {
            resolve({success: true});
          }
        }).catch(reject);

    });

    return promise;
  }

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
    totalVagas: {
      type: DataTypes.INTEGER,
      allowNull: false,
      validate: {
        notEmpty: {
          msg: 'O total de vagas deve ser informado.'
        }
      }
    },
    cor: {
      type: DataTypes.STRING,
      allowNull: false,
      validate: {
        notEmpty: {
          msg: 'Forneca uma cor para a turma.'
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

          if (value.horaInicio > value.horaTermino)
            throw new Error('O hora de início das aulas deve ser menor que a hora de término!');
        }
      }
    },
    encerrada: {
      allowNull: true,
      type: DataTypes.BOOLEAN

    }
  }, {
    tableName: 'turmas',
    instanceMethods: {
      setNomeFromTemplate: function(templateNome, options) {
        var self = this;

        var novoNome = templateNome
          .replace('{{id}}', self.id)
          .replace('{{turno}}', getTurno(self.horarioAulas.horaTermino));

        return this.update({ nome: novoNome }, options);
      }
    },
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

  Turma.addHook('beforeUpdate', 'checarConflitoHorario', checarConflitoHorario);

  Turma.addHook('beforeCreate', 'checarConflitoHorario', checarConflitoHorario);

  return Turma;
};



