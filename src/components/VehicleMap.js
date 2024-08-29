import React, { Component } from 'react';
import { StyleSheet, View, Image, Text, FlatList } from 'react-native';
import MapView, { Marker, PROVIDER_GOOGLE } from 'react-native-maps';
import MapViewDirections from 'react-native-maps-directions';
import { colors } from '../global/styles';
import { GOOGLE_MAPS_APIKEY } from "@env";

export default class VehicleMap extends Component {
    constructor(props) {
        super(props);
        this.state = {
            userLocation: {
                latitude: -18.1373878, // Replace with actual user location
                longitude: 178.4264123, // Replace with actual user location
            },
            vehicles: [],
            earliestVehicle: null,
        };
    }

    componentDidMount() {
        this.generateRandomVehicleLocations();
    }

    // Generate random vehicle locations near the user
    generateRandomVehicleLocations = () => {
        const { userLocation } = this.state;

        // Number of vehicles to simulate
        const numVehicles = 5;

        // Generate random vehicles around the user's location
        let vehicles = [];
        for (let i = 0; i < numVehicles; i++) {
            const vehicleType = this.getVehicleType(i); // Get vehicle type
            vehicles.push({
                id: (i + 1).toString(),
                origin: this.getRandomLocation(userLocation),
                type: vehicleType,
                eta: null
            });
        }

        this.setState({ vehicles }, () => {
            this.calculateETAForAllVehicles();
        });
    };

    // Get random location near the user's location
    getRandomLocation = (userLocation) => {
        const latOffset = (Math.random() - 0.5) * 0.01; // +/- 0.005 degrees
        const lonOffset = (Math.random() - 0.5) * 0.01; // +/- 0.005 degrees

        return {
            latitude: userLocation.latitude + latOffset,
            longitude: userLocation.longitude + lonOffset,
        };
    };

    // Get vehicle type based on index
    getVehicleType = (index) => {
        const types = ['Taxi', 'Ride-share', 'Volunteer', 'Scheduled Pickup'];
        return types[index % types.length]; // Cycle through the types
    };

    // Calculate ETA for all vehicles using the user's location as the destination
    calculateETAForAllVehicles = () => {
        const { vehicles, userLocation } = this.state;
        let vehicleETAList = [];

        vehicles.forEach((vehicle, index) => {
            this.calculateETA(vehicle.origin, userLocation)
                .then(eta => {
                    vehicles[index].eta = eta;
                    vehicleETAList.push(vehicles[index]);

                    // When all vehicle ETA calculations are complete, update the state
                    if (vehicleETAList.length === vehicles.length) {
                        this.setState({
                            vehicles: vehicleETAList,
                            earliestVehicle: this.getEarliestVehicle(vehicleETAList),
                        });
                    }
                });
        });
    };

    calculateETA = (origin, destination) => {
        return new Promise((resolve, reject) => {
            // Use MapViewDirections to calculate the ETA between origin and destination
            <MapViewDirections
                origin={origin}
                destination={destination}
                apikey={GOOGLE_MAPS_APIKEY}
                mode="DRIVING"
                onReady={result => {
                    const eta = result.duration; // Duration in minutes
                    resolve(eta);
                }}
                onError={(errorMessage) => {
                    console.log('GMaps Directions Error:', errorMessage);
                    reject(errorMessage);
                }}
            />
        });
    };

    getEarliestVehicle = (vehicles) => {
        return vehicles.reduce((earliest, vehicle) => {
            return (earliest == null || vehicle.eta < earliest.eta) ? vehicle : earliest;
        }, null);
    };

    renderVehicleETA = ({ item }) => {
        return (
            <View style={styles.vehicleContainer}>
                <Text style={styles.vehicleText}>{item.type}</Text>
                <Text style={styles.vehicleEtaText}>ETA: {item.eta ? item.eta.toFixed(2) : 'Calculating...'} mins</Text>
            </View>
        );
    };

    render() {
        const { userLocation, vehicles, earliestVehicle } = this.state;

        return (
            <View style={styles.container}>
                <MapView
                    provider={PROVIDER_GOOGLE}
                    style={styles.map}
                    region={{
                        latitude: userLocation.latitude,
                        longitude: userLocation.longitude,
                        latitudeDelta: 0.015,
                        longitudeDelta: 0.0121,
                    }}
                >
                    <Marker coordinate={userLocation}>
                        <Image 
                            source={require('../../assets/user-location.png')}
                            style={styles.userMarker}
                        />
                    </Marker>

                    {vehicles.map((vehicle) => (
                        <Marker key={vehicle.id} coordinate={vehicle.origin}>
                            <Image 
                                source={require('../../assets/vehicle.png')}
                                style={styles.vehicleMarker}
                            />
                        </Marker>
                    ))}
                </MapView>

                <FlatList
                    data={vehicles}
                    keyExtractor={item => item.id}
                    renderItem={this.renderVehicleETA}
                    style={styles.vehicleList}
                />

                {earliestVehicle && (
                    <View style={styles.earliestVehicleContainer}>
                        <Text style={styles.earliestVehicleText}>
                            Earliest Pickup: {earliestVehicle.type} (ETA: {earliestVehicle.eta.toFixed(2)} mins)
                        </Text>
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
        flex: 1,
    },
    userMarker: {
        width: 30,
        height: 30,
    },
    vehicleMarker: {
        width: 20,
        height: 20,
    },
    vehicleList: {
        position: 'absolute',
        bottom: 100,
        left: 0,
        right: 0,
    },
    vehicleContainer: {
        padding: 10,
        backgroundColor: 'rgba(255,255,255,0.8)',
        borderRadius: 5,
        marginBottom: 5,
    },
    vehicleText: {
        fontSize: 16,
        fontWeight: 'bold',
    },
    vehicleEtaText: {
        fontSize: 14,
        color: 'gray',
    },
    earliestVehicleContainer: {
        position: 'absolute',
        bottom: 50,
        left: 0,
        right: 0,
        alignItems: 'center',
        backgroundColor: 'rgba(0,0,0,0.5)',
        padding: 10,
        borderRadius: 5,
    },
    earliestVehicleText: {
        color: 'white',
        fontSize: 18,
        fontWeight: 'bold',
    },
});
