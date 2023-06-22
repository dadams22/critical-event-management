import { GetServerSideProps, InferGetServerSidePropsType } from "next";

interface ComponentProps {}

export const getServerSideProps: GetServerSideProps<ComponentProps> = async () => {
    return { props: {} };
}

export default function IncidentReportPage({}: InferGetServerSidePropsType<typeof getServerSideProps>) {
    return (

    );
}