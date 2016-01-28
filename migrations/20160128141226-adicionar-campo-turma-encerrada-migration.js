'use strict';

module.exports = {
  up: function (queryInterface, Sequelize) {
    return queryInterface.addColumn(
      'turmas',
      'encerrada',
      {
        type: Sequelize.BOOLEAN,
        allowNull: true
      }
    )
  },

  down: function (queryInterface, Sequelize) {
    return queryInterface.removeColumn('turmas', 'encerrada');
  }
};
