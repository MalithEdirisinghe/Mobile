import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Modal } from 'react-native';

const ConfirmationDialog = ({ isVisible, message, onCancel, onConfirm }) => {
    return (
        <Modal transparent={true} animationType="slide" visible={isVisible}>
            <View style={styles.container}>
                <View style={styles.dialog}>
                    <Text style={styles.message}>{message}</Text>
                    <View style={styles.buttonContainer}>
                        <TouchableOpacity style={styles.cancelButton} onPress={onCancel}>
                            <Text style={styles.buttonTextCancel}>Cancel</Text>
                        </TouchableOpacity>
                        <TouchableOpacity style={styles.confirmButton} onPress={onConfirm}>
                            <Text style={styles.buttonText}>Logout</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </View>
        </Modal>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    dialog: {
        width: 350,
        height: 150,
        backgroundColor: '#CAD2CB',
        borderRadius: 40,
        top: 260
    },
    message: {
        width: 202,
        height: 35,
        fontSize: 16,
        lineHeight: 17,
        color: '#000000',
        // fontFamily: 'Inter',
        fontWeight: '400',
        alignSelf: 'center',
        marginTop: 20,
    },
    buttonContainer: {
        flexDirection: 'row',
        justifyContent: 'center',
    },
    cancelButton: {
        width: 100,
        height: 40,
        backgroundColor: '#CAD2CB',
        borderColor: '#40916C',
        borderWidth: 2,
        borderRadius: 8,
        alignItems: 'center',
        justifyContent: 'center',
        marginTop: 20,
        marginRight: 20,
    },
    confirmButton: {
        width: 100,
        height: 40,
        borderColor: '#40916C',
        backgroundColor: '#40916C',
        borderWidth: 2,
        borderRadius: 8,
        alignItems: 'center',
        justifyContent: 'center',
        marginTop: 20,
        marginLeft: 20,
    },
    buttonText: {
        color: '#D8F3DC',
        // fontFamily: 'Inter',
        fontWeight: '600',
        fontSize: 14,
        lineHeight: 17,
    },
    buttonTextCancel: {
        color: '#40916C',
        fontWeight: '600',
        fontSize: 14,
        lineHeight: 17,
    }
});

export default ConfirmationDialog;
