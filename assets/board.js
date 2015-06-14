var debug;
var __slice = Array.prototype.slice;
debug = function() {
  var args;
  args = 1 <= arguments.length ? __slice.call(arguments, 0) : [];
  try {
    return console.log.apply(console, args);
  } catch (e) {

  }
};
var Zepto = (function() {
  var slice = [].slice, key, css, $$, fragmentRE, container, document = window.document, undefined;

  // fix for iOS 3.2
  if (String.prototype.trim === undefined)
    String.prototype.trim = function(){ return this.replace(/^\s+/, '').replace(/\s+$/, '') };

  function classRE(name){ return new RegExp("(^|\\s)" + name + "(\\s|$)") }
  function compact(array){ return array.filter(function(item){ return item !== undefined && item !== null }) }
  function camelize(str){ return str.replace(/-+(.)?/g, function(match, chr){ return chr ? chr.toUpperCase() : '' }) }

  fragmentRE = /^\s*<.+>/;
  container = document.createElement("div");
  function fragment(html) {
    container.innerHTML = ('' + html).trim();
    var result = slice.call(container.childNodes);
    container.innerHTML = '';
    return result;
  }

  function Z(dom, selector){ this.dom = dom || []; this.selector = selector || '' }

  function $(selector, context){
    if (selector == document) return new Z;
    else if (context !== undefined) return $(context).find(selector);
    else if (typeof selector === 'function') return $(document).ready(selector);
    else {
      var dom;
      if (selector instanceof Z) dom = selector.dom;
      else if (selector instanceof Array) dom = selector;
      else if (selector instanceof Element || selector === window) dom = [selector];
      else if (fragmentRE.test(selector)) dom = fragment(selector);
      else dom = $$(document, selector);

      return new Z(compact(dom), selector);
    }
  }

  $.extend = function(target, source){ for (key in source) target[key] = source[key]; return target }
  $.qsa = $$ = function(element, selector){ return slice.call(element.querySelectorAll(selector)) }

  $.fn = {
    ready: function(callback){
      document.addEventListener('DOMContentLoaded', callback, false); return this;
    },
    compact: function(){ this.dom = compact(this.dom); return this },
    get: function(idx){ return idx === undefined ? this.dom : this.dom[idx] },
    remove: function(){
      return this.each(function(el){ el.parentNode.removeChild(el) });
    },
    each: function(callback){ this.dom.forEach(callback); return this },
    filter: function(selector){
      return $(this.dom.filter(function(element){
        return $$(element.parentNode, selector).indexOf(element) >= 0;
      }));
    },
    is: function(selector){
      return this.dom.length > 0 && $(this.dom[0]).filter(selector).dom.length > 0;
    },
    first: function(callback){ this.dom = compact([this.dom[0]]); return this },
    last: function() { this.dom = compact([this.dom[this.dom.length - 1]]); return this },
    find: function(selector){
      return $(this.dom.map(function(el){ return $$(el, selector) }).reduce(function(a,b){ return a.concat(b) }, []));
    },
    closest: function(selector){
      var node = this.dom[0].parentNode, nodes = $$(document, selector);
      while(node && nodes.indexOf(node) < 0) node = node.parentNode;
      return $(node && !(node === document) ? node : []);
    },
    pluck: function(property){ return this.dom.map(function(element){ return element[property] }) },
    show: function(){ return this.css('display', 'block') },
    hide: function(){ return this.css('display', 'none') },
    prev: function(){ return $(this.pluck('previousElementSibling')) },
    next: function(){ return $(this.pluck('nextElementSibling')) },
    html: function(html){
      return html === undefined ?
        (this.dom.length > 0 ? this.dom[0].innerHTML : null) :
        this.each(function(element){ element.innerHTML = html });
    },
    text: function(text){
      return text === undefined ?
        (this.dom.length > 0 ? this.dom[0].innerText : null) :
        this.each(function(element){ element.innerText = text });
    },
    attr: function(name, value){
      return (typeof name == 'string' && value === undefined) ?
        (this.dom.length > 0 && this.dom[0].nodeName === 'INPUT' && this.dom[0].type === 'text' && name === 'value') ? (this.dom[0].value) :
        (this.dom.length > 0 ? this.dom[0].getAttribute(name) || undefined : null) :
        this.each(function(element){
          if (typeof name == 'object') for (key in name) element.setAttribute(key, name[key])
          else element.setAttribute(name, value);
        });
    },
    offset: function(){
      var obj = this.dom[0].getBoundingClientRect();
      return {
        left: obj.left + document.body.scrollLeft,
        top: obj.top + document.body.scrollTop,
        width: obj.width,
        height: obj.height
      };
    },
    css: function(property, value){
      if (value === undefined && typeof property == 'string') return this.dom[0].style[camelize(property)];
      css = "";
      for (key in property) css += key + ':' + property[key] + ';';
      if (typeof property == 'string') css = property + ":" + value;
      return this.each(function(element) { element.style.cssText += ';' + css });
    },
    index: function(element){
      return this.dom.indexOf($(element).get(0));
    },
    hasClass: function(name){
      return classRE(name).test(this.dom[0].className);
    },
    addClass: function(name){
      return this.each(function(element){
        !$(element).hasClass(name) && (element.className += (element.className ? ' ' : '') + name)
      });
    },
    removeClass: function(name){
      return this.each(function(element){
        element.className = element.className.replace(classRE(name), ' ').trim()
      });
    },
    toggleClass: function(name, when){
      return this.each(function(element){
       ((when !== undefined && !when) || $(element).hasClass(name)) ?
         $(element).removeClass(name) : $(element).addClass(name)
      });
    }
  };

  ['width', 'height'].forEach(function(property){
    $.fn[property] = function(){ return this.offset()[property] }
  });


  var adjacencyOperators = {append: 'beforeEnd', prepend: 'afterBegin', before: 'beforeBegin', after: 'afterEnd'};

  for (key in adjacencyOperators)
    $.fn[key] = (function(operator) {
      return function(html){
        return this.each(function(element){
          element['insertAdjacent' + (html instanceof Element ? 'Element' : 'HTML')](operator, html);
        });
      };
    })(adjacencyOperators[key]);

  Z.prototype = $.fn;

  return $;
})();

'$' in window || (window.$ = Zepto);
(function($){
  var $$ = $.qsa, handlers = {}, _zid = 1;
  function zid(element) {
    return element._zid || (element._zid = _zid++);
  }
  function findHandlers(element, event, fn, selector) {
    event = parse(event);
    if (event.ns) var matcher = matcherFor(event.ns);
    return (handlers[zid(element)] || []).filter(function(handler) {
      return handler
        && (!event.e  || handler.e == event.e)
        && (!event.ns || matcher.test(handler.ns))
        && (!fn       || handler.fn == fn)
        && (!selector || handler.sel == selector);
    });
  }
  function parse(event) {
    var parts = ('' + event).split('.');
    return {e: parts[0], ns: parts.slice(1).sort().join(' ')};
  }
  function matcherFor(ns) {
    return new RegExp('(?:^| )' + ns.replace(' ', ' .* ?') + '(?: |$)');
  }

  function add(element, events, fn, selector, delegate){
    var id = zid(element), set = (handlers[id] || (handlers[id] = []));
    events.split(/\s/).forEach(function(event){
      var handler = $.extend(parse(event), {fn: fn, sel: selector, del: delegate, i: set.length});
      set.push(handler);
      element.addEventListener(handler.e, delegate || fn, false);
    });
  }
  function remove(element, events, fn, selector){
    var id = zid(element);
    (events || '').split(/\s/).forEach(function(event){
      findHandlers(element, event, fn, selector).forEach(function(handler){
        delete handlers[id][handler.i];
        element.removeEventListener(handler.e, handler.del || handler.fn, false);
      });
    });
  }

  $.event = {
    add: function(element, events, fn){
      add(element, events, fn);
    },
    remove: function(element, events, fn){
      remove(element, events, fn);
    }
  };

  $.fn.bind = function(event, callback){
    return this.each(function(element){
      add(element, event, callback);
    });
  };
  $.fn.unbind = function(event, callback){
    return this.each(function(element){
      remove(element, event, callback);
    });
  };

  var eventMethods = ['preventDefault', 'stopImmediatePropagation', 'stopPropagation'];
  function createProxy(event) {
    var proxy = $.extend({originalEvent: event}, event);
    eventMethods.forEach(function(key) {
      proxy[key] = function() {return event[key].apply(event, arguments)};
    });
    return proxy;
  }

  $.fn.delegate = function(selector, event, callback){
    return this.each(function(element){
      add(element, event, callback, selector, function(e){
        var target = e.target, nodes = $$(element, selector);
        while (target && nodes.indexOf(target) < 0) target = target.parentNode;
        if (target && !(target === element) && !(target === document)) {
          callback.call(target, $.extend(createProxy(e), {
            currentTarget: target, liveFired: element
          }));
        }
      });
    });
  };
  $.fn.undelegate = function(selector, event, callback){
    return this.each(function(element){
      remove(element, event, callback, selector);
    });
  }

  $.fn.live = function(event, callback){
    $(document.body).delegate(this.selector, event, callback);
    return this;
  };
  $.fn.die = function(event, callback){
    $(document.body).undelegate(this.selector, event, callback);
    return this;
  };

  $.fn.trigger = function(event){
    return this.each(function(element){
      var e = document.createEvent('Events');
      element.dispatchEvent(e, e.initEvent(event, true, false));
    });
  };
})(Zepto);
(function($){
  function detect(ua){
    var ua = ua, os = {},
      android = ua.match(/(Android)\s+([\d.]+)/),
      iphone = ua.match(/(iPhone\sOS)\s([\d_]+)/),
      ipad = ua.match(/(iPad).*OS\s([\d_]+)/),
      webos = ua.match(/(webOS)\/([\d.]+)/);
    if (android) os.android = true, os.version = android[2];
    if (iphone) os.ios = true, os.version = iphone[2].replace(/_/g, '.'), os.iphone = true;
    if (ipad) os.ios = true, os.version = ipad[2].replace(/_/g, '.'), os.ipad = true;
    if (webos) os.webos = true, os.version = webos[2];
    return os;
  }
  $.os = detect(navigator.userAgent);
  $.__detect = detect;

  var v = navigator.userAgent.match(/WebKit\/([\d.]+)/);
  $.browser = v ? { webkit: true, version: v[1] } : { webkit: false };
})(Zepto);
(function($){
  $.fn.anim = function(properties, duration, ease){
    var transforms = [], opacity, key;
    for (key in properties)
      if (key === 'opacity') opacity = properties[key];
      else transforms.push(key + '(' + properties[key] + ')');

    return this.css({
      '-webkit-transition': 'all ' + (duration !== undefined ? duration : 0.5) + 's ' + (ease || ''),
      '-webkit-transform': transforms.join(' '),
      opacity: opacity
    });
  }
})(Zepto);
(function($){
  var touch = {}, touchTimeout;

  function parentIfText(node){
    return 'tagName' in node ? node : node.parentNode;
  }

  $(document).ready(function(){
    $(document.body).bind('touchstart', function(e){
      var now = Date.now(), delta = now - (touch.last || now);
      touch.target = parentIfText(e.touches[0].target);
      touchTimeout && clearTimeout(touchTimeout);
      touch.x1 = e.touches[0].pageX;
      if (delta > 0 && delta <= 250) touch.isDoubleTap = true;
      touch.last = now;
    }).bind('touchmove', function(e){
      touch.x2 = e.touches[0].pageX
    }).bind('touchend', function(e){
      if (touch.isDoubleTap) {
        $(touch.target).trigger('doubleTap');
        touch = {};
      } else if (touch.x2 > 0) {
        Math.abs(touch.x1 - touch.x2) > 30 && $(touch.target).trigger('swipe') &&
          $(touch.target).trigger('swipe' + (touch.x1 - touch.x2 > 0 ? 'Left' : 'Right'));
        touch.x1 = touch.x2 = touch.last = 0;
      } else if ('last' in touch) {
        touchTimeout = setTimeout(function(){
          touchTimeout = null;
          $(touch.target).trigger('tap')
          touch = {};
        }, 250);
      }
    }).bind('touchcancel', function(){ touch = {} });
  });

  ['swipe', 'swipeLeft', 'swipeRight', 'doubleTap', 'tap'].forEach(function(m){
    $.fn[m] = function(callback){ return this.bind(m, callback) }
  });
})(Zepto);
(function($){
  function empty() {}
  $.ajax = function(options){
    // { type, url, data, success, dataType, contentType }
    options = options || {};
    var data = options.data,
        callback = options.success || empty,
        errback = options.error || empty,
        mime = mimeTypes[options.dataType],
        content = options.contentType,
        xhr = new XMLHttpRequest();

    xhr.onreadystatechange = function(){
      if (xhr.readyState == 4) {
        if ((xhr.status >= 200 && xhr.status < 300) || xhr.status == 0) {
          if (mime == 'application/json') {
            var result, error = false;
            try {
              result = JSON.parse(xhr.responseText);
            } catch (e) {
              error = e;
            }
            if (error) errback(xhr, 'parsererror', error);
            else callback(result, 'success', xhr);
          } else callback(xhr.responseText, 'success', xhr);
        } else {
          errback(xhr, 'error');
        }
      }
    };

    xhr.open(options.type || 'GET', options.url || window.location, true);
    if (mime) xhr.setRequestHeader('Accept', mime);
    if (data instanceof Object) data = JSON.stringify(data), content = content || 'application/json';
    if (content) xhr.setRequestHeader('Content-Type', content);
    xhr.setRequestHeader('X-Requested-With', 'XMLHttpRequest');
    xhr.send(data);
  };

  var mimeTypes = $.ajax.mimeTypes = {
    json: 'application/json',
    xml:  'application/xml',
    html: 'text/html',
    text: 'text/plain'
  };

  $.get = function(url, success){ $.ajax({ url: url, success: success }) };
  $.post = function(url, data, success, dataType){
    if (data instanceof Function) dataType = dataType || success, success = data, data = null;
    $.ajax({ type: 'POST', url: url, data: data, success: success, dataType: dataType });
  };
  $.getJSON = function(url, success){ $.ajax({ url: url, success: success, dataType: 'json' }) };

  $.fn.load = function(url, success){
    if (!this.dom.length) return this;
    var self = this, parts = url.split(/\s/), selector;
    if (parts.length > 1) url = parts[0], selector = parts[1];
    $.get(url, function(response){
      self.html(selector ?
        $(document.createElement('div')).html(response).find(selector).html()
        : response);
      success && success();
    });
    return this;
  };
})(Zepto);
(function($){
  var cache = [], timeout;

  $.fn.remove = function(){
    return this.each(function(element){
      if(element.tagName == 'IMG'){
        cache.push(element);
        element.src = 'data:image/gif;base64,R0lGODlhAQABAAD/ACwAAAAAAQABAAACADs=';
        if (timeout) clearTimeout(timeout);
        timeout = setTimeout(function(){ cache = [] }, 60000);
      }
      element.parentNode.removeChild(element);
    });
  }
})(Zepto);

//     Underscore.js 1.1.3
//     (c) 2010 Jeremy Ashkenas, DocumentCloud Inc.
//     Underscore is freely distributable under the MIT license.
//     Portions of Underscore are inspired or borrowed from Prototype,
//     Oliver Steele's Functional, and John Resig's Micro-Templating.
//     For all details and documentation:
//     http://documentcloud.github.com/underscore

(function() {

  // Baseline setup
  // --------------

  // Establish the root object, `window` in the browser, or `global` on the server.
  var root = this;

  // Save the previous value of the `_` variable.
  var previousUnderscore = root._;

  // Establish the object that gets returned to break out of a loop iteration.
  var breaker = {};

  // Save bytes in the minified (but not gzipped) version:
  var ArrayProto = Array.prototype, ObjProto = Object.prototype;

  // Create quick reference variables for speed access to core prototypes.
  var slice            = ArrayProto.slice,
      unshift          = ArrayProto.unshift,
      toString         = ObjProto.toString,
      hasOwnProperty   = ObjProto.hasOwnProperty;

  // All **ECMAScript 5** native function implementations that we hope to use
  // are declared here.
  var
    nativeForEach      = ArrayProto.forEach,
    nativeMap          = ArrayProto.map,
    nativeReduce       = ArrayProto.reduce,
    nativeReduceRight  = ArrayProto.reduceRight,
    nativeFilter       = ArrayProto.filter,
    nativeEvery        = ArrayProto.every,
    nativeSome         = ArrayProto.some,
    nativeIndexOf      = ArrayProto.indexOf,
    nativeLastIndexOf  = ArrayProto.lastIndexOf,
    nativeIsArray      = Array.isArray,
    nativeKeys         = Object.keys;

  // Create a safe reference to the Underscore object for use below.
  var _ = function(obj) { return new wrapper(obj); };

  // Export the Underscore object for **CommonJS**, with backwards-compatibility
  // for the old `require()` API. If we're not in CommonJS, add `_` to the
  // global object.
  if (typeof module !== 'undefined' && module.exports) {
    module.exports = _;
    _._ = _;
  } else {
    root._ = _;
  }

  // Current version.
  _.VERSION = '1.1.3';

  // Collection Functions
  // --------------------

  // The cornerstone, an `each` implementation, aka `forEach`.
  // Handles objects implementing `forEach`, arrays, and raw objects.
  // Delegates to **ECMAScript 5**'s native `forEach` if available.
  var each = _.each = _.forEach = function(obj, iterator, context) {
    var value;
    if (nativeForEach && obj.forEach === nativeForEach) {
      obj.forEach(iterator, context);
    } else if (_.isNumber(obj.length)) {
      for (var i = 0, l = obj.length; i < l; i++) {
        if (iterator.call(context, obj[i], i, obj) === breaker) return;
      }
    } else {
      for (var key in obj) {
        if (hasOwnProperty.call(obj, key)) {
          if (iterator.call(context, obj[key], key, obj) === breaker) return;
        }
      }
    }
  };

  // Return the results of applying the iterator to each element.
  // Delegates to **ECMAScript 5**'s native `map` if available.
  _.map = function(obj, iterator, context) {
    if (nativeMap && obj.map === nativeMap) return obj.map(iterator, context);
    var results = [];
    each(obj, function(value, index, list) {
      results[results.length] = iterator.call(context, value, index, list);
    });
    return results;
  };

  // **Reduce** builds up a single result from a list of values, aka `inject`,
  // or `foldl`. Delegates to **ECMAScript 5**'s native `reduce` if available.
  _.reduce = _.foldl = _.inject = function(obj, iterator, memo, context) {
    var initial = memo !== void 0;
    if (nativeReduce && obj.reduce === nativeReduce) {
      if (context) iterator = _.bind(iterator, context);
      return initial ? obj.reduce(iterator, memo) : obj.reduce(iterator);
    }
    each(obj, function(value, index, list) {
      if (!initial && index === 0) {
        memo = value;
      } else {
        memo = iterator.call(context, memo, value, index, list);
      }
    });
    return memo;
  };

  // The right-associative version of reduce, also known as `foldr`.
  // Delegates to **ECMAScript 5**'s native `reduceRight` if available.
  _.reduceRight = _.foldr = function(obj, iterator, memo, context) {
    if (nativeReduceRight && obj.reduceRight === nativeReduceRight) {
      if (context) iterator = _.bind(iterator, context);
      return memo !== void 0 ? obj.reduceRight(iterator, memo) : obj.reduceRight(iterator);
    }
    var reversed = (_.isArray(obj) ? obj.slice() : _.toArray(obj)).reverse();
    return _.reduce(reversed, iterator, memo, context);
  };

  // Return the first value which passes a truth test. Aliased as `detect`.
  _.find = _.detect = function(obj, iterator, context) {
    var result;
    any(obj, function(value, index, list) {
      if (iterator.call(context, value, index, list)) {
        result = value;
        return true;
      }
    });
    return result;
  };

  // Return all the elements that pass a truth test.
  // Delegates to **ECMAScript 5**'s native `filter` if available.
  // Aliased as `select`.
  _.filter = _.select = function(obj, iterator, context) {
    if (nativeFilter && obj.filter === nativeFilter) return obj.filter(iterator, context);
    var results = [];
    each(obj, function(value, index, list) {
      if (iterator.call(context, value, index, list)) results[results.length] = value;
    });
    return results;
  };

  // Return all the elements for which a truth test fails.
  _.reject = function(obj, iterator, context) {
    var results = [];
    each(obj, function(value, index, list) {
      if (!iterator.call(context, value, index, list)) results[results.length] = value;
    });
    return results;
  };

  // Determine whether all of the elements match a truth test.
  // Delegates to **ECMAScript 5**'s native `every` if available.
  // Aliased as `all`.
  _.every = _.all = function(obj, iterator, context) {
    iterator = iterator || _.identity;
    if (nativeEvery && obj.every === nativeEvery) return obj.every(iterator, context);
    var result = true;
    each(obj, function(value, index, list) {
      if (!(result = result && iterator.call(context, value, index, list))) return breaker;
    });
    return result;
  };

  // Determine if at least one element in the object matches a truth test.
  // Delegates to **ECMAScript 5**'s native `some` if available.
  // Aliased as `any`.
  var any = _.some = _.any = function(obj, iterator, context) {
    iterator = iterator || _.identity;
    if (nativeSome && obj.some === nativeSome) return obj.some(iterator, context);
    var result = false;
    each(obj, function(value, index, list) {
      if (result = iterator.call(context, value, index, list)) return breaker;
    });
    return result;
  };

  // Determine if a given value is included in the array or object using `===`.
  // Aliased as `contains`.
  _.include = _.contains = function(obj, target) {
    if (nativeIndexOf && obj.indexOf === nativeIndexOf) return obj.indexOf(target) != -1;
    var found = false;
    any(obj, function(value) {
      if (found = value === target) return true;
    });
    return found;
  };

  // Invoke a method (with arguments) on every item in a collection.
  _.invoke = function(obj, method) {
    var args = slice.call(arguments, 2);
    return _.map(obj, function(value) {
      return (method ? value[method] : value).apply(value, args);
    });
  };

  // Convenience version of a common use case of `map`: fetching a property.
  _.pluck = function(obj, key) {
    return _.map(obj, function(value){ return value[key]; });
  };

  // Return the maximum element or (element-based computation).
  _.max = function(obj, iterator, context) {
    if (!iterator && _.isArray(obj)) return Math.max.apply(Math, obj);
    var result = {computed : -Infinity};
    each(obj, function(value, index, list) {
      var computed = iterator ? iterator.call(context, value, index, list) : value;
      computed >= result.computed && (result = {value : value, computed : computed});
    });
    return result.value;
  };

  // Return the minimum element (or element-based computation).
  _.min = function(obj, iterator, context) {
    if (!iterator && _.isArray(obj)) return Math.min.apply(Math, obj);
    var result = {computed : Infinity};
    each(obj, function(value, index, list) {
      var computed = iterator ? iterator.call(context, value, index, list) : value;
      computed < result.computed && (result = {value : value, computed : computed});
    });
    return result.value;
  };

  // Sort the object's values by a criterion produced by an iterator.
  _.sortBy = function(obj, iterator, context) {
    return _.pluck(_.map(obj, function(value, index, list) {
      return {
        value : value,
        criteria : iterator.call(context, value, index, list)
      };
    }).sort(function(left, right) {
      var a = left.criteria, b = right.criteria;
      return a < b ? -1 : a > b ? 1 : 0;
    }), 'value');
  };

  // Use a comparator function to figure out at what index an object should
  // be inserted so as to maintain order. Uses binary search.
  _.sortedIndex = function(array, obj, iterator) {
    iterator = iterator || _.identity;
    var low = 0, high = array.length;
    while (low < high) {
      var mid = (low + high) >> 1;
      iterator(array[mid]) < iterator(obj) ? low = mid + 1 : high = mid;
    }
    return low;
  };

  // Safely convert anything iterable into a real, live array.
  _.toArray = function(iterable) {
    if (!iterable)                return [];
    if (iterable.toArray)         return iterable.toArray();
    if (_.isArray(iterable))      return iterable;
    if (_.isArguments(iterable))  return slice.call(iterable);
    return _.values(iterable);
  };

  // Return the number of elements in an object.
  _.size = function(obj) {
    return _.toArray(obj).length;
  };

  // Array Functions
  // ---------------

  // Get the first element of an array. Passing **n** will return the first N
  // values in the array. Aliased as `head`. The **guard** check allows it to work
  // with `_.map`.
  _.first = _.head = function(array, n, guard) {
    return n && !guard ? slice.call(array, 0, n) : array[0];
  };

  // Returns everything but the first entry of the array. Aliased as `tail`.
  // Especially useful on the arguments object. Passing an **index** will return
  // the rest of the values in the array from that index onward. The **guard**
  // check allows it to work with `_.map`.
  _.rest = _.tail = function(array, index, guard) {
    return slice.call(array, _.isUndefined(index) || guard ? 1 : index);
  };

  // Get the last element of an array.
  _.last = function(array) {
    return array[array.length - 1];
  };

  // Trim out all falsy values from an array.
  _.compact = function(array) {
    return _.filter(array, function(value){ return !!value; });
  };

  // Return a completely flattened version of an array.
  _.flatten = function(array) {
    return _.reduce(array, function(memo, value) {
      if (_.isArray(value)) return memo.concat(_.flatten(value));
      memo[memo.length] = value;
      return memo;
    }, []);
  };

  // Return a version of the array that does not contain the specified value(s).
  _.without = function(array) {
    var values = slice.call(arguments, 1);
    return _.filter(array, function(value){ return !_.include(values, value); });
  };

  // Produce a duplicate-free version of the array. If the array has already
  // been sorted, you have the option of using a faster algorithm.
  // Aliased as `unique`.
  _.uniq = _.unique = function(array, isSorted) {
    return _.reduce(array, function(memo, el, i) {
      if (0 == i || (isSorted === true ? _.last(memo) != el : !_.include(memo, el))) memo[memo.length] = el;
      return memo;
    }, []);
  };

  // Produce an array that contains every item shared between all the
  // passed-in arrays.
  _.intersect = function(array) {
    var rest = slice.call(arguments, 1);
    return _.filter(_.uniq(array), function(item) {
      return _.every(rest, function(other) {
        return _.indexOf(other, item) >= 0;
      });
    });
  };

  // Zip together multiple lists into a single array -- elements that share
  // an index go together.
  _.zip = function() {
    var args = slice.call(arguments);
    var length = _.max(_.pluck(args, 'length'));
    var results = new Array(length);
    for (var i = 0; i < length; i++) results[i] = _.pluck(args, "" + i);
    return results;
  };

  // If the browser doesn't supply us with indexOf (I'm looking at you, **MSIE**),
  // we need this function. Return the position of the first occurrence of an
  // item in an array, or -1 if the item is not included in the array.
  // Delegates to **ECMAScript 5**'s native `indexOf` if available.
  _.indexOf = function(array, item) {
    if (nativeIndexOf && array.indexOf === nativeIndexOf) return array.indexOf(item);
    for (var i = 0, l = array.length; i < l; i++) if (array[i] === item) return i;
    return -1;
  };


  // Delegates to **ECMAScript 5**'s native `lastIndexOf` if available.
  _.lastIndexOf = function(array, item) {
    if (nativeLastIndexOf && array.lastIndexOf === nativeLastIndexOf) return array.lastIndexOf(item);
    var i = array.length;
    while (i--) if (array[i] === item) return i;
    return -1;
  };

  // Generate an integer Array containing an arithmetic progression. A port of
  // the native Python `range()` function. See
  // [the Python documentation](http://docs.python.org/library/functions.html#range).
  _.range = function(start, stop, step) {
    var args  = slice.call(arguments),
        solo  = args.length <= 1,
        start = solo ? 0 : args[0],
        stop  = solo ? args[0] : args[1],
        step  = args[2] || 1,
        len   = Math.max(Math.ceil((stop - start) / step), 0),
        idx   = 0,
        range = new Array(len);
    while (idx < len) {
      range[idx++] = start;
      start += step;
    }
    return range;
  };

  // Function (ahem) Functions
  // ------------------

  // Create a function bound to a given object (assigning `this`, and arguments,
  // optionally). Binding with arguments is also known as `curry`.
  _.bind = function(func, obj) {
    var args = slice.call(arguments, 2);
    return function() {
      return func.apply(obj || {}, args.concat(slice.call(arguments)));
    };
  };

  // Bind all of an object's methods to that object. Useful for ensuring that
  // all callbacks defined on an object belong to it.
  _.bindAll = function(obj) {
    var funcs = slice.call(arguments, 1);
    if (funcs.length == 0) funcs = _.functions(obj);
    each(funcs, function(f) { obj[f] = _.bind(obj[f], obj); });
    return obj;
  };

  // Memoize an expensive function by storing its results.
  _.memoize = function(func, hasher) {
    var memo = {};
    hasher = hasher || _.identity;
    return function() {
      var key = hasher.apply(this, arguments);
      return key in memo ? memo[key] : (memo[key] = func.apply(this, arguments));
    };
  };

  // Delays a function for the given number of milliseconds, and then calls
  // it with the arguments supplied.
  _.delay = function(func, wait) {
    var args = slice.call(arguments, 2);
    return setTimeout(function(){ return func.apply(func, args); }, wait);
  };

  // Defers a function, scheduling it to run after the current call stack has
  // cleared.
  _.defer = function(func) {
    return _.delay.apply(_, [func, 1].concat(slice.call(arguments, 1)));
  };

  // Internal function used to implement `_.throttle` and `_.debounce`.
  var limit = function(func, wait, debounce) {
    var timeout;
    return function() {
      var context = this, args = arguments;
      var throttler = function() {
        timeout = null;
        func.apply(context, args);
      };
      if (debounce) clearTimeout(timeout);
      if (debounce || !timeout) timeout = setTimeout(throttler, wait);
    };
  };

  // Returns a function, that, when invoked, will only be triggered at most once
  // during a given window of time.
  _.throttle = function(func, wait) {
    return limit(func, wait, false);
  };

  // Returns a function, that, as long as it continues to be invoked, will not
  // be triggered. The function will be called after it stops being called for
  // N milliseconds.
  _.debounce = function(func, wait) {
    return limit(func, wait, true);
  };

  // Returns the first function passed as an argument to the second,
  // allowing you to adjust arguments, run code before and after, and
  // conditionally execute the original function.
  _.wrap = function(func, wrapper) {
    return function() {
      var args = [func].concat(slice.call(arguments));
      return wrapper.apply(wrapper, args);
    };
  };

  // Returns a function that is the composition of a list of functions, each
  // consuming the return value of the function that follows.
  _.compose = function() {
    var funcs = slice.call(arguments);
    return function() {
      var args = slice.call(arguments);
      for (var i=funcs.length-1; i >= 0; i--) {
        args = [funcs[i].apply(this, args)];
      }
      return args[0];
    };
  };

  // Object Functions
  // ----------------

  // Retrieve the names of an object's properties.
  // Delegates to **ECMAScript 5**'s native `Object.keys`
  _.keys = nativeKeys || function(obj) {
    if (_.isArray(obj)) return _.range(0, obj.length);
    var keys = [];
    for (var key in obj) if (hasOwnProperty.call(obj, key)) keys[keys.length] = key;
    return keys;
  };

  // Retrieve the values of an object's properties.
  _.values = function(obj) {
    return _.map(obj, _.identity);
  };

  // Return a sorted list of the function names available on the object.
  // Aliased as `methods`
  _.functions = _.methods = function(obj) {
    return _.filter(_.keys(obj), function(key){ return _.isFunction(obj[key]); }).sort();
  };

  // Extend a given object with all the properties in passed-in object(s).
  _.extend = function(obj) {
    each(slice.call(arguments, 1), function(source) {
      for (var prop in source) obj[prop] = source[prop];
    });
    return obj;
  };

  // Create a (shallow-cloned) duplicate of an object.
  _.clone = function(obj) {
    return _.isArray(obj) ? obj.slice() : _.extend({}, obj);
  };

  // Invokes interceptor with the obj, and then returns obj.
  // The primary purpose of this method is to "tap into" a method chain, in
  // order to perform operations on intermediate results within the chain.
  _.tap = function(obj, interceptor) {
    interceptor(obj);
    return obj;
  };

  // Perform a deep comparison to check if two objects are equal.
  _.isEqual = function(a, b) {
    // Check object identity.
    if (a === b) return true;
    // Different types?
    var atype = typeof(a), btype = typeof(b);
    if (atype != btype) return false;
    // Basic equality test (watch out for coercions).
    if (a == b) return true;
    // One is falsy and the other truthy.
    if ((!a && b) || (a && !b)) return false;
    // One of them implements an isEqual()?
    if (a.isEqual) return a.isEqual(b);
    // Check dates' integer values.
    if (_.isDate(a) && _.isDate(b)) return a.getTime() === b.getTime();
    // Both are NaN?
    if (_.isNaN(a) && _.isNaN(b)) return false;
    // Compare regular expressions.
    if (_.isRegExp(a) && _.isRegExp(b))
      return a.source     === b.source &&
             a.global     === b.global &&
             a.ignoreCase === b.ignoreCase &&
             a.multiline  === b.multiline;
    // If a is not an object by this point, we can't handle it.
    if (atype !== 'object') return false;
    // Check for different array lengths before comparing contents.
    if (a.length && (a.length !== b.length)) return false;
    // Nothing else worked, deep compare the contents.
    var aKeys = _.keys(a), bKeys = _.keys(b);
    // Different object sizes?
    if (aKeys.length != bKeys.length) return false;
    // Recursive comparison of contents.
    for (var key in a) if (!(key in b) || !_.isEqual(a[key], b[key])) return false;
    return true;
  };

  // Is a given array or object empty?
  _.isEmpty = function(obj) {
    if (_.isArray(obj) || _.isString(obj)) return obj.length === 0;
    for (var key in obj) if (hasOwnProperty.call(obj, key)) return false;
    return true;
  };

  // Is a given value a DOM element?
  _.isElement = function(obj) {
    return !!(obj && obj.nodeType == 1);
  };

  // Is a given value an array?
  // Delegates to ECMA5's native Array.isArray
  _.isArray = nativeIsArray || function(obj) {
    return !!(obj && obj.concat && obj.unshift && !obj.callee);
  };

  // Is a given variable an arguments object?
  _.isArguments = function(obj) {
    return !!(obj && obj.callee);
  };

  // Is a given value a function?
  _.isFunction = function(obj) {
    return !!(obj && obj.constructor && obj.call && obj.apply);
  };

  // Is a given value a string?
  _.isString = function(obj) {
    return !!(obj === '' || (obj && obj.charCodeAt && obj.substr));
  };

  // Is a given value a number?
  _.isNumber = function(obj) {
    return !!(obj === 0 || (obj && obj.toExponential && obj.toFixed));
  };

  // Is the given value NaN -- this one is interesting. NaN != NaN, and
  // isNaN(undefined) == true, so we make sure it's a number first.
  _.isNaN = function(obj) {
    return toString.call(obj) === '[object Number]' && isNaN(obj);
  };

  // Is a given value a boolean?
  _.isBoolean = function(obj) {
    return obj === true || obj === false;
  };

  // Is a given value a date?
  _.isDate = function(obj) {
    return !!(obj && obj.getTimezoneOffset && obj.setUTCFullYear);
  };

  // Is the given value a regular expression?
  _.isRegExp = function(obj) {
    return !!(obj && obj.test && obj.exec && (obj.ignoreCase || obj.ignoreCase === false));
  };

  // Is a given value equal to null?
  _.isNull = function(obj) {
    return obj === null;
  };

  // Is a given variable undefined?
  _.isUndefined = function(obj) {
    return obj === void 0;
  };

  // Utility Functions
  // -----------------

  // Run Underscore.js in *noConflict* mode, returning the `_` variable to its
  // previous owner. Returns a reference to the Underscore object.
  _.noConflict = function() {
    root._ = previousUnderscore;
    return this;
  };

  // Keep the identity function around for default iterators.
  _.identity = function(value) {
    return value;
  };

  // Run a function **n** times.
  _.times = function (n, iterator, context) {
    for (var i = 0; i < n; i++) iterator.call(context, i);
  };

  // Add your own custom functions to the Underscore object, ensuring that
  // they're correctly added to the OOP wrapper as well.
  _.mixin = function(obj) {
    each(_.functions(obj), function(name){
      addToWrapper(name, _[name] = obj[name]);
    });
  };

  // Generate a unique integer id (unique within the entire client session).
  // Useful for temporary DOM ids.
  var idCounter = 0;
  _.uniqueId = function(prefix) {
    var id = idCounter++;
    return prefix ? prefix + id : id;
  };

  // By default, Underscore uses ERB-style template delimiters, change the
  // following template settings to use alternative delimiters.
  _.templateSettings = {
    evaluate    : /<%([\s\S]+?)%>/g,
    interpolate : /<%=([\s\S]+?)%>/g
  };

  // JavaScript micro-templating, similar to John Resig's implementation.
  // Underscore templating handles arbitrary delimiters, preserves whitespace,
  // and correctly escapes quotes within interpolated code.
  _.template = function(str, data) {
    var c  = _.templateSettings;
    var tmpl = 'var __p=[],print=function(){__p.push.apply(__p,arguments);};' +
      'with(obj||{}){__p.push(\'' +
      str.replace(/\\/g, '\\\\')
         .replace(/'/g, "\\'")
         .replace(c.interpolate, function(match, code) {
           return "'," + code.replace(/\\'/g, "'") + ",'";
         })
         .replace(c.evaluate || null, function(match, code) {
           return "');" + code.replace(/\\'/g, "'")
                              .replace(/[\r\n\t]/g, ' ') + "__p.push('";
         })
         .replace(/\r/g, '\\r')
         .replace(/\n/g, '\\n')
         .replace(/\t/g, '\\t')
         + "');}return __p.join('');";
    var func = new Function('obj', tmpl);
    return data ? func(data) : func;
  };

  // The OOP Wrapper
  // ---------------

  // If Underscore is called as a function, it returns a wrapped object that
  // can be used OO-style. This wrapper holds altered versions of all the
  // underscore functions. Wrapped objects may be chained.
  var wrapper = function(obj) { this._wrapped = obj; };

  // Expose `wrapper.prototype` as `_.prototype`
  _.prototype = wrapper.prototype;

  // Helper function to continue chaining intermediate results.
  var result = function(obj, chain) {
    return chain ? _(obj).chain() : obj;
  };

  // A method to easily add functions to the OOP wrapper.
  var addToWrapper = function(name, func) {
    wrapper.prototype[name] = function() {
      var args = slice.call(arguments);
      unshift.call(args, this._wrapped);
      return result(func.apply(_, args), this._chain);
    };
  };

  // Add all of the Underscore functions to the wrapper object.
  _.mixin(_);

  // Add all mutator Array functions to the wrapper.
  each(['pop', 'push', 'reverse', 'shift', 'sort', 'splice', 'unshift'], function(name) {
    var method = ArrayProto[name];
    wrapper.prototype[name] = function() {
      method.apply(this._wrapped, arguments);
      return result(this._wrapped, this._chain);
    };
  });

  // Add all accessor Array functions to the wrapper.
  each(['concat', 'join', 'slice'], function(name) {
    var method = ArrayProto[name];
    wrapper.prototype[name] = function() {
      return result(method.apply(this._wrapped, arguments), this._chain);
    };
  });

  // Start chaining a wrapped Underscore object.
  wrapper.prototype.chain = function() {
    this._chain = true;
    return this;
  };

  // Extracts the result from a wrapped and chained object.
  wrapper.prototype.value = function() {
    return this._wrapped;
  };

})();

//     Backbone.js 0.3.3
//     (c) 2010 Jeremy Ashkenas, DocumentCloud Inc.
//     Backbone may be freely distributed under the MIT license.
//     For all details and documentation:
//     http://documentcloud.github.com/backbone

(function(){

  // Initial Setup
  // -------------

  // The top-level namespace. All public Backbone classes and modules will
  // be attached to this. Exported for both CommonJS and the browser.
  var Backbone;
  if (typeof exports !== 'undefined') {
    Backbone = exports;
  } else {
    Backbone = this.Backbone = {};
  }

  // Current version of the library. Keep in sync with `package.json`.
  Backbone.VERSION = '0.3.3';

  // Require Underscore, if we're on the server, and it's not already present.
  var _ = this._;
  if (!_ && (typeof require !== 'undefined')) _ = require("underscore")._;

  // For Backbone's purposes, either jQuery or Zepto owns the `$` variable.
  var $ = this.jQuery || this.Zepto;

  // Turn on `emulateHTTP` to use support legacy HTTP servers. Setting this option will
  // fake `"PUT"` and `"DELETE"` requests via the `_method` parameter and set a
  // `X-Http-Method-Override` header.
  Backbone.emulateHTTP = false;

  // Turn on `emulateJSON` to support legacy servers that can't deal with direct
  // `application/json` requests ... will encode the body as
  // `application/x-www-form-urlencoded` instead and will send the model in a
  // form param named `model`.
  Backbone.emulateJSON = false;

  // Backbone.Events
  // -----------------

  // A module that can be mixed in to *any object* in order to provide it with
  // custom events. You may `bind` or `unbind` a callback function to an event;
  // `trigger`-ing an event fires all callbacks in succession.
  //
  //     var object = {};
  //     _.extend(object, Backbone.Events);
  //     object.bind('expand', function(){ alert('expanded'); });
  //     object.trigger('expand');
  //
  Backbone.Events = {

    // Bind an event, specified by a string name, `ev`, to a `callback` function.
    // Passing `"all"` will bind the callback to all events fired.
    bind : function(ev, callback) {
      var calls = this._callbacks || (this._callbacks = {});
      var list  = this._callbacks[ev] || (this._callbacks[ev] = []);
      list.push(callback);
      return this;
    },

    // Remove one or many callbacks. If `callback` is null, removes all
    // callbacks for the event. If `ev` is null, removes all bound callbacks
    // for all events.
    unbind : function(ev, callback) {
      var calls;
      if (!ev) {
        this._callbacks = {};
      } else if (calls = this._callbacks) {
        if (!callback) {
          calls[ev] = [];
        } else {
          var list = calls[ev];
          if (!list) return this;
          for (var i = 0, l = list.length; i < l; i++) {
            if (callback === list[i]) {
              list.splice(i, 1);
              break;
            }
          }
        }
      }
      return this;
    },

    // Trigger an event, firing all bound callbacks. Callbacks are passed the
    // same arguments as `trigger` is, apart from the event name.
    // Listening for `"all"` passes the true event name as the first argument.
    trigger : function(ev) {
      var list, calls, i, l;
      if (!(calls = this._callbacks)) return this;
      if (list = calls[ev]) {
        for (i = 0, l = list.length; i < l; i++) {
          list[i].apply(this, Array.prototype.slice.call(arguments, 1));
        }
      }
      if (list = calls['all']) {
        for (i = 0, l = list.length; i < l; i++) {
          list[i].apply(this, arguments);
        }
      }
      return this;
    }

  };

  // Backbone.Model
  // --------------

  // Create a new model, with defined attributes. A client id (`cid`)
  // is automatically generated and assigned for you.
  Backbone.Model = function(attributes, options) {
    attributes || (attributes = {});
    if (this.defaults) attributes = _.extend({}, this.defaults, attributes);
    this.attributes = {};
    this._escapedAttributes = {};
    this.cid = _.uniqueId('c');
    this.set(attributes, {silent : true});
    this._previousAttributes = _.clone(this.attributes);
    if (options && options.collection) this.collection = options.collection;
    this.initialize(attributes, options);
  };

  // Attach all inheritable methods to the Model prototype.
  _.extend(Backbone.Model.prototype, Backbone.Events, {

    // A snapshot of the model's previous attributes, taken immediately
    // after the last `"change"` event was fired.
    _previousAttributes : null,

    // Has the item been changed since the last `"change"` event?
    _changed : false,

    // Initialize is an empty function by default. Override it with your own
    // initialization logic.
    initialize : function(){},

    // Return a copy of the model's `attributes` object.
    toJSON : function() {
      return _.clone(this.attributes);
    },

    // Get the value of an attribute.
    get : function(attr) {
      return this.attributes[attr];
    },

    // Get the HTML-escaped value of an attribute.
    escape : function(attr) {
      var html;
      if (html = this._escapedAttributes[attr]) return html;
      var val = this.attributes[attr];
      return this._escapedAttributes[attr] = escapeHTML(val == null ? '' : val);
    },

    // Set a hash of model attributes on the object, firing `"change"` unless you
    // choose to silence it.
    set : function(attrs, options) {

      // Extract attributes and options.
      options || (options = {});
      if (!attrs) return this;
      if (attrs.attributes) attrs = attrs.attributes;
      var now = this.attributes, escaped = this._escapedAttributes;

      // Run validation.
      if (!options.silent && this.validate && !this._performValidation(attrs, options)) return false;

      // Check for changes of `id`.
      if ('id' in attrs) this.id = attrs.id;

      // Update attributes.
      for (var attr in attrs) {
        var val = attrs[attr];
        if (!_.isEqual(now[attr], val)) {
          now[attr] = val;
          delete escaped[attr];
          if (!options.silent) {
            this._changed = true;
            this.trigger('change:' + attr, this, val, options);
          }
        }
      }

      // Fire the `"change"` event, if the model has been changed.
      if (!options.silent && this._changed) this.change(options);
      return this;
    },

    // Remove an attribute from the model, firing `"change"` unless you choose
    // to silence it.
    unset : function(attr, options) {
      options || (options = {});
      var value = this.attributes[attr];

      // Run validation.
      var validObj = {};
      validObj[attr] = void 0;
      if (!options.silent && this.validate && !this._performValidation(validObj, options)) return false;

      // Remove the attribute.
      delete this.attributes[attr];
      delete this._escapedAttributes[attr];
      if (!options.silent) {
        this._changed = true;
        this.trigger('change:' + attr, this, void 0, options);
        this.change(options);
      }
      return this;
    },

    // Clear all attributes on the model, firing `"change"` unless you choose
    // to silence it.
    clear : function(options) {
      options || (options = {});
      var old = this.attributes;

      // Run validation.
      var validObj = {};
      for (attr in old) validObj[attr] = void 0;
      if (!options.silent && this.validate && !this._performValidation(validObj, options)) return false;

      this.attributes = {};
      this._escapedAttributes = {};
      if (!options.silent) {
        this._changed = true;
        for (attr in old) {
          this.trigger('change:' + attr, this, void 0, options);
        }
        this.change(options);
      }
      return this;
    },

    // Fetch the model from the server. If the server's representation of the
    // model differs from its current attributes, they will be overriden,
    // triggering a `"change"` event.
    fetch : function(options) {
      options || (options = {});
      var model = this;
      var success = function(resp) {
        if (!model.set(model.parse(resp), options)) return false;
        if (options.success) options.success(model, resp);
      };
      var error = wrapError(options.error, model, options);
      (this.sync || Backbone.sync)('read', this, success, error);
      return this;
    },

    // Set a hash of model attributes, and sync the model to the server.
    // If the server returns an attributes hash that differs, the model's
    // state will be `set` again.
    save : function(attrs, options) {
      options || (options = {});
      if (attrs && !this.set(attrs, options)) return false;
      var model = this;
      var success = function(resp) {
        if (!model.set(model.parse(resp), options)) return false;
        if (options.success) options.success(model, resp);
      };
      var error = wrapError(options.error, model, options);
      var method = this.isNew() ? 'create' : 'update';
      (this.sync || Backbone.sync)(method, this, success, error);
      return this;
    },

    // Destroy this model on the server. Upon success, the model is removed
    // from its collection, if it has one.
    destroy : function(options) {
      options || (options = {});
      var model = this;
      var success = function(resp) {
        if (model.collection) model.collection.remove(model);
        if (options.success) options.success(model, resp);
      };
      var error = wrapError(options.error, model, options);
      (this.sync || Backbone.sync)('delete', this, success, error);
      return this;
    },

    // Default URL for the model's representation on the server -- if you're
    // using Backbone's restful methods, override this to change the endpoint
    // that will be called.
    url : function() {
      var base = getUrl(this.collection);
      if (this.isNew()) return base;
      return base + (base.charAt(base.length - 1) == '/' ? '' : '/') + this.id;
    },

    // **parse** converts a response into the hash of attributes to be `set` on
    // the model. The default implementation is just to pass the response along.
    parse : function(resp) {
      return resp;
    },

    // Create a new model with identical attributes to this one.
    clone : function() {
      return new this.constructor(this);
    },

    // A model is new if it has never been saved to the server, and has a negative
    // ID.
    isNew : function() {
      return !this.id;
    },

    // Call this method to manually fire a `change` event for this model.
    // Calling this will cause all objects observing the model to update.
    change : function(options) {
      this.trigger('change', this, options);
      this._previousAttributes = _.clone(this.attributes);
      this._changed = false;
    },

    // Determine if the model has changed since the last `"change"` event.
    // If you specify an attribute name, determine if that attribute has changed.
    hasChanged : function(attr) {
      if (attr) return this._previousAttributes[attr] != this.attributes[attr];
      return this._changed;
    },

    // Return an object containing all the attributes that have changed, or false
    // if there are no changed attributes. Useful for determining what parts of a
    // view need to be updated and/or what attributes need to be persisted to
    // the server.
    changedAttributes : function(now) {
      now || (now = this.attributes);
      var old = this._previousAttributes;
      var changed = false;
      for (var attr in now) {
        if (!_.isEqual(old[attr], now[attr])) {
          changed = changed || {};
          changed[attr] = now[attr];
        }
      }
      return changed;
    },

    // Get the previous value of an attribute, recorded at the time the last
    // `"change"` event was fired.
    previous : function(attr) {
      if (!attr || !this._previousAttributes) return null;
      return this._previousAttributes[attr];
    },

    // Get all of the attributes of the model at the time of the previous
    // `"change"` event.
    previousAttributes : function() {
      return _.clone(this._previousAttributes);
    },

    // Run validation against a set of incoming attributes, returning `true`
    // if all is well. If a specific `error` callback has been passed,
    // call that instead of firing the general `"error"` event.
    _performValidation : function(attrs, options) {
      var error = this.validate(attrs);
      if (error) {
        if (options.error) {
          options.error(this, error);
        } else {
          this.trigger('error', this, error, options);
        }
        return false;
      }
      return true;
    }

  });

  // Backbone.Collection
  // -------------------

  // Provides a standard collection class for our sets of models, ordered
  // or unordered. If a `comparator` is specified, the Collection will maintain
  // its models in sort order, as they're added and removed.
  Backbone.Collection = function(models, options) {
    options || (options = {});
    if (options.comparator) {
      this.comparator = options.comparator;
      delete options.comparator;
    }
    this._boundOnModelEvent = _.bind(this._onModelEvent, this);
    this._reset();
    if (models) this.refresh(models, {silent: true});
    this.initialize(models, options);
  };

  // Define the Collection's inheritable methods.
  _.extend(Backbone.Collection.prototype, Backbone.Events, {

    // The default model for a collection is just a **Backbone.Model**.
    // This should be overridden in most cases.
    model : Backbone.Model,

    // Initialize is an empty function by default. Override it with your own
    // initialization logic.
    initialize : function(){},

    // The JSON representation of a Collection is an array of the
    // models' attributes.
    toJSON : function() {
      return this.map(function(model){ return model.toJSON(); });
    },

    // Add a model, or list of models to the set. Pass **silent** to avoid
    // firing the `added` event for every new model.
    add : function(models, options) {
      if (_.isArray(models)) {
        for (var i = 0, l = models.length; i < l; i++) {
          this._add(models[i], options);
        }
      } else {
        this._add(models, options);
      }
      return this;
    },

    // Remove a model, or a list of models from the set. Pass silent to avoid
    // firing the `removed` event for every model removed.
    remove : function(models, options) {
      if (_.isArray(models)) {
        for (var i = 0, l = models.length; i < l; i++) {
          this._remove(models[i], options);
        }
      } else {
        this._remove(models, options);
      }
      return this;
    },

    // Get a model from the set by id.
    get : function(id) {
      if (id == null) return null;
      return this._byId[id.id != null ? id.id : id];
    },

    // Get a model from the set by client id.
    getByCid : function(cid) {
      return cid && this._byCid[cid.cid || cid];
    },

    // Get the model at the given index.
    at: function(index) {
      return this.models[index];
    },

    // Force the collection to re-sort itself. You don't need to call this under normal
    // circumstances, as the set will maintain sort order as each item is added.
    sort : function(options) {
      options || (options = {});
      if (!this.comparator) throw new Error('Cannot sort a set without a comparator');
      this.models = this.sortBy(this.comparator);
      if (!options.silent) this.trigger('refresh', this, options);
      return this;
    },

    // Pluck an attribute from each model in the collection.
    pluck : function(attr) {
      return _.map(this.models, function(model){ return model.get(attr); });
    },

    // When you have more items than you want to add or remove individually,
    // you can refresh the entire set with a new list of models, without firing
    // any `added` or `removed` events. Fires `refresh` when finished.
    refresh : function(models, options) {
      models  || (models = []);
      options || (options = {});
      this._reset();
      this.add(models, {silent: true});
      if (!options.silent) this.trigger('refresh', this, options);
      return this;
    },

    // Fetch the default set of models for this collection, refreshing the
    // collection when they arrive.
    fetch : function(options) {
      options || (options = {});
      var collection = this;
      var success = function(resp) {
        collection.refresh(collection.parse(resp));
        if (options.success) options.success(collection, resp);
      };
      var error = wrapError(options.error, collection, options);
      (this.sync || Backbone.sync)('read', this, success, error);
      return this;
    },

    // Create a new instance of a model in this collection. After the model
    // has been created on the server, it will be added to the collection.
    create : function(model, options) {
      var coll = this;
      options || (options = {});
      if (!(model instanceof Backbone.Model)) {
        model = new this.model(model, {collection: coll});
      } else {
        model.collection = coll;
      }
      var success = function(nextModel, resp) {
        coll.add(nextModel);
        if (options.success) options.success(nextModel, resp);
      };
      return model.save(null, {success : success, error : options.error});
    },

    // **parse** converts a response into a list of models to be added to the
    // collection. The default implementation is just to pass it through.
    parse : function(resp) {
      return resp;
    },

    // Proxy to _'s chain. Can't be proxied the same way the rest of the
    // underscore methods are proxied because it relies on the underscore
    // constructor.
    chain: function () {
      return _(this.models).chain();
    },

    // Reset all internal state. Called when the collection is refreshed.
    _reset : function(options) {
      this.length = 0;
      this.models = [];
      this._byId  = {};
      this._byCid = {};
    },

    // Internal implementation of adding a single model to the set, updating
    // hash indexes for `id` and `cid` lookups.
    _add : function(model, options) {
      options || (options = {});
      if (!(model instanceof Backbone.Model)) {
        model = new this.model(model, {collection: this});
      }
      var already = this.getByCid(model);
      if (already) throw new Error(["Can't add the same model to a set twice", already.id]);
      this._byId[model.id] = model;
      this._byCid[model.cid] = model;
      model.collection = this;
      var index = this.comparator ? this.sortedIndex(model, this.comparator) : this.length;
      this.models.splice(index, 0, model);
      model.bind('all', this._boundOnModelEvent);
      this.length++;
      if (!options.silent) model.trigger('add', model, this, options);
      return model;
    },

    // Internal implementation of removing a single model from the set, updating
    // hash indexes for `id` and `cid` lookups.
    _remove : function(model, options) {
      options || (options = {});
      model = this.getByCid(model) || this.get(model);
      if (!model) return null;
      delete this._byId[model.id];
      delete this._byCid[model.cid];
      delete model.collection;
      this.models.splice(this.indexOf(model), 1);
      this.length--;
      if (!options.silent) model.trigger('remove', model, this, options);
      model.unbind('all', this._boundOnModelEvent);
      return model;
    },

    // Internal method called every time a model in the set fires an event.
    // Sets need to update their indexes when models change ids. All other
    // events simply proxy through.
    _onModelEvent : function(ev, model) {
      if (ev === 'change:id') {
        delete this._byId[model.previous('id')];
        this._byId[model.id] = model;
      }
      this.trigger.apply(this, arguments);
    }

  });

  // Underscore methods that we want to implement on the Collection.
  var methods = ['forEach', 'each', 'map', 'reduce', 'reduceRight', 'find', 'detect',
    'filter', 'select', 'reject', 'every', 'all', 'some', 'any', 'include',
    'invoke', 'max', 'min', 'sortBy', 'sortedIndex', 'toArray', 'size',
    'first', 'rest', 'last', 'without', 'indexOf', 'lastIndexOf', 'isEmpty'];

  // Mix in each Underscore method as a proxy to `Collection#models`.
  _.each(methods, function(method) {
    Backbone.Collection.prototype[method] = function() {
      return _[method].apply(_, [this.models].concat(_.toArray(arguments)));
    };
  });

  // Backbone.Controller
  // -------------------

  // Controllers map faux-URLs to actions, and fire events when routes are
  // matched. Creating a new one sets its `routes` hash, if not set statically.
  Backbone.Controller = function(options) {
    options || (options = {});
    if (options.routes) this.routes = options.routes;
    this._bindRoutes();
    this.initialize(options);
  };

  // Cached regular expressions for matching named param parts and splatted
  // parts of route strings.
  var namedParam = /:([\w\d]+)/g;
  var splatParam = /\*([\w\d]+)/g;

  // Set up all inheritable **Backbone.Controller** properties and methods.
  _.extend(Backbone.Controller.prototype, Backbone.Events, {

    // Initialize is an empty function by default. Override it with your own
    // initialization logic.
    initialize : function(){},

    // Manually bind a single named route to a callback. For example:
    //
    //     this.route('search/:query/p:num', 'search', function(query, num) {
    //       ...
    //     });
    //
    route : function(route, name, callback) {
      Backbone.history || (Backbone.history = new Backbone.History);
      if (!_.isRegExp(route)) route = this._routeToRegExp(route);
      Backbone.history.route(route, _.bind(function(fragment) {
        var args = this._extractParameters(route, fragment);
        callback.apply(this, args);
        this.trigger.apply(this, ['route:' + name].concat(args));
      }, this));
    },

    // Simple proxy to `Backbone.history` to save a fragment into the history,
    // without triggering routes.
    saveLocation : function(fragment) {
      Backbone.history.saveLocation(fragment);
    },

    // Bind all defined routes to `Backbone.history`.
    _bindRoutes : function() {
      if (!this.routes) return;
      for (var route in this.routes) {
        var name = this.routes[route];
        this.route(route, name, this[name]);
      }
    },

    // Convert a route string into a regular expression, suitable for matching
    // against the current location fragment.
    _routeToRegExp : function(route) {
      route = route.replace(namedParam, "([^\/]*)").replace(splatParam, "(.*?)");
      return new RegExp('^' + route + '$');
    },

    // Given a route, and a URL fragment that it matches, return the array of
    // extracted parameters.
    _extractParameters : function(route, fragment) {
      return route.exec(fragment).slice(1);
    }

  });

  // Backbone.History
  // ----------------

  // Handles cross-browser history management, based on URL hashes. If the
  // browser does not support `onhashchange`, falls back to polling.
  Backbone.History = function() {
    this.handlers = [];
    this.fragment = this.getFragment();
    _.bindAll(this, 'checkUrl');
  };

  // Cached regex for cleaning hashes.
  var hashStrip = /^#*/;

  // Set up all inheritable **Backbone.History** properties and methods.
  _.extend(Backbone.History.prototype, {

    // The default interval to poll for hash changes, if necessary, is
    // twenty times a second.
    interval: 50,

    // Get the cross-browser normalized URL fragment.
    getFragment : function(loc) {
      return (loc || window.location).hash.replace(hashStrip, '');
    },

    // Start the hash change handling, returning `true` if the current URL matches
    // an existing route, and `false` otherwise.
    start : function() {
      var docMode = document.documentMode;
      var oldIE = ($.browser.msie && (!docMode || docMode <= 7));
      if (oldIE) {
        this.iframe = $('<iframe src="javascript:0" tabindex="-1" />').hide().appendTo('body')[0].contentWindow;
      }
      if ('onhashchange' in window && !oldIE) {
        $(window).bind('hashchange', this.checkUrl);
      } else {
        setInterval(this.checkUrl, this.interval);
      }
      return this.loadUrl();
    },

    // Add a route to be tested when the hash changes. Routes are matched in the
    // order they are added.
    route : function(route, callback) {
      this.handlers.push({route : route, callback : callback});
    },

    // Checks the current URL to see if it has changed, and if it has,
    // calls `loadUrl`, normalizing across the hidden iframe.
    checkUrl : function() {
      var current = this.getFragment();
      if (current == this.fragment && this.iframe) {
        current = this.getFragment(this.iframe.location);
      }
      if (current == this.fragment ||
          current == decodeURIComponent(this.fragment)) return false;
      if (this.iframe) {
        window.location.hash = this.iframe.location.hash = current;
      }
      this.loadUrl();
    },

    // Attempt to load the current URL fragment. If a route succeeds with a
    // match, returns `true`. If no defined routes matches the fragment,
    // returns `false`.
    loadUrl : function() {
      var fragment = this.fragment = this.getFragment();
      var matched = _.any(this.handlers, function(handler) {
        if (handler.route.test(fragment)) {
          handler.callback(fragment);
          return true;
        }
      });
      return matched;
    },

    // Save a fragment into the hash history. You are responsible for properly
    // URL-encoding the fragment in advance. This does not trigger
    // a `hashchange` event.
    saveLocation : function(fragment) {
      fragment = (fragment || '').replace(hashStrip, '');
      if (this.fragment == fragment) return;
      window.location.hash = this.fragment = fragment;
      if (this.iframe && (fragment != this.getFragment(this.iframe.location))) {
        this.iframe.document.open().close();
        this.iframe.location.hash = fragment;
      }
    }

  });

  // Backbone.View
  // -------------

  // Creating a Backbone.View creates its initial element outside of the DOM,
  // if an existing element is not provided...
  Backbone.View = function(options) {
    this._configure(options || {});
    this._ensureElement();
    this.delegateEvents();
    this.initialize(options);
  };

  // Element lookup, scoped to DOM elements within the current view.
  // This should be prefered to global lookups, if you're dealing with
  // a specific view.
  var selectorDelegate = function(selector) {
    return $(selector, this.el);
  };

  // Cached regex to split keys for `delegate`.
  var eventSplitter = /^(\w+)\s*(.*)$/;

  // Set up all inheritable **Backbone.View** properties and methods.
  _.extend(Backbone.View.prototype, Backbone.Events, {

    // The default `tagName` of a View's element is `"div"`.
    tagName : 'div',

    // Attach the `selectorDelegate` function as the `$` property.
    $       : selectorDelegate,

    // Initialize is an empty function by default. Override it with your own
    // initialization logic.
    initialize : function(){},

    // **render** is the core function that your view should override, in order
    // to populate its element (`this.el`), with the appropriate HTML. The
    // convention is for **render** to always return `this`.
    render : function() {
      return this;
    },

    // Remove this view from the DOM. Note that the view isn't present in the
    // DOM by default, so calling this method may be a no-op.
    remove : function() {
      $(this.el).remove();
      return this;
    },

    // For small amounts of DOM Elements, where a full-blown template isn't
    // needed, use **make** to manufacture elements, one at a time.
    //
    //     var el = this.make('li', {'class': 'row'}, this.model.get('title'));
    //
    make : function(tagName, attributes, content) {
      var el = document.createElement(tagName);
      if (attributes) $(el).attr(attributes);
      if (content) $(el).html(content);
      return el;
    },

    // Set callbacks, where `this.callbacks` is a hash of
    //
    // *{"event selector": "callback"}*
    //
    //     {
    //       'mousedown .title':  'edit',
    //       'click .button':     'save'
    //     }
    //
    // pairs. Callbacks will be bound to the view, with `this` set properly.
    // Uses event delegation for efficiency.
    // Omitting the selector binds the event to `this.el`.
    // This only works for delegate-able events: not `focus`, `blur`, and
    // not `change`, `submit`, and `reset` in Internet Explorer.
    delegateEvents : function(events) {
      if (!(events || (events = this.events))) return;
      $(this.el).unbind();
      for (var key in events) {
        var methodName = events[key];
        var match = key.match(eventSplitter);
        var eventName = match[1], selector = match[2];
        var method = _.bind(this[methodName], this);
        if (selector === '') {
          $(this.el).bind(eventName, method);
        } else {
          $(this.el).delegate(selector, eventName, method);
        }
      }
    },

    // Performs the initial configuration of a View with a set of options.
    // Keys with special meaning *(model, collection, id, className)*, are
    // attached directly to the view.
    _configure : function(options) {
      if (this.options) options = _.extend({}, this.options, options);
      if (options.model)      this.model      = options.model;
      if (options.collection) this.collection = options.collection;
      if (options.el)         this.el         = options.el;
      if (options.id)         this.id         = options.id;
      if (options.className)  this.className  = options.className;
      if (options.tagName)    this.tagName    = options.tagName;
      this.options = options;
    },

    // Ensure that the View has a DOM element to render into.
    _ensureElement : function() {
      if (this.el) return;
      var attrs = {};
      if (this.id) attrs.id = this.id;
      if (this.className) attrs["class"] = this.className;
      this.el = this.make(this.tagName, attrs);
    }

  });

  // The self-propagating extend function that Backbone classes use.
  var extend = function (protoProps, classProps) {
    var child = inherits(this, protoProps, classProps);
    child.extend = extend;
    return child;
  };

  // Set up inheritance for the model, collection, and view.
  Backbone.Model.extend = Backbone.Collection.extend =
    Backbone.Controller.extend = Backbone.View.extend = extend;

  // Map from CRUD to HTTP for our default `Backbone.sync` implementation.
  var methodMap = {
    'create': 'POST',
    'update': 'PUT',
    'delete': 'DELETE',
    'read'  : 'GET'
  };

  // Backbone.sync
  // -------------

  // Override this function to change the manner in which Backbone persists
  // models to the server. You will be passed the type of request, and the
  // model in question. By default, uses makes a RESTful Ajax request
  // to the model's `url()`. Some possible customizations could be:
  //
  // * Use `setTimeout` to batch rapid-fire updates into a single request.
  // * Send up the models as XML instead of JSON.
  // * Persist models via WebSockets instead of Ajax.
  //
  // Turn on `Backbone.emulateHTTP` in order to send `PUT` and `DELETE` requests
  // as `POST`, with a `_method` parameter containing the true HTTP method,
  // as well as all requests with the body as `application/x-www-form-urlencoded` instead of
  // `application/json` with the model in a param named `model`.
  // Useful when interfacing with server-side languages like **PHP** that make
  // it difficult to read the body of `PUT` requests.
  Backbone.sync = function(method, model, success, error) {
    var type = methodMap[method];
    var modelJSON = (method === 'create' || method === 'update') ?
                    JSON.stringify(model.toJSON()) : null;

    // Default JSON-request options.
    var params = {
      url:          getUrl(model),
      type:         type,
      contentType:  'application/json',
      data:         modelJSON,
      dataType:     'json',
      processData:  false,
      success:      success,
      error:        error
    };

    // For older servers, emulate JSON by encoding the request into an HTML-form.
    if (Backbone.emulateJSON) {
      params.contentType = 'application/x-www-form-urlencoded';
      params.processData = true;
      params.data        = modelJSON ? {model : modelJSON} : {};
    }

    // For older servers, emulate HTTP by mimicking the HTTP method with `_method`
    // And an `X-HTTP-Method-Override` header.
    if (Backbone.emulateHTTP) {
      if (type === 'PUT' || type === 'DELETE') {
        if (Backbone.emulateJSON) params.data._method = type;
        params.type = 'POST';
        params.beforeSend = function(xhr) {
          xhr.setRequestHeader("X-HTTP-Method-Override", type);
        };
      }
    }

    // Make the request.
    $.ajax(params);
  };

  // Helpers
  // -------

  // Shared empty constructor function to aid in prototype-chain creation.
  var ctor = function(){};

  // Helper function to correctly set up the prototype chain, for subclasses.
  // Similar to `goog.inherits`, but uses a hash of prototype properties and
  // class properties to be extended.
  var inherits = function(parent, protoProps, staticProps) {
    var child;

    // The constructor function for the new subclass is either defined by you
    // (the "constructor" property in your `extend` definition), or defaulted
    // by us to simply call `super()`.
    if (protoProps && protoProps.hasOwnProperty('constructor')) {
      child = protoProps.constructor;
    } else {
      child = function(){ return parent.apply(this, arguments); };
    }

    // Set the prototype chain to inherit from `parent`, without calling
    // `parent`'s constructor function.
    ctor.prototype = parent.prototype;
    child.prototype = new ctor();

    // Add prototype properties (instance properties) to the subclass,
    // if supplied.
    if (protoProps) _.extend(child.prototype, protoProps);

    // Add static properties to the constructor function, if supplied.
    if (staticProps) _.extend(child, staticProps);

    // Correctly set child's `prototype.constructor`, for `instanceof`.
    child.prototype.constructor = child;

    // Set a convenience property in case the parent's prototype is needed later.
    child.__super__ = parent.prototype;

    return child;
  };

  // Helper function to get a URL from a Model or Collection as a property
  // or as a function.
  var getUrl = function(object) {
    if (!(object && object.url)) throw new Error("A 'url' property or function must be specified");
    return _.isFunction(object.url) ? object.url() : object.url;
  };

  // Wrap an optional error callback with a fallback error event.
  var wrapError = function(onError, model, options) {
    return function(resp) {
      if (onError) {
        onError(model, resp);
      } else {
        model.trigger('error', model, resp, options);
      }
    };
  };

  // Helper function to escape a string for HTML rendering.
  var escapeHTML = function(string) {
    return string.replace(/&(?!\w+;)/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
  };

})();

function html_escape(text) {
  return (text + "").
    replace(/&/g, "&amp;").
    replace(/</g, "&lt;").
    replace(/>/g, "&gt;").
    replace(/\"/g, "&quot;");
}

function haml_js_execute(template_var, context, locals) {
  return (function () {
    with(locals || {}) {
      try {
        return eval("(" + window[template_var] + ")");
      } catch (e) {
        debug(e)
        return "\n<pre class='error'>error executing template: " + template_var + "</pre>\n";
      }

    }
  }).call(context);
};

(function(f,a){var h=document.createElement("div"),g=("backgroundColor borderBottomColor borderBottomWidth borderLeftColor borderLeftWidth borderRightColor borderRightWidth borderSpacing borderTopColor borderTopWidth bottom color fontSize fontWeight height left letterSpacing lineHeight marginBottom marginLeft marginRight marginTop maxHeight maxWidth minHeight minWidth opacity outlineColor outlineOffset outlineWidth paddingBottom paddingLeft paddingRight paddingTop right textIndent top width wordSpacing zIndex").split(" ");function e(j,k,l){return(j+(k-j)*l).toFixed(3)}function i(k,j,l){return k.substr(j,l||1)}function c(l,p,s){var n=2,m,q,o,t=[],k=[];while(m=3,q=arguments[n-1],n--){if(i(q,0)=="r"){q=q.match(/\d+/g);while(m--){t.push(~~q[m])}}else{if(q.length==4){q="#"+i(q,1)+i(q,1)+i(q,2)+i(q,2)+i(q,3)+i(q,3)}while(m--){t.push(parseInt(i(q,1+m*2,2),16))}}}while(m--){o=~~(t[m+3]+(t[m]-t[m+3])*s);k.push(o<0?0:o>255?255:o)}return"rgb("+k.join(",")+")"}function b(l){var k=parseFloat(l),j=l.replace(/^[\-\d\.]+/,"");return isNaN(k)?{v:j,f:c,u:""}:{v:k,f:e,u:j}}function d(m){var l,n={},k=g.length,j;h.innerHTML='<div style="'+m+'"></div>';l=h.childNodes[0].style;while(k--){if(j=l[g[k]]){n[g[k]]=b(j)}}return n}a[f]=function(p,m,j){p=typeof p=="string"?document.getElementById(p):p;j=j||{};var r=d(m),q=p.currentStyle?p.currentStyle:getComputedStyle(p,null),l,s={},n=+new Date,k=j.duration||200,u=n+k,o,t=j.easing||function(v){return(-Math.cos(v*Math.PI)/2)+0.5};for(l in r){s[l]=b(q[l])}o=setInterval(function(){var v=+new Date,w=v>u?1:(v-n)/k;for(l in r){p.style[l]=r[l].f(s[l].v,r[l].v,t(w))+r[l].u}if(v>u){clearInterval(o);j.after&&j.after()}},10)}})("emile",this);
var get_cookie, set_cookie;
set_cookie = function(name, value, permanent) {
  var expires;
  if (permanent) {
    expires = '; expires=' + (new Date()).toGMTString().replace(/20\d\d/, 2020);
  }
  return document.cookie = "" + name + "=" + value + (expires || '') + "; path=/";
};
get_cookie = function(name) {
  var result;
  result = _.find(document.cookie.split(';'), function(crumb) {
    return crumb.trim().indexOf("" + name + "=") === 0;
  });
  if (result && result.trim() !== ("" + name + "=")) {
    return result.replace(/^.*?=/, "");
  }
};
var __bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; };
_.extend(Backbone.Model.prototype, {
  silent_set: function(attrs) {
    return this.set(attrs, {
      silent: true
    });
  },
  reset: function(attrs) {
    var changes;
    changes = {};
    _.each(_.flatten([attrs]), __bind(function(attr) {
      return changes[attr] = this.clean_attributes[attr];
    }, this));
    return this.set(changes);
  },
  parse_and_set: function(json) {
    return this.set(this.parse(json));
  }
});
_.extend(Backbone.View.prototype, {
  pluralize: function(count, singular, plural) {
    var name;
    if (plural == null) {
      plural = null;
    }
    count = parseInt(count, 10) || 0;
    name = count === 1 ? singular : plural || ("" + singular + "s");
    return "" + count + " " + name;
  }
});
var HamlJSRendering;
HamlJSRendering = {
  render_template: function(name, context, locals) {
    var html;
    html = this.render_partial(name, context, locals);
    if (this.el) {
      if (this.el.html) {
        this.el.html(html);
      } else {
        this.el.innerHTML = html;
      }
    }
    return html;
  },
  render_partial: function(name, context, locals) {
    var var_name;
    if (locals == null) {
      locals = {};
    }
    context != null ? context : context = this;
    var_name = name.replace("/", "_");
    return haml_js_execute("template_" + var_name, context, locals);
  }
};
_.extend(Backbone.View.prototype, HamlJSRendering);
window.defer = function(miliseconds, callback) {
  return window.setTimeout(callback, miliseconds);
};
window.supports_html5_storage = function() {
  try {
    return window.localStorage != null;
  } catch (e) {
    return false;
  }
};
window.stop_event = function(event) {
  if (event != null) {
    event.stopPropagation();
  }
  if (event != null) {
    event.preventDefault();
  }
  return false;
};
(function($) {
  var v;
  v = navigator.userAgent.match(/(WebKit|Opera)\/([\d.]+)/);
  if (!v) {
    v = navigator.userAgent.match(/(Mozilla)\/([\d.]+)/);
  }
  if (v) {
    $.browser = {
      version: v[2]
    };
    $.browser[v[1].toLowerCase()] = true;
    if ($.os.android || $.os.iphone || $.os.ipad || $.os.webos) {
      $.os.mobile = true;
    }
  }
  $.browser.ff3 = navigator.userAgent.search(/Firefox\/3/) > -1;
  $.browser.ff4beta = navigator.userAgent.search(/Firefox\/4\..*b/) > -1;
  $.doc = function() {
    if ($.browser.webkit) {
      return window.document.body;
    } else {
      return window.document.documentElement;
    }
  };
  $.content = function() {
    var d;
    d = $.doc();
    return {
      width: d.scrollWidth,
      height: d.scrollHeight,
      scroll_left: d.scrollLeft,
      scroll_top: d.scrollTop
    };
  };
  $.viewport = function() {
    v = document.documentElement;
    return {
      width: v.clientWidth,
      height: v.clientHeight
    };
  };
  $.fn.offset = function() {
    var obj;
    obj = this.dom[0].getBoundingClientRect();
    return {
      left: obj.left + $.doc().scrollLeft,
      top: obj.top + $.doc().scrollTop,
      width: obj.width,
      height: obj.height,
      screen_left: obj.left,
      screen_top: obj.top
    };
  };
  $.fn.is_or_closest = function(selector) {
    return this.is(selector) || this.closest(selector).exists();
  };
  $.fn.empty = function() {
    return this.dom.length === 0;
  };
  $.fn.exists = function() {
    return !this.empty();
  };
  $.fn.visible = function() {
    return this.css('display') !== 'none';
  };
  $.fn.show = function(display) {
    if (display == null) {
      display = 'block';
    }
    return this.css('display', display);
  };
  $.fn.toggle = function(display) {
    if (display == null) {
      display = 'block';
    }
    if (this.visible()) {
      return this.hide();
    } else {
      return this.show(display);
    }
  };
  return $.get_authenticity_token = function() {
    return $("meta[name='csrf-token']").attr("content");
  };
})(Zepto);
var BoardsShowController;
var __hasProp = Object.prototype.hasOwnProperty, __extends = function(child, parent) {
  for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; }
  function ctor() { this.constructor = child; }
  ctor.prototype = parent.prototype;
  child.prototype = new ctor;
  child.__super__ = parent.prototype;
  return child;
};
BoardsShowController = function() {
  function BoardsShowController(current_user, board) {
    BoardsShowController.__super__.constructor.apply(this, arguments);
    window.CurrentUser = new User;
    window.Users = new UserCollection;
    window.Activity = new Events;
    window.Tiles = new TileCollection;
    window.CurrentBoard = new Board(board);
    window.CurrentArtist = null;
    window.CurrentTile = null;
    window.State = new StateModel;
    window.Proxy = new ProxyModel;
    window.TileLoader = new TileLoaderModel;
    new ApplicationView;
    window.LayoutView = new LayoutView;
    new BoardStylesView;
    new BoardHeaderView;
    new BoardDownloadView;
    window.CurrentBoardView = new BoardView({
      model: CurrentBoard
    });
    new BoardPlaybackView({
      model: CurrentBoard
    });
    new CurrentArtistView;
    new CurrentTileView;
    new ActivityView;
    new FeedbackView;
    new BoardsListView;
    new UserOptionsView;
    CurrentBoard.parse_and_set([current_user, board]);
    window.BoardThumbnailView = new BoardThumbnailView({
      model: CurrentBoard
    });
    Proxy.start();
  }
  __extends(BoardsShowController, Backbone.Controller);
  BoardsShowController.prototype.routes = {
    "": "go_to_board",
    "!/": "go_to_board",
    "!/artists/:id": "change_current_artist",
    "!/tiles/:id": "change_current_tile"
  };
  BoardsShowController.prototype.tab_action = function(name) {
    if (!_.include('board artist tile'.split(' '), name)) {
      return;
    }
    State.silent_set({
      current: name
    });
    State.trigger('change:current');
    this.el = $('body');
    return this.el.dom[0].className = "a_show " + name;
  };
  BoardsShowController.prototype.go_to_board = function() {
    State.set({
      current_artist: null,
      current_tile: null
    });
    return this.tab_action("board");
  };
  BoardsShowController.prototype.change_current_artist = function(current_artist) {
    State.set({
      current_tile: null
    });
    if (State.set({
      current_artist: current_artist
    })) {
      return this.tab_action("artist");
    } else {
      return window.location.hash = "!/";
    }
  };
  BoardsShowController.prototype.change_current_tile = function(current_tile) {
    State.set({
      current_artist: null
    });
    if (State.set({
      current_tile: current_tile
    })) {
      return this.tab_action("tile");
    } else {
      return window.location.hash = "!/";
    }
  };
  return BoardsShowController;
}();
var HomeController;
var __hasProp = Object.prototype.hasOwnProperty, __extends = function(child, parent) {
  for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; }
  function ctor() { this.constructor = child; }
  ctor.prototype = parent.prototype;
  child.prototype = new ctor;
  child.__super__ = parent.prototype;
  return child;
}, __bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; };
HomeController = function() {
  function HomeController() {
    HomeController.__super__.constructor.apply(this, arguments);
    new FeedbackView;
    new RequestBoardView;
    new BoardsListView;
    new UserOptionsView;
    new AccountView;
    window.LayoutView = new LayoutView;
    _.bindAll(this, 'editor_loaded');
    if (window.location.pathname === '/editor') {
      this.init_editor();
    }
  }
  __extends(HomeController, Backbone.Controller);
  HomeController.prototype.init_editor = function() {
    return window.Editor = new EditorModel({
      max_size: _.max([$.viewport().height - 100 - 8, 480]),
      palette: ["#000000", "#9d9d9d", "#ffffff", "#be2633", "#e06f8b", "#493c2b", "#a46422", "#eb8931", "#f7e26b", "#2f484e", "#44891a", "#a3ce27", "#1b2632", "#005784", "#31a2f2", "#b2dcef"],
      source: this.get_from_local_storage(),
      canvas_size: 120,
      border_source: null,
      border_size: 0,
      loaded_callback: this.editor_loaded
    });
  };
  HomeController.prototype.editor_loaded = function() {
    Editor.bind('editor:saved', __bind(function() {
      return this.store_in_local_storage(Editor["export"]());
    }, this));
    window.CurrentEditorView = new EditorView({
      model: Editor,
      standalone: true
    });
    return CurrentEditorView.show();
  };
  HomeController.prototype.delete_local_storage = function() {
    if (window.supports_html5_storage) {
      return window.localStorage.removeItem('editor');
    }
  };
  HomeController.prototype.store_in_local_storage = function(value) {
    if (window.supports_html5_storage) {
      return window.localStorage.setItem('editor', value);
    }
  };
  HomeController.prototype.get_from_local_storage = function() {
    if (window.supports_html5_storage) {
      return window.localStorage.getItem('editor');
    }
  };
  return HomeController;
}();
var Board;
var __slice = Array.prototype.slice, __bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; }, __hasProp = Object.prototype.hasOwnProperty, __extends = function(child, parent) {
  for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; }
  function ctor() { this.constructor = child; }
  ctor.prototype = parent.prototype;
  child.prototype = new ctor;
  child.__super__ = parent.prototype;
  return child;
};
Board = function() {
  function Board() {
    var args;
    args = 1 <= arguments.length ? __slice.call(arguments, 0) : [];
    Board.__super__.constructor.apply(this, args);
    this.silent_set({
      events_filtered: this.is_filtered_in_cookie()
    });
    _.bindAll(this, 'tile_image_loaded');
    this.bind("tile:loaded", this.tile_image_loaded);
    _.bindAll(this, 'update_cookie');
    this.bind("change:events_filtered", this.update_cookie);
    _.bindAll(this, 'touch_dimensions');
    this.bind("change:tile_size", this.touch_dimensions);
    this.bind("change:border_size", this.touch_dimensions);
    _.bindAll(this, 'add_remove_columns', 'add_remove_rows');
    this.bind("change:width", this.add_remove_columns);
    this.bind("change:height", this.add_remove_rows);
    _.bindAll(this, 'private_board_changed', 'provider_allowed_changed');
    this.bind("change:private_board", this.private_board_changed);
    this.bind("change:pixelation_allowed", __bind(function(model, value) {
      return this.provider_allowed_changed("pixelation", value);
    }, this));
    _.bindAll(this, 'update_palette_from_palette_detailed');
    this.bind("change:palette_detailed", this.update_palette_from_palette_detailed);
  }
  __extends(Board, Backbone.Model);
  Board.prototype.url = function() {
    return "/boards/" + this.id;
  };
  Board.prototype.parse = function(json) {
    var cells, events, pms, tiles, user, users;
    user = json[0];
    json = json[1];
    tiles = json.tiles;
    delete json.tiles;
    cells = json.cells;
    delete json.cells;
    users = json.users;
    delete json.users;
    CurrentUser.parse_and_set(user);
    Users.refresh(users);
    if (CurrentUser.is_signed_in && !Users.get(CurrentUser.id)) {
      Users.add(CurrentUser);
    }
    events = json.recent_events;
    delete json.recent_events;
    pms = json.private_messages;
    delete json.private_messages;
    Activity.refresh(events.concat(pms));
    if (!json.palette) {
      json.palette = [];
    }
    if (!json.seed_tiles) {
      json.seed_tiles = [];
    }
    this.clean_attributes = _.clone(json);
    this.trigger("board:clean_attributes");
    json.dimensions_touched = false;
    this.set(json);
    this.matrix = new Matrix(this, cells);
    this.set_tiles(tiles);
    return {};
  };
  Board.prototype.validate = function(attrs) {
    var val, valid;
    if (attrs.title != null) {
      val = attrs.title;
      if (val.length < 1) {
        return "title must be present";
      }
    }
    if (attrs.description != null) {
      val = attrs.description;
      if (val.length < 1) {
        return "description must be present";
      }
    }
    if (attrs.width != null) {
      val = parseInt(attrs.width, 10) || 0;
      if (val < 2) {
        return "width must be at least 2";
      }
      if (val > 99) {
        return "width must be at most 99";
      }
    }
    if (attrs.height != null) {
      val = parseInt(attrs.height, 10) || 0;
      if (val < 2) {
        return "height must be at least 2";
      }
      if (val > 99) {
        return "height must be at most 99";
      }
    }
    if (attrs.tile_size != null) {
      val = parseInt(attrs.tile_size, 10) || 0;
      if (val < 2) {
        return "tile size must be at least 2";
      }
      if (val > 999) {
        return "tile size must be at least 2";
      }
      if (val < 2 * this.get('border_size')) {
        return "tile size must be at least twice the border size";
      }
    }
    if (attrs.border_size != null) {
      val = parseInt(attrs.border_size, 10) || 0;
      if (val < 1) {
        return "border size must be at least 1";
      }
      if (val > 99) {
        return "border size must be at most 99";
      }
      if (val * 2 > this.get('tile_size')) {
        return "border size must be at most half the tile size";
      }
    }
    if (attrs.tile_reservation_duration != null) {
      val = parseInt(attrs.tile_reservation_duration, 10) || 0;
      if (val < 1) {
        return "reservation duration must be at least 1";
      }
      if (val > 99) {
        return "reservation duration must be at most 99";
      }
    }
    if ((attrs.palette_detailed != null) && attrs.palette_detailed.trim() !== "") {
      val = attrs.palette_detailed.split("\n");
      valid = _.all(val, function(hex) {
        return hex.toLowerCase().match(/^#[0-9a-f]{6}$/);
      });
      if (!valid) {
        return "palette hexes must be a newline separated list of hex values";
      }
    }
    return;
  };
  Board.prototype.find_in_tile_data = function(tile_data, left, top) {
    return _.find(tile_data, function(t) {
      return t.left === left && t.top === top;
    });
  };
  Board.prototype.set_tiles = function(tile_data) {
    var attrs, attrs_from_tile, cell, id, left, loaded, self, tile, top, _ref, _ref2;
    self = this;
    for (left = 0, _ref = this.get('width') - 1; (0 <= _ref ? left <= _ref : left >= _ref); (0 <= _ref ? left += 1 : left -= 1)) {
      for (top = 0, _ref2 = this.get('height') - 1; (0 <= _ref2 ? top <= _ref2 : top >= _ref2); (0 <= _ref2 ? top += 1 : top -= 1)) {
        id = left + '_' + top;
        cell = self.matrix.get(left, top);
        attrs_from_tile = this.find_in_tile_data(tile_data, left, top);
        attrs = _.extend({
          id: id,
          board: self,
          left: left,
          top: top,
          state: cell[2],
          substate: cell[3],
          user_id: null,
          secret_url: null,
          expires_in: null,
          loaded: false,
          data_url: null,
          draft_data: null,
          admin_comment: ''
        }, attrs_from_tile || {});
        if (tile = Tiles.get(id)) {
          tile.silent_set(attrs);
        } else {
          Tiles.add(attrs);
        }
      }
    }
    loaded = Tiles.all(function(tile) {
      return !tile.must_load();
    });
    this.set({
      tiles_loaded: loaded
    });
    this.trigger("board:loaded");
    return null;
  };
  Board.prototype.get_my_tile = function() {
    return Tiles.detect(function(tile) {
      return tile.get('state') === 'mine';
    });
  };
  Board.prototype.tile_image_loaded = function() {
    var loaded;
    loaded = Tiles.all(function(tile) {
      return !tile.must_load() || tile.get('loaded');
    });
    return this.set({
      tiles_loaded: loaded ? loaded : void 0
    });
  };
  Board.prototype.user = function() {
    return Users.get(this.get('user_id'));
  };
  Board.prototype.is_complete = function() {
    return this.get('nr_done_tiles') === this.get('nr_total_tiles');
  };
  Board.prototype.is_pixel_art = function() {
    return _.include(this.get('tags'), 'pixel');
  };
  Board.prototype.get_filtered_boards_from_cookie = function() {
    var ids, _ref;
    ids = ((_ref = get_cookie('hide_events_for')) != null ? _ref.split(',') : void 0) || [];
    return _.map(ids, function(id) {
      return parseInt(id, 10);
    });
  };
  Board.prototype.is_filtered_in_cookie = function() {
    return _.include(this.get_filtered_boards_from_cookie(), this.id);
  };
  Board.prototype.update_cookie = function(model, events_filtered) {
    var ids;
    ids = this.get_filtered_boards_from_cookie();
    if (events_filtered) {
      ids.push(this.id);
    } else {
      ids = _.without(ids, this.id);
    }
    return set_cookie('hide_events_for', ids.join(','), true);
  };
  Board.prototype.touch_dimensions = function() {
    this.set({
      dimensions_touched: true
    });
    return this.trigger("board:loaded");
  };
  Board.prototype.add_remove_columns = function(model, new_width) {
    var id, left, previous_width, self, top, _ref, _ref2, _ref3, _ref4;
    self = this;
    previous_width = parseInt(model.previousAttributes()["width"], 10);
    new_width = parseInt(new_width, 10);
    if (previous_width === new_width) {
      return;
    }
    if (previous_width < new_width) {
      for (left = previous_width, _ref = new_width - 1; (previous_width <= _ref ? left <= _ref : left >= _ref); (previous_width <= _ref ? left += 1 : left -= 1)) {
        for (top = 0, _ref2 = this.get('height') - 1; (0 <= _ref2 ? top <= _ref2 : top >= _ref2); (0 <= _ref2 ? top += 1 : top -= 1)) {
          id = left + '_' + top;
          Tiles.add({
            id: id,
            board: self,
            left: left,
            top: top
          });
        }
      }
    } else {
      for (left = new_width, _ref3 = previous_width - 1; (new_width <= _ref3 ? left <= _ref3 : left >= _ref3); (new_width <= _ref3 ? left += 1 : left -= 1)) {
        for (top = 0, _ref4 = this.get('height') - 1; (0 <= _ref4 ? top <= _ref4 : top >= _ref4); (0 <= _ref4 ? top += 1 : top -= 1)) {
          id = left + '_' + top;
          Tiles.remove(id);
        }
      }
    }
    return this.touch_dimensions();
  };
  Board.prototype.add_remove_rows = function(model, new_height) {
    var id, left, previous_height, self, top, _ref, _ref2, _ref3, _ref4;
    self = this;
    previous_height = parseInt(model.previousAttributes()["height"], 10);
    new_height = parseInt(new_height, 10);
    if (previous_height === new_height) {
      return;
    }
    if (previous_height < new_height) {
      for (left = 0, _ref = this.get('width') - 1; (0 <= _ref ? left <= _ref : left >= _ref); (0 <= _ref ? left += 1 : left -= 1)) {
        for (top = previous_height, _ref2 = new_height - 1; (previous_height <= _ref2 ? top <= _ref2 : top >= _ref2); (previous_height <= _ref2 ? top += 1 : top -= 1)) {
          id = left + '_' + top;
          Tiles.add({
            id: id,
            board: self,
            left: left,
            top: top
          });
        }
      }
    } else {
      for (left = 0, _ref3 = this.get('width') - 1; (0 <= _ref3 ? left <= _ref3 : left >= _ref3); (0 <= _ref3 ? left += 1 : left -= 1)) {
        for (top = new_height, _ref4 = previous_height - 1; (new_height <= _ref4 ? top <= _ref4 : top >= _ref4); (new_height <= _ref4 ? top += 1 : top -= 1)) {
          id = left + '_' + top;
          Tiles.remove(id);
        }
      }
    }
    return this.touch_dimensions();
  };
  Board.prototype.private_board_changed = function(model, value) {
    if (!value) {
      return this.set({
        pixelation_allowed: false
      });
    }
  };
  Board.prototype.provider_allowed_changed = function(provider, value) {
    var allowed_array;
    allowed_array = this.get('allowed_providers_array') || [];
    if (value) {
      if (!_.include(allowed_array, provider)) {
        allowed_array.push(provider);
      }
    } else {
      allowed_array = _.without(allowed_array, provider);
    }
    this.set({
      private_board: allowed_array.length > 0
    });
    return this.set({
      allowed_providers_array: allowed_array,
      allowed_providers: allowed_array.join(',')
    });
  };
  Board.prototype.update_palette_from_palette_detailed = function(model, hexes) {
    var palette;
    if (hexes.trim() === '') {
      return this.set({
        palette: []
      });
    }
    palette = _.map(hexes.split("\n"), function(hex) {
      return parseInt("" + (hex.substring(1)) + "ff", 16);
    });
    return this.set({
      palette: palette
    });
  };
  return Board;
}();
var Brushes;
var __bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; };
Brushes = function() {
  function Brushes(patterns) {
    var _ref;
    this.patterns = patterns;
    _ref = this.init_matrices(), this.header = _ref[0], this.matrices = _ref[1];
    this.brushes = this.from_patterns();
    this.length = this.brushes.length;
  }
  Brushes.prototype.after = function(index) {
    index += 1;
    if (index === this.length) {
      return 0;
    } else {
      return index;
    }
  };
  Brushes.prototype.before = function(index) {
    if (index === 0) {
      index = this.length;
    }
    return index -= 1;
  };
  Brushes.prototype.random = function() {
    return Math.floor(Math.random() * this.length);
  };
  Brushes.prototype.get = function(index) {
    return this.brushes[index];
  };
  Brushes.prototype.get_matrix = function(index) {
    return this.matrices[index];
  };
  Brushes.prototype.from_patterns = function() {
    var brushes;
    brushes = [];
    _.each(this.matrices, __bind(function(matrix, index) {
      var coordinates, cx, cy, h, w, x, y, _ref, _ref2;
      coordinates = [];
      w = matrix[0].length;
      h = matrix.length;
      cx = Math.floor((w - 1) / 2);
      cy = Math.floor((h - 1) / 2);
      for (y = 0, _ref = w - 1; (0 <= _ref ? y <= _ref : y >= _ref); (0 <= _ref ? y += 1 : y -= 1)) {
        for (x = 0, _ref2 = h - 1; (0 <= _ref2 ? x <= _ref2 : x >= _ref2); (0 <= _ref2 ? x += 1 : x -= 1)) {
          if (matrix[y][x] === 1) {
            coordinates.push([x - cx, y - cy]);
          }
        }
      }
      return brushes.push(coordinates);
    }, this));
    return brushes;
  };
  Brushes.prototype.init_matrices = function() {
    var matrices;
    matrices = [];
    _.each(this.patterns, __bind(function(pattern, index) {
      var h, matrix, matrix_line, symbols, w, x, y, _ref, _ref2;
      symbols = pattern.split(/\s+/);
      matrix = [];
      w = symbols[0].length;
      h = symbols.length;
      for (y = 0, _ref = w - 1; (0 <= _ref ? y <= _ref : y >= _ref); (0 <= _ref ? y += 1 : y -= 1)) {
        matrix_line = [];
        for (x = 0, _ref2 = h - 1; (0 <= _ref2 ? x <= _ref2 : x >= _ref2); (0 <= _ref2 ? x += 1 : x -= 1)) {
          matrix_line.push((symbols[y][x] === 'X' ? 1 : 0));
        }
        matrix.push(matrix_line);
      }
      return matrices.push(matrix);
    }, this));
    return [matrices.shift(), matrices];
  };
  return Brushes;
}();
var Canvas;
var __hasProp = Object.prototype.hasOwnProperty, __extends = function(child, parent) {
  for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; }
  function ctor() { this.constructor = child; }
  ctor.prototype = parent.prototype;
  child.prototype = new ctor;
  child.__super__ = parent.prototype;
  return child;
}, __bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; };
Canvas = function() {
  function Canvas(options) {
    var layer_index, _ref;
    this.editor = options.editor;
    delete options.editor;
    Canvas.__super__.constructor.call(this, options);
    this.set({
      contour_size: options.canvas_size + 2 * options.border_size
    });
    this.canvas = document.createElement('canvas');
    this.canvas.width = this.canvas.height = options.canvas_size;
    this.canvas_ctx = this.canvas.getContext('2d');
    _.bindAll(this, 'plot');
    this.history = new HistoryModel(100);
    this.size = options.canvas_size;
    this.total_layers = 5;
    this.layers = [];
    for (layer_index = 0, _ref = this.total_layers - 1; (0 <= _ref ? layer_index <= _ref : layer_index >= _ref); (0 <= _ref ? layer_index += 1 : layer_index -= 1)) {
      if ((options.layers != null) && (options.layers[layer_index] != null)) {
        this.layers[layer_index] = options.layers[layer_index];
      } else {
        this.layers.push({
          pixels: this.init_pixels(null),
          visible: true
        });
      }
    }
    this.set_current_layer(0, false);
    this.save();
  }
  __extends(Canvas, Backbone.Model);
  Canvas.prototype.set_current_layer = function(index, with_history) {
    if (with_history == null) {
      with_history = true;
    }
    if (this.get('current_layer') !== index) {
      this.pixels = this.layers[index].pixels;
      this.set({
        current_layer: index
      });
      if (with_history) {
        return this.save();
      }
    }
  };
  Canvas.prototype.toggle_layer = function(index) {
    if (this.layers[index].visible) {
      return this.hide_layer(index);
    } else {
      return this.show_layer(index);
    }
  };
  Canvas.prototype.hide_layer = function(index) {
    this.layers[index].visible = false;
    this.trigger('change:hide_layer', this, index);
    return this.save(false);
  };
  Canvas.prototype.show_layer = function(index) {
    this.layers[index].visible = true;
    this.trigger('change:show_layer', this, index);
    return this.save(false);
  };
  Canvas.prototype.plot = function(x, y) {
    var brush, color, dither, dx, dy, xx, yy, _i, _len, _ref, _results;
    brush = this.editor.current_brush();
    color = this.editor.get('color');
    dither = this.editor.current_dither();
    _results = [];
    for (_i = 0, _len = brush.length; _i < _len; _i++) {
      _ref = brush[_i], dx = _ref[0], dy = _ref[1];
      xx = x + dx;
      yy = y + dy;
      _results.push(xx >= 0 && yy >= 0 && xx < this.size && yy < this.size ? dither[yy % 2][xx % 2] === 1 ? this.set_pixel(xx, yy, color) : void 0 : void 0);
    }
    return _results;
  };
  Canvas.prototype.draw = function(from, x, y) {
    if (from != null) {
      return this.draw_line(from.x, from.y, x, y, this.plot);
    } else {
      return this.plot(x, y);
    }
  };
  Canvas.prototype.clear = function() {
    var x, y, _ref, _ref2;
    if (!this.layers[this.get('current_layer')].visible) {
      return;
    }
    for (y = 0, _ref = this.size - 1; (0 <= _ref ? y <= _ref : y >= _ref); (0 <= _ref ? y += 1 : y -= 1)) {
      for (x = 0, _ref2 = this.size - 1; (0 <= _ref2 ? x <= _ref2 : x >= _ref2); (0 <= _ref2 ? x += 1 : x -= 1)) {
        this.pixels[y][x] = null;
      }
    }
    this.save();
    return this.trigger('change:all_pixels');
  };
  Canvas.prototype.fill = function(x, y, color) {
    if (!this.layers[this.get('current_layer')].visible) {
      return;
    }
    this.fill_surface(x, y, color);
    this.save();
    return this.trigger('change:all_pixels');
  };
  Canvas.prototype.move = function(dx, dy) {
    var new_pixels, x, xx, y, yy, _ref, _ref2;
    if (!this.layers[this.get('current_layer')].visible) {
      return;
    }
    new_pixels = this.init_pixels(null);
    for (y = 0, _ref = this.size - 1; (0 <= _ref ? y <= _ref : y >= _ref); (0 <= _ref ? y += 1 : y -= 1)) {
      yy = y - dy;
      if (this.pixels[yy] != null) {
        for (x = 0, _ref2 = this.size - 1; (0 <= _ref2 ? x <= _ref2 : x >= _ref2); (0 <= _ref2 ? x += 1 : x -= 1)) {
          xx = x - dx;
          if (this.pixels[yy][xx] != null) {
            new_pixels[y][x] = this.pixels[yy][xx];
          }
        }
      }
    }
    this.layers[this.get('current_layer')].pixels = this.pixels = new_pixels;
    this.save();
    return this.trigger('change:all_pixels');
  };
  Canvas.prototype.clone_pixels = function() {
    var pixels, y, _ref;
    pixels = [];
    for (y = 0, _ref = this.size - 1; (0 <= _ref ? y <= _ref : y >= _ref); (0 <= _ref ? y += 1 : y -= 1)) {
      pixels.push(this.pixels[y].slice(0));
    }
    return pixels;
  };
  Canvas.prototype.save = function(with_history) {
    var state, visible_states;
    if (with_history == null) {
      with_history = true;
    }
    if (with_history) {
      visible_states = _.map(this.layers, function(l) {
        return l.visible;
      });
      state = {
        layer_index: this.get('current_layer'),
        layer_pixels: this.clone_pixels(),
        visible_states: visible_states
      };
      this.history.add(state);
    }
    return this.editor.trigger('editor:saved');
  };
  Canvas.prototype.restore = function(state) {
    var x, y, _ref, _ref2;
    if (!state) {
      return;
    }
    _.each(state.visible_states, __bind(function(visible, index) {
      if (visible) {
        return this.show_layer(index);
      } else {
        return this.hide_layer(index);
      }
    }, this));
    for (y = 0, _ref = this.size - 1; (0 <= _ref ? y <= _ref : y >= _ref); (0 <= _ref ? y += 1 : y -= 1)) {
      for (x = 0, _ref2 = this.size - 1; (0 <= _ref2 ? x <= _ref2 : x >= _ref2); (0 <= _ref2 ? x += 1 : x -= 1)) {
        this.layers[state.layer_index].pixels[y][x] = state.layer_pixels[y][x];
      }
    }
    this.set_current_layer(state.layer_index, false);
    this.trigger('change:all_pixels');
    return this.save(false);
  };
  Canvas.prototype.undo = function() {
    return this.restore(this.history.back());
  };
  Canvas.prototype.redo = function() {
    return this.restore(this.history.forward());
  };
  Canvas.prototype["export"] = function() {
    var exported, layer, _i, _len, _ref;
    exported = [];
    _ref = this.layers;
    for (_i = 0, _len = _ref.length; _i < _len; _i++) {
      layer = _ref[_i];
      exported.push({
        visible: layer.visible,
        image: this.export_pixels(layer.pixels)
      });
    }
    return JSON.stringify(exported);
  };
  Canvas.prototype.export_image = function() {
    return this.export_pixels(this.flatten());
  };
  Canvas.prototype.export_pixels = function(pixels) {
    CanvasExt.indexed_to_canvas({
      pixels: pixels,
      zoom: 1,
      datas: this.get_palette_as_datas(1),
      context: this.canvas_ctx
    });
    return this.canvas.toDataURL();
  };
  Canvas.prototype.flatten = function() {
    var flat, layer, x, y, _i, _len, _ref, _ref2, _ref3;
    flat = this.init_pixels(0);
    _ref = this.layers;
    for (_i = 0, _len = _ref.length; _i < _len; _i++) {
      layer = _ref[_i];
      if (!layer.visible) {
        continue;
      }
      for (y = 0, _ref2 = this.size - 1; (0 <= _ref2 ? y <= _ref2 : y >= _ref2); (0 <= _ref2 ? y += 1 : y -= 1)) {
        for (x = 0, _ref3 = this.size - 1; (0 <= _ref3 ? x <= _ref3 : x >= _ref3); (0 <= _ref3 ? x += 1 : x -= 1)) {
          if (layer.pixels[y][x] != null) {
            flat[y][x] = layer.pixels[y][x];
          }
        }
      }
    }
    return flat;
  };
  Canvas.prototype.get_palette_as_datas = function(zoom) {
    var datas, hex, n, palette, _i, _len, _ref;
    (_ref = this.palette_as_datas) != null ? _ref : this.palette_as_datas = {};
    if (this.dont_gc_this_canvas == null) {
      this.dont_gc_this_canvas = document.createElement('canvas');
      this.dont_gc_this_canvas.width = this.dont_gc_this_canvas.height = 500;
      this.dont_gc_this_ctx = this.dont_gc_this_canvas.getContext('2d');
    }
    if (!this.palette_as_datas[zoom]) {
      datas = [];
      palette = this.editor.palette.hexes;
      n = palette.length;
      for (_i = 0, _len = palette.length; _i < _len; _i++) {
        hex = palette[_i];
        this.dont_gc_this_ctx.fillStyle = hex;
        this.dont_gc_this_ctx.fillRect(0, 0, zoom, zoom);
        datas.push(this.dont_gc_this_ctx.getImageData(0, 0, zoom, zoom));
      }
      this.palette_as_datas[zoom] = datas;
    }
    return this.palette_as_datas[zoom];
  };
  Canvas.prototype.set_pixel = function(x, y, color_index) {
    if (!this.layers[this.get('current_layer')].visible) {
      return;
    }
    if (color_index < 0 || color_index >= this.editor.palette.hexes.length) {
      color_index = null;
    }
    this.pixels[y][x] = color_index;
    return this.trigger('change:pixel', x, y, this.editor.current_color());
  };
  Canvas.prototype.init_pixels = function(color) {
    var pixels, s, x, y, _ref, _ref2;
    s = this.get('canvas_size');
    pixels = new Array(s);
    for (y = 0, _ref = s - 1; (0 <= _ref ? y <= _ref : y >= _ref); (0 <= _ref ? y += 1 : y -= 1)) {
      pixels[y] = new Array(s);
      for (x = 0, _ref2 = s - 1; (0 <= _ref2 ? x <= _ref2 : x >= _ref2); (0 <= _ref2 ? x += 1 : x -= 1)) {
        pixels[y][x] = color;
      }
    }
    return pixels;
  };
  Canvas.prototype.draw_line = function(x1, y1, x2, y2, f) {
    var dx, dy, fraction, sx, sy, _results, _results2;
    dx = x2 - x1;
    sx = 1;
    dy = y2 - y1;
    sy = 1;
    if (dx < 0) {
      sx = -1;
      dx = -dx;
    }
    if (dy < 0) {
      sy = -1;
      dy = -dy;
    }
    dx = dx << 1;
    dy = dy << 1;
    f(x1, y1);
    if (dy < dx) {
      fraction = dy - (dx >> 1);
      _results = [];
      while (x1 !== x2) {
        if (fraction >= 0) {
          y1 += sy;
          fraction -= dx;
        }
        fraction += dy;
        x1 += sx;
        _results.push(f(x1, y1));
      }
      return _results;
    } else {
      fraction = dx - (dy >> 1);
      _results2 = [];
      while (y1 !== y2) {
        if (fraction >= 0) {
          x1 += sx;
          fraction -= dy;
        }
        fraction += dx;
        y1 += sy;
        _results2.push(f(x1, y1));
      }
      return _results2;
    }
  };
  Canvas.prototype.fill_surface = function(x, y, color) {
    var el, h, old_color, span_left, span_right, stack, w, y1, _results, _results2;
    old_color = this.pixels[y][x];
    if (old_color === color) {
      return;
    }
    if (color < 0 || color >= this.editor.palette.hexes.length) {
      color = null;
    }
    stack = new Stack;
    stack.push([x, y]);
    w = h = this.pixels.length;
    _results = [];
    while ((el = stack.pop(), el != null)) {
      x = el[0], y = el[1];
      y1 = y;
      while (y1 >= 0 && this.pixels[y1][x] === old_color) {
        y1--;
      }
      y1++;
      span_left = span_right = 0;
      _results.push(function() {
        _results2 = [];
        while (y1 < h && this.pixels[y1][x] === old_color) {
          this.pixels[y1][x] = color;
          if (!span_left && x > 0 && this.pixels[y1][x - 1] === old_color) {
            stack.push([x - 1, y1]);
            span_left = 1;
          } else if (span_left && x > 0 && this.pixels[y1][x - 1] !== old_color) {
            span_left = 0;
          }
          if (!span_right && x < w - 1 && this.pixels[y1][x + 1] === old_color) {
            stack.push([x + 1, y1]);
            span_right = 1;
          } else if (span_right && x < w - 1 && this.pixels[y1][x + 1] !== old_color) {
            span_right = 0;
          }
          _results2.push(y1++);
        }
        return _results2;
      }.call(this));
    }
    return _results;
  };
  return Canvas;
}();
var CanvasExt;
CanvasExt = function() {
  function CanvasExt() {}
  CanvasExt.to_canvas = function(elem) {
    var tag, tmp;
    tag = elem.tagName.toLowerCase();
    switch (tag) {
      case 'img':
        tmp = document.createElement("canvas");
        tmp.width = elem.width;
        tmp.height = elem.height;
        tmp.getContext('2d').drawImage(elem, 0, 0);
        return tmp;
        break;
      case 'canvas':
        return elem;
    }
  };
  CanvasExt.draw_zoomed_border = function(options) {
    var b, border_size, data, datas, g, palette, r, sdd, sh, si, source, source_ctx, source_data, sw, sx, sy, target, target_ctx, target_data, tdd, th, tw, zoom, _ref, _ref2, _results, _results2;
    border_size = options.border_size;
    palette = options.palette;
    datas = options.datas;
    zoom = options.zoom;
    source = this.to_canvas(options.source);
    target = options.target;
    sw = sh = source.width;
    source_ctx = source.getContext('2d');
    source_data = source_ctx.getImageData(0, 0, sw, sh);
    sdd = source_data.data;
    tw = th = sw * zoom;
    target.width = target.height = tw;
    target_ctx = target.getContext('2d');
    target_data = target_ctx.getImageData(0, 0, tw, th);
    tdd = target_data.data;
    _results = [];
    for (sy = 0, _ref = sh - 1; (0 <= _ref ? sy <= _ref : sy >= _ref); (0 <= _ref ? sy += 1 : sy -= 1)) {
      _results.push(function() {
        _results2 = [];
        for (sx = 0, _ref2 = sw - 1; (0 <= _ref2 ? sx <= _ref2 : sx >= _ref2); (0 <= _ref2 ? sx += 1 : sx -= 1)) {
          _results2.push(!(border_size <= sx && sx < sw - border_size && border_size <= sy && sy < sh - border_size) ? (si = (sy * sw + sx) * 4, r = sdd[si + 0], g = sdd[si + 1], b = sdd[si + 2], data = datas[palette.get_from_rgba(r, g, b, 255) || 0], target_ctx.putImageData(data, sx * zoom, sy * zoom)) : void 0);
        }
        return _results2;
      }());
    }
    return _results;
  };
  CanvasExt.indexed_to_canvas = function(options) {
    var context, datas, pixels, sh, sw, x, y, zoom, _ref, _ref2, _results, _results2;
    pixels = options.pixels;
    zoom = options.zoom;
    datas = options.datas;
    context = options.context;
    sw = sh = pixels.length;
    context.clearRect(0, 0, sw * zoom, sh * zoom);
    if ($.browser.ff4beta || $.browser.ff3) {
      return this.indexed_to_canvas_firefox(options);
    } else {
      _results = [];
      for (y = 0, _ref = sh - 1; (0 <= _ref ? y <= _ref : y >= _ref); (0 <= _ref ? y += 1 : y -= 1)) {
        _results.push(function() {
          _results2 = [];
          for (x = 0, _ref2 = sw - 1; (0 <= _ref2 ? x <= _ref2 : x >= _ref2); (0 <= _ref2 ? x += 1 : x -= 1)) {
            _results2.push(pixels[y][x] != null ? context.putImageData(datas[pixels[y][x]], x * zoom, y * zoom) : void 0);
          }
          return _results2;
        }());
      }
      return _results;
    }
  };
  CanvasExt.indexed_to_canvas_firefox = function(options) {
    var color, context, datas, dx, dy, i, pixels, sh, sw, target_data, tdd, th, tw, x, xx, y, yy, zoom, _ref, _ref2, _ref3, _ref4;
    pixels = options.pixels;
    zoom = options.zoom;
    datas = options.datas;
    context = options.context;
    datas = _.map(datas, function(d) {
      return d.data;
    });
    sw = sh = pixels.length;
    tw = th = sw * zoom;
    target_data = context.getImageData(0, 0, tw, th);
    tdd = target_data.data;
    for (y = 0, _ref = sh - 1; (0 <= _ref ? y <= _ref : y >= _ref); (0 <= _ref ? y += 1 : y -= 1)) {
      for (x = 0, _ref2 = sw - 1; (0 <= _ref2 ? x <= _ref2 : x >= _ref2); (0 <= _ref2 ? x += 1 : x -= 1)) {
        if (pixels[y][x] != null) {
          color = datas[pixels[y][x]];
          for (dy = 0, _ref3 = zoom - 1; (0 <= _ref3 ? dy <= _ref3 : dy >= _ref3); (0 <= _ref3 ? dy += 1 : dy -= 1)) {
            for (dx = 0, _ref4 = zoom - 1; (0 <= _ref4 ? dx <= _ref4 : dx >= _ref4); (0 <= _ref4 ? dx += 1 : dx -= 1)) {
              xx = x * zoom + dx;
              yy = y * zoom + dy;
              i = (yy * tw + xx) * 4;
              tdd[i + 0] = color[0];
              tdd[i + 1] = color[1];
              tdd[i + 2] = color[2];
              tdd[i + 3] = color[3];
            }
          }
        }
      }
    }
    return context.putImageData(target_data, 0, 0);
  };
  CanvasExt.canvas_to_indexed = function(canvas, palette) {
    var a, b, color, g, i, n, pixels, r, source, w, x, y, _ref;
    pixels = [];
    w = canvas.width;
    source = canvas.getContext('2d').getImageData(0, 0, w, w).data;
    n = source.length / 4;
    for (i = 0, _ref = n - 1; (0 <= _ref ? i <= _ref : i >= _ref); (0 <= _ref ? i += 1 : i -= 1)) {
      r = source[i * 4];
      g = source[i * 4 + 1];
      b = source[i * 4 + 2];
      a = source[i * 4 + 3];
      y = Math.floor(i / w);
      x = i % w;
      color = palette.get_from_rgba(r, g, b, a);
      if (!pixels[y]) {
        pixels[y] = [];
      }
      pixels[y][x] = color;
    }
    return pixels;
  };
  return CanvasExt;
}();
var CanvasImport;
var __bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; };
CanvasImport = function() {
  function CanvasImport(string, palette, callback, format) {
    var layer, layer_index, _ref;
    if (format == null) {
      format = 'pixels';
    }
    this.palette = palette;
    this.callback = callback;
    this.format = format;
    this.loader = new TileLoaderModel;
    if (string.indexOf("data:image/png") === 0) {
      this.layers = [
        {
          visible: true,
          image: string
        }
      ];
    } else {
      this.layers = JSON.parse(string);
    }
    this.loaded = 0;
    this.errors = 0;
    _.bindAll(this, 'loaded_callback');
    for (layer_index = 0, _ref = this.layers.length - 1; (0 <= _ref ? layer_index <= _ref : layer_index >= _ref); (0 <= _ref ? layer_index += 1 : layer_index -= 1)) {
      layer = this.layers[layer_index];
      this.loader.get(layer.image, this.loaded_callback);
    }
    this.timer = defer(500, __bind(function() {
      return this.callback();
    }, this));
  }
  CanvasImport.prototype.loaded_callback = function(url) {
    var layer;
    layer = _.detect(this.layers, function(layer) {
      return layer.image === url;
    });
    if (this.format === 'pixels') {
      layer.pixels = CanvasExt.canvas_to_indexed(this.loader.canvases[url], this.palette);
    } else {
      layer.canvas = this.loader.canvases[url];
    }
    delete layer.image;
    this.loaded += 1;
    if (this.loaded === this.layers.length) {
      clearTimeout(this.timer);
      this.timer = null;
      return this.callback(this.layers);
    }
  };
  return CanvasImport;
}();
var Dithers;
var __bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; };
Dithers = function() {
  function Dithers(patterns) {
    var _ref;
    this.patterns = patterns;
    _ref = this.init_matrices(), this.header = _ref[0], this.matrices = _ref[1];
    this.length = this.matrices.length;
  }
  Dithers.prototype.after = function(index) {
    index += 1;
    if (index === this.length) {
      return 0;
    } else {
      return index;
    }
  };
  Dithers.prototype.before = function(index) {
    if (index === 0) {
      index = this.length;
    }
    return index -= 1;
  };
  Dithers.prototype.get = function(index) {
    return this.matrices[index];
  };
  Dithers.prototype.init_matrices = function() {
    var matrices;
    matrices = [];
    _.each(this.patterns, __bind(function(pattern, index) {
      var h, matrix, matrix_line, symbols, w, x, y, _ref, _ref2;
      symbols = pattern.split(/\s+/);
      matrix = [];
      w = symbols[0].length;
      h = symbols.length;
      for (y = 0, _ref = w - 1; (0 <= _ref ? y <= _ref : y >= _ref); (0 <= _ref ? y += 1 : y -= 1)) {
        matrix_line = [];
        for (x = 0, _ref2 = h - 1; (0 <= _ref2 ? x <= _ref2 : x >= _ref2); (0 <= _ref2 ? x += 1 : x -= 1)) {
          matrix_line.push((symbols[y][x] === 'X' ? 1 : 0));
        }
        matrix.push(matrix_line);
      }
      return matrices.push(matrix);
    }, this));
    return [matrices.shift(), matrices];
  };
  return Dithers;
}();
var EditorModel;
var __bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; }, __hasProp = Object.prototype.hasOwnProperty, __extends = function(child, parent) {
  for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; }
  function ctor() { this.constructor = child; }
  ctor.prototype = parent.prototype;
  child.prototype = new ctor;
  child.__super__ = parent.prototype;
  return child;
};
EditorModel = function() {
  function EditorModel(options) {
    var color, size;
    EditorModel.__super__.constructor.apply(this, arguments);
    this.loaded_callback = options.loaded_callback;
    delete options.loaded_callback;
    this.palette = new Palette(options.palette);
    delete options.palette;
    this.brushes = new Brushes(EditorModel.BRUSH_PATTERNS);
    this.dithers = new Dithers(EditorModel.DITHER_PATTERNS);
    size = options.canvas_size + 2 * options.border_size;
    this.initial_zoom = Math.floor(options.max_size / size);
    this.allowed_zooms = [this.initial_zoom];
    if (DESKTOP) {
      this.allowed_zooms.push(2 * this.initial_zoom);
      this.allowed_zooms.push(4 * this.initial_zoom);
    } else {
      this.allowed_zooms.push(Math.ceil(1.5 * this.initial_zoom));
    }
    this.zoom_index = 0;
    this.set({
      zoom: this.initial_zoom
    });
    color = this.palette.random();
    if (color === 0) {
      color = 1;
    }
    this.set({
      color: color
    });
    this.set({
      brush: this.brushes.random()
    });
    this.set({
      dither: 0
    });
    options = _.extend(options, {
      editor: this
    });
    if (options.source) {
      this.importer = new CanvasImport(options.source, this.palette, __bind(function(layers) {
        options = _.extend(options, {
          layers: layers
        });
        return this.create_canvas(options);
      }, this));
    } else {
      defer(100, __bind(function() {
        return this.create_canvas(options);
      }, this));
    }
  }
  __extends(EditorModel, Backbone.Model);
  EditorModel.prototype.create_canvas = function(options) {
    this.canvas = new Canvas(options);
    return this.loaded_callback();
  };
  EditorModel.prototype.current_color = function() {
    return this.palette.get(this.get('color'));
  };
  EditorModel.prototype.current_brush = function() {
    return this.brushes.get(this.get('brush'));
  };
  EditorModel.prototype.current_dither = function() {
    return this.dithers.get(this.get('dither'));
  };
  EditorModel.prototype.next_color = function() {
    return this.set({
      color: this.palette.after(this.get('color'))
    });
  };
  EditorModel.prototype.prev_color = function() {
    return this.set({
      color: this.palette.before(this.get('color'))
    });
  };
  EditorModel.prototype.next_brush = function() {
    return this.set({
      brush: this.brushes.after(this.get('brush'))
    });
  };
  EditorModel.prototype.prev_brush = function() {
    return this.set({
      brush: this.brushes.before(this.get('brush'))
    });
  };
  EditorModel.prototype.next_dither = function() {
    return this.set({
      dither: this.dithers.after(this.get('dither'))
    });
  };
  EditorModel.prototype.prev_dither = function() {
    return this.set({
      dither: this.dithers.before(this.get('dither'))
    });
  };
  EditorModel.prototype.zoom_out = function() {
    if (this.zoom_index === 0) {
      return;
    }
    this.zoom_index -= 1;
    return this.set({
      zoom: this.allowed_zooms[this.zoom_index]
    });
  };
  EditorModel.prototype.zoom_in = function() {
    if (this.zoom_index === this.allowed_zooms.length - 1) {
      return;
    }
    this.zoom_index += 1;
    return this.set({
      zoom: this.allowed_zooms[this.zoom_index]
    });
  };
  EditorModel.prototype["export"] = function() {
    return this.canvas["export"]();
  };
  EditorModel.BRUSH_PATTERNS = [
    'X----\
     X----\
     XXXX-\
     X--X-\
     XXXX-', 'XXXXXX\
     XXXXXX\
     XXXXXX\
     XXXXXX\
     XXXXXX\
     XXXXXX', 'XXX\
     XXX\
     XXX', 'X', '------\
     XX----\
     --XX--\
     ----XX\
     ------\
     ------', '------\
     ----XX\
     --XX--\
     XX----\
     ------\
     ------', '-X----\
     -X----\
     --X---\
     --X---\
     ---X--\
     ---X--', '----X-\
     ----X-\
     ---X--\
     ---X--\
     --X---\
     --X---', 'X-----\
     -X----\
     --X---\
     ---X--\
     ----X-\
     -----X', '-----X\
     ----X-\
     ---X--\
     --X---\
     -X----\
     X-----'
  ];
  EditorModel.DITHER_PATTERNS = [
    '----X\
     ----X\
     -XXXX\
     -X--X\
     -XXXX', 'XXXXXX\
     XXXXXX\
     XXXXXX\
     XXXXXX\
     XXXXXX\
     XXXXXX', 'XXXXXX\
     X-X-X-\
     XXXXXX\
     X-X-X-\
     XXXXXX\
     X-X-X-', '-X-X-X\
     X-X-X-\
     -X-X-X\
     X-X-X-\
     -X-X-X\
     X-X-X-', '------\
     X-X-X-\
     ------\
     X-X-X-\
     ------\
     X-X-X-'
  ];
  return EditorModel;
}();
var EventModel, Events;
var __hasProp = Object.prototype.hasOwnProperty, __extends = function(child, parent) {
  for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; }
  function ctor() { this.constructor = child; }
  ctor.prototype = parent.prototype;
  child.prototype = new ctor;
  child.__super__ = parent.prototype;
  return child;
};
EventModel = function() {
  function EventModel() {
    EventModel.__super__.constructor.apply(this, arguments);
  }
  __extends(EventModel, Backbone.Model);
  EventModel.prototype.tile = function() {
    return Tiles.get("" + (this.get('tile_left')) + "_" + (this.get('tile_top')));
  };
  EventModel.prototype.tile_public_id = function() {
    var _ref;
    return (_ref = this.tile()) != null ? _ref.public_id() : void 0;
  };
  EventModel.prototype.user = function() {
    return Users.get(this.get('user_id'));
  };
  EventModel.prototype.tile_user = function() {
    return Users.get(this.get('tile_user_id'));
  };
  EventModel.prototype.html = function() {
    var h, privately, whom;
    if (this.get('action') === 'comment' || this.get('action') === 'pm') {
      if (!this.user()) {
        return;
      }
      privately = '';
      if (this.get('action') === 'pm') {
        whom = CurrentUser.id === this.get('tile_user_id') ? "you" : this.tile_user().local_link();
        privately = " (privately to " + whom + ")";
      }
      h = "" + (this.user().local_link()) + " said" + privately;
      if (this.tile()) {
        h += " about " + (this.tile().local_link());
      }
      h += ": <div class='body'>" + (this.comment_html()) + "</div>";
      return h;
    }
    if (!this.tile()) {
      return;
    }
    switch (this.get('action')) {
      case 'reserve':
        return "" + (this.user().local_link()) + " reserved " + (this.tile().local_link());
        break;
      case 'release':
        return "" + (this.user().local_link()) + " released " + (this.tile().local_link());
        break;
      case 'abandon':
        return "" + (this.user().local_link()) + " abandoned " + (this.tile().local_link());
        break;
      case 'upload':
        return "" + (this.user().local_link()) + " uploaded " + (this.tile().local_link());
        break;
      case 'approve':
        return "" + (this.tile().local_link()) + " by " + (this.tile_user().local_link()) + " was approved";
        break;
      case 'send_back':
        return "" + (this.tile().local_link()) + " by " + (this.tile_user().local_link()) + " was sent back for more work";
        break;
      case 'reject':
        return "" + (this.tile().local_link()) + " by " + (this.tile_user().local_link()) + " was rejected";
        break;
      case 'visible':
        return "" + (this.tile().local_link()) + " by " + (this.tile_user().local_link()) + " became visible";
    }
  };
  EventModel.prototype.comment_html = function() {
    var comment;
    comment = html_escape(this.get('comment')).trim().replace(/[\n\r]+/g, "<br>");
    return comment = this.expand_tile_references(comment);
  };
  EventModel.prototype.expand_tile_references = function(str) {
    var tile_regexp;
    tile_regexp = new RegExp('#(\\d+-\\d+)', "gim");
    return str.replace(tile_regexp, function(match, public_id, offset) {
      var tile;
      tile = Tiles.get_by_public_id(public_id);
      if (tile) {
        return tile.local_link();
      } else {
        return match;
      }
    });
  };
  EventModel.prototype.expand_artist_references = function(str) {
    return str;
  };
  return EventModel;
}();
Events = function() {
  function Events() {
    Events.__super__.constructor.apply(this, arguments);
  }
  __extends(Events, Backbone.Collection);
  Events.prototype.model = EventModel;
  Events.prototype.comparator = function(event) {
    return -(parseInt(event.get('id') || 0));
  };
  Events.prototype.only_comments = function() {
    return this.select(function(event) {
      return event.get('action') === 'comment' || event.get('action') === 'pm';
    });
  };
  Events.prototype.only_events = function() {
    return this.select(function(event) {
      return event.get('action') !== 'comment';
    });
  };
  Events.prototype.for_artist = function(artist) {
    return this.select(function(event) {
      if (event.get('action') === 'comment') {
        if (event.get('user_id') === artist.id) {
          return true;
        }
      } else {
        if (event.get('tile_user_id') === artist.id) {
          return true;
        }
      }
    });
  };
  Events.prototype.for_tile = function(tile) {
    return this.select(function(event) {
      if (event.get('tile_left') === tile.get('left') && event.get('tile_top') === tile.get('top')) {
        return true;
      }
      if (event.get('action') === 'comment' && event.get('comment').indexOf("" + (tile.public_id())) >= 0) {
        return true;
      }
    });
  };
  return Events;
}();
var HistoryModel;
var __slice = Array.prototype.slice, __hasProp = Object.prototype.hasOwnProperty, __extends = function(child, parent) {
  for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; }
  function ctor() { this.constructor = child; }
  ctor.prototype = parent.prototype;
  child.prototype = new ctor;
  child.__super__ = parent.prototype;
  return child;
};
HistoryModel = function() {
  function HistoryModel() {
    var args, size;
    size = arguments[0], args = 2 <= arguments.length ? __slice.call(arguments, 1) : [];
    HistoryModel.__super__.constructor.apply(this, args);
    this.size = size;
    this.buffer = [];
    this.start = 0;
    this.nr_elements = 0;
    this.max_nr_elements = 0;
  }
  __extends(HistoryModel, Backbone.Model);
  HistoryModel.prototype.add = function(element) {
    if (this.nr_elements === this.size) {
      this.start = (this.start + 1) % this.size;
    } else {
      this.nr_elements++;
    }
    this.max_nr_elements = this.nr_elements;
    return this.buffer[this.end()] = element;
  };
  HistoryModel.prototype.back = function() {
    if (this.nr_elements > 1) {
      this.nr_elements--;
      return this.buffer[this.end()];
    }
  };
  HistoryModel.prototype.forward = function() {
    if (this.max_nr_elements > this.nr_elements) {
      this.nr_elements++;
      return this.buffer[this.end()];
    }
  };
  HistoryModel.prototype.end = function() {
    return (this.start + this.nr_elements - 1) % this.size;
  };
  return HistoryModel;
}();
var Matrix;
var __bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; };
Matrix = function() {
  function Matrix(board, cells) {
    this.board = board;
    this.cells = cells;
    this.width = this.board.get('width');
    this.height = this.board.get('height');
  }
  Matrix.prototype.get = function(left, top) {
    return this.cells[left][top];
  };
  Matrix.prototype.DIRECTIONS2MOVEMENTS = {
    "N": [0, -1],
    "NE": [+1, -1],
    "E": [+1, 0],
    "SE": [+1, +1],
    "S": [0, +1],
    "SW": [-1, +1],
    "W": [-1, 0],
    "NW": [-1, -1]
  };
  Matrix.prototype.is_hidden = function(l, t, direction) {
    var directions;
    directions = [direction];
    if (direction.length === 2) {
      directions = directions.concat(direction.split(""));
    }
    return _.reduce(directions, __bind(function(current, direction) {
      var dx, dy, movement;
      movement = this.DIRECTIONS2MOVEMENTS[direction];
      dx = movement[0];
      dy = movement[1];
      return current && (this.is_done(l + dx, t + dy) || !this.is_inside(l + dx, t + dy));
    }, this), true);
  };
  Matrix.prototype.is_inside = function(l, t) {
    return l >= 0 && t >= 0 && l < this.width && t < this.height;
  };
  Matrix.prototype.is_done = function(l, t) {
    if (!this.is_inside(l, t)) {
      return false;
    }
    return _.include(['done', 'done_visible'], this.cells[l][t][2]);
  };
  return Matrix;
}();
var Palette;
Palette = function() {
  function Palette(hexes) {
    this.hexes = hexes;
    this.length = this.hexes.length;
    this.reverse_hash = this.get_reverse_hash();
  }
  Palette.prototype.after = function(index) {
    index += 1;
    if (index >= this.length) {
      return 0;
    } else {
      return index;
    }
  };
  Palette.prototype.before = function(index) {
    if (index === 0) {
      index = this.length;
    }
    return index -= 1;
  };
  Palette.prototype.random = function() {
    return Math.floor(Math.random() * this.length);
  };
  Palette.prototype.get = function(index) {
    return this.hexes[index];
  };
  Palette.prototype.get_from_rgba = function(r, g, b, a) {
    if (a === 0) {
      return null;
    }
    return this.reverse_hash[r * 256 * 256 + g * 256 + b];
  };
  Palette.prototype.get_reverse_hash = function() {
    var b, color, g, i, r, result, _ref;
    result = {};
    for (i = 0, _ref = this.length - 1; (0 <= _ref ? i <= _ref : i >= _ref); (0 <= _ref ? i += 1 : i -= 1)) {
      color = this.hexes[i].substr(1);
      r = parseInt(color.substr(0, 2), 16);
      g = parseInt(color.substr(2, 2), 16);
      b = parseInt(color.substr(4, 2), 16);
      result[r * 256 * 256 + g * 256 + b] = i;
    }
    return result;
  };
  return Palette;
}();
var ProxyModel;
var __hasProp = Object.prototype.hasOwnProperty, __extends = function(child, parent) {
  for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; }
  function ctor() { this.constructor = child; }
  ctor.prototype = parent.prototype;
  child.prototype = new ctor;
  child.__super__ = parent.prototype;
  return child;
};
ProxyModel = function() {
  function ProxyModel() {
    this.element = $('#proxy').dom[0];
    this.origin = "http://" + document.location.host;
    this.proxy = null;
    _.bindAll(this, 'receive_message');
    window.addEventListener("message", this.receive_message, false);
  }
  __extends(ProxyModel, Backbone.Model);
  ProxyModel.prototype.start = function() {
    return this.element.src = "" + this.origin + "/ytz/proxy.html";
  };
  ProxyModel.prototype.receive_message = function(event) {
    var data;
    if (event.origin !== this.origin) {
      return;
    }
    data = JSON.parse(event.data);
    if (data.action === 'init') {
      this.proxy = event.source;
    }
    return this.trigger('proxy:message', data);
  };
  ProxyModel.prototype.send_message = function(message) {
    return this.proxy.postMessage(JSON.stringify(message), this.origin);
  };
  ProxyModel.prototype.loaded = function() {
    return !!this.proxy;
  };
  return ProxyModel;
}();
var Stack;
Stack = function() {
  function Stack() {
    this.emptyStack();
  }
  Stack.prototype.pop = function() {
    if (this.pointer <= 0) {
      return null;
    }
    this.pointer--;
    return this.stack[this.pointer];
  };
  Stack.prototype.push = function(el) {
    this.stack[this.pointer] = el;
    return this.pointer++;
  };
  Stack.prototype.emptyStack = function() {
    this.pointer = 0;
    return this.stack = [];
  };
  return Stack;
}();
var StateModel;
var __slice = Array.prototype.slice, __hasProp = Object.prototype.hasOwnProperty, __extends = function(child, parent) {
  for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; }
  function ctor() { this.constructor = child; }
  ctor.prototype = parent.prototype;
  child.prototype = new ctor;
  child.__super__ = parent.prototype;
  return child;
};
StateModel = function() {
  function StateModel() {
    var args;
    args = 1 <= arguments.length ? __slice.call(arguments, 0) : [];
    StateModel.__super__.constructor.apply(this, args);
    this.editing = false;
    _.bindAll(this, 'update_current_artist', 'update_current_tile');
    this.bind("change:current_artist", this.update_current_artist);
    this.bind("change:current_tile", this.update_current_tile);
    _.bindAll(this, 'revive_state');
    CurrentBoard.bind("board:loaded", this.revive_state);
  }
  __extends(StateModel, Backbone.Model);
  StateModel.prototype.validate = function(attrs) {
    var val;
    if (attrs.current_artist != null) {
      val = parseInt(attrs.current_artist, 10) || 0;
      val = attrs.current_artist;
      if (val === 0) {
        return "current_artist must be present";
      }
      if (!Users.get(val)) {
        return "current_artist must exist";
      }
    }
    if (attrs.current_tile != null) {
      val = attrs.current_tile;
      if (val.trim() === '') {
        return "current_tile must be present";
      }
      if (!Tiles.get_by_public_id(val)) {
        return "current_tile must exist";
      }
    }
  };
  StateModel.prototype.parse = function(json) {
    return json.current_artist = parseInt(json.current_artist, 10) || 0;
  };
  StateModel.prototype.update_current_artist = function(model, current_artist) {
    return window.CurrentArtist = Users.get(current_artist);
  };
  StateModel.prototype.update_current_tile = function(model, current_tile) {
    if (!current_tile) {
      return window.CurrentTile = null;
    }
    return window.CurrentTile = Tiles.get_by_public_id(current_tile);
  };
  StateModel.prototype.revive_state = function() {
    if (this.get('current_artist')) {
      this.trigger('change:current_artist', this, this.get('current_artist'));
    }
    if (this.get('current_tile')) {
      return this.trigger('change:current_tile', this, this.get('current_tile'));
    }
  };
  return StateModel;
}();
var Tile, TileCollection;
var __hasProp = Object.prototype.hasOwnProperty, __extends = function(child, parent) {
  for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; }
  function ctor() { this.constructor = child; }
  ctor.prototype = parent.prototype;
  child.prototype = new ctor;
  child.__super__ = parent.prototype;
  return child;
}, __bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; };
Tile = function() {
  function Tile(json) {
    Tile.__super__.constructor.apply(this, arguments);
    this.silent_set(json);
    _.bindAll(this, 'view_loaded');
    this.bind('change:loaded', this.view_loaded);
  }
  __extends(Tile, Backbone.Model);
  Tile.prototype.defaults = {
    secret_url: null,
    user_id: null,
    expires_in: null,
    state: 'not_available',
    substate: null,
    loaded: false,
    admin_comment: ''
  };
  Tile.prototype.user = function() {
    return Users.get(this.get('user_id'));
  };
  Tile.prototype.key = function(type) {
    if (type == null) {
      type = 't';
    }
    return "" + CurrentBoard.id + "/" + type + "/" + (this.id.replace('_', '-')) + ".png";
  };
  Tile.prototype.url = function(type) {
    if (type == null) {
      type = 't';
    }
    if (type === 'l') {
      return this.local_storage_url();
    }
    if (type === 'd') {
      return this.draft_url();
    }
    if (type === 'secret_url') {
      return this.get('secret_url');
    }
    return "http://" + document.location.host + "/" + S3_BUCKET + "/" + (this.key(type));
  };
  Tile.prototype.urgent = function() {
    var urgency_threshold;
    urgency_threshold = CurrentBoard.get('tile_reservation_duration') * 60 / 10;
    return this.get('expires_in') < urgency_threshold;
  };
  Tile.prototype.time_left = function() {
    var hours, minutes, time;
    time = this.get('expires_in');
    hours = Math.floor(time / 60);
    minutes = time - hours * 60;
    if (hours > 0) {
      return "" + hours + "h";
    } else {
      return "" + minutes + "m";
    }
  };
  Tile.prototype.has_draft = function() {
    if (this.get('state') === 'mine' && this.get('substate') === 'reserved') {
      return !!this.draft_url();
    }
  };
  Tile.prototype.draft_url = function() {
    var _ref;
    return (_ref = this.get('draft_data')) != null ? _ref.image : void 0;
  };
  Tile.prototype.draft_timestamp = function() {
    var timestamp, _ref;
    timestamp = (_ref = this.get('draft_data')) != null ? _ref.timestamp : void 0;
    return parseInt(timestamp, 10);
  };
  Tile.prototype.set_draft = function(image) {
    this.set({
      draft_data: {
        image: image,
        timestamp: Math.floor(Date.now() / 1000)
      }
    });
    this.trigger('change:state');
    return this.save_draft(image);
  };
  Tile.prototype.save_draft = function(image) {
    return $.ajax({
      type: 'POST',
      url: "/boards/" + (this.get('board').id) + "/tile/save_draft.json",
      data: {
        tile: {
          image: image
        },
        authenticity_token: $.get_authenticity_token()
      },
      success: __bind(function(response) {}, this),
      error: __bind(function(xhr) {}, this)
    });
  };
  Tile.prototype.local_storage_id = function(type) {
    if (type == null) {
      type = 'data';
    }
    if (!_.include(['data', 'timestamp'], type)) {
      throw 'Invalid type for the local storage id';
    }
    return "draft-" + (this.get('board').id) + "-" + (this.get('user_id')) + "-" + this.id + "-" + type;
  };
  Tile.prototype.has_local_storage = function() {
    var ls;
    if (window.supports_html5_storage) {
      if (this.get('state') === 'mine' && this.get('substate') === 'reserved') {
        ls = !!window.localStorage.getItem(this.local_storage_id());
        if (ls && this.has_draft() && this.draft_timestamp() > this.local_storage_timestamp()) {
          this.store_in_local_storage(this.draft_url());
        }
        return ls;
      }
    }
  };
  Tile.prototype.local_storage_url = function() {
    return window.localStorage.getItem(this.local_storage_id());
  };
  Tile.prototype.local_storage_timestamp = function() {
    var timestamp;
    timestamp = window.localStorage.getItem(this.local_storage_id('timestamp'));
    return parseInt(timestamp, 10);
  };
  Tile.prototype.delete_local_storage = function() {
    if (window.supports_html5_storage) {
      window.localStorage.removeItem(this.local_storage_id());
      return window.localStorage.removeItem(this.local_storage_id('timestamp'));
    }
  };
  Tile.prototype.store_in_local_storage = function(value) {
    var timestamp;
    if (window.supports_html5_storage) {
      timestamp = Math.floor(Date.now() / 1000);
      window.localStorage.setItem(this.local_storage_id('data'), value);
      return window.localStorage.setItem(this.local_storage_id('timestamp'), "" + timestamp);
    }
  };
  Tile.prototype.get_from_local_storage = function() {
    if (window.supports_html5_storage) {
      return window.localStorage.getItem(this.local_storage_id());
    }
  };
  Tile.prototype.is_pending = function() {
    return this.get('substate') === 'pending';
  };
  Tile.prototype.is_sent_back = function() {
    return (this.get('state') === 'mine' || this.get('state') === 'sent_back') && this.get('substate') === 'reserved' && this.get('secret_url');
  };
  Tile.prototype.must_load = function() {
    return !!this.must_load_image_type();
  };
  Tile.prototype.must_load_image_type = function() {
    var type;
    return type = function() {
      switch (this.get('state')) {
        case 'done':
          if (CurrentBoard.get('show_done')) {
            return 't';
          } else {
            return 'c';
          }
          break;
        case 'done_visible':
          if (CurrentBoard.get('show_done_visible')) {
            return 't';
          } else {
            if (CurrentBoard.is_complete()) {
              return 't';
            } else if (CurrentBoard.get('show_borders')) {
              return 'c';
            }
          }
          break;
        case 'mine':
          if (this.has_local_storage()) {
            return 'l';
          } else if (this.has_draft()) {
            return 'd';
          } else if (this.is_sent_back()) {
            return 'secret_url';
          }
      }
    }.call(this);
  };
  Tile.prototype.urgent_class = function() {
    if (this.urgent() && this.get('substate') === 'reserved') {
      return "urgent";
    } else {
      return "";
    }
  };
  Tile.prototype.view_loaded = function() {
    if (this.get('loaded')) {
      return CurrentBoard.trigger('tile:loaded');
    }
  };
  Tile.prototype.short_state = function() {
    if (this.get('state') === 'not_available' || this.get('state') === 'mine') {
      if (this.get('substate') === 'reserved') {
        return "" + (this.time_left()) + " left";
      }
      if (this.get('substate') === 'pending') {
        return "pending moderation";
      }
    }
  };
  Tile.prototype.public_id = function() {
    return "" + (this.get('left') + 1) + "-" + (this.get('top') + 1);
  };
  Tile.prototype.local_url = function() {
    return "#!/tiles/" + (this.public_id());
  };
  Tile.prototype.local_link = function() {
    return "<a href='" + (this.local_url()) + "' class='local_link t'>#" + (this.public_id()) + "</a>";
  };
  return Tile;
}();
TileCollection = function() {
  function TileCollection() {
    TileCollection.__super__.constructor.apply(this, arguments);
  }
  __extends(TileCollection, Backbone.Collection);
  TileCollection.prototype.model = Tile;
  TileCollection.prototype.comparator = function(tile) {
    return tile.get('object_id');
  };
  TileCollection.prototype.get_by_url = function(url) {
    var id, mine;
    if (url.indexOf('data:image') === 0) {
      mine = this.select(function(tile) {
        return tile.has_draft();
      });
      return mine[0];
    } else if (url.indexOf('data:canvas') === 0) {
      mine = this.select(function(tile) {
        return tile.has_local_storage();
      });
      return mine[0];
    } else {
      id = url.replace(/.*\//, '').replace(/\..*/, '').replace('-', '_');
      return this.get(id);
    }
  };
  TileCollection.prototype.get_by_public_id = function(id) {
    var left, top, _ref;
    if (!id) {
      return;
    }
    _ref = _.map(id.split("-"), function(d) {
      return parseInt(d, 10) || 0;
    }), left = _ref[0], top = _ref[1];
    return this.get("" + (left - 1) + "_" + (top - 1));
  };
  TileCollection.prototype.get_from_hash_url = function(url) {
    return Tiles.get_by_public_id(url.split('#!/tiles/')[1]);
  };
  TileCollection.prototype.get_from_elem = function(elem) {
    var el, links, tag_name;
    tag_name = elem.tagName.toLowerCase();
    if (tag_name === "a" && $(elem).hasClass('t')) {
      return Tiles.get_from_hash_url(elem.href);
    }
    if (tag_name === "li") {
      el = $(elem);
    } else {
      el = $(elem).closest("li");
    }
    if (el.attr('data-tile') === "undefined") {
      links = el.find('a.local_link.t');
      if (links.dom.length === 1) {
        return Tiles.get_from_hash_url(links.first().attr('href'));
      }
    }
    if (!el.exists()) {
      return;
    }
    return Tiles.get_by_public_id(el.attr('data-tile'));
  };
  TileCollection.prototype.by = function(user) {
    var tiles;
    if (!(user != null ? user.id : void 0)) {
      return [];
    }
    return tiles = this.select(function(tile) {
      return tile.get('user_id') === user.id;
    });
  };
  TileCollection.prototype.select_by = function(user) {
    this.deselect_all();
    return _.each(this.by(user), function(tile) {
      return tile.set({
        selected: true
      });
    });
  };
  TileCollection.prototype.deselect_all = function() {
    return this.each(function(tile) {
      return tile.set({
        selected: false
      });
    });
  };
  return TileCollection;
}();
var TileLoaderModel;
var __hasProp = Object.prototype.hasOwnProperty, __extends = function(child, parent) {
  for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; }
  function ctor() { this.constructor = child; }
  ctor.prototype = parent.prototype;
  child.prototype = new ctor;
  child.__super__ = parent.prototype;
  return child;
}, __bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; };
TileLoaderModel = function() {
  function TileLoaderModel() {
    this.queue = [];
    this.images = {};
    this.callbacks = {};
    this.canvases = {};
    this.notify_queue = [];
    _.bindAll(this, 'process_notify_queue');
    this.notify_timer = null;
    if ((typeof Proxy != "undefined" && Proxy !== null ? Proxy.bind : void 0) != null) {
      _.bindAll(this, 'receive_message');
      Proxy.bind('proxy:message', this.receive_message);
    }
  }
  __extends(TileLoaderModel, Backbone.Model);
  TileLoaderModel.prototype.get = function(url, callback) {
    if (callback == null) {
      callback = null;
    }
    this.callbacks[url] = callback;
    if (url.indexOf('data:image') === 0) {
      this.images[url] = url;
    }
    if (url.indexOf('data:canvas') === 0) {
      this.images[url] = url.substring(11);
    }
    if (this.images[url]) {
      return this.received_tile_loaded(url);
    } else {
      this.queue.push(url);
      return this.process_queue();
    }
  };
  TileLoaderModel.prototype.process_queue = function() {
    var url, _results;
    if (!Proxy.loaded()) {
      return;
    }
    _results = [];
    while (this.queue.length > 0) {
      url = this.queue.shift();
      _results.push(Proxy.send_message({
        action: 'load_tile',
        url: url
      }));
    }
    return _results;
  };
  TileLoaderModel.prototype.receive_message = function(data) {
    switch (data.action) {
      case 'init':
        return this.process_queue();
      case 'tile_loaded':
        this.images[data.url] = data.bits;
        return this.received_tile_loaded(data.url);
    }
  };
  TileLoaderModel.prototype.received_tile_loaded = function(url) {
    if ($.browser.opera) {
      this.notify_queue.push(url);
      if (!this.notify_timer) {
        return this.notify_timer = window.setInterval(this.process_notify_queue, 100);
      }
    } else {
      return this.tile_loaded(url);
    }
  };
  TileLoaderModel.prototype.process_notify_queue = function() {
    var url;
    if (this.notify_queue.length === 0) {
      window.clearInterval(this.notify_timer);
      this.notify_timer = null;
      return;
    }
    url = this.notify_queue.shift();
    return this.tile_loaded(url);
  };
  TileLoaderModel.prototype.tile_loaded = function(url) {
    var img;
    if (this.canvases[url]) {
      this.notify_canvas_loaded(url);
      return;
    }
    img = document.createElement('img');
    img.onload = __bind(function() {
      var canvas, ctx;
      canvas = document.createElement("canvas");
      canvas.width = canvas.height = img.width;
      ctx = canvas.getContext("2d");
      ctx.drawImage(img, 0, 0);
      this.canvases[url] = canvas;
      return this.notify_canvas_loaded(url);
    }, this);
    return img.src = this.images[url];
  };
  TileLoaderModel.prototype.notify_canvas_loaded = function(url) {
    var tile;
    if (this.callbacks[url] != null) {
      return this.callbacks[url](url);
    } else {
      tile = Tiles.get_by_url(url);
      tile.set({
        canvas: null
      });
      tile.set({
        canvas: this.canvases[url]
      });
      return tile.trigger('loader:image_loaded');
    }
  };
  return TileLoaderModel;
}();
var User, UserCollection;
var __slice = Array.prototype.slice, __hasProp = Object.prototype.hasOwnProperty, __extends = function(child, parent) {
  for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; }
  function ctor() { this.constructor = child; }
  ctor.prototype = parent.prototype;
  child.prototype = new ctor;
  child.__super__ = parent.prototype;
  return child;
};
User = function() {
  function User() {
    var args;
    args = 1 <= arguments.length ? __slice.call(arguments, 0) : [];
    User.__super__.constructor.apply(this, args);
    _.bindAll(this, 'focus_tiles');
    this.bind('change:focused', this.focus_tiles);
  }
  __extends(User, Backbone.Model);
  User.prototype.parse = function(json) {
    this.can_moderate = json.can_moderate;
    this.can_participate = json.can_participate;
    this.is_signed_in = json.id;
    return json;
  };
  User.prototype.focus_tiles = function(model, focused) {
    return _.invoke(Tiles.by(model), 'set', {
      focused: focused
    });
  };
  User.prototype.profile_link_for = function(provider) {
    var auth;
    auth = _.detect(this.get('authorizations'), function(auth) {
      return auth.provider === provider;
    });
    switch (provider) {
      case 'pixelation':
        return "http://www.wayofthepixel.net/pixelation/index.php?action=profile;u=" + auth.display_uid;
        break;
      case 'pixeljoint':
        return "http://www.pixeljoint.com/p/" + auth.display_uid + ".htm";
        break;
      case 'twitter':
        return "http://twitter.com/" + auth.nickname;
        break;
      case 'facebook':
        return "http://www.facebook.com/" + auth.nickname;
        break;
      case 'google':
        return null;
    }
  };
  User.prototype.profile_path = function() {
    return "#!/artists/" + this.id;
  };
  User.prototype.local_link = function() {
    return "<a href='#!/artists/" + this.id + "' class='local_link u'>" + (this.get('username')) + "</a>";
  };
  return User;
}();
UserCollection = function() {
  function UserCollection() {
    UserCollection.__super__.constructor.apply(this, arguments);
  }
  __extends(UserCollection, Backbone.Collection);
  UserCollection.prototype.model = User;
  UserCollection.prototype.get_from_hash_url = function(url) {
    return Users.get(url.split('#!/artists/')[1]);
  };
  UserCollection.prototype.get_from_elem = function(elem) {
    var el, tag_name;
    tag_name = elem.tagName.toLowerCase();
    el = tag_name !== "a" ? $(elem).closest("a") : $(elem);
    return Users.get_from_hash_url(el.attr('href'));
  };
  UserCollection.prototype.for_header = function() {
    var users;
    CurrentUser.silent_set({
      nr_tiles: Tiles.by(CurrentUser).length,
      first_tile_id: -1
    });
    users = this.map(function(user) {
      var first_tile_id, tiles;
      tiles = Tiles.by(user);
      if (tiles.length === 0 && CurrentUser.id !== user.id) {
        return null;
      }
      first_tile_id = CurrentUser.id === user.id ? -1 : tiles[0].get('object_id');
      return user.silent_set({
        nr_tiles: tiles.length,
        first_tile_id: first_tile_id
      });
    });
    return _.sortBy(_.compact(users), function(user) {
      return user.get('first_tile_id');
    });
  };
  UserCollection.prototype.nr_artists = function() {
    var users;
    users = this.map(function(user) {
      var tiles;
      tiles = Tiles.by(user);
      if (tiles.length === 0) {
        return null;
      } else {
        return user;
      }
    });
    return _.compact(users).length;
  };
  return UserCollection;
}();
var AccountView;
var __slice = Array.prototype.slice, __hasProp = Object.prototype.hasOwnProperty, __extends = function(child, parent) {
  for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; }
  function ctor() { this.constructor = child; }
  ctor.prototype = parent.prototype;
  child.prototype = new ctor;
  child.__super__ = parent.prototype;
  return child;
}, __bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; };
AccountView = function() {
  function AccountView() {
    var args;
    args = 1 <= arguments.length ? __slice.call(arguments, 0) : [];
    AccountView.__super__.constructor.apply(this, args);
    this.el = $("#notifications");
    this.delegateEvents();
    _.bindAll(this, 'submit', 'show_form');
  }
  __extends(AccountView, Backbone.View);
  AccountView.prototype.events = {
    "submit form": "submit",
    "click a.toggle_form": "toggle_form"
  };
  AccountView.prototype.toggle_form = function(event) {
    stop_event(event);
    this.$('.form').toggle();
    return this.$('.form input[type=text]').dom[0].focus();
  };
  AccountView.prototype.submit = function(event) {
    var email, form, to_confirm;
    stop_event(event);
    form = this.$('form').dom[0];
    email = this.$('input[type=text]').dom[0].value;
    to_confirm = this.$('.token_present strong').html();
    this.$('.error').html('');
    this.$('form').hide();
    this.$('.spinner').show();
    return $.ajax({
      type: form.method,
      url: form.action,
      data: {
        email_token: {
          email: email
        },
        authenticity_token: $.get_authenticity_token()
      },
      success: __bind(function(response) {
        this.$('.token_present strong').html(email);
        this.$('.token_present').show();
        switch (response) {
          case 'reset':
            this.$('.token_present').hide();
            this.$('.email_present').hide();
            this.$('h2.youremail').hide();
            this.$('h2.addemail').show();
            this.$('.form').show();
            break;
          case 'confirm':
            this.$('.form').hide();
            this.$('h2.addemail').hide();
            this.$('h2.youremail').show();
            break;
          case 'error':
            this.$('.error').html(response.responseText);
            this.$('.spinner').hide();
            this.$('.form').show();
        }
        this.$('.spinner').hide();
        return this.$('form').show();
      }, this),
      error: __bind(function(response) {
        this.$('.error').html(response.responseText);
        this.$('.spinner').hide();
        this.$('form').show();
        return this.$('.form').show();
      }, this)
    });
  };
  return AccountView;
}();
var ActivityView;
var __slice = Array.prototype.slice, __hasProp = Object.prototype.hasOwnProperty, __extends = function(child, parent) {
  for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; }
  function ctor() { this.constructor = child; }
  ctor.prototype = parent.prototype;
  child.prototype = new ctor;
  child.__super__ = parent.prototype;
  return child;
}, __bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; };
ActivityView = function() {
  function ActivityView() {
    var args;
    args = 1 <= arguments.length ? __slice.call(arguments, 0) : [];
    ActivityView.__super__.constructor.apply(this, args);
    this.el = $('#activity');
    this.delegateEvents();
    this.min_chars = 10;
    this.max_chars = 255;
    _.bindAll(this, 'render', 'update_said');
    Activity.bind('refresh', this.render);
    CurrentBoard.bind('board:loaded', this.render);
    CurrentBoard.bind('change:events_filtered', this.render);
    State.bind('change:current', this.render);
  }
  __extends(ActivityView, Backbone.View);
  ActivityView.prototype.events = {
    "click .filter a": "toggle_filter",
    "submit form": "post_comment",
    "keyup textarea": "update_error"
  };
  if (DESKTOP) {
    _.extend(ActivityView.prototype.events, {
      "mouseover .events li": "highlight_artist_or_tile",
      "mouseout  .events li": "unhighlight_artist_or_tile",
      "click     .events a": "unhighlight_artist_or_tile"
    });
  }
  ActivityView.prototype.highlight_artist_or_tile = function(event) {
    var tile;
    tile = Tiles.get_from_elem(event.target);
    if (tile) {
      tile.silent_set({
        scroll_into_view: true
      });
      return tile.set({
        focused: true
      });
    }
  };
  ActivityView.prototype.unhighlight_artist_or_tile = function(event) {
    var _ref;
    return (_ref = Tiles.get_from_elem(event.target)) != null ? _ref.set({
      focused: false
    }) : void 0;
  };
  ActivityView.prototype.render = function() {
    var events, html;
    this.el.dom[0].className = State.get('current');
    if (State.get('current') === 'board') {
      this.update_filter();
    }
    if (CurrentUser.can_participate) {
      this.update_said();
      this.update_error();
    }
    events = function() {
      switch (State.get('current')) {
        case 'board':
          this.$('form').show();
          if (CurrentBoard.get('events_filtered')) {
            return Activity.only_comments();
          } else {
            return Activity.models;
          }
          break;
        case 'artist':
          this.$('form').hide();
          return Activity.for_artist(CurrentArtist);
          break;
        case 'tile':
          this.$('form').show();
          return Activity.for_tile(CurrentTile);
      }
    }.call(this);
    html = this.render_partial('events/events', this, {
      events: events
    });
    return this.el.find('.events').html(html);
  };
  ActivityView.prototype.update_said = function() {
    var html;
    html = "" + (CurrentUser.local_link()) + " said";
    if (State.get('current') === 'tile') {
      html += " about " + (CurrentTile.local_link());
    }
    html += ":";
    return this.$('.said').html(html);
  };
  ActivityView.prototype.update_error = function(event) {
    var chars, error, save_button, textarea;
    textarea = this.$('form textarea');
    error = this.$('.error');
    save_button = this.$('form input.button');
    chars = textarea.dom[0].value.length;
    if (chars < this.min_chars) {
      save_button.dom[0].disabled = true;
      if (chars > 0) {
        return error.html("min " + this.min_chars + " chars");
      }
    } else {
      if (chars > this.max_chars) {
        save_button.dom[0].disabled = true;
        return error.html("max " + this.max_chars + " chars");
      } else {
        save_button.dom[0].disabled = false;
        return error.html('');
      }
    }
  };
  ActivityView.prototype.post_comment = function(event) {
    var comment, event_params;
    stop_event(event);
    comment = this.$('form textarea').dom[0].value;
    if (comment.length < this.min_chars) {
      return;
    }
    if (comment.length > this.max_chars) {
      return;
    }
    this.$('form').hide();
    this.$('.spinner').show();
    event_params = {};
    event_params.comment = comment;
    if (State.get('current') === 'tile') {
      event_params.tile_id = CurrentTile.get('object_id');
      event_params.tile_left = CurrentTile.get('left');
      event_params.tile_top = CurrentTile.get('top');
    }
    return $.ajax({
      type: 'POST',
      url: "" + (CurrentBoard.url()) + "/events",
      data: {
        event: event_params,
        authenticity_token: $.get_authenticity_token()
      },
      success: __bind(function(response) {
        this.$('form textarea').dom[0].value = '';
        this.$('.spinner').hide();
        this.$('form').show();
        return CurrentBoard.parse_and_set(JSON.parse(response));
      }, this),
      error: __bind(function() {
        debug('NOT WORKING');
        return CurrentBoard.fetch();
      }, this)
    });
  };
  ActivityView.prototype.update_filter = function() {
    var link, title;
    if (CurrentBoard.get('events_filtered')) {
      this.el.addClass('filtered');
      title = "Showing only comments";
      link = "show everything";
    } else {
      this.el.removeClass('filtered');
      title = "Showing everything";
      link = "show only comments";
    }
    this.$('.filter strong').html(title);
    return this.$('.filter a').html(link);
  };
  ActivityView.prototype.toggle_filter = function(event) {
    stop_event(event);
    return CurrentBoard.set({
      events_filtered: !CurrentBoard.get('events_filtered')
    });
  };
  return ActivityView;
}();
var ApplicationView;
var __slice = Array.prototype.slice, __hasProp = Object.prototype.hasOwnProperty, __extends = function(child, parent) {
  for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; }
  function ctor() { this.constructor = child; }
  ctor.prototype = parent.prototype;
  child.prototype = new ctor;
  child.__super__ = parent.prototype;
  return child;
};
ApplicationView = function() {
  function ApplicationView() {
    var args;
    args = 1 <= arguments.length ? __slice.call(arguments, 0) : [];
    ApplicationView.__super__.constructor.apply(this, args);
    _.bindAll(this, 'go_to_board', 'append_location');
    $("#board_wrapper").bind("click", this.go_to_board);
    $("body").delegate('a.authsignin', "click", this.append_location);
    $("body").delegate('a.authsignout', "click", this.append_location);
  }
  __extends(ApplicationView, Backbone.View);
  ApplicationView.prototype.go_to_board = function(event) {
    if (event.target.tagName.toLowerCase() === "a") {
      return;
    }
    if ($(event.target).closest('a').exists()) {
      return;
    }
    if (event.target.id === 'editor_wrapper') {
      return;
    }
    if ($(event.target).closest('#editor_wrapper').exists()) {
      return;
    }
    return window.location.hash = "!/";
  };
  ApplicationView.prototype.append_location = function(event) {
    var link, url;
    stop_event(event);
    link = event.target.tagName.toLowerCase() !== "a" ? $(event.target).closest("a") : $(event.target);
    url = link.dom[0].href + "?redirect_to=" + escape(window.location.href);
    return window.location = url;
  };
  return ApplicationView;
}();
var BoardDownloadView;
var __slice = Array.prototype.slice, __hasProp = Object.prototype.hasOwnProperty, __extends = function(child, parent) {
  for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; }
  function ctor() { this.constructor = child; }
  ctor.prototype = parent.prototype;
  child.prototype = new ctor;
  child.__super__ = parent.prototype;
  return child;
};
BoardDownloadView = function() {
  function BoardDownloadView() {
    var args;
    args = 1 <= arguments.length ? __slice.call(arguments, 0) : [];
    BoardDownloadView.__super__.constructor.apply(this, args);
    this.el = $('#board_wrapper a.download');
    this.delegateEvents();
    _.bindAll(this, 'render');
    CurrentBoard.bind("change:tiles_loaded", this.render);
  }
  __extends(BoardDownloadView, Backbone.View);
  BoardDownloadView.prototype.events = {
    'click': 'download'
  };
  BoardDownloadView.prototype.render = function() {
    if (!CurrentBoard.get('tiles_loaded')) {
      return;
    }
    return this.render_template('board/download');
  };
  BoardDownloadView.prototype.download = function(event) {
    var bgrd_color, board, board_x, board_y, canvas, ctx, license, padding, text, text_size, text_v_padding;
    bgrd_color = '#333';
    text_v_padding = 4;
    padding = 6;
    text_size = 11;
    board_x = padding;
    board_y = padding + text_v_padding * 3 + text_size * 2;
    board = BoardThumbnailView.create_canvas(true);
    canvas = document.createElement('canvas');
    canvas.width = 2 * board_x + board.width;
    canvas.height = board_y + board.height + text_v_padding * 3 + text_size + padding;
    ctx = canvas.getContext('2d');
    ctx.fillStyle = bgrd_color;
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    ctx.textBaseline = 'top';
    ctx.font = "" + text_size + "px Verdana,Helvetica,Arial,sans-serif";
    ctx.fillStyle = '#e4e5cc';
    ctx.fillText("" + (CurrentBoard.get('title')) + " - a collaborative drawing on Tzigla", padding, padding + text_v_padding);
    ctx.fillStyle = '#aaa';
    text = "" + (CurrentBoard.get('nr_done_tiles'));
    if (!CurrentBoard.is_complete()) {
      text += "/" + (CurrentBoard.get('nr_total_tiles'));
    }
    ctx.fillText("" + text + " tiles by " + (this.pluralize(Users.nr_artists(), 'artist')), padding, padding + text_v_padding * 2 + text_size);
    ctx.fillStyle = '#000';
    ctx.fillRect(board_x, board_y, board.width, board.height);
    ctx.drawImage(board, board_x, board_y);
    ctx.fillStyle = '#aaa';
    ctx.fillText("" + (CurrentBoard.get('url')), padding, board.height + board_y + text_v_padding + (15 - text_size));
    license = $("#board_wrapper .license img").dom[0];
    ctx.drawImage(license, canvas.width - padding - license.width, board.height + board_y + text_v_padding);
    return this.el.attr('href', canvas.toDataURL());
  };
  return BoardDownloadView;
}();
var BoardHeaderView;
var __slice = Array.prototype.slice, __hasProp = Object.prototype.hasOwnProperty, __extends = function(child, parent) {
  for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; }
  function ctor() { this.constructor = child; }
  ctor.prototype = parent.prototype;
  child.prototype = new ctor;
  child.__super__ = parent.prototype;
  return child;
};
BoardHeaderView = function() {
  function BoardHeaderView() {
    var args;
    args = 1 <= arguments.length ? __slice.call(arguments, 0) : [];
    BoardHeaderView.__super__.constructor.apply(this, args);
    this.el = $('#board_header #about');
    this.delegateEvents();
    _.bindAll(this, 'render');
    CurrentBoard.bind("board:loaded", this.render);
  }
  __extends(BoardHeaderView, Backbone.View);
  if (DESKTOP) {
    BoardHeaderView.prototype.events = {
      "mouseover .artists a": "highlight_artist_or_tile",
      "mouseout  .artists a": "unhighlight_artist_or_tile"
    };
  }
  BoardHeaderView.prototype.highlight_artist_or_tile = function(event) {
    var _ref;
    $("#board_wrapper").addClass("artist_focused");
    return (_ref = Users.get_from_elem(event.target)) != null ? _ref.set({
      focused: true
    }) : void 0;
  };
  BoardHeaderView.prototype.unhighlight_artist_or_tile = function(event) {
    var _ref;
    $("#board_wrapper").removeClass("artist_focused");
    return (_ref = Users.get_from_elem(event.target)) != null ? _ref.set({
      focused: false
    }) : void 0;
  };
  BoardHeaderView.prototype.render = function() {
    return this.render_template('board/header', this, {
      users: Users.for_header()
    });
  };
  return BoardHeaderView;
}();
var BoardPlaybackView;
var __slice = Array.prototype.slice, __hasProp = Object.prototype.hasOwnProperty, __extends = function(child, parent) {
  for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; }
  function ctor() { this.constructor = child; }
  ctor.prototype = parent.prototype;
  child.prototype = new ctor;
  child.__super__ = parent.prototype;
  return child;
};
BoardPlaybackView = function() {
  function BoardPlaybackView() {
    var args;
    args = 1 <= arguments.length ? __slice.call(arguments, 0) : [];
    BoardPlaybackView.__super__.constructor.apply(this, args);
    this.el = $('#playback');
    _.bindAll(this, 'render');
    this.model.bind("change:tiles_loaded", this.render);
    _.bindAll(this, 'play', 'show_tile');
    this.delegateEvents();
    this.timeout = 250;
    this.current_tile = 0;
    this.playing = false;
  }
  __extends(BoardPlaybackView, Backbone.View);
  BoardPlaybackView.prototype.events = {
    "click .play    a": "play",
    "click .pause   a": "pause",
    "click .back    a": "back",
    "click .forward a": "forward"
  };
  BoardPlaybackView.prototype.render = function() {
    if (!this.model.get('tiles_loaded')) {
      return;
    }
    this.tiles = this.playback_tiles();
    return this.render_template('board/playback');
  };
  BoardPlaybackView.prototype.play = function(event) {
    stop_event(event);
    return this.start_animation();
  };
  BoardPlaybackView.prototype.pause = function(event) {
    stop_event(event);
    this.stop_animation();
    this.$('.play').show();
    return this.$('.pause').hide();
  };
  BoardPlaybackView.prototype.back = function(event) {
    stop_event(event);
    this.current_tile = -1;
    if (!this.playing) {
      this.start_animation();
    }
    this.$('.play').hide();
    return this.$('.pause').show();
  };
  BoardPlaybackView.prototype.forward = function(event) {
    stop_event(event);
    this.end_animation();
    return this.current_tile = this.tiles.length;
  };
  BoardPlaybackView.prototype.show_tile = function() {
    var tile_element;
    if (!this.playing) {
      return;
    }
    if (this.current_tile === -1) {
      this.current_tile = 0;
    }
    if (this.current_tile === 0) {
      this.hide_all_tiles();
    }
    if (this.current_tile < this.tiles.length) {
      tile_element = $("#board #tile_" + this.tiles[this.current_tile].id + ".t");
      tile_element.css({
        opacity: 0,
        display: 'block'
      });
      emile(tile_element.dom[0], 'opacity: 1.0', {
        duration: 500,
        easing: this.ease
      });
      this.current_tile++;
      return this.showing_next_tile = defer(this.timeout, this.show_tile);
    } else {
      return this.end_animation();
    }
  };
  BoardPlaybackView.prototype.start_animation = function() {
    this.stop_animation();
    this.$('.play').hide();
    this.$('.pause').show();
    if (this.current_tile >= this.tiles.length) {
      this.current_tile = 0;
    }
    this.playing = true;
    return this.show_tile();
  };
  BoardPlaybackView.prototype.stop_animation = function() {
    this.playing = false;
    return window.clearTimeout(this.showing_next_tile);
  };
  BoardPlaybackView.prototype.end_animation = function() {
    this.stop_animation();
    this.$('.play').show();
    this.$('.pause').hide();
    return this.show_all_tiles();
  };
  BoardPlaybackView.prototype.show_all_tiles = function() {
    return $('#board .t').show();
  };
  BoardPlaybackView.prototype.hide_all_tiles = function() {
    return $('#board .t').hide();
  };
  BoardPlaybackView.prototype.playback_tiles = function() {
    var done_tiles;
    done_tiles = Tiles.select(function(tile) {
      return tile.get('state') === 'done' || tile.get('state') === 'done_visible';
    });
    return _.sortBy(done_tiles, function(tile) {
      return tile.get('created_at');
    });
  };
  BoardPlaybackView.prototype.ease = function(pos) {
    return 0.5 - Math.cos(pos * Math.PI) / 2;
  };
  return BoardPlaybackView;
}();
var BoardStylesView;
var __hasProp = Object.prototype.hasOwnProperty, __extends = function(child, parent) {
  for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; }
  function ctor() { this.constructor = child; }
  ctor.prototype = parent.prototype;
  child.prototype = new ctor;
  child.__super__ = parent.prototype;
  return child;
};
BoardStylesView = function() {
  function BoardStylesView() {
    BoardStylesView.__super__.constructor.apply(this, arguments);
    this.el = $("#board_styles");
    _.bindAll(this, 'render');
    CurrentBoard.bind('board:loaded', this.render);
  }
  __extends(BoardStylesView, Backbone.View);
  BoardStylesView.prototype.render = function() {
    return this.render_template('board/styles');
  };
  return BoardStylesView;
}();
var BoardThumbnailView;
var __slice = Array.prototype.slice, __hasProp = Object.prototype.hasOwnProperty, __extends = function(child, parent) {
  for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; }
  function ctor() { this.constructor = child; }
  ctor.prototype = parent.prototype;
  child.prototype = new ctor;
  child.__super__ = parent.prototype;
  return child;
}, __bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; };
BoardThumbnailView = function() {
  function BoardThumbnailView() {
    var args;
    args = 1 <= arguments.length ? __slice.call(arguments, 0) : [];
    BoardThumbnailView.__super__.constructor.apply(this, args);
    _.bindAll(this, 'receive_message');
    Proxy.bind('proxy:message', this.receive_message);
  }
  __extends(BoardThumbnailView, Backbone.View);
  BoardThumbnailView.prototype.create_canvas = function(transparent) {
    var background, canvas, ctx, pattern, tile_size;
    tile_size = CurrentBoard.get('tile_size');
    canvas = document.createElement('canvas');
    canvas.width = tile_size * this.model.get('width');
    canvas.height = tile_size * this.model.get('height');
    ctx = canvas.getContext('2d');
    if (!transparent) {
      background = $('#thumbnail .background').dom[0];
      pattern = ctx.createPattern(background, 'repeat');
      ctx.fillStyle = pattern;
      ctx.fillRect(0, 0, canvas.width, canvas.height);
    }
    ctx.fillStyle = '#000';
    $('#board_container .t canvas').each(function(tile_canvas) {
      var id, left, top, _ref;
      id = $(tile_canvas).closest('.t').dom[0].id;
      id = id.split('_');
      _ref = [parseInt(id[1], 10), parseInt(id[2], 10)], left = _ref[0], top = _ref[1];
      return ctx.drawImage(tile_canvas, left * tile_size, top * tile_size);
    });
    return canvas;
  };
  BoardThumbnailView.prototype.get_data_url = function(canvas, name) {
    var scale, size, thumb;
    size = function() {
      switch (name) {
        case 'small':
          return 120;
        case 'big':
          return 400;
        case 'full':
          return canvas.width;
        default:
          return 120;
      }
    }();
    scale = size / canvas.width;
    if (name === 'small') {
      thumb = this.bilinear_scale(canvas, scale);
      thumb = this.on_smooth_texture(thumb);
      thumb = this.smooth(thumb);
    } else {
      thumb = scale === 1 ? canvas : this.scale(canvas, scale);
    }
    if ($.browser.opera) {
      return thumb.toDataURL('image/jpeg', 0.9);
    } else {
      return thumb.toDataURL('image/jpeg');
    }
  };
  BoardThumbnailView.prototype.send_thumbnail = function(name) {
    var data, file, redirect_to, url;
    file = this.get_data_url(this.create_canvas(name === 'small'), name);
    data = CurrentUser.get('thumbnail_upload_data');
    url = data.domain;
    data = data[name];
    data.file = file;
    redirect_to = data.redirect_to;
    delete data.redirect_to;
    return this.send_upload_message({
      action: 'upload_thumbnail',
      url: url,
      data: data,
      redirect_to: redirect_to
    });
  };
  BoardThumbnailView.prototype.send_upload_message = function(message) {
    if (Proxy.loaded()) {
      return Proxy.send_message(message);
    } else {
      return window.setTimeout((__bind(function() {
        return this.send_upload_message(message);
      }, this)), 200);
    }
  };
  BoardThumbnailView.prototype.receive_message = function(data) {
    var post_hook;
    switch (data.action) {
      case 'proxy':
        post_hook = new XMLHttpRequest;
        post_hook.onreadystatechange = function() {
          if (this.readyState !== 4) {
            return;
          }
          return CurrentBoard.trigger('thumbnail:loaded');
        };
        post_hook.open(data.method, data.url);
        return post_hook.send();
    }
  };
  BoardThumbnailView.prototype.scale = function(canvas, scale) {
    var thumb, thumb_ctx;
    thumb = document.createElement('canvas');
    thumb.width = canvas.width * scale;
    thumb.height = canvas.height * scale;
    thumb_ctx = thumb.getContext('2d');
    thumb_ctx.drawImage(canvas, 0, 0, thumb.width, thumb.height);
    return thumb;
  };
  BoardThumbnailView.prototype.bilinear_scale = function(canvas, scale) {
    var aa, ab, ag, alpha, ar, ba, bb, bg, blue, br, ca, cb, cg, cr, da, db, dg, dr, green, h, h2, i, index, j, offset, pixels, red, scaled, scaled_ctx, scaled_data, scaled_index, scaled_pixels, w, w2, x, x_diff, x_ratio, y, y_diff, y_ratio, _ref, _ref2;
    w = canvas.width;
    h = canvas.height;
    w2 = w * scale;
    h2 = h * scale;
    pixels = canvas.getContext('2d').getImageData(0, 0, w, h).data;
    x_ratio = y_ratio = 1.0 / scale;
    offset = 0;
    scaled = document.createElement('canvas');
    scaled.width = w2;
    scaled.height = h2;
    scaled_ctx = scaled.getContext('2d');
    scaled_data = scaled_ctx.getImageData(0, 0, w2, h2);
    scaled_pixels = scaled_data.data;
    for (i = 0, _ref = h2 - 1; (0 <= _ref ? i <= _ref : i >= _ref); (0 <= _ref ? i += 1 : i -= 1)) {
      for (j = 0, _ref2 = w2 - 1; (0 <= _ref2 ? j <= _ref2 : j >= _ref2); (0 <= _ref2 ? j += 1 : j -= 1)) {
        x = parseInt(x_ratio * j, 10);
        y = parseInt(y_ratio * i, 10);
        x_diff = (x_ratio * j) - x;
        y_diff = (y_ratio * i) - y;
        index = (y * w + x) * 4;
        ar = pixels[index];
        ag = pixels[index + 1];
        ab = pixels[index + 2];
        aa = pixels[index + 3];
        index += 4;
        br = pixels[index];
        bg = pixels[index + 1];
        bb = pixels[index + 2];
        ba = pixels[index + 3];
        index += 4 * w;
        cr = pixels[index];
        cg = pixels[index + 1];
        cb = pixels[index + 2];
        ca = pixels[index + 3];
        index += 4;
        dr = pixels[index];
        dg = pixels[index + 1];
        db = pixels[index + 2];
        da = pixels[index + 3];
        blue = ab * (1 - x_diff) * (1 - y_diff) + bb * x_diff * (1 - y_diff) + cb * y_diff * (1 - x_diff) + db * (x_diff * y_diff);
        green = ag * (1 - x_diff) * (1 - y_diff) + bg * x_diff * (1 - y_diff) + cg * y_diff * (1 - x_diff) + dg * (x_diff * y_diff);
        red = ar * (1 - x_diff) * (1 - y_diff) + br * x_diff * (1 - y_diff) + cr * y_diff * (1 - x_diff) + dr * (x_diff * y_diff);
        alpha = aa * (1 - x_diff) * (1 - y_diff) + ba * x_diff * (1 - y_diff) + ca * y_diff * (1 - x_diff) + da * (x_diff * y_diff);
        scaled_index = i * w2 + j;
        scaled_pixels[4 * scaled_index + 0] = red;
        scaled_pixels[4 * scaled_index + 1] = green;
        scaled_pixels[4 * scaled_index + 2] = blue;
        scaled_pixels[4 * scaled_index + 3] = alpha;
      }
    }
    scaled_ctx.putImageData(scaled_data, 0, 0);
    return scaled;
  };
  BoardThumbnailView.prototype.smooth = function(canvas) {
    var base, blue, denominator, green, h, i, iblue, igreen, indexOffset, indices, ired, j, k, kernel, pixels, red, smooth, smooth_ctx, smooth_data, smooth_pixels, w, _ref, _ref2, _ref3, _ref4, _ref5;
    w = canvas.width;
    h = canvas.height;
    pixels = canvas.getContext('2d').getImageData(0, 0, w, h).data;
    smooth = document.createElement('canvas');
    smooth.width = w;
    smooth.height = h;
    smooth_ctx = smooth.getContext('2d');
    smooth_data = smooth_ctx.getImageData(0, 0, w, h);
    smooth_pixels = smooth_data.data;
    indices = [-(w + 1), -w, -(w - 1), -1, 0, +1, w - 1, w, w + 1];
    kernel = [0.4, 0.4, 0.4, 0.4, 6.8, 0.4, 0.4, 0.4, 0.4];
    denominator = 10.0;
    for (i = 0, _ref = h - 1; (0 <= _ref ? i <= _ref : i >= _ref); (0 <= _ref ? i += 1 : i -= 1)) {
      for (j = 0, _ref2 = w - 1; (0 <= _ref2 ? j <= _ref2 : j >= _ref2); (0 <= _ref2 ? j += 1 : j -= 1)) {
        if (!(i === 0 || j === 0 || i === h - 1 || j === w - 1)) {
          continue;
        }
        indexOffset = (i * w + j) * 4;
        smooth_pixels[indexOffset + 0] = pixels[indexOffset + 0];
        smooth_pixels[indexOffset + 1] = pixels[indexOffset + 1];
        smooth_pixels[indexOffset + 2] = pixels[indexOffset + 2];
        smooth_pixels[indexOffset + 3] = pixels[indexOffset + 3];
      }
    }
    for (i = 1, _ref3 = h - 2; (1 <= _ref3 ? i <= _ref3 : i >= _ref3); (1 <= _ref3 ? i += 1 : i -= 1)) {
      for (j = 1, _ref4 = w - 2; (1 <= _ref4 ? j <= _ref4 : j >= _ref4); (1 <= _ref4 ? j += 1 : j -= 1)) {
        indexOffset = (i * w) + j;
        red = green = blue = 0.0;
        for (k = 0, _ref5 = kernel.length - 1; (0 <= _ref5 ? k <= _ref5 : k >= _ref5); (0 <= _ref5 ? k += 1 : k -= 1)) {
          base = (indexOffset + indices[k]) * 4;
          red += pixels[base + 0] * kernel[k];
          green += pixels[base + 1] * kernel[k];
          blue += pixels[base + 2] * kernel[k];
        }
        ired = parseInt(red / denominator, 10);
        igreen = parseInt(green / denominator, 10);
        iblue = parseInt(blue / denominator, 10);
        if (ired > 0xff) {
          ired = 0xff;
        }
        if (ired < 0) {
          ired = 0;
        }
        if (igreen > 0xff) {
          igreen = 0xff;
        }
        if (igreen < 0) {
          igreen = 0;
        }
        if (iblue > 0xff) {
          iblue = 0xff;
        }
        if (iblue < 0) {
          iblue = 0;
        }
        smooth_pixels[4 * indexOffset + 0] = ired;
        smooth_pixels[4 * indexOffset + 1] = igreen;
        smooth_pixels[4 * indexOffset + 2] = iblue;
        smooth_pixels[4 * indexOffset + 3] = 255;
      }
    }
    smooth_ctx.putImageData(smooth_data, 0, 0);
    return smooth;
  };
  BoardThumbnailView.prototype.on_smooth_texture = function(canvas) {
    var background, ctx, pattern, result;
    result = document.createElement('canvas');
    result.width = canvas.width;
    result.height = canvas.height;
    ctx = result.getContext('2d');
    background = $('#thumbnail .background_mini').dom[0];
    if (background) {
      pattern = ctx.createPattern(background, 'repeat');
      ctx.fillStyle = pattern;
      ctx.fillRect(0, 0, canvas.width, canvas.height);
    }
    ctx.drawImage(canvas, 0, 0);
    return result;
  };
  return BoardThumbnailView;
}();
var BoardView;
var __slice = Array.prototype.slice, __bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; }, __hasProp = Object.prototype.hasOwnProperty, __extends = function(child, parent) {
  for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; }
  function ctor() { this.constructor = child; }
  ctor.prototype = parent.prototype;
  child.prototype = new ctor;
  child.__super__ = parent.prototype;
  return child;
};
BoardView = function() {
  function BoardView() {
    var args;
    args = 1 <= arguments.length ? __slice.call(arguments, 0) : [];
    BoardView.__super__.constructor.apply(this, args);
    this.palette_as_image();
    _.bindAll(this, 'render');
    this.el = $('#board');
    this.top_bar = $("#board_wrapper #info_bar");
    this.model.bind("board:loaded", this.render);
    this.tile_views = {};
    Tiles.bind("add", __bind(function(tile) {
      return this.tile_views[tile.id] = new TileView({
        model: tile
      });
    }, this));
    Tiles.bind("remove", __bind(function(tile) {
      this.tile_views[tile.id].uninitialize();
      this.tile_views[tile.id].remove();
      return delete this.tile_views[tile.id];
    }, this));
  }
  __extends(BoardView, Backbone.View);
  BoardView.prototype.update_top_bar = function() {
    var events, html, level, prefix, tile, tiles, too_many, _ref, _ref2, _ref3, _ref4, _ref5;
    if (CurrentBoard.get('nr_done_tiles') === CurrentBoard.get('nr_total_tiles')) {
      _ref = ['notice', "YAY! This board is complete. Have a look around and then draw on one of our <a href='/'>other boards</a>."], level = _ref[0], html = _ref[1];
    } else {
      tiles = Tiles.select(function(t) {
        if (t.get('state') === 'available') {
          return true;
        }
        if (t.get('state') === 'not_available') {
          return t.get('substate') === 'need_provider' || t.get('substate') === 'need_signin';
        }
      });
      _ref2 = tiles.length > 0 ? ["", "" + (this.pluralize(tiles.length, "tile")) + " available. Click one of the plus signs to begin. Or see <a href='/'>all our boards</a>."] : (too_many = Tiles.select(function(t) {
        return t.get('state') === 'not_available' && t.get('substate') === 'too_many';
      }), too_many.length > 0 ? ["warning", "Sorry, no tiles available. You've already made the maximum number of tiles allowed on this board."] : ["warning", "Sorry, no tiles available. Have a look around or draw on one of our <a href='/'>other boards</a>."]), level = _ref2[0], html = _ref2[1];
      tiles = Tiles.by(CurrentUser);
      if (tiles.length > 0) {
        tile = _.find(tiles, function(t) {
          return t.get('state') === 'mine';
        });
        if (tile) {
          if (tile.get('substate') === 'reserved') {
            events = Activity.for_tile(tile);
            if (tile.is_sent_back()) {
              prefix = "<a href='" + (tile.local_url()) + "'>Your tile</a> was sent back for more work.";
            } else {
              prefix = "You have reserved <a href='" + (tile.local_url()) + "'>a tile</a>.";
            }
            if (tile.urgent()) {
              _ref3 = ['alarm', "" + prefix + " You have ONLY " + (tile.time_left()) + " LEFT to <a href='" + (tile.local_url()) + "'>upload it</a>!"], level = _ref3[0], html = _ref3[1];
            } else {
              _ref4 = ['warning', "" + prefix + " You have " + (tile.time_left()) + " left to <a href='" + (tile.local_url()) + "'>upload it</a>."], level = _ref4[0], html = _ref4[1];
            }
          } else {
            _ref5 = ['notice', "Yay! You uploaded <a href='" + (tile.local_url()) + "'>your tile</a>. After it gets approved, you can reserve another one."], level = _ref5[0], html = _ref5[1];
          }
        }
      }
    }
    this.top_bar.dom[0].className = level;
    return this.top_bar.html(html);
  };
  BoardView.prototype.render = function() {
    this.update_top_bar();
    return this.el.css({
      width: "" + (this.model.get('width') * this.model.get('tile_size')) + "px",
      height: "" + (this.model.get('height') * this.model.get('tile_size')) + "px",
      padding: "" + (this.model.get('border_size')) + "px"
    });
  };
  BoardView.prototype.palette_as_image = function() {
    var canvas, colors, columns, ctx, lines, palette, size;
    palette = $('#current_board .palette');
    if (palette.empty()) {
      return;
    }
    colors = $('span', palette).dom;
    size = 16;
    canvas = document.createElement("canvas");
    ctx = canvas.getContext("2d");
    columns = 8;
    lines = Math.ceil(colors.length * 1.0 / columns);
    canvas.width = columns * size;
    canvas.height = lines * size;
    _.each(colors, function(color, i) {
      var column, line;
      line = Math.floor(i * 1.0 / columns);
      column = i % columns;
      ctx.fillStyle = $(color).css('background-color');
      return ctx.fillRect(size * column, size * line, size, size);
    });
    return palette.html('<img src="' + canvas.toDataURL() + '"/>');
  };
  return BoardView;
}();
var BoardsListView;
var __slice = Array.prototype.slice, __hasProp = Object.prototype.hasOwnProperty, __extends = function(child, parent) {
  for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; }
  function ctor() { this.constructor = child; }
  ctor.prototype = parent.prototype;
  child.prototype = new ctor;
  child.__super__ = parent.prototype;
  return child;
}, __bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; };
BoardsListView = function() {
  function BoardsListView() {
    var args;
    args = 1 <= arguments.length ? __slice.call(arguments, 0) : [];
    BoardsListView.__super__.constructor.apply(this, args);
    this.el = $("#tzigla");
    this.root = this.$('#title');
    if (this.root.dom.length <= 0) {
      this.root = this.$('#logo');
    }
    this.boards = this.$('.boards');
    this.boards.hide();
    this.delegateEvents();
    _.bindAll(this, 'show_boards', 'hide_boards', 'on_boards', 'off_boards');
  }
  __extends(BoardsListView, Backbone.View);
  if (DESKTOP) {
    BoardsListView.prototype.events = {
      "mouseover #title": 'show_boards',
      "mouseover #logo": 'show_boards',
      "mouseover .boards": 'on_boards',
      "mouseout  #title": 'hide_boards',
      "mouseout  #logo": 'hide_boards',
      "mouseout  .boards": 'off_boards'
    };
  } else {
    BoardsListView.prototype.events = {
      "mousedown #title": 'toggle_boards',
      "mousedown #logo": 'toggle_boards',
      "click #title": 'cancel_event',
      "click #logo": 'cancel_event'
    };
  }
  BoardsListView.prototype.cancel_event = function(event) {
    return stop_event(event);
  };
  BoardsListView.prototype.toggle_boards = function(event) {
    var elem, _ref;
    stop_event(event);
    elem = event.target.tagName.toLowerCase() === 'a' ? event.target : $(event.target).closest('a').dom[0];
    if (this.boards.visible()) {
      elem.innerHTML = this.original;
      return this.hide_boards(event);
    } else {
      (_ref = this.original) != null ? _ref : this.original = elem.innerHTML;
      elem.innerHTML = '<span>Quick navigation. Tap again to hide</span>';
      return this.show_boards(event);
    }
  };
  BoardsListView.prototype.show_boards = function(event) {
    var opacity;
    opacity = this.boards.css('opacity');
    this.clear_timeout();
    if (!this.boards.visible()) {
      this.boards.show();
      this.root.addClass('selected');
      return emile(this.boards.dom[0], 'opacity: 1.0', {
        duration: 50
      });
    }
  };
  BoardsListView.prototype.hide_boards = function(event) {
    return this.timeout = defer(200, __bind(function() {
      this.root.removeClass('selected');
      return emile(this.boards.dom[0], 'opacity: 0.0', {
        duration: 50,
        after: __bind(function() {
          return this.boards.hide();
        }, this)
      });
    }, this));
  };
  BoardsListView.prototype.on_boards = function(event) {
    var opacity;
    opacity = this.boards.css('opacity');
    return this.show_boards(event);
  };
  BoardsListView.prototype.off_boards = function(event) {
    var opacity;
    opacity = this.boards.css('opacity');
    return this.hide_boards(event);
  };
  BoardsListView.prototype.clear_timeout = function() {
    if (this.timeout) {
      window.clearTimeout(this.timeout);
    }
    return this.timeout = null;
  };
  return BoardsListView;
}();
var CanvasView;
var __hasProp = Object.prototype.hasOwnProperty, __extends = function(child, parent) {
  for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; }
  function ctor() { this.constructor = child; }
  ctor.prototype = parent.prototype;
  child.prototype = new ctor;
  child.__super__ = parent.prototype;
  return child;
}, __slice = Array.prototype.slice;
CanvasView = function() {
  function CanvasView(options) {
    CanvasView.__super__.constructor.call(this, options);
    this.delegateEvents();
    _.bindAll(this, 'set_pixel', 'set_all_pixels');
    this.model.bind('change:pixel', this.set_pixel);
    this.model.bind('change:all_pixels', this.set_all_pixels);
  }
  __extends(CanvasView, Backbone.View);
  CanvasView.prototype.render = function() {
    var canvas, ctx, layer_index, _ref, _results;
    this.zoom = parseInt(this.el.attr('data-zoom'), 10);
    this.max_brush_size = 6;
    this.canvas_size = this.zoom * this.model.get('canvas_size');
    this.border_size = this.zoom * this.model.get('border_size');
    this.contour_size = this.zoom * this.model.get('contour_size');
    this.brush_preview_size = this.zoom * this.max_brush_size;
    this.render_template('editor/canvas');
    this.$('.inner').css({
      left: "" + this.border_size + "px",
      top: "" + this.border_size + "px",
      width: "" + this.canvas_size + "px",
      height: "" + this.canvas_size + "px"
    });
    this.border = this.$('.border');
    this.border.css({
      left: 0,
      top: 0
    });
    if (this.model.get('border_source')) {
      CanvasExt.draw_zoomed_border({
        border_size: this.model.get('border_size'),
        palette: this.model.editor.palette,
        datas: this.model.get_palette_as_datas(this.zoom),
        zoom: this.zoom,
        source: this.model.get('border_source'),
        target: this.border.dom[0]
      });
    }
    this.layers = this.$('.layers');
    this.layers.css({
      left: "" + this.border_size + "px",
      top: "" + this.border_size + "px",
      width: "" + this.canvas_size + "px",
      height: "" + this.canvas_size + "px",
      'background-color': "" + this.model.editor.palette.hexes[0]
    });
    this.layers_inner = this.layers.find('.inner');
    this.layers_inner.css({
      left: 0,
      top: 0
    });
    this.contexts = [];
    _results = [];
    for (layer_index = 0, _ref = this.model.layers.length - 1; (0 <= _ref ? layer_index <= _ref : layer_index >= _ref); (0 <= _ref ? layer_index += 1 : layer_index -= 1)) {
      canvas = document.createElement('canvas');
      canvas.className = "layer_" + layer_index;
      canvas.width = canvas.height = this.canvas_size;
      if (!this.model.layers[layer_index].visible) {
        canvas.style.cssText = 'display: none';
      }
      this.layers_inner.dom[0].appendChild(canvas);
      ctx = canvas.getContext('2d');
      this.contexts.push(ctx);
      _results.push(this.set_all_pixels(layer_index));
    }
    return _results;
  };
  CanvasView.prototype.set_pixel = function() {
    var args, color, ctx, x, y;
    args = 1 <= arguments.length ? __slice.call(arguments, 0) : [];
    x = args[0], y = args[1], color = args[2];
    ctx = this.contexts[this.model.get('current_layer')];
    if (color != null) {
      ctx.fillStyle = color;
      return ctx.fillRect(x * this.zoom, y * this.zoom, this.zoom, this.zoom);
    } else {
      return ctx.clearRect(x * this.zoom, y * this.zoom, this.zoom, this.zoom);
    }
  };
  CanvasView.prototype.set_all_pixels = function(layer_index) {
    if (layer_index == null) {
      layer_index = null;
    }
    layer_index != null ? layer_index : layer_index = this.model.get('current_layer');
    return CanvasExt.indexed_to_canvas({
      pixels: this.model.layers[layer_index].pixels,
      zoom: this.zoom,
      datas: this.model.get_palette_as_datas(this.zoom),
      context: this.contexts[layer_index]
    });
  };
  return CanvasView;
}();
var CurrentArtistView;
var __slice = Array.prototype.slice, __hasProp = Object.prototype.hasOwnProperty, __extends = function(child, parent) {
  for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; }
  function ctor() { this.constructor = child; }
  ctor.prototype = parent.prototype;
  child.prototype = new ctor;
  child.__super__ = parent.prototype;
  return child;
};
CurrentArtistView = function() {
  function CurrentArtistView() {
    var args;
    args = 1 <= arguments.length ? __slice.call(arguments, 0) : [];
    CurrentArtistView.__super__.constructor.apply(this, args);
    this.el = $('#current_artist');
    this.delegateEvents();
    _.bindAll(this, 'render', 'artist_changed');
    CurrentBoard.bind("board:loaded", this.render);
    State.bind("change:current_artist", this.artist_changed);
  }
  __extends(CurrentArtistView, Backbone.View);
  if (DESKTOP) {
    CurrentArtistView.prototype.events = {
      "mouseover .tiles a": "highlight_artist_or_tile",
      "mouseout  .tiles a": "unhighlight_artist_or_tile",
      "click     .tiles a": "unhighlight_artist_or_tile"
    };
  }
  CurrentArtistView.prototype.highlight_artist_or_tile = function(event) {
    var tile;
    tile = Tiles.get_from_elem(event.target);
    if (tile) {
      tile.silent_set({
        scroll_into_view: true
      });
      return tile.set({
        focused: true
      });
    }
  };
  CurrentArtistView.prototype.unhighlight_artist_or_tile = function(event) {
    var _ref;
    return (_ref = Tiles.get_from_elem(event.target)) != null ? _ref.set({
      focused: false
    }) : void 0;
  };
  CurrentArtistView.prototype.artist_changed = function() {
    Tiles.select_by(CurrentArtist);
    if (CurrentArtist) {
      return this.render();
    }
  };
  CurrentArtistView.prototype.render = function() {
    if (!CurrentArtist) {
      return this.el.html("");
    }
    return this.render_template('current_artist/current_artist', this, {
      user: CurrentArtist
    });
  };
  return CurrentArtistView;
}();
var CurrentTileView;
var __slice = Array.prototype.slice, __hasProp = Object.prototype.hasOwnProperty, __extends = function(child, parent) {
  for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; }
  function ctor() { this.constructor = child; }
  ctor.prototype = parent.prototype;
  child.prototype = new ctor;
  child.__super__ = parent.prototype;
  return child;
}, __bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; };
CurrentTileView = function() {
  function CurrentTileView() {
    var args;
    args = 1 <= arguments.length ? __slice.call(arguments, 0) : [];
    CurrentTileView.__super__.constructor.apply(this, args);
    this.min_chars = 20;
    this.max_chars = 255;
    this.el = $('#current_tile');
    this.delegateEvents();
    _.bindAll(this, 'editor_loaded');
    _.bindAll(this, 'render');
    CurrentBoard.bind("board:loaded", this.render);
    CurrentBoard.bind('change:tiles_loaded', this.render);
    _.bindAll(this, 'tile_changed');
    State.bind("change:current_tile", this.tile_changed);
    _.bindAll(this, 'upload_iframe_success', 'upload_iframe_error');
    window.upload_iframe_success = this.upload_iframe_success;
    this.update_upload_filename();
    _.bindAll(this, 'thumbnail_loaded', 'send_thumbnails');
    CurrentBoard.bind('thumbnail:loaded', this.thumbnail_loaded);
  }
  __extends(CurrentTileView, Backbone.View);
  CurrentTileView.prototype.events = {
    "click  #reserve a": 'reserve',
    "click  #release a": 'release',
    "click  a#show_editor": 'show_editor',
    "change #file": 'update_upload_filename',
    "submit #send_image form": 'upload',
    "click .draw_options input": 'update_upload_ui',
    "click a.edit_title_toggle": 'edit_title_toggle',
    "submit #edit_title": 'update_title',
    "submit #moderate form": "send_moderation",
    "click #moderate input[type=radio]": "update_admin_form",
    "keyup #moderate textarea": "update_error"
  };
  CurrentTileView.prototype.tile_changed = function() {
    Tiles.deselect_all();
    if ((typeof CurrentEditorTile != "undefined" && CurrentEditorTile !== null ? CurrentEditorTile.id : void 0) !== (typeof CurrentTile != "undefined" && CurrentTile !== null ? CurrentTile.id : void 0)) {
      this.hide_editor();
    }
    if (CurrentTile) {
      CurrentTile.set({
        selected: true
      });
      this.render();
      return defer(200, function() {
        CurrentTile.set({
          scroll_into_view: true
        });
        return CurrentTile.trigger("change:selected");
      });
    }
  };
  CurrentTileView.prototype.render = function() {
    var template_name;
    if (!CurrentTile) {
      return;
    }
    if (!CurrentBoard.get('tiles_loaded')) {
      return;
    }
    this.tile_path = CurrentBoard.url() + "/tile";
    this.state = CurrentTile.get('state');
    this.substate = CurrentTile.get('substate');
    this.urgent = CurrentTile.urgent_class();
    if (CurrentTile.is_pending() && CurrentUser.can_moderate) {
      CurrentTile.set({
        state: 'admin'
      });
      this.state = 'admin';
    }
    this.el.attr("class", "" + this.state + " " + this.substate + " " + this.urgent);
    template_name = this.state === 'done_visible' ? 'done' : this.state;
    this.render_template('current_tile/' + template_name, this, {
      tile: CurrentTile
    });
    if (CurrentBoard.get('palette').length > 0) {
      if (this.state === 'mine' && this.substate === 'reserved') {
        this.$('.details .tile img').css({
          'background-color': CurrentBoard.get('palette_detailed').split("\n")[0]
        });
        return this.init_editor();
      }
    }
  };
  CurrentTileView.prototype.reserve = function(event) {
    stop_event(event);
    this.$('#reserve a').hide();
    this.$('#reserve .spinner').show();
    return $.ajax({
      type: 'POST',
      url: this.tile_path,
      data: {
        tile: {
          left: CurrentTile.get('left'),
          top: CurrentTile.get('top')
        },
        authenticity_token: $.get_authenticity_token()
      },
      success: __bind(function(response) {
        return CurrentBoard.parse_and_set(JSON.parse(response));
      }, this),
      error: __bind(function() {
        return CurrentBoard.fetch();
      }, this)
    });
  };
  CurrentTileView.prototype.update_upload_ui = function(event) {
    event.stopPropagation();
    this.$('.option').hide();
    this.$(".option." + event.target.value).show();
    this.$('#send_image .loading').hide();
    this.$('#send_image .success').hide();
    this.$('#send_image .error').hide();
    if (event.target.value !== 'editor') {
      return this.hide_editor();
    }
  };
  CurrentTileView.prototype.show_editor = function(event) {
    stop_event(event);
    return CurrentEditorView.show();
  };
  CurrentTileView.prototype.hide_editor = function() {
    return typeof CurrentEditorView != "undefined" && CurrentEditorView !== null ? CurrentEditorView.hide() : void 0;
  };
  CurrentTileView.prototype.init_editor = function() {
    if (!window.Editor) {
      return window.Editor = new EditorModel({
        max_size: _.max([$.viewport().height - 100 - 8, 480]),
        palette: CurrentBoard.get('palette_detailed').split("\n"),
        source: this.get_reservable_contents(),
        canvas_size: CurrentBoard.get('tile_size'),
        border_source: $('#current_tile .tile img').dom[0],
        border_size: CurrentBoard.get('border_size'),
        loaded_callback: this.editor_loaded
      });
    }
  };
  CurrentTileView.prototype.editor_loaded = function() {
    window.CurrentEditorView = new EditorView({
      model: Editor,
      standalone: false
    });
    window.CurrentEditorTile = CurrentTile;
    Editor.bind('editor:saved', __bind(function() {
      return CurrentEditorTile.store_in_local_storage(Editor["export"]());
    }, this));
    return CurrentEditorView.bind('editor-view:hide', this.editor_hidden);
  };
  CurrentTileView.prototype.reset_editor = function() {
    this.hide_editor();
    window.Editor = null;
    window.CurrentEditorView = null;
    return window.CurrentEditorTile = null;
  };
  CurrentTileView.prototype.editor_hidden = function() {
    CurrentEditorTile.set_draft(Editor["export"]());
    return defer(500, __bind(function() {
      return State.trigger('change:current_tile', State, CurrentEditorTile.public_id());
    }, this));
  };
  CurrentTileView.prototype.get_reservable_contents = function() {
    var canvas, context, offset, reservable, size, type;
    type = CurrentTile.must_load_image_type();
    switch (type) {
      case 'd':
      case 'l':
        return CurrentTile.url(type);
      default:
        reservable = $('#current_tile .tile img').dom[0];
        size = CurrentBoard.get('tile_size');
        canvas = document.createElement('canvas');
        canvas.width = canvas.height = size;
        offset = -CurrentBoard.get('border_size');
        context = canvas.getContext('2d');
        context.drawImage(reservable, offset, offset);
        return canvas.toDataURL();
    }
  };
  CurrentTileView.prototype.update_upload_filename = function(event) {
    var file, filename;
    file = this.$('#file').dom[0];
    if (!file) {
      return;
    }
    filename = file.value;
    if (filename === "") {
      filename = "&nbsp;";
    }
    this.$('.upload .filename').html(filename);
    return this.$('.upload .filename').css("visibility", "visible");
  };
  CurrentTileView.prototype.upload = function(event) {
    var form;
    stop_event(event);
    form = $(event.target);
    form.hide();
    this.hide_editor();
    debug('HOOK init');
    this.$('#send_image .error').hide();
    this.$('#send_image .success').hide();
    this.$('#send_image .loading').show();
    this.$('#upload_iframe').unbind('load');
    this.$('#upload_iframe').bind('load', this.upload_iframe_error);
    debug('HOOK start');
    if (form.closest('.option.editor').dom.length > 0) {
      form.find('.file').dom[0].value = Editor.canvas.export_image();
    }
    return form.dom[0].submit();
  };
  CurrentTileView.prototype.upload_iframe_success = function() {
    debug('upload iframe success');
    this.$('#send_image .loading').hide();
    this.$('#send_image .success').show();
    this.$('#upload_iframe').unbind('load');
    this.reset_editor();
    Tiles.each(function(tile) {
      return tile.delete_local_storage();
    });
    return CurrentBoard.fetch();
  };
  CurrentTileView.prototype.upload_iframe_error = function() {
    debug('upload iframe error');
    this.$('#send_image .loading').hide();
    this.$('#send_image .error').show();
    return this.$('#send_image form').show();
  };
  CurrentTileView.prototype.release = function(event) {
    stop_event(event);
    this.$('#release p').hide();
    this.$('#release .spinner').show();
    this.hide_editor();
    $.ajax({
      type: 'DELETE',
      url: this.tile_path,
      data: {
        authenticity_token: $.get_authenticity_token()
      },
      success: __bind(function(response) {
        this.reset_editor();
        return CurrentBoard.parse_and_set(JSON.parse(response));
      }, this),
      error: __bind(function() {
        return CurrentBoard.fetch();
      }, this)
    });
    return false;
  };
  CurrentTileView.prototype.edit_title_toggle = function(event) {
    stop_event(event);
    this.$('h1 > a').toggle('inline');
    if (this.$('h1 strong').exists()) {
      this.$('h1 strong').toggle('inline');
    }
    this.$('h1 form').toggle('inline');
    return this.$('h1 .spinner').hide();
  };
  CurrentTileView.prototype.update_title = function(event) {
    var title;
    stop_event(event);
    title = this.$('form input[type=text]').dom[0].value;
    if (title.length < 1) {
      return;
    }
    if (title.length > 255) {
      return;
    }
    this.$('h1 form').hide();
    this.$('h1 .spinner').show('inline');
    return $.ajax({
      type: 'PUT',
      url: "/tiles/" + (CurrentTile.get('object_id')) + ".json",
      data: {
        tile: {
          title: title
        },
        authenticity_token: $.get_authenticity_token()
      },
      success: __bind(function(response) {
        CurrentTile.silent_set({
          title: title
        });
        return this.render();
      }, this),
      error: __bind(function(xhr) {
        this.$('h1 form').show('inline');
        return this.$('h1 .spinner').hide();
      }, this)
    });
  };
  CurrentTileView.prototype.update_error = function(event) {
    var chars, error, save_button, textarea, value;
    textarea = this.$('#moderate form textarea');
    error = this.$('#moderate .error');
    save_button = this.$('form input.button');
    value = textarea.dom[0].value;
    chars = value.length;
    CurrentTile.silent_set({
      admin_comment: value
    });
    if (chars < this.min_chars) {
      save_button.dom[0].disabled = true;
      if (chars > 0) {
        return error.html("min " + this.min_chars + " chars");
      } else {
        return error.html("");
      }
    } else {
      if (chars > this.max_chars) {
        save_button.dom[0].disabled = true;
        return error.html("max " + this.max_chars + " chars");
      } else {
        save_button.dom[0].disabled = false;
        return error.html('');
      }
    }
  };
  CurrentTileView.prototype.update_admin_form = function(event) {
    var act, button, moderate;
    moderate = this.$('#moderate');
    button = moderate.find('input.button').dom[0];
    act = event.target.value;
    switch (act) {
      case 'approve':
        moderate.find('textarea').hide();
        moderate.find('.error').html("are you sure?");
        button.disabled = false;
        button.value = "Approve tile";
        moderate.find(".send_back").removeClass("checked");
        moderate.find(".reject").removeClass("checked");
        break;
      case 'send_back':
        moderate.find('textarea').show();
        this.update_error();
        button.value = "Send tile back for more work";
        moderate.find(".approve").removeClass("checked");
        moderate.find(".reject").removeClass("checked");
        break;
      case 'reject':
        moderate.find('textarea').hide();
        moderate.find('.error').html("are you sure?");
        button.disabled = false;
        button.value = "Reject tile";
        moderate.find(".approve").removeClass("checked");
        moderate.find(".send_back").removeClass("checked");
    }
    moderate.find("." + act).addClass("checked");
    button.className = "button " + event.target.value;
    return LayoutView.position();
  };
  CurrentTileView.prototype.send_moderation = function(event) {
    var act, comment, form, moderate, params;
    stop_event(event);
    moderate = this.$('#moderate');
    form = event.currentTarget;
    act = moderate.find(".approve input").dom[0].checked ? "approve" : moderate.find(".send_back input").dom[0].checked ? "send_back" : moderate.find(".reject input").dom[0].checked ? "reject" : void 0;
    params = {
      act: act,
      authenticity_token: $.get_authenticity_token()
    };
    if (act === "send_back") {
      comment = this.$('form textarea').dom[0].value;
      params.comment = comment;
      if (comment.length < this.min_chars) {
        return;
      }
      if (comment.length > this.max_chars) {
        return;
      }
    }
    if (act === "approve") {
      moderate.hide();
      $('.uploading_thumbnail').show();
    } else {
      moderate.find("form").hide();
      moderate.find(".spinner").show();
    }
    return $.ajax({
      type: 'POST',
      url: "" + form.action + ".json",
      data: params,
      success: __bind(function(response) {
        if (act === "approve") {
          CurrentBoard.bind('change:tiles_loaded', this.send_thumbnails);
        }
        return CurrentBoard.parse_and_set(JSON.parse(response));
      }, this),
      error: __bind(function() {
        CurrentBoard.fetch();
        $('.uploading_thumbnail').hide();
        moderate.find(".spinner").hide();
        return moderate.find("form").show();
      }, this)
    });
  };
  CurrentTileView.prototype.send_thumbnails = function() {
    if (!CurrentBoard.get('tiles_loaded')) {
      return;
    }
    CurrentBoard.unbind('change:tiles_loaded', this.send_thumbnail);
    this.thumbnails = 2;
    BoardThumbnailView.send_thumbnail('small');
    return BoardThumbnailView.send_thumbnail('big');
  };
  CurrentTileView.prototype.thumbnail_loaded = function() {
    this.thumbnails -= 1;
    if (this.thumbnails === 0) {
      return $('.uploading_thumbnail').hide();
    }
  };
  CurrentTileView.prototype.generate_reservable = function() {
    var border, canvas, ctx, direction, dx, dy, l, result_image_data, size, t, tile, tile_canvas, tile_ctx, tile_data, total_size, _ref, _ref2;
    l = CurrentTile.get('left');
    t = CurrentTile.get('top');
    size = CurrentBoard.get('tile_size');
    border = CurrentBoard.get('border_size');
    canvas = document.createElement("canvas");
    canvas.width = size * 3;
    canvas.height = size * 3;
    ctx = canvas.getContext("2d");
    ctx.fillStyle = CurrentBoard.get('palette').length > 0 ? CurrentBoard.get('palette_detailed').split("\n")[0] : "#222";
    ctx.fillRect(0, 0, size * 3, size * 3);
    if (CurrentTile.must_load()) {
      tile = $("#tile_" + CurrentTile.id + ".t .img canvas").dom[0];
      ctx.drawImage(tile, size, size);
    } else {
      ctx.fillStyle = "#000";
      ctx.fillRect(size, size, size, size);
    }
    _ref = CurrentBoard.matrix.DIRECTIONS2MOVEMENTS;
    for (direction in _ref) {
      if (!__hasProp.call(_ref, direction)) continue;
      _ref2 = _ref[direction], dx = _ref2[0], dy = _ref2[1];
      if (CurrentBoard.matrix.is_done(l + dx, t + dy)) {
        tile_canvas = $("#tile_" + (l + dx) + "_" + (t + dy) + " canvas").dom[0];
        tile_ctx = tile_canvas.getContext("2d");
        tile_data = tile_ctx.getImageData(0, 0, size, size);
        ctx.putImageData(tile_data, size * (dx + 1), size * (dy + 1));
      }
    }
    total_size = size + border * 2;
    result_image_data = ctx.getImageData(size - border, size - border, total_size, total_size);
    canvas.width = total_size;
    canvas.height = total_size;
    ctx.putImageData(result_image_data, 0, 0);
    return canvas.toDataURL();
  };
  CurrentTileView.prototype.canvas_data_url = function() {
    return $('#tile_' + CurrentTile.id + ' canvas').dom[0].toDataURL();
  };
  CurrentTileView.prototype.contour_image_url = function() {
    return $('#tile_' + CurrentTile.id + ' img').dom[0].src;
  };
  CurrentTileView.prototype.tile_title = function() {
    var prefix, small, tile, title;
    tile = CurrentTile;
    small = "<small>#" + (tile.public_id()) + "</small>";
    title = function() {
      switch (this.state) {
        case 'admin':
          return 'Moderate this tile';
        case 'available':
          return 'Want to draw this tile?';
        case 'done':
          if (tile.get('title') && (CurrentUser.can_moderate || tile.get('user_id') === CurrentUser.id || CurrentBoard.get('show_done'))) {
            return html_escape(tile.get('title'));
          }
          break;
        case 'done_visible':
          if (tile.get('title') && (CurrentUser.can_moderate || tile.get('user_id') === CurrentUser.id || CurrentBoard.get('show_done_visible'))) {
            return html_escape(tile.get('title'));
          }
          break;
        case 'mine':
          if (this.substate === 'reserved') {
            prefix = this.urgent ? 'ONLY ' : '';
            return "" + prefix + " " + (tile.time_left()) + " left to upload";
          } else {
            return "Uploaded <small>(pending moderation)</small>";
          }
          break;
        case 'not_available':
          switch (this.substate) {
            case 'reserved':
              return "Reserved <small>(" + (tile.time_left()) + " left)</small>";
              break;
            case 'pending':
              return 'Pending moderation';
            case 'need_signin':
            case 'need_provider':
              return 'Sign in to draw this tile';
            case 'too_close':
            case 'have_reserved':
            case 'have_pending':
            case 'too_many':
            case null:
              return 'Not available';
          }
      }
    }.call(this);
    if (title) {
      return "" + small + ": <strong>" + title + "</strong>";
    } else {
      return small;
    }
  };
  CurrentTileView.prototype.tile_notes = function() {
    var str, tile;
    tile = CurrentTile;
    switch (tile.get('state')) {
      case 'done':
        if (CurrentBoard.get('show_done')) {
          return null;
        } else {
          str = CurrentBoard.get('show_done_visible') ? 'This tile will be fully revealed once all its neighbours are done as well.' : 'This tile will be revealed once all the tiles on the board are done.';
          if (tile.get('user_id') === CurrentUser.id) {
            str += ' Until then, its title is only visible to you.';
          }
          return str;
        }
        break;
      case 'done_visible':
        str = null;
        if (!CurrentBoard.get('show_done_visible')) {
          str = 'This tile will be revealed once all the tiles on the board are done.';
          if (tile.get('user_id') === CurrentUser.id) {
            str += ' Until then, its title is only visible to you.';
          }
        }
        return str;
        break;
      case 'not_available':
        switch (tile.get('substate')) {
          case 'too_close':
            return 'This tile is too close to one of your tiles.';
          case 'have_reserved':
            return 'You already have a tile.';
          case 'have_pending':
            return 'You already have a tile.';
          case null:
            return 'This tile needs at least a finished neighbour.';
        }
    }
  };
  return CurrentTileView;
}();
var EditBoardView;
var __bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; }, __hasProp = Object.prototype.hasOwnProperty;
EditBoardView = Backbone.View.extend({
  initialize: function(options) {
    this.controller = options.controller;
    delete options.controller;
    Backbone.View.prototype.initialize.call(this, options);
    this.el = $('#sidebar .admin');
    this.attributes_in_ui = 'allowed_providers title description width height tile_size border_size seed_tiles tile_reservation_duration private_board pixelation_allowed use_custom_palette palette palette_detailed'.split(' ');
    this.integer_attributes = 'width height tile_size border_size tile_reservation_duration'.split(' ');
    _.bindAll(this, 'dimensions_touched');
    this.model.bind('change:dimensions_touched', this.dimensions_touched);
    this.model.bind('change:changed', this.toggle_save);
    _.bindAll(this, 'update_ui_elements');
    this.model.bind("change", this.update_ui_elements);
    this.model.bind("change:private_board", this.update_private_board);
    this.model.bind("change:pixelation_allowed", __bind(function(model, value) {
      return this.update_provider_allowed("pixelation", value);
    }, this));
    _.bindAll(this, 'remove_change_markers');
    this.model.bind("board:clean_attributes", this.remove_change_markers);
    _.bindAll(this, 'update_seed_tile_ticks');
    this.model.bind("change:seed_tiles", this.update_seed_tile_ticks);
    this.model.bind("board:loaded", this.update_seed_tile_ticks);
    _.bindAll(this, 'update_use_custom_palette');
    this.model.bind("change:use_custom_palette", this.update_use_custom_palette);
    _.bindAll(this, 'update_color_count');
    this.model.bind("change:palette_detailed", this.update_color_count);
    _.bindAll(this, 'update_palette_preview');
    this.model.bind("change:palette_detailed", this.update_palette_preview);
    return Backbone.View.prototype.delegateEvents.call(this);
  },
  events: {
    "change input": "ui_element_changed",
    "change textarea": "ui_element_changed",
    "click .custom_palette .extract_from_image_teaser .upload_image_link": "show_upload",
    "click .custom_palette .extract_from_image .cancel": "hide_upload",
    "click .custom_palette .main .undo": "reset_palette",
    "reset form": "remove_change_markers",
    "submit form": "save_changes_or_extract_palette",
    "change .custom_palette .extract_from_image input.field": "update_filename",
    "click .custom_palette .extract_from_image input.button": "set_extracting_colors"
  },
  update_ui_elements: function() {
    var attr, value, _ref, _results;
    _ref = this.model.changedAttributes();
    _results = [];
    for (attr in _ref) {
      if (!__hasProp.call(_ref, attr)) continue;
      value = _ref[attr];
      _results.push(_.include(this.attributes_in_ui, attr) ? this.update_ui_element(attr, value) : void 0);
    }
    return _results;
  },
  update_ui_element: function(attr, value) {
    var elem;
    elem = $("#board_" + attr).dom[0];
    if (elem.type === "checkbox") {
      elem.checked = String(value) === "true";
    } else {
      elem.value = value;
    }
    return this.mark_changed(attr);
  },
  ui_element_changed: function(event) {
    var attr_name, elem, value, _obj;
    elem = event.target;
    attr_name = elem.name.replace(/^.*\[/, '').replace(/\].*$/, '');
    value = elem.type === "checkbox" ? elem.checked : elem.value;
    if (_.include(this.integer_attributes, attr_name)) {
      value = parseInt(value, 10) || 0;
    }
    return this.model.set((_obj = {}, _obj["" + attr_name] = value, _obj), {
      error: __bind(function(model, message) {
        var model_value;
        model_value = this.model.get(attr_name);
        return this.update_ui_element(attr_name, model_value);
      }, this)
    });
  },
  update_seed_tile_ticks: function() {
    var seed_tiles, seeds_hash;
    seed_tiles = this.model.get('seed_tiles');
    if (!seed_tiles || Tiles.length === 0) {
      return;
    }
    seeds_hash = {};
    _.each(seed_tiles, function(pair) {
      return seeds_hash["" + pair[0] + "_" + pair[1]] = true;
    });
    return Tiles.each(__bind(function(tile) {
      var checked, el, tick;
      tick = $("#tile_" + tile.id + "_tick");
      if (tick.empty()) {
        el = $("#tile_" + tile.id);
        return checked = seeds_hash[tile.id] ? "checked" : "";
      }
    }, this));
  },
  update_private_board: function(model, private_board) {
    var container, elem, label;
    elem = $("#board_private_board");
    container = elem.closest('.allowed_providers');
    label = container.find('strong.label');
    if (private_board) {
      container.addClass('private');
      return label.html("Private board");
    } else {
      container.removeClass('private');
      return label.html("Public board");
    }
  },
  update_provider_allowed: function(provider, value) {
    return $("#board_" + provider + "_allowed").dom[0].checked = value;
  },
  update_use_custom_palette: function(model, use_custom_palette) {
    var container, elem, label;
    elem = $("#board_use_custom_palette");
    container = this.$('.custom_palette');
    label = container.find('strong.label');
    if (use_custom_palette) {
      this.model.update_palette_from_palette_detailed(this.model, this.model.get('palette_detailed'));
      return container.show();
    } else {
      this.model.set({
        palette: []
      });
      return container.hide();
    }
  },
  show_upload: function(event) {
    if (event) {
      stop_event(event);
    }
    return this.$('.custom_palette').addClass('upload');
  },
  hide_upload: function(event) {
    if (event) {
      stop_event(event);
    }
    return this.$('.custom_palette').removeClass('upload');
  },
  reset_palette: function(event) {
    if (event) {
      stop_event(event);
    }
    return this.model.reset('palette_detailed');
  },
  update_color_count: function(model, palette) {
    var color_count, label, plural_suffix;
    if (palette.length === 0) {
      color_count = 0;
    } else {
      color_count = palette.split("\n").length;
    }
    label = this.$('.custom_palette .main .title label');
    plural_suffix = color_count !== 1 ? 's' : '';
    return label.html("" + color_count + " color" + plural_suffix);
  },
  mark_changed: function(attr) {
    var container, elem, original_value, value;
    elem = $("#board_" + attr).dom[0];
    original_value = this.model.clean_attributes[attr];
    value = elem.type === "checkbox" ? elem.checked : elem.value;
    if (elem.type === 'checkbox' || elem.type === "hidden") {
      container = this.$("*[for=" + elem.id + "]");
    } else {
      container = $(elem);
    }
    if (String(original_value) !== String(value)) {
      if (container.exists()) {
        container.addClass('changed');
      }
    } else {
      if (container.exists()) {
        container.removeClass('changed');
      }
    }
    return this.update_save_button();
  },
  remove_change_markers: function() {
    this.$('.changed').each(function(elem) {
      return $(elem).removeClass('changed');
    });
    return this.update_save_button();
  },
  update_filename: function(event) {
    var extractor;
    extractor = this.$('.extract_from_image');
    extractor.find('.loading').hide();
    extractor.find('.error').hide();
    extractor.find('.success').hide();
    extractor.find('.filename').show();
    return this.$('.extract_from_image .filename').html(event.target.value);
  },
  set_extracting_colors: function(event) {
    return this.extracting_colors = true;
  },
  save_changes_or_extract_palette: function(event) {
    var extractor, file, form, iframe, method;
    form = $(event.target);
    if (event) {
      stop_event(event);
    }
    if (this.extracting_colors) {
      file = this.$('.custom_palette .file_chooser .field');
      if (!file.exists() || file.dom[0].value.trim() === "") {
        return;
      }
      form.dom[0].action = form.attr('data-extract_action');
      form.dom[0].target = 'upload_iframe2';
      method = form.find('input[name=_method]');
      method.dom[0].value = 'post';
      extractor = this.$('.extract_from_image');
      extractor.find('.file_chooser_container').hide();
      extractor.find('.filename').hide();
      extractor.find('.error').hide();
      extractor.find('.success').hide();
      extractor.find('.loading').show();
      iframe = this.$('#upload_iframe2');
      iframe.unbind('load');
      window.defer(1, __bind(function() {
        return iframe.bind('load', __bind(function(event) {
          var doc, response, win;
          if (this.timeout_error) {
            window.clearTimeout(this.timeout_error);
          }
          win = event.target.contentWindow;
          doc = win.document.body || win.document.documentElement;
          response = JSON.parse(doc.innerHTML);
          if (response.error) {
            this.extract_error(response.error);
          } else {
            this.extract_success(response.colors);
          }
          window.defer(1, function() {
            return iframe.unbind('load');
          });
          return window.defer(100, function() {
            return win.location.href = win.location.href + "?ffsux=yes";
          });
        }, this));
      }, this));
      window.defer(100, function() {
        return form.dom[0].submit();
      });
      window.defer(200, __bind(function() {
        this.extracting_colors = false;
        form.dom[0].action = form.attr('data-save_action');
        form.dom[0].target = '_self';
        method = form.find('input[name=_method]');
        return method.dom[0].value = form.attr('data-save_method');
      }, this));
      return this.timeout_error = window.defer(4000, __bind(function() {
        iframe.unbind('load');
        return this.extract_error("Error uploading (our fault), please try again.");
      }, this));
    } else {
      this.$('.save').hide();
      this.$('.save_spinner').show('inline');
      window.defer(100, function() {
        return form.dom[0].submit();
      });
      return this.timeout_error = window.defer(4000, __bind(function() {
        this.$('.save_spinner').hide();
        this.$('.save').show();
        return this.$('.save').each(function(elem) {
          return elem.value = "Failed! Click to try again";
        });
      }, this));
    }
  },
  extract_error: function(message) {
    var extractor;
    extractor = this.$('.extract_from_image');
    extractor.find('.file_chooser_container').show();
    extractor.find('.filename').hide();
    extractor.find('.loading').hide();
    extractor.find('.success').hide();
    extractor.find('.error').show();
    return extractor.find('.error').html(message);
  },
  extract_success: function(colors) {
    var extractor, hexes;
    extractor = this.$('.extract_from_image');
    extractor.find('.file_chooser_container').show();
    extractor.find('.filename').hide();
    extractor.find('.loading').hide();
    extractor.find('.error').hide();
    extractor.find('.success').show();
    extractor.find('.success').html("extracted successfully");
    hexes = _.map(colors, function(c) {
      var hex;
      hex = c.toString(16);
      while (hex.length !== 8) {
        hex = "0" + hex;
      }
      return hex = "\#" + (hex.substring(0, 6));
    });
    return this.model.set({
      palette_detailed: hexes.join("\n")
    });
  },
  update_palette_preview: function(model, hexes) {
    var img_src, palette_preview;
    palette_preview = this.$('.custom_palette .main .palette_preview');
    if (hexes.trim() === "") {
      return palette_preview.html("");
    }
    img_src = this.colors_to_palette(hexes.split("\n"));
    return palette_preview.html('<img src="' + img_src + '">');
  },
  colors_to_palette: function(colors) {
    var canvas, columns, ctx, lines, size;
    size = 16;
    canvas = document.createElement("canvas");
    ctx = canvas.getContext("2d");
    columns = 8;
    lines = Math.ceil(colors.length * 1.0 / columns);
    canvas.width = columns * size;
    canvas.height = lines * size;
    _.each(colors, function(color, i) {
      var column, line;
      line = Math.floor(i * 1.0 / columns);
      column = i % columns;
      ctx.fillStyle = color;
      return ctx.fillRect(size * column, size * line, size, size);
    });
    return canvas.toDataURL();
  },
  dimensions_touched: function(model, dimensions_touched) {
    if (dimensions_touched) {
      return $('#edit_board').hide();
    } else {
      return $('#edit_board').show('inline');
    }
  },
  update_save_button: function() {
    if (this.$('.changed').exists()) {
      return this.$('.actions .save').each(function(elem) {
        elem.value = "Save changes";
        return elem.disabled = false;
      });
    } else {
      return this.$('.actions .save').each(function(elem) {
        elem.value = "Saved";
        return elem.disabled = true;
      });
    }
  }
});
var EditorView;
var __hasProp = Object.prototype.hasOwnProperty, __extends = function(child, parent) {
  for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; }
  function ctor() { this.constructor = child; }
  ctor.prototype = parent.prototype;
  child.prototype = new ctor;
  child.__super__ = parent.prototype;
  return child;
}, __slice = Array.prototype.slice, __bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; };
EditorView = function() {
  function EditorView(options) {
    EditorView.__super__.constructor.call(this, options);
    this.canvas = this.model.canvas;
    this.standalone = options.standalone;
    this.el = $("#editor_wrapper");
    this.delegateEvents();
    _.bindAll(this, 'set_preview_pixel', 'set_all_preview_pixels');
    this.canvas.bind('change:pixel', this.set_preview_pixel);
    this.canvas.bind('change:all_pixels', this.set_all_preview_pixels);
    _.bindAll(this, 'hide_layer', 'show_layer', 'select_layer');
    this.canvas.bind('change:hide_layer', this.hide_layer);
    this.canvas.bind('change:show_layer', this.show_layer);
    this.canvas.bind('change:current_layer', this.select_layer);
    _.bindAll(this, 'set_color', 'set_brush', 'set_dither');
    this.model.bind('change:color', this.set_color);
    this.model.bind('change:brush', this.set_brush);
    this.model.bind('change:dither', this.set_dither);
    _.bindAll(this, 'handle_key');
    document.addEventListener('keydown', this.handle_key, false);
    this.render();
  }
  __extends(EditorView, Backbone.View);
  if (DESKTOP) {
    EditorView.prototype.events = {
      "mousedown .operations .save": 'update_save_link',
      "contextmenu .operations .save": 'update_save_link',
      "click .main_container .zoom a.out": 'zoom_out',
      "click .main_container .zoom a.in": 'zoom_in',
      "click .palette div": 'choose_color',
      "click .brushes .item": 'choose_brush',
      "click .dithers .item": 'choose_dither',
      "click .close": 'hide',
      "click .clear": 'clear',
      "click .undo": 'undo',
      "click .redo": 'redo',
      "click .side .preview_layers li": 'preview_layer_clicked'
    };
  } else {
    EditorView.prototype.events = {
      "touchstart .operations .save": 'update_save_link',
      "touchstart .main_container .zoom a.out": 'zoom_out',
      "touchstart .main_container .zoom a.in": 'zoom_in',
      "touchstart .palette div": 'choose_color',
      "touchstart .brushes .item": 'choose_brush',
      "touchstart .dithers .item": 'choose_dither',
      "touchstart .close": 'hide',
      "touchstart .clear": 'clear',
      "touchstart .undo": 'undo',
      "touchstart .redo": 'redo',
      "touchstart .side .preview_layers li": 'preview_layer_clicked'
    };
  }
  EditorView.prototype.render = function() {
    var canvas, ctx, html, layer, layer_index, layer_indexes, selected, toggle_text, visibility, _i, _j, _k, _l, _len, _len2, _len3, _ref, _results, _results2;
    this.render_template('editor/editor');
    this.main_size = this.model.initial_zoom * this.canvas.get('contour_size');
    this.side_width = _.max([200, this.canvas.get('contour_size') * 2]);
    this.palette_columns = Math.ceil(this.model.palette.hexes.length / 16);
    this.palette_width = this.palette_columns * 30;
    this.extra_width = 2 * 6 + 2 * 30 + (30 + 16) + (this.palette_width + 8) + 10 + 2 * this.side_width;
    this.extra_height = 40 + 2 * 30 + 8;
    this.min_width = this.main_size + this.extra_width;
    this.min_height = this.main_size + this.extra_height;
    this.$('.side .preview_container').css({
      width: "" + this.side_width + "px"
    });
    this.$('.fluff .tzigla').css({
      width: "" + (this.side_width - 10) + "px"
    });
    this.$('.palette').css({
      width: "" + (this.palette_columns * 30) + "px"
    });
    this.el.css({
      'min-width': "" + this.min_width + "px",
      'min-height': "" + this.min_height + "px"
    });
    this.palette = this.$('.palette');
    this.init_palette();
    this.set_color();
    this.brushes = this.$('.brushes');
    this.init_brushes();
    this.set_brush();
    this.dithers = this.$('.dithers');
    this.init_dithers();
    this.set_dither();
    this.main_canvas_view = new MainCanvasView({
      model: this.canvas,
      el: $(this.$('.canvas_view').dom[0])
    });
    this.preview_canvas_view = new PreviewCanvasView({
      model: this.canvas,
      el: $(this.$('.canvas_view').dom[1])
    });
    this.preview_layers = this.$('.side .preview_layers ol');
    this.layer_preview_contexts = [];
    layer_indexes = (function() {
      _results = [];
      for (var _i = 0, _ref = this.canvas.layers.length - 1; 0 <= _ref ? _i <= _ref : _i >= _ref; 0 <= _ref ? _i += 1 : _i -= 1){ _results.push(_i); }
      return _results;
    }).call(this).reverse();
    html = '';
    for (_j = 0, _len = layer_indexes.length; _j < _len; _j++) {
      layer_index = layer_indexes[_j];
      layer = this.canvas.layers[layer_index];
      if (layer.visible) {
        toggle_text = 'hide';
        visibility = null;
      } else {
        toggle_text = 'show';
        visibility = 'hidden';
      }
      selected = layer_index === this.canvas.get('current_layer') ? 'selected' : '';
      html += this.render_partial('editor/preview_layer', this, {
        index: layer_index,
        toggle_text: toggle_text,
        visibility: visibility,
        selected: selected
      });
    }
    this.preview_layers.html(html);
    for (_k = 0, _len2 = layer_indexes.length; _k < _len2; _k++) {
      layer_index = layer_indexes[_k];
      canvas = this.preview_layers.find("#preview_layer_" + layer_index + " canvas").dom[0];
      if (layer_index === 0) {
        canvas.style.cssText = "background-color: " + this.model.palette.hexes[0];
      }
      ctx = canvas.getContext('2d');
      this.layer_preview_contexts.unshift(ctx);
    }
    _results2 = [];
    for (_l = 0, _len3 = layer_indexes.length; _l < _len3; _l++) {
      layer_index = layer_indexes[_l];
      _results2.push(this.set_all_preview_pixels(layer_index));
    }
    return _results2;
  };
  EditorView.prototype.set_preview_pixel = function() {
    var args, color, ctx, x, y;
    args = 1 <= arguments.length ? __slice.call(arguments, 0) : [];
    x = args[0], y = args[1], color = args[2];
    ctx = this.layer_preview_contexts[this.canvas.get('current_layer')];
    if (color != null) {
      ctx.fillStyle = color;
      return ctx.fillRect(x, y, 1, 1);
    } else {
      return ctx.clearRect(x, y, 1, 1);
    }
  };
  EditorView.prototype.set_all_preview_pixels = function(layer_index) {
    if (layer_index == null) {
      layer_index = null;
    }
    layer_index != null ? layer_index : layer_index = this.canvas.get('current_layer');
    return CanvasExt.indexed_to_canvas({
      pixels: this.canvas.layers[layer_index].pixels,
      zoom: 1,
      datas: this.canvas.get_palette_as_datas(1),
      context: this.layer_preview_contexts[layer_index]
    });
  };
  EditorView.prototype.update_sides_padding = function() {
    var css, padding_top;
    if (!DESKTOP) {
      padding_top = this.model.get('zoom') > this.model.initial_zoom ? Math.floor((this.model.get('zoom') * this.canvas.get('contour_size') - 480) / 2) : 0;
      css = {
        'padding-top': "" + padding_top + "px"
      };
      this.$('.brushes_and_dithers').css(css);
      this.$('.palette_container').css(css);
      this.$('.side').css(css);
      return this.$('.fluff').css(css);
    }
  };
  EditorView.prototype.show = function() {
    if (typeof LayoutView != "undefined" && LayoutView !== null) {
      LayoutView.position();
    }
    return defer(250, __bind(function() {
      $('#sidebar_wrapper').hide();
      $('#board_wrapper').hide();
      this.el.show();
      $("#header h1").html("Awesome pixel editor on Tzigla");
      return typeof LayoutView != "undefined" && LayoutView !== null ? LayoutView.position() : void 0;
    }, this));
  };
  EditorView.prototype.hide = function(event) {
    this.el.hide();
    $("#header h1").html("");
    $('#sidebar_wrapper').show();
    $('#board_wrapper').show();
    if (typeof LayoutView != "undefined" && LayoutView !== null) {
      LayoutView.position();
    }
    if (event) {
      stop_event(event);
      return this.trigger('editor-view:hide');
    }
  };
  EditorView.prototype.update_save_link = function(event) {
    return event.target.href = this.canvas.export_image();
  };
  EditorView.prototype.zoom_out = function(event) {
    stop_event(event);
    return this.model.zoom_out();
  };
  EditorView.prototype.zoom_in = function(event) {
    stop_event(event);
    return this.model.zoom_in();
  };
  EditorView.prototype.clear = function(event) {
    stop_event(event);
    return this.canvas.clear();
  };
  EditorView.prototype.choose_color = function(event) {
    var color;
    stop_event(event);
    color = $(event.currentTarget).attr('data-index');
    return this.model.set({
      color: parseInt(color, 10)
    });
  };
  EditorView.prototype.set_color = function() {
    this.palette.find('div').removeClass('selected');
    return this.palette.find("div.c_" + (this.model.get('color'))).addClass('selected');
  };
  EditorView.prototype.choose_brush = function(event) {
    var brush;
    stop_event(event);
    brush = $(event.currentTarget).attr('data-index');
    return this.model.set({
      brush: parseInt(brush, 10)
    });
  };
  EditorView.prototype.set_brush = function() {
    this.brushes.find('div').removeClass('selected');
    return this.brushes.find("#item_" + (this.model.get('brush'))).addClass('selected');
  };
  EditorView.prototype.choose_dither = function(event) {
    var dither;
    stop_event(event);
    dither = $(event.currentTarget).attr('data-index');
    return this.model.set({
      dither: parseInt(dither, 10)
    });
  };
  EditorView.prototype.set_dither = function() {
    this.dithers.find('div').removeClass('selected');
    return this.dithers.find("#item_" + (this.model.get('dither'))).addClass('selected');
  };
  EditorView.prototype.undo = function(event) {
    stop_event(event);
    return this.canvas.undo();
  };
  EditorView.prototype.redo = function(event) {
    stop_event(event);
    return this.canvas.redo();
  };
  EditorView.prototype.handle_key = function(event) {
    var consumed;
    if (!this.el.visible()) {
      return;
    }
    if (event.metaKey) {
      return;
    }
    consumed = true;
    switch (String.fromCharCode(event.keyCode)) {
      case '1':
        this.model.prev_dither();
        break;
      case '2':
        this.model.next_dither();
        break;
      case 'q':
      case 'Q':
        this.model.prev_brush();
        break;
      case 'w':
      case 'W':
        this.model.next_brush();
        break;
      case 'a':
      case 'A':
        this.model.prev_color();
        break;
      case 's':
      case 'S':
        this.model.next_color();
        break;
      case 'z':
      case 'Z':
        this.canvas.undo();
        break;
      case 'x':
      case 'X':
        this.canvas.redo();
        break;
      default:
        consumed = false;
    }
    if (consumed) {
      return stop_event(event);
    }
  };
  EditorView.prototype.hide_layer = function(model, index) {
    var layer_els, preview_el;
    preview_el = $("#preview_layer_" + index);
    layer_els = $(".layer_" + index);
    layer_els.hide();
    preview_el.find('a').html('show');
    preview_el.addClass('hidden');
    return preview_el.find('.status').html('hidden');
  };
  EditorView.prototype.show_layer = function(model, index) {
    var layer_els, preview_el;
    preview_el = $("#preview_layer_" + index);
    layer_els = $(".layer_" + index);
    layer_els.show();
    preview_el.find('a').html('hide');
    preview_el.removeClass('hidden');
    return preview_el.find('.status').html('');
  };
  EditorView.prototype.select_layer = function(model, index) {
    var preview_el;
    preview_el = $("#preview_layer_" + index);
    preview_el.closest("ol").find('li').removeClass('selected');
    return preview_el.addClass('selected');
  };
  EditorView.prototype.preview_layer_clicked = function(event) {
    var el, layer_index, tag_name, target, _ref;
    stop_event(event);
    target = event.touches != null ? event.touches[0].target : event.currentTarget;
    if (target.nodeType !== 1) {
      target = target.parentNode;
    }
    tag_name = (_ref = target.tagName) != null ? _ref.toLowerCase() : void 0;
    el = $(target);
    if (tag_name !== 'li') {
      el = el.closest('li');
    }
    layer_index = parseInt(el.attr('data-index'), 10);
    if (tag_name === 'a') {
      return this.canvas.toggle_layer(layer_index);
    } else {
      return this.canvas.set_current_layer(layer_index);
    }
  };
  EditorView.prototype.init_palette = function() {
    return _.each(this.palette.find('div').dom, function(p, index) {
      return $(p).addClass("c_" + index).attr('data-index', index);
    });
  };
  EditorView.prototype.init_brushes = function() {
    var wrapper;
    wrapper = this.make_big_dot(this.model.brushes.header);
    this.brushes.dom[0].appendChild(wrapper.dom[0]);
    return _.each(this.model.brushes.matrices, __bind(function(matrix, index) {
      wrapper = this.make_big_dot(matrix, index);
      return this.brushes.dom[0].appendChild(wrapper.dom[0]);
    }, this));
  };
  EditorView.prototype.init_dithers = function() {
    var wrapper;
    wrapper = this.make_big_dot(this.model.dithers.header);
    this.dithers.dom[0].appendChild(wrapper.dom[0]);
    return _.each(this.model.dithers.matrices, __bind(function(matrix, index) {
      wrapper = this.make_big_dot(matrix, index);
      return this.dithers.dom[0].appendChild(wrapper.dom[0]);
    }, this));
  };
  EditorView.prototype.make_big_dot = function(matrix, index) {
    var cls, ctx, dot, h, height, margin, max_dot_size, point_dimension, w, width, wrapper, wrapper_size, x, y, _ref, _ref2;
    if (index == null) {
      index = null;
    }
    w = matrix[0].length;
    h = matrix.length;
    point_dimension = 3;
    margin = 1;
    max_dot_size = 6;
    wrapper = $(document.createElement('div'));
    wrapper_size = (point_dimension + 1) * max_dot_size - 1;
    wrapper.css({
      width: "" + wrapper_size + "px",
      height: "" + wrapper_size + "px"
    });
    if (index != null) {
      wrapper.attr({
        id: "item_" + index,
        'data-index': index
      });
    }
    cls = index != null ? 'item' : 'header';
    wrapper.addClass(cls);
    dot = document.createElement('canvas');
    width = (point_dimension + 1) * w - 1;
    height = (point_dimension + 1) * h - 1;
    dot.width = width;
    dot.height = height;
    $(dot).css({
      position: 'relative',
      top: "" + ((wrapper_size - height) / 2) + "px",
      left: "" + ((wrapper_size - width) / 2) + "px"
    });
    ctx = dot.getContext('2d');
    ctx.fillStyle = index != null ? '#333' : '#ccc';
    for (y = 0, _ref = w - 1; (0 <= _ref ? y <= _ref : y >= _ref); (0 <= _ref ? y += 1 : y -= 1)) {
      for (x = 0, _ref2 = h - 1; (0 <= _ref2 ? x <= _ref2 : x >= _ref2); (0 <= _ref2 ? x += 1 : x -= 1)) {
        if (matrix[y][x] === 1) {
          ctx.fillRect((point_dimension + margin) * x, (point_dimension + margin) * y, point_dimension, point_dimension);
        }
      }
    }
    wrapper.dom[0].appendChild(dot);
    return wrapper;
  };
  return EditorView;
}();
var FeedbackView;
var __slice = Array.prototype.slice, __hasProp = Object.prototype.hasOwnProperty, __extends = function(child, parent) {
  for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; }
  function ctor() { this.constructor = child; }
  ctor.prototype = parent.prototype;
  child.prototype = new ctor;
  child.__super__ = parent.prototype;
  return child;
}, __bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; };
FeedbackView = function() {
  function FeedbackView() {
    var args;
    args = 1 <= arguments.length ? __slice.call(arguments, 0) : [];
    FeedbackView.__super__.constructor.apply(this, args);
    this.el = $('#feedback');
    this.box = $('#feedback_box');
    this.delegateEvents();
    _.bindAll(this, 'hide_box');
    $("body").bind("click", this.hide_box);
  }
  __extends(FeedbackView, Backbone.View);
  FeedbackView.prototype.events = {
    "click a": "toggle_box",
    "submit form": "send"
  };
  FeedbackView.prototype.toggle_box = function(event) {
    stop_event(event);
    if (this.box.visible()) {
      return this.hide_box();
    } else {
      return this.box.toggle();
    }
  };
  FeedbackView.prototype.hide_box = function(event) {
    if (event && event.target.id === "feedback") {
      return;
    }
    if (event && $(event.target).closest("#feedback").exists()) {
      return;
    }
    this.$('form').show();
    this.$('.spinner').hide();
    this.$('.thanks').hide();
    return this.box.hide();
  };
  FeedbackView.prototype.send = function(event) {
    var body, params, _ref;
    stop_event(event);
    body = this.$('form textarea').dom[0].value;
    if (body.length === 0) {
      return;
    }
    if (body.length > 10000) {
      return;
    }
    this.$('form').hide();
    this.$('.spinner').show();
    this.$('.thanks').hide();
    params = {};
    params.text = body;
    params.email = (_ref = this.$("form input[type=text]").dom[0]) != null ? _ref.value : void 0;
    params.url = window.location.href;
    params.kind = "feedback";
    return $.ajax({
      type: 'POST',
      url: "" + (this.$('form').dom[0].action),
      data: {
        feedback: params,
        authenticity_token: $.get_authenticity_token()
      },
      success: __bind(function(response) {
        this.$('form textarea').dom[0].value = '';
        this.$('form').hide();
        this.$('.spinner').hide();
        this.$('.thanks').show();
        return defer(5000, this.hide_box);
      }, this),
      error: __bind(function() {
        this.$('form').hide();
        this.$('.spinner').hide();
        this.$('.thanks').show();
        return defer(5000, this.hide_box);
      }, this)
    });
  };
  return FeedbackView;
}();
var FlashView;
var __slice = Array.prototype.slice, __hasProp = Object.prototype.hasOwnProperty, __extends = function(child, parent) {
  for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; }
  function ctor() { this.constructor = child; }
  ctor.prototype = parent.prototype;
  child.prototype = new ctor;
  child.__super__ = parent.prototype;
  return child;
};
FlashView = function() {
  function FlashView() {
    var args;
    args = 1 <= arguments.length ? __slice.call(arguments, 0) : [];
    FlashView.__super__.constructor.apply(this, args);
    this.el = $('#flash');
    this.delegateEvents();
  }
  __extends(FlashView, Backbone.View);
  FlashView.prototype.alert = function(message) {
    return this.set(message, 'alert');
  };
  FlashView.prototype.notice = function(message) {
    return this.set(message, 'notice');
  };
  FlashView.prototype.set = function(message, kind) {
    if (this.el.dom.length <= 0) {
      return;
    }
    if (message && message.length > 0) {
      this.el.html(message);
      this.el.dom[0].className = kind;
      return this.show();
    } else {
      return this.hide();
    }
  };
  FlashView.prototype.show = function() {
    return this.el.show();
  };
  FlashView.prototype.hide = function() {
    return this.el.hide();
  };
  return FlashView;
}();
var LayoutView;
var __hasProp = Object.prototype.hasOwnProperty, __extends = function(child, parent) {
  for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; }
  function ctor() { this.constructor = child; }
  ctor.prototype = parent.prototype;
  child.prototype = new ctor;
  child.__super__ = parent.prototype;
  return child;
};
LayoutView = function() {
  function LayoutView() {
    LayoutView.__super__.constructor.apply(this, arguments);
    _.bindAll(this, 'position', 'position_do');
    if (typeof CurrentBoard != "undefined" && CurrentBoard !== null) {
      CurrentBoard.bind('change:tiles_loaded', this.position);
      CurrentBoard.bind('board:loaded', this.position);
    }
    if (typeof State != "undefined" && State !== null) {
      State.bind('change:current_artist', this.position);
      State.bind('change:current_tile', this.position);
    }
    this.positioning = false;
    this.positioning_timer = false;
    window.onresize = this.position;
    window.onorientationchange = this.position;
    this.position();
  }
  __extends(LayoutView, Backbone.View);
  LayoutView.prototype.position = function() {
    this.positioning_timer && window.clearTimeout(this.positioning_timer);
    this.positioning = true;
    return this.positioning_timer = window.setTimeout(this.position_do, 200);
  };
  LayoutView.prototype.position_do = function() {
    var events, events_height, ref, _ref;
    ref = DESKTOP ? $.viewport() : $.content();
    if ((_ref = $('#sidebar_wrapper')) != null) {
      _ref.css({
        height: "" + ref.height + "px"
      });
    }
    events = $("#activity .events");
    if (events.exists()) {
      events_height = ref.height - events.offset().top;
      events.css({
        height: "" + events_height + "px"
      });
    }
    this.position_editor(ref);
    return this.positioning = false;
  };
  LayoutView.prototype.position_editor = function(ref) {
    var cev, edo, ewo, maxh, maxw, mh, ml, mw;
    if (!$('#editor').exists()) {
      return;
    }
    if (DESKTOP) {
      maxw = ref.width;
      maxh = ref.height;
    } else {
      maxw = 1200;
      maxh = 900;
    }
    if ($('#editor_wrapper').visible()) {
      cev = CurrentEditorView;
      if (Editor.get('zoom') > Editor.initial_zoom) {
        $('#editor_wrapper').css({
          width: "" + maxw + "px",
          height: "" + maxh + "px",
          'margin-left': '0'
        });
        ewo = $('#editor_wrapper').offset();
        $('#editor').css({
          width: "" + (ewo.width - 72) + "px",
          height: "" + (ewo.height - 110) + "px"
        });
        mw = ewo.width - cev.extra_width;
        mh = ewo.height - cev.extra_height;
        return $('#editor_wrapper .main').css({
          width: "" + mw + "px",
          height: "" + mh + "px"
        });
      } else {
        if (!DESKTOP) {
          maxw = 1024;
        }
        edo = $('#editor').offset();
        ml = _.max([0, Math.floor((maxw - cev.min_width) / 2)]);
        $('#editor_wrapper').css({
          width: "" + cev.min_width + "px",
          height: "" + cev.min_height + "px",
          'margin-left': "" + ml + "px"
        });
        $('#editor').css({
          width: 'auto',
          height: 'auto'
        });
        return $('#editor_wrapper .main').css({
          width: 'auto',
          height: 'auto'
        });
      }
    }
  };
  return LayoutView;
}();
var MainCanvasView;
var __hasProp = Object.prototype.hasOwnProperty, __extends = function(child, parent) {
  for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; }
  function ctor() { this.constructor = child; }
  ctor.prototype = parent.prototype;
  child.prototype = new ctor;
  child.__super__ = parent.prototype;
  return child;
}, __bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; };
MainCanvasView = function() {
  function MainCanvasView(options) {
    MainCanvasView.__super__.constructor.call(this, options);
    _.bindAll(this, 'update_brush_preview');
    this.model.editor.bind('change:brush', this.update_brush_preview);
    this.model.editor.bind('change:color', this.update_brush_preview);
    _.bindAll(this, 'zoom_changed');
    this.model.editor.bind('change:zoom', this.zoom_changed);
    this.drawing = false;
    this.moving = false;
    _.bindAll(this, 'stop_drawing_or_moving');
    if (DESKTOP) {
      $('html').bind("mouseup", this.stop_drawing_or_moving);
    } else {
      $('html').bind("touchend", this.stop_drawing_or_moving);
    }
    this.render();
  }
  __extends(MainCanvasView, CanvasView);
  if (DESKTOP) {
    MainCanvasView.prototype.events = {
      "mousedown   .trap": 'mousedown',
      "mousemove   .trap": 'move',
      "contextmenu .trap": 'get_color',
      "click": 'stop_drawing_or_moving',
      "mouseover   .trap": 'show_brush_preview',
      "mouseout    .trap": 'hide_brush_preview',
      "mouseover   .trap .inner": 'start_line',
      "mouseout    .trap .inner": 'stop_line'
    };
  } else {
    MainCanvasView.prototype.events = {
      "touchstart .trap": 'touchstart',
      "touchmove  .trap": 'move',
      "touchend   .trap": 'stop_drawing_or_moving'
    };
  }
  MainCanvasView.prototype.render = function() {
    MainCanvasView.__super__.render.apply(this, arguments);
    this.brush_preview = this.$('.brush_preview');
    this.brush_preview.attr({
      width: this.brush_preview_size,
      height: this.brush_preview_size
    });
    this.brush_preview_ctx = this.brush_preview.dom[0].getContext('2d');
    this.brush_preview_offset = this.max_brush_size % 2 === 1 ? this.max_brush_size / 2 : this.max_brush_size / 2 - 1;
    this.brush_preview_offset = -Math.floor(this.brush_preview_offset) * this.zoom;
    this.update_brush_preview();
    return this.update_zoom_indicator();
  };
  MainCanvasView.prototype.zoom_changed = function(model, zoom) {
    LayoutView.position();
    this.el.attr('data-zoom', zoom);
    return defer(200, __bind(function() {
      this.render();
      return CurrentEditorView.update_sides_padding();
    }, this));
  };
  MainCanvasView.prototype.mousedown = function(event) {
    if (event.which === 3 || (event.which === 1 && event.ctrlKey)) {
      return this.get_color(event);
    } else if (event.which === 1 && event.shiftKey) {
      return this.fill(event);
    } else if (event.which === 1 && (event.altKey || event.metaKey)) {
      return this.start_moving(event);
    } else {
      return this.start_drawing(event);
    }
  };
  MainCanvasView.prototype.touchstart = function(event) {
    return this.start_drawing(event);
  };
  MainCanvasView.prototype.move = function(event) {
    this.draw_on_pixel(event);
    if (this.moving) {
      this.sync_layer_position(event);
    }
    if (DESKTOP) {
      if (this.drawing && $.browser.ff3) {
        return;
      }
      return this.sync_brush_preview(event);
    }
  };
  MainCanvasView.prototype.show_brush_preview = function(event) {
    if (this.drawing && $.browser.ff3) {
      return;
    }
    return this.brush_preview.show();
  };
  MainCanvasView.prototype.hide_brush_preview = function(event) {
    return this.brush_preview.hide();
  };
  MainCanvasView.prototype.get_color = function(event) {
    var coords;
    coords = this.get_event_coordinates(event);
    if (coords.really_inside) {
      return this.get_color_from_canvas(event);
    } else {
      return this.get_color_from_border(event);
    }
  };
  MainCanvasView.prototype.get_color_from_canvas = function(event) {
    var coords;
    stop_event(event);
    coords = this.get_event_coordinates(event);
    return this.model.editor.set({
      color: this.model.pixels[coords.y][coords.x]
    });
  };
  MainCanvasView.prototype.get_color_from_border = function(event) {
    var color, coords, pixel, x, y;
    stop_event(event);
    coords = this.get_event_coordinates(event);
    x = coords.x * this.zoom + this.border_size;
    y = coords.y * this.zoom + this.border_size;
    pixel = this.border.dom[0].getContext('2d').getImageData(x, y, 1, 1).data;
    color = this.model.editor.palette.get_from_rgba(pixel[0], pixel[1], pixel[2], 255);
    return this.model.editor.set({
      color: color
    });
  };
  MainCanvasView.prototype.fill = function(event) {
    var coords;
    stop_event(event);
    coords = this.get_event_coordinates(event);
    if (coords.really_inside) {
      return this.model.fill(coords.x, coords.y, this.model.editor.get('color'));
    }
  };
  MainCanvasView.prototype.start_drawing = function(event) {
    stop_event(event);
    if ($.browser.ff3) {
      this.brush_preview.hide();
    }
    this.drawing = true;
    return this.draw_on_pixel(event);
  };
  MainCanvasView.prototype.start_moving = function(event) {
    stop_event(event);
    if (!this.model.layers[this.model.get('current_layer')].visible) {
      return;
    }
    this.brush_preview.hide();
    this.current_layer_el = this.$(".layer_" + (this.model.get('current_layer')));
    this.moving = true;
    return this.moving_start_coords = this.get_event_coordinates(event);
  };
  MainCanvasView.prototype.stop_drawing_or_moving = function(event) {
    var coords, dx, dy;
    if (this.drawing || this.moving) {
      stop_event(event);
    }
    if (this.drawing && (!event.touches || event.touches.length === 0)) {
      this.model.save();
      this.drawing = false;
      this.last_point = null;
      if ($.browser.ff3) {
        this.brush_preview.show();
      }
    }
    if (this.moving) {
      coords = this.get_event_coordinates(event);
      dx = coords.x - this.moving_start_coords.x;
      dy = coords.y - this.moving_start_coords.y;
      this.model.move(dx, dy);
      this.current_layer_el.css({
        left: 0,
        top: 0
      });
      this.moving = false;
      return this.brush_preview.show();
    }
  };
  MainCanvasView.prototype.start_line = function(event) {
    return this.draw_on_pixel(event);
  };
  MainCanvasView.prototype.stop_line = function(event) {
    this.draw_on_pixel(event);
    return this.last_point = null;
  };
  MainCanvasView.prototype.draw_on_pixel = function(event) {
    var point;
    stop_event(event);
    point = event.touches != null ? this.get_event_coordinates(event.touches[0]) : this.get_event_coordinates(event);
    if (point.inside) {
      if (this.drawing) {
        this.model.draw(this.last_point, point.x, point.y);
      }
      return this.last_point = point;
    }
  };
  MainCanvasView.prototype.sync_layer_position = function(event) {
    var coords, dx, dy;
    stop_event(event);
    coords = this.get_event_coordinates(event);
    dx = coords.x - this.moving_start_coords.x;
    dy = coords.y - this.moving_start_coords.y;
    return this.current_layer_el.css({
      left: "" + (dx * this.zoom) + "px",
      top: "" + (dy * this.zoom) + "px"
    });
  };
  MainCanvasView.prototype.sync_brush_preview = function(event) {
    var coords;
    stop_event(event);
    coords = this.get_event_coordinates(event);
    return this.brush_preview.css({
      left: "" + (coords.x * this.zoom + this.brush_preview_offset) + "px",
      top: "" + (coords.y * this.zoom + this.brush_preview_offset) + "px"
    });
  };
  MainCanvasView.prototype.get_event_coordinates = function(event) {
    var inside, offset, posx, posy, really_inside, result, x, y;
    posx = 0;
    posy = 0;
    if (event.pageX || event.pageY) {
      posx = event.pageX;
      posy = event.pageY;
    } else if (event.clientX || event.clientY) {
      posx = event.clientX + document.body.scrollLeft + document.documentElement.scrollLeft;
      posy = event.clientY + document.body.scrollTop + document.documentElement.scrollTop;
    }
    offset = this.layers.offset();
    posx = posx - offset.left;
    posy = posy - offset.top;
    result = {
      posx: posx,
      posy: posy
    };
    x = Math.floor(posx / this.zoom);
    y = Math.floor(posy / this.zoom);
    inside = -3 <= x && x < this.model.size + 3 && -3 <= y && y < this.model.size + 3;
    really_inside = 0 <= x && x < this.model.size && 0 <= y && y < this.model.size;
    result = _.extend(result, {
      x: x,
      y: y,
      inside: inside,
      really_inside: really_inside
    });
    return result;
  };
  MainCanvasView.prototype.update_brush_preview = function() {
    var color, h, matrix, ox, oy, pattern, w, x, y, _ref, _ref2, _results, _results2;
    matrix = this.model.editor.brushes.get_matrix(this.model.editor.get('brush'));
    w = matrix[0].length;
    h = matrix.length;
    this.brush_preview_ctx.clearRect(0, 0, this.brush_preview_size, this.brush_preview_size);
    if (this.max_brush_size % 2 === 1) {
      if (w % 2 === 0) {
        ox = (this.max_brush_size + 1 - w) / 2;
      } else {
        ox = (this.max_brush_size - w) / 2;
      }
    } else {
      if (w % 2 === 0) {
        ox = (this.max_brush_size - w) / 2;
      } else {
        ox = (this.max_brush_size - w) / 2;
      }
    }
    ox = Math.floor(ox);
    oy = ox;
    color = this.model.editor.current_color();
    if (color != null) {
      this.brush_preview_ctx.fillStyle = color;
    } else {
      pattern = this.brush_preview_ctx.createPattern($('#transparent_pattern').dom[0], 'repeat');
      this.brush_preview_ctx.fillStyle = pattern;
    }
    _results = [];
    for (y = 0, _ref = h - 1; (0 <= _ref ? y <= _ref : y >= _ref); (0 <= _ref ? y += 1 : y -= 1)) {
      _results.push(function() {
        _results2 = [];
        for (x = 0, _ref2 = w - 1; (0 <= _ref2 ? x <= _ref2 : x >= _ref2); (0 <= _ref2 ? x += 1 : x -= 1)) {
          _results2.push(matrix[y][x] === 1 ? this.brush_preview_ctx.fillRect((x + ox) * this.zoom, (y + oy) * this.zoom, this.zoom, this.zoom) : void 0);
        }
        return _results2;
      }.call(this));
    }
    return _results;
  };
  MainCanvasView.prototype.update_zoom_indicator = function() {
    var zoom;
    zoom = this.el.closest('td').find('.zoom');
    zoom.hide();
    zoom.find('span').html("" + this.zoom + "x");
    return defer(10, function() {
      return zoom.show();
    });
  };
  return MainCanvasView;
}();
var PreviewCanvasView;
var __hasProp = Object.prototype.hasOwnProperty, __extends = function(child, parent) {
  for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; }
  function ctor() { this.constructor = child; }
  ctor.prototype = parent.prototype;
  child.prototype = new ctor;
  child.__super__ = parent.prototype;
  return child;
};
PreviewCanvasView = function() {
  function PreviewCanvasView(options) {
    PreviewCanvasView.__super__.constructor.call(this, options);
    this.render();
  }
  __extends(PreviewCanvasView, CanvasView);
  if (DESKTOP) {
    PreviewCanvasView.prototype.events = {
      "mousedown  .trap": 'toggle_zoom'
    };
  } else {
    PreviewCanvasView.prototype.events = {
      "touchstart .trap": 'toggle_zoom'
    };
  }
  PreviewCanvasView.prototype.toggle_zoom = function(event) {
    var new_zoom;
    stop_event(event);
    new_zoom = this.zoom === 1 ? 2 : 1;
    this.el.attr('data-zoom', new_zoom);
    return this.render();
  };
  return PreviewCanvasView;
}();
var RequestBoardView;
var __slice = Array.prototype.slice, __hasProp = Object.prototype.hasOwnProperty, __extends = function(child, parent) {
  for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; }
  function ctor() { this.constructor = child; }
  ctor.prototype = parent.prototype;
  child.prototype = new ctor;
  child.__super__ = parent.prototype;
  return child;
}, __bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; };
RequestBoardView = function() {
  function RequestBoardView() {
    var args;
    args = 1 <= arguments.length ? __slice.call(arguments, 0) : [];
    RequestBoardView.__super__.constructor.apply(this, args);
    this.el = $('#request_board');
    if (!this.el.exists()) {
      return;
    }
    this.delegateEvents();
  }
  __extends(RequestBoardView, Backbone.View);
  RequestBoardView.prototype.events = {
    "submit form": "send"
  };
  RequestBoardView.prototype.send = function(event) {
    var body, params, _ref;
    stop_event(event);
    body = this.$('form textarea').dom[0].value;
    if (body.length === 0) {
      return;
    }
    if (body.length > 10000) {
      return;
    }
    this.$('.actions').hide();
    this.$('.spinner').show();
    this.$('.thanks').hide();
    this.$('.error').hide();
    params = {};
    params.text = body;
    params.email = (_ref = this.$("form input[type=text]").dom[0]) != null ? _ref.value : void 0;
    params.url = window.location.href;
    params.kind = "request_board";
    return $.ajax({
      type: 'POST',
      url: "" + (this.$('form').dom[0].action),
      data: {
        feedback: params,
        authenticity_token: $.get_authenticity_token()
      },
      success: __bind(function(response) {
        this.$('form textarea').dom[0].value = '';
        this.$('.spinner').hide();
        return this.$('.thanks').show();
      }, this),
      error: __bind(function() {
        this.$('.spinner').hide();
        return this.$('.thanks').show();
      }, this)
    });
  };
  return RequestBoardView;
}();
var SidebarView;
var __bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; };
SidebarView = Backbone.View.extend({
  initialize: function(options) {
    this.controller = options.controller;
    delete options.controller;
    Backbone.View.prototype.initialize.call(this, options);
    this.el = $('#sidebar');
    _.bindAll(this, 'tile_changed');
    CurrentBoard.bind('change:selected_tile', this.tile_changed);
    CurrentBoard.bind('change:tiles_loaded', this.set_constants);
    CurrentBoard.bind('board:loaded', this.set_constants);
    return $(document.documentElement).bind("click", __bind(function(event) {
      if ($('#quick_profile').exists()) {
        return;
      }
      if ($(event.target).is("a")) {
        return;
      }
      if ($(event.target).is_or_closest("#header_container, #sidebar")) {
        return;
      }
      return CurrentBoard.set({
        selected_tile: null
      });
    }, this));
  },
  tile_changed: function() {
    this.tile = CurrentBoard.get('selected_tile');
    if (this.tile) {
      return this.show_sidebar();
    } else {
      return this.hide_sidebar();
    }
  },
  show_sidebar: function() {
    var margin, move_by, scroll_by;
    $('#sidebar').css({
      left: 0
    });
    margin = this.get_margin_left();
    move_by = this.sidebar_space - this.tile_highlight_screen_left();
    if (move_by < 0) {
      return;
    }
    if (margin >= this.max_margin_left) {
      return this.set_scroll_left_by(-move_by);
    } else {
      if (move_by + margin > this.max_margin_left) {
        scroll_by = margin + move_by - this.max_margin_left;
        move_by = this.max_margin_left - margin;
        window.setTimeout((__bind(function() {
          return this.set_scroll_left_by(-scroll_by);
        }, this)), 250);
      }
      if (move_by !== 0) {
        return this.set_margin_left_by(move_by);
      }
    }
  },
  hide_sidebar: function() {
    return;
    this.set_margin_left(this.base_margin_left);
    return $('#sidebar').css({
      left: "" + (-this.sidebar_width) + "px"
    });
  },
  tile_highlight_screen_left: function() {
    var highlight_left;
    highlight_left = $("#tile_" + this.tile.id).offset().screen_left;
    if (!_.include(["done", "done_visible"], this.tile.get('state'))) {
      highlight_left -= CurrentBoard.get('border_size');
    }
    return highlight_left;
  },
  set_scroll_left_by: function(value) {
    return this.set_scroll_left($.body_offset().scroll_left + value);
  },
  set_scroll_left: function(value) {
    return window.scrollTo(value, $.body_offset().scroll_top);
  },
  get_margin_left: function() {
    return parseInt($('#board_container').css("margin-left"), 10) || 0;
  },
  set_margin_left_by: function(value) {
    return this.set_margin_left(this.get_margin_left() + value);
  },
  set_margin_left: function(value) {
    return $('#board_container').css({
      "margin-left": "" + value + "px"
    });
  }
});
var SidebarViewAdmin;
var __bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; };
SidebarViewAdmin = SidebarView.extend({
  initialize: function(options) {
    this.controller = options.controller;
    SidebarView.prototype.initialize.call(this, options);
    delete options.controller;
    _.bindAll(this, 'toggle_editing', 'start_editing', 'cancel_editing', 'cancel_editing_do');
    $('#header_container #edit_board').bind("click", this.toggle_editing);
    this.delegateEvents(this.events());
    return window.setTimeout((__bind(function() {
      return this.start_editing();
    }, this)), 400);
  },
  events: function() {
    return {
      "click .admin header .cancel": "cancel_editing",
      "click .admin footer .cancel": "cancel_editing"
    };
  },
  hide_sidebar: function() {
    if (this.controller.editing) {
      return;
    }
    return SidebarView.prototype.hide_sidebar.call(this);
  },
  tile_highlight_screen_left: function() {
    if (this.controller.editing) {
      return 0;
    }
    return SidebarView.prototype.tile_highlight_screen_left.call(this);
  },
  position_sidebar: function() {
    var actual_height, height, last_child, max_visible_height, position, total_height;
    max_visible_height = $.body_offset().page_height - this.sidebar_top;
    total_height = $.body_offset().scroll_height - this.sidebar_top;
    height = _.max([max_visible_height, total_height]);
    if (this.controller.editing) {
      last_child = $('#sidebar .admin > *:last-child');
      actual_height = last_child.dom[0].offsetTop + last_child.dom[0].offsetHeight + 4;
      if (actual_height > max_visible_height) {
        height = _.max([actual_height, height]);
        position = "absolute";
      } else {
        position = "fixed";
      }
    } else {
      position = "fixed";
    }
    return this.el.css({
      position: position,
      height: "" + height + "px"
    });
  },
  position_board: function() {
    if (this.controller.editing) {
      return;
    }
    return SidebarView.prototype.position_board.call(this);
  },
  toggle_editing: function(event) {
    if (event) {
      stop_event(event);
    }
    if (this.controller.editing) {
      return this.cancel_editing();
    } else {
      return this.start_editing();
    }
  },
  start_editing: function(event) {
    if (event) {
      stop_event(event);
    }
    this.controller.editing = true;
    this.selected_tile_before_editing = CurrentBoard.get('selected_tile') || null;
    CurrentBoard.set({
      'selected_tile': null
    });
    this.show_sidebar();
    this.$('.normal').hide();
    return this.$('.admin').show();
  },
  cancel_editing: function(event) {
    if (event) {
      stop_event(event);
    }
    if (CurrentBoard.get('dimensions_touched')) {
      this.$('.cancel').hide();
      this.$('.cancel_spinner').show('inline');
      return CurrentBoard.fetch({
        success: this.cancel_editing_do,
        error: function() {
          return window.location.reload();
        }
      });
    } else {
      return this.cancel_editing_do();
    }
  },
  cancel_editing_do: function() {
    this.controller.editing = false;
    CurrentBoard.set({
      'selected_tile': this.selected_tile_before_editing
    });
    if (!this.selected_tile_before_editing) {
      this.hide_sidebar();
    }
    this.$('.admin form').dom[0].reset();
    this.$('.admin').hide();
    this.$('.cancel_spinner').hide();
    this.$('.cancel').show('inline');
    return this.$('.normal').show();
  }
});
var TileView;
var __slice = Array.prototype.slice, __hasProp = Object.prototype.hasOwnProperty, __extends = function(child, parent) {
  for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; }
  function ctor() { this.constructor = child; }
  ctor.prototype = parent.prototype;
  child.prototype = new ctor;
  child.__super__ = parent.prototype;
  return child;
}, __bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; };
TileView = function() {
  function TileView() {
    var args;
    args = 1 <= arguments.length ? __slice.call(arguments, 0) : [];
    TileView.__super__.constructor.apply(this, args);
    this.id = 'tile_' + this.model.get('id');
    this.el = $("\#" + this.id);
    this.delegateEvents();
    if (this.el.empty()) {
      this.el = $(this.make('div', {
        id: this.id
      }));
      $('#board').dom[0].appendChild(this.el.dom[0]);
    }
    _.bindAll(this, 'process_layers');
    _.bindAll(this, 'update_selected');
    this.model.bind('change:selected', this.update_selected);
    _.bindAll(this, 'update_focused');
    this.model.bind('change:focused', this.update_focused);
    _.bindAll(this, 'image_loaded');
    this.model.bind('loader:image_loaded', this.image_loaded);
    _.bindAll(this, 'render');
    CurrentBoard.bind('board:loaded', this.render);
    this.model.bind('change:state', this.render);
  }
  __extends(TileView, Backbone.View);
  TileView.prototype.uninitialize = function() {
    return CurrentBoard.unbind('board:loaded', this.render);
  };
  TileView.prototype.events = {
    "click": "clicked"
  };
  TileView.prototype.clicked = function(event) {
    if (State.editing) {
      return;
    }
    if (this.model.get('state') === "not_available" && !_.include(["need_signin", "need_provider", "reserved", "pending"], this.model.get('substate'))) {
      return;
    }
    stop_event(event);
    return window.location.hash = "!/tiles/" + (this.model.public_id());
  };
  TileView.prototype.update_selected = function() {
    if (this.model.get('selected')) {
      this.el.addClass('selected');
      if (this.model.get('scroll_into_view')) {
        this.scroll_into_view();
        this.model.silent_set({
          scroll_into_view: false
        });
      }
    } else {
      this.el.removeClass('selected');
    }
    if (this.model.get('state') === 'available') {
      return this.render();
    }
  };
  TileView.prototype.render = function() {
    var border_size, left, selected, state, substate, tile_size, top, type;
    state = this.model.get('state');
    substate = this.model.get('substate') || '';
    selected = this.model.get('selected') ? "selected" : "";
    this.el.attr('class', "t " + state + " " + substate + " " + selected);
    tile_size = CurrentBoard.get('tile_size');
    border_size = CurrentBoard.get('border_size');
    left = this.model.get('left') * tile_size + border_size;
    top = this.model.get('top') * tile_size + border_size;
    this.el.css({
      width: "" + tile_size + "px",
      height: "" + tile_size + "px",
      left: "" + left + "px",
      top: "" + top + "px"
    });
    this.el.html('');
    this['render_' + state](substate);
    if (this.model.must_load()) {
      type = this.model.must_load_image_type();
      switch (type) {
        case 'l':
        case 'd':
          return this.importer = new CanvasImport(this.model.url(type), null, this.process_layers, 'images');
        default:
          return TileLoader.get(this.model.url(this.model.must_load_image_type()));
      }
    }
  };
  TileView.prototype.render_available = function(substate) {
    return this.render_template('tiles/available');
  };
  TileView.prototype.render_not_available = function(substate) {
    this.el.addClass(this.model.urgent_class());
    return this.render_template('tiles/not_available');
  };
  TileView.prototype.render_done = function(substate) {
    return this.render_template('tiles/done');
  };
  TileView.prototype.render_done_visible = function(substate) {
    return this.render_template('tiles/done');
  };
  TileView.prototype.render_mine = function(substate) {
    this.el.addClass(this.model.urgent_class());
    return this.render_template("tiles/mine_" + substate);
  };
  TileView.prototype.render_admin = function(substate) {
    return this.render_template('tiles/admin');
  };
  TileView.prototype.image_loaded = function() {
    var type;
    if (this.model.get('state') === 'done') {
      return this.process_done();
    } else if (this.model.get('state') === 'done_visible') {
      type = this.model.must_load_image_type();
      if (type === 't') {
        return this.process_done_visible();
      } else if (type === 'c') {
        return this.process_done();
      }
    } else {
      return this.process_sent_back();
    }
  };
  TileView.prototype.process_layers = function(layers) {
    var canvas, ctx, layer, _i, _len;
    canvas = document.createElement('canvas');
    canvas.width = canvas.height = CurrentBoard.get('tile_size');
    ctx = canvas.getContext('2d');
    for (_i = 0, _len = layers.length; _i < _len; _i++) {
      layer = layers[_i];
      if (layer.visible) {
        ctx.drawImage(layer.canvas, 0, 0);
      }
    }
    this.$('.img').dom[0].appendChild(canvas);
    return this.model.set({
      loaded: true
    });
  };
  TileView.prototype.process_done = function() {
    return this.create_canvas(__bind(function(ctx) {
      var border_size, direction, dx, dy, h, l, matrix, t, tile_size, w, x, y, _ref, _ref2, _ref3, _results;
      if (CurrentBoard.get('show_borders')) {
        return;
      }
      if (CurrentBoard.get('show_done')) {
        return;
      }
      matrix = CurrentBoard.matrix;
      _ref = [this.model.get('left'), this.model.get('top')], l = _ref[0], t = _ref[1];
      border_size = CurrentBoard.get('border_size');
      tile_size = CurrentBoard.get('tile_size');
      _ref2 = matrix.DIRECTIONS2MOVEMENTS;
      _results = [];
      for (direction in _ref2) {
        if (!__hasProp.call(_ref2, direction)) continue;
        _ref3 = _ref2[direction], dx = _ref3[0], dy = _ref3[1];
        _results.push(matrix.is_hidden(l, t, direction) ? (x = function() {
          switch (dx) {
            case -1:
              return 0;
            case 0:
              return border_size;
            default:
              return tile_size - border_size;
          }
        }(), y = function() {
          switch (dy) {
            case -1:
              return 0;
            case 0:
              return border_size;
            default:
              return tile_size - border_size;
          }
        }(), w = h = border_size, !(dx * dy) ? dx === 0 ? (w = tile_size - 2 * border_size, h = border_size) : (w = border_size, h = tile_size - 2 * border_size) : void 0, ctx.fillRect(x, y, w, h)) : void 0);
      }
      return _results;
    }, this));
  };
  TileView.prototype.process_done_visible = function() {
    return this.create_canvas();
  };
  TileView.prototype.process_sent_back = function() {
    return this.create_canvas();
  };
  TileView.prototype.create_canvas = function(continuation) {
    var canvas, ctx;
    if (continuation == null) {
      continuation = null;
    }
    canvas = document.createElement("canvas");
    canvas.width = canvas.height = CurrentBoard.get('tile_size');
    ctx = canvas.getContext("2d");
    ctx.fillStyle = '#000';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    ctx.drawImage(this.model.get('canvas'), 0, 0);
    if (continuation) {
      continuation(ctx);
    }
    this.$('.img').html('');
    this.$('.img').dom[0].appendChild(canvas);
    return this.model.set({
      loaded: true
    });
  };
  TileView.prototype.update_focused = function() {
    var selected;
    if (this.model.get('focused')) {
      this.el.addClass('focused');
      if (this.model.get('scroll_into_view')) {
        this.scroll_into_view();
        this.model.silent_set({
          scroll_into_view: false
        });
      }
      return this.model.set({
        selected: true
      });
    } else {
      this.el.removeClass('focused');
      selected = (CurrentTile && CurrentTile.id === this.model.id) || (CurrentArtist && CurrentArtist.id === this.model.get('user_id'));
      return this.model.set({
        selected: selected
      });
    }
  };
  TileView.prototype.scroll_into_view = function() {
    var b, dx, dy, e, nx, ny, o, s, v;
    v = $.viewport();
    e = this.el.offset();
    o = $('#board_header').offset();
    s = CurrentBoard.get('tile_contour_size');
    b = {
      left: e.screen_left - s / 2,
      top: e.screen_top - s / 2,
      width: s * 2,
      height: s * 2
    };
    dx = _.max([0, b.left + b.width - v.width]);
    nx = b.left - dx - o.left;
    if (nx < 0) {
      dx = nx;
    }
    dy = _.max([0, b.top + b.height - v.height]);
    ny = b.top - dy - o.top;
    if (ny < 0) {
      dy = ny;
    }
    $.doc().scrollLeft += dx;
    return $.doc().scrollTop += dy;
  };
  return TileView;
}();
var UserOptionsView;
var __slice = Array.prototype.slice, __hasProp = Object.prototype.hasOwnProperty, __extends = function(child, parent) {
  for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; }
  function ctor() { this.constructor = child; }
  ctor.prototype = parent.prototype;
  child.prototype = new ctor;
  child.__super__ = parent.prototype;
  return child;
}, __bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; };
UserOptionsView = function() {
  function UserOptionsView() {
    var args;
    args = 1 <= arguments.length ? __slice.call(arguments, 0) : [];
    UserOptionsView.__super__.constructor.apply(this, args);
    this.el = $("#auth");
    this.root = this.$('#current_user');
    this.user_options = this.$('.user_options');
    if (!this.user_options.exists()) {
      return;
    }
    this.user_options.hide();
    this.delegateEvents();
    _.bindAll(this, 'show_user_options', 'hide_user_options', 'on_user_options', 'off_user_options');
  }
  __extends(UserOptionsView, Backbone.View);
  if (DESKTOP) {
    UserOptionsView.prototype.events = {
      "mouseover #current_user": 'show_user_options',
      "mouseover .user_options": 'on_user_options',
      "mouseout  #current_user": 'hide_user_options',
      "mouseout  .user_options": 'off_user_options'
    };
  } else {
    UserOptionsView.prototype.events = {
      "mousedown #current_user": 'toggle_user_options',
      "click #current_user a": 'cancel_event'
    };
  }
  UserOptionsView.prototype.cancel_event = function(event) {
    return stop_event(event);
  };
  UserOptionsView.prototype.toggle_user_options = function(event) {
    this.cancel_event(event);
    if (this.user_options.visible()) {
      return this.hide_user_options(event);
    } else {
      return this.show_user_options(event);
    }
  };
  UserOptionsView.prototype.show_user_options = function(event) {
    var opacity;
    opacity = this.user_options.css('opacity');
    this.clear_timeout();
    if (!this.user_options.visible()) {
      this.user_options.show();
      this.root.addClass('selected');
      return emile(this.user_options.dom[0], 'opacity: 1.0', {
        duration: 50
      });
    }
  };
  UserOptionsView.prototype.hide_user_options = function(event) {
    return this.timeout = defer(200, __bind(function() {
      this.root.removeClass('selected');
      return emile(this.user_options.dom[0], 'opacity: 0.0', {
        duration: 50,
        after: __bind(function() {
          return this.user_options.hide();
        }, this)
      });
    }, this));
  };
  UserOptionsView.prototype.on_user_options = function(event) {
    var opacity;
    opacity = this.user_options.css('opacity');
    return this.show_user_options(event);
  };
  UserOptionsView.prototype.off_user_options = function(event) {
    var opacity;
    opacity = this.user_options.css('opacity');
    return this.hide_user_options(event);
  };
  UserOptionsView.prototype.clear_timeout = function() {
    if (this.timeout) {
      window.clearTimeout(this.timeout);
    }
    return this.timeout = null;
  };
  return UserOptionsView;
}();
template_board_artist = "\"<a href=\\\"\" +\nuser.profile_path() +\n\"\\\">\" + \nuser.get('username') +\n' ' +\n\"<small>\" +\nuser.get('nr_tiles') + \n\"</small></a>\" +\n' '";

template_board_download = "\"Get the image\"";

template_board_header = "\"<div class=\\\"info\\\"><h1><a href=\\\"/\\\">Tzigla</a>\" +\n' &raquo; ' +\n\"<a href=\\\"#!/\\\" class=\\\"title\\\">\" +\nCurrentBoard.get('title') + \n\"</a>\" +\n' ' +\n\"<small>\" +\nCurrentBoard.get('nr_done_tiles') +\n\"/\" +\nCurrentBoard.get('nr_total_tiles') +\n\" done (\" +\nCurrentBoard.get('percent_complete') +\n\"%), \" +\n(function () { if (CurrentBoard.get('moderated')) { return (\n\"curated \"\n);} else { return \"\"; } }).call(this) +\n(function () { if (!CurrentBoard.get('moderated')) { return (\n\"created \"\n);} else { return \"\"; } }).call(this) +\n\"by <a href=\\\"\" +\nCurrentBoard.user().profile_path() +\n\"\\\">\" + \nCurrentBoard.user().get('username') + \n\"</a></small></h1></div><div class=\\\"artists\\\"><strong>by \" +\nthis.pluralize(CurrentBoard.get('nr_artists'), \"artist\") +\n\":</strong>\" +\n(function () { var __result__ = [], __key__, user; for (__key__ in users) { if (users.hasOwnProperty(__key__)) { user = users[__key__]; __result__.push(\nthis.render_partial('board/artist', this, {user: user})\n); } } return __result__.join(\"\"); }).call(this) + \n\"</div>\"";

template_board_playback = "\"<div class=\\\"back\\\">\" + \n\"<a href=\\\"\" + html_escape('#') + \"\\\">\" + \n\"<img src=\\\"\" + html_escape('/images/icons/skip_backward.png') + \"\\\" />\" + \n\"</a></div><div class=\\\"play\\\">\" + \n\"<a href=\\\"\" + html_escape('#') + \"\\\">\" + \n\"<img src=\\\"\" + html_escape('/images/icons/play.png') + \"\\\" />\" + \n\"</a></div>\" + \n\"<div style=\\\"\" + html_escape('display: none') + \"\\\" class=\\\"pause\\\">\" + \n\"<a href=\\\"\" + html_escape('#') + \"\\\">\" + \n\"<img src=\\\"\" + html_escape('/images/icons/pause.png') + \"\\\" />\" + \n\"</a></div><div class=\\\"forward\\\">\" + \n\"<a href=\\\"\" + html_escape('#') + \"\\\">\" + \n\"<img src=\\\"\" + html_escape('/images/icons/skip_forward.png') + \"\\\" />\" + \n\"</a></div>\"";

template_board_styles = "\".tile_size {  width:  \" +\nCurrentBoard.get('tile_size') +\n\"px;  height: \" +\nCurrentBoard.get('tile_size') +\n\"px }\\n.tile_contour_size {  width:  \" +\nCurrentBoard.get('tile_contour_size') +\n\"px;  height: \" +\nCurrentBoard.get('tile_contour_size') +\n\"px }\\n.border_size_offset {  margin-left: \" +\nCurrentBoard.get('border_size') +\n\"px;  margin-top:  \" +\nCurrentBoard.get('border_size') +\n\"px }\\n.t .highlight {  left:    \" +\n-(CurrentBoard.get('border_size')+1) +\n\"px;  top:     \" +\n-(CurrentBoard.get('border_size')+1) +\n\"px;  padding: \" +\nCurrentBoard.get('border_size') +\n\"px }\\n#current_tile .content_obfuscator {  left: \" +\nCurrentBoard.get('border_size') * 2 +\n\"px;  top:  \" +\nCurrentBoard.get('border_size') * 2 +\n\"px;  width:  \" +\n(CurrentBoard.get('tile_size') - 2 * CurrentBoard.get('border_size')) +\n\"px;  height: \" +\n(CurrentBoard.get('tile_size') - 2 * CurrentBoard.get('border_size')) +\n\"px }\\n\" +\n(function () { if (!CurrentBoard.get('show_done_visible')) { return (\n\".t.done_visible .highlight,\"\n);} else { return \"\"; } }).call(this) +\n\".t.done .highlight {  top:     -1px;  left:    -1px;  padding: 0 }#board .t:nth-child(\" +\nCurrentBoard.get('width') +\n\"n) .highlight .title {  left: auto;  right: -1px }\"";

template_current_artist_current_artist = "\"<div id=\\\"user_info\\\"><h1>\" + \nuser.get('username') +\n\"<a href=\\\"/artists/\" +\nuser.id +\n\"\\\" class=\\\"view_profile\\\">view profile</a></h1><div class=\\\"details\\\">\" + \n(function () { if (user.get('authorizations')[0].avatar) { return (\n\"<div class=\\\"avatar\\\"><img src=\\\"\" +\nuser.get('authorizations')[0].avatar +\n\"\\\" /></div>\"\n);} else { return \"\"; } }).call(this) +\n\"<div class=\\\"info\\\">\" + \n(function () { if (CurrentBoard.get('user_id') == user.id && CurrentBoard.get('moderated')) { return (\n\"<h2>\" + \n(function () { if (Tiles.by(user).length > 0) { return (\n\"\" +\nthis.pluralize(Tiles.by(user).length, \"tile\") +\n\" on this board. \"\n);} else { return \"\"; } }).call(this) +\n\"Curator</h2>\"\n);} else { return \"\"; } }).call(this) +\n(function () { if (!(CurrentBoard.get('user_id') == user.id && CurrentBoard.get('moderated'))) { return (\n\"<h2>\" +\nthis.pluralize(Tiles.by(user).length, \"tile\") +\n\" on this board</h2>\"\n);} else { return \"\"; } }).call(this) +\n\"<ul class=\\\"tiles\\\">\" + \n(function () { var __result__ = [], __key__, tile; for (__key__ in Tiles.by(user)) { if (Tiles.by(user).hasOwnProperty(__key__)) { tile = Tiles.by(user)[__key__]; __result__.push(\n\"<li>\" +\ntile.local_link() +\n(function () { if (tile.short_state()) { return (\n' ' +\n\"<small>(\" +\ntile.short_state() +\n\")</small>\"\n);} else { return \"\"; } }).call(this) + \n\"</li>\"\n); } } return __result__.join(\"\"); }).call(this) + \n\"</ul></div></div>\" +\nthis.render_partial(\"shared/user_providers\", this, {user: user}) + \n\"</div>\"";

template_current_tile_admin = "\"<h1>\" + \nthis.tile_title() + \n\"</h1><div class=\\\"details\\\"><div class=\\\"tile\\\"><div class=\\\"wrapper tile_contour_size\\\"><div style=\\\"background-image: url(\" +\nthis.generate_reservable() +\n\")\\\" class=\\\"tile_contour_size\\\"></div><img src=\\\"\" +\ntile.get('secret_url') +\n\"\\\" class=\\\"tile_size border_size_offset\\\" /><div class=\\\"content_obfuscator\\\"></div></div></div><div class=\\\"info\\\">\" + \nthis.render_partial(\"current_tile/tile_by\", this, {tile: tile}) +\n\"<div class=\\\"notes\\\"><p>Make sure the tile fits and the borders are blending in correctly.</p></div></div></div><div id=\\\"moderate\\\"><form action=\\\"/boards/\" +\nCurrentBoard.get('id') +\n\"/admin/tiles/\" +\nCurrentTile.get('object_id') +\n\"/moderate\\\" method=\\\"post\\\"><div class=\\\"approve\\\"><input name=\\\"act\\\" type=\\\"radio\\\" value=\\\"approve\\\" id=\\\"act_approve\\\" /><label for=\\\"act_approve\\\">approve</label></div><div class=\\\"send_back\\\"><input name=\\\"act\\\" type=\\\"radio\\\" value=\\\"send_back\\\" id=\\\"act_send_back\\\" /><label for=\\\"act_send_back\\\">send back</label></div><div class=\\\"reject\\\"><input name=\\\"act\\\" type=\\\"radio\\\" value=\\\"reject\\\" id=\\\"act_reject\\\" /><label for=\\\"act_reject\\\">reject</label></div><textarea style=\\\"display: none\\\" name=\\\"comment\\\" rows=\\\"4\\\" placeholder=\\\"Write a private message to \" +\ntile.user().get('username') +\n\". Be kind :) \\n\\nExplain why you're sending the tile back for more work.\\\">\" + \nCurrentTile.get('admin_comment') + \n\"</textarea><div class=\\\"actions\\\">\" +\n\"<input type=\\\"submit\\\" value=\\\"\" + html_escape('Choose an action') + \"\\\" disabled=\\\"disabled\\\" class=\\\"button\\\" />\" +\n\"<div class=\\\"error\\\"></div></div></form><img src=\\\"/images/progress.gif\\\" style=\\\"display: none\\\" class=\\\"spinner\\\" /></div>\"";

template_current_tile_admin_form = "\"<form action=\\\"/boards/\" +\nCurrentBoard.get('id') +\n\"/admin/tiles/\" +\nCurrentTile.get('object_id') +\n\"/\" +\naction +\n\"\\\" method=\\\"post\\\">\" + \n\"<input title=\\\"\" + html_escape(title) + \"\\\" type=\\\"submit\\\" value=\\\"\" + html_escape(label) + \"\\\" class=\\\"\" + html_escape(\"button \" + action) + \"\\\" />\" + \n\"</form>\"";

template_current_tile_available = "\"<h1>\" + \nthis.tile_title() + \n\"</h1><div class=\\\"details\\\"><div class=\\\"tile\\\"><div style=\\\"background-image: url(\" +\nthis.generate_reservable() +\n\")\\\" class=\\\"img wrapper tile_contour_size\\\"></div></div><div class=\\\"info\\\"><div class=\\\"action\\\" id=\\\"reserve\\\"><a href=\\\"#reserve\\\" class=\\\"button\\\">Reserve it for \" +\nCurrentBoard.get('tile_reservation_duration') +\n\"h </a><img src=\\\"/images/progress.gif\\\" style=\\\"display: none\\\" class=\\\"spinner\\\" /></div><div class=\\\"notes\\\"><p>By reserving you promise to love it, cherish it and upload it before the time runs out.</p><p><a href=\\\"/pages/tiles\\\" :target=\\\"_blank\\\">Read about making great tiles</a></p></div></div></div>\"";

template_current_tile_done = "\"<h1>\" + \nthis.tile_title() +\n(function () { if (CurrentTile.get('user_id') == CurrentUser.id) { return (\n\"<a class=\\\"\" + html_escape('edit_title_toggle') + \"\\\" href=\\\"\" + html_escape('#edit_title') + \"\\\">\" + \n(function () { if (CurrentTile.get('title')) { return (\n\"edit\"\n);} else { return \"\"; } }).call(this) +\n(function () { if (!CurrentTile.get('title')) { return (\n\"add a title\"\n);} else { return \"\"; } }).call(this) + \n\"</a>\" +\n' ' +\n\"<form style=\\\"display: none\\\" id=\\\"edit_title\\\">\" +\n\"<input id=\\\"\" + html_escape('tile_title') + \"\\\" type=\\\"\" + html_escape('text') + \"\\\" value=\\\"\" +\n\"\" +\nhtml_escape(CurrentTile.get('title') || '') +\n\"\\\" placeholder=\\\"\" + html_escape('Title your tile (max 255)') + \"\\\" />\" +\n' ' +\n\"<input type=\\\"\" + html_escape('submit') + \"\\\" value=\\\"Save\\\" class=\\\"\" + html_escape('button') + \"\\\" />\" +\n\"<a class=\\\"\" + html_escape('edit_title_toggle') + \"\\\" href=\\\"\" + html_escape('#cancel') + \"\\\">\" + \n\"cancel</a></form><img src=\\\"/images/progress.gif\\\" style=\\\"display: none\\\" class=\\\"spinner\\\" />\"\n);} else { return \"\"; } }).call(this) + \n\"</h1><div class=\\\"details\\\"><div class=\\\"tile\\\"><img src=\\\"\" +\nthis.canvas_data_url() +\n\"\\\" class=\\\"wrapper tile_size\\\" /></div><div class=\\\"info\\\">\" + \nthis.render_partial(\"current_tile/tile_by\", this, {tile: tile}) +\n\"<div class=\\\"notes\\\">\" + \n(function () { if (this.tile_notes()) { return (\n\"<p>\" + \nthis.tile_notes() + \n\"</p>\"\n);} else { return \"\"; } }).call(this) + \n\"</div></div></div>\"";

template_current_tile_mine = "\"<h1>\" + \nthis.tile_title() + \n\"</h1><div class=\\\"details\\\"><div class=\\\"tile\\\"><img src=\\\"\" +\nthis.generate_reservable() +\n\"\\\" class=\\\"wrapper tile_contour_size\\\" /></div><div class=\\\"info\\\">\" + \n(function () { if (tile.get('substate') == 'reserved') { return (\n\"<h2>Work on this tile</h2><div class=\\\"notes\\\"><div class=\\\"action\\\"><a target=\\\"_blank\\\" href=\\\"\" +\nthis.generate_reservable() +\n\"\\\" id=\\\"download\\\">Download</a>|<a href=\\\"/pages/tiles\\\" target=\\\"_blank\\\">How to make great tiles</a></div><div id=\\\"release\\\"><p>If you changed your mind, or if you don't have time to finish, please don't hog, <a href=\\\"#release\\\">release the tile</a>.</p><img src=\\\"/images/progress.gif\\\" style=\\\"display: none\\\" class=\\\"spinner\\\" /></div></div>\"\n);} else { return \"\"; } }).call(this) +\n(function () { if (tile.get('substate') == 'pending') { return (\n\"<div class=\\\"notes\\\"><p><strong>Thanks for making a tile!</strong></p><p>\" + \nthis.render_partial(\"shared/user\", this, {user: CurrentBoard.user()}) +\n' ' +\n\"(the curator of this board), has been emailed and will check out your tile very soon.</p>\" +\n(function () { if (tile.get('substate') == 'pending') { return (\n(function () { if (CurrentUser.get('has_email')) { return (\n\"<p>You will be notified by email when your tile is <strong>approved</strong> or <strong>sent back</strong> for more work.</p>\"\n);} else { return \"\"; } }).call(this) +\n(function () { if (!CurrentUser.get('has_email')) { return (\n\"<p>You should <strong>\" + \n\"<a href=\\\"\" + html_escape('/account') + \"\\\">\" + \n\"add an email to your account</a></strong> so we can notify you when your tile is approved or sent back for more work.</p>\"\n);} else { return \"\"; } }).call(this)\n);} else { return \"\"; } }).call(this) + \n\"</div>\"\n);} else { return \"\"; } }).call(this) + \n\"</div></div>\" +\n(function () { if (tile.get('substate') == 'reserved') { return (\n\"<div class=\\\"\" +\n(tile.get('board').is_pixel_art() ? 'editor' : 'upload') +\n\"\\\" id=\\\"send_image\\\">\" + \n(function () { if (tile.get('board').is_pixel_art() && DESKTOP) { return (\n\"<div class=\\\"draw_options\\\"><div>\" +\n\"<input name=\\\"draw\\\" type=\\\"radio\\\" value=\\\"editor\\\" checked=\\\"\" + html_escape('checked') + \"\\\" id=\\\"draw_in_editor\\\" />\" +\n\"<label for=\\\"draw_in_editor\\\">Draw in editor</label></div><div><input name=\\\"draw\\\" type=\\\"radio\\\" value=\\\"upload\\\" id=\\\"draw_offline\\\" /><label for=\\\"draw_offline\\\">Upload a file</label></div></div>\"\n);} else { return \"\"; } }).call(this) +\n(function () { if (tile.get('board').is_pixel_art()) { return (\n\"<div class=\\\"option editor\\\"><a target=\\\"_blank\\\" href=\\\"#\\\" class=\\\"button\\\" id=\\\"show_editor\\\">Open pixel editor</a><form accept-charset=\\\"UTF-8\\\" action=\\\"\" +\nCurrentUser.get('upload_data').domain +\n\"\\\" enctype=\\\"multipart/form-data\\\" method=\\\"post\\\" target=\\\"upload_iframe\\\"><div>\" + \n(function () { var __result__ = [], name, value; for (name in CurrentUser.get('upload_data').fields) { if (CurrentUser.get('upload_data').fields.hasOwnProperty(name)) { value = CurrentUser.get('upload_data').fields[name]; __result__.push(\n\"<input name=\\\"\" +\nname +\n\"\\\" type=\\\"hidden\\\" value=\\\"\" +\nvalue +\n\"\\\" />\"\n); } } return __result__.join(\"\"); }).call(this) + \n\"</div><input name=\\\"file\\\" type=\\\"hidden\\\" class=\\\"file\\\" /><input name=\\\"commit\\\" type=\\\"submit\\\" value=\\\"Upload the drawing\\\" class=\\\"button\\\" /></form></div>\"\n);} else { return \"\"; } }).call(this) +\n(function () { if (DESKTOP) { return (\n\"<div class=\\\"option upload\\\"><form accept-charset=\\\"UTF-8\\\" action=\\\"\" +\nCurrentUser.get('upload_data').domain +\n\"\\\" enctype=\\\"multipart/form-data\\\" method=\\\"post\\\" target=\\\"upload_iframe\\\"><div>\" + \n(function () { var __result__ = [], name, value; for (name in CurrentUser.get('upload_data').fields) { if (CurrentUser.get('upload_data').fields.hasOwnProperty(name)) { value = CurrentUser.get('upload_data').fields[name]; __result__.push(\n\"<input name=\\\"\" +\nname +\n\"\\\" type=\\\"hidden\\\" value=\\\"\" +\nvalue +\n\"\\\" />\"\n); } } return __result__.join(\"\"); }).call(this) + \n\"</div><div class=\\\"file_chooser_container\\\"><div class=\\\"file_chooser\\\"><div class=\\\"wrapper\\\"><input name=\\\"file\\\" type=\\\"file\\\" class=\\\"field\\\" id=\\\"file\\\" /></div><a class=\\\"button\\\">Choose file</a></div><input name=\\\"commit\\\" type=\\\"submit\\\" value=\\\"Upload it\\\" class=\\\"button\\\" /><div class=\\\"filename\\\"></div></div></form></div>\"\n);} else { return \"\"; } }).call(this) +\n\"<div class=\\\"loading\\\"><img src=\\\"/images/progress.gif\\\" class=\\\"spinner\\\" /></div><div class=\\\"error\\\">Something went wrong, our bad. Please try again.</div><div class=\\\"success\\\">Upload successful <img src=\\\"/images/progress.gif\\\" class=\\\"spinner\\\" /></div><iframe name=\\\"upload_iframe\\\" style=\\\"display: none;\\\" id=\\\"upload_iframe\\\"></iframe>\" +\n(function () { if (!tile.get('board').is_pixel_art() && !DESKTOP) { return (\n\"<div class=\\\"option nope\\\"><p>Sorry, you can't upload to this board from your mobile device.</p><p><a href=\\\"/\\\">View all boards</a>\" +\n' ' +\n\"and try a pixel art one.</p></div>\"\n);} else { return \"\"; } }).call(this) +\n(function () { if (tile.get('board').is_pixel_art() || DESKTOP) { return (\n\"<div class=\\\"license\\\">By uploading you agree to our friendly <a href=\\\"/pages/terms\\\" target=\\\"_blank\\\">terms of use</a>.</div>\"\n);} else { return \"\"; } }).call(this) + \n\"</div>\"\n);} else { return \"\"; } }).call(this)";

template_current_tile_not_available = "\"<h1>\" + \nthis.tile_title() + \n\"</h1><div class=\\\"details\\\"><div class=\\\"tile\\\"><div style=\\\"background-image: url(\" +\nthis.generate_reservable() +\n\")\\\" class=\\\"wrapper tile_contour_size\\\"></div></div><div class=\\\"info\\\">\" + \n(function () { if (tile.user()) { return (\nthis.render_partial(\"current_tile/tile_by\", this, {tile: tile})\n);} else { return \"\"; } }).call(this) +\n(function () { if (this.tile_notes()) { return (\n\"<div class=\\\"notes\\\"><p>\" + \nthis.tile_notes() + \n\"</p></div>\"\n);} else { return \"\"; } }).call(this) +\n(function () { if (tile.get('substate') == 'need_signin' || tile.get('substate') == 'need_provider') { return (\n\"<h2>Click on your favorite site below</h2><ul class=\\\"auth\\\">\" + \n(function () { var __result__ = [], __key__, provider; for (__key__ in CurrentBoard.get('providers')) { if (CurrentBoard.get('providers').hasOwnProperty(__key__)) { provider = CurrentBoard.get('providers')[__key__]; __result__.push(\n\"<li>\" + \nthis.render_partial(\"shared/provider\", this, { provider: provider}) + \n\"</li>\"\n); } } return __result__.join(\"\"); }).call(this) + \n\"</ul>\" +\n(function () { if (tile.get('substate') == 'need_provider') { return (\n\"<div class=\\\"notes\\\"><p>You need to have an account with \" +\nCurrentBoard.get('providers').join(' or ') +\n\" to participate on this board.</p><p>If you don't have one, you should try one of our\" +\n' ' +\n\"<a href=\\\"/\\\">other boards</a>\" +\n' ' +\n\"instead.</p></div>\"\n);} else { return \"\"; } }).call(this)\n);} else { return \"\"; } }).call(this) + \n\"</div></div>\" +\n(function () { if (tile.get('substate') == 'need_signin' || tile.get('substate') == 'need_provider') { return (\n\"<div id=\\\"security_note\\\"><h2>Read why this is the safest way to sign in</h2><ul class=\\\"notes\\\"><li>Tzigla never sees or asks for you password.</li><li>Authentication happens on the site you choose (facebook, twitter, etc).</li><li>We just get to know you are who you say you are.</li><li>Still not sure? Read our <a href=\\\"/pages/security\\\">full details about security</a>.</li></ul></div>\"\n);} else { return \"\"; } }).call(this)";

template_current_tile_tile_by = "\"<p class=\\\"by\\\">by \" +\nthis.render_partial(\"shared/user\", this, {user: tile.user()}) + \n\"</p>\"";

template_editor_canvas = "\"<div style=\\\"width: \" +\nthis.contour_size +\n\"px; height: \" +\nthis.contour_size +\n\"px\\\" class=\\\"wrapper\\\"><div class=\\\"trap\\\"><div class=\\\"inner\\\"></div></div><div class=\\\"inner\\\"><canvas style=\\\"display: none\\\" class=\\\"brush_preview\\\"></canvas></div><div class=\\\"layers\\\"><div class=\\\"inner\\\"></div></div><canvas width=\\\"1\\\" height=\\\"1\\\" class=\\\"border\\\"></canvas></div>\"";

template_editor_editor = "\"<div id=\\\"editor\\\">\" + \n(function () { if (!this.standalone) { return (\n\"<a href=\\\"\" + html_escape('#') + \"\\\" title=\\\"\" + html_escape('Save draft and close editor') + \"\\\" class=\\\"close\\\">\" + \n\"&times;</a>\"\n);} else { return \"\"; } }).call(this) +\n\"<img src=\\\"\" +\nwindow.TRANSPARENT_PATTERN +\n\"\\\" style=\\\"display: none\\\" id=\\\"transparent_pattern\\\" /><table><tr><td class=\\\"brushes_and_dithers\\\"><div class=\\\"brushes\\\"></div><div class=\\\"dithers\\\"></div></td><td class=\\\"palette_container\\\"><div class=\\\"palette\\\">\" + \n(function () { var __result__ = [], __key__, hex; for (__key__ in this.model.palette.hexes) { if (this.model.palette.hexes.hasOwnProperty(__key__)) { hex = this.model.palette.hexes[__key__]; __result__.push(\n\"<div><span style=\\\"background-color: \" +\nhex +\n\"\\\"></span></div>\"\n); } } return __result__.join(\"\"); }).call(this) +\n\"<div class=\\\"transparent\\\"><span></span></div></div></td><td class=\\\"main_container\\\"><div class=\\\"top_actions\\\"><div class=\\\"zoom\\\"><a href=\\\"#zoom\\\" class=\\\"out\\\">&minus;</a><span>\" +\nthis.model.initial_zoom +\n\"x</span><a href=\\\"#zoom\\\" class=\\\"in\\\">+</a></div><div class=\\\"operations\\\"><span>(opens in new tab)</span><a href=\\\"#save\\\" target=\\\"_blank\\\" class=\\\"save\\\">export</a></div></div><div class=\\\"main\\\"><div data-zoom=\\\"\" +\nthis.model.initial_zoom +\n\"\\\" class=\\\"canvas_view\\\"></div></div></td><td class=\\\"side\\\"><div class=\\\"preview_container\\\"><div class=\\\"preview\\\"><div data-zoom=\\\"1\\\" class=\\\"canvas_view\\\"></div></div><div class=\\\"zoom\\\">click preview to zoom</div></div><div class=\\\"actions\\\"><a href=\\\"#undo\\\" class=\\\"undo\\\">&laquo;</a><a href=\\\"#redo\\\" class=\\\"redo\\\">&raquo;</a><a href=\\\"#clear\\\" class=\\\"clear\\\">CLEAR</a></div><div class=\\\"preview_layers\\\"><div class=\\\"title\\\">LAYERS</div><ol></ol></div></td><td class=\\\"fluff\\\"><div class=\\\"tzigla\\\"></div>\" +\n(function () { if (DESKTOP) { return (\n\"<div class=\\\"instructions\\\"><div class=\\\"title\\\">KEYS</div><div class=\\\"primary\\\"><p><strong>a, s</strong><span>colors</span><br /><strong>q, w</strong><span>brushes</span><br /><strong>1, 2</strong><span>dithers</span><br /><strong>z, x</strong><span>undo/redo</span></p></div><div class=\\\"other\\\"><p><strong>right click</strong><span>picker</span><br /><strong>shift click</strong><span>fill</span><br /><strong>alt click</strong><span>move layer</span></p></div></div><div class=\\\"instructions\\\"><div class=\\\"title\\\">NOTES / HELP</div><p>If you move a layer outside the canvas, things will be cut off!<p>Constantly being saved to your browser's cache.</p>\" +\n(function () { if (!this.standalone) { return (\n\"<p>Saved on the server when you close the editor with the little X above.</p><p><strong>Close the editor</strong>\" +\n' ' +\n\"and look in the sidebar <strong>to submit your tile</strong>.</p>\"\n);} else { return \"\"; } }).call(this) + \n\"</p></div>\" +\n(function () { if (this.standalone) { return (\n\"<div class=\\\"instructions\\\"><div class=\\\"title\\\">Play with others!</div><p><a href=\\\"/\\\">Choose a board</a> and make a tile to create a collaborative drawing with other people.</p></div>\"\n);} else { return \"\"; } }).call(this)\n);} else { return \"\"; } }).call(this) +\n\"<div class=\\\"instructions\\\"><div class=\\\"title\\\">Pixel art tutorials and help</div><ul><li><a href=\\\"http://www.opendb.net/element/869.php\\\">Basic house tutorial</a></li><li><a href=\\\"http://gas13.ru/v3/tutorials/isometric_pixelart_tutorial_isometric_house.php\\\">Isometric house tutorial</a></li><li><a href=\\\"http://pixel-zone.rpgdx.net/shtml/tut-isometric.shtml\\\">More isometric tutorials</a></li><li><a href=\\\"http://wayofthepixel.net/pixelation/\\\">Pixelation forum</a></li></ul></div><div class=\\\"instructions\\\"><div class=\\\"title\\\">Editor loves you. Love it back!</div>\" +\nwindow.EDITOR_SHARING + \n\"</div></td></tr></table></div>\"";

template_editor_preview_layer = "\"<li data-index=\\\"\" +\nindex +\n\"\\\" id=\\\"preview_layer_\" +\nindex +\n\"\\\" class=\\\"\" +\n(visibility||'') +\n\" \" +\nselected +\n\"\\\"><canvas width=\\\"\" +\nthis.canvas.size +\n\"\\\" height=\\\"\" +\nthis.canvas.size +\n\"\\\"></canvas><span>layer \" +\nindex +\n\"<small class=\\\"status\\\">\" +\n(visibility||'') + \n\"</small></span><a href=\\\"#toggle_visibility\\\">\" + \ntoggle_text + \n\"</a></li>\"";

template_events_events = "(function () { var __result__ = [], __key__, event; for (__key__ in events) { if (events.hasOwnProperty(__key__)) { event = events[__key__]; __result__.push(\n\"<li class=\\\"\" +\nevent.get('action') +\n\"\\\" data-tile=\\\"\" +\nevent.tile_public_id() +\n\"\\\">\" + \nevent.html() + \n\"</li>\"\n); } } return __result__.join(\"\"); }).call(this)";

template_quick_profile_quick_profile = "\"<div class=\\\"details\\\">\" + \n(function () { if (this.user().get('authorizations')[0].avatar) { return (\n\"<div class=\\\"avatar\\\"><img src=\\\"\" +\nthis.user().get('authorizations')[0].avatar +\n\"\\\" /></div>\"\n);} else { return \"\"; } }).call(this) +\n\"<div class=\\\"info\\\"><div class=\\\"username\\\">\" + \nthis.user().get('username') + \n\"</div></div></div>\" +\nthis.render_partial(\"shared/user_providers\", this, {user: this.user()})";

template_shared_provider = "\"<span class=\\\"user\\\"><a href=\\\"/auth/\" +\nprovider +\n\"\\\" class=\\\"authsignin\\\"><img src=\\\"/images/providers/\" +\nprovider +\n\".png\\\" /><strong>sign in with \" +\nprovider + \n\"</strong></a></span>\"";

template_shared_user = "\"<span class=\\\"user\\\"><a href=\\\"\" +\nuser.profile_path() +\n\"\\\"><strong>\" + \nuser.get('username') + \n\"</strong></a></span>\"";

template_shared_user_provider = "(function () { if (user.profile_link_for(authorization.provider) != null) { return (\n\"<a href=\\\"\" +\nuser.profile_link_for(authorization.provider) +\n\"\\\" target=\\\"_blank\\\"><img src=\\\"/images/providers/\" +\nauthorization.provider +\n\".png\\\" width=\\\"16\\\" height=\\\"16\\\" /><span>\" +\nauthorization.provider +\n\" - </span><strong>\" + \nauthorization.display_name + \n\"</strong></a>\"\n);} else { return \"\"; } }).call(this) +\n(function () { if (user.profile_link_for(authorization.provider) == null) { return (\n\"<img src=\\\"/images/providers/\" +\nauthorization.provider +\n\".png\\\" width=\\\"16\\\" height=\\\"16\\\" /><span>\" +\nauthorization.provider +\n\" - </span><strong>\" + \nauthorization.display_name + \n\"</strong>\"\n);} else { return \"\"; } }).call(this)";

template_shared_user_providers = "\"<ul class=\\\"providers\\\">\" + \n(function () { var __result__ = [], __key__, authorization; for (__key__ in user.get('authorizations')) { if (user.get('authorizations').hasOwnProperty(__key__)) { authorization = user.get('authorizations')[__key__]; __result__.push(\n\"<li>\" + \nthis.render_partial(\"shared/user_provider\", this, {authorization: authorization, user: user, extra: authorization.provider}) + \n\"</li>\"\n); } } return __result__.join(\"\"); }).call(this) + \n\"</ul>\"";

template_tiles_admin = "\"<div class=\\\"img tile_size\\\"><img src=\\\"\" +\nthis.model.get('secret_url') +\n\"\\\" class=\\\"tile_size\\\" /></div>\" +\nthis.render_partial('tiles/user_highlight', this, {username: this.model.user().get('username'), secondary: null})";

template_tiles_available = "\"<div class=\\\"plus\\\"></div><div class=\\\"highlight\\\"><div class=\\\"title action\\\"><strong>#\" +\nthis.model.public_id() + \n\"</strong><span> \" +\n(function () { if (CurrentTile && CurrentTile.id == this.model.id) { return (\n\"look in the sidebar\"\n);} else { return \"\"; } }).call(this) +\n(function () { if (!CurrentTile || CurrentTile.id != this.model.id) { return (\n\"click to reserve\"\n);} else { return \"\"; } }).call(this) + \n\"</span></div></div>\"";

template_tiles_done = "\"<div class=\\\"img tile_size\\\"><!-- # loaded by the model --></div>\" +\nthis.render_partial('tiles/user_highlight', this, {username: this.model.user().get('username'), secondary: null})";

template_tiles_mine_pending = "\"<div class=\\\"padlock\\\"></div>\" +\nthis.render_partial('tiles/user_highlight', this, {username:  this.model.user().get('username'), secondary: 'awaiting moderation'})";

template_tiles_mine_reserved = "\"<div class=\\\"clock\\\"></div>\" +\nthis.render_partial('tiles/user_highlight', this, {username:  this.model.user().get('username'), secondary: this.model.time_left() + \" left to upload\" }) +\n\"<div style=\\\"display: none\\\" class=\\\"img\\\"></div>\"";

template_tiles_not_available = "(function () { if (this.model.get('substate') == 'reserved') { return (\n\"<div class=\\\"clock\\\"></div>\" +\nthis.render_partial('tiles/user_highlight', this, {username: this.model.user().get('username'), secondary: this.model.time_left() + \" left\"})\n);} else { return \"\"; } }).call(this) +\n(function () { if (this.model.get('substate') == 'pending') { return (\n\"<div class=\\\"padlock\\\"></div>\" +\nthis.render_partial('tiles/user_highlight', this, {username: this.model.user().get('username'), secondary: 'pending moderation'})\n);} else { return \"\"; } }).call(this) +\n(function () { if (this.model.get('substate') == 'have_reserved') { return (\n\"<div class=\\\"plus\\\"></div>\"\n);} else { return \"\"; } }).call(this) +\n(function () { if (this.model.get('substate') == 'have_pending') { return (\n\"<div class=\\\"plus\\\"></div>\"\n);} else { return \"\"; } }).call(this) +\n(function () { if (!_.include('reserved pending need_signin need_provider'.split(' '), this.model.get('substate'))) { return (\n\"<div class=\\\"highlight\\\"><div class=\\\"title denied\\\"><strong>#\" +\nthis.model.public_id() + \n\"</strong><span> not available \" +\n(function () { if (this.model.get('substate')) { return (\n\"(\" +\nthis.model.get('substate').replace('_', ' ') +\n\")\"\n);} else { return \"\"; } }).call(this) +\n(function () { if (!this.model.get('substate')) { return (\n\"(yet)\"\n);} else { return \"\"; } }).call(this) + \n\"</span></div></div>\"\n);} else { return \"\"; } }).call(this) +\n(function () { if (this.model.get('substate') == 'need_signin') { return (\nthis.render_partial('tiles/not_available_because', this, {reason: \"Click to reserve\"})\n);} else { return \"\"; } }).call(this) +\n(function () { if (this.model.get('substate') == 'need_provider') { return (\nthis.render_partial('tiles/not_available_because', this, {reason: \"Click to reserve\"})\n);} else { return \"\"; } }).call(this)";

template_tiles_not_available_because = "\"<div class=\\\"plus\\\"></div><div class=\\\"highlight\\\"><div class=\\\"title denied\\\"><strong>#\" +\nthis.model.public_id() + \n\"</strong><span> \" +\nreason + \n\"</span></div></div>\"";

template_tiles_user_highlight = "\"<div class=\\\"highlight\\\"><div class=\\\"title user\\\"><strong>#\" +\nthis.model.public_id() + \n\"</strong><span> by </span><strong>\" + \nusername + \n\"</strong>\" +\n(function () { if (secondary != null) { return (\n\"<span> (\" +\nsecondary +\n\")</span>\"\n);} else { return \"\"; } }).call(this) + \n\"</div></div>\"";
