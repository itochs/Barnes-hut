class RendererBHT {
  constructor(tree) {
    this.tree = tree;
    this.nodeSize = 3;
    this.nodeColor = color(0);
    this.gravityColor = color(255, 0, 0);
    this.boundaryBackground = color(0, 20);
    this.boundaryStrokeOnColor = color(255, 0, 0, 20);
    this.boundaryStrokeOffColor = color(220);
  }

  draw() {
    push();
    this.drawTree(this.tree);
    pop();
  }

  drawTree(tree) {
    if (tree.point == null) {
      if (tree.tl != null) this.drawTree(tree.tl);
      if (tree.tr != null) this.drawTree(tree.tr);
      if (tree.bl != null) this.drawTree(tree.bl);
      if (tree.br != null) this.drawTree(tree.br);

      if (!tree.isLeaf() && tree.gravityPoint != null) {
        this.drawPoint(
          tree.gravityPoint,
          this.gravityColor,
          this.nodeSize * 1.3
        );

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
    this.drawBoundary(tree.boundary, this.boundaryStrokeOffColor);
    this.drawPoint(tree.point, this.nodeColor, this.nodeSize);
  }

  drawPoint(point, clr, r) {
    push();
    noStroke();
    fill(clr);
    ellipse(point.x, point.y, r, r);
    pop();
  }

  drawBoundary(boundary, strokeColor) {
    push();
    this.drawBoundaryOutline(boundary, strokeColor);
    noStroke();
    fill(this.boundaryBackground);
    rect(boundary.x, boundary.y, boundary.w, boundary.h);
    pop();
  }

  drawBoundaryOutline(boundary, strokeColor) {
    push();
    noFill();
    strokeWeight(1);
    stroke(strokeColor);
    rect(boundary.x, boundary.y, boundary.w, boundary.h);
    pop();
  }
}
