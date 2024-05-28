import React, { useRef, useState } from 'react';
import { Bounds } from '../../../../../../api/types';
import { produce } from 'immer';
import { PlaceFloorPlanControlsProps } from '../../../../../../components/map/components/PlaceFloorPlanControls';

export interface FloorDraft {
  name?: string;
  floorPlanBounds?: Bounds;
  floorPlanImageUrl?: string;
  floorPlanImage?: File;
  floorPlanDimensions?: {
    width: number;
    height: number;
  };
}

interface HookResult {
  floors: FloorDraft[];
  setFloors: (floors: FloorDraft[]) => void;
  floorPlanPlacementIndex?: number;
  setFloorPlanPlacementIndex: (i: number | undefined) => void;
  placeFloorPlanControls?: PlaceFloorPlanControlsProps;
  reset: () => void;
}

export default function useCreateBuildingState(): HookResult {
  const [floors, setFloors] = useState<
    {
      name?: string;
      floorPlanBounds?: Bounds;
      floorPlanImageUrl?: string;
      floorPlanImage?: File;
      floorPlanDimensions?: {
        width: number;
        height: number;
      };
    }[]
  >([]);
  const [floorPlanPlacementIndex, setFloorPlanPlacementIndex] = useState<number>();

  const reset = () => {
    setFloors([]);
    setFloorPlanPlacementIndex(undefined);
  };

  return {
    floors,
    setFloors,
    floorPlanPlacementIndex,
    setFloorPlanPlacementIndex,
    placeFloorPlanControls:
      floorPlanPlacementIndex !== undefined &&
      floors[floorPlanPlacementIndex] &&
      floors[floorPlanPlacementIndex].floorPlanImageUrl &&
      floors[floorPlanPlacementIndex].floorPlanDimensions
        ? {
            onUpdateFloorPlanBounds: (bounds) => {
              setFloors(
                produce(floors, (draft) => {
                  draft[floorPlanPlacementIndex].floorPlanBounds = bounds;
                })
              );
            },
            floorPlanBounds: floors[floorPlanPlacementIndex].floorPlanBounds,
            floorPlanImageUrl: floors[floorPlanPlacementIndex].floorPlanImageUrl,
            ...floors[floorPlanPlacementIndex].floorPlanDimensions,
          }
        : undefined,
    reset,
  };
}
