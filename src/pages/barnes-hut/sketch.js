let tree = null;

function setup() {
  createCanvas(400, 400);
  tree = new BarnesHutTree();
}

function draw() {
  background(255);
  fill(255, 0, 0);
  ellipse(100, 100, 100, 100);
}
