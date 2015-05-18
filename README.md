InstaSynchP-Core [![Build Status](https://travis-ci.org/Zod-/InstaSynchP-Core.svg)](https://travis-ci.org/Zod-/InstaSynchP-Core)
================

The core for a modular plugin system for InstaSynch.
Simply install other plugins through the plugin manager (Plugins button) at the top of the page or from [greasyfork](https://greasyfork.org/en/scripts?set=707).

Includes
--------
* [InstaSynchP Library](https://greasyfork.org/de/scripts/5647-instasynchp-library)
* [InstaSynchP CSSLoader](https://greasyfork.org/en/scripts/5718-instasynchp-cssloader)
* [InstaSynchP Settings](https://greasyfork.org/en/scripts/5719-instasynchp-settings)
* [InstaSynchP Event Hooks](https://greasyfork.org/en/scripts/5651-instasynchp-event-hooks)
* [InstaSynchP Commands](https://greasyfork.org/en/scripts/6332-instasynchp-commands)
* [InstaSynchP Logger](https://greasyfork.org/scripts/8177-instasynchp-logger)

Framework
---------
Everything is based on events that plugins can listen to for the information they need.
Plugins should run at document-start so they can put themself into the `window.plugins` object before the core loads.

When the document has loaded the core will automatically look and bind some functions in the plugins

* executeOnce: Execute this code only once
* preConnect: Execute this everytime a room gets loaded
* postConnect: Same as preConnect but after the connection has been established
* resetVariables: When getting reconnected or loading a new room variables can be reset here.

Events can be bound or fired using the `events` object
#### `events.on`
```javascript
events.on(this, 'Event1,Event2', callbackFunction, true/false)
```
* reference to this object
* name of the events (split by ,)
* callback function
* true/false for before or after the old function (e.g. before or after message get's parsed in addMessage)

#### `events.unbind`
```javascript
events.unbind('Event1,Event2', callbackFunction)
```
* name of the events (split by ,)
* callback function

#### `events.once`
```javascript
events.once(this, 'Event1,Event2', callbackFunction, true/false)
```
* same as .on but uses .unbind first

#### `events.fire`
```javascript
events.fire('EventName', [arg1, arg2], true/false)
```
* name of the event
* array of arguments
* true/false for before or after the old function


Loading priorities soon

Public Variables
---------
Public variables can be accessed through `window.plugins.plugin.variable`:

* `core.listeners` all the listeners bound in `events`

* `core.connected` are we connected to the room?

Events
-----------
See  [InstaSynchP Event Hooks](https://greasyfork.org/en/scripts/5651-instasynchp-event-hooks)

Commands
-----------
The core will look for commands in `plugin.commands`<br>
See  [InstaSynchP Commands](https://greasyfork.org/en/scripts/6332-instasynchp-commands)

Settings
-----------
The core will look for settings in `plugin.settings`<br>
See  [InstaSynchP Settings](https://greasyfork.org/en/scripts/5719-instasynchp-settings)

CSSLoader
-----------
The core will look for styles in `plugin.styles`<br>
See  [InstaSynchP CSSLoader](https://greasyfork.org/en/scripts/5718-instasynchp-cssloader)

License
-----------
The MIT License (MIT)<br>

&lt;InstaSynch - Watch Videos with friends.&gt;<br>
Copyright (c) 2014 InstaSynch

&lt;Bibbytube - Modified InstaSynch client code&gt;<br>
Copyright (C) 2014  Zod-

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.
