/**
 * @file 力指向配置（Force-Directed Placement）アルゴリズムを実装します。
 * グラフのノードを、ばねの物理シミュレーションのように配置します。
 * エッジで繋がったノード同士は引き合い（引力）、すべてのノード同士は反発し合います（斥力）。
 */

/**
 * @class Node
 * @description グラフのノードを表します。物理的な点(Point)とグラフ内でのインデックスを持ちます。
 */
class Node {
  /**
   * @param {number} x - 初期x座標
   * @param {number} y - 初期y座標
   * @param {number} index - ノードのインデックス
   * @param {number} [q=1] - 質量
   */
  constructor(x, y, index, q = 1) {
    this.p = new Point(x, y, q); // 物理的な位置と質量
    this.index = index; // グラフデータ内でのインデックス
  }
}

/**
 * 力の計算式を生成する高階関数。
 * F = weight * (actual_distance^alpha) / (graph_distance^beta)
 * @param {number} weight - 力の係数（正で引力、負で斥力）
 * @param {number} alpha - 実距離に対する指数
 * @param {number} beta - グラフ上の距離に対する指数
 * @returns {function} - 実際に力を計算する関数
 */
const quotientForce = (weight, alpha, beta) => {
  /**
   * 指定されたノードペアに働く力を計算します。
   * @param {Node[][]} nodePairs - 力の計算対象となるノードのペア
   * @param {number[][]} distanceMatrix - 全ノード間のグラフ上の最短距離行列
   * @returns {number[][]} - 各ノードに働く力のベクトル [fx, fy] の配列
   */
  function force(nodePairs, distanceMatrix) {
    // 各ノードに働く力の合計を初期化
    let f = new Array(distanceMatrix.length).fill(0).map(() => [0, 0]);
    for (let [node1, node2] of nodePairs) {
      // Renamed xi, xj to node1, node2 for clarity
      const dx = node2.p.x - node1.p.x;
      const dy = node2.p.y - node1.p.y;
      const d = max(0.001, Math.hypot(dx, dy)); // Use max for robustness, respecting existing global function

      const graph_dist = distanceMatrix[node1.index][node2.index];

      // Calculate the magnitude of the force
      const forceMagnitude =
        (weight * Math.pow(d, alpha)) / Math.pow(graph_dist, beta);

      // Calculate the unit vector components
      const ux = dx / d;
      const uy = dy / d;

      // Apply force to node1 from node2
      f[node1.index][0] += forceMagnitude * ux;
      f[node1.index][1] += forceMagnitude * uy;
    }
    return f;
  }

  return force;
};

/**
 * ワーシャル-フロイド法を用いて、全ノードペア間の最短経路長を計算します。
 * @param {Node[]} nodes - ノードの配列
 * @param {number[][]} edgeIndices - エッジのインデックスペアの配列
 * @returns {number[][]} - 最短距離行列
 */
const calc_distance_matrix = (nodes, edgeIndices) => {
  let n = nodes.length;
  // 距離行列を無限大（または大きな数）で初期化
  let distance_matrix = new Array(n)
    .fill(0)
    .map((_) => new Array(n).fill(Infinity));
  for (let i = 0; i < n; i++) {
    distance_matrix[i][i] = 0; // 自分自身への距離は0
  }
  // 隣接しているノード間の距離は1
  for (let [i, j] of edgeIndices) {
    distance_matrix[i][j] = 1;
    distance_matrix[j][i] = 1;
  }

  // ワーシャル-フロイド法
  for (let k = 0; k < n; k++) {
    for (let i = 0; i < n; i++) {
      for (let j = 0; j < n; j++) {
        // iからjへの最短経路は、kを経由する場合としない場合の小さい方
        distance_matrix[i][j] = min(
          distance_matrix[i][j],
          distance_matrix[i][k] + distance_matrix[k][j]
        );
      }
    }
  }
  return distance_matrix;
};

/**
 * @class FDPLayout
 * @description 力指向配置法によるレイアウト計算を管理します。
 */
class FDPLayout {
  constructor(nodes, edgeIndices) {
    this.nodes = nodes;
    this.edgeIndices = edgeIndices;
    // Barnes-Hut木はここでは斥力計算の高速化のために利用可能（現在は未使用）
    this.tree = new BarnesHutTree(new Boundary(0, 0, width, height));
    this.renderer = new RendererBHT(this.tree);
    // 全ノード間の最短距離をあらかじめ計算
    this.distance_matrix = calc_distance_matrix(nodes, this.edgeIndices);
  }

  /**
   * レイアウトを1ステップ更新します。
   * @param {number} temperature - シミュレーションの温度。高いほどノードの移動量が大きくなる。
   */
  update(temperature) {
    // --- 引力の計算 ---
    // 引力はエッジで繋がったノード間にのみ働く (d^2に比例)
    const applyAttractiveForce = quotientForce(1, 2, 1);
    const attractivePairs = this.edgeIndices
      .map(([i, j]) => [[this.nodes[i], this.nodes[j]]])
      .flat();
    const attractiveForce = applyAttractiveForce(
      attractivePairs,
      this.distance_matrix
    );

    // --- 斥力の計算 ---
    // 斥力はすべてのノード間に働く (d^-1に比例)
    const applyRepulsiveForce = quotientForce(-1, -1, 0);
    const repulsivePairs = [];
    for (let i = 0; i < this.nodes.length; i++) {
      for (let j = 0; j < this.nodes.length; j++) {
        if (i != j) {
          repulsivePairs.push([this.nodes[i], this.nodes[j]]);
        }
      }
    }
    const repulsiveForce = applyRepulsiveForce(
      repulsivePairs,
      this.distance_matrix
    );

    // --- 合力の計算 ---
    const sumEachForce = attractiveForce.map((_, i) => {
      const sumForce = [
        attractiveForce[i][0] + repulsiveForce[i][0],
        attractiveForce[i][1] + repulsiveForce[i][1],
      ];
      return sumForce;
    });
    console.log("temperature", temperature);
    console.log("sum of force");
    console.table(sumEachForce);

    // --- ノード位置の更新 ---
    let n = this.nodes.length;
    this.nodes = this.nodes.map((v) => {
      const clamp = (x, l, r) => min(r, max(l, x));
      // 力と温度に基づいて位置を更新
      const newX = v.p.x + sumEachForce[v.index][0] * temperature;
      const newY = v.p.y + sumEachForce[v.index][1] * temperature;
      v.p.x = clamp(newX, 0, Math.sqrt(n));
      v.p.y = clamp(newY, 0, Math.sqrt(n));
      return v;
    });
  }

  /**
   * 指定された反復回数だけシミュレーションを実行します。
   * @param {number} [iter=100] - 反復回数
   */
  start(iter = 100) {
    const maxTemperature = 1.0;
    let temperature = maxTemperature;
    // シミュレーテッドアニーリングのように、徐々に温度を下げる
    for (let t = 0; t < iter; t += 1) {
      this.update(temperature);
      temperature = maxTemperature * (1 - t / iter);
    }
  }
}

