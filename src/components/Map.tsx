import React, { useState, useCallback, useEffect } from "react";
import Map, { Marker, Popup, NavigationControl } from "react-map-gl";
import Pin from "./Pin";
import "mapbox-gl/dist/mapbox-gl.css";
import TeslaLogo from "./TeslaLogo";

// Define a type for the charging station data
type ChargingStation = {
  id: number;
  name: string | null;
  operator: string | null;
  lat: number;
  lng: number;
  metadata: any;
  distance: number;
};

const ChargingMap = () => {
  const initialViewState = {
    latitude: 37.7,
    longitude: -122,
    zoom: 10,
  };

  const [chargingStations, setChargingStations] = useState<ChargingStation[]>(
    [],
  );
  const [activeStation, setActiveStation] = useState<number | null>(null);

  const [marker, setMarker] = useState({
    latitude: 37.7,
    longitude: -122,
  });

  const onMarkerDragEnd = useCallback((event) => {
    setMarker({
      longitude: event.lngLat.lng,
      latitude: event.lngLat.lat,
    });

    // Optionally call fetchChargers or any other function that uses the marker's position
    fetchChargers(event.lngLat.lat, event.lngLat.lng);
  }, []);

  const fetchChargers = async (latitude: number, longitude: number) => {
    try {
      const response = await fetch(
        `/api/chargers?lat=${latitude}&lng=${longitude}`,
      );
      const data = await response.json();
      setChargingStations(data.data); // Set the charging stations state
    } catch (error) {
      console.error("Error fetching chargers:", error);
    }
  };

  const isTeslaStation = (station: ChargingStation) => {
    return station.metadata && station.metadata?.operator === "Tesla, Inc.";
  };

  useEffect(() => {
    fetchChargers(initialViewState.latitude, initialViewState.longitude);
  }, []);

  const activeChargingStation = chargingStations.find(
    (station) => station.id === activeStation,
  );

  const renderMarker = (station: ChargingStation) => {
    const isTesla = isTeslaStation(station);
    let markerColor = "#f4fa9c"; // Default to yellow

    if (station.metadata?.operator === "Blink") {
      markerColor = "#a7ff83"; // Green for Blink
    } else if (station.metadata?.operator === "ChargePoint") {
      markerColor = "#ffa45c"; // Orange for ChargePoint
    }

    // Check for charger capacity and display it if greater than 1
    const hasCapacity = station.metadata?.capacity > 1;
    const capacityText = hasCapacity ? station.metadata.capacity : "";

    return (
      <Marker
        key={station.id}
        latitude={station.lat}
        longitude={station.lng}
        anchor="center"
        onClick={(e) => {
          e.originalEvent.stopPropagation();
          setActiveStation(station.id);
        }}
      >
        {isTesla ? (
          <div className="relative">
            <TeslaLogo size={30} />
            {hasCapacity && (
              <div className="absolute top-[-5px] right-[-5px] bg-white font-bold rounded-full w-4 h-4 flex items-center justify-center text-xs">
                {capacityText}
              </div>
            )}
          </div>
        ) : (
          <div
            className={`relative h-6 w-6 rounded-full flex items-center justify-center ${markerColor === "#f4fa9c" ? "bg-yellow-200" : markerColor === "#a7ff83" ? "bg-green-200" : "bg-orange-200"}`}
          >
            {hasCapacity && (
              <div className="absolute top-[-5px] right-[-5px] bg-white font-bold rounded-full w-4 h-4 flex items-center justify-center text-xs">
                {capacityText}
              </div>
            )}
          </div>
        )}
      </Marker>
    );
  };

  return (
    <div className="w-screen h-screen">
      <Map
        initialViewState={initialViewState}
        mapboxAccessToken={process.env.NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN}
        mapStyle="mapbox://styles/cfahlgren1/clpsxuk1r00u901qm5j6236l7"
      >
        <Marker
          longitude={marker.longitude}
          latitude={marker.latitude}
          anchor="bottom"
          draggable
          onDragEnd={onMarkerDragEnd}
        >
          <Pin size={40} />
        </Marker>

        {chargingStations.map((station) => renderMarker(station))}

        {activeChargingStation && (
          <Popup
            latitude={activeChargingStation.lat}
            longitude={activeChargingStation.lng}
            onClose={() => setActiveStation(null)}
          >
            <div className="break-words max-w-xs p-2">
              {Object.entries(activeChargingStation.metadata || {}).map(
                ([key, value]) => (
                  <p key={key} className="my-1">{`${key}: ${value}`}</p>
                ),
              )}
            </div>
          </Popup>
        )}

        <NavigationControl />
      </Map>
    </div>
  );
};

export default ChargingMap;
