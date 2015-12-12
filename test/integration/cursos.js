'use strict';
process.env.NODE_ENV = 'test';

var express = require('express'),
  request = require('supertest'),
  config = require('../../config/config'),
  db = require('../../app/models'),
  app = express();

require('../../config/express')(app, config);

describe('/v1/cursos', function () {
  var curso;

  before(function(done){
    var data = {
      nome: 'qualquer curso',
      descricao: 'some description',
      cargaHoraria: 20
    };

    return db.Curso.sync().then(function(){
      return db.Curso.create(data).then(function(result){
        curso = result;
        done();
      });
    })
  });

  after(function(){
    return db.Curso.destroy({ where:{} });
  });

  describe('get /', function(){
    it('deve retornar os cursos', function (done) {
      request(app)
        .get('/v1/cursos')
        .set('Accept', 'application/json')
        .expect('Content-Type', /json/)
        .expect(200, done)
        .expect(function(res){
          res.body.should.instanceOf(Array);
        })
    });

  })

  describe('post /', function(){
    it('deve criar um curso', function (done) {
      var data = {
        nome: 'some name',
        descricao: 'some descricao',
        cargaHoraria: 20
      };

      request(app)
        .post('/v1/cursos')
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

    it('deve impedir que um curso sem nome seja criado', function (done) {
      var data = {
        nome: ''
      };

      request(app)
        .post('/v1/cursos')
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
    it('deve retornar um curso', function (done) {
      request(app)
        .get('/v1/cursos/' + curso.id)
        .set('Accept', 'application/json')
        .expect('Content-Type', /json/)
        .expect(200, done)
        .expect(function(res){
          res.body.should.instanceOf(Object);
          res.body.should.have.property('id', curso.id);
        })
    });


    it('deve informar quando um curso inválido tentar ser retornado', function (done) {
      request(app)
        .get('/v1/cursos/' + 1000)
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
    it('deve ser capaz de atualizar um curso', function (done) {
      var data = {nome: 'novo nome'};

      request(app)
        .put('/v1/cursos/' + curso.id)
        .send(data)
        .set('Accept', 'application/json')
        .expect('Content-Type', /json/)
        .expect(200, done)
        .expect(function(res){
          res.body.should.instanceOf(Object);
          res.body.should.have.property('id', curso.id);
          res.body.should.have.property('nome', data.nome);
        })
    });

    it('deve informar quando um curso inválido tentar ser atualizado', function (done) {
      var data = {nome: 'novo nome'};

      request(app)
        .put('/v1/cursos/' + 1000)
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
