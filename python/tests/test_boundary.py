import unittest

from lib.BarnesHutTree import Point, Boundary


class TestBoundary(unittest.TestCase):
    """Boundaryクラスのテスト"""

    def setUp(self):
        """各テストの前に共通のBoundaryインスタンスを作成"""
        self.boundary = Boundary(x=0, y=0, w=100, h=100)

    def test_contain_point(self):
        """点が領域内に含まれるかのテスト"""
        self.assertTrue(self.boundary.contain(Point(50, 50)), "中心点は含まれるべき")
        self.assertTrue(self.boundary.contain(Point(0, 0)), "左上の角は含まれるべき")
        self.assertTrue(
            self.boundary.contain(Point(100, 100)), "右下の角は含まれるべき"
        )
        self.assertFalse(
            self.boundary.contain(Point(101, 50)), "Xが範囲外の点は含まれないべき"
        )
        self.assertFalse(
            self.boundary.contain(Point(50, -1)), "Yが範囲外の点は含まれないべき"
        )


if __name__ == "__main__":
    unittest.main()
