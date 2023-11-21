"use client";

interface ComponentProps {
	params: {
		shortToken: string;
	};
}

export default function LivePage({ params: { shortToken } }: ComponentProps) {
    console.log(shortToken);

    return null;
}
