var express = require('express')
var router = express.Router()
var fs = require('fs')
// var ensureLoggedIn = require('connect-ensure-login').ensureLoggedIn
var ensureLoggedInAPI = require('../middlewares/ensureLoggedInAPI')

const schema_file = 'public/schemas/language.json'
const sort = {'order': 1}

/* Get languages list for schema */
router.get('/enum', function (req, res, next) {
  var collection = req.db.get('languages')
  collection.find({}, {'sort': sort}, function (err, data) {
    if (err) {
      res.status(500).send(err)
    }
    var list = data.map(function (item) {
      return {
        'title': item.abbrev + ' - ' + item.name,
        'value': item.abbrev
      }
    })
    res.json({
      'title': 'Language',
      'type': 'string',
      'enumSource': [{
        'source': list,
        'title': '{{item.title}}',
        'value': '{{item.value}}'
      }]
    })
  })
})

/* Show all languages */
router.get('/show',
  function (req, res, next) {
    var schema = fs.readFileSync(schema_file, 'utf8') // naughty
    var collection = req.db.get('languages')
    collection.find({}, {'sort': sort}, function (err, data) {
      if (err) {
        res.status(500).send(err)
      }
      res.render('languages', {
        title: 'Languages',
        schema: schema,
        data: data
      })
    })
  }
)

/* For auto-complete */
// router.get('/suggest', function (req, res, next) {
//
//   function capitalizeFirstLetter (s) {
//     return s.charAt(0).toUpperCase() + s.slice(1).toLowerCase()
//   }
//
//   var s1 = req.query.s
//   var s2 = capitalizeFirstLetter(s1)
//   var collection = req.db.get('languages')
//   var conds = {
//     '$or': [
//       {'abbrev': {'$regex': s1} },
//       {'name': {'$regex': s1} },
//       {'abbrev': {'$regex': s2} },
//       {'name': {'$regex': s2} }
//     ]
//   }
//   collection.find(conds, {}, function (err, data) {
//     if (err) {
//       res.status(500).send(err)
//     }
//     res.json(data)
//   })
// })

// -- CRUD API ---------------------------------------------------------------

/* Index = GET */
router.get('/', function (req, res, next) {
  var collection = req.db.get('languages')
  collection.find({}, {'sort': sort}, function (err, data) {
    if (err) {
      res.status(500).send(err)
    }
    res.json(data)
  })
})

/* Create = POST */
/* Content-Type: application/json */
router.post('/',
  ensureLoggedInAPI(),
  function (req, res, next) {
    var collection = req.db.get('languages')
    collection.insert(req.body, function (err, data) {
      if (err) {
        res.status(500).send(err)
      }
      reflow(collection, () => {
        res.json(data)
      })
    })
  }
)

/* Read = GET with ID */
router.get('/:id', function (req, res, next) {
  var collection = req.db.get('languages')
  collection.findOne(req.params.id, function (err, data) {
    if (err) {
      res.status(500).send(err)
    }
    res.json(data)
  })
})

/* Update = POST with ID */
/* Content-Type: application/json */
/* _id in body should match :id or be omitted (otherwise will fail) */
router.post('/:id',
  ensureLoggedInAPI(),
  function (req, res, next) {
    var collection = req.db.get('languages')
    collection.update(req.params.id, req.body, function (err) {
      if (err) {
        res.status(500).send(err)
      }
      reflow(collection, () => {
        collection.findOne(req.params.id, function (err, data) {
          if (err) {
            res.status(500).send(err)
          }
          res.json(data)
        })
      })
    })
  }
)

/* Delete = DELETE with ID */
router.delete('/:id',
  ensureLoggedInAPI(),
  function (req, res, next) {
    var collection = req.db.get('languages')
    collection.remove(req.params.id, function (err) {
      if (err) {
        res.status(500).send(err)
      }
      res.end()
    })
  }
)

// Re-order
router.post('/reorder/:id/:order',
  ensureLoggedInAPI(),
  function (req, res, next) {
    var collection = req.db.get('languages')
    collection.update(req.params.id, {$set: {order: parseInt(req.params.order)}}, function (err) {
      if (err) {
        res.status(500).send(err)
      }
      reflow(collection, () => {
        collection.findOne(req.params.id, function (err, data) {
          if (err) {
            res.status(500).send(err)
          }
          res.json(data)
        })
      })
    })
  }
)

// Reflow orders (for internal use)
var reflow = function (collection, callback) {
  var i = 0
  collection.find({}, {'sort': sort}).each((language) => {
    i += 5
    language.order = i
    collection.update(language._id, language)
  }).then(callback)
}

module.exports = router
