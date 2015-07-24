var express = require('express')
var router = express.Router()
var fs = require('fs')

const schema_file = 'public/schemas/entry.json'

/* GET home page - list entries */
router.get('/', function (req, res, next) {
  var collection = req.db.get('entries')
  collection.find({}, function (err, data) {
    if (err) {
      console.log(err)
    }
    res.render('index', { title: 'Entries', data: data })
  })

})

/* GET add */
router.get('/add', function (req, res, next) {
  fs.readFile(schema_file, 'utf8', function (err, data) {
    if (err) {
      // Not loading schema is not fatal!
      console.log(err)
      data = "{}"
    }
    res.render('edit', {
      title: 'New entry',
      schema: data,
      id: null
    })
  })

})

/* GET edit */
router.get('/edit/:id', function (req, res, next) {
  fs.readFile(schema_file, 'utf8', function (err, data) {
    if (err) {
      // Not loading schema is not fatal!
      console.log(err)
      data = "{}"
    }
    res.render('edit', {
      title: 'Edit entry',
      schema: data,
      id: req.params.id
    })
  })

})

module.exports = router
