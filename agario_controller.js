// ==UserScript==
// @name         Agar.io Gamepad Script for Xbox One Controller
// @description  Thx reddit.  I rewrote most of it.
// @version      0.1
// @match        http://agar.io/
// @grant        none
// ==/UserScript==

/**
 * Set your player name here (or other game settings)
 */
var playerName = "TheWan";
var useDarkTheme = false;
var showMyMass = true;

/**
 * Controller impl
 */
var endPoint = {
    clientX: innerWidth / 2,
    clientY: innerHeight / 2
};
var holdMoveEvent = null;
var lastStickMag = 0;
var last_x = 0;
var last_y = 0;
var canvas = { simulateCanvasDown: function(){} };
var shouldDeject = false;
var stopSplitting = false;

var gamepadAPI = {
    controller: {},
    turbo: false,
    connect: function(evt) {
        gamepadAPI.controller = evt.gamepad;
        gamepadAPI.turbo = true;
        //console.log('Gamepad connected: ', gamepadAPI.controller);
    },
    disconnect: function(evt) {
        gamepadAPI.turbo = false;
        delete gamepadAPI.controller;
        //console.log('Gamepad disconnected.');
    },
    update: function() {
        // clear the buttons cache
        gamepadAPI.buttonsCache = [];
        // move the buttons status from the previous frame to the cache
        for (var k = 0; k < gamepadAPI.buttonsStatus.length; k++) {
            gamepadAPI.buttonsCache[k] = gamepadAPI.buttonsStatus[k];
        }
        // clear the buttons status
        gamepadAPI.buttonsStatus = [];
        // get the gamepad object
        var c = gamepadAPI.controller || {};

        // loop through buttons and push the pressed ones to the array
        var pressed = [];
        if (c.buttons) {
            var minSize = Math.min(c.buttons.length, gamepadAPI.buttons.length);
            for (var j = 0; j < minSize; j++) {
                if (c.buttons[j].pressed) {
                    pressed.push(gamepadAPI.buttons[j]);
                }
            }
        }
        // loop through axes and push their values to the array
        var axes = [];
        if (c.axes) {
            for (var a = 0, x = c.axes.length; a < x; a++) {
                axes.push(c.axes[a].toFixed(2));
            }
        }
        // assign received values
        gamepadAPI.axesStatus = axes;
        gamepadAPI.buttonsStatus = pressed;
        // return buttons for debugging purposes
        return pressed;
    },
    buttonPressed: function(button, hold) {
        var newPress = false;
        // loop through pressed buttons
        for (var i = 0, s = gamepadAPI.buttonsStatus.length; i < s; i++) {
            // if we found the button we're looking for...
            if (gamepadAPI.buttonsStatus[i] == button) {
                // set the boolean variable to true
                newPress = true;
                // if we want to check the single press
                if (!hold) {
                    // loop through the cached states from the previous frame
                    for (var j = 0, p = gamepadAPI.buttonsCache.length; j < p; j++) {
                        // if the button was already pressed, ignore new press
                        if (gamepadAPI.buttonsCache[j] == button) {
                            newPress = false;
                        }
                    }
                }
            }
        }
        return newPress;
    },
    buttons: [
        'DPad-Up', 'DPad-Down', 'DPad-Left', 'DPad-Right',
        'Start', 'Back', 'Axis-Left', 'Axis-Right',
        'LB', 'RB', 'Power', 'A', 'B', 'X', 'Y',
    ],
    buttonsCache: [],
    buttonsStatus: [],
    axesStatus: []
};

window.addEventListener("gamepadconnected", gamepadAPI.connect);
window.addEventListener("gamepaddisconnected", gamepadAPI.disconnect);

jQuery.fn.simulateKeyDown = function(character) {
    jQuery(this).trigger({
        type: 'keydown',
        keyCode: character
    });
};

jQuery.fn.simulateKeyUp = function(character) {
    jQuery(this).trigger({
        type: 'keyup',
        keyCode: character
    });
};

jQuery.fn.simulateCanvasDown = function(coords) {
    jQuery(this).trigger(jQuery.Event("mousedown", coords));
}

// Stop the default mouse move behavior.
// (function nullMouseMove(startTime) {
//     if (Date.now() - startTime > 5000) return;
//     if (!canvas.onmousemove) return setTimeout(nullMouseMove, 0, startTime);
//     holdMoveEvent = canvas.onmousemove;
//     canvas.onmousemove = null;
// })(Date.now());

function canGame() {
    return "getGamepads" in navigator;
}

function checkForGamepad() {
    var gamepadList = navigator.getGamepads();

    //console.log(gamepadList);

    for (var i = 0; i < gamepadList.length; i++) {
        var gamepad = gamepadList[i];

        if (gamepad !== undefined) {
            gamepadAPI.connect({
                gamepad: gamepad
            });
            break;
        }
    }
}

$(document).ready(function() {
    if (!canGame()) {
        console.log("Gamepad API not supported");
        return;
    }

    canvas = $("#canvas");    

    $(window).on('keydown', function(event) {
        if (event.repeat && event.type === "keydown") return;


        if (event.which == 82 && event.type === "keydown") {
            if (canvas.onmousemove == null) {
                canvas.onmousemove = holdMoveEvent;
            } else {
                canvas.onmousemove = null;
            }

            return;
        }
    });

    $(window).on('blur resize', function() {
        endPoint = {
            clientX: innerWidth / 2,
            clientY: innerHeight / 2
        };
        canvas.simulateCanvasDown(endPoint);
    });

    // Configure the game settings
    setShowMass(showMyMass);
    setDarkTheme(useDarkTheme);

    checkForGamepad();

    requestAnimationFrame(handleGamepadLoop);
});

function handleGamepadLoop() {
    setTimeout(handleGamepadLoop, 15);
    
    checkForGamepad();

    if (!gamepadAPI.turbo) {
        return;
    }

    //console.log(gamepadAPI.update());
    gamepadAPI.update();

    var gamepad = gamepadAPI.controller;

    var x_axis = gamepad.axes[0];
    var y_axis = gamepad.axes[1];
    var x_result = 0;
    var y_result = 0;

    var stickMag = Math.sqrt((x_axis * x_axis) + (y_axis * y_axis));

    if (stickMag >= 0.5) { // Our dead-zone.
        // Normalise and * 500
        x_result = (x_axis / stickMag) * 500;
        y_result = (y_axis / stickMag) * 500;
    } else if (lastStickMag >= 0.5) { // Stick has only just come off
        x_result = last_x / 8;
        y_result = last_y / 8;
    }

    last_x = x_result;
    last_y = y_result;
    lastStickMag = stickMag > 0.5 ? stickMag : 0;

    var mouseLoc = {
        clientX: endPoint.clientX,
        clientY: endPoint.clientY
    };
    mouseLoc.clientX += x_result;
    mouseLoc.clientY += y_result;
    canvas.simulateCanvasDown(mouseLoc);        

    // A to inject, X to split (eat)
    var shouldSplit = gamepadAPI.buttonPressed("X") || gamepadAPI.buttonPressed("DPad-Left");
    var shouldEject = gamepadAPI.buttonPressed("A") || gamepadAPI.buttonPressed("DPad-Up");

    if (shouldEject) {
        $(window).simulateKeyDown(87);
        shouldDeject = true;
    } else if (shouldDeject) {
        $(window).simulateKeyUp(87);
        shouldDeject = false;
    }

    if (shouldSplit) {
        $(window).simulateKeyDown(32);
        stopSplitting = true;
    } else if (stopSplitting) {
        $(window).simulateKeyUp(32);
        stopSplitting = false;
    }

    if (gamepadAPI.buttonPressed("Start") || gamepadAPI.buttonPressed("RB")) {
        console.log("Starting new game.");
        var statsContinue = $("#statsContinue");
        if (statsContinue) {
            statsContinue.trigger(jQuery.Event("click"));
            setNick(playerName || document.getElementById('nick').value);
        }
    }
};
