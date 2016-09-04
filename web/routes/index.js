var express = require('express')
var router = express.Router()
var fs = require('fs')
var async = require('async')
var passport = require('passport')
// var ensureLoggedIn = require('connect-ensure-login').ensureLoggedIn
var ensureLoggedIn = require('../middlewares/ensureLoggedIn')
var config = require('../server-config')

const schema_file = 'public/schemas/entry.json'

// -- Main pages -------------------------------------------------------------

/* GET home page - list entries */
/* Could contain a serach term in s */
router.get('/', function (req, res, next) {
  var db = req.db
  async.parallel({
      entries: function (callback) {
        var conds = {}
        var opts = {
          'sort': {
            'root.radicals': 1,
            'lemma': 1,
          }
        }
        if (req.query.s) {
          conds['lemma'] = {'$regex': req.query.s}
        }
        db.get('entries').find(conds, opts, callback)
      },
      languages: function (callback) {
        db.get('languages').find({}, {'sort': {'order': 1}}, function (err, data) {
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

      var title
      if (req.query.s) {
        title = 'Entries matching "' + req.query.s + '"'
      } else {
        title = 'All entries'
      }
      res.render('index', {
        title: title,
        query: req.query,
        data: data.entries,
        groups: groups,
        languages: data.languages,
        references: data.references
      })

    })

})

/* Load stuff we need for add/edit */
var add_edit = function (req, res, next, params) {
  async.parallel({
    schema: function (callback) {
      fs.readFile(schema_file, 'utf8', function (err, data) {
        if (err) data = '{}'
        callback(err, data)
      })
    },
    languages: function (callback) {
      var collection = req.db.get('languages')
      collection.find({}, {'sort': {'order': 1}}, function (err, data) {
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
    }},

    // All tasks done
    function (err, data) {
      if (err) {
        console.log(err)
      }
      res.render('edit', {
        title: params.title,
        schema: data.schema,
        languages: data.languages,
        references: data.references,
        id: params.id
      })
    }
  )
}

/* GET add */
router.get('/add',
  ensureLoggedIn(config.baseURL+'/login'),
  function (req, res, next) {
    add_edit(req, res, next, {
      'title': 'New entry',
      'id': null
    })
  }
)

/* GET edit */
router.get('/edit/:id',
  ensureLoggedIn(config.baseURL+'/login'),
  function (req, res, next) {
    add_edit(req, res, next, {
      'title': 'Edit entry',
      'id': req.params.id
    })
  }
)

// -- Login stuff ------------------------------------------------------------

/* GET login */
router.get('/login',
  function (req, res, next) {
    res.render('login', {
      title: 'Login',
      messages: req.flash()
    })
  }
)

/* POST login */
router.post('/login',
  passport.authenticate('local', {
    successReturnToOrRedirect: config.baseURL+'/', // Allows redirection to original dest
    failureRedirect: config.baseURL+'/login',
    failureFlash: true
  }),
  function(req, res) {
    res.redirect(config.baseURL+'/')
  }
)

/* GET logout */
router.get('/logout',
  function (req, res) {
    req.logout()
    res.redirect(config.baseURL+'/')
  }
)

module.exports = router
