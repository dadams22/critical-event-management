'use client';

import { useContext, useEffect } from 'react';
import mapboxgl from 'mapbox-gl';
import { createStyles, Indicator, useMantineTheme } from '@mantine/core';
import ReactDOM from 'react-dom';
import { Location } from '../../../api/types';
import { MapContext } from '../MapView';
import { getAssetIcon, AssetIconIdentifier } from '../../../app/(icons)/assetTypes';

const useStyles = createStyles((theme) => ({
  marker: {
    position: 'relative',
    height: '28px',
    width: '28px',

    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',

    borderRadius: '100px',
    backgroundColor: theme.colors.blue[8],
    opacity: 0.9,
    cursor: 'pointer',

    '& > svg': {
      color: 'white',
    },
  },

  notification: {
    position: 'absolute',
    top: 0,
    right: 0,
    width: '8px',
    height: '8px',
    borderRadius: '100px',
  },
}));

export interface MarkerProps {
  location: Location;
  color?: string;
  iconIdentifier?: AssetIconIdentifier;
  onClick?: () => void;
}

export default function Marker({ location, iconIdentifier, color, onClick }: MarkerProps) {
  const theme = useMantineTheme();
  const { classes } = useStyles();

  const map = useContext(MapContext);

  useEffect(() => {
    if (!map) return;

    let iconElement;
    if (iconIdentifier) {
      iconElement = document.createElement('div');
      const icon = (
        <div style={{ color }} className={classes.marker}>
          {color && <div className={classes.notification} style={{ backgroundColor: color }} />}
          {getAssetIcon(iconIdentifier, { size: 20 })}
        </div>
      );
      ReactDOM.render(icon, iconElement);
    }

    const marker = new mapboxgl.Marker({
      color: color || theme.colors.red[8],
      element: iconElement || undefined,
    })
      .setLngLat([location.longitude, location.latitude])
      .addTo(map);

    if (onClick) {
      marker.getElement().addEventListener('click', onClick);
    }

    return () => {
      if (!map) return;
      marker.remove();
    };
  }, [map, color]);

  return null;
}
