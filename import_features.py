import json

import psycopg2

FILENAME = 'labels.geojson'
FEATURE_TYPE_TO_ID_MAPPING = {"CurbRamp" : 1, "NoCurbRamp":2, "Obstacle":3,"SurfaceProblem":4,"Other":5,"Occlusion":6, "NoSidewalk":7 }

conn_string = "host='localhost' dbname='sidewalk' user='postgres' password='sidewalk'"
with open(FILENAME) as data_file:
    data = json.load(data_file)
# Establish connection to database before starting

try:
    conn = psycopg2.connect(conn_string)
except:
    print "I am unable to connect to the database"

cursor = conn.cursor()

for thisfeature in data["features"]:
    coordinates = thisfeature["geometry"]["coordinates"]
    feature_type = thisfeature["properties"]["label_type"]
    feature_type_id = FEATURE_TYPE_TO_ID_MAPPING[feature_type]
    # Query the database to figure out which sidewalk id this feature belongs to based on coordinates
    query = """ SELECT sidewalk_edge_id,ST_Distance(geom,'SRID=4326;POINT(%s %s)'::geometry)
                FROM sidewalk.sidewalk_edge
                ORDER BY
                sidewalk_edge.geom <->'SRID=4326;POINT(%s %s)'::geometry
                LIMIT 1; """
    inputs = (coordinates[0], coordinates[1], coordinates[0], coordinates[1])
    cursor.execute(query, inputs)
    sidewalk_edge_id = cursor.fetchone()
    # sidewalk_edge_id[0] now contains the id of the sidewalk edge closest to this point
    # now insert the feature into accessibility_feature table
    query = """ INSERT INTO sidewalk.accessibility_feature (geom, label_type_id, x, y)
                VALUES (ST_GeomFromText('POINT(%s %s)', 4326), %s, %s, %s) """
    inputs = (coordinates[0], coordinates[1], feature_type_id, coordinates[0], coordinates[1])
    cursor.execute(query, inputs)
    # Get the id of the newly inserted accessibility feature
    query = "SELECT currval('sidewalk.accessibility_feature_accessibility_feature_id_seq')"
    cursor.execute(query)
    new_feature_id = cursor.fetchone()[0]
    closest_sidewalk_id = sidewalk_edge_id[0]
    # Now insert the paired feature id and sidewalk id into sidewalk_edge_accessibility_feature
    query = """ INSERT INTO sidewalk.sidewalk_edge_accessibility_feature (sidewalk_edge_id, accessibility_feature_id)
                VALUES (%s, %s) """
    inputs = (closest_sidewalk_id, new_feature_id)
    cursor.execute(query, inputs)
conn.commit()

