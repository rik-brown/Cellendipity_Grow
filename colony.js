// Colony class

// CONSTRUCTOR: Create a 'Colony' object, initially populated with 'colonySize' cells
function Colony(colonySize) {
  // Start with an array for all cells
  this.cells = [];
  //this.foods = [];

  // VARIABLES
  var colonyMaxSize = 100; // This could be varied in the GUI but 300 seems to be an OK value

  // Create initial population of food
  //this.foods.push(new Food(p.target, p.targetR)); // Add new Food

  // Create initial population of cells
  //var strainSize = floor(p.colonySize/p.numStrains);
  for (var i = 0; i < p.numStrains; i++) {
    var dna = new DNA(); // Get new DNA
    // if (p.centerSpawn) {var pos = createVector(width/2, height/2);} else {var pos = createVector(random(width), random(height));}
    for (var j = 0; j < p.strainSize; j++) {
      //if (p.centerSpawn) {var pos = createVector(width/2, height/2);} else {var pos = createVector(random(width), random(height));}
      var vel = p5.Vector.random2D(); // Initial velocity vector is random
      var pos = createVector(random(width), random(height))
      this.cells.push(new Cell(pos, vel, dna)); // Add new Cell with DNA
    }
  }
  this.cells[0].moving = false; // Target starts
  this.cells[0].position = p.target; // Target gets location of p.target
  this.cells[0].r = p.targetR;


  this.spawn = function(mousePos, vel, dna_) {
    // Spawn a new cell (called by e.g. MousePressed in main, accepting mouse coords for start position)
    this.cells.push(new Cell(mousePos, vel, dna_));
  };

  // Run the colony
  this.run = function() {
    fill(0);
    ellipse(p.target.x, p.target.y, 5, 5);
    if (p.debug) {this.colonyDebugger(); }
    // Display all the food
    // for (var h=0; h < this.foods.length; h++) {
    //   var f = this.foods[h];
    //   f.display();
    // }
    // Iterate through the all the cells in the ArrayList (backwards, because we are removing items)
    for (var i = this.cells.length - 1; i >= 0; i--) { // Minus 1 because we count from 0 - X while size is (X+1)
      var c = this.cells[i];                    // Get one cell at a time
      c.run();                                  // Run the cell (grow, move, spawn, check position vs boundaries etc.)
      if (c.moving) {c.applyBehaviors(this.cells)}; // Apply behaviours to determine velocity for next iteration. Could use IF to only apply for stage 0?
      // c.checkCollisionTarget();
      //if (c.dead()) {this.cells.splice(i, 1); } // If the cell has died, remove it from the array. Comment out to prevent death

      // Iteration to check for a collision-conception event between current cell(i) (if it's fertile) and the rest of the colony
      if (c.moving) { // Only check collisions on moving cells
        for (var others = i - 1; others >= 0; others--) { // Since main iteration (i) goes backwards, this one needs to too
          var other = this.cells[others]; // Get the other cells, one by one
          if (!other.moving) {c.checkCollision(other);} // Only check for collisions against stationary cells
        }
      }

      // for (var foo = 0; foo < this.foods.length-1; foo++) { // Iterate through all the foods but the last one
      //     var food = this.foods[foo]; // Get the foods, one by one
      //     c.checkCollisionFood(food, foo); //test for a collision
      //   }
    }

    // If there are too many cells, remove some by 'culling'
    if (this.cells.length > colonyMaxSize) {
      this.cull(colonyMaxSize);
    }
  };

  this.cull = function(div) { // To remove a proportion of the cells from (the oldest part of) the colony
    var cull = (this.cells.length / div);
    for (var i = cull; i >= 0; i--) { this.cells.splice(i,1); }
  };

  this.colonyDebugger = function() { // Displays some values as text at the top left corner (for debug only)
    fill(0);
    rect(0,0,250,20);
    fill(360);
    textSize(16);
    text("Nr. cells: " + this.cells.length + " MaxLimit:" + colonyMaxSize, 10, 18);
  };
}
