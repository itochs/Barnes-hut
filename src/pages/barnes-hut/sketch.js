let tree = null;
let renderer = null;

function setup() {
  createCanvas(400, 400);
  tree = new BarnesHutTree(new Boundary(0, 0, width, height));
  for (let i = 0; i < 100; i++) {
    tree.add(new Point(Math.random() * width, Math.random() * height));
  }
  renderer = new RendererBHT(tree);
}

function draw() {
  background(255);
  renderer.draw();
}
