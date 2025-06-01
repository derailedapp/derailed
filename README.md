![Derailed](./site/src/components/derailed_logo.svg)

# The People's Social Media.

This is the source code and various resources of Derailed's services.
This is not a Derailed wiki but rather a technical overview.

## Internal Components

### Gateway

The Gateway serves to provide events and other critical information to users in real-time. It is built in the resilient and fault tolerant Elixir.

### API

Derailed's API is built in Python using FastAPI.

### (Web) App

Derailed's web app built with Svelte, primarily using custom-made components paired with `bits-ui`.

### Site

This is Derailed's marketing, newsroom, and miscellaneous website, found at [derailed.top](https://derailed.top/)

## External Components

### PostgreSQL

Our API and Gateway both utilize Postgres to centralize data upon.

### gRPC

The API communicates events (alongside fetching active guild information) to the Gateway using gRPC.

## Licensing and Freedom

Derailed is freely licensed under the GNU Affero General Public License v3. A copy of which can be found [here](https://github.com/derailedapp/derailed/blob/9c5fb13c625f93d5bf787d719ce1ed7ab042fea4/LICENSE.md).

This license however does not give you the right to use Derailed's brand materials or name, so you must make sure to replace all materials before publicly deploying Derailed.
