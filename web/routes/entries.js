var express = require('express')
var router = express.Router()
var passport = require('passport')

// -- CRUD API ---------------------------------------------------------------

/* Create = POST */
/* Content-Type: application/json */
router.post('/',
  passport.authenticate('basic', {
    session: false
  }),
  function (req, res, next) {
    var collection = req.db.get('entries')
    collection.insert(req.body, function (err, data) {
      if (err) {
        res.status(500).send(err)
      }
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

/* Read = GET with ID */
router.get('/:id', function (req, res, next) {
  var collection = req.db.get('entries')
  collection.findById(req.params.id, function (err, data) {
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
  passport.authenticate('basic', {
    session: false
  }),
  function (req, res, next) {
    var collection = req.db.get('entries')
    collection.updateById(req.params.id, req.body, function (err) {
      if (err) {
        res.status(500).send(err)
      }
      collection.findById(req.params.id, function (err, data) {
        if (err) {
          res.status(500).send(err)
        }
        res.json(data)
      })
    })
  }
)

/* Delete = DELETE with ID */
router.delete('/:id',
  passport.authenticate('basic', {
    session: false
  }),
  function (req, res, next) {
    var collection = req.db.get('entries')
    collection.removeById(req.params.id, function (err) {
      if (err) {
        res.status(500).send(err)
      }
      res.end()
    })
  }
)

module.exports = router
