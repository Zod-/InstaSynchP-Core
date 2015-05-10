function Core() {
  'use strict';
  this.version = '@VERSION@';
  this.name = 'InstaSynchP Core';
  this.connected = false;
  this.Events = Events;
  this.styles = [{
    name: 'core',
    url: '@RAWGITREPO@/@CORECSSREV@/dist/core.css',
    autoload: true
  }];
  this.isMainLoaded = false;
}

Core.prototype.executeOnceCore = function () {
  'use strict';
  window.events = new this.Events();
};

Core.prototype.resetVariables = function () {
  'use strict';
  this.connected = false;
  window.room.user.userinfo = undefined;
};

Core.prototype.prepareFramework = function () {
  'use strict';
  var _this = this;
  _this.executeOnceCore();
  plugins.logger.executeOnceCore();
  _this.log({
    event: 'Prepare Framework'
  });
  plugins.commands.executeOnceCore();
  plugins.settings.executeOnceCore();
};

Core.prototype.finishUpFramework = function () {
  'use strict';
  var _this = this;
  _this.log({
    event: 'Finish up Framework'
  });
  events.on(plugins.eventHooks, 'ExecuteOnce',
    plugins.eventHooks.executeOnceCore);
  events.on(_this, 'LoadUserlist', _this.onConnect);
};

Core.prototype.log = function (opts) {
  'use strict';
  var args = [];
  opts.type = opts.type || 'debug';
  args.push(this.name);
  args.push(opts.event);
  if (opts.plugin) {
    args.push(opts.plugin.name);
    args.push(opts.plugin.version);
  }
  logger()[opts.type].apply(logger(), args);
};

Core.prototype.preparePlugin = function (plugin) {
  'use strict';
  var _this = this;
  if (!plugin.enabled) {
    _this.log({
      event: 'Skipping disabled plugin',
      type: 'info',
      plugin: plugin
    });
    return;
  }

  _this.log({
    event: 'Found plugin',
    type: 'info',
    plugin: plugin
  });

  events.on(plugin, 'PreConnect', plugin.preConnect);
  events.on(plugin, 'PostConnect', plugin.postConnect);
  events.on(plugin, 'ExecuteOnce', plugin.executeOnce);
  events.on(plugin, 'ResetVariables', plugin.resetVariables);

  commands.bind(plugin.commands);
};

Core.prototype.preparePlugins = function () {
  'use strict';
  var _this = this;
  _this.log({
    event: 'Prepare plugins'
  });
  for (var pluginName in plugins) {
    if (plugins.hasOwnProperty(pluginName)) {
      _this.preparePlugin(plugins[pluginName]);
    }
  }
};

Core.prototype.slowLoadingCompensate = function () {
  'use strict';
  this.connected = true;
  events.fire('Connected');
  events.fire('Joining');
  events.fire('Joined');
  window.room.playlist.load(window.room.playlist.videos);
  window.room.userlist.load(window.room.userlist.users);
  reloadPlayer();
};

Core.prototype.fireConnect = function () {
  'use strict';
  var _this = this;
  events.fire('PreConnect');
  if (thisUser()) {
    _this.log({
      event: 'Script was loading slowly'
    });
    _this.slowLoadingCompensate();
  }
};

Core.prototype.fireExecuteOnce = function () {
  'use strict';
  this.isMainLoaded = true;
  events.fire('ExecuteOnce');
};

Core.prototype.onConnect = function () {
  'use strict';
  this.connected = true;
  events.fire('PostConnect');
};

Core.prototype.executeOnce = function () {
  'use strict';
  logger().info(this.name, navigator.userAgent);
};

Core.prototype.start = function () {
  'use strict';
  var _this = this;
  _this.log({
    event: 'Start'
  });
  _this.fireExecuteOnce();
  _this.fireConnect();
  events.on(_this, 'PreConnect, Disconnect', function fireResetVariables() {
    events.fire('ResetVariables');
  });
};

Core.prototype.main = function () {
  'use strict';
  var _this = this;

  _this.prepareFramework();
  _this.preparePlugins();
  _this.finishUpFramework();

  _this.start();
};

window.plugins = window.plugins || {};
window.plugins.core = new Core();
if (window.document.readyState === 'complete') {
  window.plugins.core.main();
  window.plugins.core.log({
    event: 'Page was already loaded'
  });
} else {
  window.addEventListener('load', function () {
    'use strict';
    if (!window.plugins.core.isMainLoaded) {
      window.plugins.core.main();
    }
    window.plugins.core.log({
      event: 'Page load'
    });
  }, false);
}
