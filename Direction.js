import React, { useState, useEffect, useRef } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Linking,
  TextInput,
  Button,
} from "react-native";
import MapView, { Marker, Polyline } from "react-native-maps";
import * as Location from "expo-location";
import { GooglePlacesAutocomplete } from "react-native-google-places-autocomplete";
import axios from "axios";
import MapViewDirections from "react-native-maps-directions";

const MapScreen = () => {
  const [destination, setDestination] = useState(null);
  const [location, setLocation] = useState(null);
  const [citySearch, setCitySearch] = useState("");
  const [directions, setDirections] = useState([]);
  const mapViewRef = useRef(null);

  useEffect(() => {
    (async () => {
      let { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== "granted") {
        console.error("Location permission denied");
        return;
      }

      try {
        let location = await Location.getCurrentPositionAsync({});
        console.log("Location:", location);
        setLocation(location.coords);
      } catch (error) {
        console.error("Error getting location:", error);
      }
    })();
  }, []);

  const handleCitySearch = async () => {
    const geocodingApiKey = "AIzaSyDv2lvUngY043tE-qf7S1H2d8C9eA8FmPs";

    try {
      const geocodingUrl = `https://maps.googleapis.com/maps/api/geocode/json?address=${encodeURIComponent(
        citySearch
      )}&key=${geocodingApiKey}`;
      const response = await axios.get(geocodingUrl);

      if (response.data.results && response.data.results.length > 0) {
        const result = response.data.results[0];
        const coords = result.geometry.location;

        setDestination(result);
        setLocation(coords);

        const newRegion = {
          latitude: coords.lat,
          longitude: coords.lng,
          latitudeDelta: 0.0922,
          longitudeDelta: 0.0421,
        };
        mapViewRef.current.animateToRegion(newRegion);
      } else {
        console.log("City not found. Geocoding API response:", response.data);
      }
    } catch (error) {
      console.error("Error searching city:", error);
    }
  };

  const shareLocation = () => {
    if (location) {
      const locationUrl = `https://maps.google.com/maps?q=${location.latitude},${location.longitude}`;
      const whatsappMessage = `Check out my location: ${locationUrl}`;
      const whatsappUrl = `whatsapp://send?text=${encodeURIComponent(
        whatsappMessage
      )}`;

      Linking.openURL(whatsappUrl).catch((err) => {
        console.error("Error opening WhatsApp:", err);
      });
    } else {
      console.log("Location not available yet.");
    }
  };

  return (
    <View style={styles.container}>
      <TextInput
        style={styles.input}
        placeholder="Enter City Name"
        onChangeText={(text) => setCitySearch(text)}
        value={citySearch}
      />
      <Button title="Search" onPress={handleCitySearch} />

      {location ? (
        <MapView
          ref={mapViewRef}
          style={styles.map}
          initialRegion={{
            latitude: location.latitude,
            longitude: location.longitude,
            latitudeDelta: 0.0922,
            longitudeDelta: 0.0421,
          }}
        >
          <Marker
            coordinate={{
              latitude: location.latitude,
              longitude: location.longitude,
            }}
            title="Your Location"
          />
          {destination && (
            <Marker
              coordinate={{
                latitude: destination.geometry.location.lat,
                longitude: destination.geometry.location.lng,
              }}
              title={destination.formatted_address}
            />
          )}
          {directions.length > 0 && (
            <Polyline
              coordinates={directions}
              strokeWidth={4} // Set the same as MapViewDirections
              strokeColor="#C34A36" // Set the same as MapViewDirections
            />
          )}
          {destination && (
            <MapViewDirections
              origin={{
                latitude: location.latitude,
                longitude: location.longitude,
              }}
              destination={{
                latitude: destination.geometry.location.lat,
                longitude: destination.geometry.location.lng,
              }}
              apikey={"AIzaSyDv2lvUngY043tE-qf7S1H2d8C9eA8FmPs"}
              strokeWidth={4}
              strokeColor="#C34A36"
              onError={(error) => {
                console.error("MapViewDirections Error:", error);
              }}
              onReady={(result) => {
                setDirections(result.coordinates);
              }}
            />
          )}
        </MapView>
      ) : (
        <Text>Loading...</Text>
      )}

      <TouchableOpacity onPress={shareLocation} style={styles.shareButton}>
        <Text style={styles.shareButtonText}>Get Directions via WhatsApp</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    backgroundColor: "#f5f5f5",
  },
  map: {
    flex: 1,
    marginTop: 16,
  },
  shareButton: {
    backgroundColor: "blue",
    padding: 16,
    alignItems: "center",
    marginVertical: 16,
  },
  shareButtonText: {
    color: "white",
    fontWeight: "bold",
    fontSize: 16,
  },
  input: {
    height: 40,
    borderColor: "gray",
    borderWidth: 1,
    marginBottom: 8,
    paddingHorizontal: 8,
  },
});

export default MapScreen;

// import React, { useState, useEffect, useRef } from 'react';
// import { View, Text, StyleSheet, TouchableOpacity, Linking, TextInput, Button } from 'react-native';
// import MapView, { Marker, Polyline } from 'react-native-maps';
// import * as Location from 'expo-location';
// import { GooglePlacesAutocomplete } from 'react-native-google-places-autocomplete';
// import axios from 'axios';
// import MapViewDirections from 'react-native-maps-directions';
// import haversine from 'haversine';

// const MapScreen = () => {
//     const [destination, setDestination] = useState(null);
//     const [location, setLocation] = useState(null);
//     const [citySearch, setCitySearch] = useState('');
//     const [distance, setDistance] = useState(null);
//     const [directions, setDirections] = useState([]);
//     const [selectedRouteIndex, setSelectedRouteIndex] = useState(0);
//     const mapViewRef = useRef(null);

//     useEffect(() => {
//         (async () => {
//             let { status } = await Location.requestForegroundPermissionsAsync();
//             if (status !== 'granted') {
//                 console.error('Location permission denied');
//                 return;
//             }

//             try {
//                 let location = await Location.getCurrentPositionAsync({});
//                 console.log('Location:', location);
//                 setLocation(location.coords);
//             } catch (error) {
//                 console.error('Error getting location:', error);
//             }
//         })();
//     }, []);

//     const handleCitySearch = async () => {
//         const geocodingApiKey = 'YOUR_GOOGLE_GEOCODING_API_KEY';

//         try {
//             const geocodingUrl = `https://maps.googleapis.com/maps/api/geocode/json?address=${encodeURIComponent(citySearch)}&key=${geocodingApiKey}`;
//             const response = await axios.get(geocodingUrl);

//             if (response.data.results && response.data.results.length > 0) {
//                 const result = response.data.results[0];
//                 const coords = result.geometry.location;

//                 setDestination(result);
//                 setLocation(coords);

//                 const userLocation = { latitude: location.latitude, longitude: location.longitude };
//                 const cityLocation = { latitude: coords.lat, longitude: coords.lng };
//                 const calculatedDistance = haversine(userLocation, cityLocation, { unit: 'km' });
//                 setDistance(calculatedDistance);

//                 const newRegion = {
//                     latitude: coords.lat,
//                     longitude: coords.lng,
//                     latitudeDelta: 0.0922,
//                     longitudeDelta: 0.0421,
//                 };
//                 mapViewRef.current.animateToRegion(newRegion);
//             } else {
//                 console.log('City not found. Geocoding API response:', response.data);
//             }
//         } catch (error) {
//             console.error('Error searching city:', error);
//         }
//     };

//     const shareLocation = () => {
//         if (location) {
//             const locationUrl = `https://maps.google.com/maps?q=${location.latitude},${location.longitude}`;
//             const whatsappMessage = `Check out my location: ${locationUrl}`;
//             const whatsappUrl = `whatsapp://send?text=${encodeURIComponent(whatsappMessage)}`;

//             Linking.openURL(whatsappUrl).catch((err) => {
//                 console.error('Error opening WhatsApp:', err);
//             });
//         } else {
//             console.log('Location not available yet.');
//         }
//     };

//     return (
//         <View style={styles.container}>
//             <TextInput
//                 style={styles.input}
//                 placeholder="Enter City Name"
//                 onChangeText={(text) => setCitySearch(text)}
//                 value={citySearch}
//             />
//             <Button title="Search" onPress={handleCitySearch} />

//             {location ? (
//                 <MapView
//                     ref={mapViewRef}
//                     style={styles.map}
//                     initialRegion={{
//                         latitude: location.latitude,
//                         longitude: location.longitude,
//                         latitudeDelta: 0.0922,
//                         longitudeDelta: 0.0421,
//                     }}
//                 >
//                     <Marker
//                         coordinate={{
//                             latitude: location.latitude,
//                             longitude: location.longitude,
//                         }}
//                         title="Your Location"
//                     />
//                     {destination && (
//                         <Marker
//                             coordinate={{
//                                 latitude: destination.geometry.location.lat,
//                                 longitude: destination.geometry.location.lng,
//                             }}
//                             title={destination.formatted_address}
//                         />
//                     )}
//                     {directions.length > 0 && (
//                         <View>
//                             <Text>Select Route:</Text>
//                             {directions.map((route, index) => (
//                                 <TouchableOpacity
//                                     key={index}
//                                     onPress={() => setSelectedRouteIndex(index)}
//                                     style={{
//                                         backgroundColor: selectedRouteIndex === index ? 'blue' : 'gray',
//                                         padding: 8,
//                                         borderRadius: 4,
//                                         marginVertical: 4,
//                                     }}
//                                 >
//                                     <Text style={{ color: 'white', fontWeight: 'bold' }}>
//                                         Route {index + 1}
//                                     </Text>
//                                 </TouchableOpacity>
//                             ))}
//                         </View>
//                     )}
//                     {directions.length > 0 && (
//                         <Polyline
//                             coordinates={directions[selectedRouteIndex]}
//                             strokeWidth={4}
//                             strokeColor="#C34A36"
//                         />
//                     )}
//                 </MapView>
//             ) : (
//                 <Text>Loading...</Text>
//             )}

//             <Text>{distance ? `Distance: ${distance.toFixed(2)} km` : ''}</Text>

//             <TouchableOpacity onPress={shareLocation} style={styles.shareButton}>
//                 <Text style={styles.shareButtonText}>Get Directions via WhatsApp</Text>
//             </TouchableOpacity>
//         </View>
//     );
// };

// const styles = StyleSheet.create({
//     container: {
//         flex: 1,
//         padding: 16,
//         backgroundColor: '#f5f5f5',
//     },
//     map: {
//         flex: 1,
//         marginTop: 16,
//     },
//     shareButton: {
//         backgroundColor: 'blue',
//         padding: 16,
//         alignItems: 'center',
//         marginVertical: 16,
//     },
//     shareButtonText: {
//         color: 'white',
//         fontWeight: 'bold',
//         fontSize: 16,
//     },
//     input: {
//         height: 40,
//         borderColor: 'gray',
//         borderWidth: 1,
//         marginBottom: 8,
//         paddingHorizontal: 8,
//     },
// });

// export default MapScreen;
