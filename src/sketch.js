/**
 * @file p5.jsのメインスケッチファイルです。
 * 力指向配置アルゴリズムのシミュレーションをセットアップし、描画ループを管理します。
 */

// --- グローバル変数 ---
let layout = null; // FDPLayoutクラスのインスタンス
let temperature = 1.0; // シミュレーションの温度。高いほどノードの動きが大きい
let t = 0; // 経過フレーム数

/**
 * p5.jsのsetup関数。プログラム開始時に一度だけ実行されます。
 * キャンバスを作成し、グラフデータを初期化してレイアウトエンジンに渡します。
 */
function setup() {
  createCanvas(400, 400);

  // --- グラフデータの定義 ---
  // 隣接リスト形式のグラフ
  const graph = [[1], [0, 3, 4], [3, 5], [1, 2, 4], [1, 3], [2]];
  // 各ノードの初期位置
  const pos = [
    [0.6897927410102785, 1.8633360657738784],
    [1.998349565808713, 2.148706089170453],
    [0.5146614361273951, 0.9543305881316088],
    [1.2990912822525318, 1.5576078551919947],
    [1.2641901566595386, 1.8782536273884058],
    [0.11634882392203322, 1.890762445560767],
  ];

  // --- データ構造の変換 ---
  // ノードオブジェクトの配列を作成
  const nodes = pos.map(([x, y], i) => {
    // 座標をキャンバスサイズに合わせる
    let n = new Node(x * 100, y * 100, i);
    return n;
  });
  // エッジリスト（インデックスのペア）を作成
  const edgeIndices = graph.map((vs, i) => vs.map((v) => [i, v])).flat();

  // レイアウトエンジンを初期化
  layout = new FDPLayout(nodes, edgeIndices);
  frameRate(30); // フレームレートを設定
}

/**
 * p5.jsのdraw関数。フレームごとに繰り返し実行されます。
 * シミュレーションを1ステップ進め、結果をキャンバスに描画します。
 */
function draw() {
  background(255); // 背景を白で塗りつぶし

  // レイアウトを1ステップ更新
  layout.update(temperature);

  // --- 描画処理 ---
  const scaleCoords = (p) => {
    // レイアウト空間の座標をキャンバスの座標に変換
    return [p.x, p.y];
  };

  // エッジ（線）を描画
  layout.edgeIndices.forEach(([i, j]) => {
    let [scaledXi, scaledYi] = scaleCoords(layout.nodes[i].p);
    let [scaledXj, scaledYj] = scaleCoords(layout.nodes[j].p);
    stroke(100, 100, 100, 150); // 灰色
    strokeWeight(2);
    line(scaledXi, scaledYi, scaledXj, scaledYj);
  });

  // ノード（円）を描画
  layout.nodes.forEach((v) => {
    let [scaledX, scaledY] = scaleCoords(v.p);
    noStroke();
    fill(60, 120, 255); // 青色
    ellipse(scaledX, scaledY, 12, 12);
  });

  // --- シミュレーションの制御 ---
  // 温度を徐々に下げる（シミュレーテッドアニーリング）
  temperature *= 0.99;
  t += 1;

  // 温度が一定以下になったら、シミュレーションを停止して安定させる
  if (temperature < 0.01) {
    noLoop();
    console.log("Simulation finished.");
  }
  console.log("temp", temperature, "iter t", t);
}
