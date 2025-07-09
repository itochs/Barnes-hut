/**
 * @file Barnes-Hut木構造（Quadtree）を可視化（描画）するためのクラスです。
 */

/**
 * @class RendererBHT
 * @description Barnes-Hut木を受け取り、p5.jsのキャンバスに描画します。
 */
class RendererBHT {
  /**
   * @param {BarnesHutTree} tree - 描画対象のBarnes-Hut木
   */
  constructor(tree) {
    this.tree = tree;
    // --- 描画設定 ---
    this.nodeSize = 3; // 通常の点の半径
    this.nodeColor = color(0); // 通常の点の色（黒）
    this.gravityColor = color(255, 0, 0); // 重心の色（赤）
    this.boundaryBackground = color(0, 20); // 境界の背景色（半透明の黒）
    this.boundaryStrokeOnColor = color(255, 0, 0, 20); // アクティブな境界の枠線の色（半透明の赤）
    this.boundaryStrokeOffColor = color(220); // 非アクティブな境界の枠線の色（灰色）
  }

  /**
   * 木全体の描画を開始します。
   */
  draw() {
    push();
    this.drawTree(this.tree);
    pop();
  }

  /**
   * 木を再帰的に描画します。
   * @param {BarnesHutTree} tree - 描画する木（またはサブツリー）
   */
  drawTree(tree) {
    // 内部ノードの場合
    if (tree.point == null) {
      // 4つの子ノードを再帰的に描画
      if (tree.tl != null) this.drawTree(tree.tl);
      if (tree.tr != null) this.drawTree(tree.tr);
      if (tree.bl != null) this.drawTree(tree.bl);
      if (tree.br != null) this.drawTree(tree.br);

      // 内部ノードで、重心が存在する場合、重心を描画
      if (!tree.isLeaf() && tree.gravityPoint != null) {
        this.drawPoint(
          tree.gravityPoint,
          this.gravityColor,
          this.nodeSize * 1.3 // 重心は少し大きく表示
        );

        // 重心と境界の中心を結ぶ線を描画（デバッグ用）
        let { x, y } = tree.gravityPoint;
        let { x: bx, y: by, w, h } = tree.boundary;
        push();
        stroke(255, 0, 0, 150);
        line(x, y, bx + w / 2, by + h / 2);
        pop();
        this.drawBoundaryOutline(tree.boundary, this.boundaryStrokeOnColor);
      }
      return;
    }
    // 葉ノードの場合
    this.drawBoundary(tree.boundary, this.boundaryStrokeOffColor);
    this.drawPoint(tree.point, this.nodeColor, this.nodeSize);
  }

  /**
   * 1つの点（円）を描画します。
   * @param {Point} point - 描画する点
   * @param {p5.Color} clr - 点の色
   * @param {number} r - 点の半径
   */
  drawPoint(point, clr, r) {
    push();
    noStroke();
    fill(clr);
    ellipse(point.x, point.y, r, r);
    pop();
  }

  /**
   * 1つの境界（矩形）を背景色付きで描画します。
   * @param {Boundary} boundary - 描画する境界
   * @param {p5.Color} strokeColor - 境界の枠線の色
   */
  drawBoundary(boundary, strokeColor) {
    push();
    this.drawBoundaryOutline(boundary, strokeColor);
    noStroke();
    fill(this.boundaryBackground);
    rect(boundary.x, boundary.y, boundary.w, boundary.h);
    pop();
  }

  /**
   * 1つの境界の枠線のみを描画します。
   * @param {Boundary} boundary - 描画する境界
   * @param {p5.Color} strokeColor - 枠線の色
   */
  drawBoundaryOutline(boundary, strokeColor) {
    push();
    noFill();
    strokeWeight(1);
    stroke(strokeColor);
    rect(boundary.x, boundary.y, boundary.w, boundary.h);
    pop();
  }
}
