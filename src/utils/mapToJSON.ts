export function mapToJSON<Key, Data, JSONResult>(
  map: Map<Key, Data>,
): JSONResult {
  return JSON.parse(JSON.stringify(Object.fromEntries(map)));
}
