/*
* Aggregator
* by Richard Brown
*
* Branch: Only_cells
* My goal is to remove the 'food' objects so that all objects are Cells DONE!
*
* Could it be an idea to use splice() to (re)organize the array to work more efficiently? Or perhaps even use two arrays for moving & stationary cells?
* https://p5js.org/reference/#p5/splice
*
* Could perhaps use something more on the visual side - frozen cells are linked by a line? or a white nucleus? Maybe a nucleus which grows outwards as the cell ages? Fun!
*/

var colony; // A colony object

function setup() {
  colorMode(HSB, 360, 255, 255, 255);
  createCanvas(windowWidth, windowHeight);
  //createCanvas(1024, 1024);
  //frameRate(10);
  ellipseMode(RADIUS);
  p = new Parameters();
  gui = new dat.GUI();
  initGUI();
  background(p.bkgColor);
  if (p.debug) {frameRate(15);}
  colony = new Colony(p.colonySize);
}

function draw() {
  if (p.trailMode == 1 || p.debug) {background(p.bkgColor);}
  if (p.trailMode == 2) {trails();}
  colony.run();
  if (colony.cells.length === 0) { if (keyIsPressed || p.autoRestart) {populateColony(); } } // Repopulate the colony when all the cells have died
}

function populateColony() {
  background(p.bkgColor); // Refresh the background
  colony.cells = [];
  colony = new Colony(p.colonySize);
}

function trails() { // Neat trick to create smooth, long trails
  blendMode(DIFFERENCE);
  noStroke();
  fill(1);
  rect(-1, -1, width + 1, height + 1);
  blendMode(BLEND);
  fill(255);
}

function mousePressed() {
  var mousePos = createVector(mouseX, mouseY);
  // var vel = p5.Vector.random2D();
  // var dna = new DNA();
  // if (mousePos.x < (width-270)) {colony.spawn(mousePos, vel, dna);}
  if (mousePos.x < (width-270)) {
    p.target = createVector(mouseX, mouseY);
  }
}

function mouseDragged() {
  var mousePos = createVector(mouseX, mouseY);
  var vel = p5.Vector.random2D();
  var dna = new DNA();
  if (mousePos.x < (width-270)) {colony.spawn(mousePos, vel, dna);}
}

function screenDump() {
  saveCanvas('screendump.png', 'png');
}

function keyTyped() {
  if (key === '1') { // '1' sets trailMode = 1 (None)
    p.trailMode = 1;
  }

  if (key === '2') { // '2' sets trailMode = 2 (Blended)
    p.trailMode = 2;
  }

  if (key === '3') { // '3' sets trailMode = 3 (Continuous)
    p.trailMode = 3;
  }


  if (key === ' ') { //spacebar respawns with current settings
    colony.cells = [];
  }

  if (key === 'c') { // C toggles 'centered' mode
    p.centerSpawn = !p.centerSpawn;
    colony.cells = [];
  }

  if (key === 'd') { // D toggles 'cell debug' mode
    p.debug = !p.debug;
  }

  if (key === 'n') { // N toggles 'show nucleus' mode
    p.nucleus = !p.nucleus;
  }

  if (key === 's') { // S saves a screenshot
    screenDump();
  }

  if (key === 'r') { // R for Randomize
    randomizer();
    colony.cells = [];
  }

}

var initGUI = function () {
	// var controller = gui.add(p, 'colonySize', 1, 200).step(1).name('Colony Size').listen();
	//   controller.onChange(function(value) {populateColony(); });
  var controller = gui.add(p, 'numStrains', 1, 10).step(1).name('Strains').listen();
	  controller.onChange(function(value) {populateColony(); });
  var controller = gui.add(p, 'strainSize', 1, 50).step(1).name('Cells in Strain').listen();
    controller.onChange(function(value) {populateColony(); });
  var controller = gui.add(p, 'centerSpawn').name('Centered [C]').listen();
	  controller.onChange(function(value) {populateColony(); });
  var controller = gui.add(p, 'wraparound').name('Wraparound');
    controller.onChange(function(value) {populateColony();});

  var controller = gui.addColor(p, 'bkgColHSV').name('Background color').listen();
    controller.onChange(function(value) {p.bkgColor = color(value.h, value.s*255, value.v*255); background(p.bkgColor);});

	var f3 = gui.addFolder("Fill Color Tweaks");
	  f3.add(p, 'fill_HTwist', 0, 360).step(1).name('Hue').listen();
    f3.add(p, 'fill_STwist', 0, 255).name('Saturation').listen();
    f3.add(p, 'fill_BTwist', 0, 255).name('Brightness').listen();
    f3.add(p, 'fill_ATwist', 0, 255).name('Alpha.').listen();
    f3.add(p, 'fillDisable').name('Fill OFF');

  var f4 = gui.addFolder("Stroke Color Tweaks");
  	  f4.add(p, 'stroke_HTwist', 0, 360).step(1).name('Hue').listen();
      f4.add(p, 'stroke_STwist', 0, 255).name('Saturation').listen();
      f4.add(p, 'stroke_BTwist', 0, 255).name('Brightness').listen();
      f4.add(p, 'stroke_ATwist', 0, 255).name('Alpha').listen();
      f4.add(p, 'strokeDisable').name('Stroke OFF');

  var controller =gui.add(p, 'stepSize', 0, 100).name('Step Size').listen();
   controller.onChange(function(value) {if (p.stepSize==0) {p.stepped=false} else {p.stepped=true; p.trailMode = 3;};});

	var f7 = gui.addFolder("Nucleus");
    f7.add(p, 'nucleus').name('Nucleus [N]').listen();
    f7.add(p, 'stepSizeN', 0, 100).name('Step (nucleus)').listen();

  var controller = gui.add(p, 'maxspeed', 1, 10).step(1).name('Max. Speed').listen();
    controller.onChange(function(value) {populateColony(); });
  var controller = gui.add(p, 'maxforce', 0.1, 1.0).name('Max. Force').listen();
    controller.onChange(function(value) {populateColony(); });
  var controller = gui.add(p, 'seekWeight', 0, 5).name('--> Strength').listen();
    controller.onChange(function(value) {populateColony(); });
  var controller = gui.add(p, 'separateWeight', 0, 5).name('<--> Strength').listen();
  var controller = gui.add(p, 'sepFF', 0, 50).name('<--> Red-Red').listen();
    controller.onChange(function(value) {populateColony(); });
  var controller = gui.add(p, 'sepFI', 0, 500).name('<--> Red-White').listen();
    controller.onChange(function(value) {populateColony(); });
  var controller = gui.add(p, 'sepII', 0, 500).name('<--> White-White').listen();
    controller.onChange(function(value) {populateColony(); });
  var controller = gui.add(p, 'sepMoving', 0, 500).name('<--> Moving').listen();
    controller.onChange(function(value) {populateColony(); });
  var controller = gui.add(p, 'targetR', 1, 100).name('Target Size').listen();
    controller.onChange(function(value) {populateColony(); });
  var controller = gui.add(p, 'lifespan', 100, 2000).name('Lifespan').listen();
    controller.onChange(function(value) {populateColony(); });

  gui.add(p, 'trailMode', { None: 1, Blend: 2, Continuous: 3} ).name('Trail Mode [1-2-3]');
  gui.add(p, 'restart').name('Respawn [space]');
  gui.add(p, 'randomRestart').name('Randomize [R]');
  gui.add(p, 'autoRestart').name('Auto-restart');

  gui.close();
}

var Parameters = function () { //These are the initial values, not the randomised ones
  this.colonySize = int(random (20,80)); // Max number of cells in the colony
  this.strainSize = int(random(10,50)); // Number of cells in a strain
  this.numStrains = int(random(2,4)); // Number of strains (a group of cells sharing the same DNA)

  this.centerSpawn = false; // true=initial spawn is width/2, height/2 false=random
  this.autoRestart = false; // If true, will not wait for keypress before starting anew

  this.bkgColHSV = { h: random(360), s: random(0), v: random(255,255) }; // debug
  this.bkgColor = color(this.bkgColHSV.h, this.bkgColHSV.s*255, this.bkgColHSV.v*255); // Background colour

  this.fill_HTwist = 0;
  this.fill_STwist = 0;
  this.fill_BTwist = 0;
  this.fill_ATwist = 0;
  this.stroke_HTwist = 0;
  this.stroke_STwist = 0;
  this.stroke_BTwist = 0;
  this.stroke_ATwist = 0;

  this.fillDisable = false;
  this.strokeDisable = true;

  this.nucleus = false;

  this.stepSize = 0;
  this.stepSizeN = 0;
  this.stepped = false;

  this.wraparound = true;
  this.trailMode = 1; // 1=none, 2 = blend, 3 = continuous

  this.restart = function () {colony.cells = []; populateColony();};
  this.randomRestart = function () {randomizer(); colony.cells = []; populateColony();};
  this.debug = false;

  // this.target = createVector(random(width-270), random(height)); // Initial target has random position
  this.target = createVector(width/2, height/2); // Initial target is centered
  this.targetR = random(10, 25);
  this.maxspeed = 1.0;
  this.maxforce = 0.3;
  this.seekWeight = 0.5; // Multiplier for 'seek target' behaviour
  this.separateWeight = 2; // Multiplier for 'separate' behaviour
  this.sepFF = 0; // Separation for Fertile && Fertile (moving cells & target)
  this.sepFI = 100; // Separation for Fertile && Infertile (moving cells & frozen cells)
  this.sepII = 50; // Separation for Infertile && Infertile (no longer applicable as frozen cells do not have behaviour)
  this.sepMoving = 100; // Separation for moving cells
  this.lifespan = 300;

}

function randomizer() { // Parameters are randomized (more than in the initial configuration)
  //p.colonySize = int(random (10,200));
  if (random(1) > 0.4) {p.centerSpawn = true;} else {p.centerSpawn = false;}

  p.bkgColHSV = { h: random(360), s: random(), v: random() };
  p.bkgColor = color(p.bkgColHSV.h, p.bkgColHSV.s*255, p.bkgColHSV.v*255);

  if (random(1) > 0.5) {this.fill_HTwist = floor(random(1, 360));} else {this.fill_HTwist = 0;}
  if (random(1) > 0.5) {this.fill_STwist = floor(random (1,255));} else {this.fill_STwist = 0;}
  if (random(1) > 0.5) {this.fill_BTwist = floor(random (1,255));} else {this.fill_BTwist = 0;}
  if (random(1) > 0.5) {this.fill_ATwist = floor(random (1,255));} else {this.fill_ATwist = 0;}
  if (random(1) > 0.5) {this.stroke_HTwist = floor(random(1, 360));} else {this.stroke_HTwist = 0;}
  if (random(1) > 0.5) {this.stroke_STwist = floor(random (1,255));} else {this.stroke_STwist = 0;}
  if (random(1) > 0.5) {this.stroke_BTwist = floor(random (1,255));} else {this.stroke_BTwist = 0;}
  if (random(1) > 0.5) {this.stroke_ATwist = floor(random (1,255));} else {this.stroke_ATwist = 0;}

  if (random(1) > 0.7) {p.nucleus = true;} else {p.nucleus = false;}

  if (random(1) < 0.7) {p.stepSize = 0;} else {p.stepSize = random(100)};
  if (p.stepSize==0) {p.stepped=false} else {p.stepped=true}
  p.stepSizeN = random(20);
}
