// Give all languages an order value
// 2016-08-04
var i = 0
db.getCollection('languages').find().forEach(function(e) {
    i += 5
    e.order = i
    db.getCollection('languages').save(e)
})
