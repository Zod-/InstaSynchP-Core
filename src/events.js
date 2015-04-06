function Events() {
  'use strict';
  this.listeners = {};
}

Events.prototype.createListener = function (name) {
  'use strict';
  this.listeners[name] = {
    'preOld': [],
    'postOld': []
  };
};

Events.prototype.createListenerIfNotExists = function (name) {
  'use strict';
  var _this = this;
  if (isUdef(_this.listeners[name])) {
    _this.createListener(name);
  }
};

Events.prototype.log = function (opts) {
  'use strict';
  var args = [];
  opts.type = opts.type || 'debug';
  args.push('Events');
  args.push(opts.event);
  if (opts.eventName || opts.eventNames) {
    args.push(opts.eventName || opts.eventNames);
  }
  if (opts.callback) {
    args.push(opts.callback.name);
  }
  if (!isUdef(opts.preOld)) {
    args.push('preOld');
    args.push(opts.preOld);
  }
  if (opts.ref) {
    args.push(opts.ref.name);
  }
  if (opts.parameters) {
    try {
      args.push(JSON.stringify(opts.parameters));
    } catch (ignore) {
      args.push(opts.parameters);
    }
  }
  if (opts.err) {
    args.push(opts.err.message);
    args.push(opts.err.stack);
    args.push(opts.err);
  }
  logger()[opts.type].apply(logger(), args);
};

Events.prototype.pushListener = function (ref, eventName, callback, preOld) {
  'use strict';
  var _this = this;
  var prepost = preOld ? 'preOld' : 'postOld';
  _this.createListenerIfNotExists(eventName);
  _this.listeners[eventName][prepost].push({
    ref: ref,
    callback: callback
  });
};


Events.prototype.on = function (ref, eventNames, callback, preOld) {
  'use strict';
  if (isUdef(callback)) {
    return;
  }
  var _this = this;
  preOld = preOld || false;
  _this.log({
    event: 'on',
    callback: callback,
    ref: ref,
    eventNames: eventNames,
    preOld: preOld
  });

  eventNames.split(/\s*,\s*/).forEach(function (eventName) {
    eventName = eventName.trim();
    _this.pushListener(ref, eventName, callback, preOld);
  });
};

Events.prototype.once = function (ref, eventNames, callback, preOld) {
  'use strict';
  this.unbind(eventNames, callback);
  this.on(ref, eventNames, callback, preOld);
};

Events.prototype.removeListener = function (eventName, callback, prepost) {
  'use strict';
  var _this = this;
  if (isUdef(_this.listeners[eventName])) {
    return;
  }
  var listeners = _this.listeners[eventName][prepost];
  for (var i = 0; i < listeners.length; i++) {
    if (listeners[i].callback === callback) {
      listeners.splice(i, 1);
      i -= 1;
    }
  }
};

Events.prototype.removePreOldListener = function (eventName, callback) {
  'use strict';
  this.removeListener(eventName, callback, 'preOld');
};

Events.prototype.removePostOldListener = function (eventName, callback) {
  'use strict';
  this.removeListener(eventName, callback, 'postOld');
};

Events.prototype.unbind = function (eventNames, callback) {
  'use strict';
  var _this = this;
  if (isUdef(callback)) {
    return;
  }

  _this.log({
    event: 'unbind',
    callback: callback,
    eventNames: eventNames
  });

  eventNames.split(/\s*,\s*/).forEach(function (eventName) {
    _this.removePreOldListener(eventName, callback);
    _this.removePostOldListener(eventName, callback);
  });
};

Events.prototype.copyPreOldListeners = function (eventName) {
  'use strict';
  return [].concat(this.listeners[eventName].preOld);
};

Events.prototype.copyPostOldListeners = function (eventName) {
  'use strict';
  return [].concat(this.listeners[eventName].postOld);
};

Events.prototype.copyListeners = function (eventName, preOldFlag) {
  'use strict';
  if (preOldFlag) {
    return this.copyPreOldListeners(eventName);
  } else {
    return this.copyPostOldListeners(eventName);
  }
};

Events.prototype.fire = function (eventName, parameters, preOld) {
  'use strict';
  var _this = this;
  preOld = preOld || false;

  //Don't record every single keystroke
  //and PageMessages from youtube and others
  if (eventName !== 'PageMessage' && !eventName.startsWith('Input')) {
    _this.log({
      event: 'fire',
      eventName: eventName,
      preOld: preOld,
      parameters: parameters
    });
  }

  if (isUdef(_this.listeners[eventName])) {
    return;
  }

  //make a copy of the listeners since some handlers
  //could remove listeners, changing the array while iterating over it
  _this.copyListeners(eventName, preOld).forEach(function (listener) {
    try {
      listener.callback.apply(listener.ref, parameters);
    } catch (err) {
      _this.log({
        callback: listener.callback,
        ref: listener.ref,
        eventName: eventName,
        type: 'error',
        event: 'fire',
        err: err
      });
    }
  });
};
