import React, { useContext, useState, useEffect } from 'react';
import { StyleSheet, Text, View, Dimensions, Image, TouchableOpacity } from 'react-native';
import { colors, parameters } from '../global/styles';
import MapComponentShare from '../components/MapComponentShare';
import { Avatar, Icon } from 'react-native-elements';
import { color } from 'react-native-elements/dist/helpers';
import { OriginContext, DestinationContext } from '../contexts/contexts';
import { useRoute } from '@react-navigation/native';
import { Picker } from '@react-native-picker/picker';

const SCREEN_HEIGHT = Dimensions.get('window').height;
const SCREEN_WIDTH = Dimensions.get('window').width;

const PRICING = {
  taxi: {
    baseFare: 0.0,
    perKm: 0.0,
  },
  rideshare: {
    baseFare: 0.0,
    perKm: 0.0,
  },
  volunteer: {
    baseFare: 0.0,
    perKrm: 0.0,
  },
  reserve: {
    baseFare: 0.0,
    perKm: 0.0,
  },
};

export default function RequestScreenShare({ navigation }) {
  const route = useRoute();
  const { origin } = useContext(OriginContext);
  const { destination } = useContext(DestinationContext);

  const [userOrigin, setUserOrigin] = useState({
    latitude: origin?.latitude || 0,
    longitude: origin?.longitude || 0
  });

  const [userDestination, setUserDestination] = useState({
    latitude: destination?.latitude || 0,
    longitude: destination?.longitude || 0
  });

  const [selectedMode, setSelectedMode] = useState(route.params?.serviceType || 'taxi');
  const [price, setPrice] = useState(0);

  useEffect(() => {
    if (origin && destination) {
      setUserOrigin({
        latitude: origin.latitude,
        longitude: origin.longitude
      });
      setUserDestination({
        latitude: destination.latitude,
        longitude: destination.longitude
      });
    }
  }, [origin, destination]);

  useEffect(() => {
    if (route.params?.serviceType) {
      setSelectedMode(route.params.serviceType);
    }
  }, [route.params?.serviceType]);

  const calculatePrice = (distance) => {
    const pricing = PRICING[selectedMode.toLowerCase()] || PRICING['taxi']; // Default to taxi if mode not found
    return pricing.baseFare + pricing.perKm * distance;
  };

  const handleDirectionReady = (result) => {
    const distance = result.distance; // in kilometers
    const calculatedPrice = calculatePrice(distance);
    setPrice(calculatedPrice);
  };

  return (
    <View style={styles.container}>
      <View style={styles.view1}>
        <Icon 
          type="material-community" 
          name="arrow-left"
          color={color.grey1} 
          size={32}
          onPress={() => navigation.goBack()}
        />
      </View>
      <View style={styles.view2}>
        <TouchableOpacity>
          <View style={styles.view3}>
            <Avatar 
              rounded 
              avatarStyle={{}} 
              size={30}
              source={require('../../assets/blankProfilePic.jpg')}
            />
            <Text style={{ marginLeft: 5 }}>For Someone</Text>
            <Icon 
              type="material-community" 
              name="chevron-down"
              color={color.grey1} 
              size={26}
            />
          </View>
        </TouchableOpacity>
        <View style={styles.view4}>
          <View>
            <Image style={styles.image1} source={require("../../assets/transit.png")} />
          </View>
          <View>
            <TouchableOpacity onPress={() => navigation.navigate("DestinationScreenShare")}>
              <View style={styles.view6}>
                <Text style={styles.text1}>From Where?</Text>
              </View>
            </TouchableOpacity>
            <View style={styles.view7}>
              <TouchableOpacity>
                <View style={styles.view5}>
                  <Text style={styles.text10}>...</Text>
                </View>
              </TouchableOpacity>
              <View style={styles.view8}>
                <Icon 
                  type="material-community" 
                  name="plus-thick"
                  color={color.grey1} 
                  size={25}
                />
              </View>
            </View>
          </View>
        </View>
      </View>
      
      <MapComponentShare
        userOrigin={userOrigin}
        userDestination={userDestination}
        onDirectionReady={handleDirectionReady}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingTop: parameters.statusBarHeight
  },
  view1: {
    position: "absolute",
    top: 25,
    left: 12,
    backgroundColor: colors.white,
    height: 40,
    width: 40,
    borderRadius: 20,
    justifyContent: "center",
    alignItems: "center",
    marginTop: 2,
    zIndex: 8
  },
  view2: {
    height: SCREEN_HEIGHT * 0.21,
    alignItems: "center",
    zIndex: 5,
    backgroundColor: colors.white
  },
  view3: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 2,
    marginBottom: 10,
    backgroundColor: colors.white,
    zIndex: 10,
  },
  view4: {
    flexDirection: "row",
    alignItems: "center",
  },
  view5: {
    backgroundColor: colors.grey7,
    width: SCREEN_WIDTH * 0.70,
    height: 40,
    justifyContent: "center",
    marginTop: 10,
  },
  view6: {
    backgroundColor: colors.grey6,
    width: SCREEN_WIDTH * 0.70,
    height: 40,
    justifyContent: "center",
    marginTop: 10,
    paddingLeft: 0
  },
  text1: {
    marginLeft: 10,
    fontSize: 16,
    color: colors.grey1
  },
  image1: {
    height: 70,
    width: 30,
    marginRight: 10,
    marginTop: 10
  },
  view7: {
    flexDirection: "row",
    alignItems: "center"
  },
  view8: {
    marginLeft: 10
  },
  text10: {
    color: colors.grey2,
    paddingLeft: 10
  },
  priceContainer: {
    padding: 20,
    alignItems: 'center'
  },
});