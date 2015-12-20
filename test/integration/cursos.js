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

function toPlain(obj){
  return obj.get({plain: true});
}

describe('/v1/cursos', function () {

  describe('get /', function(){
    var cursos, tags;

    before(function(){
      return db.sequelize.sync({force: true}).then(function(){
        return db.Tag.bulkCreate([
          { nome: 'tag1' },
          { nome: 'tag2' }
        ], {returning: true}).then(function(tagsResult){
          tags = _.map(tagsResult, toPlain);

          var cursosOps = [];

          for ( var i = 1; i <= 10; i++ ){
            cursosOps.push(db.Curso.create({
              nome: 'curso' + i,
              descricao: 'descricao' + i,
              cargaHoraria: 10 + i
            }))
          }

          return Promise.all(cursosOps).then(function(cursosResult){
            var setTagsOperations;

            cursos = _.map(cursosResult, function(item){
              return item.get();
            });

            setTagsOperations = _.map(cursosResult, function(item){
              return item.setTags(tagsResult);
            })

            return Promise.all(setTagsOperations);
          });
        });
      });
    });

    it('deve retornar os cursos', function (done) {
      request(app)
        .get('/v1/cursos')
        .set('Accept', 'application/json')
        .expect('Content-Type', /json/)
        .expect(200, done)
        .expect(function(res){
          res.body.should.instanceOf(Array);
          res.body.should.have.length(10);
        })
    });
//
    it('deve ser capaz de retornar os cursos incluindo as tags', function (done) {
      request(app)
        .get('/v1/cursos')
        .query({include: JSON.stringify([
          { model: "tags" }
        ])})
        .set('Accept', 'application/json')
        .expect('Content-Type', /json/)
        .expect(200, done)
        .expect(function(res){
          res.body.should.instanceOf(Array);
          res.body.should.have.length(10);
          var source = _.map(tags, omitDateFields);
          var target = _.map(res.body[0].tags, function(item){
            return _.omit(item, 'createdAt', 'updatedAt');
          });
          target.should.be.containDeep(source);
        })
    });

    it('deve ser capaz de fazer a busca nos cursos', function (done) {
      var i = 9;
      request(app)
        .get('/v1/cursos')
        .query({where: JSON.stringify({nome: cursos[i].nome})})
        .set('Accept', 'application/json')
        .expect('Content-Type', /json/)
        .expect(200, done)
        .expect(function(res){
          res.body.should.instanceOf(Array);
          res.body.should.have.length(1);
          var source = omitDateFields(cursos[i]);
          var target = omitDateFields(res.body[0]);
          source.should.be.eql(target);
        })
    });

    it('deve ser capaz de limitar os resultados', function (done) {
      request(app)
        .get('/v1/cursos')
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
        .get('/v1/cursos')
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
    var curso, tags;

    before(function(){
      return db.sequelize.sync({force: true}).then(function(){
        return db.Tag.bulkCreate([
          { nome: 'tag1' },
          { nome: 'tag2' }
        ], {returning: true}).then(function(tagsResult){
          tags = _.map(tagsResult, toPlain);

          var cursosOps = [];

          return db.Curso.create({
            nome: 'curso1',
            descricao: 'qualquer',
            cargaHoraria: 20
          }).then(function(result){
            curso = result.get({plain: true});
            return result.setTags(tagsResult);
          });
        });
      });
    });

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

    it('deve ser capaz de retornar um curso incluindo as tags', function (done) {
      request(app)
        .get('/v1/cursos/' + curso.id)
        .query({include: JSON.stringify([
          { model: "tags" }
        ])})
        .set('Accept', 'application/json')
        .expect('Content-Type', /json/)
        .expect(200, done)
        .expect(function(res){
          res.body.should.instanceOf(Object);
          var source = _.map(tags, omitDateFields);
          var target = _.map(res.body.tags, function(item){
            return _.omit(item, 'createdAt', 'updatedAt');
          });
          target.should.be.containDeep(source);
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
    var curso;

    before(function(){
      return db.sequelize.sync({force: true}).then(function(){
        return db.Curso.create({
          nome: 'curso1',
          cargaHoraria: 20,
          descricao: 'qualquer'
        }).then(function(result){
          curso = result;
        });
      });
    });

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
