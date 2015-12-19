var express = require('express'),
  router = express.Router(),
  _ = require('underscore'),
  httpErrors = require('httperrors'),
  db = require('../models');


var cursos = {
  getInclude: function(query){
    var result = [];

    var includeOptions = {
      'tags': { model: db.Tag, as: 'tags' },
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
  read: function(req, res, next){

    var opt = {
      where: {id: req.params.id}
    };

    opt.include = cursos.getInclude(req.query);

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

    opt.include = cursos.getInclude(req.query);

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
