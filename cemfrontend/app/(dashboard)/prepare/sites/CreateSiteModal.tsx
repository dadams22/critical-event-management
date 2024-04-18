'use client';
import React, { useRef } from 'react';
import {
	Button,
	Center,
	createStyles,
	Flex,
	Group,
	Modal,
	Overlay,
	Stack,
	Stepper,
	Text,
	TextInput,
} from '@mantine/core';
import { useMemo, useState } from 'react';
import { AddressAutofillRetrieveResponse } from '@mapbox/search-js-core';
import _ from 'lodash';
import AddressField from '../../../../components/AddressField';
import MapView, { Bounds } from '../../report/[incidentReportId]/MapView';
import { useCounter } from '@mantine/hooks';
import styled from '@emotion/styled';
import { IconPhotoPlus } from '@tabler/icons';
import { point, featureCollection } from '@turf/helpers';
import destination from '@turf/destination';
import envelope from '@turf/envelope';
import { Polygon } from '@turf/helpers';
import Api from '../../../../api/Api';

const useStyles = createStyles((theme) => ({
	overlay: {
		cursor: 'pointer',
		opacity: 0.75,
		border: `1px solid transparent`,
		'&:hover': {
			opacity: 0.85,
			border: `1px solid ${theme.colors.blue[6]}`,
		},
		borderRadius: '8px',
		transitionProperty: 'opacity border',
		transitionDuration: '300ms',
	},
}));

const MapContainer = styled.div`
	position: relative;
	width: 100%;
	height: 420px;
	border-radius: 8px;
	overflow: hidden;
`;

const FloorPlanInput = styled.input`
	display: none;
`;

const ImageMeasurer = styled.img`
	visibility: hidden;
`;

interface ComponentProps {
	opened: boolean;
	onClose: () => void;
}

export default function CreateSiteModal({ opened, onClose }: ComponentProps) {
	const { classes } = useStyles();

	const [saving, setSaving] = useState<boolean>(false);
	const [siteName, setSiteName] = useState<string>('');
	const [address, setAddress] = useState<AddressAutofillRetrieveResponse>();
	const [siteBounds, setSiteBounds] = useState<Bounds>();

	const [step, stepHandlers] = useCounter(0, { min: 0, max: 2 });

	const floorPlanInputRef = useRef<HTMLInputElement>(null);
	const [floorPlanImageUrl, setFloorPlanImageUrl] = useState<string>();
	const [floorPlanAspectRatio, setFloorPlanAspectRatio] = useState<number>();
	const [floorPlanBounds, setFloorPlanBounds] = useState<Polygon>();
	const [floorPlanDimensions, setFloorPlanDimensions] = useState<{
		width: Number;
		height: number;
	}>();
	const [floorPlanFile, setFloorPlanFile] = useState<File>();
	const floorPlanMeasurerRef = useRef<HTMLImageElement>(null);

	const handleFloorPlanOverlayClick = () => {
		floorPlanInputRef.current?.click();
	};

	const handleFloorPlanUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
		if (!e.target.files?.[0]) return;

		const imageFile = e.target.files[0];
		setFloorPlanFile(imageFile);

		const reader = new FileReader();

		reader.onload = (event: ProgressEvent<FileReader>) => {
			setFloorPlanImageUrl(String(event.target?.result));
		};

		reader.readAsDataURL(imageFile);
	};

	const nextDisabled = useMemo(() => {
		if (step === 0) return !siteName || !address;
		if (step === 1) return !siteBounds;
		if (step === 2) return !address 
			|| !address?.features?.[0]?.properties?.full_address
			|| !siteBounds
			|| !floorPlanFile;

		return false;
	}, [step, siteName, address, siteBounds, siteBounds, floorPlanFile]);

	const handleSave = () => {
		if (
			!address 
			|| !address?.features?.[0]?.properties?.full_address
			|| !siteBounds
			|| !floorPlanFile
		) return;

		setSaving(true);
		Api.createSite({
			name: siteName,
			address: address?.features?.[0]?.properties?.full_address,
			bounds: siteBounds,
			longitude: address?.features?.[0]?.geometry?.coordinates?.[0],
			latitude: address?.features?.[0]?.geometry?.coordinates?.[1],
			floorPlan: floorPlanFile,
			floorPlanBounds: floorPlanBounds,
		})
			.then((site) => {
				console.log(site);
				onClose();
			})
			.finally(() => setSaving(false));
	};

	return (
		<Modal title="Create Site" opened={opened} onClose={onClose} size="xl" zIndex={2000} centered>
			<Stack>
				<Stepper active={step}>
					<Stepper.Step label="Site Info">
						<Stack>
							<TextInput
								label="Site Name"
								required
								disabled={saving}
								value={siteName}
								onChange={(e) => setSiteName(e.target.value)}
							/>
							<AddressField
								value={address?.features?.[0]?.properties?.full_address}
								onSelectAddress={setAddress}
							/>
						</Stack>
					</Stepper.Step>
					<Stepper.Step label="Define Site Bounds">
						{address && (
							<MapContainer>
								<MapView
									location={{
										longitude: address.features?.[0]?.geometry?.coordinates?.[0],
										latitude: address.features?.[0]?.geometry?.coordinates?.[1],
									}}
									onUpdateBounds={setSiteBounds}
									polygons={siteBounds ? [siteBounds] : undefined}
								/>
							</MapContainer>
						)}
					</Stepper.Step>
					<Stepper.Step label="Add Floor Plans">
						{address && (
							<MapContainer>
								<MapView
									key="new"
									location={{
										longitude: address.features?.[0]?.geometry?.coordinates?.[0],
										latitude: address.features?.[0]?.geometry?.coordinates?.[1],
									}}
									polygons={siteBounds ? [siteBounds] : undefined}
									floorPlan={
										!!floorPlanImageUrl && !!floorPlanDimensions
											? {
													onUpdateFloorPlanBounds: setFloorPlanBounds,
													floorPlanImageUrl,
													...floorPlanDimensions,
												}
											: undefined
									}
								/>
								{!floorPlanImageUrl && (
									<Overlay center className={classes.overlay} onClick={handleFloorPlanOverlayClick}>
										<Stack align="center">
											<IconPhotoPlus size={80} />
											<Text>Add a floor plan.</Text>
										</Stack>
										<FloorPlanInput
											type="file"
											accept=".svg, .png"
											ref={floorPlanInputRef}
											onChange={handleFloorPlanUpload}
										/>
									</Overlay>
								)}
								{!!floorPlanImageUrl && !floorPlanAspectRatio && (
									<ImageMeasurer
										ref={floorPlanMeasurerRef}
										src={floorPlanImageUrl}
										onLoad={(e) => {
											const image = e.target as HTMLImageElement;
											const aspectRatio = image.naturalWidth / image.naturalHeight;
											setFloorPlanAspectRatio(aspectRatio);
											setFloorPlanDimensions({
												width: image.naturalWidth,
												height: image.naturalHeight,
											});
										}}
									/>
								)}
							</MapContainer>
						)}
					</Stepper.Step>
				</Stepper>
				<Flex justify="flex-end">
					<Group>
						<Button variant="outline" onClick={stepHandlers.decrement} disabled={step === 0}>
							Previous
						</Button>
						<Button variant="filled" onClick={step === 2 ? handleSave : stepHandlers.increment} disabled={nextDisabled}>
							{step === 2 ? 'Save' : 'Next'}
						</Button>
					</Group>
				</Flex>
			</Stack>
		</Modal>
	);
}
