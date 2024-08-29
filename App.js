import React from 'react'
import { View, Text, StyleSheet, Dimensions } from 'react-native'
import RoootNavigator from './src/navigations/RootNavigator';
import { OriginContextProvider,DestinationContextProvider } from './src/contexts/contexts';
import Geolocation from 'react-native-geolocation-service';

//navigator.geolocation = Geolocation;
navigator.geolocation = require('react-native-geolocation-service');
const App = () => {
  return (
    <DestinationContextProvider>
    <OriginContextProvider>
        <RoootNavigator />
    </OriginContextProvider>
   </DestinationContextProvider>
    
  );
};


export default App

const styles = StyleSheet.create({

container:{
  flex:1
}


})
