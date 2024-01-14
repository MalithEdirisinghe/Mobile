// SplashScreen.js
import React, { useEffect } from 'react';
import { View, Text, Image, StyleSheet } from 'react-native';

const SplashScreen = ({ navigation }) => {
    // Use useEffect to navigate to the main screen after a delay
    useEffect(() => {
        const timer = setTimeout(() => {
            navigation.replace('Login'); // Replace with your main screen name
        }, 2000); // Set the duration for how long the splash screen should be displayed (in milliseconds)
        return () => clearTimeout(timer); // Clear the timer if the component unmounts
    }, []);

    return (
        <View style={styles.container}>
            <Image
                source={require('./assets/logo.jpg')}
                style={styles.logo}
            />
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: 'white',
    },
    logo: {
        width: 900,
        height: 170,
        resizeMode: 'center',
    },
});

export default SplashScreen;
