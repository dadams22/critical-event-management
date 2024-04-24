'use client';

import { useContext, useEffect } from "react";
import { Site } from "../../../api/types";
import { MapContext } from "../MapView";

const siteBoundsId = (site: Site) => `site-bounds-${site.id}`;
const siteBoundsLayerId = (site: Site) => `site-bounds-layer-${site.id}`;
const siteFloorPlanId = (site: Site) => `site-floor-plan-${site.id}`;
const siteFloorPlanLayerId = (site: Site) => `site-floor-plan-layer-${site.id}`;


interface ComponentProps {
    site: Site;
}

export default function SiteDisplay({ site }: ComponentProps) {
    const map = useContext(MapContext);

    useEffect(() => {
        if (!map) return;

        // Site boundaries
        map.addSource(`site-bounds-${site.id}`, {
            type: 'geojson',
            data: {
                type: 'Feature',
                geometry: {
                    type: 'Polygon',
                    coordinates: site.bounds,
                },
            },
        });
        map.addLayer({
            id: siteBoundsLayerId(site),
            type: 'fill',
            source: siteBoundsId(site),
            layout: {},
            paint: {
                'fill-color': '#0080ff',
                'fill-opacity': 0.5,
            },
        });

        // Floor plan
        map.addSource(siteFloorPlanId(site), {
            'type': 'image',
            'url': site.floor_plan,
            'coordinates': site.floor_plan_bounds
        });
        map.addLayer({
            id: siteFloorPlanLayerId(site),
            'type': 'raster',
            'source': siteFloorPlanId(site),
            'paint': {
                'raster-fade-duration': 0
            }
        });

        return () => {
            if (!map) return;

            map.removeSource(siteBoundsId(site));
            map.removeLayer(siteBoundsLayerId(site));
            map.removeSource(siteFloorPlanId(site));
            map.removeSource(siteFloorPlanLayerId(site));
        };
    }, [map, site])

    return null;
}