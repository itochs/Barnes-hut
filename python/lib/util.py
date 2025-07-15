from .BarnesHutTree import BarnesHutTree


def print_BHtree(tree_node):
    """
    BarnesHutTreeのインスタンスを受け取り、その構造を表示する外部関数。

    :param tree_node: 表示したいBarnesHutTreeのルートノード
    """
    # tree_nodeがBarnesHutTreeのインスタンスであることを確認
    if not isinstance(tree_node, BarnesHutTree):
        print("Error: 引数はBarnesHutTreeのインスタンスである必要があります。")
        return

    def _print_node_recursive(node, prefix, is_last, name):
        # 1. 現在のノード情報を表示
        connector = "└── " if is_last else "├── "
        node_info = f"{name} @ {node.boundary!r}"

        if node.is_leaf():
            node_info += f" | Leaf Point: {node.point!r}"
        else:
            node_info += f" | Gravity Point: {node.gravity_point!r}"

        print(prefix + connector + node_info)

        # 2. 子ノードのリストを作成
        child_prefix = prefix + ("   " if is_last else "│   ")

        named_children = []
        if node.tl:
            named_children.append(("TL", node.tl))
        if node.tr:
            named_children.append(("TR", node.tr))
        if node.bl:
            named_children.append(("BL", node.bl))
        if node.br:
            named_children.append(("BR", node.br))

        # 3. 子ノードに対して再帰呼び出し
        child_count = len(named_children)
        for i, (child_name, child_node) in enumerate(named_children):
            is_child_last = i == child_count - 1
            _print_node_recursive(child_node, child_prefix, is_child_last, child_name)

    _print_node_recursive(tree_node, prefix="", is_last=True, name="Root")
