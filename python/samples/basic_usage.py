import sys
import os

# プロジェクトのルートディレクトリをsys.pathに追加
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), "..")))

from lib.BarnesHutTree import Point, Boundary, BarnesHutTree
from lib.util import print_BHtree


def main():
    """
    Barnes-Hutツリーの基本的な使用方法を示すサンプル。
    """
    # 1. シミュレーション空間の境界を定義
    boundary = Boundary(x=0, y=0, w=100, h=100)

    # 2. Barnes-Hutツリーを初期化
    tree = BarnesHutTree(boundary)
    print("--- Initial Tree State ---")
    print(tree)
    print("\n" + "=" * 30 + "\n")

    # 3. いくつかの点を定義
    points = [
        Point(x=20, y=30),
        Point(x=80, y=70),
        Point(x=10, y=90),
        Point(x=95, y=15),
        Point(x=55, y=55),
        Point(x=55, y=35),
    ]

    # 4. 点をツリーに追加
    print("--- Adding Points ---")
    for i, p in enumerate(points):
        print(f"Adding point {i + 1}: {p!r}")
        tree.add(p)
    tree.update_gravity_point()

    print("\n" + "=" * 30 + "\n")

    # 5. 最終的なツリーの状態と重心を確認
    print("--- Final Tree Root State ---")
    print(tree)
    print(f"\nFinal Gravity Point: {tree.gravity_point!r}\n")

    print("--- Final Tree Structure ---")
    print_BHtree(tree)


if __name__ == "__main__":
    main()
