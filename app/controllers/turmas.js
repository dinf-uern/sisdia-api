var express = require('express'),
  router = express.Router(),
  _ = require('underscore'),
  httpErrors = require('httperrors'),
  db = require('../models');

var turmas = {
  getIncludedModels: function(includedItems){
    var relatedModels = {
      "tags": { model: db.Tag, as: 'tags' },
      "curso": { model: db.Curso, as: 'curso' },
      "sala": { model: db.Sala, as: 'sala' }
    };

    function prepareModel(item){
      var model = relatedModels[item.model];
      var cleanItem = _.omit(item, 'model');

      if (model)
        return _.extend(model, cleanItem);
    }

    function prepareIncludes(items){
      return _.map(items, function(item){
        if (item.include)
          item.include = prepareIncludes(item.include);

        return prepareModel(item);
      });
    }

    return prepareIncludes(includedItems);
  },
  count: function(req, res, next){
    var opt = {};

    if (req.query.where) {
      opt.where = JSON.parse(req.query.where);
    }

    opt.include = turmas.getIncludedModels(req.query);

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

    if (req.query.include) {
      var include = JSON.parse(req.query.include);
      opt.include = turmas.getIncludedModels(include);
    }

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

    var opt = {};

    if (req.query.where){
      opt.where = JSON.parse(req.query.where);
    }

    if (req.query.include) {
      var include = JSON.parse(req.query.include);
      opt.include = turmas.getIncludedModels(include);
    }



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
