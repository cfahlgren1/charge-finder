import type { NextApiRequest, NextApiResponse } from 'next';
import { neon } from '@neondatabase/serverless';

type ChargingStation = {
  id: number;
  name: string;
  operator: string;
  lat: number;
  lng: number;
  metadata: object;
  distance: number;
};

type ResponseData = {
  data?: ChargingStation[];
  error?: string;
};

const dbUrl = `postgresql://${process.env.DATABASE_USER_NAME}:${process.env.DATABASE_PASSWORD}` +
  `@${process.env.DATABASE_HOST}:${process.env.DATABASE_PORT}/${process.env.DATABASE_NAME}?sslmode=require`;

const sql = neon(dbUrl);

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<ResponseData>
) {
  const { lat, lng } = req.query;

  if (!lat || !lng) {
    return res.status(400).json({ error: 'Latitude and longitude are required' });
  }

  try {
    const response = await sql`
      SELECT id, lat, lng, metadata, ST_Distance(geom, ST_SetSRID(ST_MakePoint(${lng}, ${lat}), 4326)) AS distance
      FROM charging_stations
      ORDER BY geom <-> ST_SetSRID(ST_MakePoint(${lng}, ${lat}), 4326)
      LIMIT 100
    `;

    // Convert each record to a ChargingStation
    const stations: ChargingStation[] = response.map((station: any) => ({
      id: station.id,
      name: station.name,
      operator: station.operator,
      lat: station.lat,
      lng: station.lng,
      metadata: station.metadata,
      distance: station.distance,
    }));

    res.status(200).json({ data: stations });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
}
