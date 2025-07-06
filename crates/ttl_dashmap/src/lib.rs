use dashmap::DashMap;
use std::time::{Instant, Duration};
use std::hash::Hash;

#[derive(Debug, Clone)]
pub struct TtlDashmap<K, V>
where
    K: Eq + Hash + Clone,
    V: Clone
{
    map: DashMap<K, (V, Instant)>,
    ttl: Duration,
}

impl<K, V> TtlDashmap<K, V>
where
  K: Eq + Hash + Clone,
  V: Clone
{
    pub fn new(ttl: Duration) -> Self {
        Self {
            map: DashMap::<K, (V, Instant)>::new(),
            ttl,
        }
    }

    pub fn get(&self, key: &K) -> Option<V> {
        let now = Instant::now();
        
        if let Some(entry) = self.map.get(key) {
            if entry.1 > now {
                return Some(entry.0.clone());
            } else {
                self.map.remove(entry.key());
            }
        }

        None
    }

    pub fn push(&self, key: K, value: V) {
        let now = Instant::now();
        let expires = now + self.ttl;

        self.map.insert(key.clone(), (value, expires));
    }

    pub fn remove(&self, key: &K) {
        self.map.remove(&key);
    }
}