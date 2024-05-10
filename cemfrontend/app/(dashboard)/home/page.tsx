'use client';
import {Center, Loader, Stack, Text, Title} from "@mantine/core";
import useSWR from "swr";
import Api from "../../../api/Api";
import {AssetSummary} from "../assets/AssetSummary";

export default function HomePage() {
    const { data: assets, isLoading } = useSWR('assets/all', Api.getAssets);

    return (
        <Stack p={16} w="100%" mih="100%" h="100%">
            <Title order={3}>Home</Title>
            {isLoading ? (
                <Center h="100%">
                    <Loader variant="bars" />
                </Center>
            ) : (
                <>
                    <AssetSummary assets={assets} />
                </>
            )}
        </Stack>
    );
}
