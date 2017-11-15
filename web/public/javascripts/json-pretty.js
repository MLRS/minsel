function JSONPretty (obj, depth) {
  if (!depth) {
    depth = 0
  }

  function repeat (c, n) {
    return Array(n + 1).join(c)
  }

  var out = ''

  // Null
  if (obj === null) {
    out += '<span class="json-value json-null">null</span>'
  }

  // List
  else if (obj.constructor === Array) {
    var width = Math.ceil(obj.length / 10)
    out += '<div class="json-list">'
    for (var k1 in obj) {
      out += '<div class="json-list-item">'
      out += repeat(' ', depth)
      out += '<span class="json-list-index">' + k1 + '</span>'
      out += repeat(' ', width - k1.length)
      out += '<span class="json-colon">:</span>'
      out += JSONPretty(obj[k1], depth + 2)
      out += '</div>'
    }
    out += '</div>'
  }

  // Object
  else if (typeof obj === 'object') {
    // get width
    var width = 0
    for (var k in obj) {
      width = Math.max(width, k.length)
    }

    // known fields, in order
    var orders = [
      '_id',
      'lemma',
      'pos',
      'root',
      'gender',
      'senses',
      'etymology',

      'language',
      'variant',
      'word_native',
      'word',
      'comments',
      'private_notes',
      'reference',
    ]

    var fields = Object.keys(obj)
    fields.sort(function (a, b) {
      var ax = orders.indexOf(a)
      var bx = orders.indexOf(b)
      if (ax === -1) return 1
      if (bx === -1) return -1
      return ax - bx
    })
    out += '<div class="json-object">'
    for (var k1 in fields) {
      var k = fields[k1]
      var v = obj[k]
      out += '<div class="json-row">'
      out += repeat(' ', depth)
      out += '<span class="json-key">' + k + '</span>'
      out += repeat(' ', width - k.length)
      out += '<span class="json-colon">:</span>'
      out += JSONPretty(v, depth + 2)
      out += '</div>'
    }
    out += '</div>'
  }

  // Simple value (string, number)
  else {
    out += '<span class="json-value">' + obj + '</span>'
  }

  // var out = ''
  // out += '<div class="json-object">'
  // for (var kx in fields) {
  //   var k = fields[kx]
  //   var v = obj[k]
  //   out += '<div class="json-row">'
  //   out += repeat(' ', depth)
  //   out += '<span class="json-key">' + k + '</span>'
  //   out += repeat(' ', width - k.length)
  //   out += '<span class="json-colon">:</span>'
  //   if (v && v.constructor === Array) {
  //     out += '<span class="json-value">'
  //     for (var k2 in v) {
  //       out += JSONPretty(v[k2], depth + 2)
  //     }
  //     // out += JSONPretty(v, depth + 2)
  //     out += '</span>'
  //   } else if (v === null) {
  //     out += '<span class="json-value json-null">null</span>'
  //   } else if (typeof v === 'object') {
  //     out += JSONPretty(v, depth + 2)
  //   } else {
  //     out += '<span class="json-value">' + v + '</span>'
  //   }
  //   out += '</div>'
  // }
  // out += '</div>'

  return out
}
