var express = require('express')
var router = express.Router()
var fs = require('fs')
var async = require('async')

const schema_file = 'public/schemas/entry.json'

/* GET home page - list entries */
router.get('/', function (req, res, next) {
  var db = req.db
  async.parallel({
      entries: function (callback) {
        db.get('entries').find({}, callback)
      },
      languages: function (callback) {
        db.get('languages').find({}, function (err, data) {
          var assoc = {} // abbrev : obj
          data.forEach(function (item) {
            assoc[item.abbrev] = item
          })
          callback(err, assoc)
        })
      },
      references: function (callback) {
        db.get('references').find({}, function (err, data) {
          var assoc = {} // abbrev : obj
          data.forEach(function (item) {
            assoc[item.abbrev] = item
          })
          callback(err, assoc)
        })
      }
    },

    // All tasks done
    function (err, data) {
      if (err) {
        console.log(err)
      }

      var groups = {}
      for (var abbrev in data.languages) {
        var item = data.languages[abbrev]
        if (!groups.hasOwnProperty(item.class)) {
          groups[item.class] = []
        }
        groups[item.class].push(item.abbrev)
      }

      res.render('index', {
        title: 'Entries',
        data: data.entries,
        groups: groups,
        languages: data.languages,
        references: data.references
      })

    })

})

/* Load stuff we need for add/edit */
var add_edit = function (req, res, next, id) {
  async.parallel({
      schema: function (callback) {
        fs.readFile(schema_file, 'utf8', function (err, data) {
          if (err) data = '{}'
          callback(err, data)
        })
      },
      languages: function (callback) {
        var collection = req.db.get('languages')
        collection.find({}, function (err, data) {
          var names = []
          if (!err) {
            names = data.map(function (item) {
              return item.abbrev
            })
          }
          callback(err, names)
        })
      },
      references: function (callback) {
        var collection = req.db.get('references')
        collection.find({}, function (err, data) {
          var names = []
          if (!err) {
            names = data.map(function (item) {
              return item.abbrev
            })
          }
          callback(err, names)
        })
      }
    },

    // All tasks done
    function (err, data) {
      if (err) {
        console.log(err)
      }
      res.render('edit', {
        title: 'New entry',
        schema: data.schema,
        languages: data.languages,
        references: data.references,
        id: id
      })
    })
}

/* GET add */
router.get('/add', function (req, res, next) {
  add_edit(req, res, next, null)
})

/* GET edit */
router.get('/edit/:id', function (req, res, next) {
  add_edit(req, res, next, req.params.id)
})

module.exports = router
