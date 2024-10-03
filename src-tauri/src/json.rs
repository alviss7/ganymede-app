use serde::Deserialize;

use crate::error::Error;

pub fn from_str<'de, T>(text: &'de str) -> Result<T, Error>
where
    T: Deserialize<'de>,
{
    let des = &mut serde_json::Deserializer::from_str(text);
    serde_path_to_error::deserialize::<_, T>(des).map_err(Error::from)
}
