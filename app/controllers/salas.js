var express = require('express'),
  router = express.Router(),
  httpErrors = require('httperrors'),
  db = require('../models');

var salas = {
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
    //var incCidades = { model: db.Cidade, as: 'cidades' };

    var opt = {
      where: {id: req.params.id},
      include: []
    };

    if (req.query.include) {
      var include = req.query.include.split(',');

      //if(include.indexOf('cidades') >= 0)
        //opt.include.push(incCidades);
    }

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

    //var incCidades = { model: db.Cidade, as: 'cidades' };

    var limit = req.query.limit && parseInt(req.query.limit) <= 20 ? req.query.limit : 10 ;
    var offset = req.query.offset || 0;

    var opt = {
      where: [],
      limit: limit,
      offset: offset,
      include: []
    };

    if (req.query.q)
      opt.where.push( { nome: { $iLike : "%" + req.query.q + "%" } } );

    if (req.query.include) {
      var include = req.query.include.split(',');

      if (include.indexOf('count') >= 0)
        op = 'findAndCountAll';

      //if(include.indexOf('cidades') >= 0)
      //  opt.include.push(incCidades);
    }

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
