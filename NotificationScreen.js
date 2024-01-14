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
                // Handle the error accordingly
              } finally {
                setLoading(false); // Set loading to false when the request completes (success or error)
                // You can perform additional actions after the API call if needed
                // ...
                Alert.alert(
                  "False Report Submitted",
                  "Thank you for reporting. We will review the case."
                );
                // You may want to refresh the notifications after a false report
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

  const socket = SocketIOClient("wss://kids-app.adaptable.app", {
    reconnection: true,
    reconnectionAttempts: 5,
  });

  useEffect(() => {
    socket.on("connect", () => {
      fetchNotifications();
      console.log("Connected to server on NotificationScreen.js");
    });

    socket.on("disconnect", () => {
      console.log("Disconnected from server on NotificationScreen.js");
    });

    socket.on("getLocation", (data) => {
      console.log("Incoming data on NotificationScreen.js", data);
    });

    return () => {
      // Cleanup when component unmounts
      socket.disconnect();
    };
  }, []);

  const sendRequestID = (ID) => {
    socket.emit("getLocation", ID);
  };

  const fetchNotifications = () => {
    const data = { requestID: userId };
    sendRequestID(data);

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
  };

  const showPushNotification = async (message) => {
    await scheduleNotificationAsync({
      content: {
        title: "New Case",
        body: message,
      },
      trigger: null,
    });
  };

  const openGoogleMaps = (latitude, longitude) => {
    const mapUrl = `https://www.google.com/maps/dir/?api=1&destination=${latitude},${longitude}`;
    Linking.openURL(mapUrl);
  };

  useEffect(() => {
    if (userId) {
      // Fetch notifications when the component mounts
      fetchNotifications(userId);
    }

    // Use an interval to fetch notifications every 3 seconds
    const interval = setInterval(() => {
      if (userId) {
        fetchNotifications(userId);
      }
    }, 5000);

    // Clear the interval when the component unmounts
    return () => clearInterval(interval);
  }, [userId, lastResponseTime, sendRequestID]);

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
