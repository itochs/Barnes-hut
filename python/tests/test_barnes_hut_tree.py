import unittest

from lib.BarnesHutTree import Point, Boundary, BarnesHutTree


class TestBarnesHutTree(unittest.TestCase):
    """BarnesHutTreeクラスのテスト"""

    def setUp(self):
        """各テストの前に共通のツリーインスタンスを作成"""
        boundary = Boundary(0, 0, 400, 400)
        self.tree = BarnesHutTree(boundary)

    def test_initial_state(self):
        """初期状態が正しいかテスト"""
        self.assertTrue(self.tree.is_leaf(), "初期状態では葉ノードであるべき")
        self.assertIsNone(self.tree.point, "初期状態では点は存在しないべき")

    def test_add_first_point(self):
        """最初の点を追加するテスト"""
        p1 = Point(100, 100)
        self.tree.add(p1)
        self.tree.update_gravity_point()
        self.assertTrue(self.tree.is_leaf(), "点が1つの場合は葉ノードのまま")
        self.assertEqual(self.tree.point, p1, "追加した点が保持されているべき")
        self.assertEqual(
            self.tree.gravity_point, p1, "重心は追加した点と同じであるべき"
        )

    def test_add_second_point_subdivides(self):
        """2番目の点を追加すると空間が分割されるかテスト"""
        p1 = Point(100, 100)  # 左上(TL)の象限
        p2 = Point(300, 300)  # 右下(BR)の象限
        self.tree.add(p1)
        self.tree.add(p2)

        self.assertFalse(self.tree.is_leaf(), "点が2つになると内部ノードになるべき")
        self.assertIsNone(self.tree.point, "内部ノードは直接点を持たないべき")
        self.assertIsNotNone(self.tree.tl, "左上の子ノードが生成されているべき")
        self.assertIsNotNone(self.tree.br, "右下の子ノードが生成されているべき")
        self.assertEqual(self.tree.tl.point, p1, "p1は左上の子ノードに格納されるべき")
        self.assertEqual(self.tree.br.point, p2, "p2は右下の子ノードに格納されるべき")

    def test_gravity_point_calculation(self):
        """重心が正しく計算されるかテスト"""
        p1 = Point(100, 100, q=1)  # 質量1
        p2 = Point(300, 100, q=3)  # 質量3
        self.tree.add(p1)
        self.tree.add(p2)
        self.tree.update_gravity_point()

        # 期待される重心位置: x = (100*1 + 300*3) / (1+3) = 1000 / 4 = 250
        # 期待される重心位置: y = (100*1 + 100*3) / (1+3) = 400 / 4 = 100
        # 期待される総質量: q = 1 + 3 = 4
        gp = self.tree.gravity_point
        self.assertAlmostEqual(gp.x, 250.0)
        self.assertAlmostEqual(gp.y, 100.0)
        self.assertEqual(gp.q, 4)

    def test_add_point_outside_boundary(self):
        """領域外の点を追加しても無視されるかテスト"""
        p_out = Point(500, 500)
        self.tree.add(p_out)
        self.assertTrue(
            self.tree.is_leaf(), "領域外の点を追加しても状態は変わらないべき"
        )
        self.assertIsNone(self.tree.point, "領域外の点は追加されないべき")

    def test_merge_close_points(self):
        """非常に近い点が追加された場合にマージされるかテスト"""
        p1 = Point(100, 100, q=2)
        # same_node_threshold (0.001) より近い距離にある点
        p2 = Point(100.0001, 100.0001, q=3)

        self.tree.add(p1)
        self.tree.add(p2)

        self.assertTrue(
            self.tree.is_leaf(), "近接点はマージされ、葉ノードのままであるべき"
        )
        self.assertEqual(self.tree.point.q, 5, "質量は合計されるべき")
        # 座標は最初の点のまま
        self.assertEqual(self.tree.point.x, 100)
        self.assertEqual(self.tree.point.y, 100)


if __name__ == "__main__":
    unittest.main()
