let tree = null;
let renderer = null;
let temperature = 1;
let iter = 10;
let t = 0;
let layout = null;

function setup() {
  createCanvas(400, 400);
  // tree = new BarnesHutTree(new Boundary(0, 0, width, height));
  // for (let i = 0; i < 10; i++) {
  //   tree.add(new Point(Math.random() * width, Math.random() * height, 1));
  // }
  // renderer = new RendererBHT(tree);

  const graph = [[1], [0, 3, 4], [3, 5], [1, 2, 4], [1, 3], [2]];
  const pos = [
    [0.6897927410102785, 1.8633360657738784],
    [1.998349565808713, 2.148706089170453],
    [0.5146614361273951, 0.9543305881316088],
    [1.2990912822525318, 1.5576078551919947],
    [1.2641901566595386, 1.8782536273884058],
    [0.11634882392203322, 1.890762445560767],
  ];

  const nodes = pos.map(([x, y], i) => {
    let n = new Node(x, y, i);
    return n;
  });
  const edgeIndices = graph.map((vs, i) => vs.map((v) => [i, v])).flat();

  layout = new FDPLayout(nodes, edgeIndices);
  frameRate(10);
}

function draw() {
  background(255);
  // renderer.draw();
  layout.update(temperature);
  let n = layout.nodes.length;

  const scale = (x, y) => {
    return [(x / Math.sqrt(n)) * width, height - (y / Math.sqrt(n)) * height];
  };
  layout.edgeIndices.forEach(([i, j]) => {
    let { x: xi, y: yi } = layout.nodes[i].p;
    let { x: xj, y: yj } = layout.nodes[j].p;
    let [scaledXi, scaledYi] = scale(xi, yi);
    let [scaledXj, scaledYj] = scale(xj, yj);
    stroke(0);
    strokeWeight(3);
    line(scaledXi, scaledYi, scaledXj, scaledYj);
  });

  layout.nodes.forEach((v) => {
    let { x, y } = v.p;
    let [scaledX, scaledY] = scale(x, y);
    noStroke();
    fill(0, 0, 255);
    ellipse(scaledX, scaledY, 10, 10);
  });

  temperature *= 0.9;
  t += 1;
  if (temperature < 0.0001) {
    noLoop();
  }
  console.log("temp", temperature, "iter t", t);
}
