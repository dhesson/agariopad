# Project Overview
This project is an attempt to get gamepads to work while playing [agar.io].  Soon I will test and document Windows 7 support for the Xbox One controller.

#### Script info
This script supports the start button and will start a fresh game if you've died or are just beginning (by closing stats screen and clicking play again).  There is a user name is at the top of the script that this functionality will use.  Change it to whatever username you desire.

# Supported Gamepads
- Xbox One (Wired)

# Supported Browsers
- Firefox

## To use with a Mac (OSX)
You'll definitely need Xbox controller drivers for your system.  Head over to this repo for the [controller driver] if you don't already have it.

# Setup Instructions
I'm currently working on Chrome support.  The code that is written should be cross browser, but the gamepad button press states are not reflecting properly.

#### Firefox
- Install [Greasemonkey] extension for FireFox.
- Copy the script from 
- Click Greasemonkey button -> Add New Script
- Click 'User Script From Clipboard'

#### Chrome
- Currently not supported

#### Upcoming Changes/Feature Support
- Verify Xbox 360 controller works (wired)
- Add support for PS3 controller
- Figure out whats wrong with Chrome (driver or browser issue?  try canary version)
- Vibrate controller when you eat other cells
- Vibrate controller when you die
- Verify Start button works for users signed in with Facebook

[agar.io]: http://agar.io
[controller driver]: https://goo.gl/y2Iu0X
[Greasemonkey]: https://addons.mozilla.org/en-us/firefox/addon/greasemonkey/