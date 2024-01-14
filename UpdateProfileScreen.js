import React, { useState, useEffect, useCallback } from "react";
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  Image,
  TouchableOpacity,
  ScrollView,
  RefreshControl,
  ActivityIndicator,
  ToastAndroid,
} from "react-native";
import { getAuth, updateProfile as updateEmail } from "firebase/auth";
import { doc, getDoc, setDoc } from "firebase/firestore";
import { getDownloadURL, ref, uploadBytes, getStorage } from "firebase/storage";
import Constants from "expo-constants";
import * as ImagePicker from "expo-image-picker";
import { db, app } from "./firebase";

const UpdateProfileScreen = () => {
  const [username, setUsername] = useState(null);
  const [contact, setContact] = useState(null);
  const [emails, setEmail] = useState(null);
  const [profileImageUrl, setProfileImageUrl] = useState(null);
  const [imageUri, setImageUri] = useState(null);
  const [refreshing, setRefreshing] = useState(false);
  const [loading, setLoading] = useState(false);

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    fetchData(); // Assume fetchData is a function to refetch data from Firebase
    setRefreshing(false);
  }, []);

  const fetchData = async () => {
    const user = getAuth().currentUser;
    if (user) {
      // setUsername(user.displayName);
      setEmail(user.email);

      const storage = getStorage(app);
      const storageRef = ref(storage, `user_images/${user.uid}.jpeg`);

      try {
        const url = await getDownloadURL(storageRef);
        setProfileImageUrl(url);
      } catch (error) {
        console.error("Error fetching profile picture:", error);
      }

      const userRef = doc(db, "users", user.uid);

      try {
        const docSnapshot = await getDoc(userRef);

        if (docSnapshot.exists()) {
          setContact(docSnapshot.data().contactNumber);
          setUsername(docSnapshot.data().name);
        } else {
          console.log("Volunteer ID not found in Firestore for the user.");
        }
      } catch (error) {
        console.error("Error fetching user document:", error);
      }
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const updateProfile = async () => {
    if (!contact || !username) {
      const value = "Please fill in all fields.";
      ToastAndroid.showWithGravityAndOffset(
        value,
        ToastAndroid.SHORT,
        ToastAndroid.BOTTOM,
        25,
        50
      );
      return;
    }
    setLoading(true);
    const user = getAuth().currentUser;
    const isEmailVerified = user.emailVerified;
    console.log("Details", user);

    try {
      if (emails && emails !== user.email) {
        await updateEmail(user, emails);

        // Send email verification
        await sendEmailVerification(user.email);

        console.log("Email updated successfully. Verification email sent.");
      }

      // Update Firestore data
      const userRef = doc(db, "users", user.uid);

      const dataToUpdate = {};

      if (imageUri) {
        // If a new image is selected, upload it to storage
        const storage = getStorage(app);
        const storageRef = ref(storage, `user_images/${user.uid}.jpeg`);

        // Upload the image
        const response = await fetch(imageUri);
        const blob = await response.blob();
        await uploadBytes(storageRef, blob);

        // Get the download URL of the uploaded image
        const imageUrl = await getDownloadURL(storageRef);
        dataToUpdate.profileImageUrl = imageUrl;
      }

      if (contact !== null) {
        dataToUpdate.contactNumber = contact;
      }

      if (username !== null) {
        dataToUpdate.name = username;
      }

      // Update other fields as needed

      // Update the Firestore document
      await setDoc(userRef, dataToUpdate, { merge: true });

      console.log("Profile updated successfully!");
      const value = "Profile updated successfully!";
      ToastAndroid.showWithGravityAndOffset(
        value,
        ToastAndroid.SHORT,
        ToastAndroid.BOTTOM,
        25,
        50
      );
    } catch (error) {
      console.error("Error updating profile:", error);
    } finally {
      setLoading(false); // Set loading back to false, whether the update was successful or not
    }
  };

  const sendEmailVerification = async (user) => {
    try {
      await sendEmailVerification(user);
      console.log("Verification email sent successfully.");
    } catch (error) {
      console.error("Error sending verification email:", error);
      // Handle error appropriately, e.g., display an error message to the user
    }
  };

  const handleImageUpload = async () => {
    if (Constants.platform.android) {
      const { status } =
        await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (status !== "granted") {
        alert("Sorry, we need media library permissions to make this work!");
        return;
      }

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [1, 1],
        quality: 1,
      });

      if (!result.canceled) {
        setImageUri(result.assets[0].uri);
        setProfileImageUrl(result.assets[0].uri);
      } else {
        console.log("Image selection canceled");
      }
    }
  };

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.contentContainer}
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
      }
    >
      <View style={styles.container}>
        <Text style={styles.option}>Profile</Text>
        {profileImageUrl ? (
          <Image
            source={{ uri: profileImageUrl }}
            style={styles.profileImage}
          />
        ) : (
          <Image
            source={require("./assets/users.png")}
            style={styles.profileImage}
          />
        )}

        <TouchableOpacity onPress={handleImageUpload}>
          <Image
            source={require("./assets/camVector.png")}
            style={styles.camera}
          />
        </TouchableOpacity>
        <Text style={styles.texts}>Email:</Text>
        <TextInput
          style={styles.input}
          value={emails}
          onChangeText={(text) => setEmail(text)}
          editable={false}
        />
        <Text style={styles.texts}>Name:</Text>
        <TextInput
          style={styles.input}
          value={username}
          onChangeText={(text) => setUsername(text)}
          placeholder="Enter your Name"
        />
        <Text style={styles.texts}>Contact No:</Text>
        <TextInput
          style={styles.input}
          value={contact}
          onChangeText={(Number) => setContact(Number)}
          placeholder="Enter your Contact"
          keyboardType="number-pad"
        />
        {/* <Button title="Update Profile" onPress={updateProfile} /> */}
        {loading && (
          <ActivityIndicator
            size="large"
            color="#40916C"
            style={styles.loadingIndicator}
          />
        )}

        <TouchableOpacity
          style={styles.signupButton}
          onPress={updateProfile}
          disabled={loading}
        >
          <Text style={styles.signupButtonText}>Update Profile</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  contentContainer: {
    justifyContent: "flex-start",
    alignItems: "center",
    paddingTop: 100,
  },
  input: {
    height: 40,
    borderColor: "gray",
    borderWidth: 1,
    borderRadius: 5,
    margin: 10,
    padding: 10,
    width: 300,
  },
  signupButton: {
    backgroundColor: "#40916C",
    borderRadius: 5,
    paddingVertical: 15,
    alignItems: "center",
    marginVertical: 20,
  },
  signupButtonText: {
    color: "white",
    fontSize: 15,
    fontWeight: "bold",
  },
  profileImage: {
    width: 120,
    height: 120,
    borderRadius: 60,
    top: -30,
    left: 100,
  },
  texts: {
    fontSize: 15,
    fontWeight: "bold",
  },
  camera: {
    top: -145,
    left: 200,
  },
  option: {
    fontSize: 35,
    fontWeight: "bold",
    textAlign: "center",
    top: -50,
    right: 0,
  },
});

export default UpdateProfileScreen;
