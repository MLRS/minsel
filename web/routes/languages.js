var express = require('express')
var router = express.Router()

/* Get languages list for schema */
router.get('/enum', function (req, res, next) {
  var collection = req.db.get('languages')
  collection.find({}, {'sort': {'class': 1, 'abbrev': 1}}, function (err, data) {
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
    var collection = req.db.get('languages')
    collection.find({}, {'sort': {'class': 1, 'abbrev': 1}}, function (err, data) {
      if (err) {
        res.status(500).send(err)
      }
      res.render('languages', {
        title: 'Languages',
        data: data
      })
    })
  }
)

/* Get all languages */
router.get('/', function (req, res, next) {
  var collection = req.db.get('languages')
  collection.find({}, {'sort': {'class': 1, 'abbrev': 1}}, function (err, data) {
    if (err) {
      res.status(500).send(err)
    }
    res.json(data)
  })
})

/* For auto-complete */
/* This is not currently used... */
router.get('/suggest', function (req, res, next) {

  function capitalizeFirstLetter (s) {
    return s.charAt(0).toUpperCase() + s.slice(1).toLowerCase()
  }

  var s1 = req.query.s
  var s2 = capitalizeFirstLetter(s1)
  var collection = req.db.get('languages')
  var conds = {
    '$or': [
      {'abbrev': {'$regex': s1} },
      {'name': {'$regex': s1} },
      {'abbrev': {'$regex': s2} },
      {'name': {'$regex': s2} }
    ]
  }
  collection.find(conds, {}, function (err, data) {
    if (err) {
      res.status(500).send(err)
    }
    res.json(data)
  })
})

module.exports = router
