var express = require('express'),
  router = express.Router(),
  salas = require('../controllers/salas');

module.exports = function (app) {
  app.use('/v1/salas', router);
};

router.get('', salas.list);
router.post('', salas.create);
router.put('/:id', salas.update);
router.get('/:id', salas.read);
router.delete('/:id', salas.delete);
