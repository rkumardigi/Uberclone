import React, { Component } from 'react';
import { StyleSheet, View, Image, Platform, PermissionsAndroid, Text } from 'react-native';
import MapView, { Marker, PROVIDER_GOOGLE } from 'react-native-maps';
import MapViewDirections from 'react-native-maps-directions';
import Geolocation from 'react-native-geolocation-service';
import { colors } from '../global/styles';
import { GOOGLE_MAPS_APIKEY } from "@env";
import haversine from 'haversine'; // Add this dependency

navigator.geolocation = require('react-native-geolocation-service');

const vehicles = [
    { id: 1, type: 'RideShare', location: { latitude: -18.1374878, longitude: 178.4265123 }, arrivalTime: '5 min' },
    { id: 2, type: 'RideShare', location: { latitude: -18.1356878, longitude: 178.4267123 }, arrivalTime: '8 min' },
    { id: 3, type: 'RideShare', location: { latitude: -18.1343878, longitude: 178.4274123 }, arrivalTime: '10 min' },
    // Add more vehicles here
];

export default class MapComponentShare extends Component {
    constructor(props) {
        super(props);
        this.state = {
            initialRegion: {
                latitude: -18.1373878,
                longitude: 178.4264123,
                latitudeDelta: 0.0922,
                longitudeDelta: 0.0421,
            },
            routePrice: null,
            filteredVehicles: [],
        };
        this._map = React.createRef();
        this.intervalId = null;
    }

    componentDidMount() {
        this.checkPermission();
        this.updateVehicles();
        this.intervalId = setInterval(this.updateVehicles, 30000); // Refresh every 30 seconds
    }

    componentWillUnmount() {
        if (this.intervalId) {
            clearInterval(this.intervalId);
        }
    }

    checkPermission = async () => {
        if (Platform.OS === 'ios') {
            this.getLocation();
        } else {
            const granted = await PermissionsAndroid.request(
                PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION,
            );
            if (granted === PermissionsAndroid.RESULTS.GRANTED) {
                this.getLocation();
            } else {
                console.log("Permission Denied");
            }
        }
    };

    getLocation = () => {
        Geolocation.getCurrentPosition(
            (position) => {
                const region = {
                    latitude: position.coords.latitude,
                    longitude: position.coords.longitude,
                    latitudeDelta: 0.0922,
                    longitudeDelta: 0.0421,
                };
                this.setState({ initialRegion: region });
            },
            (error) => console.log(error),
            { enableHighAccuracy: true, timeout: 20000, maximumAge: 1000 }
        );
    };

    calculateDistance = (coord1, coord2) => {
        return haversine(coord1, coord2, { unit: 'km' });
    };

    updateVehicles = () => {
        const { userOrigin, userDestination } = this.props;
        const { initialRegion } = this.state;

        if (userOrigin && userDestination) {
            const filtered = vehicles.filter(vehicle => {
                const distanceFromOrigin = this.calculateDistance(vehicle.location, userOrigin);
                const distanceFromDestination = this.calculateDistance(vehicle.location, userDestination);
                return distanceFromOrigin <= 20 || distanceFromDestination <= 20;
            });

            this.setState({ filteredVehicles: filtered });
        }
    };

    fitMapToMarkers = () => {
        const { userOrigin, userDestination } = this.props;
        if (userOrigin && userDestination && this._map.current) {
            this._map.current.fitToCoordinates(
                [userOrigin, userDestination],
                {
                    edgePadding: { top: 450, right: 50, left: 50, bottom: 350 },
                    animated: true
                }
            );
        }
    };

    calculateRoutePrice = (distance) => {
        // Sample pricing logic: $0.15 per km
        const pricePerKm = 0.15;
        return (distance * pricePerKm).toFixed(2);
    };

    renderVehicles = () => {
        return this.state.filteredVehicles.map((vehicle) => (
            <Marker 
                key={vehicle.id}
                coordinate={vehicle.location}
                title={vehicle.type}
                description={`Arrival in ${vehicle.arrivalTime}`}
            >
                <Image
                    source={require('../../assets/uberBlack.png')} // Replace with your vehicle icon
                    style={styles.vehicleMarker}
                    resizeMode="contain"
                />
            </Marker>
        ));
    };

    render() {
        const { userOrigin, userDestination } = this.props;

        return (
            <View style={styles.container}>
                <MapView
                    provider={PROVIDER_GOOGLE}
                    style={styles.map}
                    ref={this._map}
                    initialRegion={this.state.initialRegion}
                >
                    {/* User's current location */}
                    {userOrigin && (
                        <Marker coordinate={userOrigin} anchor={{ x: 0.5, y: 0.5 }}>
                            <Image 
                                source={require('../../assets/location.png')}
                                style={styles.markerOrigin2}
                                resizeMode="cover"
                            />
                        </Marker>
                    )}

                    {/* User's destination */}
                    {userDestination && (
                        <Marker coordinate={userDestination} anchor={{ x: 0.5, y: 0.5 }}>
                            <Image 
                                source={require('../../assets/location.png')}
                                style={styles.markerDestination}
                                resizeMode="cover"
                            />
                        </Marker>
                    )}

                    {/* Directions between origin and destination */}
                    {userOrigin && userDestination && (
                        <MapViewDirections 
                            origin={userOrigin}
                            destination={userDestination}
                            apikey={GOOGLE_MAPS_APIKEY}
                            strokeWidth={4}
                            strokeColor={colors.black}
                            onReady={result => {
                                const routePrice = this.calculateRoutePrice(result.distance);
                                this.setState({ routePrice });
                            }}
                            onError={(errorMessage) => {
                                console.log('GMaps Directions Error:', errorMessage);
                            }}
                        />
                    )}

                    {/* Display nearby vehicles */}
                    {this.renderVehicles()}
                </MapView> 

                {/* Show route price */}
                {this.state.routePrice && (
                    <View style={styles.priceContainer}>
                        <Text style={styles.priceText}>RideShare Price: ${this.state.routePrice}</Text>
                    </View>
                )}
            </View>
        );
    }
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    map: {
        height: "100%",
        width: "100%",
    },
    markerOrigin2: {
        width: 20,
        height: 20,
        borderRadius: 10,
    },
    markerDestination: {
        width: 16,
        height: 16,
    },
    vehicleMarker: {
        width: 32,
        height: 32,
    },
    priceContainer: {
        position: 'absolute',
        bottom: 50,
        left: 0,
        right: 0,
        alignItems: 'center',
        backgroundColor: 'rgba(0,0,0,0.5)',
        padding: 10,
        borderRadius: 5,
    },
    priceText: {
        color: 'white',
        fontSize: 18,
        fontWeight: 'bold',
    },
});
