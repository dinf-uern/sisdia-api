var express = require('express'),
  router = express.Router(),
  _ = require('underscore'),
  httpErrors = require('httperrors'),
  db = require('../models');

var turmas = {
  getInclude: function(query){
    var result = [];

    var includeOptions = {
      'curso': { model: db.Curso, as: 'curso', include: [
        { model: db.Tag, as: 'tags' }
      ] },
      'sala': { model: db.Sala, as: 'sala' }
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
  count: function(req, res, next){
    var opt = {};

    if (req.query.where) {
      opt.where = JSON.parse(req.query.where);
    }

    opt.include = turmas.getInclude(req.query);

    db.Turma.count(opt).then(function(value){
      res.send({count: value});
    }).catch(next);
  },
  create: function(req, res, next){
    var turma = db.Turma.build(req.body);

    db.sequelize.transaction(function (t) {
      var opt = {transaction: t};

      return turma.save(opt).then(function(result){
        return result.setNomeFromTemplate(result.nome, opt).then(function(data){
          res.send(result);
        });
      });

    }).catch(next);

  },
  delete: function(req, res, next){
    var opt = {
      where: {id: req.params.id}
    };

    db.Turma.findOne(opt).then(function(turma){
      if (!turma)
        throw new httpErrors.BadRequest('Turma inexistente!');

      return turma.destroy().then(function(result){
        res.send({success: true});
      });

    }).catch(function(err){
      next(err);
    });
  },
  read: function(req, res, next){

    var opt = {
      where: {id: req.params.id}
    };

    opt.include = turmas.getInclude(req.query);

    db.Turma.findOne(opt).then(function(result){
      if (!result)
        return next(new httpErrors.BadRequest('Turma inexistente!'));

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

    opt.include = turmas.getInclude(req.query);

    if (req.query.attributes) {
      opt.attributes = req.query.attributes.split(',');
    }

    db.Turma[op](opt).then(function(result){
      res.send(result);
    }).catch(function(err){
      next(err);
    });
  },
  update: function(req, res, next){
    db.Turma.findById(req.params.id).then(function(turma){
      if (!turma)
        return next(httpErrors.BadRequest('Turma inexistente!'));

        var data = _.omit(req.body, 'nome');

        return turma.update(data).then(function(){
          res.send(turma);
        })

    }).catch(next);
  }
}

module.exports = turmas;
