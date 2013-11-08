
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
  if (!module.exports) {
    module.exports = {};
    module.client = module.component = true;
    module.call(this, module.exports, require.relative(resolved), module);
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
 * Render the given attributes object.\n\
 *\n\
 * @param {Object} obj\n\
 * @param {Object} escaped\n\
 * @return {String}\n\
 * @api private\n\
 */\n\
\n\
exports.attrs = function attrs(obj, escaped){\n\
  var buf = []\n\
    , terse = obj.terse;\n\
\n\
  delete obj.terse;\n\
  var keys = Object.keys(obj)\n\
    , len = keys.length;\n\
\n\
  if (len) {\n\
    buf.push('');\n\
    for (var i = 0; i < len; ++i) {\n\
      var key = keys[i]\n\
        , val = obj[key];\n\
\n\
      if ('boolean' == typeof val || null == val) {\n\
        if (val) {\n\
          terse\n\
            ? buf.push(key)\n\
            : buf.push(key + '=\"' + key + '\"');\n\
        }\n\
      } else if (0 == key.indexOf('data') && 'string' != typeof val) {\n\
        buf.push(key + \"='\" + JSON.stringify(val).replace(/'/g, '&apos;') + \"'\");\n\
      } else if ('class' == key) {\n\
        if (escaped && escaped[key]){\n\
          if (val = exports.escape(joinClasses(val))) {\n\
            buf.push(key + '=\"' + val + '\"');\n\
          }\n\
        } else {\n\
          if (val = joinClasses(val)) {\n\
            buf.push(key + '=\"' + val + '\"');\n\
          }\n\
        }\n\
      } else if (escaped && escaped[key]) {\n\
        buf.push(key + '=\"' + exports.escape(val) + '\"');\n\
      } else {\n\
        buf.push(key + '=\"' + val + '\"');\n\
      }\n\
    }\n\
  }\n\
\n\
  return buf.join(' ');\n\
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
require.register("jazzui/client/index.js", Function("exports, require, module",
"\n\
var xon = require('xon')\n\
\n\
  , jadeTpl = require('./tpl/jade.txt')\n\
  , stylusTpl = require('./tpl/stylus.txt')\n\
  , xonTpl = require('./tpl/xon.txt')\n\
\n\
function compileXon(txt) {\n\
  var data = new Function('x', txt)(xon)\n\
  return xon(data)\n\
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
module.exports = function (document, window) {\n\
  var CodeMirror = window.CodeMirror\n\
    , angular = window.angular\n\
    , stylus = window.stylus\n\
    , jade = window.jade\n\
    , els = {}\n\
\n\
  ;['jade-mirror', 'stylus-mirror', 'xon-mirror', 'output', 'injected-css'].map(function (id) {\n\
    els[id] = document.getElementById(id)\n\
  })\n\
\n\
  function updateHtml(txt) {\n\
    var html, parent = els.output.parentNode\n\
    try {\n\
      html = jade.compile(txt)()\n\
    } catch (e) {\n\
      return\n\
    }\n\
    parent.innerHTML = '<div id=\"output\">' + html + '</div>'\n\
    angular.bootstrap((els.output = parent.firstChild), ['MyApp'])\n\
  }\n\
  function updateStyle(txt) {\n\
    txt = '#output\\n\
  ' + txt.replace(/\\n\
/g,'\\n\
  ')\n\
    stylus(txt).render(function (err, css) {\n\
      if (css) els['injected-css'].innerHTML = css\n\
    })\n\
  }\n\
\n\
  var html = debounce(updateHtml)\n\
    , style = debounce(updateStyle)\n\
    , dexon = debounce(updateXon)\n\
  var jm = new CodeMirror(els['jade-mirror'], {\n\
    value: jadeTpl,\n\
    mode: 'jade',\n\
    theme: 'twilight',\n\
    extraKeys: {\n\
      Tab: function(cm) {\n\
        var spaces = Array(cm.getOption(\"indentUnit\") + 1).join(\" \");\n\
        cm.replaceSelection(spaces, \"end\", \"+input\");\n\
      }\n\
    }\n\
  })\n\
  jm.on('change', function (instance, change) {\n\
    html(instance.doc.getValue())\n\
  })\n\
  var sm = new CodeMirror(els['stylus-mirror'], {\n\
    value: stylusTpl,\n\
    mode: 'jade',\n\
    theme: 'twilight',\n\
    extraKeys: {\n\
      Tab: function(cm) {\n\
        var spaces = Array(cm.getOption(\"indentUnit\") + 1).join(\" \");\n\
        cm.replaceSelection(spaces, \"end\", \"+input\");\n\
      }\n\
    }\n\
  })\n\
  sm.on('change', function (instance, change) {\n\
    style(instance.doc.getValue())\n\
  })\n\
  var xm = new CodeMirror(els['xon-mirror'], {\n\
    value: xonTpl,\n\
    mode: 'javascript',\n\
    theme: 'twilight',\n\
    extraKeys: {\n\
      Tab: function(cm) {\n\
        var spaces = Array(cm.getOption(\"indentUnit\") + 1).join(\" \");\n\
        cm.replaceSelection(spaces, \"end\", \"+input\");\n\
      }\n\
    }\n\
  })\n\
  xm.on('change', function (instance, change) {\n\
    dexon(instance.doc.getValue())\n\
  })\n\
\n\
  function updateXon(txt) {\n\
    if (!dataFetcher) return\n\
    try {\n\
      cxon = compileXon(txt)\n\
    } catch (e) {\n\
      return\n\
    }\n\
    dataFetcher(cxon)\n\
  }\n\
\n\
  var cxon = compileXon(xonTpl)\n\
    , dataFetcher\n\
\n\
  angular.module('MyApp', [])\n\
    .factory('getData', function () {\n\
      return function (cb) {\n\
        cb(cxon, true)\n\
        dataFetcher = cb\n\
      }\n\
    })\n\
    .controller('MainController', ['$scope', 'getData', function ($scope, getData) {\n\
      getData(function (data, cached) {\n\
        for (var name in data) {\n\
          if (!name.match(/^[a-zA-Z0-9_-]+$/)) continue;\n\
          $scope[name] = data[name]\n\
        }\n\
        if (!cached) $scope.$digest()\n\
      })\n\
    }])\n\
\n\
  updateHtml(jadeTpl)\n\
  updateStyle(stylusTpl)\n\
}\n\
//@ sourceURL=jazzui/client/index.js"
));
require.register("jazzui/client/tpl/stylus.txt.js", Function("exports, require, module",
"module.exports = 'zoom: 80%\\n\
\\n\
.starter-template\\n\
  padding: 40px 15px\\n\
  text-align: center\\n\
\\n\
  ul.people\\n\
    li\\n\
      list-style: none\\n\
\\n\
\\n\
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
        li(ng-repeat=\\'person in people\\') {{ person.name }}\\n\
';//@ sourceURL=jazzui/client/tpl/jade.txt.js"
));
require.register("jazzui/client/tpl/xon.txt.js", Function("exports, require, module",
"module.exports = '\\n\
return {\\n\
  people: x.some(3, 10, {\\n\
    name: x.fullName(),\\n\
    age: x.randInt(21, 45),\\n\
    status: x.choice([\\'new\\', \\'old\\', \\'middling\\'])\\n\
  })\\n\
}\\n\
\\n\
';//@ sourceURL=jazzui/client/tpl/xon.txt.js"
));


require.alias("visionmedia-jade/lib/runtime.js", "jazzui/deps/jade/lib/runtime.js");
require.alias("visionmedia-jade/lib/runtime.js", "jazzui/deps/jade/index.js");
require.alias("visionmedia-jade/lib/runtime.js", "jade/index.js");
require.alias("visionmedia-jade/lib/runtime.js", "visionmedia-jade/index.js");
require.alias("jaredly-xon/index.js", "jazzui/deps/xon/index.js");
require.alias("jaredly-xon/lib/index.js", "jazzui/deps/xon/lib/index.js");
require.alias("jaredly-xon/lib/consts.js", "jazzui/deps/xon/lib/consts.js");
require.alias("jaredly-xon/index.js", "jazzui/deps/xon/index.js");
require.alias("jaredly-xon/index.js", "xon/index.js");
require.alias("jaredly-xon/index.js", "jaredly-xon/index.js");
require.alias("jazzui/client/index.js", "jazzui/index.js");