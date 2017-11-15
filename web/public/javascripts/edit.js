var editor
$(document).ready(function () {
  var element = document.getElementById('editor-holder')
  editor = new JSONEditor(element, {
    schema: Minsel.schema
  })
  editor.on('ready', function () {
    $("#btn-load").trigger('click')
  })

  // Drop-down completors
  var langs = new Bloodhound({
    datumTokenizer: Bloodhound.tokenizers.whitespace,
    queryTokenizer: Bloodhound.tokenizers.whitespace,
    local: Minsel.languages
  })
  var refs = new Bloodhound({
    datumTokenizer: Bloodhound.tokenizers.whitespace,
    queryTokenizer: Bloodhound.tokenizers.whitespace,
    local: Minsel.references
  })
  var opts = {
    minLength: 1,
    highlight: true
  }
  editor.on('change', function () {
    $('td[data-schemapath^="root.senses"][data-schemapath*="etymologies"] input:not(.typeahead)').addClass('typeahead').typeahead(opts, {
      name: 'language',
      source: langs
    })
    $('td[data-schemapath^="root.etymology"][data-schemapath$="language"] input:not(.typeahead)').addClass('typeahead').typeahead(opts, {
      name: 'language',
      source: langs
    })
    $('td[data-schemapath^="root.etymology"][data-schemapath$="reference"] input:not(.typeahead)').addClass('typeahead').typeahead(opts, {
      name: 'reference',
      source: refs
    })
  })
})

$("#btn-load").click(function () {
  show_loading()
  $.ajax({
    method: "GET",
    url: Minsel.baseURL+"/entries/"+Minsel.id,
    success: function (data) {
      editor.setValue(data)
    },
    error: function (err) {
      alert(err.statusText + "\n" + err.responseJSON.name + "\n" + err.responseJSON.err)
    },
    complete: function () {
      hide_loading()
    }
  })
})

$("#btn-sort").click(function () {
  show_loading()
  var langs = Minsel.languages
  var data = editor.getValue()
  console.log(data)
  for (var i in data.senses) {
    data.senses[i].etymologies.sort(function (a,b) {
      var order_a = langs.indexOf(a) > -1 ? langs.indexOf(a) : 9999
      var order_b = langs.indexOf(b) > -1 ? langs.indexOf(b) : 9999
      return order_a - order_b
    })
  }
  data.etymology.sort(function (a,b) {
    var order_a = langs.indexOf(a.language) > -1 ? langs.indexOf(a.language) : 9999
    var order_b = langs.indexOf(b.language) > -1 ? langs.indexOf(b.language) : 9999
    return order_a - order_b
  })
  editor.setValue(data)
  hide_loading()
})
$("#btn-save").click(function () {
  var id = Minsel.id // empty when adding
  show_loading()
  $.ajax({
    method: "POST",
    contentType: "application/json",
    url: Minsel.baseURL+"/entries/"+id,
    data: JSON.stringify(editor.getValue()),
    success: function (data) {
      if (id) {
        editor.setValue(data)
      } else {
        window.location.replace(Minsel.baseURL+'/edit/'+data._id)
      }
    },
    error: function (err) {
      alert(err.statusText + "\n" + err.responseJSON.name + "\n" + err.responseJSON.err)
    },
    complete: function () {
      hide_loading()
    }
  })
})
$("#btn-delete").click(function () {
  if (!confirm("Really delete this entry?"))
    return false
  show_loading()
  $.ajax({
    method: "DELETE",
    url: Minsel.baseURL+"/entries/"+Minsel.id,
    success: function () {
      window.location.replace(Minsel.baseURL+'/')
    },
    error: function (err) {
      alert(err.statusText + "\n" + err.responseJSON.name + "\n" + err.responseJSON.err)
    },
    complete: function () {
      hide_loading()
    }
  })
})

// On screen keyboard (OSK)
var osk_opts = {
  layout: 'custom',
  customLayout : {
    'normal': [
      'ċ ġ ħ ż {sp:.5} ’:għajn ‘:ħamża {sp:.5} \u0307:combining_dot_above \u0304:combining_macron \u0331:combining_macron_below ',
      'ā ē ī ō ū à è ì ò ù',
      'ẖ ḥ ḍ ḏ ḏ̣ ṛ ẓ ə',
      'č ṃ ṯ ṭ ǧ ṣ š {sp:.5} {shift}'
    ],
    'shift': [
      'Ċ Ġ Ħ Ż {sp:.5} ’:għajn ‘:ħamża {sp:.5} \u0307:combining_dot_above \u0304:combining_macron \u0331:combining_macron_below ',
      'Ā Ē Ī Ō Ū À È Ì Ò Ù',
      'H̱ Ḥ Ḍ Ḏ Ḏ̣ Ṛ Ẓ Ə',
      'Č Ṃ Ṯ Ṭ Ǧ Ṣ Š {sp:.5} {shift}'
    ]
  },
  usePreview: false,
  appendLocally: true,
  autoAccept: true,
  stayOpen: true,
  css: {
    container: 'center-block dropdown-menu',
    buttonDefault: 'btn btn-default',
    buttonHover: 'btn-primary',
  }
}

var activeElem = null

// Activate OSK for hidden input
$('#osk')
  .keyboard(osk_opts).on('keyboardChange', function (event) {
    // Insert pressed char into active element
    if (event.action === 'shift') return
    if (activeElem) {
      //activeElem.insertAtCursor(event.action)
      // We have to update the value in this way otherwise it won't register
      var path = activeElem.attr('name').replace(/\[/g, '.').replace(/\]/g, '')
      var node = editor.getEditor(path)
      if (node) {
        var pos = activeElem.getCursorPosition();
        var val = activeElem.val();
        val = val.substring(0,pos) + event.action + val.substring(pos);
        node.setValue(val)
        activeElem.setCursorPosition(pos + event.action.length);
      }
    }
  })

// Toggle keyboard
$('#btn-osk').click(function () {
  var kbd = $('#osk').getkeyboard()
  if (kbd.isOpen)
    kbd.close()
  else
    kbd.reveal()
})

  // Update last focused field
$(document).ready(function () {
  editor.on('change', function () {
    $("#editor-holder input[type='text']:not(.osk)").addClass('osk').on('focus', function () {
      activeElem = $(this)
    })
  })
})
