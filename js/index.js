
/**
 * Require the given path.
 *
 * @param {String} path
 * @return {Object} exports
 * @api public
 */

function require(path, parent, orig) {
  var resolved = require.resolve(path);

  // lookup failed
  if (null == resolved) {
    orig = orig || path;
    parent = parent || 'root';
    var err = new Error('Failed to require "' + orig + '" from "' + parent + '"');
    err.path = orig;
    err.parent = parent;
    err.require = true;
    throw err;
  }

  var module = require.modules[resolved];

  // perform real require()
  // by invoking the module's
  // registered function
  if (!module._resolving && !module.exports) {
    var mod = {};
    mod.exports = {};
    mod.client = mod.component = true;
    module._resolving = true;
    module.call(this, mod.exports, require.relative(resolved), mod);
    delete module._resolving;
    module.exports = mod.exports;
  }

  return module.exports;
}

/**
 * Registered modules.
 */

require.modules = {};

/**
 * Registered aliases.
 */

require.aliases = {};

/**
 * Resolve `path`.
 *
 * Lookup:
 *
 *   - PATH/index.js
 *   - PATH.js
 *   - PATH
 *
 * @param {String} path
 * @return {String} path or null
 * @api private
 */

require.resolve = function(path) {
  if (path.charAt(0) === '/') path = path.slice(1);

  var paths = [
    path,
    path + '.js',
    path + '.json',
    path + '/index.js',
    path + '/index.json'
  ];

  for (var i = 0; i < paths.length; i++) {
    var path = paths[i];
    if (require.modules.hasOwnProperty(path)) return path;
    if (require.aliases.hasOwnProperty(path)) return require.aliases[path];
  }
};

/**
 * Normalize `path` relative to the current path.
 *
 * @param {String} curr
 * @param {String} path
 * @return {String}
 * @api private
 */

require.normalize = function(curr, path) {
  var segs = [];

  if ('.' != path.charAt(0)) return path;

  curr = curr.split('/');
  path = path.split('/');

  for (var i = 0; i < path.length; ++i) {
    if ('..' == path[i]) {
      curr.pop();
    } else if ('.' != path[i] && '' != path[i]) {
      segs.push(path[i]);
    }
  }

  return curr.concat(segs).join('/');
};

/**
 * Register module at `path` with callback `definition`.
 *
 * @param {String} path
 * @param {Function} definition
 * @api private
 */

require.register = function(path, definition) {
  require.modules[path] = definition;
};

/**
 * Alias a module definition.
 *
 * @param {String} from
 * @param {String} to
 * @api private
 */

require.alias = function(from, to) {
  if (!require.modules.hasOwnProperty(from)) {
    throw new Error('Failed to alias "' + from + '", it does not exist');
  }
  require.aliases[to] = from;
};

/**
 * Return a require function relative to the `parent` path.
 *
 * @param {String} parent
 * @return {Function}
 * @api private
 */

require.relative = function(parent) {
  var p = require.normalize(parent, '..');

  /**
   * lastIndexOf helper.
   */

  function lastIndexOf(arr, obj) {
    var i = arr.length;
    while (i--) {
      if (arr[i] === obj) return i;
    }
    return -1;
  }

  /**
   * The relative require() itself.
   */

  function localRequire(path) {
    var resolved = localRequire.resolve(path);
    return require(resolved, parent, path);
  }

  /**
   * Resolve relative to the parent.
   */

  localRequire.resolve = function(path) {
    var c = path.charAt(0);
    if ('/' == c) return path.slice(1);
    if ('.' == c) return require.normalize(p, path);

    // resolve deps by returning
    // the dep in the nearest "deps"
    // directory
    var segs = parent.split('/');
    var i = lastIndexOf(segs, 'deps') + 1;
    if (!i) i = 0;
    path = segs.slice(0, i + 1).join('/') + '/deps/' + path;
    return path;
  };

  /**
   * Check if module is defined at `path`.
   */

  localRequire.exists = function(path) {
    return require.modules.hasOwnProperty(localRequire.resolve(path));
  };

  return localRequire;
};
require.register("visionmedia-jade/lib/runtime.js", Function("exports, require, module",
"\n\
/*!\n\
 * Jade - runtime\n\
 * Copyright(c) 2010 TJ Holowaychuk <tj@vision-media.ca>\n\
 * MIT Licensed\n\
 */\n\
\n\
/**\n\
 * Lame Array.isArray() polyfill for now.\n\
 */\n\
\n\
if (!Array.isArray) {\n\
  Array.isArray = function(arr){\n\
    return '[object Array]' == Object.prototype.toString.call(arr);\n\
  };\n\
}\n\
\n\
/**\n\
 * Lame Object.keys() polyfill for now.\n\
 */\n\
\n\
if (!Object.keys) {\n\
  Object.keys = function(obj){\n\
    var arr = [];\n\
    for (var key in obj) {\n\
      if (obj.hasOwnProperty(key)) {\n\
        arr.push(key);\n\
      }\n\
    }\n\
    return arr;\n\
  }\n\
}\n\
\n\
/**\n\
 * Merge two attribute objects giving precedence\n\
 * to values in object `b`. Classes are special-cased\n\
 * allowing for arrays and merging/joining appropriately\n\
 * resulting in a string.\n\
 *\n\
 * @param {Object} a\n\
 * @param {Object} b\n\
 * @return {Object} a\n\
 * @api private\n\
 */\n\
\n\
exports.merge = function merge(a, b) {\n\
  var ac = a['class'];\n\
  var bc = b['class'];\n\
\n\
  if (ac || bc) {\n\
    ac = ac || [];\n\
    bc = bc || [];\n\
    if (!Array.isArray(ac)) ac = [ac];\n\
    if (!Array.isArray(bc)) bc = [bc];\n\
    a['class'] = ac.concat(bc).filter(nulls);\n\
  }\n\
\n\
  for (var key in b) {\n\
    if (key != 'class') {\n\
      a[key] = b[key];\n\
    }\n\
  }\n\
\n\
  return a;\n\
};\n\
\n\
/**\n\
 * Filter null `val`s.\n\
 *\n\
 * @param {*} val\n\
 * @return {Boolean}\n\
 * @api private\n\
 */\n\
\n\
function nulls(val) {\n\
  return val != null && val !== '';\n\
}\n\
\n\
/**\n\
 * join array as classes.\n\
 *\n\
 * @param {*} val\n\
 * @return {String}\n\
 * @api private\n\
 */\n\
\n\
function joinClasses(val) {\n\
  return Array.isArray(val) ? val.map(joinClasses).filter(nulls).join(' ') : val;\n\
}\n\
\n\
/**\n\
 * Render the given classes.\n\
 *\n\
 * @param {Array} classes\n\
 * @param {Array.<Boolean>} escaped\n\
 * @return {String}\n\
 */\n\
exports.cls = function cls(classes, escaped) {\n\
  var buf = [];\n\
  for (var i = 0; i < classes.length; i++) {\n\
    if (escaped && escaped[i]) {\n\
      buf.push(exports.escape(joinClasses([classes[i]])));\n\
    } else {\n\
      buf.push(joinClasses(classes[i]));\n\
    }\n\
  }\n\
  var text = joinClasses(buf);\n\
  if (text.length) {\n\
    return ' class=\"' + text + '\"';\n\
  } else {\n\
    return '';\n\
  }\n\
};\n\
\n\
/**\n\
 * Render the given attribute.\n\
 *\n\
 * @param {String} key\n\
 * @param {String} val\n\
 * @param {Boolean} escaped\n\
 * @param {Boolean} terse\n\
 * @return {String}\n\
 */\n\
exports.attr = function attr(key, val, escaped, terse) {\n\
  if ('boolean' == typeof val || null == val) {\n\
    if (val) {\n\
      return ' ' + (terse ? key : key + '=\"' + key + '\"');\n\
    } else {\n\
      return '';\n\
    }\n\
  } else if (0 == key.indexOf('data') && 'string' != typeof val) {\n\
    return ' ' + key + \"='\" + JSON.stringify(val).replace(/'/g, '&apos;') + \"'\";\n\
  } else if (escaped) {\n\
    return ' ' + key + '=\"' + exports.escape(val) + '\"';\n\
  } else {\n\
    return ' ' + key + '=\"' + val + '\"';\n\
  }\n\
};\n\
\n\
/**\n\
 * Render the given attributes object.\n\
 *\n\
 * @param {Object} obj\n\
 * @param {Object} escaped\n\
 * @return {String}\n\
 */\n\
exports.attrs = function attrs(obj, escaped, terse){\n\
  var buf = [];\n\
\n\
  var keys = Object.keys(obj);\n\
\n\
  if (keys.length) {\n\
    for (var i = 0; i < keys.length; ++i) {\n\
      var key = keys[i]\n\
        , val = obj[key];\n\
\n\
      if ('class' == key) {\n\
        if (val = joinClasses(val)) {\n\
          if (escaped && escaped[key]){\n\
            buf.push(' ' + key + '=\"' + exports.escape(val) + '\"');\n\
          } else {\n\
            buf.push(' ' + key + '=\"' + val + '\"');\n\
          }\n\
        }\n\
      } else {\n\
        buf.push(exports.attr(key, val, escaped && escaped[key], terse));\n\
      }\n\
    }\n\
  }\n\
\n\
  return buf.join('');\n\
};\n\
\n\
/**\n\
 * Escape the given string of `html`.\n\
 *\n\
 * @param {String} html\n\
 * @return {String}\n\
 * @api private\n\
 */\n\
\n\
exports.escape = function escape(html){\n\
  return String(html)\n\
    .replace(/&/g, '&amp;')\n\
    .replace(/</g, '&lt;')\n\
    .replace(/>/g, '&gt;')\n\
    .replace(/\"/g, '&quot;');\n\
};\n\
\n\
/**\n\
 * Re-throw the given `err` in context to the\n\
 * the jade in `filename` at the given `lineno`.\n\
 *\n\
 * @param {Error} err\n\
 * @param {String} filename\n\
 * @param {String} lineno\n\
 * @api private\n\
 */\n\
\n\
exports.rethrow = function rethrow(err, filename, lineno, str){\n\
  if (!(err instanceof Error)) throw err;\n\
  if ((typeof window != 'undefined' || !filename) && !str) {\n\
    err.message += ' on line ' + lineno;\n\
    throw err;\n\
  }\n\
  try {\n\
    str =  str || require('fs').readFileSync(filename, 'utf8')\n\
  } catch (ex) {\n\
    rethrow(err, null, lineno)\n\
  }\n\
  var context = 3\n\
    , lines = str.split('\\n\
')\n\
    , start = Math.max(lineno - context, 0)\n\
    , end = Math.min(lines.length, lineno + context);\n\
\n\
  // Error context\n\
  var context = lines.slice(start, end).map(function(line, i){\n\
    var curr = i + start + 1;\n\
    return (curr == lineno ? '  > ' : '    ')\n\
      + curr\n\
      + '| '\n\
      + line;\n\
  }).join('\\n\
');\n\
\n\
  // Alter exception message\n\
  err.path = filename;\n\
  err.message = (filename || 'Jade') + ':' + lineno\n\
    + '\\n\
' + context + '\\n\
\\n\
' + err.message;\n\
  throw err;\n\
};\n\
//@ sourceURL=visionmedia-jade/lib/runtime.js"
));
require.register("jaredly-xon/index.js", Function("exports, require, module",
"\n\
var lib = require('./lib')\n\
\n\
module.exports = lib.resolve\n\
\n\
for (var name in lib.bound) {\n\
  module.exports[name] = lib.bound[name]\n\
}\n\
\n\
module.exports.register = function (name, fn) {\n\
  if (arguments.length === 1) {\n\
    fn = name\n\
    name = fn.name\n\
  }\n\
  module.exports[name] = lib.binder(fn)\n\
}\n\
//@ sourceURL=jaredly-xon/index.js"
));
require.register("jaredly-xon/lib/index.js", Function("exports, require, module",
"// people\n\
\n\
var consts = require('./consts')\n\
  , image = require('./image')\n\
\n\
var helpers = {\n\
  ObjectId: function (len) {\n\
    var id = ''\n\
      , chars = 'abcdef0123456789'\n\
    len = len || 32\n\
    for (var i=0; i<len; i++) {\n\
      id += helpers.choice(chars)\n\
    }\n\
    return id\n\
  },\n\
  image: image,\n\
  choice: function (items) {\n\
    return items[helpers.randInt(items.length)]\n\
  },\n\
  fullName: function (/*maxlen*/) {\n\
    // maxlen = maxlen || 23\n\
    return helpers.choice(consts.name.first) + ' ' + helpers.choice(consts.name.last)\n\
  },\n\
  randInt: function (min, max) {\n\
    if (arguments.length === 1) {\n\
      max = min\n\
      min = 0\n\
    }\n\
    return parseInt(Math.random() * (max - min)) + min\n\
  },\n\
  city: function () {\n\
    return helpers.choice(consts.cities)\n\
  },\n\
  /*\n\
  lipsum: function (min, max) {\n\
    return consts.lipsum.split(' ').slice(0, helpers.randInt(min, max)).join(' ')\n\
  },\n\
  image: function (width, height) {\n\
  },\n\
  */\n\
  some: function (min, max, fix) {\n\
    var num, results = []\n\
    if (arguments.length === 2) {\n\
      fix = max\n\
      num = min\n\
    } else {\n\
      num = helpers.randInt(min, max + 1)\n\
    }\n\
    for (var i=0; i<num; i++) {\n\
      results.push(resolve(fix))\n\
    }\n\
    return results\n\
  }\n\
}\n\
\n\
function binder(fn) {\n\
  return function () {\n\
    var args = arguments\n\
      , self = this\n\
      , res = function () {\n\
          return fn.apply(self, args)\n\
        }\n\
    res._bound_fixture = true\n\
    return res\n\
  }\n\
}\n\
\n\
var bound = {}\n\
for (var name in helpers) {\n\
  bound[name] = binder(helpers[name])\n\
}\n\
\n\
function resolve(fix) {\n\
  if ('function' === typeof fix && fix._bound_fixture) {\n\
    return fix()\n\
  }\n\
  if ('object' !== typeof fix) return fix\n\
  if (Array.isArray(fix)) {\n\
    return fix.map(resolve)\n\
  }\n\
  var res = {}\n\
  for (var name in fix) {\n\
    res[name] = resolve(fix[name])\n\
  }\n\
  return res\n\
}\n\
\n\
module.exports = {\n\
  helpers: helpers,\n\
  resolve: resolve,\n\
  binder: binder,\n\
  bound: bound\n\
}\n\
\n\
//@ sourceURL=jaredly-xon/lib/index.js"
));
require.register("jaredly-xon/lib/image.js", Function("exports, require, module",
"\n\
var _cache = {}\n\
\n\
function text_size(width, height, template) {\n\
  height = parseInt(height, 10);\n\
  width = parseInt(width, 10);\n\
  var bigSide = Math.max(height, width)\n\
  var smallSide = Math.min(height, width)\n\
  var scale = 1 / 12;\n\
  var newHeight = Math.min(smallSide * 0.75, 0.75 * bigSide * scale);\n\
  return {\n\
    height: Math.round(Math.max(template.size, newHeight))\n\
  }\n\
}\n\
\n\
var canvas = document.createElement('canvas');\n\
var ctx = canvas.getContext(\"2d\");\n\
\n\
module.exports = function (width, height, text) {\n\
  var args = {\n\
    dimensions: {\n\
      width: width,\n\
      height: height\n\
    },\n\
    template: {\n\
      background: \"#aaa\",\n\
      foreground: '#fff',\n\
      text: text\n\
    },\n\
    ratio: 1\n\
  }\n\
  var key = JSON.stringify(args)\n\
  if (_cache[key]) return _cache[key]\n\
  var dimensions = args.dimensions;\n\
  var template = args.template;\n\
  var ratio = args.ratio;\n\
\n\
  var ts = text_size(dimensions.width, dimensions.height, template);\n\
  var text_height = ts.height;\n\
  var width = dimensions.width * ratio,\n\
  height = dimensions.height * ratio;\n\
  var font = template.font ? template.font : \"Arial,Helvetica,sans-serif\";\n\
  canvas.width = width;\n\
  canvas.height = height;\n\
  ctx.textAlign = \"center\";\n\
  ctx.textBaseline = \"middle\";\n\
  ctx.fillStyle = template.background;\n\
  ctx.fillRect(0, 0, width, height);\n\
  ctx.fillStyle = template.foreground;\n\
  ctx.font = \"bold \" + text_height + \"px \" + font;\n\
  var text = template.text ? template.text : (Math.floor(dimensions.width) + \"x\" + Math.floor(dimensions.height));\n\
  var text_width = ctx.measureText(text).width;\n\
  if (text_width / width >= 0.75) {\n\
    text_height = Math.floor(text_height * 0.75 * (width / text_width));\n\
  }\n\
  //Resetting font size if necessary\n\
  ctx.font = \"bold \" + (text_height * ratio) + \"px \" + font;\n\
  ctx.fillText(text, (width / 2), (height / 2), width);\n\
  var dataUrl =  canvas.toDataURL(\"image/png\");\n\
  _cache[key] = dataUrl;\n\
  return dataUrl\n\
}\n\
//@ sourceURL=jaredly-xon/lib/image.js"
));
require.register("jaredly-xon/lib/consts.js", Function("exports, require, module",
"\n\
var consts = module.exports = {\n\
  name: {\n\
    male: ['James', 'John', 'Peter', 'Sam', 'Kevin', 'Joseph', 'Luke', 'Nephi'],\n\
    female: ['Samantha', 'Jane', 'Judy', 'Anna', 'Maria', 'Lucy', 'Lisa', 'Daphne', 'Pollyanna'],\n\
    last: ['Smith', 'Jorgensen', 'Kaiser', 'Brown', 'Olsen', 'Neuman', 'Frank', 'Schwartz']\n\
  },\n\
  cities: ['Budabest', 'Boston', 'Detroit', 'Paris', 'Athens', 'New Orleans', 'Moscow', 'Berlin', 'San Jose', 'Monta Ray']\n\
}\n\
consts.name.first = consts.name.female.concat(consts.name.male)\n\
\n\
//@ sourceURL=jaredly-xon/lib/consts.js"
));
require.register("component-indexof/index.js", Function("exports, require, module",
"module.exports = function(arr, obj){\n\
  if (arr.indexOf) return arr.indexOf(obj);\n\
  for (var i = 0; i < arr.length; ++i) {\n\
    if (arr[i] === obj) return i;\n\
  }\n\
  return -1;\n\
};//@ sourceURL=component-indexof/index.js"
));
require.register("component-emitter/index.js", Function("exports, require, module",
"\n\
/**\n\
 * Module dependencies.\n\
 */\n\
\n\
var index = require('indexof');\n\
\n\
/**\n\
 * Expose `Emitter`.\n\
 */\n\
\n\
module.exports = Emitter;\n\
\n\
/**\n\
 * Initialize a new `Emitter`.\n\
 *\n\
 * @api public\n\
 */\n\
\n\
function Emitter(obj) {\n\
  if (obj) return mixin(obj);\n\
};\n\
\n\
/**\n\
 * Mixin the emitter properties.\n\
 *\n\
 * @param {Object} obj\n\
 * @return {Object}\n\
 * @api private\n\
 */\n\
\n\
function mixin(obj) {\n\
  for (var key in Emitter.prototype) {\n\
    obj[key] = Emitter.prototype[key];\n\
  }\n\
  return obj;\n\
}\n\
\n\
/**\n\
 * Listen on the given `event` with `fn`.\n\
 *\n\
 * @param {String} event\n\
 * @param {Function} fn\n\
 * @return {Emitter}\n\
 * @api public\n\
 */\n\
\n\
Emitter.prototype.on =\n\
Emitter.prototype.addEventListener = function(event, fn){\n\
  this._callbacks = this._callbacks || {};\n\
  (this._callbacks[event] = this._callbacks[event] || [])\n\
    .push(fn);\n\
  return this;\n\
};\n\
\n\
/**\n\
 * Adds an `event` listener that will be invoked a single\n\
 * time then automatically removed.\n\
 *\n\
 * @param {String} event\n\
 * @param {Function} fn\n\
 * @return {Emitter}\n\
 * @api public\n\
 */\n\
\n\
Emitter.prototype.once = function(event, fn){\n\
  var self = this;\n\
  this._callbacks = this._callbacks || {};\n\
\n\
  function on() {\n\
    self.off(event, on);\n\
    fn.apply(this, arguments);\n\
  }\n\
\n\
  fn._off = on;\n\
  this.on(event, on);\n\
  return this;\n\
};\n\
\n\
/**\n\
 * Remove the given callback for `event` or all\n\
 * registered callbacks.\n\
 *\n\
 * @param {String} event\n\
 * @param {Function} fn\n\
 * @return {Emitter}\n\
 * @api public\n\
 */\n\
\n\
Emitter.prototype.off =\n\
Emitter.prototype.removeListener =\n\
Emitter.prototype.removeAllListeners =\n\
Emitter.prototype.removeEventListener = function(event, fn){\n\
  this._callbacks = this._callbacks || {};\n\
\n\
  // all\n\
  if (0 == arguments.length) {\n\
    this._callbacks = {};\n\
    return this;\n\
  }\n\
\n\
  // specific event\n\
  var callbacks = this._callbacks[event];\n\
  if (!callbacks) return this;\n\
\n\
  // remove all handlers\n\
  if (1 == arguments.length) {\n\
    delete this._callbacks[event];\n\
    return this;\n\
  }\n\
\n\
  // remove specific handler\n\
  var i = index(callbacks, fn._off || fn);\n\
  if (~i) callbacks.splice(i, 1);\n\
  return this;\n\
};\n\
\n\
/**\n\
 * Emit `event` with the given args.\n\
 *\n\
 * @param {String} event\n\
 * @param {Mixed} ...\n\
 * @return {Emitter}\n\
 */\n\
\n\
Emitter.prototype.emit = function(event){\n\
  this._callbacks = this._callbacks || {};\n\
  var args = [].slice.call(arguments, 1)\n\
    , callbacks = this._callbacks[event];\n\
\n\
  if (callbacks) {\n\
    callbacks = callbacks.slice(0);\n\
    for (var i = 0, len = callbacks.length; i < len; ++i) {\n\
      callbacks[i].apply(this, args);\n\
    }\n\
  }\n\
\n\
  return this;\n\
};\n\
\n\
/**\n\
 * Return array of callbacks for `event`.\n\
 *\n\
 * @param {String} event\n\
 * @return {Array}\n\
 * @api public\n\
 */\n\
\n\
Emitter.prototype.listeners = function(event){\n\
  this._callbacks = this._callbacks || {};\n\
  return this._callbacks[event] || [];\n\
};\n\
\n\
/**\n\
 * Check if this emitter has `event` handlers.\n\
 *\n\
 * @param {String} event\n\
 * @return {Boolean}\n\
 * @api public\n\
 */\n\
\n\
Emitter.prototype.hasListeners = function(event){\n\
  return !! this.listeners(event).length;\n\
};\n\
//@ sourceURL=component-emitter/index.js"
));
require.register("component-query/index.js", Function("exports, require, module",
"\n\
function one(selector, el) {\n\
  return el.querySelector(selector);\n\
}\n\
\n\
exports = module.exports = function(selector, el){\n\
  el = el || document;\n\
  return one(selector, el);\n\
};\n\
\n\
exports.all = function(selector, el){\n\
  el = el || document;\n\
  return el.querySelectorAll(selector);\n\
};\n\
\n\
exports.engine = function(obj){\n\
  if (!obj.one) throw new Error('.one callback required');\n\
  if (!obj.all) throw new Error('.all callback required');\n\
  one = obj.one;\n\
  exports.all = obj.all;\n\
};\n\
//@ sourceURL=component-query/index.js"
));
require.register("component-event/index.js", Function("exports, require, module",
"\n\
/**\n\
 * Bind `el` event `type` to `fn`.\n\
 *\n\
 * @param {Element} el\n\
 * @param {String} type\n\
 * @param {Function} fn\n\
 * @param {Boolean} capture\n\
 * @return {Function}\n\
 * @api public\n\
 */\n\
\n\
exports.bind = function(el, type, fn, capture){\n\
  if (el.addEventListener) {\n\
    el.addEventListener(type, fn, capture);\n\
  } else {\n\
    el.attachEvent('on' + type, fn);\n\
  }\n\
  return fn;\n\
};\n\
\n\
/**\n\
 * Unbind `el` event `type`'s callback `fn`.\n\
 *\n\
 * @param {Element} el\n\
 * @param {String} type\n\
 * @param {Function} fn\n\
 * @param {Boolean} capture\n\
 * @return {Function}\n\
 * @api public\n\
 */\n\
\n\
exports.unbind = function(el, type, fn, capture){\n\
  if (el.removeEventListener) {\n\
    el.removeEventListener(type, fn, capture);\n\
  } else {\n\
    el.detachEvent('on' + type, fn);\n\
  }\n\
  return fn;\n\
};\n\
//@ sourceURL=component-event/index.js"
));
require.register("component-event-manager/index.js", Function("exports, require, module",
"\n\
\n\
/**\n\
 * Expose `EventManager`.\n\
 */\n\
\n\
module.exports = EventManager;\n\
\n\
/**\n\
 * Initialize an `EventManager` with the given\n\
 * `target` object which events will be bound to,\n\
 * and the `obj` which will receive method calls.\n\
 *\n\
 * @param {Object} target\n\
 * @param {Object} obj\n\
 * @api public\n\
 */\n\
\n\
function EventManager(target, obj) {\n\
  this.target = target;\n\
  this.obj = obj;\n\
  this._bindings = {};\n\
}\n\
\n\
/**\n\
 * Register bind function.\n\
 *\n\
 * @param {Function} fn\n\
 * @return {EventManager} self\n\
 * @api public\n\
 */\n\
\n\
EventManager.prototype.onbind = function(fn){\n\
  this._bind = fn;\n\
  return this;\n\
};\n\
\n\
/**\n\
 * Register unbind function.\n\
 *\n\
 * @param {Function} fn\n\
 * @return {EventManager} self\n\
 * @api public\n\
 */\n\
\n\
EventManager.prototype.onunbind = function(fn){\n\
  this._unbind = fn;\n\
  return this;\n\
};\n\
\n\
/**\n\
 * Bind to `event` with optional `method` name.\n\
 * When `method` is undefined it becomes `event`\n\
 * with the \"on\" prefix.\n\
 *\n\
 *    events.bind('login') // implies \"onlogin\"\n\
 *    events.bind('login', 'onLogin')\n\
 *\n\
 * @param {String} event\n\
 * @param {String} [method]\n\
 * @return {EventManager}\n\
 * @api public\n\
 */\n\
\n\
EventManager.prototype.bind = function(event, method){\n\
  var obj = this.obj;\n\
  var method = method || 'on' + event;\n\
  var args = [].slice.call(arguments, 2);\n\
\n\
  // callback\n\
  function callback() {\n\
    var a = [].slice.call(arguments).concat(args);\n\
    obj[method].apply(obj, a);\n\
  }\n\
\n\
  // subscription\n\
  this._bindings[event] = this._bindings[event] || {};\n\
  this._bindings[event][method] = callback;\n\
\n\
  // bind\n\
  this._bind(event, callback);\n\
\n\
  return this;\n\
};\n\
\n\
/**\n\
 * Unbind a single binding, all bindings for `event`,\n\
 * or all bindings within the manager.\n\
 *\n\
 *     evennts.unbind('login', 'onLogin')\n\
 *     evennts.unbind('login')\n\
 *     evennts.unbind()\n\
 *\n\
 * @param {String} [event]\n\
 * @param {String} [method]\n\
 * @api public\n\
 */\n\
\n\
EventManager.prototype.unbind = function(event, method){\n\
  if (0 == arguments.length) return this.unbindAll();\n\
  if (1 == arguments.length) return this.unbindAllOf(event);\n\
  var fn = this._bindings[event][method];\n\
  this._unbind(event, fn);\n\
};\n\
\n\
/**\n\
 * Unbind all events.\n\
 *\n\
 * @api private\n\
 */\n\
\n\
EventManager.prototype.unbindAll = function(){\n\
  for (var event in this._bindings) {\n\
    this.unbindAllOf(event);\n\
  }\n\
};\n\
\n\
/**\n\
 * Unbind all events for `event`.\n\
 *\n\
 * @param {String} event\n\
 * @api private\n\
 */\n\
\n\
EventManager.prototype.unbindAllOf = function(event){\n\
  var bindings = this._bindings[event];\n\
  if (!bindings) return;\n\
  for (var method in bindings) {\n\
    this.unbind(event, method);\n\
  }\n\
};\n\
//@ sourceURL=component-event-manager/index.js"
));
require.register("component-events/index.js", Function("exports, require, module",
"\n\
/**\n\
 * Module dependencies.\n\
 */\n\
\n\
var Manager = require('event-manager')\n\
  , event = require('event');\n\
\n\
/**\n\
 * Return a new event manager.\n\
 */\n\
\n\
module.exports = function(target, obj){\n\
  var manager = new Manager(target, obj);\n\
\n\
  manager.onbind(function(name, fn){\n\
    event.bind(target, name, fn);\n\
  });\n\
\n\
  manager.onunbind(function(name, fn){\n\
    event.unbind(target, name, fn);\n\
  });\n\
\n\
  return manager;\n\
};\n\
//@ sourceURL=component-events/index.js"
));
require.register("component-domify/index.js", Function("exports, require, module",
"\n\
/**\n\
 * Expose `parse`.\n\
 */\n\
\n\
module.exports = parse;\n\
\n\
/**\n\
 * Wrap map from jquery.\n\
 */\n\
\n\
var map = {\n\
  option: [1, '<select multiple=\"multiple\">', '</select>'],\n\
  optgroup: [1, '<select multiple=\"multiple\">', '</select>'],\n\
  legend: [1, '<fieldset>', '</fieldset>'],\n\
  thead: [1, '<table>', '</table>'],\n\
  tbody: [1, '<table>', '</table>'],\n\
  tfoot: [1, '<table>', '</table>'],\n\
  colgroup: [1, '<table>', '</table>'],\n\
  caption: [1, '<table>', '</table>'],\n\
  tr: [2, '<table><tbody>', '</tbody></table>'],\n\
  td: [3, '<table><tbody><tr>', '</tr></tbody></table>'],\n\
  th: [3, '<table><tbody><tr>', '</tr></tbody></table>'],\n\
  col: [2, '<table><tbody></tbody><colgroup>', '</colgroup></table>'],\n\
  _default: [0, '', '']\n\
};\n\
\n\
/**\n\
 * Parse `html` and return the children.\n\
 *\n\
 * @param {String} html\n\
 * @return {Array}\n\
 * @api private\n\
 */\n\
\n\
function parse(html) {\n\
  if ('string' != typeof html) throw new TypeError('String expected');\n\
\n\
  // tag name\n\
  var m = /<([\\w:]+)/.exec(html);\n\
  if (!m) throw new Error('No elements were generated.');\n\
  var tag = m[1];\n\
\n\
  // body support\n\
  if (tag == 'body') {\n\
    var el = document.createElement('html');\n\
    el.innerHTML = html;\n\
    return el.removeChild(el.lastChild);\n\
  }\n\
\n\
  // wrap map\n\
  var wrap = map[tag] || map._default;\n\
  var depth = wrap[0];\n\
  var prefix = wrap[1];\n\
  var suffix = wrap[2];\n\
  var el = document.createElement('div');\n\
  el.innerHTML = prefix + html + suffix;\n\
  while (depth--) el = el.lastChild;\n\
\n\
  var els = el.children;\n\
  if (1 == els.length) {\n\
    return el.removeChild(els[0]);\n\
  }\n\
\n\
  var fragment = document.createDocumentFragment();\n\
  while (els.length) {\n\
    fragment.appendChild(el.removeChild(els[0]));\n\
  }\n\
\n\
  return fragment;\n\
}\n\
//@ sourceURL=component-domify/index.js"
));
require.register("component-classes/index.js", Function("exports, require, module",
"\n\
/**\n\
 * Module dependencies.\n\
 */\n\
\n\
var index = require('indexof');\n\
\n\
/**\n\
 * Whitespace regexp.\n\
 */\n\
\n\
var re = /\\s+/;\n\
\n\
/**\n\
 * toString reference.\n\
 */\n\
\n\
var toString = Object.prototype.toString;\n\
\n\
/**\n\
 * Wrap `el` in a `ClassList`.\n\
 *\n\
 * @param {Element} el\n\
 * @return {ClassList}\n\
 * @api public\n\
 */\n\
\n\
module.exports = function(el){\n\
  return new ClassList(el);\n\
};\n\
\n\
/**\n\
 * Initialize a new ClassList for `el`.\n\
 *\n\
 * @param {Element} el\n\
 * @api private\n\
 */\n\
\n\
function ClassList(el) {\n\
  this.el = el;\n\
  this.list = el.classList;\n\
}\n\
\n\
/**\n\
 * Add class `name` if not already present.\n\
 *\n\
 * @param {String} name\n\
 * @return {ClassList}\n\
 * @api public\n\
 */\n\
\n\
ClassList.prototype.add = function(name){\n\
  // classList\n\
  if (this.list) {\n\
    this.list.add(name);\n\
    return this;\n\
  }\n\
\n\
  // fallback\n\
  var arr = this.array();\n\
  var i = index(arr, name);\n\
  if (!~i) arr.push(name);\n\
  this.el.className = arr.join(' ');\n\
  return this;\n\
};\n\
\n\
/**\n\
 * Remove class `name` when present, or\n\
 * pass a regular expression to remove\n\
 * any which match.\n\
 *\n\
 * @param {String|RegExp} name\n\
 * @return {ClassList}\n\
 * @api public\n\
 */\n\
\n\
ClassList.prototype.remove = function(name){\n\
  if ('[object RegExp]' == toString.call(name)) {\n\
    return this.removeMatching(name);\n\
  }\n\
\n\
  // classList\n\
  if (this.list) {\n\
    this.list.remove(name);\n\
    return this;\n\
  }\n\
\n\
  // fallback\n\
  var arr = this.array();\n\
  var i = index(arr, name);\n\
  if (~i) arr.splice(i, 1);\n\
  this.el.className = arr.join(' ');\n\
  return this;\n\
};\n\
\n\
/**\n\
 * Remove all classes matching `re`.\n\
 *\n\
 * @param {RegExp} re\n\
 * @return {ClassList}\n\
 * @api private\n\
 */\n\
\n\
ClassList.prototype.removeMatching = function(re){\n\
  var arr = this.array();\n\
  for (var i = 0; i < arr.length; i++) {\n\
    if (re.test(arr[i])) {\n\
      this.remove(arr[i]);\n\
    }\n\
  }\n\
  return this;\n\
};\n\
\n\
/**\n\
 * Toggle class `name`.\n\
 *\n\
 * @param {String} name\n\
 * @return {ClassList}\n\
 * @api public\n\
 */\n\
\n\
ClassList.prototype.toggle = function(name){\n\
  // classList\n\
  if (this.list) {\n\
    this.list.toggle(name);\n\
    return this;\n\
  }\n\
\n\
  // fallback\n\
  if (this.has(name)) {\n\
    this.remove(name);\n\
  } else {\n\
    this.add(name);\n\
  }\n\
  return this;\n\
};\n\
\n\
/**\n\
 * Return an array of classes.\n\
 *\n\
 * @return {Array}\n\
 * @api public\n\
 */\n\
\n\
ClassList.prototype.array = function(){\n\
  var str = this.el.className.replace(/^\\s+|\\s+$/g, '');\n\
  var arr = str.split(re);\n\
  if ('' === arr[0]) arr.shift();\n\
  return arr;\n\
};\n\
\n\
/**\n\
 * Check if class `name` is present.\n\
 *\n\
 * @param {String} name\n\
 * @return {ClassList}\n\
 * @api public\n\
 */\n\
\n\
ClassList.prototype.has =\n\
ClassList.prototype.contains = function(name){\n\
  return this.list\n\
    ? this.list.contains(name)\n\
    : !! ~index(this.array(), name);\n\
};\n\
//@ sourceURL=component-classes/index.js"
));
require.register("component-css/index.js", Function("exports, require, module",
"\n\
/**\n\
 * Properties to ignore appending \"px\".\n\
 */\n\
\n\
var ignore = {\n\
  columnCount: true,\n\
  fillOpacity: true,\n\
  fontWeight: true,\n\
  lineHeight: true,\n\
  opacity: true,\n\
  orphans: true,\n\
  widows: true,\n\
  zIndex: true,\n\
  zoom: true\n\
};\n\
\n\
/**\n\
 * Set `el` css values.\n\
 *\n\
 * @param {Element} el\n\
 * @param {Object} obj\n\
 * @return {Element}\n\
 * @api public\n\
 */\n\
\n\
module.exports = function(el, obj){\n\
  for (var key in obj) {\n\
    var val = obj[key];\n\
    if ('number' == typeof val && !ignore[key]) val += 'px';\n\
    el.style[key] = val;\n\
  }\n\
  return el;\n\
};\n\
//@ sourceURL=component-css/index.js"
));
require.register("enyo-domready/index.js", Function("exports, require, module",
"/*!\n\
 * Copyright (c) 2012 Matias Meno <m@tias.me>\n\
 * \n\
 * Original code (c) by Dustin Diaz 2012 - License MIT\n\
 */\n\
\n\
\n\
/**\n\
 * Expose `domready`.\n\
 */\n\
\n\
module.exports = domready;\n\
\n\
\n\
/**\n\
 *\n\
 * Cross browser implementation of the domready event\n\
 *\n\
 * @param {Function} ready - the callback to be invoked as soon as the dom is fully loaded.\n\
 * @api public\n\
 */\n\
\n\
function domready(ready) {\n\
 var fns = [], fn, f = false\n\
    , doc = document\n\
    , testEl = doc.documentElement\n\
    , hack = testEl.doScroll\n\
    , domContentLoaded = 'DOMContentLoaded'\n\
    , addEventListener = 'addEventListener'\n\
    , onreadystatechange = 'onreadystatechange'\n\
    , readyState = 'readyState'\n\
    , loaded = /^loade|c/.test(doc[readyState])\n\
\n\
  function flush(f) {\n\
    loaded = 1\n\
    while (f = fns.shift()) f()\n\
  }\n\
\n\
  doc[addEventListener] && doc[addEventListener](domContentLoaded, fn = function () {\n\
    doc.removeEventListener(domContentLoaded, fn, f)\n\
    flush()\n\
  }, f)\n\
\n\
\n\
  hack && doc.attachEvent(onreadystatechange, fn = function () {\n\
    if (/^c/.test(doc[readyState])) {\n\
      doc.detachEvent(onreadystatechange, fn)\n\
      flush()\n\
    }\n\
  })\n\
\n\
  return (ready = hack ?\n\
    function (fn) {\n\
      self != top ?\n\
        loaded ? fn() : fns.push(fn) :\n\
        function () {\n\
          try {\n\
            testEl.doScroll('left')\n\
          } catch (e) {\n\
            return setTimeout(function() { ready(fn) }, 50)\n\
          }\n\
          fn()\n\
        }()\n\
    } :\n\
    function (fn) {\n\
      loaded ? fn() : fns.push(fn)\n\
    })\n\
}//@ sourceURL=enyo-domready/index.js"
));
require.register("component-inherit/index.js", Function("exports, require, module",
"\n\
module.exports = function(a, b){\n\
  var fn = function(){};\n\
  fn.prototype = b.prototype;\n\
  a.prototype = new fn;\n\
  a.prototype.constructor = a;\n\
};//@ sourceURL=component-inherit/index.js"
));
require.register("timoxley-assert/index.js", Function("exports, require, module",
"// http://wiki.commonjs.org/wiki/Unit_Testing/1.0\n\
//\n\
// THIS IS NOT TESTED NOR LIKELY TO WORK OUTSIDE V8!\n\
//\n\
// Originally from narwhal.js (http://narwhaljs.org)\n\
// Copyright (c) 2009 Thomas Robinson <280north.com>\n\
//\n\
// Permission is hereby granted, free of charge, to any person obtaining a copy\n\
// of this software and associated documentation files (the 'Software'), to\n\
// deal in the Software without restriction, including without limitation the\n\
// rights to use, copy, modify, merge, publish, distribute, sublicense, and/or\n\
// sell copies of the Software, and to permit persons to whom the Software is\n\
// furnished to do so, subject to the following conditions:\n\
//\n\
// The above copyright notice and this permission notice shall be included in\n\
// all copies or substantial portions of the Software.\n\
//\n\
// THE SOFTWARE IS PROVIDED 'AS IS', WITHOUT WARRANTY OF ANY KIND, EXPRESS OR\n\
// IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,\n\
// FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE\n\
// AUTHORS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN\n\
// ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION\n\
// WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.\n\
\n\
\n\
// Adapted for browser components by Tim Oxley\n\
// from https://github.com/joyent/node/blob/72bc4dcda4cfa99ed064419e40d104bd1b2e0e25/lib/assert.js\n\
\n\
// UTILITY\n\
var inherit = require('inherit');\n\
var pSlice = Array.prototype.slice;\n\
\n\
// 1. The assert module provides functions that throw\n\
// AssertionError's when particular conditions are not met. The\n\
// assert module must conform to the following interface.\n\
\n\
var assert = module.exports = ok;\n\
\n\
// 2. The AssertionError is defined in assert.\n\
// new assert.AssertionError({ message: message,\n\
//                             actual: actual,\n\
//                             expected: expected })\n\
\n\
assert.AssertionError = function AssertionError(options) {\n\
  this.name = 'AssertionError';\n\
  this.message = options.message;\n\
  this.actual = options.actual;\n\
  this.expected = options.expected;\n\
  this.operator = options.operator;\n\
  var stackStartFunction = options.stackStartFunction || fail;\n\
\n\
  if (Error.captureStackTrace) {\n\
    Error.captureStackTrace(this, stackStartFunction);\n\
  }\n\
};\n\
\n\
// assert.AssertionError instanceof Error\n\
inherit(assert.AssertionError, Error);\n\
\n\
function replacer(key, value) {\n\
  if (value === undefined) {\n\
    return '' + value;\n\
  }\n\
  if (typeof value === 'number' && (isNaN(value) || !isFinite(value))) {\n\
    return value.toString();\n\
  }\n\
  if (typeof value === 'function' || value instanceof RegExp) {\n\
    return value.toString();\n\
  }\n\
  return value;\n\
}\n\
\n\
function truncate(s, n) {\n\
  if (typeof s == 'string') {\n\
    return s.length < n ? s : s.slice(0, n);\n\
  } else {\n\
    return s;\n\
  }\n\
}\n\
\n\
assert.AssertionError.prototype.toString = function() {\n\
  if (this.message) {\n\
    return [this.name + ':', this.message].join(' ');\n\
  } else {\n\
    return [\n\
      this.name + ':',\n\
      truncate(JSON.stringify(this.actual, replacer), 128),\n\
      this.operator,\n\
      truncate(JSON.stringify(this.expected, replacer), 128)\n\
    ].join(' ');\n\
  }\n\
};\n\
\n\
// At present only the three keys mentioned above are used and\n\
// understood by the spec. Implementations or sub modules can pass\n\
// other keys to the AssertionError's constructor - they will be\n\
// ignored.\n\
\n\
// 3. All of the following functions must throw an AssertionError\n\
// when a corresponding condition is not met, with a message that\n\
// may be undefined if not provided.  All assertion methods provide\n\
// both the actual and expected values to the assertion error for\n\
// display purposes.\n\
\n\
function fail(actual, expected, message, operator, stackStartFunction) {\n\
  throw new assert.AssertionError({\n\
    message: message,\n\
    actual: actual,\n\
    expected: expected,\n\
    operator: operator,\n\
    stackStartFunction: stackStartFunction\n\
  });\n\
}\n\
\n\
// EXTENSION! allows for well behaved errors defined elsewhere.\n\
assert.fail = fail;\n\
\n\
// 4. Pure assertion tests whether a value is truthy, as determined\n\
// by !!guard.\n\
// assert.ok(guard, message_opt);\n\
// This statement is equivalent to assert.equal(true, !!guard,\n\
// message_opt);. To test strictly for the value true, use\n\
// assert.strictEqual(true, guard, message_opt);.\n\
\n\
function ok(value, message) {\n\
  if (!!!value) fail(value, true, message, '==', assert.ok);\n\
}\n\
assert.ok = ok;\n\
\n\
// 5. The equality assertion tests shallow, coercive equality with\n\
// ==.\n\
// assert.equal(actual, expected, message_opt);\n\
\n\
assert.equal = function equal(actual, expected, message) {\n\
  if (actual != expected) fail(actual, expected, message, '==', assert.equal);\n\
};\n\
\n\
// 6. The non-equality assertion tests for whether two objects are not equal\n\
// with != assert.notEqual(actual, expected, message_opt);\n\
\n\
assert.notEqual = function notEqual(actual, expected, message) {\n\
  if (actual == expected) {\n\
    fail(actual, expected, message, '!=', assert.notEqual);\n\
  }\n\
};\n\
\n\
// 7. The equivalence assertion tests a deep equality relation.\n\
// assert.deepEqual(actual, expected, message_opt);\n\
\n\
assert.deepEqual = function deepEqual(actual, expected, message) {\n\
  if (!_deepEqual(actual, expected)) {\n\
    fail(actual, expected, message, 'deepEqual', assert.deepEqual);\n\
  }\n\
};\n\
\n\
function _deepEqual(actual, expected) {\n\
  // 7.1. All identical values are equivalent, as determined by ===.\n\
  if (actual === expected) {\n\
    return true;\n\
\n\
  // 7.2. If the expected value is a Date object, the actual value is\n\
  // equivalent if it is also a Date object that refers to the same time.\n\
  } else if (actual instanceof Date && expected instanceof Date) {\n\
    return actual.getTime() === expected.getTime();\n\
\n\
  // 7.3 If the expected value is a RegExp object, the actual value is\n\
  // equivalent if it is also a RegExp object with the same source and\n\
  // properties (`global`, `multiline`, `lastIndex`, `ignoreCase`).\n\
  } else if (actual instanceof RegExp && expected instanceof RegExp) {\n\
    return actual.source === expected.source &&\n\
           actual.global === expected.global &&\n\
           actual.multiline === expected.multiline &&\n\
           actual.lastIndex === expected.lastIndex &&\n\
           actual.ignoreCase === expected.ignoreCase;\n\
\n\
  // 7.4. Other pairs that do not both pass typeof value == 'object',\n\
  // equivalence is determined by ==.\n\
  } else if (typeof actual != 'object' && typeof expected != 'object') {\n\
    return actual == expected;\n\
\n\
  // 7.5 For all other Object pairs, including Array objects, equivalence is\n\
  // determined by having the same number of owned properties (as verified\n\
  // with Object.prototype.hasOwnProperty.call), the same set of keys\n\
  // (although not necessarily the same order), equivalent values for every\n\
  // corresponding key, and an identical 'prototype' property. Note: this\n\
  // accounts for both named and indexed properties on Arrays.\n\
  } else {\n\
    return objEquiv(actual, expected);\n\
  }\n\
}\n\
\n\
function isUndefinedOrNull(value) {\n\
  return value === null || value === undefined;\n\
}\n\
\n\
function isArguments(object) {\n\
  return Object.prototype.toString.call(object) == '[object Arguments]';\n\
}\n\
\n\
function objEquiv(a, b) {\n\
  if (isUndefinedOrNull(a) || isUndefinedOrNull(b))\n\
    return false;\n\
  // an identical 'prototype' property.\n\
  if (a.prototype !== b.prototype) return false;\n\
  //~~~I've managed to break Object.keys through screwy arguments passing.\n\
  //   Converting to array solves the problem.\n\
  if (isArguments(a)) {\n\
    if (!isArguments(b)) {\n\
      return false;\n\
    }\n\
    a = pSlice.call(a);\n\
    b = pSlice.call(b);\n\
    return _deepEqual(a, b);\n\
  }\n\
  try {\n\
    var ka = Object.keys(a),\n\
        kb = Object.keys(b),\n\
        key, i;\n\
  } catch (e) {//happens when one is a string literal and the other isn't\n\
    return false;\n\
  }\n\
  // having the same number of owned properties (keys incorporates\n\
  // hasOwnProperty)\n\
  if (ka.length != kb.length)\n\
    return false;\n\
  //the same set of keys (although not necessarily the same order),\n\
  ka.sort();\n\
  kb.sort();\n\
  //~~~cheap key test\n\
  for (i = ka.length - 1; i >= 0; i--) {\n\
    if (ka[i] != kb[i])\n\
      return false;\n\
  }\n\
  //equivalent values for every corresponding key, and\n\
  //~~~possibly expensive deep test\n\
  for (i = ka.length - 1; i >= 0; i--) {\n\
    key = ka[i];\n\
    if (!_deepEqual(a[key], b[key])) return false;\n\
  }\n\
  return true;\n\
}\n\
\n\
// 8. The non-equivalence assertion tests for any deep inequality.\n\
// assert.notDeepEqual(actual, expected, message_opt);\n\
\n\
assert.notDeepEqual = function notDeepEqual(actual, expected, message) {\n\
  if (_deepEqual(actual, expected)) {\n\
    fail(actual, expected, message, 'notDeepEqual', assert.notDeepEqual);\n\
  }\n\
};\n\
\n\
// 9. The strict equality assertion tests strict equality, as determined by ===.\n\
// assert.strictEqual(actual, expected, message_opt);\n\
\n\
assert.strictEqual = function strictEqual(actual, expected, message) {\n\
  if (actual !== expected) {\n\
    fail(actual, expected, message, '===', assert.strictEqual);\n\
  }\n\
};\n\
\n\
// 10. The strict non-equality assertion tests for strict inequality, as\n\
// determined by !==.  assert.notStrictEqual(actual, expected, message_opt);\n\
\n\
assert.notStrictEqual = function notStrictEqual(actual, expected, message) {\n\
  if (actual === expected) {\n\
    fail(actual, expected, message, '!==', assert.notStrictEqual);\n\
  }\n\
};\n\
\n\
function expectedException(actual, expected) {\n\
  if (!actual || !expected) {\n\
    return false;\n\
  }\n\
\n\
  if (expected instanceof RegExp) {\n\
    return expected.test(actual);\n\
  } else if (actual instanceof expected) {\n\
    return true;\n\
  } else if (expected.call({}, actual) === true) {\n\
    return true;\n\
  }\n\
\n\
  return false;\n\
}\n\
\n\
function _throws(shouldThrow, block, expected, message) {\n\
  var actual;\n\
\n\
  if (typeof expected === 'string') {\n\
    message = expected;\n\
    expected = null;\n\
  }\n\
\n\
  try {\n\
    block();\n\
  } catch (e) {\n\
    actual = e;\n\
  }\n\
\n\
  message = (expected && expected.name ? ' (' + expected.name + ').' : '.') +\n\
            (message ? ' ' + message : '.');\n\
\n\
  if (shouldThrow && !actual) {\n\
    fail(actual, expected, 'Missing expected exception' + message);\n\
  }\n\
\n\
  if (!shouldThrow && expectedException(actual, expected)) {\n\
    fail(actual, expected, 'Got unwanted exception' + message);\n\
  }\n\
\n\
  if ((shouldThrow && actual && expected &&\n\
      !expectedException(actual, expected)) || (!shouldThrow && actual)) {\n\
    throw actual;\n\
  }\n\
}\n\
\n\
// 11. Expected to throw an error:\n\
// assert.throws(block, Error_opt, message_opt);\n\
\n\
assert.throws = function(block, /*optional*/error, /*optional*/message) {\n\
  _throws.apply(this, [true].concat(pSlice.call(arguments)));\n\
};\n\
\n\
// EXTENSION! This is annoying to write outside this module.\n\
assert.doesNotThrow = function(block, /*optional*/message) {\n\
  _throws.apply(this, [false].concat(pSlice.call(arguments)));\n\
};\n\
\n\
assert.ifError = function(err) { if (err) {throw err;}};\n\
//@ sourceURL=timoxley-assert/index.js"
));
require.register("timoxley-dom-support/index.js", Function("exports, require, module",
"var domready = require('domready')()\n\
\n\
module.exports = (function() {\n\
\n\
\tvar support,\n\
\t\tall,\n\
\t\ta,\n\
\t\tselect,\n\
\t\topt,\n\
\t\tinput,\n\
\t\tfragment,\n\
\t\teventName,\n\
\t\ti,\n\
\t\tisSupported,\n\
\t\tclickFn,\n\
\t\tdiv = document.createElement(\"div\");\n\
\n\
\t// Setup\n\
\tdiv.setAttribute( \"className\", \"t\" );\n\
\tdiv.innerHTML = \"  <link/><table></table><a href='/a'>a</a><input type='checkbox'/>\";\n\
\n\
\t// Support tests won't run in some limited or non-browser environments\n\
\tall = div.getElementsByTagName(\"*\");\n\
\ta = div.getElementsByTagName(\"a\")[ 0 ];\n\
\tif ( !all || !a || !all.length ) {\n\
\t\treturn {};\n\
\t}\n\
\n\
\t// First batch of tests\n\
\tselect = document.createElement(\"select\");\n\
\topt = select.appendChild( document.createElement(\"option\") );\n\
\tinput = div.getElementsByTagName(\"input\")[ 0 ];\n\
\n\
\ta.style.cssText = \"top:1px;float:left;opacity:.5\";\n\
\tsupport = {\n\
\t\t// IE strips leading whitespace when .innerHTML is used\n\
\t\tleadingWhitespace: ( div.firstChild.nodeType === 3 ),\n\
\n\
\t\t// Make sure that tbody elements aren't automatically inserted\n\
\t\t// IE will insert them into empty tables\n\
\t\ttbody: !div.getElementsByTagName(\"tbody\").length,\n\
\n\
\t\t// Make sure that link elements get serialized correctly by innerHTML\n\
\t\t// This requires a wrapper element in IE\n\
\t\thtmlSerialize: !!div.getElementsByTagName(\"link\").length,\n\
\n\
\t\t// Get the style information from getAttribute\n\
\t\t// (IE uses .cssText instead)\n\
\t\tstyle: /top/.test( a.getAttribute(\"style\") ),\n\
\n\
\t\t// Make sure that URLs aren't manipulated\n\
\t\t// (IE normalizes it by default)\n\
\t\threfNormalized: ( a.getAttribute(\"href\") === \"/a\" ),\n\
\n\
\t\t// Make sure that element opacity exists\n\
\t\t// (IE uses filter instead)\n\
\t\t// Use a regex to work around a WebKit issue. See #5145\n\
\t\topacity: /^0.5/.test( a.style.opacity ),\n\
\n\
\t\t// Verify style float existence\n\
\t\t// (IE uses styleFloat instead of cssFloat)\n\
\t\tcssFloat: !!a.style.cssFloat,\n\
\n\
\t\t// Make sure that if no value is specified for a checkbox\n\
\t\t// that it defaults to \"on\".\n\
\t\t// (WebKit defaults to \"\" instead)\n\
\t\tcheckOn: ( input.value === \"on\" ),\n\
\n\
\t\t// Make sure that a selected-by-default option has a working selected property.\n\
\t\t// (WebKit defaults to false instead of true, IE too, if it's in an optgroup)\n\
\t\toptSelected: opt.selected,\n\
\n\
\t\t// Test setAttribute on camelCase class. If it works, we need attrFixes when doing get/setAttribute (ie6/7)\n\
\t\tgetSetAttribute: div.className !== \"t\",\n\
\n\
\t\t// Tests for enctype support on a form (#6743)\n\
\t\tenctype: !!document.createElement(\"form\").enctype,\n\
\n\
\t\t// Makes sure cloning an html5 element does not cause problems\n\
\t\t// Where outerHTML is undefined, this still works\n\
\t\thtml5Clone: document.createElement(\"nav\").cloneNode( true ).outerHTML !== \"<:nav></:nav>\",\n\
\n\
\t\t// jQuery.support.boxModel DEPRECATED in 1.8 since we don't support Quirks Mode\n\
\t\tboxModel: ( document.compatMode === \"CSS1Compat\" ),\n\
\n\
\t\t// Will be defined later\n\
\t\tsubmitBubbles: true,\n\
\t\tchangeBubbles: true,\n\
\t\tfocusinBubbles: false,\n\
\t\tdeleteExpando: true,\n\
\t\tnoCloneEvent: true,\n\
\t\tinlineBlockNeedsLayout: false,\n\
\t\tshrinkWrapBlocks: false,\n\
\t\treliableMarginRight: true,\n\
\t\tboxSizingReliable: true,\n\
\t\tpixelPosition: false\n\
\t};\n\
\n\
\t// Make sure checked status is properly cloned\n\
\tinput.checked = true;\n\
\tsupport.noCloneChecked = input.cloneNode( true ).checked;\n\
\n\
\t// Make sure that the options inside disabled selects aren't marked as disabled\n\
\t// (WebKit marks them as disabled)\n\
\tselect.disabled = true;\n\
\tsupport.optDisabled = !opt.disabled;\n\
\n\
\t// Test to see if it's possible to delete an expando from an element\n\
\t// Fails in Internet Explorer\n\
\ttry {\n\
\t\tdelete div.test;\n\
\t} catch( e ) {\n\
\t\tsupport.deleteExpando = false;\n\
\t}\n\
\n\
\tif ( !div.addEventListener && div.attachEvent && div.fireEvent ) {\n\
\t\tdiv.attachEvent( \"onclick\", clickFn = function() {\n\
\t\t\t// Cloning a node shouldn't copy over any\n\
\t\t\t// bound event handlers (IE does this)\n\
\t\t\tsupport.noCloneEvent = false;\n\
\t\t});\n\
\t\tdiv.cloneNode( true ).fireEvent(\"onclick\");\n\
\t\tdiv.detachEvent( \"onclick\", clickFn );\n\
\t}\n\
\n\
\t// Check if a radio maintains its value\n\
\t// after being appended to the DOM\n\
\tinput = document.createElement(\"input\");\n\
\tinput.value = \"t\";\n\
\tinput.setAttribute( \"type\", \"radio\" );\n\
\tsupport.radioValue = input.value === \"t\";\n\
\n\
\tinput.setAttribute( \"checked\", \"checked\" );\n\
\n\
\t// #11217 - WebKit loses check when the name is after the checked attribute\n\
\tinput.setAttribute( \"name\", \"t\" );\n\
\n\
\tdiv.appendChild( input );\n\
\tfragment = document.createDocumentFragment();\n\
\tfragment.appendChild( div.lastChild );\n\
\n\
\t// WebKit doesn't clone checked state correctly in fragments\n\
\tsupport.checkClone = fragment.cloneNode( true ).cloneNode( true ).lastChild.checked;\n\
\n\
\t// Check if a disconnected checkbox will retain its checked\n\
\t// value of true after appended to the DOM (IE6/7)\n\
\tsupport.appendChecked = input.checked;\n\
\n\
\tfragment.removeChild( input );\n\
\tfragment.appendChild( div );\n\
\n\
\t// Technique from Juriy Zaytsev\n\
\t// http://perfectionkills.com/detecting-event-support-without-browser-sniffing/\n\
\t// We only care about the case where non-standard event systems\n\
\t// are used, namely in IE. Short-circuiting here helps us to\n\
\t// avoid an eval call (in setAttribute) which can cause CSP\n\
\t// to go haywire. See: https://developer.mozilla.org/en/Security/CSP\n\
\tif ( !div.addEventListener ) {\n\
\t\tfor ( i in {\n\
\t\t\tsubmit: true,\n\
\t\t\tchange: true,\n\
\t\t\tfocusin: true\n\
\t\t}) {\n\
\t\t\teventName = \"on\" + i;\n\
\t\t\tisSupported = ( eventName in div );\n\
\t\t\tif ( !isSupported ) {\n\
\t\t\t\tdiv.setAttribute( eventName, \"return;\" );\n\
\t\t\t\tisSupported = ( typeof div[ eventName ] === \"function\" );\n\
\t\t\t}\n\
\t\t\tsupport[ i + \"Bubbles\" ] = isSupported;\n\
\t\t}\n\
\t}\n\
\n\
\t// Run tests that need a body at doc ready\n\
\tdomready(function() {\n\
\t\tvar container, div, tds, marginDiv,\n\
\t\t\tdivReset = \"padding:0;margin:0;border:0;display:block;overflow:hidden;box-sizing:content-box;-moz-box-sizing:content-box;-webkit-box-sizing:content-box;\",\n\
\t\t\tbody = document.getElementsByTagName(\"body\")[0];\n\
\n\
\t\tif ( !body ) {\n\
\t\t\t// Return for frameset docs that don't have a body\n\
\t\t\treturn;\n\
\t\t}\n\
\n\
\t\tcontainer = document.createElement(\"div\");\n\
\t\tcontainer.style.cssText = \"visibility:hidden;border:0;width:0;height:0;position:static;top:0;margin-top:1px\";\n\
\t\tbody.insertBefore( container, body.firstChild );\n\
\n\
\t\t// Construct the test element\n\
\t\tdiv = document.createElement(\"div\");\n\
\t\tcontainer.appendChild( div );\n\
\n\
    //Check if table cells still have offsetWidth/Height when they are set\n\
    //to display:none and there are still other visible table cells in a\n\
    //table row; if so, offsetWidth/Height are not reliable for use when\n\
    //determining if an element has been hidden directly using\n\
    //display:none (it is still safe to use offsets if a parent element is\n\
    //hidden; don safety goggles and see bug #4512 for more information).\n\
    //(only IE 8 fails this test)\n\
\t\tdiv.innerHTML = \"<table><tr><td></td><td>t</td></tr></table>\";\n\
\t\ttds = div.getElementsByTagName(\"td\");\n\
\t\ttds[ 0 ].style.cssText = \"padding:0;margin:0;border:0;display:none\";\n\
\t\tisSupported = ( tds[ 0 ].offsetHeight === 0 );\n\
\n\
\t\ttds[ 0 ].style.display = \"\";\n\
\t\ttds[ 1 ].style.display = \"none\";\n\
\n\
\t\t// Check if empty table cells still have offsetWidth/Height\n\
\t\t// (IE <= 8 fail this test)\n\
\t\tsupport.reliableHiddenOffsets = isSupported && ( tds[ 0 ].offsetHeight === 0 );\n\
\n\
\t\t// Check box-sizing and margin behavior\n\
\t\tdiv.innerHTML = \"\";\n\
\t\tdiv.style.cssText = \"box-sizing:border-box;-moz-box-sizing:border-box;-webkit-box-sizing:border-box;padding:1px;border:1px;display:block;width:4px;margin-top:1%;position:absolute;top:1%;\";\n\
\t\tsupport.boxSizing = ( div.offsetWidth === 4 );\n\
\t\tsupport.doesNotIncludeMarginInBodyOffset = ( body.offsetTop !== 1 );\n\
\n\
\t\t// NOTE: To any future maintainer, we've window.getComputedStyle\n\
\t\t// because jsdom on node.js will break without it.\n\
\t\tif ( window.getComputedStyle ) {\n\
\t\t\tsupport.pixelPosition = ( window.getComputedStyle( div, null ) || {} ).top !== \"1%\";\n\
\t\t\tsupport.boxSizingReliable = ( window.getComputedStyle( div, null ) || { width: \"4px\" } ).width === \"4px\";\n\
\n\
\t\t\t// Check if div with explicit width and no margin-right incorrectly\n\
\t\t\t// gets computed margin-right based on width of container. For more\n\
\t\t\t// info see bug #3333\n\
\t\t\t// Fails in WebKit before Feb 2011 nightlies\n\
\t\t\t// WebKit Bug 13343 - getComputedStyle returns wrong value for margin-right\n\
\t\t\tmarginDiv = document.createElement(\"div\");\n\
\t\t\tmarginDiv.style.cssText = div.style.cssText = divReset;\n\
\t\t\tmarginDiv.style.marginRight = marginDiv.style.width = \"0\";\n\
\t\t\tdiv.style.width = \"1px\";\n\
\t\t\tdiv.appendChild( marginDiv );\n\
\t\t\tsupport.reliableMarginRight =\n\
\t\t\t\t!parseFloat( ( window.getComputedStyle( marginDiv, null ) || {} ).marginRight );\n\
\t\t}\n\
\n\
\t\tif ( typeof div.style.zoom !== \"undefined\" ) {\n\
\t\t\t// Check if natively block-level elements act like inline-block\n\
\t\t\t// elements when setting their display to 'inline' and giving\n\
\t\t\t// them layout\n\
\t\t\t// (IE < 8 does this)\n\
\t\t\tdiv.innerHTML = \"\";\n\
\t\t\tdiv.style.cssText = divReset + \"width:1px;padding:1px;display:inline;zoom:1\";\n\
\t\t\tsupport.inlineBlockNeedsLayout = ( div.offsetWidth === 3 );\n\
\n\
\t\t\t// Check if elements with layout shrink-wrap their children\n\
\t\t\t// (IE 6 does this)\n\
\t\t\tdiv.style.display = \"block\";\n\
\t\t\tdiv.style.overflow = \"visible\";\n\
\t\t\tdiv.innerHTML = \"<div></div>\";\n\
\t\t\tdiv.firstChild.style.width = \"5px\";\n\
\t\t\tsupport.shrinkWrapBlocks = ( div.offsetWidth !== 3 );\n\
\n\
\t\t\tcontainer.style.zoom = 1;\n\
\t\t}\n\
\n\
\t\t// Null elements to avoid leaks in IE\n\
\t\tbody.removeChild( container );\n\
\t\tcontainer = div = tds = marginDiv = null;\n\
\t});\n\
\n\
\t// Null elements to avoid leaks in IE\n\
\tfragment.removeChild( div );\n\
\tall = a = select = opt = input = fragment = div = null;\n\
\n\
\treturn support;\n\
})();\n\
\n\
//@ sourceURL=timoxley-dom-support/index.js"
));
require.register("component-within-document/index.js", Function("exports, require, module",
"\n\
/**\n\
 * Check if `el` is within the document.\n\
 *\n\
 * @param {Element} el\n\
 * @return {Boolean}\n\
 * @api private\n\
 */\n\
\n\
module.exports = function(el) {\n\
  var node = el;\n\
  while (node = node.parentNode) {\n\
    if (node == document) return true;\n\
  }\n\
  return false;\n\
};//@ sourceURL=component-within-document/index.js"
));
require.register("timoxley-offset/index.js", Function("exports, require, module",
"var support = require('dom-support')\n\
var contains = require('within-document')\n\
\n\
module.exports = function offset(el) {\n\
\tvar box = { top: 0, left: 0 }\n\
  var doc = el && el.ownerDocument\n\
\n\
\tif (!doc) {\n\
    console.warn('no document!')\n\
\t\treturn\n\
\t}\n\
\n\
\t// Make sure it's not a disconnected DOM node\n\
\tif (!contains(el)) {\n\
\t\treturn box\n\
\t}\n\
\n\
  var body = doc.body\n\
\tif (body === el) {\n\
\t\treturn bodyOffset(el)\n\
\t}\n\
\n\
\tvar docEl = doc.documentElement\n\
\n\
\t// If we don't have gBCR, just use 0,0 rather than error\n\
\t// BlackBerry 5, iOS 3 (original iPhone)\n\
\tif ( typeof el.getBoundingClientRect !== \"undefined\" ) {\n\
\t\tbox = el.getBoundingClientRect()\n\
\t}\n\
\n\
\tvar clientTop  = docEl.clientTop  || body.clientTop  || 0\n\
\tvar clientLeft = docEl.clientLeft || body.clientLeft || 0\n\
\tvar scrollTop  = window.pageYOffset || docEl.scrollTop\n\
\tvar scrollLeft = window.pageXOffset || docEl.scrollLeft\n\
\n\
\treturn {\n\
\t\ttop: box.top  + scrollTop  - clientTop,\n\
\t\tleft: box.left + scrollLeft - clientLeft\n\
\t}\n\
}\n\
\n\
function bodyOffset(body) {\n\
\tvar top = body.offsetTop\n\
\tvar left = body.offsetLeft\n\
\n\
\tif (support.doesNotIncludeMarginInBodyOffset) {\n\
\t\ttop  += parseFloat(body.style.marginTop || 0)\n\
\t\tleft += parseFloat(body.style.marginLeft || 0)\n\
\t}\n\
\n\
\treturn {\n\
    top: top,\n\
    left: left\n\
  }\n\
}\n\
//@ sourceURL=timoxley-offset/index.js"
));
require.register("component-tip/index.js", Function("exports, require, module",
"\n\
/**\n\
 * Module dependencies.\n\
 */\n\
\n\
var Emitter = require('emitter');\n\
var events = require('events');\n\
var query = require('query');\n\
var domify = require('domify');\n\
var classes = require('classes');\n\
var css = require('css');\n\
var html = domify(require('./template'));\n\
var offset = require('offset');\n\
\n\
/**\n\
 * Expose `Tip`.\n\
 */\n\
\n\
module.exports = Tip;\n\
\n\
/**\n\
 * Apply the average use-case of simply\n\
 * showing a tool-tip on `el` hover.\n\
 *\n\
 * Options:\n\
 *\n\
 *  - `delay` hide delay in milliseconds [0]\n\
 *  - `value` defaulting to the element's title attribute\n\
 *\n\
 * @param {Mixed} elem\n\
 * @param {Object|String} options or value\n\
 * @api public\n\
 */\n\
\n\
function tip(elem, options) {\n\
  if ('string' == typeof options) options = { value : options };\n\
  var els = ('string' == typeof elem) ? query.all(elem) : [elem];\n\
  for(var i = 0, el; el = els[i]; i++) {\n\
    var val = options.value || el.getAttribute('title');\n\
    var tip = new Tip(val);\n\
    el.setAttribute('title', '');\n\
    tip.cancelHideOnHover();\n\
    tip.attach(el);\n\
  }\n\
}\n\
\n\
/**\n\
 * Initialize a `Tip` with the given `content`.\n\
 *\n\
 * @param {Mixed} content\n\
 * @api public\n\
 */\n\
\n\
function Tip(content, options) {\n\
  options = options || {};\n\
  if (!(this instanceof Tip)) return tip(content, options);\n\
  Emitter.call(this);\n\
  this.classname = '';\n\
  this.delay = options.delay || 300;\n\
  this.el = html.cloneNode(true);\n\
  this.events = events(this.el, this);\n\
  this.winEvents = events(window, this);\n\
  this.classes = classes(this.el);\n\
  this.inner = query('.tip-inner', this.el);\n\
  this.message(content);\n\
  this.position('south');\n\
  if (Tip.effect) this.effect(Tip.effect);\n\
}\n\
\n\
/**\n\
 * Mixin emitter.\n\
 */\n\
\n\
Emitter(Tip.prototype);\n\
\n\
/**\n\
 * Set tip `content`.\n\
 *\n\
 * @param {String|jQuery|Element} content\n\
 * @return {Tip} self\n\
 * @api public\n\
 */\n\
\n\
Tip.prototype.message = function(content){\n\
  this.inner.innerHTML = content;\n\
  return this;\n\
};\n\
\n\
/**\n\
 * Attach to the given `el` with optional hide `delay`.\n\
 *\n\
 * @param {Element} el\n\
 * @param {Number} delay\n\
 * @return {Tip}\n\
 * @api public\n\
 */\n\
\n\
Tip.prototype.attach = function(el){\n\
  var self = this;\n\
  this.target = el;\n\
  this.handleEvents = events(el, this);\n\
  this.handleEvents.bind('mouseover');\n\
  this.handleEvents.bind('mouseout');\n\
  return this;\n\
};\n\
\n\
/**\n\
 * On mouse over\n\
 *\n\
 * @param {Event} e\n\
 * @return {Tip}\n\
 * @api private\n\
 */\n\
\n\
Tip.prototype.onmouseover = function() {\n\
  this.show(this.target);\n\
  this.cancelHide();\n\
};\n\
\n\
/**\n\
 * On mouse out\n\
 *\n\
 * @param {Event} e\n\
 * @return {Tip}\n\
 * @api private\n\
 */\n\
\n\
Tip.prototype.onmouseout = function() {\n\
  this.hide(this.delay);\n\
};\n\
\n\
/**\n\
 * Cancel hide on hover, hide with the given `delay`.\n\
 *\n\
 * @param {Number} delay\n\
 * @return {Tip}\n\
 * @api public\n\
 */\n\
\n\
Tip.prototype.cancelHideOnHover = function(){\n\
  this.events.bind('mouseover', 'cancelHide');\n\
  this.events.bind('mouseout', 'hide');\n\
  return this;\n\
};\n\
\n\
/**\n\
 * Set the effect to `type`.\n\
 *\n\
 * @param {String} type\n\
 * @return {Tip}\n\
 * @api public\n\
 */\n\
\n\
Tip.prototype.effect = function(type){\n\
  this._effect = type;\n\
  this.classes.add(type);\n\
  return this;\n\
};\n\
\n\
/**\n\
 * Set position:\n\
 *\n\
 *  - `north`\n\
 *  - `north east`\n\
 *  - `north west`\n\
 *  - `south`\n\
 *  - `south east`\n\
 *  - `south west`\n\
 *  - `east`\n\
 *  - `west`\n\
 *\n\
 * @param {String} pos\n\
 * @param {Object} options\n\
 * @return {Tip}\n\
 * @api public\n\
 */\n\
\n\
Tip.prototype.position = function(pos, options){\n\
  options = options || {};\n\
  this._position = pos;\n\
  this._auto = false != options.auto;\n\
  this.replaceClass(pos);\n\
  return this;\n\
};\n\
\n\
/**\n\
 * Show the tip attached to `el`.\n\
 *\n\
 * Emits \"show\" (el) event.\n\
 *\n\
 * @param {String|Element|Number} el or x\n\
 * @param {Number} [y]\n\
 * @return {Tip}\n\
 * @api public\n\
 */\n\
\n\
Tip.prototype.show = function(el){\n\
  if ('string' == typeof el) el = query(el);\n\
\n\
  // show it\n\
  this.target = el;\n\
  document.body.appendChild(this.el);\n\
  this.classes.add('tip-' + this._position.replace(/\\s+/g, '-'));\n\
  this.classes.remove('tip-hide');\n\
\n\
  // x,y\n\
  if ('number' == typeof el) {\n\
    var x = arguments[0];\n\
    var y = arguments[1];\n\
    this.emit('show');\n\
    css(this.el, {\n\
      top: y,\n\
      left: x\n\
    });\n\
    return this;\n\
  }\n\
\n\
  // el\n\
  this.reposition();\n\
  this.emit('show', this.target);\n\
\n\
  this.winEvents.bind('resize', 'reposition');\n\
  this.winEvents.bind('scroll', 'reposition');\n\
\n\
  return this;\n\
};\n\
\n\
/**\n\
 * Reposition the tip if necessary.\n\
 *\n\
 * @api private\n\
 */\n\
\n\
Tip.prototype.reposition = function(){\n\
  var pos = this._position;\n\
  var off = this.offset(pos);\n\
  var newpos = this._auto && this.suggested(pos, off);\n\
  if (newpos) off = this.offset(pos = newpos);\n\
  this.replaceClass(pos);\n\
  css(this.el, off);\n\
};\n\
\n\
/**\n\
 * Compute the \"suggested\" position favouring `pos`.\n\
 * Returns undefined if no suggestion is made.\n\
 *\n\
 * @param {String} pos\n\
 * @param {Object} offset\n\
 * @return {String}\n\
 * @api private\n\
 */\n\
\n\
Tip.prototype.suggested = function(pos, off){\n\
  var el = this.el;\n\
\n\
  var ew = el.clientWidth;\n\
  var eh = el.clientHeight;\n\
  var top = window.scrollY;\n\
  var left = window.scrollX;\n\
  var w = window.innerWidth;\n\
  var h = window.innerHeight;\n\
\n\
  // too high\n\
  if (off.top < top) return 'north';\n\
\n\
  // too low\n\
  if (off.top + eh > top + h) return 'south';\n\
\n\
  // too far to the right\n\
  if (off.left + ew > left + w) return 'east';\n\
\n\
  // too far to the left\n\
  if (off.left < left) return 'west';\n\
};\n\
\n\
/**\n\
 * Replace position class `name`.\n\
 *\n\
 * @param {String} name\n\
 * @api private\n\
 */\n\
\n\
Tip.prototype.replaceClass = function(name){\n\
  name = name.split(' ').join('-');\n\
  this.el.setAttribute('class', this.classname + ' tip tip-' + name + ' ' + this._effect);\n\
};\n\
\n\
/**\n\
 * Compute the offset for `.target`\n\
 * based on the given `pos`.\n\
 *\n\
 * @param {String} pos\n\
 * @return {Object}\n\
 * @api private\n\
 */\n\
\n\
Tip.prototype.offset = function(pos){\n\
  var pad = 15;\n\
  var el = this.el;\n\
  var target = this.target;\n\
\n\
  var ew = el.clientWidth;\n\
  var eh = el.clientHeight;\n\
\n\
  var to = offset(target);\n\
  var tw = target.clientWidth;\n\
  var th = target.clientHeight;\n\
\n\
  switch (pos) {\n\
    case 'south':\n\
      return {\n\
        top: to.top - eh,\n\
        left: to.left + tw / 2 - ew / 2\n\
      }\n\
    case 'north west':\n\
      return {\n\
        top: to.top + th,\n\
        left: to.left + tw / 2 - pad\n\
      }\n\
    case 'north east':\n\
      return {\n\
        top: to.top + th,\n\
        left: to.left + tw / 2 - ew + pad\n\
      }\n\
    case 'north':\n\
      return {\n\
        top: to.top + th,\n\
        left: to.left + tw / 2 - ew / 2\n\
      }\n\
    case 'south west':\n\
      return {\n\
        top: to.top - eh,\n\
        left: to.left + tw / 2 - pad\n\
      }\n\
    case 'south east':\n\
      return {\n\
        top: to.top - eh,\n\
        left: to.left + tw / 2 - ew + pad\n\
      }\n\
    case 'west':\n\
      return {\n\
        top: to.top + th / 2 - eh / 2,\n\
        left: to.left + tw\n\
      }\n\
    case 'east':\n\
      return {\n\
        top: to.top + th / 2 - eh / 2,\n\
        left: to.left - ew\n\
      }\n\
    default:\n\
      throw new Error('invalid position \"' + pos + '\"');\n\
  }\n\
};\n\
\n\
/**\n\
 * Cancel the `.hide()` timeout.\n\
 *\n\
 * @api private\n\
 */\n\
\n\
Tip.prototype.cancelHide = function(){\n\
  clearTimeout(this._hide);\n\
};\n\
\n\
/**\n\
 * Hide the tip with optional `ms` delay.\n\
 *\n\
 * Emits \"hide\" event.\n\
 *\n\
 * @param {Number} ms\n\
 * @return {Tip}\n\
 * @api public\n\
 */\n\
\n\
Tip.prototype.hide = function(ms){\n\
  var self = this;\n\
\n\
  // duration\n\
  if (ms) {\n\
    this._hide = setTimeout(this.hide.bind(this), ms);\n\
    return this;\n\
  }\n\
\n\
  // hide\n\
  this.classes.add('tip-hide');\n\
  if (this._effect) {\n\
    setTimeout(this.remove.bind(this), 300);\n\
  } else {\n\
    self.remove();\n\
  }\n\
\n\
  return this;\n\
};\n\
\n\
/**\n\
 * Hide the tip without potential animation.\n\
 *\n\
 * @return {Tip}\n\
 * @api\n\
 */\n\
\n\
Tip.prototype.remove = function(){\n\
  this.winEvents.unbind('resize', 'reposition');\n\
  this.winEvents.unbind('scroll', 'reposition');\n\
  this.emit('hide');\n\
\n\
  var parent = this.el.parentNode;\n\
  if (parent) parent.removeChild(this.el);\n\
  return this;\n\
};\n\
//@ sourceURL=component-tip/index.js"
));
require.register("component-tip/template.js", Function("exports, require, module",
"module.exports = '<div class=\"tip tip-hide\">\\n\
  <div class=\"tip-arrow\"></div>\\n\
  <div class=\"tip-inner\"></div>\\n\
</div>';//@ sourceURL=component-tip/template.js"
));

require.register("jazzui/client/index.js", Function("exports, require, module",
"/* globals angular: true, window: true, document: true */\n\
\n\
var xon = require('xon')\n\
  , Tip = require('tip')\n\
\n\
  , Manager = require('./manager')\n\
  , LocalStore = require('./store').LocalStore\n\
\n\
  , tpls = require('./tpls')\n\
  , utils = require('./utils')\n\
\n\
\n\
angular.module('helpers', []).factory('manager', function () {\n\
  return new Manager(document)\n\
}).directive(\"toggle\", function() {\n\
  return {\n\
    restrict: \"A\",\n\
    link: function(scope, element, attrs) {\n\
      if (attrs.toggle.indexOf('tooltip') !== 0) return;\n\
      var tip\n\
      , direction = attrs.toggle.split('-')[1] || undefined\n\
      setTimeout(function() {\n\
        tip = utils.tipMe(element[0], element.attr('title'), direction)\n\
      }, 0);\n\
      attrs.$observe('title', function () {\n\
        if (tip) tip.message(element.attr('title'))\n\
      });\n\
      scope.$on('$destroy', function () {\n\
        tip.hide()\n\
      });\n\
    }\n\
  };\n\
})\n\
\n\
function MainController (manager, $scope, store) {\n\
  // $scope.docTitle = 'Untitled'\n\
  $scope.zoomLevel = 80;\n\
\n\
  var hash = utils.initHash(window.location.hash)\n\
  store.currentHash = hash\n\
\n\
  function load(hash) {\n\
    $scope.loading = true\n\
    store.get(hash, function (err, title, data, cached) {\n\
      $scope.loading = false\n\
      mirrors.stylus.setValue(data.stylus || tpls.stylus)\n\
      mirrors.jade.setValue(data.jade || tpls.jade)\n\
      mirrors.xon.setValue(data.xon || tpls.xon)\n\
      $scope.docTitle = title || 'Untitled'\n\
      if (!cached) $scope.$digest()\n\
    })\n\
  }\n\
\n\
  window.addEventListener('hashchange', function () {\n\
    if ('#' + hash == window.location.hash) return\n\
    hash = utils.initHash(window.location.hash)\n\
    store.currentHash = hash\n\
    load(hash)\n\
    $scope.$digest()\n\
  })\n\
\n\
  manager.zoomIt = function (el) {\n\
    el.style.zoom = $scope.zoomLevel + '%';\n\
  }\n\
\n\
  $scope.$watch('docTitle', utils.debounce(function (value, prev) {\n\
    if (!value) return\n\
    // if (!prev && value === 'Untitled') return\n\
    var data = {\n\
      modified: new Date()\n\
    }\n\
    store.saveName(hash, value, function (err) {\n\
      window.location.hash = hash\n\
    })\n\
  }))\n\
\n\
  $scope.getModifiedTime = function (doc) {\n\
    return doc.modified.getTime()\n\
  }\n\
\n\
  $scope.download = function () {\n\
    var blob = utils.createZip(tpls, mirrors)\n\
    document.getElementById('download-link').href = window.URL.createObjectURL(blob);\n\
    $scope.showDlDialog = true\n\
  }\n\
  $scope.closeDlDialog = function () {\n\
    $scope.showDlDialog = false\n\
  }\n\
  $scope.open = function () {\n\
    store.list(function (err, docs, cached) {\n\
      $scope.docs = docs\n\
      if (!cached) $scope.$digest()\n\
    })\n\
    $scope.showOpenDialog = true\n\
  }\n\
  $scope.openDoc = function (doc) {\n\
    window.location.hash = doc.hash\n\
    $scope.showOpenDialog = false\n\
  }\n\
  $scope.removeDoc = function (doc) {\n\
    store.remove(doc.hash, function (err, docs, cached) {\n\
      $scope.docs = docs\n\
      if (!cached) $scope.$digest()\n\
    })\n\
  }\n\
  $scope.closeOpenDialog = function () {\n\
    $scope.showOpenDialog = false\n\
  }\n\
\n\
  $scope.duplicate = function () {\n\
    var id = utils.genId()\n\
    store.save(\n\
      id,\n\
      $scope.docTitle,\n\
      {\n\
        stylus: mirrors.stylus.getValue(),\n\
        jade: mirrors.jade.getValue(),\n\
        xon: mirrors.xon.getValue()\n\
      },\n\
      function () {}\n\
    )\n\
    window.location.hash = id\n\
  }\n\
  \n\
  $scope.zoomIn = function () {\n\
    if ($scope.zoomLevel < 250) {\n\
      $scope.zoomLevel += 10;\n\
    }\n\
  }\n\
\n\
  $scope.zoomOut = function () {\n\
    if ($scope.zoomLevel > 20) {\n\
      $scope.zoomLevel -= 10;\n\
    }\n\
  }\n\
\n\
  var outputEl = document.getElementById('output')\n\
  $scope.fullScreen = false\n\
  $scope.$watch('zoomLevel', function (value) {\n\
    manager.els.output.style.zoom = value + '%';\n\
  })\n\
  $scope.$watch('fullScreen', function (value) {\n\
    if (value) manager.els.output.classList.add('fullScreen')\n\
    else manager.els.output.classList.remove('fullScreen')\n\
  })\n\
  $scope.toggleFullScreen = function () {\n\
    $scope.fullScreen = !$scope.fullScreen\n\
    if (!$scope.fullScreen) {\n\
      $scope.minimized = false\n\
    }\n\
  }\n\
  $scope.minimized = false\n\
  $scope.toggleMinimized = function () {\n\
    $scope.minimized = !$scope.minimized\n\
  }\n\
\n\
  var mirrors = {}\n\
    , langs = ['jade', 'stylus', 'xon']\n\
    , cmLangs = {\n\
        jade: 'jade',\n\
        stylus: 'jade',\n\
        xon: 'javascript'\n\
      }\n\
\n\
  langs.forEach(function (lang) {\n\
    mirrors[lang] = utils.makeMirror(\n\
      lang, document.getElementById(lang + '-mirror'),\n\
      cmLangs[lang], store, manager[lang].bind(manager)\n\
    )\n\
  })\n\
\n\
  load(hash)\n\
\n\
}\n\
\n\
\n\
module.exports = function (document, window) {\n\
  var manager = new Manager(document)\n\
  var app = angular.module('JazzUI', ['helpers'])\n\
  app.controller('MainController', ['$scope', 'store', MainController.bind(null, manager)])\n\
\n\
  var myApp = angular.module('MyApp', [])\n\
    .controller('MainController', ['$scope', function ($scope) {\n\
      $scope.loadingData = true\n\
      console.log('hi', manager)\n\
      manager.xon(null, $scope, myApp)\n\
    }])\n\
\n\
  app.factory('store', function () {\n\
    return new LocalStore(window.localStorage)\n\
  })\n\
  angular.bootstrap(document.getElementById(\"interaction\"), [\"JazzUI\"])\n\
\n\
}\n\
//@ sourceURL=jazzui/client/index.js"
));
require.register("jazzui/client/manager.js", Function("exports, require, module",
"\n\
/* globals stylus: true, jade: true, angular: true */\n\
\n\
var xon = require('xon')\n\
\n\
module.exports = Manager;\n\
\n\
function compileXon(txt) {\n\
  /* jshint -W054: false */\n\
  var module = {\n\
    exports: {}\n\
  }\n\
  new Function('require', 'module', txt)(require, module)\n\
  return module.exports\n\
}\n\
\n\
function Manager(document){\n\
  var els = {}\n\
    , data = {\n\
        js: '',\n\
        styl: '',\n\
        xon: '',\n\
        jade: ''\n\
      }\n\
  ;['output',\n\
    'injected-css'].map(function (id) {\n\
    els[id] = document.getElementById(id)\n\
  })\n\
  this.els = els\n\
  this.data = data\n\
  this.zoomIt = null\n\
  this.lastXon = null\n\
}\n\
\n\
Manager.prototype = {\n\
  jade: function (txt) {\n\
    if (arguments.length === 0) return this.data.jade\n\
    var parent = this.els.output.parentNode\n\
      , html\n\
    try {\n\
      html = jade.compile(txt)()\n\
    } catch (e) {\n\
      console.error(\"Jade failed to compile\")\n\
      return\n\
    }\n\
    this.data.jade = txt\n\
    parent.innerHTML = '<div id=\"output\">' + html + '</div>'\n\
    angular.bootstrap((this.els.output = parent.firstChild), ['MyApp'])\n\
    if (this.zoomIt) this.zoomIt(this.els.output)\n\
  },\n\
  stylus: function (txt) {\n\
    var self = this\n\
    txt = '#output\\n\
  ' + txt.replace(/\\n\
/g,'\\n\
  ')\n\
    stylus(txt).render(function (err, css) {\n\
      if (!css) return\n\
      self.data.styl = txt\n\
      self.els['injected-css'].innerHTML = css\n\
    })\n\
  },\n\
  updateXon: function (proto, cached) {\n\
    if (!this.app || !this.scope) {\n\
      // console.error('No fetcher or scope')\n\
      return\n\
    }\n\
    var self = this\n\
\n\
    this.scope.loadingData = true\n\
    function gotData(err, data, cached) {\n\
      if (err) {\n\
        console.error('get data fail')\n\
        return\n\
      }\n\
      self.lastXonData = data\n\
      self.scope.loadingData = false\n\
      for (var name in data) {\n\
        if (!name.match(/^[a-zA-Z0-9_-]+$/)) continue;\n\
        self.scope[name] = data[name]\n\
      }\n\
      try {\n\
        proto.init(self.scope, self.app)\n\
      } catch (e) {\n\
        console.error('initialize fail')\n\
      }\n\
      if (!cached) self.scope.$digest()\n\
    }\n\
\n\
    if (cached) {\n\
      return gotData(null, cached, true)\n\
    }\n\
    try {\n\
      proto.getData(gotData)\n\
    } catch (e) {\n\
      console.log('getdata fail')\n\
      return\n\
    }\n\
    this.scope.$digest()\n\
  },\n\
  xon: function (txt, scope, app) {\n\
    if (arguments.length === 0) return this.data.xon\n\
    if (arguments.length === 3) {\n\
      this.scope = scope\n\
      this.app = app\n\
      if (!txt) {\n\
        if (this.lastXon) {\n\
          return this.updateXon(this.lastXon, this.lastXonData)\n\
        }\n\
        txt = this.data.xon\n\
      }\n\
    }\n\
    var proto\n\
    try {\n\
      proto = compileXon(txt)\n\
    } catch (e) {\n\
      console.log('xon error!', e)\n\
      return false\n\
    }\n\
    if ('function' !== typeof proto.getData || 'function' !== typeof proto.init) {\n\
      return false\n\
    }\n\
    this.data.xon = txt\n\
    this.lastXon = proto\n\
    this.updateXon(proto)\n\
  }\n\
}\n\
//@ sourceURL=jazzui/client/manager.js"
));
require.register("jazzui/client/utils.js", Function("exports, require, module",
"/* globals alert: true, CodeMirror: true, JSZip: true, window: true, document: true */\n\
\n\
var Tip = require('tip')\n\
\n\
module.exports = {\n\
  genId: genId,\n\
  tipMe: tipMe,\n\
  debounce: debounce,\n\
  rebounce: rebounce,\n\
  initHash: initHash,\n\
  createZip: createZip,\n\
  makeMirror: makeMirror\n\
}\n\
\n\
// called the first time, then sets a timeout. All calls within the\n\
// \"bounce\" are ignored, but the arguments are updated, such that the\n\
// last call before the bounce will be executed once the bounce is\n\
// done.\n\
function rebounce(fn, num) {\n\
  num = num || 300\n\
  var id, args\n\
  return function () {\n\
    var self = this\n\
    args = arguments\n\
    if (id) return\n\
    fn.apply(this, arguments)\n\
    id = setTimeout(function () {\n\
      // if it's been called during the bounce, hit that up.\n\
      if (args) fn.apply(self, args)\n\
      id = null\n\
    }, num)\n\
  }\n\
}\n\
\n\
function debounce(fn, num) {\n\
  num = num || 300\n\
  var id\n\
  return function () {\n\
    var args = arguments\n\
      , self = this\n\
    if (id) clearTimeout(id)\n\
    id = setTimeout(function () {\n\
      fn.apply(self, args)\n\
    }, num)\n\
  }\n\
}\n\
\n\
function genId(){\n\
  var id = ''\n\
    , chars = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789'\n\
  for (var i=0; i<10; i++) {\n\
    id += chars[parseInt(Math.random() * 62, 10)]\n\
  }\n\
  return id\n\
}\n\
\n\
function tipMe(el, title, direction) {\n\
  var tip =  new Tip(title)\n\
  if (direction) {\n\
    tip.position(direction, {auto: false})\n\
  }\n\
  el.addEventListener('mouseover', function () {\n\
    tip.show(el)\n\
  })\n\
  el.addEventListener('mouseout', function () {\n\
    tip.hide()\n\
  })\n\
  return tip\n\
}\n\
\n\
function initHash(hash) {\n\
  if (!hash || hash == '#') {\n\
    return genId()\n\
  }\n\
  if (!window.location.hash.match(/^#[a-zA-Z0-9]{10}/)) {\n\
    alert(\"Sorry, file not found. Please check your url\")\n\
    window.location = '/'\n\
    return\n\
  }\n\
  return window.location.hash.slice(1)\n\
}\n\
\n\
function createZip(tpls, mirrors) {\n\
  var zip = new JSZip()\n\
    , main = zip.folder('prototype')\n\
    , jsf = main.folder(\"js\")\n\
    , cssf = main.folder(\"css\")\n\
    , stylf = main.folder(\"styl\")\n\
    , jadef = main.folder(\"jade\")\n\
\n\
  main.file('component.json', tpls.componentjson)\n\
  main.file('Makefile', tpls.makefile)\n\
  jadef.file('index.jade', tpls.outjade)\n\
  jadef.file('proto.jade', mirrors.jade.getValue())\n\
  stylf.file('index.styl', 'body\\n\
  @import \"proto.styl\"\\n\
')\n\
  stylf.file('proto.styl', mirrors.stylus.getValue())\n\
  main.file('index.js', mirrors.xon.getValue())\n\
\n\
  return zip.generate({ type: 'blob' })\n\
}\n\
\n\
function makeMirror(name, el, mode, store, onChange) {\n\
  var m = new CodeMirror(el, {\n\
    value: '',\n\
    mode: mode,\n\
    theme: 'twilight',\n\
    extraKeys: {\n\
      Tab: function(cm) {\n\
        var spaces = Array(cm.getOption(\"indentUnit\") + 1).join(\" \");\n\
        cm.replaceSelection(spaces, \"end\", \"+input\");\n\
      }\n\
    }\n\
  })\n\
  var reloading = true\n\
  var reload = document.querySelector('.' + name + ' > .reload-btn')\n\
  var tip = tipMe(reload, 'Click to disable automatic reload')\n\
  // tip.position('south')\n\
  reload.addEventListener('click', function () {\n\
    reloading = !reloading\n\
    tip.message('Click to ' + (reloading ? 'dis' : 'en') + 'able automatic reload')\n\
    reload.classList[reloading ? 'add' : 'remove']('active')\n\
  })\n\
  var saveBouncer = rebounce(function (text) {\n\
    store.saveOne(name, text, function (err) {\n\
      if (err) {\n\
        console.error('Failed to save ' + name)\n\
      }\n\
    })\n\
  }, 2000)\n\
  m.on('change', debounce(function (instance, change) {\n\
    var text = instance.doc.getValue()\n\
    if (reloading) onChange(text)\n\
    saveBouncer(text)\n\
  }))\n\
  return m\n\
}\n\
\n\
//@ sourceURL=jazzui/client/utils.js"
));
require.register("jazzui/client/store.js", Function("exports, require, module",
"\n\
module.exports = {\n\
  LocalStore: LocalStore,\n\
  ApiStore: ApiStore\n\
}\n\
\n\
function ApiStore() {\n\
  throw new Error(\"Not Implemented\")\n\
}\n\
\n\
// ls: window.localStorage\n\
function LocalStore(ls) {\n\
  this.ls = ls\n\
  this.currentHash = null\n\
}\n\
\n\
// saved: {\n\
//   name:\n\
//   modified:\n\
// }\n\
LocalStore.prototype = {\n\
  list: function (done) {\n\
    var docs = []\n\
      , doc\n\
    for (var name in this.ls) {\n\
      if (name.slice(0, 'jui.'.length) !== 'jui.') continue;\n\
      if (name.split('.').length > 2) continue;\n\
      try {\n\
        doc = JSON.parse(this.ls[name])\n\
        doc.modified = new Date(doc.modified)\n\
        doc.hash = name.slice('jui.'.length)\n\
        docs.push(doc)\n\
      } catch (e) {\n\
        console.error(\"failed to parse\", name)\n\
      }\n\
    }\n\
    done(null, docs, true)\n\
  },\n\
  remove: function (hash, done) {\n\
    var names = Object.keys(this.ls)\n\
    for (var i=0; i<names.length; i++) {\n\
      if (names[i].indexOf('jui.' + hash) === 0) {\n\
        this.ls.removeItem(names[i])\n\
      }\n\
    }\n\
    this.list(done)\n\
  },\n\
  // {hash:, name:, jade:, stylus:, xon:, modified:}\n\
  get: function (hash, done) {\n\
    if (arguments.length === 1) {\n\
      done = hash\n\
      hash = this.currentHash\n\
    }\n\
    var pref = 'jui.' + hash\n\
    , name = 'Untitled'\n\
    try {\n\
      name = JSON.parse(this.ls[pref]).name\n\
    } catch (e) {\n\
      console.error(\"failed to get title\")\n\
    }\n\
    done(\n\
      null,\n\
      name,\n\
      {\n\
        stylus: this.ls[pref + '.stylus'],\n\
        jade: this.ls[pref + '.jade'],\n\
        xon: this.ls[pref + '.xon'],\n\
      },\n\
      true\n\
    )\n\
  },\n\
  saveName: function (id, name, done) {\n\
    if (arguments.length === 2) {\n\
      done = name\n\
      name = id\n\
      id = this.currentHash\n\
    }\n\
    var pref = 'jui.' + id\n\
    this.ls[pref] = JSON.stringify({\n\
      name: name,\n\
      modified: new Date()\n\
    })\n\
    done()\n\
  },\n\
  // done(err)\n\
  save: function (id, name, data, done) {\n\
    if (arguments.length === 3) {\n\
      done = data\n\
      data = name\n\
      name = id\n\
      id = this.currentHash\n\
    }\n\
    var pref = 'jui.' + id\n\
    this.ls[pref] = JSON.stringify({\n\
      name: name,\n\
      modified: new Date()\n\
    })\n\
    this.ls[pref + '.stylus'] = data.stylus\n\
    this.ls[pref + '.jade'] = data.jade\n\
    this.ls[pref + '.xon'] = data.xon\n\
    done(null)\n\
  },\n\
  // type is one of stylus, jade, xon\n\
  saveOne: function (id, type, txt, done) {\n\
    if (arguments.length === 3) {\n\
      done = txt\n\
      txt = type\n\
      type = id\n\
      id = this.currentHash\n\
    }\n\
    var pref = 'jui.' + id\n\
    this.ls[pref + '.' + type] = txt\n\
    var data = {\n\
      name: 'Untitled'\n\
    }\n\
    try {\n\
      data = JSON.parse(this.ls['jui.' + id])\n\
    } catch (e) {\n\
      console.error('Not yet saved')\n\
    }\n\
    this.ls['jui.' + id] = JSON.stringify({\n\
      name: data.name,\n\
      modified: new Date().getTime()\n\
    })\n\
    done(null)\n\
  }\n\
}\n\
//@ sourceURL=jazzui/client/store.js"
));
require.register("jazzui/client/tpls.js", Function("exports, require, module",
"\n\
module.exports = {\n\
  jade: require('./tpl/jade.txt'),\n\
  stylus: require('./tpl/stylus.txt'),\n\
  xon: require('./tpl/xon.txt'),\n\
  outjade: require('./tpl/outjade.txt'),\n\
  outjs: require('./tpl/outjs.txt'),\n\
  makefile: require('./tpl/makefile.txt'),\n\
  componentjson: require('./tpl/componentjson.txt'),\n\
}\n\
//@ sourceURL=jazzui/client/tpls.js"
));
require.register("jazzui/client/tpl/stylus.txt.js", Function("exports, require, module",
"module.exports = '\\n\
.starter-template\\n\
  padding: 40px 15px\\n\
  text-align: center\\n\
\\n\
  ul.people\\n\
    width: 250px\\n\
    padding: 0\\n\
    margin: 0 auto\\n\
    li\\n\
      list-style: none\\n\
      text-align: left\\n\
      font-size: 16px\\n\
      \\n\
      img\\n\
        margin-right: 20px\\n\
        margin-bottom: 10px\\n\
        border-radius: 5px\\n\
';//@ sourceURL=jazzui/client/tpl/stylus.txt.js"
));
require.register("jazzui/client/tpl/jade.txt.js", Function("exports, require, module",
"module.exports = 'div#main(ng-controller=\"MainController\")\\n\
  .navbar.navbar-inverse(role=\\'navigation\\')\\n\
    .container-fluid\\n\
      .navbar-header\\n\
        button.navbar-toggle(type=\\'button\\', data-toggle=\\'collapse\\', data-target=\\'.navbar-collapse\\')\\n\
          span.sr-only Toggle navigation\\n\
          span.icon-bar\\n\
          span.icon-bar\\n\
          span.icon-bar\\n\
        a.navbar-brand(href=\\'#\\') Project name\\n\
      .collapse.navbar-collapse\\n\
        ul.nav.navbar-nav\\n\
          li.active\\n\
            a(href=\\'#\\') Home\\n\
          li\\n\
            a(href=\\'#about\\') About\\n\
          li\\n\
            a(href=\\'#contact\\') Contact\\n\
  .container-fluid\\n\
    .starter-template\\n\
      h1 Bootstrap starter template\\n\
      p.lead\\n\
        | Use this document as a way to quickly start any new project.\\n\
        br\\n\
        | All you get is this text and a mostly barebones HTML document.\\n\
      ul.people\\n\
        li(ng-repeat=\\'person in people\\')\\n\
          img(ng-src=\"{{person.picture}}\")\\n\
          span.name {{ person.name }}\\n\
';//@ sourceURL=jazzui/client/tpl/jade.txt.js"
));
require.register("jazzui/client/tpl/xon.txt.js", Function("exports, require, module",
"module.exports = 'var x = require(\\'xon\\')\\n\
\\n\
module.exports = {\\n\
  getData: getData,\\n\
  init: init\\n\
}\\n\
\\n\
function getData(cb) {\\n\
  cb(null, x({\\n\
    // Mess with the fixtures here\\n\
    people: x.some(3, 10, {\\n\
      name: x.fullName(),\\n\
      age: x.randInt(21, 45),\\n\
      status: x.choice([\\'new\\', \\'old\\', \\'middling\\']),\\n\
      picture: x.image(46, 46)\\n\
    })\\n\
  }), true)\\n\
}\\n\
\\n\
function init($scope, app) {\\n\
  // deal with it\\n\
}\\n\
';//@ sourceURL=jazzui/client/tpl/xon.txt.js"
));
require.register("jazzui/client/tpl/makefile.txt.js", Function("exports, require, module",
"module.exports = '\\n\
build: index.html css/index.css index.js components bootstrap js/angular.js\\n\
\t@component build --dev -n index -o js\\n\
\\n\
components: component.json\\n\
\t@component install --dev\\n\
\\n\
index.html: jade/index.jade\\n\
\t@jade jade/index.jade -o .\\n\
\\n\
css/index.css: styl/index.styl\\n\
\t@stylus < styl/index.styl > css/index.css\\n\
\\n\
serve:\\n\
\t@python -m SimpleHTTPServer ${PORT}\\n\
\\n\
clean:\\n\
\trm -rf css/index.css index.html components index.js\\n\
\\n\
js/angular.js:\\n\
\t@wget https://ajax.googleapis.com/ajax/libs/angularjs/1.2.1/angular.js\\n\
\t@mv angular.js js\\n\
\\n\
bootstrap:\\n\
\t@wget https://github.com/twbs/bootstrap/releases/download/v3.0.2/bootstrap-3.0.2-dist.zip\\n\
\t@unzip bootstrap-3.0.2-dist.zip\\n\
\t@mv dist bootstrap\\n\
\\n\
.PHONY: build serve clean\\n\
\\n\
';//@ sourceURL=jazzui/client/tpl/makefile.txt.js"
));
require.register("jazzui/client/tpl/componentjson.txt.js", Function("exports, require, module",
"module.exports = '{\\n\
  \"name\": \"prototype\",\\n\
  \"repo\": \"test/prototype\",\\n\
  \"description\": \"Make with JazzUI\",\\n\
  \"version\": \"0.0.1\",\\n\
  \"keywords\": [],\\n\
  \"dependencies\": {\\n\
    \"jaredly/xon\": \"*\"\\n\
  },\\n\
  \"development\": {},\\n\
  \"license\": \"MIT\",\\n\
  \"main\": \"index.js\",\\n\
  \"scripts\": [\\n\
    \"index.js\"\\n\
  ]\\n\
}\\n\
';//@ sourceURL=jazzui/client/tpl/componentjson.txt.js"
));
require.register("jazzui/client/tpl/outjs.txt.js", Function("exports, require, module",
"module.exports = 'var x = require(\\'xon\\')\\n\
  , proto = require(\\'./proto\\')\\n\
\\n\
module.exports = function (angular) {\\n\
  var AppName = \\'MyApp\\'\\n\
  var app = angular.module(AppName, [])\\n\
    .factory(\\'getData\\', function () {\\n\
      return proto.getData\\n\
    })\\n\
    .controller(\\'MainController\\', [\\'$scope\\', \\'getData\\', function ($scope, getData) {\\n\
      $scope.loadingData = true\\n\
      getData(function (err, data, cached) {\\n\
        $scope.loadingData = false\\n\
        for (var name in data) {\\n\
          if (!name.match(/^[a-zA-Z0-9_-]+$/)) continue;\\n\
          $scope[name] = data[name]\\n\
        }\\n\
        proto.init($scope, app)\\n\
        if (!cached) $scope.$digest()\\n\
      })\\n\
    }])\\n\
\\n\
  return AppName\\n\
}\\n\
';//@ sourceURL=jazzui/client/tpl/outjs.txt.js"
));
require.register("jazzui/client/tpl/outjade.txt.js", Function("exports, require, module",
"module.exports = '!!!\\n\
html\\n\
  head\\n\
    // bootstrap theme\\n\
    link(rel=\\'stylesheet\\', href=\\'bootstrap/css/bootstrap.css\\')\\n\
\\n\
    // non-component javascript libs\\n\
    script(src=\\'js/angular.js\\')\\n\
\\n\
    // my actual code\\n\
    link(rel=\\'stylesheet\\', href=\\'css/index.css\\')\\n\
    script(src=\\'js/index.js\\')\\n\
    script.\\n\
      window.addEventListener(\\'load\\', function () {\\n\
        require(\\'prototype\\')(document)\\n\
      })\\n\
  body\\n\
    include proto.jade\\n\
';//@ sourceURL=jazzui/client/tpl/outjade.txt.js"
));


























require.alias("visionmedia-jade/lib/runtime.js", "jazzui/deps/jade/lib/runtime.js");
require.alias("visionmedia-jade/lib/runtime.js", "jazzui/deps/jade/index.js");
require.alias("visionmedia-jade/lib/runtime.js", "jade/index.js");
require.alias("visionmedia-jade/lib/runtime.js", "visionmedia-jade/index.js");
require.alias("jaredly-xon/index.js", "jazzui/deps/xon/index.js");
require.alias("jaredly-xon/lib/index.js", "jazzui/deps/xon/lib/index.js");
require.alias("jaredly-xon/lib/image.js", "jazzui/deps/xon/lib/image.js");
require.alias("jaredly-xon/lib/consts.js", "jazzui/deps/xon/lib/consts.js");
require.alias("jaredly-xon/index.js", "jazzui/deps/xon/index.js");
require.alias("jaredly-xon/index.js", "xon/index.js");
require.alias("jaredly-xon/index.js", "jaredly-xon/index.js");
require.alias("component-tip/index.js", "jazzui/deps/tip/index.js");
require.alias("component-tip/template.js", "jazzui/deps/tip/template.js");
require.alias("component-tip/index.js", "tip/index.js");
require.alias("component-emitter/index.js", "component-tip/deps/emitter/index.js");
require.alias("component-indexof/index.js", "component-emitter/deps/indexof/index.js");

require.alias("component-query/index.js", "component-tip/deps/query/index.js");

require.alias("component-events/index.js", "component-tip/deps/events/index.js");
require.alias("component-event/index.js", "component-events/deps/event/index.js");

require.alias("component-event-manager/index.js", "component-events/deps/event-manager/index.js");

require.alias("component-domify/index.js", "component-tip/deps/domify/index.js");

require.alias("component-classes/index.js", "component-tip/deps/classes/index.js");
require.alias("component-indexof/index.js", "component-classes/deps/indexof/index.js");

require.alias("component-css/index.js", "component-tip/deps/css/index.js");

require.alias("timoxley-offset/index.js", "component-tip/deps/offset/index.js");
require.alias("timoxley-dom-support/index.js", "timoxley-offset/deps/dom-support/index.js");
require.alias("enyo-domready/index.js", "timoxley-dom-support/deps/domready/index.js");

require.alias("timoxley-assert/index.js", "timoxley-dom-support/deps/assert/index.js");
require.alias("component-inherit/index.js", "timoxley-assert/deps/inherit/index.js");

require.alias("component-within-document/index.js", "timoxley-offset/deps/within-document/index.js");


require.alias("jazzui/client/index.js", "jazzui/index.js");