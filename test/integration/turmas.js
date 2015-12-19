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

describe('/v1/turmas', function () {
  var turmas;

  before(function(done){

    return db.sequelize.sync().then(function(){
      var operacoes = [];

      for ( var i = 1; i <= 10; i++ ){
        operacoes.push(db.Turma.create({
          nome: 'turma' + i
        }))
      }

      Promise.all(operacoes).then(function(result){

        turmas = _.map(result, function(item){
          return item.get();
        });

        done();

      })

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
          res.body.should.have.length(10);
        })
    });

    it('deve ser capaz de fazer a busca nas turmas', function (done) {
      request(app)
        .get('/v1/turmas')
        .query({q: turmas[9].nome})
        .set('Accept', 'application/json')
        .expect('Content-Type', /json/)
        .expect(200, done)
        .expect(function(res){
          res.body.should.instanceOf(Array);
          res.body.should.have.length(1);
          var source = omitDateFields(res.body[0]);
          var target = omitDateFields(res.body[0]);
          source.should.be.eql(target);
        })
    });

    it('deve ser capaz de limitar os resultados', function (done) {
      request(app)
        .get('/v1/turmas')
        .query({limit: 5})
        .set('Accept', 'application/json')
        .expect('Content-Type', /json/)
        .expect(200, done)
        .expect(function(res){
          res.body.should.instanceOf(Array);
          res.body.should.have.length(5);
          var source = _.map(turmas.slice(0,5), omitDateFields);
          var target = _.map(res.body, omitDateFields);
          target.should.containDeep(source);
        })
    });

    it('deve ser capaz de saltar os resultados', function (done) {
      request(app)
        .get('/v1/turmas')
        .query({offset: 5})
        .set('Accept', 'application/json')
        .expect('Content-Type', /json/)
        .expect(200, done)
        .expect(function(res){
          res.body.should.instanceOf(Array);
          res.body.should.have.length(5);
          var source = _.map(turmas.slice(5,10), omitDateFields);
          var target = _.map(res.body, omitDateFields);
          target.should.containDeep(source);
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
        .get('/v1/turmas/' + turmas[0].id)
        .set('Accept', 'application/json')
        .expect('Content-Type', /json/)
        .expect(200, done)
        .expect(function(res){
          res.body.should.instanceOf(Object);
          res.body.should.have.property('id', turmas[0].id);
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
        .put('/v1/turmas/' + turmas[0].id)
        .send(data)
        .set('Accept', 'application/json')
        .expect('Content-Type', /json/)
        .expect(200, done)
        .expect(function(res){
          res.body.should.instanceOf(Object);
          res.body.should.have.property('id', turmas[0].id);
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
