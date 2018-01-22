CREATE OR REPLACE FUNCTION sidewalk.calculate_accessible_cost(integer)
  RETURNS double precision AS
$BODY$WITH allcosts
     AS (SELECT num_curbramps AS count,
                CASE
                  WHEN num_curbramps = 0 THEN 50 --If there are no curbramps, add 50 meters to the cost
                  WHEN num_curbramps > 3 THEN -10 --If there are more than 3 curbramps, subtract 10 meters from the cost
                  ELSE 0 --If there are only 1 or 2 curbramps, cost is not affected.
                END AS costcontrib
         FROM   (SELECT Count(*) AS num_curbramps --Count how many curbramps are on this street segment
                 FROM   (SELECT accessibility_feature.accessibility_feature_id,
                                label_type_id,
                                sidewalk_edge_id
                         FROM   sidewalk.accessibility_feature
                                INNER JOIN sidewalk.sidewalk_edge_accessibility_feature
                                        ON
                sidewalk_edge_accessibility_feature.accessibility_feature_id
                =
                accessibility_feature.accessibility_feature_id) AS foo
                 WHERE  sidewalk_edge_id = $1
                        AND label_type_id = 1) AS curbramps --feature_type corresponds to the feature_id in fature_types
         UNION
         SELECT num_construction AS count,
                CASE
                  WHEN num_construction = 0 THEN -10 --If there is no construction, subtract 10m from the cost
                  WHEN num_construction > 0 THEN num_construction * 10000 --For each construction obstacle, add 10km to the cost (which is so high that the street segment will probably be avoided)
                  ELSE 0
                END AS costcontrib
         FROM   (SELECT Count(*) AS num_construction --Count the number of construction obstacles on the street segment
                 FROM   (SELECT accessibility_feature.accessibility_feature_id,
                                label_type_id,
                                sidewalk_edge_id
                         FROM   sidewalk.accessibility_feature
                                INNER JOIN sidewalk.sidewalk_edge_accessibility_feature
                                        ON
                sidewalk_edge_accessibility_feature.accessibility_feature_id
                =
                accessibility_feature.accessibility_feature_id) AS foo
                 WHERE  sidewalk_edge_id = $1
                        AND label_type_id = 2) AS construction --feature_type corresponds to the feature_id in feature_types
         UNION
         (SELECT St_length(St_transform(geom, 3637)), --Finally, add the length of the segment (in meters) to the cost
                 St_length(St_transform(geom, 3637)) as costcontrib
          FROM   sidewalk.sidewalk_edge AS distance_cost
          WHERE  sidewalk_edge_id = $1))
SELECT sum(costcontrib)
FROM   allcosts; $BODY$
  LANGUAGE sql VOLATILE
  COST 100;
ALTER FUNCTION sidewalk.calculate_accessible_cost(integer)
  OWNER TO postgres;
