var express = require('express')
var router = express.Router()
var fs = require('fs')

/* GET home page - list entries */
router.get('/', function (req, res, next) {

  res.render('index', { title: 'Entries' })

})

/* GET entry - edit */
router.get('/add', function (req, res, next) {

  var mdfile = '../examples/schema.json'
  fs.readFile(mdfile, 'utf8', function (err, data) {
    if (err) {
      return console.log(err)
    }
    res.render('edit', { title: 'Add', schema: data })
  })

})

/* GET entry - edit */
router.get('/edit/:id', function (req, res, next) {

  var mdfile = '../examples/schema.json'
  fs.readFile(mdfile, 'utf8', function (err, data) {
    if (err) {
      return console.log(err)
    }
    res.render('edit', { title: 'Edit ' + req.params.id, schema: data })
  })

})

module.exports = router
