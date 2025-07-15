import sys
import os
import random

# プロジェクトのルートディレクトリをsys.pathに追加
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), '..')))

from lib.BarnesHutTree import Point, Node, calculate_repulsive_pairs

def main():
    """
    Barnes-Hut法を用いたForce-Directed Placement (FDP) の簡単なシミュレーション。
    """
    # 1. シミュレーション用のノードをランダムに生成
    num_nodes = 20
    nodes = [
        Node(p=Point(x=random.uniform(0, 100), y=random.uniform(0, 100)), id=i)
        for i in range(num_nodes)
    ]

    print("--- Initial Node Positions ---")
    for node in nodes:
        print(node)

    # 2. Barnes-Hut法の閾値θを設定
    # この値が大きいほど、遠くのノード群をより積極的にまとめるため計算は速くなるが、精度は低下する。
    # 0.5は一般的な値。
    theta = 0.5

    # 3. 斥力の計算対象となるペアを見つける
    # Barnes-Hut法により、すべてのノードペア (O(N^2)) ではなく、
    # 計算量を削減したペア (O(N log N)) を取得する。
    repulsive_pairs = calculate_repulsive_pairs(nodes, threshold=theta)

    print(f"\n--- Found {len(repulsive_pairs)} Repulsive Pairs (theta={theta}) ---")

    # 4. 各ノードに働く斥力を計算し、位置を更新（簡易版）
    # 本来は力の大きさを距離に応じて減衰させたり、ばねの引力を考慮したりするが、ここでは斥力の影響のみを簡易的に示す。
    force_strength = 0.1  # 力の影響の強さ

    for node, opponent in repulsive_pairs:
        # opponentは他のノード、または複数のノードの重心を表す仮想ノード
        dx = node.p.x - opponent.p.x
        dy = node.p.y - opponent.p.y
        dist = (dx**2 + dy**2)**0.5

        if dist > 0:
            # 距離に反比例した斥力を適用
            force_x = (dx / dist) * (opponent.p.q / dist) * force_strength
            force_y = (dy / dist) * (opponent.p.q / dist) * force_strength

            # ノードの位置を更新
            node.p.x += force_x
            node.p.y += force_y

    print("\n--- Node Positions After One Iteration of Repulsion ---")
    for node in nodes:
        print(node)


if __name__ == "__main__":
    main()
