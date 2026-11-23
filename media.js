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
  function embedSrc(src) {
    var m = src.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/shorts\/)([\w-]+)/i);
    if (m) return 'https://www.youtube.com/embed/' + m[1];   // cloudflarestream ids work in the same iframe form
    return null;
  }
  function applyOne(slot, src) {
    var iframeUrl = /youtube\.com|youtu\.be|cloudflarestream/i.test(src) ? embedSrc(src) : null;
    if (iframeUrl) {
      var f = document.createElement('iframe');
      f.src = iframeUrl; f.style.width = '100%'; f.style.aspectRatio = '16 / 9'; f.style.border = '0';
      f.allow = 'fullscreen; picture-in-picture';
      slot.appendChild(f);
      return;
    }
    if (isVideo(src)) {
      var v = document.createElement('video');
      v.controls = true; v.preload = 'metadata'; v.style.width = '100%'; v.src = src;
      slot.appendChild(v);
    } else {
      var im = document.createElement('img');
      im.src = src; im.style.width = '100%';
      slot.appendChild(im);
    }
  }
  function knownMedia(src) {
    if (!src) return false;
    if (/youtube\.com|youtu\.be/i.test(src)) return true;
    return /\.(mp4|webm|mov|m4v|jpe?g|png|gif|svg)(\?|#|$)/i.test(src);
  }
  function manifestSrc(ids) {
    var out = [];
    for (var i = 0; i < ids.length; i++) {
      var e = manifest[ids[i]];
      if (!e) continue;
      var src = typeof e === 'string' ? e : (e.src || null);
      if (src && knownMedia(src)) out.push(src);
    }
    return out;
  }
  function upgrade(slot) {
    var ids = idsOf(slot);
    if (!ids.length) return Promise.resolve();
    return loadManifest().then(function (mf) {
      var ext = manifestSrc(ids);
      if (ext.length) {
        slot.innerHTML = '';
        ext.forEach(function (src) { applyOne(slot, src); });
        return;
      }
      var vidProbes = [];
      ids.forEach(function (id) { vidProbes.push(probe('vid/' + id + '.mp4').then(function (ok) { return ok ? 'vid/' + id + '.mp4' : null; })); });
      var imgProbes = [];
      ids.forEach(function (id) { imgProbes.push(probe('img/' + id + '.jpg').then(function (ok) { return ok ? 'img/' + id + '.jpg' : null; })); });
      return Promise.all(vidProbes).then(function (vids) {
        return Promise.all(imgProbes).then(function (imgs) {
          var found = vids.filter(Boolean).concat(imgs.filter(Boolean));
          if (!found.length) return;
          slot.innerHTML = '';
          found.forEach(function (src) { applyOne(slot, src); });
        });
      });
    });
  }
  var slots = document.querySelectorAll('.slot');
  var chain = Promise.resolve();
  slots.forEach(function (slot) { chain = chain.then(function () { return upgrade(slot); }); });
})();