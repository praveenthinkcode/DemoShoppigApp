import React, { Component } from 'react';
import {   Button, View, Text,StyleSheet } from 'react-native';
import { TouchableOpacity } from 'react-native-gesture-handler';


export default class Aboutscreen extends Component {
  

  render() {
    return (
      <View style={styles.header}>
        <Text style={styles.brandname}>ShoppingCart</Text>
        
    
      </View>
    )
  }
}
const styles=StyleSheet.create({
    header:{
        width:'100%',
        height:'100%',
        flexDirection:'row',
        
    },
    brandname:{
        fontSize:25,
        fontFamily:'Teko_bold'
        
    }
})
