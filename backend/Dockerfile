FROM python:3.13-slim

WORKDIR /code

RUN pip install uv

COPY pyproject.toml ./
RUN uv pip install --system -r pyproject.toml

COPY alembic.ini ./
COPY alembic/ ./alembic/
COPY app/ ./app/

CMD ["fastapi", "dev", "app/main.py", "--host", "0.0.0.0"]
