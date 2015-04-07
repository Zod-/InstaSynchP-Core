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

Core.prototype.createPluginsButton = function () {
  'use strict';
  var clone = $('#user_dropdown').clone();
  clone.attr('id', 'plugin_dropdown');
  $('a', clone).attr('href', '#').attr('onClick', '');
  $('.fa-user', clone).toggleClass('fa-user').toggleClass('fa-plug').before(
    $('#tabs_chat > a > span').clone().toggleClass('updates')
  );
  $('#my_room_link', clone).parent().remove();
  $('#logged_in_as', clone)
    .attr('id', 'plugins_settings_title').text('Plugins');
  $('.dropdown-menu > li:first-child > a', clone)
    .attr('id', 'plugin_settings');
  $('#logout', clone).attr('id', 'plugin_manager').text('').append(
    $('#tabs_chat > a > span').clone().toggleClass('updates')
  ).append(
    $('<i>', {
      'class': 'fa fa-database'
    })
  ).append(' Manager');
  $('.fa-cog', clone).toggleClass('fa-cogs').toggleClass('fa-cog');
  $('#user_dropdown').before(clone);
  $('#plugin_dropdown').show();
};

Core.prototype.executeOnceCore = function () {
  'use strict';
  var _this = this;
  window.events = new _this.Events();
  _this.createPluginsButton();
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
  plugins.commands.executeOnceCore();
  plugins.pluginManager.executeOnceCore();
  events.on(plugins.settings, 'ExecuteOnce', plugins.settings.executeOnceCore);
  events.on(_this, 'PreConnect, Disconnect', function () {
    events.fire('ResetVariables');
  });
};

Core.prototype.finishUpFramework = function () {
  'use strict';
  var _this = this;
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
      plugin: plugin
    });
    return;
  }

  _this.log({
    event: 'Found plugin',
    plugin: plugin
  });

  events.on(plugin, 'PreConnect', plugin.preConnect);
  events.on(plugin, 'PostConnect', plugin.postConnect);
  events.on(plugin, 'ExecuteOnce', plugin.executeOnce);
  events.on(plugin, 'ResetVariables', plugin.resetVariables);

  commands.bind(plugin.commands);

  //refactor these into the plugins later
  if (Array.isArray(plugin.settings)) {
    plugins.settings.fields = plugins.settings.fields.concat(plugin.settings);
  }

  if (Array.isArray(plugin.styles)) {
    plugin.styles.forEach(function (style) {
      plugins.settings.fields.push({
        'label': '',
        'id': style.name + '-css-content',
        'type': 'hidden',
        'value': '',
        'section': ['Core']
      });
      plugins.settings.fields.push({
        'label': '',
        'id': style.name + '-css-url',
        'type': 'hidden',
        'value': '',
        'section': ['Core']
      });
      events.on(plugins.cssLoader, 'ExecuteOnce', function () {
        plugins.cssLoader.addStyle(style);
      });
    });
  }
};

Core.prototype.preparePlugins = function () {
  'use strict';
  var _this = this;
  for (var pluginName in plugins) {
    if (plugins.hasOwnProperty(pluginName)) {
      _this.preparePlugin(plugins[pluginName]);
    }
  }
};

Core.prototype.fireConnect = function () {
  'use strict';
  var _this = this;
  events.fire('PreConnect');
  //if the script was loading slow and we are already connected
  if (thisUser()) {
    _this.onConnect();
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
  _this.fireExecuteOnce();
  _this.fireConnect();
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
} else {
  window.addEventListener('load', function () {
    'use strict';
    if (!window.plugins.core.isMainLoaded) {
      window.plugins.core.main();
    }
  }, false);
}
