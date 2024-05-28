interface WithConditionalWrapperProps {
    visible: boolean;
}

const withConditionalWrapper = <P extends { children?: React.ReactNode }>(
    WrapperComponent: React.ComponentType<P>
): React.FC<P & WithConditionalWrapperProps> => ({ visible, children, ...props }) => {
    return visible ? (
            <WrapperComponent {...(props as P)}>
                {children}
            </WrapperComponent>
        ) : children;
};

export default withConditionalWrapper;