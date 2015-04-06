function Core() {
  'use strict';
  this.version = '@VERSION@';
  this.name = 'InstaSynchP Core';
  this.connected = false;
  this.Events = Events;
}

Core.prototype.createPluginsButton = function () {
  'use strict';
  var clone = $('#user_dropdown').clone();
  clone.attr('id', 'plugin_dropdown');
  $('a', clone).attr('href', '#').attr('onClick', '');
  $('.fa-user', clone).toggleClass('fa-user').toggleClass('fa-plug').before(
    $('#tabs_chat > a > span').clone().css('margin-right', '2px').toggleClass(
      'updates')
    .css('animation', 'unread-msg-count 3s infinite')
    .css('-webkit-animation', 'unread-msg-count 3s infinite')
    .css('-moz-animation', 'unread-msg-count 3s infinite')
    .css('border-radius', '4px')
  );
  $('#my_room_link', clone).parent().remove();
  $('#logged_in_as', clone).attr('id', 'plugins_settings_title').text(
    'Plugins');
  $('.dropdown-menu > li:first-child > a', clone).attr('id',
    'plugin_settings');
  $('#logout', clone).attr('id', 'plugin_manager').text('').append(
    $('#tabs_chat > a > span').clone().css('margin-right', '3px').toggleClass(
      'updates')
    .css('animation', 'unread-msg-count 3s infinite')
    .css('-webkit-animation', 'unread-msg-count 3s infinite')
    .css('-moz-animation', 'unread-msg-count 3s infinite')
    .css('border-radius', '4px')
  ).append(
    $('<i>', {
      'class': 'fa fa-database'
    })
  ).append(' Manager');
  $('.fa-cog', clone).toggleClass('fa-cogs').toggleClass('fa-cog');
  $('#user_dropdown').before(clone);
};

Core.prototype.executeOnceCore = function () {
  'use strict';
  var _this = this;
  window.events = new _this.Events();
  _this.createPluginsButton();
};

Core.prototype.postConnect = function () {
  'use strict';
  $('#plugin_dropdown').css('display', 'initial');
};

Core.prototype.resetVariables = function () {
  'use strict';
  this.connected = false;
  window.userInfo = undefined;
};

Core.prototype.main = function () {
  'use strict';
  if (window.instaSynchP.mainLoaded) {
    return;
  }
  var _this = this;
  var plugins = window.plugins;
  window.instaSynchP.mainLoaded = true;
  _this.executeOnceCore();
  plugins.logger.executeOnceCore();
  plugins.commands.executeOnceCore();
  //don't want to have ask if its firefox or chrome everytime
  logger().info(_this.name, navigator.userAgent);
  plugins.pluginManager.executeOnceCore();
  events.on(plugins.settings, 'ExecuteOnce', plugins.settings.executeOnceCore);
  events.on(_this, 'PreConnect,Disconnect', function () {
    events.fire('ResetVariables');
  });

  function loadStyle(style) {
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
  }

  //prepare plugins
  for (var pluginName in plugins) {
    if (!plugins.hasOwnProperty(pluginName)) {
      continue;
    }
    var plugin = plugins[pluginName];
    if (!plugin.enabled) {
      logger().info(_this.name, 'Skipping disabled plugin', plugin.name,
        plugin.version);
      continue;
    }
    logger().info(_this.name, 'Found plugin', plugin.name, plugin.version);
    events.on(plugin, 'PreConnect', plugin.preConnect);
    events.on(plugin, 'PostConnect', plugin.postConnect);
    events.on(plugin, 'ExecuteOnce', plugin.executeOnce);
    events.on(plugin, 'ResetVariables', plugin.resetVariables);
    commands.bind(plugin.commands);
    if (Array.isArray(plugin.settings)) {
      plugins.settings.fields = plugins.settings.fields.concat(plugin.settings);
    }
    if (Array.isArray(plugin.styles)) {
      plugin.styles.forEach(loadStyle);
    }
  }

  function load() {
      //we are not connected yet
      events.fire('PreConnect');
      //if the script was loading slow and we are already connected
      if (window.userInfo) {
        _this.connected = true;
        events.fire('PostConnect');
      }
    }
    //these need to be executed last
  events.on(plugins.eventHooks, 'ExecuteOnce',
    plugins.eventHooks.executeOnceCore);
  events.on(_this, 'LoadUserlist', function () {
    _this.connected = true;
    events.fire('PostConnect');
  });

  //execute one time only scripts
  events.fire('ExecuteOnce');

  load();
};

window.plugins = window.plugins || {};
window.instaSynchP = window.instaSynchP || {};
window.plugins.core = new Core();
if (window.document.readyState === 'complete') {
  window.plugins.core.main();
} else {
  window.addEventListener('load', function () {
    'use strict';
    window.plugins.core.main();
  }, false);
}
