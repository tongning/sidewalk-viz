
SELECT jsonb_build_object(
    'type',     'FeatureCollection',
    'features', jsonb_agg(feature)
)
FROM (
  SELECT jsonb_build_object(
    'type',       'Feature',
    'id',         street_edge_id,
    'geometry',   ST_AsGeoJSON(geom)::jsonb,
    'properties', to_jsonb(row) - 'gid' - 'geom',
    'accessibility_cost', calculate_accessible_cost(street_edge_id)
  ) AS feature
  FROM (SELECT * FROM sidewalk.street_edge) row) features;