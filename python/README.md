# Barnes Hut Tree in Python

## Enviroment

- package maneger
  - uv
  - <https://docs.astral.sh/uv/guides/install-python/>
- python version
  - 3.12
- workspace
  - `path/to/Barnes-hut/python`

## Run samples

- basic usage

```bash
# cd python
uv sync
uv run python samples/*.py
```

## Run test

```bash
# cd python
uv sync
uv run python -m unittest discover tests -t .
# テスト項目名がほしい場合
# uv run python -m unittest discover tests -t . -v
```
