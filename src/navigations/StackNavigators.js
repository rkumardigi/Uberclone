import * as React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import HomeScreen from '../screens/HomeScreen'
import RequestScreen from '../screens/RequestScreen';
import RequestScreenShare from '../screens/RequestScreenShare';
import DestinationScreen from '../screens/DestinationScreen';
import DestinationScreenShare from '../screens/DestinationScreenShare';

const Home = createNativeStackNavigator();
export function HomeStack(){
return (
    <Home.Navigator>
       <Home.Screen 
                name ="HomeScreen"
                component = {HomeScreen}
                options ={{headerShown:false}}
            />
        <Home.Screen 
                name ="RequestScreen"
                component = {RequestScreen}
                options ={{headerShown:false}}
            />
        <Home.Screen 
                name ="DestinationScreen"
                component = {DestinationScreen}
                options ={{headerShown:false}}
            />
             <Home.Screen 
                name ="DestinationScreenShare"
                component = {DestinationScreenShare}
                options ={{headerShown:false}}
            />
             <Home.Screen 
                name ="RequestScreenShare"
                component = {RequestScreenShare}
                options ={{headerShown:false}}
            />
    </Home.Navigator>
)

}