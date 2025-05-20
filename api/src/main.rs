use std::sync::Arc;

mod snow;

use sqlx::PgPool;

pub struct State {
    db: PgPool,
    snow: Arc<snow::SnowflakeGenerator>
}

#[tokio::main]
async fn main() {
    println!("Hello, world!");
}
