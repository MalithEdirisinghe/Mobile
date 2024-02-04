import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  Image,
  StyleSheet,
  TouchableOpacity,
  Modal,
  ScrollView,
  TouchableHighlight,
} from "react-native";
import { auth, db, app } from "./firebase";
import { getAuth, signOut } from "firebase/auth";
import { doc, getDoc } from "firebase/firestore";
import { getDownloadURL, ref, getStorage } from "firebase/storage";
import ConfirmationDialog from "./ConfirmationDialog";
import { BackHandler } from "react-native";
import * as Location from "expo-location";
import SocketIOClient from "socket.io-client";

const socket = SocketIOClient("wss://kids-app.adaptable.app", {
  reconnection: true,
  reconnectionAttempts: 5,
});

const sendLocationToAPI = (userId, username, latitude, longitude) => {
  const requestData = {
    userId: userId,
    userUsername: username,
    userLat: latitude.toString(),
    userLong: longitude.toString(),
  };

  socket.emit("sendLocation", requestData);
  console.log("Location data emitted successfully.");
};

const SupportDetailsModal = ({ isVisible, onClose }) => {
  return (
    <Modal
      animationType="slide"
      transparent={true}
      visible={isVisible}
      onRequestClose={onClose}
    >
      <View style={styles.modalContainer}>
        <View style={styles.modalContent}>
          <Text style={styles.modalTitle}>Support Details</Text>
          <ScrollView contentContainerStyle={styles.modalTextContainer}>
            <Text style={styles.modalText}>
              Child abuse is a pervasive and profoundly troubling issue
              affecting children worldwide. Detecting and preventing child abuse
              in its early stages is paramount to ensure the safety and
              well-being of children. Support the team to identify possible
              attacks and prevent them.
            </Text>
            <Text style={styles.modalTitle}>Data Privacy</Text>
            <Text style={styles.modalText}>
              We don't sell your personal data to advertisers, and we don't
              share information that directly identifies you (such as your name,
              email address, or other contact information) with advertisers
              unless you give us permission.
            </Text>
          </ScrollView>
          <TouchableHighlight style={styles.modalCloseButton} onPress={onClose}>
            <Text style={styles.modalCloseButtonText}>Close</Text>
          </TouchableHighlight>
        </View>
      </View>
    </Modal>
  );
};

const HomeScreen = ({ navigation }) => {
  const [username, setUsername] = useState(null);
  const [name, setName] = useState(null);
  const [volunteerId, setVolunteerId] = useState(null);
  const [profileImageUrl, setProfileImageUrl] = useState(null);
  const [showConfirmationDialog, setShowConfirmationDialog] = useState(false);
  const [showSupportDetails, setShowSupportDetails] = useState(false);
  const [isSocketConnected, setIsSocketConnected] = useState(false);

  useEffect(() => {
    const LOCATION_TASK_NAME = "background-location-task";

    Location.startLocationUpdatesAsync(LOCATION_TASK_NAME, {
      accuracy: Location.Accuracy.Balanced,
      timeInterval: 3000,
      foregroundService: {
        notificationTitle: "Location Tracking",
        notificationBody: "Location tracking is running",
      },
    });

    const user = getAuth().currentUser;

    if (user) {
      setUsername(user.displayName);

      const storage = getStorage(app);
      const storageRef = ref(storage, `user_images/${user.uid}.jpeg`);

      getDownloadURL(storageRef)
        .then((url) => {
          setProfileImageUrl(url);
        })
        .catch((error) => {
          console.error("Error fetching profile picture:", error);
        });

      (async () => {
        const userRef = doc(db, "users", user.uid);

        try {
          const docSnapshot = await getDoc(userRef);

          if (docSnapshot.exists()) {
            setVolunteerId(docSnapshot.data().volunteerID);
          }

          if (docSnapshot.exists()) {
            setName(docSnapshot.data().name);
          }
        } catch (error) {
          console.error("Error fetching user document:", error);
        }
      })();
    }

    const backAction = () => {
      if (navigation.isFocused()) {
        BackHandler.exitApp();
        return true;
      }
      return false;
    };

    const backHandler = BackHandler.addEventListener(
      "hardwareBackPress",
      backAction
    );

    return () => {
      backHandler.remove();
      Location.stopLocationUpdatesAsync(LOCATION_TASK_NAME);
    };
  }, [navigation]);

  const handleButtonPress = () => {
    navigation.navigate("Report");
  };

  const handleUpdateButtonPress = () => {
    navigation.navigate("Profile");
  };

  const handleLogoutButtonPress = () => {
    setShowConfirmationDialog(true);
  };

  const handleLogoutConfirmed = () => {
    setShowConfirmationDialog(false);
    signOut(auth)
      .then(() => {
        navigation.navigate("Login");
      })
      .catch((error) => {
        console.error("Error logging out:", error);
      });
  };

  const handleLogoutCancelled = () => {
    setShowConfirmationDialog(false);
  };

  const handleSupportButtonPress = () => {
    setShowSupportDetails(true);
  };

  const handleSupportDetailsClose = () => {
    setShowSupportDetails(false);
  };

  useEffect(() => {
    const unsubscribe = navigation.addListener("focus", () => {
      const user = getAuth().currentUser;
      if (user) {
        setUsername(user.displayName);

        const storage = getStorage(app);
        const storageRef = ref(storage, `user_images/${user.uid}.jpeg`);

        getDownloadURL(storageRef)
          .then((url) => {
            setProfileImageUrl(url);
          })
          .catch((error) => {
            console.error("Error fetching profile picture:", error);
          });

        (async () => {
          const userRef = doc(db, "users", user.uid);

          try {
            const docSnapshot = await getDoc(userRef);

            if (docSnapshot.exists()) {
              setVolunteerId(docSnapshot.data().volunteerID);
            }

            if (docSnapshot.exists()) {
              setName(docSnapshot.data().name);
            }
          } catch (error) {
            console.error("Error fetching user document:", error);
          }
        })();
      }
    });

    return unsubscribe;
  }, [navigation]);

  return (
    <View style={styles.container}>
      {profileImageUrl ? (
        <Image source={{ uri: profileImageUrl }} style={styles.profileImage} />
      ) : (
        <Image source={require("./assets/users.png")} style={styles.image} />
      )}
      <Text style={styles.username}>Welcome {name || "Guest"}</Text>
      <Text style={styles.volunteerId}>Volunteer ID: {volunteerId}</Text>

      <Text style={styles.option}>Options</Text>

      <TouchableOpacity style={styles.button} onPress={handleUpdateButtonPress}>
        <Image
          source={require("./assets/VectorUpdate.png")}
          style={styles.vectorIcon}
        />
        <Text style={styles.buttonText}>Update</Text>
      </TouchableOpacity>
      <TouchableOpacity
        style={styles.buttonSupport}
        onPress={handleSupportButtonPress}
      >
        <Image
          source={require("./assets/VectorSupport.png")}
          style={styles.vectorIcon}
        />
        <Text style={styles.buttonTextSupport}>Support</Text>
      </TouchableOpacity>

      <SupportDetailsModal
        isVisible={showSupportDetails}
        onClose={handleSupportDetailsClose}
      />

      <TouchableOpacity style={styles.buttonReport} onPress={handleButtonPress}>
        <Image
          source={require("./assets/VectorReport.png")}
          style={styles.vectorIcon}
        />
        <Text style={styles.buttonTextReport}>Reports</Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={styles.buttonLogout}
        onPress={handleLogoutButtonPress}
      >
        <Image
          source={require("./assets/VectorLogout.png")}
          style={styles.vectorIcon}
        />
        <Text style={styles.buttonTextLogout}>Logout</Text>
      </TouchableOpacity>

      <ConfirmationDialog
        isVisible={showConfirmationDialog}
        message="Are you sure you want to logout?"
        onCancel={handleLogoutCancelled}
        onConfirm={handleLogoutConfirmed}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    top: 100,
    flex: 1,
    justifyContent: "flex-start",
    alignItems: "center",
  },
  username: {
    fontSize: 24,
    fontWeight: "bold",
  },
  volunteerId: {
    fontSize: 18,
    marginTop: 20,
  },
  option: {
    fontSize: 35,
    fontWeight: "bold",
    textAlign: "left",
    top: 100,
    right: 105,
  },
  profileImage: {
    width: 120,
    height: 120,
    borderRadius: 60,
  },
  button: {
    position: "absolute",
    width: 150,
    height: 80,
    left: 25,
    top: 350,
    backgroundColor: "#9DE0A8",
    borderRadius: 12,
    justifyContent: "center",
    alignItems: "center",
    shadowColor: "rgba(64, 145, 108, 0.75)",
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 6,
    elevation: 6,
  },
  buttonSupport: {
    position: "absolute",
    width: 150,
    height: 80,
    left: 210,
    top: 350,
    backgroundColor: "#9DE0A8",
    borderRadius: 12,
    justifyContent: "center",
    alignItems: "center",
    shadowColor: "rgba(64, 145, 108, 0.75)",
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 6,
    elevation: 6,
  },
  buttonReport: {
    position: "absolute",
    width: 150,
    height: 80,
    left: 25,
    top: 450,
    backgroundColor: "#9DE0A8",
    borderRadius: 12,
    justifyContent: "center",
    alignItems: "center",
    shadowColor: "rgba(64, 145, 108, 0.75)",
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 6,
    elevation: 6,
  },
  buttonLogout: {
    position: "absolute",
    width: 150,
    height: 80,
    left: 210,
    top: 450,
    backgroundColor: "#9DE0A8",
    borderRadius: 12,
    justifyContent: "center",
    alignItems: "center",
    shadowColor: "rgba(64, 145, 108, 0.75)",
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 6,
    elevation: 6,
  },
  vectorIcon: {
    position: "absolute",
    left: 10,
    top: 10,
    width: 25,
    height: 25,
  },
  buttonText: {
    color: "#0D5C2A",
    fontWeight: "400",
    position: "absolute",
    fontStyle: "normal",
    lineHeight: 24,
    fontSize: 20,
    left: 10,
    top: 40,
    width: 70,
    height: 28,
  },
  buttonTextSupport: {
    color: "#0D5C2A",
    fontWeight: "400",
    position: "absolute",
    fontStyle: "normal",
    lineHeight: 24,
    fontSize: 20,
    left: 10,
    top: 40,
    width: 80,
    height: 28,
  },
  buttonTextReport: {
    color: "#0D5C2A",
    fontWeight: "400",
    position: "absolute",
    fontStyle: "normal",
    lineHeight: 24,
    fontSize: 20,
    left: 10,
    top: 40,
    width: 80,
    height: 28,
  },
  buttonTextLogout: {
    color: "#0D5C2A",
    fontWeight: "400",
    position: "absolute",
    fontStyle: "normal",
    lineHeight: 24,
    fontSize: 20,
    left: 10,
    top: 40,
    width: 80,
    height: 28,
  },
  modalContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    marginTop: 350,
    borderRadius: 40,
  },
  modalContent: {
    backgroundColor: "#CAD2CB",
    borderTopLeftRadius: 40,
    borderTopRightRadius: 40,
    padding: 20,
    borderRadius: 10,
    elevation: 5,
  },
  modalTitle: {
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 10,
    color: "green",
  },
  modalTextContainer: {
    paddingBottom: 40, // Adjust as needed
  },
  modalText: {
    fontSize: 16,
    marginBottom: 10,
    color: "#000",
  },
  modalCloseButton: {
    backgroundColor: "#40916C",
    borderRadius: 5,
    paddingVertical: 10,
    alignItems: "center",
    marginTop: 10,
  },
  modalCloseButtonText: {
    color: "white",
    fontSize: 16,
    fontWeight: "bold",
  },
});

export default HomeScreen;