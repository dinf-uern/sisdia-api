'use strict';
process.env.NODE_ENV = 'test';

var express = require('express'),
  request = require('supertest'),
  config = require('../../config/config'),
  db = require('../../app/models'),
  app = express();

require('../../config/express')(app, config);

describe('/v1/salas', function () {
  var sala;

  before(function(done){
    var data = {
      nome: 'qualquer sala'
    };

    return db.Sala.sync().then(function(){
      return db.Sala.create(data).then(function(result){
        sala = result;
        done();
      });
    })
  });

  after(function(){
    return db.Sala.destroy({ where:{} });
  });

  describe('get /', function(){
    it('deve retornar as salas', function (done) {
      request(app)
        .get('/v1/salas')
        .set('Accept', 'application/json')
        .expect('Content-Type', /json/)
        .expect(200, done)
        .expect(function(res){
          res.body.should.instanceOf(Array);
        })
    });

  })

  describe('post /', function(){
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
