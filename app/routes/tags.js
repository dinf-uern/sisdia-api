var express = require('express'),
  router = express.Router(),
  tags = require('../controllers/tags');

module.exports = function (app) {
  app.use('/v1/tags', router);
};

router.get('', tags.list);
router.post('', tags.create);
router.put('/:id', tags.update);
router.get('/:id', tags.read);
