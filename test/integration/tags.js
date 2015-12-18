'use strict';
process.env.NODE_ENV = 'test';

var express = require('express'),
  request = require('supertest'),
  config = require('../../config/config'),
  db = require('../../app/models'),
  app = express();

require('../../config/express')(app, config);

describe('/v1/tags', function () {
  var tag;

  before(function(done){
    var data = {
      nome: 'qualquer tag'
    };

    return db.Tag.sync().then(function(){
      return db.Tag.create(data).then(function(result){
        tag = result;
        done();
      });
    })
  });

  after(function(){
    return db.Tag.destroy({ where:{} });
  });

  describe('get /', function(){
    it('deve retornar as tags', function (done) {
      request(app)
        .get('/v1/tags')
        .set('Accept', 'application/json')
        .expect('Content-Type', /json/)
        .expect(200, done)
        .expect(function(res){
          res.body.should.instanceOf(Array);
        })
    });

  })

  describe('post /', function(){
    it('deve criar uma tag', function (done) {
      var data = {
        nome: 'some name'
      };

      request(app)
        .post('/v1/tags')
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

    it('deve impedir que um tag sem nome seja criado', function (done) {
      var data = {
        nome: ''
      };

      request(app)
        .post('/v1/tags')
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
    it('deve retornar um tag', function (done) {
      request(app)
        .get('/v1/tags/' + tag.id)
        .set('Accept', 'application/json')
        .expect('Content-Type', /json/)
        .expect(200, done)
        .expect(function(res){
          res.body.should.instanceOf(Object);
          res.body.should.have.property('id', tag.id);
        })
    });


    it('deve informar quando um tag inválido tentar ser retornado', function (done) {
      request(app)
        .get('/v1/tags/' + 1000)
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
    it('deve ser capaz de atualizar uma tag', function (done) {
      var data = {nome: 'novo nome'};

      request(app)
        .put('/v1/tags/' + tag.id)
        .send(data)
        .set('Accept', 'application/json')
        .expect('Content-Type', /json/)
        .expect(200, done)
        .expect(function(res){
          res.body.should.instanceOf(Object);
          res.body.should.have.property('id', tag.id);
          res.body.should.have.property('nome', data.nome);
        })
    });

    it('deve informar quando uma tag inválido tentar ser atualizado', function (done) {
      var data = {nome: 'novo nome'};

      request(app)
        .put('/v1/tags/' + 1000)
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
