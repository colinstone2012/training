(function () {
  var manifest = null;
  function idsOf(slot) {
    var el = slot.querySelector('.slot-body');
    if (!el) return [];
    var m = el.textContent.match(/\b[MS]\d-\d\d[a-z]?(?:\/\d\d)?\b/g) || [];
    var ids = [];
    m.forEach(function (raw) {
      var parts = raw.split('/');
      var prefix = parts[0].split('-')[0] + '-';
      ids.push(parts[0]);
      for (var i = 1; i < parts.length; i++) ids.push(prefix + parts[i]);
    });
    return ids.filter(function (v, i) { return ids.indexOf(v) === i; });
  }
  function probe(url) {
    return fetch(url, { method: 'HEAD' }).then(function (r) { return r.ok; }).catch(function () { return false; });
  }
  function loadManifest() {
    if (manifest !== null) return Promise.resolve(manifest);
    return fetch('media.json').then(function (r) { return r.ok ? r.json() : {}; }).catch(function () { return {}; })
      .then(function (j) { manifest = j || {}; return manifest; });
  }
  function isVideo(src) { return /\.(mp4|webm|mov|m4v)(\?|#|$)/i.test(src); }
  function apply(slot, src) {
    if (isVideo(src)) {
      var v = document.createElement('video');
      v.controls = true; v.preload = 'metadata'; v.style.width = '100%'; v.src = src;
      slot.innerHTML = ''; slot.appendChild(v);
    } else {
      var im = document.createElement('img');
      im.src = src; im.style.width = '100%';
      slot.innerHTML = ''; slot.appendChild(im);
    }
  }
  function manifestSrc(ids) {
    for (var i = 0; i < ids.length; i++) {
      var e = manifest[ids[i]];
      if (!e) continue;
      if (typeof e === 'object' && e.src) {
        if (e.type === 'video') return e.src;
        if (e.type === 'image') return e.src;
        return isVideo(e.src) ? e.src : e.src;   // unknown type: pass through, apply() sniffs
      }
      if (typeof e === 'string') return e;
    }
    return null;
  }
  function upgrade(slot) {
    var ids = idsOf(slot);
    if (!ids.length) return Promise.resolve();
    return loadManifest().then(function (mf) {
      var ext = manifestSrc(ids);
      if (ext) { apply(slot, ext); return; }
      var chain = Promise.resolve(null);
      ids.forEach(function (id) {
        chain = chain.then(function (found) {
          if (found) return found;
          return probe('vid/' + id + '.mp4').then(function (ok) { return ok ? 'vid/' + id + '.mp4' : null; });
        });
      });
      ids.forEach(function (id) {
        chain = chain.then(function (found) {
          if (found) return found;
          return probe('img/' + id + '.jpg').then(function (ok) { return ok ? 'img/' + id + '.jpg' : null; });
        });
      });
      return chain.then(function (found) { if (found) apply(slot, found); });
    });
  }
  var slots = document.querySelectorAll('.slot');
  var chain = Promise.resolve();
  slots.forEach(function (slot) { chain = chain.then(function () { return upgrade(slot); }); });
})();