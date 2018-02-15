import json

#import psycopg2

FILENAME = 'labels.geojson'
FEATURE_TYPE_TO_ID_MAPPING = {"CurbRamp" : 1, "NoCurbRamp":2, "Obstacle":3,"SurfaceProblem":4,"Other":5,"Occlusion":6, "NoSidewalk":7 }

conn_string = "host='localhost' dbname='sidewalk' user='postgres' password='sidewalk'"
with open(FILENAME) as data_file:
    data = json.load(data_file)
# Establish connection to database before starting

#try:
#    conn = psycopg2.connect(conn_string)
#except:
#    print "I am unable to connect to the database"

#cursor = conn.cursor()
import csv
with open('labels.csv', 'wb') as csvfile:
    csvwriter = csv.writer(csvfile, delimiter=',',
                            quotechar='|', quoting=csv.QUOTE_MINIMAL)
    csvwriter.writerow(['lat','lon','label','severity'])
    for thisfeature in data["features"]:
        coordinates = thisfeature["geometry"]["coordinates"]
        lat = coordinates[0]
        lon = coordinates[1]
        feature_type = thisfeature["properties"]["label_type"]
        severity = thisfeature["properties"]["severity"]
        feature_type_id = FEATURE_TYPE_TO_ID_MAPPING[feature_type]
    # Query the database to figure out which sidewalk id this feature belongs to based on coordinates
        row = [lat, lon, feature_type, severity]
        csvwriter.writerow(row)
    



