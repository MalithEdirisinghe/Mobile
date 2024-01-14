import React, { useEffect } from "react";
import { Image } from "react-native";
import { NavigationContainer } from "@react-navigation/native";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { createStackNavigator } from "@react-navigation/stack";
import MapScreen from "./MapScreen";
import SignupScreen from "./SignupScreens";
import LoginScreen from "./LoginScreen";
import NotificationScreen from "./NotificationScreen";
import HomeScreen from "./HomeScreen";
import SplashScreen from "./SplashScreen";
import UpdateProfileScreen from "./UpdateProfileScreen";
import NotifyScreen from "./notify";

const Tab = createBottomTabNavigator();
const Stack = createStackNavigator();

const App = () => {
  const HomeTabNavigator = () => (
    <Tab.Navigator>
      <Tab.Screen
        name="Home"
        component={HomeScreen}
        options={() => ({
          tabBarIcon: () => (
            <Image
              source={require("./assets/VectorHome.png")}
              style={{ width: 24, height: 24 }}
            />
          ),
          headerShown: false,
          headerLeft: null, // Remove the back button
        })}
      />
      <Tab.Screen
        name="Report"
        component={MapScreen}
        options={() => ({
          tabBarIcon: () => (
            <Image
              source={require("./assets/VectorMap.png")}
              style={{ width: 24, height: 24 }}
            />
          ),
          headerShown: false,
          headerLeft: null, // Remove the back button
        })}
      />
      <Tab.Screen
        name="Notification"
        component={NotificationScreen}
        options={() => ({
          tabBarIcon: () => (
            <Image
              source={require("./assets/VectorNotification.png")}
              style={{ width: 24, height: 24 }}
            />
          ),
          headerShown: false,
          headerLeft: null, // Remove the back button
        })}
      />
      <Tab.Screen
        name="Profile"
        component={UpdateProfileScreen}
        options={() => ({
          tabBarIcon: () => (
            <Image
              source={require("./assets/profile.png")}
              style={{ width: 24, height: 24 }}
            />
          ),
          headerShown: false,
          headerLeft: null, // Remove the back button
        })}
      />
    </Tab.Navigator>
  );

  return (
    <NavigationContainer>
      <Stack.Navigator>
        <Stack.Screen
          name="Splash"
          component={SplashScreen}
          options={() => ({
            headerShown: false,
            headerLeft: null, // Remove the back button
          })}
        />
        <Stack.Screen
          name="Signup"
          component={SignupScreen}
          options={() => ({
            headerShown: false,
            headerLeft: null, // Remove the back button
          })}
        />
        {/* <Stack.Screen name="Profile" component={ProfileScreen}
          options={() => ({
            headerShown: false,
            headerLeft: null, // Remove the back button
          })} /> */}
        <Stack.Screen
          name="Login"
          component={LoginScreen}
          options={() => ({
            headerShown: false,
            headerLeft: null, // Remove the back button
          })}
        />
        <Stack.Screen
          name="Homes"
          component={HomeTabNavigator}
          options={() => ({
            headerShown: false,
            headerLeft: null, // Remove the back button
          })}
        />
      </Stack.Navigator>
    </NavigationContainer>
  );
};

export default App;
