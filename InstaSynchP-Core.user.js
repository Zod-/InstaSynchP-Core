// ==UserScript==
// @name        InstaSynchP Core
// @namespace   InstaSynchP
// @description The core for a modular plugin system for InstaSynch

// @version     1.3.4
// @author      Zod-
// @source      https://github.com/Zod-/InstaSynchP-Core
// @license     MIT

// @include     *://instasync.com/r/*
// @include     *://*.instasync.com/r/*
// @grant       none
// @run-at      document-end

// @require     https://greasyfork.org/scripts/2859-video-url-parser/code/Video%20Url%20Parser.js?version=30624
// @require     https://greasyfork.org/scripts/2855-gm-config/code/GM_config.js?version=33973
// @require     https://greasyfork.org/scripts/2857-jquery-bind-first/code/jquerybind-first.js?version=26080
// @require     https://greasyfork.org/scripts/8159-log4javascript/code/log4javascript.js?version=37575

// @require     https://greasyfork.org/scripts/5647-instasynchp-library/code/code.js?version=37716
// @require     https://greasyfork.org/scripts/8177-instasynchp-logger/code/code.js?version=37870
// @require     https://greasyfork.org/scripts/6573-instasynchp-plugin-manager/code/code.js?version=37765
// @require     https://greasyfork.org/scripts/5718-instasynchp-cssloader/code/code.js?version=37736
// @require     https://greasyfork.org/scripts/5719-instasynchp-settings/code/code.js?version=37737
// @require     https://greasyfork.org/scripts/6332-instasynchp-commands/code/code.js?version=37738
// @require     https://greasyfork.org/scripts/5651-instasynchp-event-hooks/code/code.js?version=37739
// ==/UserScript==

function Core(version) {
  "use strict";
  this.version = version;
  this.name = 'InstaSynchP Core';
  this.listeners = {};
  this.connected = false;
}

Core.prototype.executeOnceCore = function () {
  "use strict";
  var th = this;
  window.events = (function () {
    return {
      //bind event handlers
      'on': function (ref, eventNames, callback, preOld) {
        if (typeof callback === 'undefined') {
          return;
        }
        logger().debug(th.name, "On", eventNames, !isUdef(callback) ? callback.name : undefined,
          "preOld", preOld, !isUdef(ref) ? ref.name : undefined);

        var arr = eventNames.split(','),
          eventName,
          i;
        for (i = 0; i < arr.length; i += 1) {
          eventName = arr[i].trim();
          if (typeof th.listeners[eventName] === 'undefined') {
            th.listeners[eventName] = {
              'preOld': [],
              'postOld': []
            };
          }
          //execute it before are after the overwritten function
          if (preOld) {
            th.listeners[eventName].preOld.push({
              ref: ref,
              callback: callback
            });
          } else {
            th.listeners[eventName].postOld.push({
              ref: ref,
              callback: callback
            });
          }
        }
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
        logger().debug(th.name, "Unbind", eventNames, callback.name);
        var arr = eventNames.split(','),
          i, temp;

        //search all occurences of callback and remove it
        function removeCallback(eventName, old) {
          if (typeof th.listeners[eventName] === 'undefined') {
            return;
          }
          for (var j = 0; j < th.listeners[eventName][old].length; j += 1) {
            if (th.listeners[eventName][old][j].callback === callback) {
              th.listeners[eventName][old].splice(j, 1);
              j -= 1;
            }
          }
        }
        for (i = 0; i < arr.length; i += 1) {
          temp = arr[i].trim();
          removeCallback(temp, 'preOld');
          removeCallback(temp, 'postOld');
        }
      },
      //fire the event with the given parameters
      'fire': function (eventName, parameters, preOld) {
        var i,
          listenersCopy;
        if (typeof th.listeners[eventName] === 'undefined') {
          return;
        }

        if (eventName !== 'PageMessage' && !eventName.startsWith('Input')) {
          try {
            logger().debug(th.name, "Fire", eventName, "preOld", preOld, JSON.stringify(parameters));
          } catch (ignore) {
            logger().debug(th.name, "Fire", eventName, "preOld", preOld, parameters);
          }
        }

        //make a copy of the listener list since some handlers
        //could remove listeners changing the length of the array
        //while iterating over it
        if (preOld) {
          listenersCopy = [].concat(th.listeners[eventName].preOld);
        } else {
          listenersCopy = [].concat(th.listeners[eventName].postOld);
        }
        //fire the events and catch possible errors
        for (i = 0; i < listenersCopy.length; i += 1) {
          try {
            listenersCopy[i].callback.apply(listenersCopy[i].ref, parameters);
          } catch (err) {
            logger().error(th.name, eventName, err.message,
              listenersCopy[i].callback.name,
              listenersCopy[i].ref ? listenersCopy[i].ref.name : undefined,
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
    $('#tabs_chat > a > span').clone().css('margin-right', '2px').toggleClass('updates')
    .css('animation', 'unread-msg-count 3s infinite')
    .css('-webkit-animation', 'unread-msg-count 3s infinite')
    .css('-moz-animation', 'unread-msg-count 3s infinite')
    .css('border-radius', '4px')
  );
  $('#my_room_link', clone).parent().remove();
  $('#logged_in_as', clone).attr('id', 'plugins_settings_title').text('Plugins');
  $('.dropdown-menu > li:first-child > a', clone).attr('id', 'plugin_settings');
  $('#logout', clone).attr('id', 'plugin_manager').text('').append(
    $('#tabs_chat > a > span').clone().css('margin-right', '3px').toggleClass('updates')
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
  "use strict";
  var th = this;
  $('#plugin_dropdown').css('display', 'initial');
};

Core.prototype.resetVariables = function () {
  "use strict";
  this.connected = false;
  window.userInfo = undefined;
};

Core.prototype.main = function () {
  "use strict";
  var th = this,
    plugins = window.plugins;
  th.executeOnceCore();
  plugins.logger.executeOnceCore();
  plugins.commands.executeOnceCore();
  plugins.pluginManager.executeOnceCore();
  events.on(plugins.cssLoader, 'ExecuteOnce', plugins.cssLoader.executeOnceCore);
  events.on(plugins.settings, 'ExecuteOnce', plugins.settings.executeOnceCore);
  events.on(th, 'PreConnect,Disconnect', function () {
    events.fire('ResetVariables');
  });
  //prepare plugins
  for (var pluginName in plugins) {
    if (!plugins.hasOwnProperty(pluginName)) {
      continue;
    }
    var plugin = plugins[pluginName];
    if (!plugin.enabled) {
      logger().info(th.name, "Skipping disabled plugin", plugin.name, plugin.version);
      continue;
    }
    logger().info(th.name, "Found plugin", plugin.name, plugin.version);
    events.on(plugin, 'PreConnect', plugin.preConnect);
    events.on(plugin, 'PostConnect', plugin.postConnect);
    events.on(plugin, 'ExecuteOnce', plugin.executeOnce);
    events.on(plugin, 'ResetVariables', plugin.resetVariables);
    commands.bind(plugin.commands);
    if (Object.prototype.toString.call(plugin.settings) === '[object Array]') {
      plugins.settings.fields = plugins.settings.fields.concat(plugin.settings);
    }
  }

  function load() {
      //we are not connected yet
      events.fire('PreConnect');
      //if the script was loading slow and we are already connected
      if (window.userInfo) {
        th.connected = true;
        events.fire('PostConnect');
      }
    }
    //these need to be executed last
  events.on(plugins.eventHooks, 'ExecuteOnce', plugins.eventHooks.executeOnceCore);
  events.on(th, 'LoadUserlist', function () {
    th.connected = true;
    events.fire('PostConnect');
  });
  //execute one time only scripts
  events.fire('ExecuteOnce');

  load();
};

window.plugins = window.plugins || {};
window.plugins.core = new Core('1.3.4');
if (window.document.readyState === 'complete') {
  window.plugins.core.main();
} else {
  window.addEventListener('load', function () {
    window.plugins.core.main();
  }, false);
}
