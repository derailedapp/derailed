
use std::env;

use snowdon::{ClassicLayout, Epoch, Generator, MachineId};

#[derive(Debug)]
pub struct SnowflakeParameters;

impl MachineId for SnowflakeParameters {
    fn machine_id() -> u64 {
        env::var("MACHINE_ID")
            .unwrap_or("0".to_string())
            .parse::<u64>()
            .unwrap()
    }
}

impl Epoch for SnowflakeParameters {
    fn millis_since_unix() -> u64 {
        1649325271415
    }
}

pub type SnowflakeGenerator = Generator<ClassicLayout<SnowflakeParameters>, SnowflakeParameters>;
// pub type Snowflake = snowdon::Snowflake<ClassicLayout<SnowflakeParameters>, SnowflakeParameters>;