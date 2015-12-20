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

describe('/v1/tags', function () {
  var tags;

  before(function(done){

    return db.sequelize.sync().then(function(){
      var operacoes = [];

      for ( var i = 1; i <= 10; i++ ){
        operacoes.push(db.Tag.create({
          nome: 'tag' + i
        }))
      }

      Promise.all(operacoes).then(function(result){

        tags = _.map(result, function(item){
          return item.get();
        });

        done();

      })

    })

  });

  after(function(){
    return db.sequelize.drop();
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
          res.body.should.have.length(10);
        })
    });

    it('deve ser capaz de fazer a busca nas tags', function (done) {
      var i = 9;
      request(app)
        .get('/v1/tags')
        .query({where: JSON.stringify({nome: tags[i].nome})})
        .set('Accept', 'application/json')
        .expect('Content-Type', /json/)
        .expect(200, done)
        .expect(function(res){
          res.body.should.instanceOf(Array);
          res.body.should.have.length(1);
          var source = omitDateFields(tags[i]);
          var target = omitDateFields(res.body[0]);
          source.should.be.eql(target);
        })
    });

    it('deve ser capaz de limitar os resultados', function (done) {
      request(app)
        .get('/v1/tags')
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
        .get('/v1/tags')
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
        .get('/v1/tags/' + tags[0].id)
        .set('Accept', 'application/json')
        .expect('Content-Type', /json/)
        .expect(200, done)
        .expect(function(res){
          res.body.should.instanceOf(Object);
          res.body.should.have.property('id', tags[0].id);
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
        .put('/v1/tags/' + tags[0].id)
        .send(data)
        .set('Accept', 'application/json')
        .expect('Content-Type', /json/)
        .expect(200, done)
        .expect(function(res){
          res.body.should.instanceOf(Object);
          res.body.should.have.property('id', tags[0].id);
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
