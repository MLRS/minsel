var express = require('express')
var router = express.Router()
var ensureLoggedInAPI = require('../middlewares/ensureLoggedInAPI')
var log = require('../middlewares/logger').makeLogger('entries')

// -- CRUD API ---------------------------------------------------------------

/* Create = POST */
/* Content-Type: application/json */
router.post('/',
  ensureLoggedInAPI(),
  function (req, res, next) {
    var collection = req.db.get('entries')
    collection.insert(req.body, function (err, data) {
      if (err) {
        res.status(500).send(err)
      }
      log(req, data._id, data, 'created')
      res.json(data)
    })
  }
)

/* Index = GET */
router.get('/', function (req, res, next) {
  var collection = req.db.get('entries')
  collection.find({}, function (err, data) {
    if (err) {
      res.status(500).send(err)
    }
    res.json(data)
  })
})

/* Search with query params: lemma, pos */
router.get('/search', function (req, res, next) {
  var db = req.db

  var conds = {
    'lemma': req.query.lemma,
    'pos': req.query.pos,
  }
  var opts = {
  }
  db.get('entries').find(conds, opts, function (err, data) {
    if (err) {
      res.status(500).send(err)
    }
    res.json(data)
  })
})

/* Read = GET with ID */
router.get('/:id', function (req, res, next) {
  var collection = req.db.get('entries')
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
    var collection = req.db.get('entries')
    collection.update(req.params.id, req.body, function (err) {
      if (err) {
        res.status(500).send(err)
      }
      collection.findOne(req.params.id, function (err, data) {
        if (err) {
          res.status(500).send(err)
        }
        log(req, data._id, data, 'modified')
        res.json(data)
      })
    })
  }
)

/* Delete = DELETE with ID */
router.delete('/:id',
  ensureLoggedInAPI(),
  function (req, res, next) {
    var collection = req.db.get('entries')
    collection.remove(req.params.id, function (err) {
      if (err) {
        res.status(500).send(err)
      }
      log(req, req.params.id, null, 'deleted')
      res.end()
    })
  }
)

module.exports = router
