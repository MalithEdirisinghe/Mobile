import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, ToastAndroid, Image, ScrollView, ActivityIndicator } from 'react-native';
import { auth } from './firebase';
import { sendPasswordResetEmail } from 'firebase/auth';
import { signInWithEmailAndPassword } from 'firebase/auth'; 
import * as SecureStore from 'expo-secure-store';

export default function LoginScreen({ navigation }) {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        const tryAutoLogin = async () => {
            try {
                const storedEmail = await SecureStore.getItemAsync('email');
                const storedPassword = await SecureStore.getItemAsync('password');

                if (storedEmail && storedPassword) {
                    setEmail(storedEmail);
                    setPassword(storedPassword);
                    handleLogin();
                }
            } catch (error) {
                console.error('Error reading stored credentials:', error);
            }
        };

        tryAutoLogin();
    }, []);

    const handleLogin = () => {
        if (email.length === 0 || password.length === 0) {
            console.log('Please enter Email and Password');
            const value = "Please enter Email and Password";
            ToastAndroid.showWithGravityAndOffset(
                value,
                ToastAndroid.SHORT,
                ToastAndroid.BOTTOM,
                25,
                50
            );
        } else {
            setLoading(true);
            signInWithEmailAndPassword(auth, email, password)
                .then(() => {
                    // User logged in successfully
                    console.log('Login Successful!');
                    const value = "Login Successful!";
                    ToastAndroid.showWithGravityAndOffset(
                        value,
                        ToastAndroid.SHORT,
                        ToastAndroid.BOTTOM,
                        25,
                        50
                    );

                    // Store the credentials if "Remember Me" is enabled
                    saveCredentials(email, password);

                    navigation.navigate('Homes'); // Redirect to the home screen or another screen
                })
                .catch(error => {
                    // Handle login errors (e.g., incorrect email or password)
                    if (error.code === 'auth/invalid-login-credentials') {
                        const value = "Incorrect Email or Password";
                        ToastAndroid.showWithGravityAndOffset(
                            value,
                            ToastAndroid.LONG,
                            ToastAndroid.BOTTOM,
                            25,
                            50
                        );
                    }
                    if (error.code === 'auth/too-many-requests') {
                        const value = "Login disabled due to many attempts. Reset password or retry later.";
                        ToastAndroid.showWithGravityAndOffset(
                            value,
                            ToastAndroid.LONG,
                            ToastAndroid.BOTTOM,
                            50,
                            50
                        );
                    }
                })
                .finally(() => {
                    setLoading(false); // Hide loading indicator
                });
        }
    };

    const saveCredentials = async (email, password) => {
        try {
            await SecureStore.setItemAsync('email', email);
            await SecureStore.setItemAsync('password', password);
        } catch (error) {
            console.error('Error saving credentials:', error);
        }
    };

    const handleForgotPassword = () => {
        if (email.length === 0) {
            console.log('Please enter your email');
            const value = 'Please enter your email';
            ToastAndroid.showWithGravityAndOffset(
                value,
                ToastAndroid.SHORT,
                ToastAndroid.BOTTOM,
                25,
                50
            );
        } else {
            sendPasswordResetEmail(auth, email)
                .then(() => {
                    console.log('Password reset email sent successfully!');
                    const value = 'Password reset email sent successfully. Check your email for instructions.';
                    ToastAndroid.showWithGravityAndOffset(
                        value,
                        ToastAndroid.LONG,
                        ToastAndroid.BOTTOM,
                        25,
                        50
                    );
                })
                .catch(error => {
                    console.error(error);
                    console.log('Failed to send password reset email.');
                    const value = 'Failed to send password reset email. Please try again later.';
                    ToastAndroid.showWithGravityAndOffset(
                        value,
                        ToastAndroid.SHORT,
                        ToastAndroid.BOTTOM,
                        25,
                        50
                    );
                });
        }
    }

    return (
        <ScrollView contentContainerStyle={styles.container}>
            <Image
                source={require('./assets/logo.jpg')} // Replace with the path to your logo
                style={styles.logo}
            />
            <View style={styles.header}>
                <Text style={styles.title}>Welcome Back!</Text>
                <Text style={styles.subtitle}>Log in to your account</Text>
            </View>
            <View style={styles.form}>
                <TextInput
                    style={styles.input}
                    placeholder="Email"
                    value={email}
                    onChangeText={text => setEmail(text)}
                />
                <TextInput
                    style={styles.input}
                    placeholder="Password"
                    secureTextEntry
                    value={password}
                    onChangeText={text => setPassword(text)}
                />
                <TouchableOpacity style={styles.loginButton} onPress={handleLogin}>
                    <Text style={styles.loginButtonText}>Login</Text>
                </TouchableOpacity>
                {loading && (
                    <ActivityIndicator size="large" color="#000" style={styles.loadingIndicator} />
                )}
            </View>
            <TouchableOpacity onPress={handleForgotPassword} style={styles.forgotPassword}>
                <Text style={styles.forgotPasswordText}>Forgot Password?</Text>
            </TouchableOpacity>
            <View style={styles.footer}>
                <Text style={styles.footerText}>Don't have an account?</Text>
                <TouchableOpacity onPress={() => navigation.navigate('Signup')}>
                    <Text style={styles.signUpText}>Sign Up</Text>
                </TouchableOpacity>
            </View>
        </ScrollView>
    );
}

const styles = StyleSheet.create({
    container: {
        flexGrow: 1, // Allow the container to grow to accommodate content
        backgroundColor: '#fff',
        padding: 20,
    },
    logo: {
        width: 900, // Adjust the width and height as needed
        height: 170,
        resizeMode: 'contain',
        alignSelf: 'center',
        marginTop: 80, // Add margin to position the logo
    },
    header: {
        alignItems: 'center',
        marginTop: 20, // Adjust the marginTop as needed
    },
    title: {
        fontSize: 28,
        fontWeight: 'bold',
    },
    subtitle: {
        fontSize: 16,
        color: 'gray',
        marginTop: 10,
    },
    form: {
        marginTop: 50,
    },
    input: {
        height: 40,
        borderColor: 'gray',
        borderWidth: 1,
        borderRadius: 5,
        paddingHorizontal: 10,
        marginBottom: 20,
    },
    loginButton: {
        backgroundColor: '#36B12A',
        borderRadius: 5,
        paddingVertical: 15,
        alignItems: 'center',
    },
    loginButtonText: {
        color: '#fff',
        fontSize: 18,
        fontWeight: 'bold',
    },
    forgotPassword: {
        alignItems: 'center',
        marginTop: 20,
    },
    forgotPasswordText: {
        color: 'blue',
    },
    footer: {
        flexDirection: 'row',
        justifyContent: 'center',
        marginTop: 20,
    },
    footerText: {
        color: 'gray',
    },
    signUpText: {
        color: 'blue',
        marginLeft: 5,
    },
});
