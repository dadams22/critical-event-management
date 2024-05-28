import { AddressAutofillRetrieveResponse } from '@mapbox/search-js-core';
import { Bounds } from '../../../../../../api/types';
import { useState } from 'react';

interface HookResult {
  address?: AddressAutofillRetrieveResponse;
  setAddress: (address: AddressAutofillRetrieveResponse) => void;
  bounds?: Bounds;
  setBounds: (bounds: Bounds) => void;
  reset: () => void;
}

export default function useCreateSiteState(): HookResult {
  const [address, setAddress] = useState<AddressAutofillRetrieveResponse>();
  const [bounds, setBounds] = useState<Bounds>();

  const reset = () => {
    setAddress(undefined);
    setBounds(undefined);
  };

  return {
    address,
    setAddress,
    bounds,
    setBounds,
    reset,
  };
}
