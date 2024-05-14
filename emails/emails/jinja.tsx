import {
    Body,
    Container,
    Head,
    Heading,
    Html,
    Img,
    ImgProps,
    Link,
    Section,
    Text,
    TextProps,
} from "@react-email/components";
import * as React from "react";

const RENDER_JINJA = process.env["npm_lifecycle_event"] !== "dev";

interface JinjaForProps {
    for: string;
    in: string;
    children: React.ReactNode;
}

export const JinjaFor = (props: JinjaForProps) => {
    if (!RENDER_JINJA) {
        return <>{props.children}</>;
    }
    return <>{ "{% for " + props["for"] + " in " + props["in"] + "%}" }{ props.children }{"{% endfor %}"}</>
}

interface JinjaTextProps {
    name: string;
}

export const JinjaText = ({ name, ...textProps }: JinjaTextProps & TextProps) => {
    if (!RENDER_JINJA) {
        return <Text {...textProps}>{name}</Text>;
    }
    const rawHtml = `{{ ${name} }}`;
    return <Text dangerouslySetInnerHTML={{ __html: rawHtml }} {...textProps}></Text>;
}

interface JinjaImgProps {
    src: string;
    previewSrc: string;
}

export const JinjaImg = ({ src, previewSrc, ...imgProps }: JinjaImgProps & ImgProps) => {
    if (!RENDER_JINJA) {
        return <Img
            src={previewSrc}
            {...imgProps}
            />;
    }
    return (
        <>
            { "{% if " + src + " %}" }
            <Img
                src={ "{{ " + src + ".url }}" }
                {...imgProps}
                />
            { "{% endif %}" }
        </>
    );
}
