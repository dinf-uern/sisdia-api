'use strict';
process.env.NODE_ENV = 'test';

var express = require('express'),
  request = require('supertest'),
  config = require('../../config/config'),
  db = require('../../app/models'),
  app = express();

require('../../config/express')(app, config);

describe('/v1/turmas', function () {
  var turma;

  before(function(done){
    var data = {
      nome: 'qualquer turma'
    };

    return db.Turma.sync().then(function(){
      return db.Turma.create(data).then(function(result){
        turma = result;
        done();
      });
    })
  });

  after(function(){
    return db.Turma.destroy({ where:{} });
  });

  describe('get /', function(){
    it('deve retornar as turmas', function (done) {
      request(app)
        .get('/v1/turmas')
        .set('Accept', 'application/json')
        .expect('Content-Type', /json/)
        .expect(200, done)
        .expect(function(res){
          res.body.should.instanceOf(Array);
        })
    });

  })

  describe('post /', function(){
    it('deve criar uma turma', function (done) {
      var data = {
        nome: 'some name'
      };

      request(app)
        .post('/v1/turmas')
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

    it('deve impedir que uma turma sem nome seja criado', function (done) {
      var data = {
        nome: ''
      };

      request(app)
        .post('/v1/turmas')
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
    it('deve retornar uma turma', function (done) {
      request(app)
        .get('/v1/turmas/' + turma.id)
        .set('Accept', 'application/json')
        .expect('Content-Type', /json/)
        .expect(200, done)
        .expect(function(res){
          res.body.should.instanceOf(Object);
          res.body.should.have.property('id', turma.id);
        })
    });


    it('deve informar quando uma turma inválido tentar ser retornado', function (done) {
      request(app)
        .get('/v1/turmas/' + 1000)
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
    it('deve ser capaz de atualizar uma turma', function (done) {
      var data = {nome: 'novo nome'};

      request(app)
        .put('/v1/turmas/' + turma.id)
        .send(data)
        .set('Accept', 'application/json')
        .expect('Content-Type', /json/)
        .expect(200, done)
        .expect(function(res){
          res.body.should.instanceOf(Object);
          res.body.should.have.property('id', turma.id);
          res.body.should.have.property('nome', data.nome);
        })
    });

    it('deve informar quando uma turma inválido tentar ser atualizado', function (done) {
      var data = {nome: 'novo nome'};

      request(app)
        .put('/v1/turmas/' + 1000)
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
