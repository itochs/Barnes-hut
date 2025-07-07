// let tree = null;
// let renderer = null;

function setup() {
  createCanvas(400, 400);
  //   tree = new BarnesHutTree(new Boundary(0, 0, width, height));
  //   for (let i = 0; i < 10; i++) {
  //     tree.add(new Point(Math.random() * width, Math.random() * height, 1));
  //   }
  //   renderer = new RendererBHT(tree);
  let layout = new FDPLayout([new Node(0, 0, 0), new Node(0, 0, 1)], [[0, 1]]);
}

function draw() {
  background(255);
  //   renderer.draw();
  //   noLoop();
}
