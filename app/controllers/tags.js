var express = require('express'),
  router = express.Router(),
  _ = require('underscore'),
  httpErrors = require('httperrors'),
  db = require('../models');

var tags = {
  getInclude: function(query){
    var result = [];

    var includeOptions = {
      'cursos': { model: db.Curso, as: 'cursos' }
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
    var tag = db.Tag.build(req.body);

      tag.save().then(function(result){
        res.send(result);
      }).catch(function(err) {
        next(err);
      });
  },
  read: function(req, res, next){

    var opt = {
      where: {id: req.params.id},
      include: []
    };

    opt.include = tags.getInclude(req.query);

    db.Tag.findOne(opt).then(function(result){
      if (!result)
        return next(new httpErrors.BadRequest('Tag inexistente!'));

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

    opt.include = tags.getInclude(req.query);

    if (req.query.attributes) {
      opt.attributes = req.query.attributes.split(',');
    }

    db.Tag[op](opt).then(function(result){
      res.send(result);
    }).catch(function(err){
      next(err);
    });
  },
  update: function(req, res, next){
    db.Tag.findById(req.params.id).then(function(tag){
      if (!tag)
        return next(httpErrors.BadRequest('Tag inexistente!'));

        tag.update(req.body).then(function(){
          res.send(tag);
        }).catch(function(err){
          next(err);
        });

    }).catch(function(err){
      next(err);
    });
  }
}

module.exports = tags;
