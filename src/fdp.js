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
   * @param {Node[][]} node_pairs - 力の計算対象となるノードのペア
   * @param {number[][]} distance_matrix - 全ノード間のグラフ上の最短距離行列
   * @returns {number[][]} - 各ノードに働く力のベクトル [fx, fy] の配列
   */
  function force(node_pairs, distance_matrix) {
    // 1次元方向の力の成分を計算する
    function force_1d(xi, xj, actual_distance, graph_distance) {
      // 単位ベクトル e_{ij} はノード xi から xj へ向かう方向
      let ex = (xj - xi) / actual_distance;
      return (
        (weight * Math.pow(actual_distance, alpha) * ex) /
        Math.pow(graph_distance, beta)
      );
    }
    // 各ノードに働く力の合計を初期化
    let f = new Array(distance_matrix.length).fill(0).map(() => [0, 0]);
    for (let [xi, xj] of node_pairs) {
      const dx = xj.p.x - xi.p.x;
      const dy = xj.p.y - xi.p.y;
      // 距離が0にならないように微小な値を保証
      const d = max(0.001, Math.hypot(dx, dy));
      const graph_dist = distance_matrix[xi.index][xj.index];

      // x方向とy方向の力を計算し、加算
      f[xi.index][0] += force_1d(xi.p.x, xj.p.x, d, graph_dist);
      f[xi.index][1] += force_1d(xi.p.y, xj.p.y, d, graph_dist);
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
  let distance_matrix = new Array(n).fill(0).map((_) => new Array(n).fill(Infinity));
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
    const applyRepulsiveForce = quotientForce(-0.1, -1, 0);
    const repulsivePairs = this.nodes
      .map((v) => this.nodes.map((u) => (v.index !== u.index ? [v, u] : null)))
      .flat()
      .filter(p => p != null);
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

    // --- ノード位置の更新 ---
    let n = this.nodes.length;
    this.nodes = this.nodes.map((v) => {
      const clamp = (x, l, r) => min(r, max(l, x));
      // 力と温度に基づいて位置を更新
      v.p.x = clamp(
        v.p.x + sumEachForce[v.index][0] * temperature,
        0,
        width
      );
      v.p.y = clamp(
        v.p.y + sumEachForce[v.index][1] * temperature,
        0,
        height
      );
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
