var express = require('express'),
  router = express.Router(),
  _ = require('underscore'),
  httpErrors = require('httperrors'),
  db = require('../models');

var salas = {
  getInclude: function(query){

    var result = [];

    var includeOptions = {
      'turmas': { model: db.Turma, as: 'turmas' }
    }

    if (query.include) {
      var include = JSON.parse(query.include);

      _.each(include, function(incItem){
        if (includeOptions[incItem.model]) {
          var includeOption = _.extend(
            _.omit(incItem, 'model'),
            includeOptions[incItem.model]
          );

          result.push(includeOption);
        }
      });
    }

    return result;
  },
  create: function(req, res, next){
    var sala = db.Sala.build({
      nome: req.body.nome
    });

    sala.validate().then(function(result){
      if (result && result.errors && result.errors.length > 0)
        return next(httpErrors.BadRequest(result.errors[0].message));

      sala.save().then(function(result){
        res.send(result);
      }).catch(function(err){
        next(err);
      });

    }).catch(function(err){
      next(err);
    });
  },
  read: function(req, res, next){

    var opt = {
      where: {id: req.params.id}
    };

    opt.include = salas.getInclude(req.query);

    db.Sala.findOne(opt).then(function(result){
      if (!result)
        return next(new httpErrors.BadRequest('Sala inexistente!'));

      res.send(result);
    }).catch(function(err){
      next(err);
    });
  },
  list: function(req, res, next){
    var op = 'findAll';

    var limit = req.query.limit && parseInt(req.query.limit) <= 20 ? req.query.limit : 10 ;
    var offset = req.query.offset || 0;

    var opt = {
      limit: limit,
      offset: offset
    };

    if (req.query.where){
      opt.where = JSON.parse(req.query.where);
    }

    opt.include = salas.getInclude(req.query);

    if (req.query.attributes) {
      opt.attributes = req.query.attributes.split(',');
    }

    db.Sala[op](opt).then(function(result){
      res.send(result);
    }).catch(function(err){
      next(err);
    });
  },
  update: function(req, res, next){
    db.Sala.findById(req.params.id).then(function(sala){
      if (!sala)
        return next(httpErrors.BadRequest('Sala inexistente!'));

      sala.set('nome', req.body.nome);

      sala.validate().then(function(result){
        if (result && result.errors && result.errors.length > 0)
          return next(httpErrors.BadRequest(result.errors[0].message));

        sala.save().then(function(){
          res.send(sala);
        }).catch(function(err){
          next(err);
        });

      }).catch(function(err){
        next(err);
      });
    }).catch(function(err){
      next(err);
    });
  }
}

module.exports = salas;
