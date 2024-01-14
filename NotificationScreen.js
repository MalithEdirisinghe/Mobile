import React, { useState, useEffect, useCallback } from "react";
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  TouchableOpacity,
  Linking,
  Alert,
  ActivityIndicator,
} from "react-native";
import { auth } from "./firebase";
import { scheduleNotificationAsync } from "expo-notifications";
import SocketIOClient from "socket.io-client";
import axios from "axios";

const NotificationScreen = () => {
  const [notifications, setNotifications] = useState([]);
  const [userId, setUserId] = useState(
    auth.currentUser ? auth.currentUser.uid : null
  );
  const [lastResponseTime, setLastResponseTime] = useState(null);
  const [loading, setLoading] = useState(false);
  const [socket, setSocket] = useState(null);

  const initializeSocket = useCallback(() => {
    const newSocket = SocketIOClient("wss://kids-app.adaptable.app", {
      reconnection: true,
      reconnectionAttempts: 5,
    });

    newSocket.on("connect", () => {
      console.log("Connected to server on NotificationScreen.js");
      setSocket(newSocket);
      fetchNotifications();
    });

    newSocket.on("disconnect", () => {
      console.log("Disconnected from server on NotificationScreen.js");
    });

    newSocket.on("getLocation", (data) => {
      console.log("Incoming data on NotificationScreen.js", data);
    });

    return () => {
      newSocket.disconnect();
    };
  }, [fetchNotifications]);

  useEffect(() => {
    initializeSocket();
  }, [initializeSocket]);

  const falseReport = useCallback(
    async (sharedId) => {
      // Show a confirmation dialog before proceeding
      Alert.alert(
        "Confirm False Report",
        "Are you sure you want to report this as a false report?",
        [
          {
            text: "No",
            style: "cancel",
          },
          {
            text: "Yes",
            onPress: async () => {
              setLoading(true);
              // Prepare data for the PATCH request
              const data = {
                sharedId: sharedId,
                isActive: false,
              };

              try {
                // Make a PATCH request to the API endpoint
                const response = await axios.patch(
                  "https://kids-app.adaptable.app/api/updateIsActive",
                  data
                );

                // Check if the request was successful
                if (response.status === 200) {
                  console.log("API call successful:", response.data);
                  // You can perform additional actions here if needed
                } else {
                  console.error("API call failed:", response.statusText);
                  // Handle the error accordingly
                }
              } catch (error) {
                console.error("Error during API call:", error.message);
              } finally {
                setLoading(false);
                Alert.alert(
                  "False Report Submitted",
                  "Thank you for reporting. We will review the case."
                );
                fetchNotifications(userId);
                socket.on("getLocation", (data) => {
                  console.log("Incoming data", data);
                });
              }
            },
          },
        ],
        { cancelable: false }
      );
    },
    [userId, fetchNotifications]
  );

  const sendRequestID = (ID) => {
    socket.emit("getLocation", ID);
  };

  const fetchNotifications = useCallback(() => {
    if (socket) {
      const data = { requestID: userId };
      socket.emit("getLocation", data);

      socket.on("getLocation", (data) => {
        const latestNotifications = data.slice(-9);
        setNotifications(latestNotifications);
        const latestNotification =
          latestNotifications.length > 0
            ? latestNotifications[latestNotifications.length - 1]
            : null;

        if (
          latestNotification &&
          latestNotification.locationStartTime !== lastResponseTime &&
          userId !== lastResponseTime
        ) {
          showPushNotification(
            `New notification: ${latestNotification.sharedUsername}`
          );
          setLastResponseTime(latestNotification.locationStartTime);
          setUserId(userId);
        }
      });
    }
  }, [socket, userId, lastResponseTime, setNotifications, setLastResponseTime]);

  const showPushNotification = async (message) => {
    await scheduleNotificationAsync({
      content: {
        title: "New Case",
        body: message,
      },
      trigger: null,
    });
  };

  useEffect(() => {
    if (userId) {
      fetchNotifications(); // Initial fetch

      const interval = setInterval(() => {
        fetchNotifications(); // Fetch every 3 seconds
      }, 3000);

      return () => clearInterval(interval);
    }
  }, [userId, fetchNotifications]);

  const openGoogleMaps = (latitude, longitude) => {
    const mapUrl = `https://www.google.com/maps/dir/?api=1&destination=${latitude},${longitude}`;
    Linking.openURL(mapUrl);
  };

  const formatTime = (timestamp) => {
    const date = new Date(timestamp);
    const hours = date.getHours().toString().padStart(2, "0");
    const minutes = date.getMinutes().toString().padStart(2, "0");
    return `${hours}:${minutes}`;
  };

  return (
    <View style={styles.container}>
      <Text style={styles.notification}>Notification</Text>
      {loading && (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#40916C" />
        </View>
      )}
      <FlatList
        data={notifications.reverse()} // Reverse the order of notifications
        keyExtractor={(item, index) => `${item.locationStartTime}-${index}`}
        renderItem={({ item }) => (
          <View style={styles.notificationItem}>
            <Text>{item.sharedUsername} Reported some case</Text>
            <Text>Time: {formatTime(item.locationStartTime)}</Text>
            <TouchableOpacity
              style={styles.directionButton}
              onPress={() => openGoogleMaps(item.sharedLat, item.sharedLong)}
            >
              <Text style={styles.buttonText}>Get Direction</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.directionButton}
              onPress={() => falseReport(item.sharedId)}
              disabled={loading}
            >
              {loading ? (
                <ActivityIndicator size="small" color="#fff" />
              ) : (
                <Text style={styles.buttonText}>False Report</Text>
              )}
            </TouchableOpacity>
          </View>
        )}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    top: 50,
    flex: 1,
    justifyContent: "flex-end",
  },
  notificationItem: {
    backgroundColor: "#D3F2E6",
    padding: 16,
    marginVertical: 8,
    top: 10,
    borderRadius: 12,
    width: 350,
    left: 20,
  },
  directionButton: {
    marginTop: 10,
    backgroundColor: "#40916C",
    padding: 10,
    borderRadius: 5,
    alignItems: "center",
  },
  buttonText: {
    color: "#fff",
  },
  notification: {
    fontSize: 30,
    fontWeight: "bold",
    left: 20,
  },
  loadingContainer: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(0, 0, 0, 0.5)", // Semi-transparent background
  },
});

export default NotificationScreen;
