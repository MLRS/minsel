var express = require('express')
var router = express.Router()
var fs = require('fs')
var async = require('async')
var passport = require('passport')

const schema_file = 'public/schemas/entry.json'

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

var ensureLogin = require('connect-ensure-login')

/* GET add */
router.get('/add',
  ensureLogin.ensureLoggedIn(),
  function (req, res, next) {
    add_edit(req, res, next, {
      'title': 'New entry',
      'id': null
    })
  }
)

/* GET edit */
router.get('/edit/:id',
  ensureLogin.ensureLoggedIn(),
  function (req, res, next) {
    add_edit(req, res, next, {
      'title': 'Edit entry',
      'id': req.params.id
    })
  }
)

/* GET references */
router.get('/references',
  function (req, res, next) {
    var collection = req.db.get('references')
    collection.find({}, {'sort': {'abbrev': 1, 'year': 1}}, function (err, data) {
      if (err) {
        res.status(500).send(err)
      }
      res.render('references', {
        title: 'References',
        data: data
      })
    })
  }
)

/* GET login */
router.get('/login',
  function (req, res, next) {
    res.render('login', {
      title: 'Login'
    })
  }
)

/* POST login */
router.post('/login',
  passport.authenticate('local', {
    failureRedirect: '/login'
  }),
  function(req, res) {
    res.redirect('/')
  }
)

/* GET logout */
router.get('/logout',
  function (req, res) {
    req.logout()
    res.redirect('/')
  }
)

module.exports = router
