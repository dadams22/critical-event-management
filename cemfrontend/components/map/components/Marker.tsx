'use client';

import { useContext, useEffect, useMemo, useRef } from "react";
import { Location } from "../../../api/types";
import { MapContext } from "../MapView";
import mapboxgl from "mapbox-gl";
import { v4 as uuid } from 'uuid';
import { useMantineTheme } from "@mantine/core";

interface ComponentProps {
    location: Location;
}

export default function Marker({ location }: ComponentProps) {
    const theme = useMantineTheme();

    const map = useContext(MapContext);
    const marker = useRef<mapboxgl.Marker>(null);

    useEffect(() => {
        console.log(map);
        if (!map) return;

        if (!marker.current) {
            console.log(location);
            marker.current = new mapboxgl.Marker({
                color: theme.colors.red[8] 
            })
                .setLngLat([location.longitude, location.latitude])
                .addTo(map);
        }

        marker.current?.setLngLat([location.longitude, location.latitude]);

        return () => {
            if (!map || !marker.current) return;
            marker.current.remove();
        };
    }, [map, location]);

    return null;
}