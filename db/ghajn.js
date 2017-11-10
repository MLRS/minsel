// Change single quote ' to għajn ‘ for single entry
// 2017-11-09

var id = '57a4abd7b082b0f9392cece7'
var s_old = '\''
var s_new = '‘'
var s_old_regex = new RegExp(s_old, 'g')

db.getCollection('entries').find({'_id':ObjectId(id)}).forEach(function(e) {
  for (var ex in e.etymology) {
    for (var fx in e.etymology[ex]) {
      var val = e.etymology[ex][fx]
      if (val.indexOf(s_old) > -1) {
        e.etymology[ex][fx] = val.replace(s_old_regex, s_new)
        print(fx, ':', val, '->', e.etymology[ex][fx])
      }
    }
  }
  // db.getCollection('entries').save(e)
})
