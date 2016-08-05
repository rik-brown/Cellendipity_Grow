// food Class
function Food(pos, r_) {

  this.position = pos.copy(); //food has position
  this.r = r_;

  this.display = function() {
    stroke(40);
    fill(0);
    ellipse(this.position.x, this.position.y, this.r, this.r);
  }

}
