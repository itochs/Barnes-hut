class Node {
  constructor(x, y, index, q = 1) {
    this.p = new Point(x, y, q);
    this.index = index;
  }
}

const quotientForce = (weight, alpha, beta) => {
  function force(node_pairs, distance_matrix) {
    // 単位ベクトルe_{ij}はノードペアをつないだ方向xi->xj
    function force_1d(xi, xj, actual_distance, graph_distance) {
      let ex = (xj - xi) / actual_distance;
      return (
        (weight * Math.pow(actual_distance, alpha) * ex) /
        Math.pow(graph_distance, beta)
      );
    }
    let f = new Array(distance_matrix.length).fill(0).map(() => [0, 0]);
    for (let [xi, xj] of node_pairs) {
      const dx = xj.p.x - xi.p.x;
      const dy = xj.p.y - xi.p.y;
      const d = max(0.001, Math.hypot(dx, dy));
      f[xi.index][0] += force_1d(
        xi.p.x,
        xj.p.x,
        d,
        distance_matrix[xi.index][xj.index]
      );
      f[xi.index][1] += force_1d(
        xi.p.y,
        xj.p.y,
        d,
        distance_matrix[xi.index][xj.index]
      );
    }

    return f;
  }

  return force;
};

const calc_distance_matrix = (nodes, edgeIndices) => {
  let n = nodes.length;
  let distance_matrix = new Array(n).fill(0).map((_) => new Array(n).fill(0));
  for (let i = 0; i < n; i++) {
    distance_matrix[i][i] = 0;
  }
  for ([i, j] of edgeIndices) {
    distance_matrix[i][j] = 1;
    distance_matrix[j][i] = 1;
  }
  const edgeIndicesSet = new Set(edgeIndices);
  for (i of nodes) {
    for (j of nodes) {
      if (!edgeIndicesSet.has([i.index, j.index])) {
        continue;
      }
      for (k of nodes) {
        if (
          !edgeIndicesSet.has([i.index, k.index]) ||
          !edgeIndicesSet.has([k.index, j.index])
        ) {
          continue;
        }
        distance_matrix[i.index][j.index] = min(
          distance_matrix[i.index][j.index],
          distance_matrix[i.index][k.index] + distance_matrix[k.index][j.index]
        );
      }
    }
  }
  return distance_matrix;
};

// layout and view?
class FDPLayout {
  constructor(nodes, edgeIndices) {
    this.nodes = nodes;
    this.edgeIndices = edgeIndices;
    this.tree = new BarnesHutTree(new Boundary(0, 0, width, height));
    this.renderer = new RendererBHT(this.tree);
    let n = nodes.length;
    this.distance_matrix = calc_distance_matrix(nodes, this.edgeIndices);
  }

  update(temperature) {
    const applyAttractiveForce = quotientForce(1, 2, 0);
    const attractivePairs = this.edgeIndices
      .map(([i, j]) => [
        [this.nodes[i], this.nodes[j]],
        [this.nodes[j], this.nodes[i]],
      ])
      .flat();
    const attractiveForce = applyAttractiveForce(
      attractivePairs,
      this.distance_matrix
    );

    const applyRepulsiveForce = quotientForce(-1, -1, 0);
    const repulsivePairs = this.nodes
      .map((v) => this.nodes.map((u) => [v, u]))
      .flat();
    const repulsiveForce = applyRepulsiveForce(
      repulsivePairs,
      this.distance_matrix
    );

    const sumEachForce = attractiveForce.map((_, i) => {
      const sumForce = [
        attractiveForce[i][0] + repulsiveForce[i][0],
        attractiveForce[i][1] + repulsiveForce[i][1],
      ];
      return sumForce;
    });
    let n = this.nodes.length;
    this.nodes = this.nodes.map((v) => {
      const clamp = (x, l, r) => min(r, max(l, x));
      v.p.x = clamp(
        v.p.x + sumEachForce[v.index][0] * temperature,
        0,
        Math.sqrt(n)
      );
      v.p.y = clamp(
        v.p.y + sumEachForce[v.index][1] * temperature,
        0,
        Math.sqrt(n)
      );
      return v;
    });
  }

  start(iter = 100) {
    const maxTemperature = 1;
    let temperature = maxTemperature;
    for (let t = 0; t < iter; t += 1) {
      this.update(temperature);
      temperature = (maxTemperature / iter) * (iter - t - 1);
    }
  }
}
