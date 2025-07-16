import sys
import os
import random

# プロジェクトのルートディレクトリをsys.pathに追加
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), "..")))

from lib.BarnesHutTree import Point, BarnesHutTree, Boundary
import math


class Node:
    """シミュレーション内の各ノード（粒子）を表すクラス"""

    def __init__(self, p: Point, id: int):
        self.p = p  # 位置と質量を持つPointオブジェクト
        self.id = id  # ノードの一意なID

    def __repr__(self):
        return f"Node(id={self.id}, p={self.p!r})"


def calculate_repulsive_pairs(
    nodes: list[Node], threshold: float
) -> list[tuple[Node, Node]]:
    """
    Barnes-Hut法を用いて、斥力の計算対象となるノードのペアを計算する。

    :param nodes: 全てのノードのリスト
    :param threshold: Barnes-Hut法の閾値θ。大きいほど計算は速くなるが精度は落ちる
    :return: (ノード, 相手ノード/仮想ノード) のタプルのリスト
    """
    repulsive_pairs = []

    # 1. すべてのノードを内包するルートの境界を計算し、BHツリーを構築
    if not nodes:
        return []

    # ノードが広がるおおよその空間サイズを計算
    size = math.sqrt(len(nodes))
    tree = BarnesHutTree(Boundary(0, 0, size, size))
    for node in nodes:
        tree.add(node.p)
    tree.update_gravity_point()

    # 2. BHツリーを再帰的に探索するヘルパー関数を定義
    def _find_pairs_recursive(tree_node: BarnesHutTree, current_node: Node):
        gravity_point = tree_node.gravity_point
        if gravity_point is None:
            return  # この領域に粒子がなければ終了

        particle_pos = current_node.p
        dist = math.hypot(
            particle_pos.x - gravity_point.x, particle_pos.y - gravity_point.y
        )

        # 自身との距離がほぼ0の場合は無視
        if dist < 0.001:
            return

        # Barnes-Hut法のクライテリオン (s/d < θ)
        # tree.boundary.area() は s^2 に相当するので、少し変形した式を用いる
        # θ * d^2 > s^2  <==>  d^2/s^2 > 1/θ
        is_far_enough = threshold * dist * dist > tree_node.boundary.area

        if tree_node.is_leaf() or is_far_enough:
            # 条件を満たした場合 (葉ノード or 十分に遠い)
            # この領域の重心をひとつの仮想ノードとみなし、ペアとして追加
            super_node = Node(p=gravity_point, id=-1)  # ID=-1は仮想ノードを示す
            repulsive_pairs.append((current_node, super_node))
        else:
            # 条件を満たさない場合 (内部ノード and 近い)
            # 子ノードをさらに再帰的に探索
            for child in tree_node.children():
                _find_pairs_recursive(child, current_node)

    # 3. すべてのノードに対して、斥力の相手を探す
    for node in nodes:
        _find_pairs_recursive(tree, node)

    return repulsive_pairs


def main():
    """
    Barnes-Hut法を用いたForce-Directed Placement (FDP) の簡単なシミュレーション。
    """
    # 1. シミュレーション用のノードをランダムに生成
    num_nodes = 20
    nodes = [
        Node(
            p=Point(
                x=random.uniform(0, math.sqrt(num_nodes)),
                y=random.uniform(0, math.sqrt(num_nodes)),
            ),
            id=i,
        )
        for i in range(num_nodes)
    ]

    print("--- Initial Node Positions ---")
    for node in nodes:
        print(node)

    # 2. Barnes-Hut法の閾値θを設定
    # この値が大きいほど、遠くのノード群をより積極的にまとめるため計算は速くなるが、精度は低下する。
    theta = 0.5

    # 3. 斥力の計算対象となるペアを見つける
    # Barnes-Hut法により、すべてのノードペア (O(N^2)) ではなく、
    # 計算量を削減したペア (O(N log N)) を取得する。
    repulsive_pairs = calculate_repulsive_pairs(nodes, threshold=theta)

    print(f"\n--- Found {len(repulsive_pairs)} Repulsive Pairs (theta={theta}) ---")

    # 4. 各ノードに働く斥力を計算し、位置を更新（簡易版）
    # ここでは斥力の影響のみ
    force_strength = 0.1  # 力の影響の強さ

    node_force = [[0, 0] for _ in range(num_nodes + 1)]
    for node, opponent in repulsive_pairs:
        # opponentは他のノード、または複数のノードの重心を表す仮想ノード
        dx = node.p.x - opponent.p.x
        dy = node.p.y - opponent.p.y
        dist2 = dx**2 + dy**2

        if dist2 > 0:
            # 距離に反比例した斥力を適用
            force_x = (dx / dist2) * force_strength
            force_y = (dy / dist2) * force_strength

            # ノードの位置を更新
            node.p.x += force_x
            node.p.y += force_y
            node_force[node.id][0] += force_x
            node_force[node.id][1] += force_y

    for i in range(num_nodes):
        nodes[i].p.x += node_force[i][0]
        nodes[i].p.y += node_force[i][1]

    print("\n--- Node Positions After One Iteration of Repulsion ---")
    for node in nodes:
        print(node)


if __name__ == "__main__":
    main()
