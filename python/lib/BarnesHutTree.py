import math
from dataclasses import dataclass, KW_ONLY


@dataclass
class Point:
    x: float
    y: float
    q: float = 1


@dataclass
class Boundary:
    x: float
    y: float
    w: float
    h: float

    def contain(self, point: Point):
        contain_x = self.x <= point.x <= self.x + self.w
        contain_y = self.y <= point.y <= self.y + self.h
        return contain_x and contain_y

    @property
    def area(self):
        return self.w * self.h


@dataclass
class BarnesHutTree:
    boundary: Boundary
    _: KW_ONLY
    point: Point = None
    gravity_point: Point = None
    tl: "BarnesHutTree" = None
    tr: "BarnesHutTree" = None
    bl: "BarnesHutTree" = None
    br: "BarnesHutTree" = None
    same_node_threshold: float = 0.001

    def __str__(self):
        info = f"BarnesHutTree @ {self.boundary!r}\n"
        if self.is_leaf():
            info += f"└─ Leaf Node | Point: {self.point!r}"
        else:
            info += f"├─ Internal Node | Gravity Point: {self.gravity_point!r}\n"
            info += f"└─ Children: {len(self.children())}"
        return info

    def is_leaf(self):
        return (
            self.tl is None and self.tr is None and self.bl is None and self.br is None
        )

    def children(self) -> list["BarnesHutTree"]:
        child = []
        if self.tl is not None:
            child.append(self.tl)
        if self.tr is not None:
            child.append(self.tr)
        if self.bl is not None:
            child.append(self.bl)
        if self.br is not None:
            child.append(self.br)
        return child

    def add(self, point: Point):
        if not self.boundary.contain(point):
            return

        if not self.is_leaf():
            self.contain_subtree(point).add(point)
            return

        if self.point is None:
            self.point = point
            return

        dist = math.hypot(self.point.x - point.x, self.point.y - point.y)
        if dist < self.same_node_threshold:
            self.point.q += point.q
            return

        existing_point = self.point
        self.point = None

        self.contain_subtree(existing_point).add(existing_point)
        self.contain_subtree(point).add(point)

    def contain_subtree(self, point: Point):
        b = self.boundary
        is_top = point.y < b.y + b.h / 2
        is_left = point.x < b.x + b.w / 2

        if is_top:
            if is_left:
                # 左上 (Top-Left)
                if self.tl is None:
                    self.tl = BarnesHutTree(Boundary(b.x, b.y, b.w / 2, b.h / 2))
                return self.tl
            else:
                # 右上 (Top-Right)
                if self.tr is None:
                    self.tr = BarnesHutTree(
                        Boundary(b.x + b.w / 2, b.y, b.w / 2, b.h / 2)
                    )
                return self.tr
        else:
            if is_left:
                # 左下 (Bottom-Left)
                if self.bl is None:
                    self.bl = BarnesHutTree(
                        Boundary(b.x, b.y + b.h / 2, b.w / 2, b.h / 2)
                    )
                return self.bl
            else:
                # 右下 (Bottom-Right)
                if self.br is None:
                    self.br = BarnesHutTree(
                        Boundary(b.x + b.w / 2, b.y + b.h / 2, b.w / 2, b.h / 2)
                    )
                return self.br

    def update_gravity_point(self):
        if self.is_leaf():
            self.gravity_point = self.point
            return

        total_q = 0
        weight_x = 0
        weight_y = 0

        for t in self.children():
            t.update_gravity_point()
            if t.gravity_point is not None:
                g = t.gravity_point
                total_q += g.q
                weight_x += g.x * g.q
                weight_y += g.y * g.q

        if total_q > 0:
            self.gravity_point = Point(weight_x / total_q, weight_y / total_q, total_q)
        else:
            self.gravity_point = None


