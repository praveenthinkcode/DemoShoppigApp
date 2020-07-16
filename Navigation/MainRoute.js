import React, { Component } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import 'react-native-gesture-handler'
import DrawerRoute from "./DrawerRoute.js";
import SplashScreen from "../Screens/SplashScreen.js";
import Login from "../Screens/Login.js";
import Signup from "../Screens/Signup.js";
import Verify from "../Screens/Verify.js";
import SetPassword from "../Screens/SetPassword.js"; 
import GiftedChat from "../Screens/GiftedChat.js";
import OrderDetails from "../Screens/orderDetails.js";
const Stack=createStackNavigator();

export default class stac extends Component {
    render(){
  return (
      <NavigationContainer>
      <Stack.Navigator screenOptions={{ animationEnabled: false }}>
      <Stack.Screen name="SplashScreen" component={SplashScreen} options={{header:()=>{null}}}/>
      <Stack.Screen name="Login" component={Login} options={{header:()=>{null}}}/>
      <Stack.Screen name="Signup" component={Signup} options={{header:()=>{null}}}/>
      <Stack.Screen name="Verify" component={Verify} />
      <Stack.Screen name="SetPassword" component={SetPassword} />
      <Stack.Screen name="Chat" component={GiftedChat} />
      <Stack.Screen name="orderDetails" component={OrderDetails} />
      <Stack.Screen options={{header:()=>{null}}} name="DrawerRoute" component={DrawerRoute} />
    </Stack.Navigator>
    </NavigationContainer>
  )
    }
}