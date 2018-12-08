$(function(){
  console.log("init");
  var canvas = $('#individualWorkspace')[0];
  canvas.height = window.innerHeight;
  canvas.width = window.innerWidth;
  var canvasStateObj = new canvasState(canvas);
});

function Shape(x, y, w, h, fill){
  this.x = x || 0;
  this.y = y || 0;
  this.w = w || 1;
  this.h = h || 1;
  this.fill = fill || '#AAAAAA';
  this.shapeStyle = "rectangle";
  this.text = "";
}

Shape.prototype.draw = function(ctx){
  ctx.fillStyle = this.fill;
  if(this.shapeStyle == "rectangle"){
    ctx.fillRect(this.x, this.y, this.w, this.h);
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
  }, true);

  canvas.addEventListener('dblclick', function(e){
    var mouse = state.getMouse(e);
    for(var i = 0; i < state.shapes.length; i++){
      if(state.shapes[i].contains(mouse.x, mouse.y)){
        this.selection = state.shapes[i];
        this.drawn = false;
        //make text input appear
        return;
      }
    }
    state.addShape(new Shape(mouse.x-10, mouse.y-10, 20, 20, 'rgba(0, 255, 0, 0.6)'));
  }, true);

  this.selectionColour = '#CC0000';
  this.selectionWidth = 2;
  this.interval = 30;
  setInterval(function(){
    state.draw();
  }, state.interval);
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
      ctx.strokeRect(sel.x, sel.y, sel.w, sel.h);
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
