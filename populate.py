import os
import json
import psycopg2
from dotenv import load_dotenv

load_dotenv()

# Database connection parameters from .env file
db_params = {
    "dbname": os.getenv("DATABASE_NAME"),
    "user": os.getenv("DATABASE_USER_NAME"),
    "password": os.getenv("DATABASE_PASSWORD"),
    "host": os.getenv("DATABASE_HOST"),
    "port": os.getenv("DATABASE_PORT"),
    "sslmode": "require",
}

# Connect to the database
conn = psycopg2.connect(**db_params)
cursor = conn.cursor()

# Read the GeoJSON file
with open("chargers.geojson", "r") as file:
    data = json.load(file)

# Iterate over features and insert them into the database
for feature in data["features"]:
    properties = json.dumps(feature["properties"])
    geometry = feature["geometry"]
    lat, lng = geometry["coordinates"][1], geometry["coordinates"][0]

    insert_query = """
    INSERT INTO charging_stations (lat, lng, metadata, geom)
    VALUES (%s, %s, %s, ST_SetSRID(ST_MakePoint(%s, %s), 4326))
    """
    cursor.execute(insert_query, (lat, lng, properties, lng, lat))

conn.commit()
cursor.close()
conn.close()
