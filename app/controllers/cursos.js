var express = require('express'),
  router = express.Router(),
  _ = require('underscore'),
  httpErrors = require('httperrors'),
  db = require('../models');


var cursos = {
  getIncludedModels: function(includedItems){
    var relatedModels = {
      "tags": { model: db.Tag, as: 'tags' },
      "turmas": { model: db.Turma, as: 'turmas' }
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

    if (req.query.include) {
      var include = JSON.parse(req.query.include);
      opt.include = cursos.getIncludedModels(include);
    }

    db.Curso.count(opt).then(function(value){
      res.send({count: value});
    }).catch(next);
  },
  create: function(req, res, next){
    var curso = db.Curso.build(req.body);

    db.sequelize.transaction(function (t) {
      return curso.save({transaction: t}).then(function(curso){

        return db.Tag.bulkFindOrCreate(req.body.tags || [], {transaction: t})
          .then(function(tags){
            return curso.setTags(tags, {transaction: t}).then(function(){
              res.send(curso);
            });
          });

      });

    }).catch(function(err){
      return next(err);
    });


  },
  delete: function(req, res, next){
    var opt = {
      where: {id: req.params.id}
    };

    db.Curso.findOne(opt).then(function(curso){
      if (!curso)
        throw new httpErrors.BadRequest('Curso inexistente!');

      return curso.destroy().then(function(result){
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
      opt.include = cursos.getIncludedModels(include);
    }

    db.Curso.findOne(opt).then(function(result){
      if (!result)
        return next(new httpErrors.BadRequest('Curso inexistente!'));

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

    if (req.query.include) {
      var include = JSON.parse(req.query.include);
      opt.include = cursos.getIncludedModels(include);
    }

    if (req.query.attributes) {
      opt.attributes = req.query.attributes.split(',');
    }

    db.Curso[op](opt).then(function(result){
      res.send(result);
    }).catch(function(err){
      next(err);
    });
  },
  update: function(req, res, next){
    db.sequelize.transaction(function (t) {

      return db.Curso.findById(req.params.id).then(function(curso){
        if (!curso)
          return next(httpErrors.BadRequest('Curso inexistente!'));

        return curso.update(req.body, {transaction: t}).then(function(){
          return db.Tag.bulkFindOrCreate(req.body.tags || [], {transaction: t})
            .then(function(tags){
              return curso.setTags(tags, {transaction: t}).then(function(){
                res.send(curso);
              });
            });
        });

      });

    }).catch(function(err){
      return next(err);
    });
  }
}

module.exports = cursos;
