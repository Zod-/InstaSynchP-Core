// ==UserScript==
// @name        InstaSynchP Core
// @namespace   InstaSynchP
// @description Base to load all the Plugins, also includes some mandatory plugins

// @version     1
// @author      Zod-
// @source      https://github.com/Zod-/InstaSynchP-Core
// @license     GPL-3.0

// @include     http://*.instasynch.com/*
// @include     http://instasynch.com/*
// @include     http://*.instasync.com/*
// @include     http://instasync.com/*
// @grant       none
// @run-at      document-end

// @require     https://greasyfork.org/scripts/2855-gm-config/code/GM_config.js
// @require     https://greasyfork.org/scripts/2859-video-url-parser/code/Video%20Url%20Parser.js
// @require     https://greasyfork.org/scripts/5647-instasynchp-library/code/InstaSynchP%20Library.js
// @require     https://greasyfork.org/scripts/2857-jquery-bind-first/code/jquerybind-first.js /* for Event Hooks */
// @require     https://greasyfork.org/scripts/5651-instasynchp-event-hooks/code/InstaSynchP%20Event%20Hooks.js
// ==/UserScript==

window.events = (function () {
    "use strict";
    var listeners = {};

    return {
        //bind event handlers
        'on': function (eventName, callback, preOld) {
            eventName = eventName.trim();
            if (listeners[eventName] === undefined) {
                listeners[eventName] = {
                    'preOld': [],
                    'postOld': []
                };
            }
            //execute it before are after the overwritten function
            if (preOld) {
                listeners[eventName].preOld.push({
                    callback: callback
                });
            } else {
                listeners[eventName].postOld.push({
                    callback: callback
                });
            }
        },
        //bind event handler and remove any previous once
        'once': function (eventName, callback, preOld) {
            this.unbind(eventName, callback);
            this.on(eventName, callback, preOld);
        },
        //unbind event handlers
        'unbind': function (eventName, callback) {
            var i;
            //search all occurences of callback and remove it
            if (listeners[eventName] !== undefined) {
                for (i = 0; i < listeners[eventName].preOld.length; i += 1) {
                    if (listeners[eventName].preOld[i].callback === callback) {
                        listeners[eventName].preOld.splice(i, 1);
                        i -= 1;
                    }
                }
                for (i = 0; i < listeners[eventName].postOld.length; i += 1) {
                    if (listeners[eventName].postOld[i].callback === callback) {
                        listeners[eventName].postOld.splice(i, 1);
                        i -= 1;
                    }
                }
            }
        },
        //fire the event with the given parameters
        'fire': function (eventName, parameters, preOld) {
            window.console.log(eventName);
            var i,
                listenersCopy;
            if (listeners[eventName] === undefined) {
                return;
            }
            //make a copy of the listener list since some handlers
            //could remove listeners changing the length of the array
            //while iterating over it
            if (preOld) {
                listenersCopy = [].concat(listeners[eventName].preOld);
            } else {
                listenersCopy = [].concat(listeners[eventName].postOld);
            }
            //fire the events and catch possible errors
            for (i = 0; i < listenersCopy.length; i += 1) {
                try {
                    listenersCopy[i].callback.apply(this, parameters);
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

window.addEventListener('load', function () {
    "use strict";
    //prepare plugins
    for (var pluginName in window.plugins) {
        if (window.plugins.hasOwnProperty(pluginName)) {
            var plugin = window.plugins[pluginName];
            if (plugin.preConnect) {
                events.on('PreConnect', plugin.preConnect);
            }
            if (plugin.postConnect) {
                events.on('PostConnect', plugin.postConnect);
            }
            if (plugin.executeOnce) {
                events.on('ExecuteOnce', plugin.executeOnce);
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
                events.fire('PostConnect');
            }
        }
        //these need to be executed last
    events.on('ExecuteOnce', window.plugins.eventBase.executeOnceCore);
    events.once('Userlist', function () {
        events.fire('PostConnect');
    });
    //execute one time only scripts
    events.fire('ExecuteOnce');
    //load the scripts
    load();
    //reload the scripts when changing a room
    events.on('LoadRoom', load);

}, false);
