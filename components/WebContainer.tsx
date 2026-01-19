import React from 'react';
import { Platform, StyleSheet, View, ViewProps } from 'react-native';
import { spacing } from '../theme';

interface WebContainerProps extends ViewProps {
    maxWidth?: number;
}

export const WebContainer: React.FC<WebContainerProps> = ({
    children,
    style,
    maxWidth = 1024,
    ...props
}) => {
    if (Platform.OS !== 'web') {
        return <View style={style} {...props}>{children}</View>;
    }

    return (
        <View style={[styles.container, style]} {...props}>
            <View style={[styles.content, { maxWidth }]}>
                {children}
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        width: '100%',
        alignItems: 'center',
    },
    content: {
        width: '100%',
        paddingHorizontal: spacing[4],
    },
});
