(function () {
  function idOf(slot) {
    var el = slot.querySelector('.slot-body');
    if (!el) return null;
    var m = el.textContent.match(/\b([MS]\d-\d\d[a-z]?)\b/);
    return m ? m[1] : null;
  }
  function probe(url) {
    return fetch(url, { method: 'HEAD' }).then(function (r) { return r.ok; }).catch(function () { return false; });
  }
  function upgrade(slot) {
    var id = idOf(slot);
    if (!id) return Promise.resolve();
    return probe('vid/' + id + '.mp4').then(function (hasVideo) {
      if (hasVideo) {
        var v = document.createElement('video');
        v.controls = true; v.preload = 'metadata'; v.style.width = '100%';
        v.src = 'vid/' + id + '.mp4';
        slot.innerHTML = '';
        slot.appendChild(v);
        return;
      }
      return probe('img/' + id + '.jpg').then(function (hasImg) {
        if (hasImg) {
          var im = document.createElement('img');
          im.src = 'img/' + id + '.jpg'; im.style.width = '100%'; im.alt = id;
          slot.innerHTML = '';
          slot.appendChild(im);
        }
      });
    });
  }
  var slots = document.querySelectorAll('.slot');
  var chain = Promise.resolve();
  slots.forEach(function (slot) { chain = chain.then(function () { return upgrade(slot); }); });
})();