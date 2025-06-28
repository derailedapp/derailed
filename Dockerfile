FROM rust:alpine AS builder

WORKDIR /derailed

COPY ./Cargo.toml ./Cargo.lock ./
COPY ./crates ./crates
COPY ./.sqlx ./.sqlx

ENV SQLX_OFFLINE=true

RUN apk add openssl-dev musl-dev openssl-libs-static
RUN rustup update nightly && rustup default nightly;

RUN cargo build --release
RUN cargo install sqlx-cli --no-default-features --features native-tls,postgres

FROM alpine

WORKDIR /derailed

COPY --from=builder /derailed/target/release/api /usr/local/bin/backend
COPY --from=builder /usr/local/cargo/bin/sqlx /usr/local/bin/sqlx
COPY ./entrypoint.sh .
COPY ./migrations ./migrations

RUN chmod +x ./entrypoint.sh

CMD ["./entrypoint.sh"]