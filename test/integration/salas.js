'use strict';
process.env.NODE_ENV = 'test';

var express = require('express'),
  request = require('supertest'),
  config = require('../../config/config'),
  _ = require('underscore'),
  db = require('../../app/models'),
  app = express();

require('../../config/express')(app, config);

function omitDateFields(obj){
  return _.omit(obj, 'createdAt', 'updatedAt');
}

describe('/v1/salas', function () {

  describe('get /', function(){
    var salas;

    before(function(){
      return db.sequelize.sync({force: true}).then(function() {
        var operacoes = [];

        for (var i = 1; i <= 10; i++) {
          operacoes.push(db.Sala.create({
            nome: 'sala' + i,
            descricao: 'descricao' + i,
            localizacao: 10 + i
          }))
        }

        return Promise.all(operacoes).then(function (result) {
          salas = _.map(result, function (item) {
            return item.get();
          });
        })
      })

    });

    it('deve retornar as salas', function (done) {
      request(app)
        .get('/v1/salas')
        .set('Accept', 'application/json')
        .expect('Content-Type', /json/)
        .expect(200, done)
        .expect(function(res){
          res.body.should.instanceOf(Array);
          res.body.should.have.length(10);
        })
    });

    it('deve ser capaz de fazer a busca nas salas', function (done) {
      var i = 9;
      request(app)
        .get('/v1/salas')
        .query({where: JSON.stringify({nome: salas[i].nome})})
        .set('Accept', 'application/json')
        .expect('Content-Type', /json/)
        .expect(200, done)
        .expect(function(res){
          res.body.should.instanceOf(Array);
          res.body.should.have.length(1);
          var source = omitDateFields(salas[i]);
          var target = omitDateFields(res.body[0]);
          source.should.be.eql(target);
        })
    });

    it('deve ser capaz de limitar os resultados', function (done) {
      request(app)
        .get('/v1/salas')
        .query({limit: 5})
        .set('Accept', 'application/json')
        .expect('Content-Type', /json/)
        .expect(200, done)
        .expect(function(res){
          res.body.should.instanceOf(Array);
          res.body.should.have.length(5);
        })
    });

    it('deve ser capaz de saltar os resultados', function (done) {
      request(app)
        .get('/v1/salas')
        .query({offset: 5})
        .set('Accept', 'application/json')
        .expect('Content-Type', /json/)
        .expect(200, done)
        .expect(function(res){
          res.body.should.instanceOf(Array);
          res.body.should.have.length(5);
        })
    });

  })


  describe('post /', function(){
    before(function(){
      return db.sequelize.sync({force: true});
    });

    it('deve criar uma sala', function (done) {
      var data = {
        nome: 'some name'
      };

      request(app)
        .post('/v1/salas')
        .send(data)
        .set('Accept', 'application/json')
        .expect('Content-Type', /json/)
        .expect(200, done)
        .expect(function(res){
          res.body.should.instanceOf(Object);
          res.body.should.have.property('id');
          res.body.should.have.property('nome', data.nome);
        })
    });

    it('deve impedir que uma sala sem nome seja criado', function (done) {
      var data = {
        nome: ''
      };

      request(app)
        .post('/v1/salas')
        .send(data)
        .set('Accept', 'application/json')
        .expect('Content-Type', /json/)
        .expect(400, done)
        .expect(function(res){
          res.body.should.instanceOf(Object);
          res.body.should.have.property('message');
        })
    });
  })

  describe('get /:id', function(){
    var sala;

    before(function(){
      return db.sequelize.sync({force: true}).then(function(){
        return db.Sala.create({
          nome: 'sala1'
        }).then(function(result){
          sala = result;
        });
      });
    });

    it('deve retornar uma sala', function (done) {
      request(app)
        .get('/v1/salas/' + sala.id)
        .set('Accept', 'application/json')
        .expect('Content-Type', /json/)
        .expect(200, done)
        .expect(function(res){
          res.body.should.instanceOf(Object);
          res.body.should.have.property('id', sala.id);
        })
    });

    it('deve informar quando uma sala inválida tentar ser retornado', function (done) {
      request(app)
        .get('/v1/salas/' + 1000)
        .set('Accept', 'application/json')
        .expect('Content-Type', /json/)
        .expect(400, done)
        .expect(function(res){
          res.body.should.instanceOf(Object);
          res.body.should.have.property('message');
        })
    });
  })


  describe('put /:id', function(){
    var sala;

    before(function(){
      return db.sequelize.sync({force: true}).then(function(){
        return db.Sala.create({
          nome: 'sala1'
        }).then(function(result){
          sala = result;
        });
      });
    });

    it('deve ser capaz de atualizar uma sala', function (done) {
      var data = {nome: 'novo nome'};

      request(app)
        .put('/v1/salas/' + sala.id)
        .send(data)
        .set('Accept', 'application/json')
        .expect('Content-Type', /json/)
        .expect(200, done)
        .expect(function(res){
          res.body.should.instanceOf(Object);
          res.body.should.have.property('id', sala.id);
          res.body.should.have.property('nome', data.nome);
        })
    });

    it('deve informar quando uma sala inválido tentar ser atualizado', function (done) {
      var data = {nome: 'novo nome'};

      request(app)
        .put('/v1/salas/' + 1000)
        .send(data)
        .set('Accept', 'application/json')
        .expect('Content-Type', /json/)
        .expect(400, done)
        .expect(function(res){
          res.body.should.instanceOf(Object);
          res.body.should.have.property('message');
        })
    });

  });

});
