import React, { Component } from 'react';
import { StyleSheet, View, Image, Platform, PermissionsAndroid, Text, Button, Alert } from 'react-native';
import MapView, { Marker, PROVIDER_GOOGLE } from 'react-native-maps';
import MapViewDirections from 'react-native-maps-directions';
import Geolocation from 'react-native-geolocation-service';
import { StripeProvider, useStripe } from '@stripe/stripe-react-native';
import { colors } from '../global/styles';
import { GOOGLE_MAPS_APIKEY, STRIPE_PUBLISHABLE_KEY } from "@env";

navigator.geolocation = require('react-native-geolocation-service');

export default class MapComponent extends Component {
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
        };
        this._map = React.createRef();
    }

    componentDidMount() {
        this.checkPermission();
    }

    componentDidUpdate(prevProps) {
        if (this.props.userDestination !== prevProps.userDestination) {
            this.fitMapToMarkers();
        }
    }

    checkPermission = async () => {
        if (Platform.OS === 'ios') {
            this.getLocation();
        } else {
            const granted = await PermissionsAndroid.request(
                PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION,
                {
                    title: "Location Access Required",
                    message: "This App needs to Access your location"
                }
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
        // Sample pricing logic: $1 per km
        const pricePerKm = 1.0;
        return (distance * pricePerKm).toFixed(2);
    }

    handlePayment = async () => {
        const { confirmPayment } = useStripe();
        const clientSecret = await this.createPaymentIntent();

        if (clientSecret) {
            const { error, paymentIntent } = await confirmPayment(clientSecret, {
                type: 'Card',
            });

            if (error) {
                Alert.alert(`Payment failed: ${error.message}`);
            } else if (paymentIntent) {
                Alert.alert('Payment succeeded!');
            }
        }
    }

    createPaymentIntent = async () => {
        try {
            const response = await fetch('YOUR_BACKEND_ENDPOINT/create-payment-intent', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    amount: Math.round(this.state.routePrice * 100), // Stripe expects the amount in cents
                }),
            });

            const { clientSecret } = await response.json();
            return clientSecret;
        } catch (error) {
            console.error("Error creating payment intent:", error);
            return null;
        }
    }

    render() {
        const { userOrigin, userDestination } = this.props;

        return (
            <StripeProvider publishableKey={STRIPE_PUBLISHABLE_KEY}>
                <View style={styles.container}>
                    <MapView
                        provider={PROVIDER_GOOGLE}
                        style={styles.map}
                        ref={this._map}
                        initialRegion={this.state.initialRegion}
                    >
                        {userOrigin && (
                            <Marker coordinate={userOrigin} anchor={{ x: 0.5, y: 0.5 }}>
                                <Image 
                                    source={require('../../assets/location.png')}
                                    style={styles.markerOrigin2}
                                    resizeMode="cover"
                                />
                            </Marker>
                        )}
                        {userDestination && (
                            <Marker coordinate={userDestination} anchor={{ x: 0.5, y: 0.5 }}>
                                <Image 
                                    source={require('../../assets/location.png')}
                                    style={styles.markerDestination}
                                    resizeMode="cover"
                                />
                            </Marker>
                        )}
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
                    </MapView> 
                    {this.state.routePrice && (
                        <View style={styles.priceContainer}>
                            <Text style={styles.priceText}>Taxi Price: ${this.state.routePrice}</Text>
                            <Button title="Pay with Stripe" onPress={this.handlePayment} />
                        </View>
                    )}
                </View>
            </StripeProvider>
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
