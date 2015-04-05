// ==UserScript==
// @name         InstaSynchP Core
// @namespace    InstaSynchP
// @description  The core for a modular plugin system for InstaSync
// @version      1.4.3
// @author       Zod-
// @source       https://github.com/Zod-/InstaSynchP-Core
// @license      MIT
// @require      https://greasyfork.org/scripts/2859-video-url-parser/code/code.js?version=30624
// @require      https://greasyfork.org/scripts/2855-gm-config/code/code.js?version=33973
// @require      https://greasyfork.org/scripts/2857-jquery-bind-first/code/code.js?version=26080
// @require      https://greasyfork.org/scripts/8159-log4javascript/code/code.js?version=37575
// @require      https://greasyfork.org/scripts/5647-instasynchp-library/code/code.js?version=37716
// @require      https://greasyfork.org/scripts/8177-instasynchp-logger/code/code.js?version=37872
// @require      https://greasyfork.org/scripts/6573-instasynchp-plugin-manager/code/code.js?version=42665
// @require      https://greasyfork.org/scripts/5718-instasynchp-cssloader/code/code.js?version=43457
// @require      https://greasyfork.org/scripts/5719-instasynchp-settings/code/code.js?version=42666
// @require      https://greasyfork.org/scripts/6332-instasynchp-commands/code/code.js?version=37738
// @require      https://greasyfork.org/scripts/5651-instasynchp-event-hooks/code/code.js?version=38337
// @include      *://instasync.com/r/*
// @include      *://*.instasync.com/r/*
// @grant        none
// @run-at       document-end
// ==/UserScript==

function Core() {
  'use strict';
  this.version = '1.4.3';
  this.name = 'InstaSynchP Core';
  this.listeners = {};
  this.connected = false;
}

Core.prototype.executeOnceCore = function () {
  'use strict';
  var _this = this;
  window.events = (function () {
    return {
      //bind event handlers
      'on': function (ref, eventNames, callback, preOld) {
        if (typeof callback === 'undefined') {
          return;
        }
        logger().debug(_this.name, "On", eventNames, !isUdef(callback) ?
          callback.name : undefined,
          "preOld", preOld, !isUdef(ref) ? ref.name : undefined);

        eventNames.split(',').forEach(function (eventName) {
          eventName = eventName.trim();
          if (typeof _this.listeners[eventName] === 'undefined') {
            _this.listeners[eventName] = {
              'preOld': [],
              'postOld': []
            };
          }
          //execute it before are after the overwritten function
          if (preOld) {
            _this.listeners[eventName].preOld.push({
              ref: ref,
              callback: callback
            });
          } else {
            _this.listeners[eventName].postOld.push({
              ref: ref,
              callback: callback
            });
          }
        });
      },
      //bind event handler and remove any previous once
      'once': function (ref, eventNames, callback, preOld) {
        this.unbind(eventNames, callback);
        this.on(ref, eventNames, callback, preOld);
      },
      //unbind event handlers
      'unbind': function (eventNames, callback) {
        if (isUdef(callback)) {
          return;
        }
        logger().debug(_this.name, "Unbind", eventNames, callback.name);

        //search all occurences of callback and remove it
        function removeCallback(eventName, old) {
          if (typeof _this.listeners[eventName] === 'undefined') {
            return;
          }
          for (var j = 0; j < _this.listeners[eventName][old].length; j +=
            1) {
            if (_this.listeners[eventName][old][j].callback ===
              callback) {
              _this.listeners[eventName][old].splice(j, 1);
              j -= 1;
            }
          }
        }
        eventNames.split(',').forEach(function (eventName) {
          eventName = eventName.trim();
          removeCallback(eventName, 'preOld');
          removeCallback(eventName, 'postOld');
        });
      },
      //fire the event with the given parameters
      'fire': function (eventName, parameters, preOld) {
        var listenersCopy;

        if (eventName !== 'PageMessage' && !eventName.startsWith(
            'Input')) {
          try {
            logger().debug(_this.name, "Fire", eventName, "preOld",
              preOld,
              JSON.stringify(parameters));
          } catch (ignore) {
            logger().debug(_this.name, "Fire", eventName, "preOld",
              preOld,
              parameters);
          }
        }

        if (typeof _this.listeners[eventName] === 'undefined') {
          return;
        }

        //make a copy of the listener list since some handlers
        //could remove listeners changing the length of the array
        //while iterating over it
        if (preOld) {
          listenersCopy = [].concat(_this.listeners[eventName].preOld);
        } else {
          listenersCopy = [].concat(_this.listeners[eventName].postOld);
        }
        //fire the events and catch possible errors
        for (var i = 0; i < listenersCopy.length; i += 1) {
          try {
            listenersCopy[i].callback.apply(listenersCopy[i].ref,
              parameters);
          } catch (err) {
            logger().error(_this.name, eventName, err.message,
              listenersCopy[i].callback.name,
              listenersCopy[i].ref ? listenersCopy[i].ref.name :
              undefined,
              err.stack
            );
          }
        }
      }
    };
  }());

  //create Plugins button
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
      logger().info(_this.name, "Skipping disabled plugin", plugin.name,
        plugin.version);
      continue;
    }
    logger().info(_this.name, "Found plugin", plugin.name, plugin.version);
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
  events.on(plugins.eventHooks, 'ExecuteOnce', plugins.eventHooks.executeOnceCore);
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
    window.plugins.core.main();
  }, false);
}
