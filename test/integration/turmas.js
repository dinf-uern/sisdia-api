'use strict';
process.env.NODE_ENV = 'test';

var express = require('express'),
  request = require('supertest'),
  config = require('../../config/config'),
  _ = require('underscore'),
  db = require('../../app/models'),
  moment = require('moment'),
  app = express();

require('../../config/express')(app, config);

function omitDateFields(obj){
  return _.omit(obj, 'createdAt', 'updatedAt');
}

describe('/v1/turmas', function () {
  describe('get /', function(){
    var turmas, curso, sala;

    before(function(){
      return db.sequelize.sync({force: true}).then(function(){
        var cursoOp = db.Curso.create({
          nome: 'curso1',
          cargaHoraria: 20,
          descricao: 'some description'
        }).then(function(result){
          return curso = result.get({plain: true});
        });

        var salaOp = db.Sala.create({
          nome: 'sala1'
        }).then(function(result){
          return sala = result.get({plain: true});
        });

        return Promise.all([salaOp, cursoOp]).then(function(related){

          var operacoes = [];

          for ( var i = 1; i <= 10; i++ ){
            operacoes.push(db.Turma.create({
              nome: 'turma' + i,
              salaId: sala.id,
              cursoId: curso.id,
              periodoInscricoes: {
                inicio: moment().toJSON(),
                termino: moment().toJSON()
              },
              periodoAulas: {
                inicio: moment().toJSON(),
                termino: moment().toJSON()
              },
              horarioAulas: {
                dias: [1,2],
                horaInicio: moment([1970]).toJSON(),
                horaTermino: moment([1970]).toJSON()
              }
            }))
          }

          return Promise.all(operacoes).then(function(result){
            turmas = _.map(result, function(item){
              return item.get();
            })

            return turmas;
          });
        });
      });
    });

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
      var i = 9;
      request(app)
        .get('/v1/turmas')
        .query({where: JSON.stringify({nome: turmas[i].nome})})
        .set('Accept', 'application/json')
        .expect('Content-Type', /json/)
        .expect(200, done)
        .expect(function(res){
          res.body.should.instanceOf(Array);
          res.body.should.have.length(1);
          var source = omitDateFields(turmas[i]);
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
        })
    });

    it('deve retornar as turmas incluindo o curso e a sala', function (done) {
      request(app)
        .get('/v1/turmas')
        .query({include: JSON.stringify([
          { model: "curso" },
          { model: "sala" }
        ])})
        .set('Accept', 'application/json')
        .expect('Content-Type', /json/)
        .expect(200, done)
        .expect(function(res){
          res.body.should.instanceOf(Array);
          omitDateFields(res.body[0].curso).should.be.eql(omitDateFields(curso));
          omitDateFields(res.body[0].sala).should.be.eql(omitDateFields(sala));
        })
    });

  })

  describe('post /', function(){
    var salaData = {
      nome: 'sala qualquer'
    };

    var turmaData = {
      nome: "turma1",
      periodoInscricoes: {
        inicio: moment().toJSON(),
        termino: moment().toJSON()
      },
      periodoAulas: {
        inicio: moment().toJSON(),
        termino: moment().toJSON()
      },
      horarioAulas: {
        dias: [1,2],
        horaInicio: moment([1970]).toJSON(),
        horaTermino: moment([1970]).toJSON()
      }
    };


    before(function(){
      return db.sequelize.sync({force: true}).then(function(){
        return db.Sala.create(salaData).then(function(sala){
          return db.Turma.create(_.extend(turmaData, {salaId: sala.id}));
        });
      });
    });

    it('deve criar uma turma', function (done) {
      var data = _.clone(turmaData);

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
      var data = _.clone(turmaData);
      data.nome = '';

      request(app)
        .post('/v1/turmas')
        .send(data)
        .set('Accept', 'application/json')
        .expect('Content-Type', /json/)
        .expect(400, done)
        .expect(function(res){
          res.body.should.instanceOf(Object);
          res.body.should.have.property('message');
        });
    });

    it('deve impedir que seja criada turma com dii > dti', function (done) {
      var data = _.clone(turmaData);

      data.periodoInscricoes = {
        inicio: moment().add(1,'month').toJSON(),
        termino: moment().toJSON()
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

    it('deve impedir que seja criada turma com dia > dta', function (done) {
      var data = _.clone(turmaData);

      data.periodoAulas = {
        inicio: moment().add(10, 'month').toJSON(),
        termino: moment().add(9, 'month').toJSON()
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

    it('deve impedir que seja criada turma com dti > dia', function (done) {
      var data = _.clone(turmaData);

      data.periodoInscricoes.inicio = moment().add(1, 'month').toJSON();
      data.periodoInscricoes.termino = moment().add(2, 'month').toJSON();
      data.periodoAulas.inicio = moment().add(1, 'week').toJSON();
      data.periodoAulas.termino = moment().add(2, 'week').toJSON();

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
    var turma, curso, sala;

    before(function(){
      return db.sequelize.sync({force: true}).then(function(){
        var cursoOp = db.Curso.create({
          nome: 'curso1',
          cargaHoraria: 20,
          descricao: 'some description'
        }).then(function(result){
          return curso = result.get({plain: true});
        });

        var salaOp = db.Sala.create({
          nome: 'sala1'
        }).then(function(result){
          return sala = result.get({plain: true});
        });

        return Promise.all([salaOp, cursoOp]).then(function(related){
          return db.Turma.create({
            nome: 'turma1',
            salaId: sala.id,
            cursoId: curso.id,
            periodoInscricoes: {
              inicio: moment().toJSON(),
              termino: moment().add(1, 'week').toJSON()
            },
            periodoAulas: {
              inicio: moment().add(1, 'month').toJSON(),
              termino: moment().add(2, 'month').toJSON()
            },
            horarioAulas: {
              dias: [1,2],
              horaInicio: moment([1970]).toJSON(),
              horaTermino: moment([1970]).toJSON()
            }
          }).then(function(result){
            turma = result.get({plain: true});
          });
        });
      });
    });

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

    it('deve ser capaz de retornar uma turma incluindo o curso e a sala', function (done) {
      request(app)
        .get('/v1/turmas/' + turma.id)
        .query({include: JSON.stringify([
          { model: "curso" },
          { model: "sala" }
        ])})
        .set('Accept', 'application/json')
        .expect('Content-Type', /json/)
        .expect(200, done)
        .expect(function(res){
          res.body.should.instanceOf(Object);
          omitDateFields(res.body.curso).should.be.eql(omitDateFields(curso));
          omitDateFields(res.body.sala).should.be.eql(omitDateFields(sala));
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
    var turma;

    before(function(){
      return db.sequelize.sync({force: true}).then(function(){
        return db.Turma.create({
          nome: 'turma1',
          periodoInscricoes: {
            inicio: moment().toJSON(),
            termino: moment().add(1, 'week').toJSON()
          },
          periodoAulas: {
            inicio: moment().add(1, 'month').toJSON(),
            termino: moment().add(2, 'month').toJSON()
          },
          horarioAulas: {
            dias: [1,2],
            horaInicio: moment([1970]).toJSON(),
            horaTermino: moment([1970]).toJSON()
          }
        }).then(function(result){
          turma = result;
        });
      });
    });

    it('deve ser capaz de atualizar uma turma', function (done) {
      var data = {
        nome: 'novo nome',
        periodoInscricoes: {
          inicio: moment(),
          termino: moment()
        },
        periodoAulas: {
          inicio: moment().add(),
          termino: moment()
        },
        horarioAulas: {
          dias: [1,2],
          horaInicio: moment(),
          horaTermino: moment()
        }
      };

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
