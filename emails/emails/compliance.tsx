import {
    Body,
    Container,
    Head,
    Heading,
    Html,
    Img,
    Link,
    Section,
    Text,
    Row,
    Tailwind,
    Font,
    Column,
    Button,
} from "@react-email/components";
import * as React from "react";

const baseUrl = process.env.VERCEL_URL
    ? `https://${process.env.VERCEL_URL}`
    : "";

import { JinjaFor, JinjaImg, JinjaText } from "./jinja";

interface ComplianceEmailProps {
}

export const ComplianceRow = ({ }: ComplianceEmailProps) => (
    <Row className="bg-white p-0 shadow rounded" style={{margin: "10px 0"}}>
        <Column width={100}>
            <div
                className="bg-gray-100 rounded flex center-items space-between"
                style={{width: "100px", height: "100px"}}>
                <JinjaImg
                    src="item.photo"
                    previewSrc={`${baseUrl}/static/asset.jpg`}
                    width={100}
                    style={{objectFit: 'contain'}} />
            </div>
        </Column>
        <Column className="p-2">
            <Row>
                <JinjaText className="text-lg p-0 inline" name="item.floor.site.name" />
                <Text className="text-lg p-0 inline"> / </Text>
                <JinjaText className="text-lg p-0 m-0 inline" name="item.floor.name" />
                <JinjaText className="text-lg p-0 m-0 bold" name="item.name" />
                <Text className="text-lg inline"> Maintenance Due: </Text>
                <JinjaText className="text-lg inline" name="item.next_maintenance_date.strftime('%Y-%m-%d')" />
            </Row>
        </Column>
        <Column className="p-2">
            <Row style={{verticalAlign: 'center'}}>
                <Button className="bg-blue-500 text-white rounded p-2 ml-2 whitespace-nowrap" href="https://kakuna.io/asset/{{ item.id }}">
                    View Item
                </Button>
            </Row>
        </Column>
    </Row>
);

export const ComplianceEmail = ({ }: ComplianceEmailProps) => (
    <Html>
        <Tailwind>
            <Head>
                <Font
                    fontFamily="Roboto"
                    fallbackFontFamily={"Arial"}
                    />
            </Head>
            <Container style={container}>
                <h1 style={h1}>Safety Compliance Report</h1>

                <Row style={{marginTop: "10px"}}>
                    <Column className="bg-red-200 p-4 rounded" style={textBase}>
                        <JinjaText className="text-lg" style={h1} name="out_of_compliance_header" />
                    </Column>
                </Row>

                <JinjaFor for="item" in="out_of_compliance">
                    <ComplianceRow />
                </JinjaFor>

                <Row style={{marginTop: "10px"}}>
                    <Column className="bg-yellow-200 p-4 rounded" style={textBase}>
                        <JinjaText className="text-lg" style={h1} name="needs_maintenance_header" />
                    </Column>
                </Row>

                <JinjaFor for="item" in="needs_maintenance">
                    <ComplianceRow />
                </JinjaFor>

                <Row style={{marginTop: "10px"}}>
                    <Column className="bg-green-200 p-4 rounded" style={textBase}>
                        <JinjaText className="text-lg" style={h1} name="compliant_header" />
                    </Column>
                </Row>
            </Container>
        </Tailwind>
    </Html>
);

ComplianceEmail.PreviewProps = {} as ComplianceEmailProps;

export default ComplianceEmail;

const main = {
    backgroundColor: "#ffffff",
};

const container = {
    paddingLeft: "12px",
    paddingRight: "12px",
    margin: "0 auto",
};

const textBase = {
    color: "#333",
    fontFamily:
        "-apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', 'Oxygen', 'Ubuntu', 'Cantarell', 'Fira Sans', 'Droid Sans', 'Helvetica Neue', sans-serif",
}

const h1 = {
    ...textBase,
    fontSize: "24px",
    fontWeight: "bold",
    margin: "10px 0",
    padding: "0",
};

const h2 = {
    ...textBase,
    fontSize: "20px",
    fontWeight: "bold",
    margin: "0 0",
    padding: "0",
};

const link = {
    color: "#2754C5",
    fontFamily:
        "-apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', 'Oxygen', 'Ubuntu', 'Cantarell', 'Fira Sans', 'Droid Sans', 'Helvetica Neue', sans-serif",
    fontSize: "14px",
    textDecoration: "underline",
};

const text = {
    ...textBase,
    fontSize: "14px",
    margin: "24px 0",
};
