/**
 * @file Barnes-Hutアルゴリズムの木構造（Quadtree）を実装します。
 * 空間を再帰的に4つの象限に分割し、粒子（ポイント）を効率的に管理します。
 */

/**
 * @class Point
 * @description 2次元空間上の点（粒子）を表します。位置(x, y)と質量(q)を持ちます。
 */
class Point {
  /**
   * @param {number} x - x座標
   * @param {number} y - y座標
   * @param {number} [q=1] - 質量（電荷や重力など）
   */
  constructor(x, y, q = 1) {
    this.x = x;
    this.y = y;
    this.q = q;
  }
}

/**
 * @class Boundary
 * @description 空間内の矩形領域を定義します。Quadtreeの各ノードが担当する範囲を示します。
 */
class Boundary {
  /**
   * @param {number} x - 矩形の左上のx座標
   * @param {number} y - 矩形の左上のy座標
   * @param {number} w - 矩形の幅
   * @param {number} h - 矩形の高さ
   */
  constructor(x, y, w, h) {
    this.x = x;
    this.y = y;
    this.w = w;
    this.h = h;
  }

  /**
   * 指定された点がこの境界内に含まれるか判定します。
   * @param {Point} point - 判定対象の点
   * @returns {boolean} - 点が境界内であればtrue
   */
  contain(point) {
    let between = (x, left, right) => left <= x && x <= right;
    let containX = between(point.x, this.x, this.x + this.w);
    let containY = between(point.y, this.y, this.y + this.h);
    return containX && containY;
  }

  area() {
    return this.w * this.h;
  }
}

/**
 * @class BarnesHutTree
 * @description Barnes-Hutアルゴリズムの本体であるQuadtree（四分木）です。
 */
class BarnesHutTree {
  /**
   * @param {Boundary} boundary - この木（ノード）が担当する空間領域
   */
  constructor(boundary) {
    this.point = null; // このノードに直接格納されている点
    this.boundary = boundary; // このノードが担当する領域
    // 4つの子ノード（象限）
    this.tl = null; // Top-Left
    this.tr = null; // Top-Right
    this.bl = null; // Bottom-Left
    this.br = null; // Bottom-Right
    this.gravityPoint = null; // このノードに含まれる全点の重心
    this.sameNodeThreshold = 0.001;
  }

  /**
   * このノードが葉（子ノードを持たない）であるか判定します。
   * @returns {boolean} - 葉であればtrue
   */
  isLeaf() {
    return (
      this.tl == null && this.tr == null && this.bl == null && this.br == null
    );
  }

  /**
   * このノードの子ノードのリストを返します。
   * @returns {BarnesHutTree[]}
   */
  children() {
    let child = [];
    if (this.tl != null) child.push(this.tl);
    if (this.tr != null) child.push(this.tr);
    if (this.bl != null) child.push(this.bl);
    if (this.br != null) child.push(this.br);

    return child;
  }

  /**
   * 木に新しい点を追加します。
   * @param {Point} point - 追加する点
   */
  add(point) {
    // 点がこのノードの境界内にない場合は処理しない
    if (!this.boundary.contain(point)) {
      return;
    }

    // ケース1: このノードが内部ノードの場合
    if (!this.isLeaf()) {
      this.containSubtree(point).add(point);
      this.updateGravityPoint();
      return;
    }

    // ケース2: このノードが葉ノードの場合
    // 2a: 葉ノードが空の場合
    if (this.point == null) {
      this.point = point;
      this.updateGravityPoint();
      return;
    }

    // 2b: 葉ノードに既に点が存在する場合 (ノードを分割)

    // 座標がほぼ一致していたら一つの粒子としてまとめる
    const dist = Math.hypot(this.point.x - point.x, this.point.y - point.y);
    if (dist < this.sameNodeThreshold) {
      this.point.q += point.q;
      return;
    }

    // 既存の点を保持
    const existingPoint = this.point;
    // このノードは内部ノードになるため、点をクリア
    this.point = null;

    // 空間を4つに分割
    this.separateBoundary();

    // 既存の点と新しい点を、それぞれ適切な子ノードに追加する
    this.containSubtree(existingPoint).add(existingPoint);
    this.containSubtree(point).add(point);

    // 重心を更新
    this.updateGravityPoint();
  }

  /**
   * 現在のノードの境界を4つの子象限に分割します。
   */
  separateBoundary() {
    let { x, y, w, h } = this.boundary;
    this.tl = new BarnesHutTree(new Boundary(x, y, w / 2, h / 2));
    this.tr = new BarnesHutTree(new Boundary(x + w / 2, y, w / 2, h / 2));
    this.bl = new BarnesHutTree(new Boundary(x, y + h / 2, w / 2, h / 2));
    this.br = new BarnesHutTree(
      new Boundary(x + w / 2, y + h / 2, w / 2, h / 2)
    );
  }

  /**
   * 指定された点がどの象限（子ノード）に含まれるかを返します。
   * @param {Point} point - 判定対象の点
   * @returns {BarnesHutTree | null} - 対応する子ノード
   */
  containSubtree(point) {
    // if (!this.boundary.contain(point)) {
    //   return null;
    // }

    if (point.y <= this.boundary.y + this.boundary.h / 2) {
      // 上半分
      if (point.x <= this.boundary.x + this.boundary.w / 2) {
        return this.tl; // 左上
      }
      return this.tr; // 右上
    } else {
      // 下半分
      if (point.x <= this.boundary.x + this.boundary.w / 2) {
        return this.bl; // 左下
      }
      return this.br; // 右下
    }
  }

  /**
   * このノード（およびその全ての子孫）に含まれる点の重心を計算・更新します。
   */
  updateGravityPoint() {
    if (this.isLeaf()) {
      this.gravityPoint = this.point;
      return;
    }

    let totalQ = 0;
    let weightX = 0;
    let weightY = 0;
    // 子ノードの重心を使って、このノードの重心を計算
    this.children().forEach((t) => {
      if (t.gravityPoint != null) {
        let { x, y, q } = t.gravityPoint;
        totalQ += Math.abs(q);
        weightX += x * q;
        weightY += y * q;
      }
    });

    if (totalQ > 0) {
      this.gravityPoint = new Point(weightX / totalQ, weightY / totalQ, totalQ);
    } else {
      this.gravityPoint = null;
    }
  }
}
