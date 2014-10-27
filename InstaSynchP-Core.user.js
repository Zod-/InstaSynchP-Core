// ==UserScript==
// @name        InstaSynchP Core
// @namespace   InstaSynchP
// @description Base to load all the Plugins, also includes some mandatory plugins

// @version     1.1.1
// @author      Zod-
// @source      https://github.com/Zod-/InstaSynchP-Core
// @license     MIT

// @include     http://*.instasynch.com/*
// @include     http://instasynch.com/*
// @include     http://*.instasync.com/*
// @include     http://instasync.com/*
// @grant       none
// @run-at      document-end

// @require     https://greasyfork.org/scripts/2855-gm-config/code/GM_config.js
// @require     https://greasyfork.org/scripts/2859-video-url-parser/code/Video%20Url%20Parser.js

// @require     https://greasyfork.org/scripts/5647-instasynchp-library/code/InstaSynchP%20Library.js
// @require     https://greasyfork.org/scripts/5718-instasynchp-cssloader/code/InstaSynchP%20CSSLoader.js
// @require     https://greasyfork.org/scripts/5719-instasynchp-settings/code/InstaSynchP%20Settings.js

// @require     https://greasyfork.org/scripts/2857-jquery-bind-first/code/jquerybind-first.js
// @require     https://greasyfork.org/scripts/5651-instasynchp-event-hooks/code/InstaSynchP%20Event%20Hooks.js

// @require     https://greasyfork.org/scripts/2858-jquery-fullscreen/code/jqueryfullscreen.js
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
                var arr = eventNames.split(','),
                    eventName,
                    i;
                for (i = 0; i < arr.length; i += 1) {
                    eventName = arr[i].trim();
                    if (th.listeners[eventName] === undefined) {
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
                var arr = eventNames.split(','),
                    eventName,
                    i, j;
                for (i = 0; i < arr.length; i += 1) {
                    eventName = arr[i].trim();
                    //search all occurences of callback and remove it
                    if (th.listeners[eventName] !== undefined) {
                        for (j = 0; j < th.listeners[eventName].preOld.length; j += 1) {
                            if (th.listeners[eventName].preOld[j].callback === callback) {
                                th.listeners[eventName].preOld.splice(j, 1);
                                j -= 1;
                            }
                        }
                        for (j = 0; j < th.listeners[eventName].postOld.length; j += 1) {
                            if (th.listeners[eventName].postOld[j].callback === callback) {
                                th.listeners[eventName].postOld.splice(j, 1);
                                j -= 1;
                            }
                        }
                    }
                }
            },
            //fire the event with the given parameters
            'fire': function (eventName, parameters, preOld) {
                var i,
                    listenersCopy;
                if (th.listeners[eventName] === undefined) {
                    return;
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
                        window.console.log(
                            ("Error: {0}, eventName {1}, function {2} %s %s %o, " +
                                "please check the console " +
                                "and make a pastebin of everything in there").format(
                                err.message, eventName, listenersCopy[i].callback.name),
                            listenersCopy[i].callback, err.stack, err);
                    }
                }
            }
        };
    }());
};

Core.prototype.resetVariables = function () {
    "use strict";
    this.connected = false;
};

Core.prototype.main = function () {
    "use strict";
    var th = this;
    th.executeOnceCore();
    events.on(window.plugins.cssLoader, 'ExecuteOnce', window.plugins.cssLoader.executeOnceCore);
    events.on(window.plugins.settings, 'ExecuteOnce', window.plugins.settings.executeOnceCore);
    events.on(th, 'PreConnect,Disconnect', function () {
        events.fire('ResetVariables');
    });
    //prepare plugins
    for (var pluginName in window.plugins) {
        if (window.plugins.hasOwnProperty(pluginName)) {
            var plugin = window.plugins[pluginName];
            if (plugin.preConnect) {
                events.on(plugin, 'PreConnect', plugin.preConnect);
            }
            if (plugin.postConnect) {
                events.on(plugin, 'PostConnect', plugin.postConnect);
            }
            if (plugin.executeOnce) {
                events.on(plugin, 'ExecuteOnce', plugin.executeOnce);
            }
            if (plugin.resetVariables) {
                events.on(plugin, 'ResetVariables', plugin.resetVariables);
            }
            if (Object.prototype.toString.call(plugin.settings) === '[object Array]') {
                window.plugins.settings.fields = window.plugins.settings.fields.concat(plugin.settings);
            }
        }
    }

    function load() {
            //reset variables
            events.fire('ResetVariables');
            //we are not connected yet
            events.fire('PreConnect');
            //these need to be executed last

            //if the script was loading slow and we are already connected
            if (window.userInfo) {
                th.connected = true;
                events.fire('PostConnect');
            }
        }
        //these need to be executed last
    events.on(window.plugins.eventHooks, 'ExecuteOnce', window.plugins.eventHooks.executeOnceCore);
    events.once(th, 'Userlist', function () {
        th.connected = true;
        events.fire('PostConnect');
    });
    //execute one time only scripts
    events.fire('ExecuteOnce');
    //load the scripts
    if (global.page.name !== 'index') {
        load();
    }
    //reload the scripts when changing a room
    events.on(th, 'LoadRoom', load);
};

window.plugins = window.plugins || {};
window.plugins.core = new Core('1.1.1');
window.addEventListener('load', function () {
    window.plugins.core.main();
}, false);
