var canvasStateObj;
var finalCanvasObj;

$(function(){
  console.log("init");
  var canvas = $('#individualWorkspace')[0];
  canvas.height = window.innerHeight;
  canvas.width = window.innerWidth;
  canvasStateObj = new canvasState(canvas);
  var bottomTabButton = new tabButton("bottom", $('#bottomTabButton')[0], $('#bottomTab')[0]);
  var finalCanvas = $('#finalWorkspace')[0];
  finalCanvas.height = 0.92*window.innerHeight;
  finalCanvas.width = window.innerWidth;
  var topTabButton = new tabButton("top", $('#topTabButton')[0], $('#topTab')[0]);
  finalCanvasObj = new canvasState(finalCanvas);
});

function tabButton(direction, button, tab){
  this.button = button;
  this.tab = tab;
  this.direction = direction;
  this.active = false;
  button.addEventListener('click', function(){
    switch(direction){
      case "bottom":
        if(this.active){
          tab.style.transform = "";
          button.innerHTML = "/\\";
          this.active = false;
        }
        else{
          tab.style.transform = "translate(0, -100%)";
          button.innerHTML = "\\/";
          this.active = true;
        }
      break;
      case "right":
        if(this.active){
          tab.style.transform = "";
          button.innerHTML = "<-";
          this.active = false;
        }
        else{
          tab.style.transform = "translate(100%, 0)";
          button.innerHTML = "->";
          this.active = true;
        }
      break;
      case "top":
        if(this.active){
          tab.style.transform = "";
          button.innerHTML = "\\/";
          this.active = false;
        }
        else{
          tab.style.transform = "translate(0, 100%)";
          button.innerHTML = "/\\";
          this.active = true;
        }
      break;
    }
  });
}

function Shape(x, y, w, h, fill){
  this.x = x || 0;
  this.y = y || 0;
  this.w = w || 1;
  this.h = h || 1;
  this.fill = fill || '#AAAAAA';
  this.shapeStyle = $('#shapeStyleForm').val();
  this.text = "";
  this.font = "";
  this.fontSize = 15;
  this.fontColour = "";
  this.shapeSize = 20;
}

Shape.prototype.draw = function(ctx){
  if(this.text != ""){
    this.w = ctx.measureText(this.text).width;
    this.h = this.fontSize;
    if(this.shapeStyle == "rectangle"){
      ctx.fillStyle = this.fill;
      ctx.fillRect(this.x, this.y, this.w, this.h);
    }
    else if(this.shapeStyle == "ellipse"){
      ctx.fillStyle = this.fill;
      ctx.beginPath();
      ctx.ellipse(this.x+this.w/2, this.y+this.h/2, this.w, this.h, 0, 2*Math.PI , 0, true);
      ctx.fill();
    }
    ctx.font = this.fontSize + "px " + this.font;
    ctx.fillStyle = this.fontColour;
    ctx.fillText(this.text, this.x, this.y+this.h-5);
  }
  else if(this.shapeStyle == "rectangle"){
    ctx.fillStyle = this.fill;
    ctx.fillRect(this.x, this.y, this.w, this.h);
  }
  else if(this.shapeStyle == "ellipse"){
    ctx.fillStyle = this.fill;
    ctx.beginPath();
    ctx.ellipse(this.x+this.w/2, this.y+this.h/2, this.w, this.h, 0, 2*Math.PI , 0, true);
    ctx.fill();
  }
}

Shape.prototype.contains = function(mouseX, mouseY){
  if((this.x <= mouseX) && (this.x + this.w >= mouseX) && (this.y <= mouseY) && (this.y + this.h >= mouseY)){
    return true;
  }
  else{
    return false;
  }
}

function canvasState(canvas){
  this.canvas = canvas;
  this.width = canvas.width;
  this.height = canvas.height;

  this.ctx = canvas.getContext("2d");
  this.drawn = false;
  this.shapes = [];
  this.dragging = false;
  this.selection;
  this.dragoffx = 0;
  this.dragoffy = 0;

  $('#purgeButton')[0].addEventListener('click', function(){
    state.purge();
  });

  var state = this;

  canvas.addEventListener('selectstart', function(e){
    e.preventDefault(); return false;
  }, false);

  canvas.addEventListener('mousedown', function(e){
    var mouse = state.getMouse(e);
    var mouseX = mouse.x;
    var mouseY = mouse.y;
    var shapes = state.shapes;
    for(var i = shapes.length - 1; i >= 0; i--){
      if(shapes[i].contains(mouseX, mouseY)){
        var sel = shapes[i];
        state.dragoffx = mouseX - sel.x;
        state.dragoffy = mouseY - sel.y;
        state.dragging = true;
        state.selection = sel;
        state.drawn = false;
        return;
      }
    }
    if(state.selection){
      state.selection = null;
      state.drawn = false;
    }
  }, true);

  canvas.addEventListener('mousemove', function(e){
    if(state.dragging){
      var mouse = state.getMouse(e);
      state.selection.x = mouse.x - state.dragoffx;
      state.selection.y = mouse.y - state.dragoffy;
      state.drawn = false;
    }
  }, true);

  canvas.addEventListener('mouseup', function(e){
    state.dragging = false;
    var mouse = state.getMouse(e);
    if(mouse.x > 0.7*window.innerWidth && mouse.y < 0.1*window.innerHeight && canvas.id == "individualWorkspace"){
      var toMove = state.selection;
      state.purge();
      finalCanvasObj.addShape(toMove);
    }
  }, true);

  canvas.addEventListener('dblclick', function(e){
    var mouse = state.getMouse(e);
    for(var i = 0; i < state.shapes.length; i++){
      if(state.shapes[i].contains(mouse.x, mouse.y)){
        this.selection = state.shapes[i];
        this.drawn = false;
        //make text input appear
        this.selection.fill = $('#shapeColourForm')[0][0].value;
        this.selection.font = $('#fontForm').val();
        this.selection.fontSize = parseInt($('#fontSizeForm')[0][0].value);
        this.selection.fontColour = $('#fontColourForm')[0][0].value;
        this.selection.text = $('#textInput')[0][0].value;
        console.log(this.selection);
        return;
      }
    }
    if(canvas.id == "individualWorkspace"){
      state.addShape(new Shape(mouse.x-parseInt($('#shapeSizeForm')[0][0].value)/2, mouse.y-parseInt($('#shapeSizeForm')[0][0].value)/2, parseInt($('#shapeSizeForm')[0][0].value), parseInt($('#shapeSizeForm')[0][0].value), $('#shapeColourForm')[0][0].value));
      state.shapes[state.shapes.length-1].fill = $('#shapeColourForm')[0][0].value;
      state.shapes[state.shapes.length-1].font = $('#fontForm').val();
      state.shapes[state.shapes.length-1].fontSize = parseInt($('#fontSizeForm')[0][0].value);
      state.shapes[state.shapes.length-1].fontColour = $('#fontColourForm')[0][0].value;
      state.shapes[state.shapes.length-1].text = $('#textInput')[0][0].value;
      this.drawn = false;
    }
  }, true);

  this.selectionColour = '#CC0000';
  this.selectionWidth = 2;
  this.interval = 30;
  setInterval(function(){
    state.draw();
  }, state.interval);
}

canvasState.prototype.purge = function(){
  console.log(this);
  for(var i = 0; i < this.shapes.length; i++){
    console.log("bleh");
    if(this.shapes[i] == this.selection){
      this.shapes.splice(i, 1);
      this.selection = null;
      this.drawn = false;
      return;
    }
  }
}

canvasState.prototype.draw = function(){
  if(!this.drawn){
    var ctx = this.ctx;
    var shapes = this.shapes;
    this.clear();

    for(var i = 0; i < shapes.length; i++){
      var shape = shapes[i];
      if(shape.x > this.width || shape.y > this.height || shape.x + shape.w < 0 || shape.y + shape.h < 0){
        continue;
      }
      shapes[i].draw(ctx);
    }

    if(this.selection != null){
      ctx.strokeStyle = this.selectionColour;
      ctx.lineWidth = this.selectionWidth;
      var sel = this.selection;
      if(sel.shapeStyle == "rectangle" || sel.shapeStyle == "none"){
        ctx.strokeRect(sel.x, sel.y, sel.w, sel.h);
      }
      else if(sel.shapeStyle == "ellipse"){
        ctx.beginPath();
        ctx.ellipse(sel.x+sel.w/2, sel.y+sel.h/2, sel.w, sel.h, 0, 2*Math.PI , 0, true);
        ctx.stroke();
      }
    }

    this.drawn = true;
  }
}

canvasState.prototype.clear = function(){
  this.ctx.clearRect(0, 0, this.width, this.height);
}

canvasState.prototype.getMouse = function(e){
  return {x: e.clientX, y: e.clientY};
}

canvasState.prototype.addShape = function(shape){
  this.shapes.push(shape);
  this.drawn = false;
}
