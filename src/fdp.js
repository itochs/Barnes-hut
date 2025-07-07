class Node {
  constructor(x, y, index, q = 1) {
    this.p = new Point(x, y, q);
    this.index = index;
  }
}

const quotientForce = (alpha, beta, weight) => {
  function force(node_pairs, distance_matrix) {
    // 単位ベクトルe_{ij}はノードペアをつないだ方向xi->xj
    function force_1d(xi, xj, dist) {
      let dx = max(0.01, Math.hypot(xi, xj));
      let ex = (xj - xi) / dx;
      return (weight * Math.pow(dx, alpha) * ex) / Math.pow(dist, beta);
    }
    let f = [0, 0];
    for (let [xi, xj] of node_pairs) {
      f[0] += force_1d(xi.x, xj.x, distance_matrix[xi.index][xj.index]);
      f[1] += force_1d(xi.y, xj.y, distance_matrix[xi.index][xj.index]);
    }

    return f;
  }

  return force;
};

const calc_distance_matrix = (nodes) => {
  let n = nodes.length;
  let distance_matrix = new Array(n).fill(0).map((_) => new Array(n).fill(-1));
  for (i of nodes) {
    for (j of nodes) {
      for (k of nodes) {
        distance_matrix[i.index][j.index] = min(
          distance_matrix[i.index][j.index],
          distance_matrix[i.index][k.index] + distance_matrix[k.index][j.index]
        );
      }
    }
  }
};

// layout and view?
class FDPLayout {
  constructor(nodes, edges) {
    this.nodes = nodes;
    this.edges = edges;
    this.tree = new BarnesHutTree(new Boundary(0, 0, width, height));
    this.renderer = new RendererBHT(this.tree);
    let n = nodes.length;
    this.distance_matrix = calc_distance_matrix(nodes);
  }

  update() {}
}
