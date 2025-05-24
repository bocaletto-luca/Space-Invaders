// controller.js - Gestione degli input multi-controller
window.Controller = {
  keys: {},
  mouse: { down: false, x: 0, y: 0 },
  touch: { down: false, x: 0, y: 0 },
  gamepad: { buttons: [], axes: [] },
  updateGamepad: function() {
    if (navigator.getGamepads) {
      let gamepads = navigator.getGamepads();
      if (gamepads[0]) {
        let gp = gamepads[0];
        this.gamepad.buttons = gp.buttons.map(button => button.pressed);
        this.gamepad.axes = gp.axes.slice();
      }
    }
  }
};
document.addEventListener("keydown", function(e) {
  Controller.keys[e.code] = true;
});
document.addEventListener("keyup", function(e) {
  Controller.keys[e.code] = false;
});
document.addEventListener("mousedown", function(e) {
  Controller.mouse.down = true;
  Controller.mouse.x = e.clientX;
  Controller.mouse.y = e.clientY;
});
document.addEventListener("mouseup", function(e) {
  Controller.mouse.down = false;
});
document.addEventListener("mousemove", function(e) {
  Controller.mouse.x = e.clientX;
  Controller.mouse.y = e.clientY;
});
document.addEventListener("touchstart", function(e) {
  Controller.touch.down = true;
  if(e.touches.length > 0) {
    let touch = e.touches[0];
    Controller.touch.x = touch.clientX;
    Controller.touch.y = touch.clientY;
  }
  e.preventDefault();
}, {passive: false});
document.addEventListener("touchmove", function(e) {
  if(e.touches.length > 0) {
    let touch = e.touches[0];
    Controller.touch.x = touch.clientX;
    Controller.touch.y = touch.clientY;
  }
  e.preventDefault();
}, {passive: false});
document.addEventListener("touchend", function(e) {
  Controller.touch.down = false;
  e.preventDefault();
}, {passive: false});
window.addEventListener("gamepadconnected", function(e) {
  console.log("Gamepad connesso:", e.gamepad.id);
});
window.addEventListener("gamepaddisconnected", function(e) {
  console.log("Gamepad disconnesso:", e.gamepad.id);
});
(function pollGamepad(){
  Controller.updateGamepad();
  requestAnimationFrame(pollGamepad);
})();
