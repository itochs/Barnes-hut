# Barnes Hut Tree in Python

## Enviroment

- package maneger
  - uv
  - <https://docs.astral.sh/uv/guides/install-python/>
  - matplotlibが入ればuvでなくて良い
- python version
  - 3.12
- workspace
  - `path/to/Barnes-hut/python`

## Run samples


```bash
# cd python
uv sync
uv run python samples/*.py
```

- uvを使わない場合
  - `visualize_tree.py`を実行する場合：`matplotlib`を入れる
  - `uv sync`はしなくていい
  - 通常通り実行

## Run test

```bash
# cd python
uv sync
uv run python -m unittest discover tests -t .
# テスト項目名がほしい場合
# uv run python -m unittest discover tests -t . -v
```

- uvを使わない場合
  - `uv sync`はしなくていい
  - `python -m unittest discover tests -t .`
