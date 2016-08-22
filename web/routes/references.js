var express = require('express')
var router = express.Router()
var fs = require('fs')
// var ensureLoggedIn = require('connect-ensure-login').ensureLoggedIn
var ensureLoggedInAPI = require('../middlewares/ensureLoggedInAPI')

const schema_file = 'public/schemas/reference.json'

const sort = {'abbrev': 1, 'year': 1}

/* GET Show all references */
router.get('/show',
  function (req, res, next) {
    schema = fs.readFileSync(schema_file, 'utf8') // naughty
    var collection = req.db.get('references')
    collection.find({}, {'sort': sort}, function (err, data) {
      if (err) {
        res.status(500).send(err)
      }
      res.render('references', {
        title: 'References',
        schema: schema,
        data: data
      })
    })
  }
)

// -- CRUD API ---------------------------------------------------------------

/* Index = GET */
router.get('/', function (req, res, next) {
  var collection = req.db.get('references')
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
    var collection = req.db.get('references')
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
  var collection = req.db.get('references')
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
    var collection = req.db.get('references')
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
    var collection = req.db.get('references')
    collection.remove(req.params.id, function (err) {
      if (err) {
        res.status(500).send(err)
      }
      res.end()
    })
  }
)

module.exports = router
