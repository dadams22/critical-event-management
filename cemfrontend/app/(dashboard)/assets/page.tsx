'use client';
import {
	Center,
	Loader,
	Space,
	Text,
	Timeline,
	Card,
	Group,
	Button,
	useMantineTheme,
    Autocomplete,
} from '@mantine/core';
import useSWR from 'swr';
import Api from '../../../api/Api';
import dayjs from 'dayjs';
import relativeTime from 'dayjs/plugin/relativeTime';
// import { ImpactedIndividualsStats } from './ImpactedIndividualsStats';
import styled from '@emotion/styled';
// import SearchBar from './SearchBar';
import { IconCheck, IconPlus, IconSearch, IconSpeakerphone, IconUrgent } from '@tabler/icons';
import { modals } from '@mantine/modals';
// import { ModalNames } from '../../../(modals)';
// import { Alert } from '../../../../api/types';
import { produce } from 'immer';
import _ from 'lodash';
import MapView from '../../../components/map/MapView';
import { AssetSummary } from './AssetSummary';
import { ModalNames } from '../../(modals)';

dayjs.extend(relativeTime);

const MapContainer = styled.div`
	position: relative;
	height: 0;
	min-height: 100%;
	width: 100%;
`;

const OverlayGrid = styled.div`
	position: absolute;
	top: 0;
	left: 0;
	bottom: 0;
	right: 0;
	padding: 16px;

	display: grid;
	grid-template-areas: 'sidebar actions' 'sidebar .' 'sidebar footer';
	grid-template-columns: 300px 1fr;
	grid-template-rows: min-content 1fr min-content;
	gap: 10px;

	pointer-events: none;

	& > * {
		pointer-events: all;
	}
`;

const ActionBar = styled.div`
	grid-area: actions;
	width: 100%;

	display: flex;
	justify-content: space-between;
	align-items: center;
`;

const SideBar = styled.div`
	grid-area: sidebar;
	overflow-y: auto;
	margin: -16px -10px;
	padding: 16px 10px;
`;

const Footer = styled.div`
	grid-area: footer;
`;

interface ComponentProps {
	params: {
		incidentReportId: string;
	};
}

export default function IncidentReportPage({ params: { incidentReportId } }: ComponentProps) {
	const theme = useMantineTheme();

	const { data: sites } = useSWR('sites/all', Api.getSites);
    console.log(sites);

    const loading = false
	if (loading)
		return (
			<Center h="100%">
				<Loader variant="bars" />
			</Center>
		);

    const handleClickAddAsset = () => {
        
    }

	return (
		<MapContainer>
			{!!sites?.[0] && <MapView location={_.pick(sites[0], ['longitude', 'latitude'])} sites={sites} />}
			<OverlayGrid>
                <SideBar>
				</SideBar>
				<ActionBar>
                    <div />
					<Autocomplete w={400} data={[]} icon={<IconSearch size={20} />} placeholder="Search for assets..." />
                    <Button leftIcon={<IconPlus size={20} />} onClick={handleClickAddAsset}>
                        Add Asset
                    </Button>
				</ActionBar>
				<Footer>
					<AssetSummary />
				</Footer>
			</OverlayGrid>
		</MapContainer>
	);
}
