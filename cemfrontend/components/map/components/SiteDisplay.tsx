'use client';

import { useContext, useEffect } from "react";
import { Site } from "../../../api/types";
import { MapContext } from "../MapView";
import BoundsDisplay from "./BoundsDisplay";

const siteBoundsId = (site: Site) => `site-bounds-${site.id}`;
const siteBoundsLayerId = (site: Site) => `site-bounds-layer-${site.id}`;
const siteFloorPlanId = (site: Site) => `site-floor-plan-${site.id}`;
const siteFloorPlanLayerId = (site: Site) => `site-floor-plan-layer-${site.id}`;


interface ComponentProps {
    site: Site;
}

export default function SiteDisplay({ site }: ComponentProps) {
    const map = useContext(MapContext);

    console.log(site);

    useEffect(() => {
        if (!map) return;

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

            map.removeSource(siteFloorPlanId(site));
            map.removeLayer(siteFloorPlanLayerId(site));
        };
    }, [map, site])

    return <BoundsDisplay bounds={site.bounds} />;
}