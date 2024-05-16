'use client';

import {useContext, useEffect, useRef} from 'react';
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

    transition: 'transform 300ms ease-in-out',
  },

  notification: {
    position: 'absolute',
    top: 0,
    right: 0,
    width: '12px',
    height: '12px',
    borderRadius: '100px',
  },

  selected: {
    transform: 'scale(1.25)',
  },
}));

export interface MarkerProps {
  location: Location;
  color?: string;
  iconIdentifier?: AssetIconIdentifier;
  onClick?: () => void;
  selected?: boolean;
}

export default function Marker({
  location,
  iconIdentifier,
  color,
  onClick,
  selected,
}: MarkerProps) {
  const theme = useMantineTheme();
  const { classes, cx } = useStyles();

  const map = useContext(MapContext);
  const markerRef = useRef<Marker>(null);
  const onClickRef = useRef<() => void>(null);

  useEffect(() => {
    if (!map) return;

    let iconElement;
    if (iconIdentifier) {
      iconElement = document.createElement('div');
      const icon = (
        <div style={{ color }} className={cx(classes.marker, selected && classes.selected)}>
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

    markerRef.current = marker;

    if (onClick) {
      onClickRef.current = onClick;
      marker.getElement().addEventListener('click', onClick);
    }

    return () => {
      if (!map) return;
      marker.remove();
    };
  }, [map, color, selected]);

  useEffect(() => {
    if (!markerRef.current) return;
    const markerElement = markerRef.current.getElement();
    if (!markerElement) return;
    if (onClickRef.current) markerElement.removeEventListener('click', onClickRef.current);
    markerElement.addEventListener('click', onClick);
    onClickRef.current = onClick;
  }, [onClick]);

  return null;
}
