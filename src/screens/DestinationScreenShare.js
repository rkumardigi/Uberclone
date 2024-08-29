import React, { useRef, useContext, useState } from 'react';
import { StyleSheet, Text, View, Dimensions, TouchableOpacity } from 'react-native';
import { GooglePlacesAutocomplete } from 'react-native-google-places-autocomplete';
import { Avatar, Icon } from 'react-native-elements';
import { colors, parameters } from '../global/styles';
import { GOOGLE_MAPS_APIKEY } from "@env";
import { OriginContext, DestinationContext } from '../contexts/contexts';

const SCREEN_HEIGHT = Dimensions.get('window').height;
const SCREEN_WIDTH = Dimensions.get('window').width;

const DestinationScreenShare = ({ navigation }) => {
  const originContext = useContext(OriginContext);
  const destinationContext = useContext(DestinationContext);

  const dispatchOrigin = originContext?.dispatchOrigin;
  const dispatchDestination = destinationContext?.dispatchDestination;

  const textInput1 = useRef(4);
  const textInput2 = useRef(5);

  const [destination, setDestination] = useState(false);

  const handleOriginPress = (data, details = null) => {
    if (dispatchOrigin) {
      dispatchOrigin({
        type: "ADD_ORIGIN",
        payload: {
          latitude: details.geometry.location.lat,
          longitude: details.geometry.location.lng,
          address: details.formatted_address,
          name: details.name
        }
      });
      setDestination(true);
    }
  };

  const handleDestinationPress = (data, details = null) => {
    if (dispatchDestination) {
      dispatchDestination({
        type: "ADD_DESTINATION",
        payload: {
          latitude: details.geometry.location.lat,
          longitude: details.geometry.location.lng,
          address: details.formatted_address,
          name: details.name
        }
      });
      navigation.navigate("RequestScreenShare", { state: 0 });
    }
  };

  return (
    <>
      <View style={styles.view2}>
        <View style={styles.view1}>
          <Icon
            type="material-community"
            name="arrow-left"
            color={colors.grey1}
            size={32}
            onPress={() => navigation.goBack()}
          />
        </View>
        <TouchableOpacity>
          <View style={{ top: 25, alignItems: "center" }}>
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
                color={colors.grey1}
                size={26}
              />
            </View>
          </View>
        </TouchableOpacity>
      </View>

      {!destination && (
        <GooglePlacesAutocomplete
          nearbyPlacesAPI='GooglePlacesSearch'
          placeholder="From..."
          listViewDisplayed="auto"
          debounce={400}
          currentLocation={true}
          ref={textInput1}
          minLength={2}
          enablePoweredByContainer={false}
          fetchDetails={true}
          autoFocus={true}
          styles={autoComplete}
          query={{
            key: GOOGLE_MAPS_APIKEY,
            language: "en"
          }}
          onPress={handleOriginPress}
        />
      )}
      {destination && (
        <GooglePlacesAutocomplete
          nearbyPlacesAPI='GooglePlacesSearch'
          placeholder="Going to..."
          listViewDisplayed="auto"
          debounce={400}
          currentLocation={true}
          ref={textInput2}
          minLength={2}
          enablePoweredByContainer={false}
          fetchDetails={true}
          autoFocus={true}
          styles={autoComplete}
          query={{
            key: GOOGLE_MAPS_APIKEY,
            language: "en"
          }}
          onPress={handleDestinationPress}
        />
      )}
    </>
  );
};

const autoComplete = {
  textInput: {
    backgroundColor: colors.grey6,
    height: 50,
    borderRadius: 5,
    paddingVertical: 5,
    paddingHorizontal: 10,
    fontSize: 15,
    flex: 1
  },
  container: {
    paddingTop: 20,
    flex: 1,
    backgroundColor: colors.white
  }
};

const styles = StyleSheet.create({
  view2: {
    backgroundColor: colors.white,
    zIndex: 1,
    paddingBottom: 10,
  },
  view1: {
    position: 'absolute',
    top: 10,
    left: 12,
    backgroundColor: colors.white,
    height: 40,
    width: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 2,
    zIndex: 8,
  },
  view3: {
    flexDirection: 'row',
    alignItems: 'center',
  },
});

export default DestinationScreenShare;
