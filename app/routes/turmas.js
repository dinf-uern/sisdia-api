var express = require('express'),
  router = express.Router(),
  turmas = require('../controllers/turmas');

module.exports = function (app) {
  app.use('/v1/turmas', router);
};

router.get('', turmas.list);
router.post('', turmas.create);
router.put('/:id', turmas.update);
router.get('/:id', turmas.read);
router.delete('/:id', turmas.delete);
