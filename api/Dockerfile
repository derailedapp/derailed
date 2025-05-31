FROM rust:alpine AS sqlx

RUN apk add --no-cache musl-dev openssl-dev openssl-libs-static openssl
RUN cargo install sqlx-cli --no-default-features --features native-tls,postgres

FROM ghcr.io/astral-sh/uv:python3.12-alpine

RUN apk add --no-cache libgcc openssl vips

COPY --from=sqlx /usr/local/cargo/bin/sqlx /usr/local/bin/sqlx

WORKDIR /app
COPY . .

RUN uv sync --locked
RUN chmod +x ./entrypoint.sh

CMD ["./entrypoint.sh"]