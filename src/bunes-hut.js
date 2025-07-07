class Point {
  constructor(x, y, q = 1) {
    this.x = x;
    this.y = y;
    this.q = q;
  }
}

class Boundary {
  constructor(x, y, w, h) {
    this.x = x;
    this.y = y;
    this.w = w;
    this.h = h;
  }

  contain(point) {
    let between = (x, left, right) => left <= x && x <= right;
    let containX = between(point.x, this.x, this.x + this.w);
    let containY = between(point.y, this.y, this.y + this.h);
    return containX && containY;
  }
}

class BarnesHutTree {
  constructor(boundary) {
    this.point = null;
    this.boundary = boundary;
    this.tl = null;
    this.tr = null;
    this.bl = null;
    this.br = null;
    this.gravityPoint = null;
  }

  isLeaf() {
    return (
      this.tl == null && this.tr == null && this.bl == null && this.br == null
    );
  }

  children() {
    let child = [];
    if (this.tl != null) child.push(this.tl);
    if (this.tr != null) child.push(this.tr);
    if (this.bl != null) child.push(this.bl);
    if (this.br != null) child.push(this.br);

    return child;
  }

  add(point) {
    if (this.isLeaf() && this.point == null) {
      this.point = point;
    } else {
      // add to subtree
      if (this.point != null) {
        this.separateBoundary();
        let subtree = this.containSubtree(this.point);
        subtree.add(this.point);
        this.point = null;
      }

      let subtree = this.containSubtree(point);
      subtree.add(point);
    }

    this.updateGravityPoint();
  }

  separateBoundary() {
    let { x, y, w, h } = this.boundary;
    this.tl = new BarnesHutTree(new Boundary(x, y, w / 2, h / 2));
    this.tr = new BarnesHutTree(new Boundary(x + w / 2, y, w / 2, h / 2));
    this.bl = new BarnesHutTree(new Boundary(x, y + h / 2, w / 2, h / 2));
    this.br = new BarnesHutTree(
      new Boundary(x + w / 2, y + h / 2, w / 2, h / 2)
    );
  }

  containSubtree(point) {
    if (!this.boundary.contain(point)) {
      return null;
    }

    if (point.y <= this.boundary.y + this.boundary.h / 2) {
      // top left
      if (point.x <= this.boundary.x + this.boundary.w / 2) {
        return this.tl;
      }
      // top right
      return this.tr;
    } else {
      // bottom left
      if (point.x <= this.boundary.x + this.boundary.w / 2) {
        return this.bl;
      }
      // bottom right
      return this.br;
    }

    return null;
  }

  // 子供の重心 の重心.
  updateGravityPoint() {
    if (this.isLeaf()) {
      this.gravityPoint = this.point;
      return;
    }

    let totalQ = 0;
    let weightX = 0;
    let weightY = 0;
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

// export {BarnesHutTree, Point, Boundary}
