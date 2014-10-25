InstaSynchP-Core
================

Base to load all the Plugins, also includes some mandatory plugins

Includes
--------
* [InstaSynchP Library](https://greasyfork.org/de/scripts/5647-instasynchp-library)
* [InstaSynchP CSSLoader](https://greasyfork.org/en/scripts/5718-instasynchp-cssloader)
* [InstaSynchP Settings](https://greasyfork.org/en/scripts/5719-instasynchp-settings)
* [InstaSynchP Event Hooks](https://greasyfork.org/en/scripts/5651-instasynchp-event-hooks)

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

Settings
-----------
The core will look for settings in 'plugin.setting'<br>
See  [InstaSynchP Settings](https://greasyfork.org/en/scripts/5719-instasynchp-settings)

CSSLoader
-----------
See  [InstaSynchP CSSLoader](https://greasyfork.org/en/scripts/5718-instasynchp-cssloader)

License
-----------
<InstaSynch - Watch Videos with friends.>
Copyright (C) 2013  InstaSynch

<Bibbytube - Modified InstaSynch client code>
Copyright (C) 2014  Zod-

This program is free software: you can redistribute it and/or modify
it under the terms of the GNU General Public License as published by
the Free Software Foundation, either version 3 of the License, or
(at your option) any later version.

This program is distributed in the hope that it will be useful,
but WITHOUT ANY WARRANTY; without even the implied warranty of
MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
GNU General Public License for more details.

You should have received a copy of the GNU General Public License
along with this program.  If not, see <http://www.gnu.org/licenses/>.

http://opensource.org/licenses/GPL-3.0
