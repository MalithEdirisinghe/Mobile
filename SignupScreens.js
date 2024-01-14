import React, { useState } from "react";
import {
  View,
  Text,
  Image,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ToastAndroid,
  Button,
  ScrollView,
  ActivityIndicator,
} from "react-native";
import { auth, firestore, app, db } from "./firebase";
import {
  createUserWithEmailAndPassword,
  updateProfile,
  AuthErrorCodes,
} from "firebase/auth";
import { doc, setDoc } from "firebase/firestore";
import { ref, uploadBytes, getStorage } from "firebase/storage";
import * as ImagePicker from "expo-image-picker";
import Constants from "expo-constants";
import "firebase/storage";
import { Base_url } from "./common/baseUrl";

export default function SignupScreen({ navigation }) {
  const [email, setEmail] = useState("");
  const [Volunteer, setVolunteer] = useState("");
  const [Contact, setContact] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [username, setUsername] = useState("");
  const [name, setName] = useState("");
  const [errorMessage, setErrorMessage] = useState(null);
  const [imageUri, setImageUri] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleSignup = async () => {
    if (
      !email ||
      !Volunteer ||
      !Contact ||
      !username ||
      !name ||
      !password ||
      !confirmPassword
    ) {
      const value = "Please fill in all fields.";
      ToastAndroid.showWithGravityAndOffset(
        value,
        ToastAndroid.SHORT,
        ToastAndroid.BOTTOM,
        25,
        50
      );
    } else if (password !== confirmPassword) {
      const value = "Passwords do not match.";
      ToastAndroid.showWithGravityAndOffset(
        value,
        ToastAndroid.SHORT,
        ToastAndroid.BOTTOM,
        25,
        50
      );
    } else {
      if (loading) {
        return; // Prevent multiple sign-up attempts while already loading
      }

      // Set loading to true at the beginning of the signup process
      setLoading(true);
      try {
        const userCredential = await createUserWithEmailAndPassword(
          auth,
          email,
          password
        );
        const user = userCredential.user;

        console.log("User registered successfully:", user.email);
        console.log("Signup Successful!");

        await updateProfile(auth.currentUser, { displayName: username });
        console.log("Username:", user.displayName);

        const userData = {
          email: user.email,
          volunteerID: Volunteer,
          contactNumber: Contact,
          name: name,
        };

        const docRef = doc(db, "users", user.uid);

        const storage = getStorage(app);

        // Set the user data in Firestore using the user's UID as the document ID
        await setDoc(docRef, userData);

        if (imageUri) {
          // console.log('Image URI is: ', imageUri);

          // Convert and upload the image to Firebase Storage as a JPEG
          const storageRef = ref(storage, `user_images/${user.uid}.jpeg`);
          const response = await fetch(imageUri);
          const blob = await response.blob();
          await uploadBytes(storageRef, blob);
          // console.log('Image uploaded to Firebase Storage');
        } else {
          console.log("Image URI is null");
        }

        const value = "Signup Successful!";
        ToastAndroid.showWithGravityAndOffset(
          value,
          ToastAndroid.SHORT,
          ToastAndroid.BOTTOM,
          25,
          50
        );
        navigation.navigate("Login");

        const userLocationData = {
          userId: user.uid, // Use the user's UID as the userId
          userUsername: user.displayName,
          userLat: "8.60874742441555", // Replace with the actual latitude
          userLong: "80.5377715276729", // Replace with the actual longitude
        };

        // Make a POST request to save the user's location
        const apiUrl = "https://kids-app.adaptable.app/api/saveUser";
        const response = await fetch(apiUrl, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(userLocationData),
        });

        if (response.status == 201) {
          console.log("User location saved successfully.");
        } else {
          console.error("Failed to save user location.");
        }
        setLoading(false);
      } catch (error) {
        setLoading(false);
        if (error.code === AuthErrorCodes.EMAIL_EXISTS) {
          const value =
            "Email is already in use. Please use a different email.";
          ToastAndroid.showWithGravityAndOffset(
            value,
            ToastAndroid.SHORT,
            ToastAndroid.BOTTOM,
            25,
            50
          );
        } else {
          console.log(error);
          setErrorMessage(
            "An error occurred during signup. Please try again later."
          );
        }
      }
    }
  };

  const handleLogin = () => {
    navigation.navigate("Login");
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

      // console.log('ImagePicker result:', result);

      if (!result.canceled) {
        // Use the image URI directly
        setImageUri(result.assets[0].uri);
        // console.log('Image URI set:', result.uri);
      } else {
        console.log("Image selection canceled");
      }
    }
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.title}>Create an Account</Text>

      {imageUri ? (
        <Image source={{ uri: imageUri }} style={styles.image} />
      ) : (
        <Image source={require("./assets/users.png")} style={styles.image} />
      )}

      <Button title="Upload Image" onPress={handleImageUpload} />

      <TextInput
        style={styles.input}
        placeholder="Email"
        value={email}
        onChangeText={(text) => setEmail(text)}
      />
      <TextInput
        style={styles.input}
        placeholder="Volunteer ID"
        value={Volunteer}
        onChangeText={(text) => setVolunteer(text)}
      />
      <TextInput
        style={styles.input}
        placeholder="Username"
        value={username}
        onChangeText={(text) => setUsername(text)}
      />
      <TextInput
        style={styles.input}
        placeholder="Name"
        value={name}
        onChangeText={(text) => setName(text)}
      />
      <TextInput
        style={styles.input}
        placeholder="Contact Number"
        value={Contact}
        onChangeText={(Number) => setContact(Number)}
        keyboardType="number-pad"
      />
      <TextInput
        style={styles.input}
        placeholder="Password"
        secureTextEntry
        value={password}
        onChangeText={(text) => setPassword(text)}
      />
      <TextInput
        style={styles.input}
        placeholder="Confirm Password"
        secureTextEntry
        value={confirmPassword}
        onChangeText={(text) => setConfirmPassword(text)}
      />
      <TouchableOpacity
        style={styles.signupButton}
        onPress={handleSignup}
        disabled={loading}
      >
        {loading ? (
          <ActivityIndicator size="small" color="white" />
        ) : (
          <Text style={styles.signupButtonText}>Sign Up</Text>
        )}
      </TouchableOpacity>
      <TouchableOpacity style={styles.loginLink} onPress={handleLogin}>
        <Text style={styles.loginLinkText}>Already have an account? Login</Text>
      </TouchableOpacity>
      {<Text style={styles.errorMessage}>{errorMessage}</Text>}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    backgroundColor: "white",
    padding: 20,
    alignItems: "center",
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    marginVertical: 20,
  },
  image: {
    width: 100,
    height: 100,
    borderRadius: 50,
  },
  input: {
    width: "100%",
    height: 40,
    borderColor: "gray",
    borderWidth: 1,
    borderRadius: 5,
    paddingHorizontal: 10,
    marginVertical: 10,
  },
  signupButton: {
    backgroundColor: "#36B12A",
    borderRadius: 5,
    paddingVertical: 15,
    width: "100%",
    alignItems: "center",
    marginVertical: 20,
  },
  signupButtonText: {
    color: "white",
    fontSize: 18,
    fontWeight: "bold",
  },
  loginLink: {
    alignItems: "center",
    marginTop: 20,
  },
  loginLinkText: {
    color: "blue",
  },
  errorMessage: {
    color: "red",
    marginTop: 20,
  },
});
