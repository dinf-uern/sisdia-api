var express = require('express'),
  router = express.Router(),
  cursos = require('../controllers/cursos');

module.exports = function (app) {
  app.use('/v1/cursos', router);
};

router.get('', cursos.list);
router.post('', cursos.create);
router.put('/:id', cursos.update);
router.get('/:id', cursos.read);
