import sys
import os
import random
import matplotlib.pyplot as plt
import matplotlib.patches as patches

# プロジェクトのルートディレクトリをsys.pathに追加
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), "..")))

from lib.BarnesHutTree import Point, Boundary, BarnesHutTree


def plot_tree(ax, tree: BarnesHutTree):
    """
    Barnes-Hutツリーの境界と点を再帰的に描画する。
    """
    # 1. 境界線を描画
    b = tree.boundary
    rect = patches.Rectangle(
        (b.x, b.y), b.w, b.h, linewidth=1, edgecolor="gray", facecolor="none", alpha=0.6
    )
    ax.add_patch(rect)

    # 2. 葉ノードであれば、点を描画
    if tree.is_leaf():
        if tree.point:
            ax.scatter(
                tree.point.x, tree.point.y, c="blue", s=10
            )  # 粒子を青い点としてプロット
    # 3. 内部ノードであれば、重心を描画し、子ノードを再帰的に描画
    else:
        if tree.gravity_point:
            ax.scatter(
                tree.gravity_point.x, tree.gravity_point.y, c="red", marker="x"
            )  # 重心を赤いx印でプロット

        for child in tree.children():
            plot_tree(ax, child)


def main():
    """
    Barnes-Hutツリーをmatplotlibで可視化するサンプル。
    """
    # 1. シミュレーション空間の境界とツリーを初期化
    boundary = Boundary(x=0, y=0, w=100, h=100)
    tree = BarnesHutTree(boundary)

    # 2. ランダムな点を生成してツリーに追加
    num_points = 50
    points = [
        Point(x=random.uniform(0, 100), y=random.uniform(0, 100))
        for _ in range(num_points)
    ]

    for p in points:
        tree.add(p)
    tree.update_gravity_point()

    # 3. 可視化の準備
    fig, ax = plt.subplots(figsize=(8, 8))
    ax.set_aspect("equal", adjustable="box")
    ax.set_xlim(boundary.x, boundary.x + boundary.w)
    ax.set_ylim(boundary.y, boundary.y + boundary.h)
    ax.set_title("Barnes-Hut Tree Visualization")
    ax.set_xlabel("X-coordinate")
    ax.set_ylabel("Y-coordinate")

    # 4. ツリーを描画
    plot_tree(ax, tree)

    # 5. 画像を保存
    os.makedirs("./dest", exist_ok=True)
    output_path = "./dest/barnes_hut_tree.png"
    plt.savefig(output_path)
    print(f"Saved visualization to {output_path}")
    plt.show()


if __name__ == "__main__":
    # matplotlibがインストールされているか確認
    try:
        import matplotlib  # noqa: F401
    except ImportError:
        print(
            "Error: matplotlib is not installed. Please install it using `uv sync` or 'uv add matplotlib'"
        )
        sys.exit(1)
    main()
