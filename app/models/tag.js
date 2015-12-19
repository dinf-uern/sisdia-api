"use strict";

var  _ = require('underscore');

module.exports = function(sequelize, DataTypes) {
  var Tag = sequelize.define("Tag", {
    nome: {
      type: DataTypes.STRING,
      allowNull: false,
      validate: {
        notEmpty: {
          msg: 'O nome deve ser informado.'
        }
      }
    }
  }, {
    tableName: 'tags',
    classMethods: {
      associate: function(models) {
        Tag.belongsToMany(models.Curso, { as: 'cursos', through: 'curso_tags', foreignKey: 'tagId' })
      },
      bulkFindOrCreate: function(rows, options){
        var self = this;

        var operations = [];

        _.each(rows, function(data){
          var opt = {};
          opt.where = _.pick(data, 'nome');
          opt.defaults = data;

          _.extendOwn(opt, options);

          console.log(opt);

          operations.push(self.findOrCreate(opt));
        });

        return Promise.all(operations).then(function(tagsRaw){
          var tags = _.map(tagsRaw, function(tagRaw){
            return tagRaw[0];
          })
          return tags;
        });
      }
    }
  });

  return Tag;
};



