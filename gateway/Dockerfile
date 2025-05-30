FROM elixir:alpine AS builder

WORKDIR /app

ENV MIX_ENV="prod"

COPY . .

RUN mix local.hex --force
RUN mix local.rebar --force

RUN mix deps.get
RUN mix deps.compile
RUN mix release all

FROM elixir:alpine

COPY --from=builder /app/_build/prod/rel/all .

CMD [ "./bin/all", "start" ]