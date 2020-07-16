import React, { Component } from 'react';
import { Button, View, Text,StyleSheet } from 'react-native';
import  EvilIcons  from 'react-native-vector-icons/EvilIcons';
import  Entypo  from 'react-native-vector-icons/Entypo';
import {Header} from 'react-native-elements'
import  MaterialIcons  from 'react-native-vector-icons/MaterialIcons';
import AsyncStorage from '@react-native-community/async-storage';
const GLOBAL = require('../Global');
export default class homeHeading extends Component {
  state={
    cartCount:0
  }
  async cartCount(){
  
    fetch(GLOBAL.BASE_URL+"cartitems/getCartitems/",{
      method:"POST",
      body:JSON.stringify({userid:await AsyncStorage.getItem('userid')}),
      })
      .then(res => res.json())
      .then(
      async(result) => {
        var count=0;
        if(result.status){
                result['data'].map((data)=>{
            count=count+1;
        })}
        else{
        }
        this.setState({cartCount:count});
      })  
  }

  left(){
    return(
       <View>
        <EvilIcons name="navicon" color='white' size={33}  onPress={()=>{this.props.navigation.toggleDrawer()}} style={{paddingBottom:20}}/></View>
    )
  }
  right(){
    return(
        <View style={{flexDirection:'row'}}>   
        <MaterialIcons name="favorite" color='white' size={25} onPress={()=>{this.props.navigation.navigate('Wishlist')}} style={{paddingBottom:15,paddingRight:20}}/>
        <Entypo name="shopping-cart" color='white' size={25} onPress={()=>{this.props.navigation.navigate('CartPage')}} style={{paddingBottom:15}}/>
        <Text style={{color:'white',top: -10, right: 13,fontSize:11}} onPress={()=>{this.props.navigation.navigate('CartPage')}}>{this.state.cartCount}</Text>
        </View>
    ) 
  }
  center(){
    return(
      <View>
        <Text style={{color: '#fff',fontSize:25,paddingBottom:20}} onPress={()=>this.props.navigation.navigate('ProductsPage')}>Shopping App</Text>
      </View>
    )
  }

  render() {
   
    this.cartCount();
    return (
      <Header
  placement="left"
  leftComponent={this.left()}
  centerComponent={this.center()}
  rightComponent={this.right()}
/>
      // <View style={styles.header}>
      //   <View style={{flexDirection:'row',paddingTop:15}}>
      //   <View>
      //   <EvilIcons name="navicon" size={30}  onPress={()=>{this.props.navigation.toggleDrawer()}} /></View>
      //   <View>
      //   <Text style={styles.brandname}>ShoppingCart</Text></View>
      //   <TouchableOpacity >
      //   <Entypo name="shopping-cart" onPress={()=>{this.props.navigation.navigate('CartPage')}} size={30} style={{paddingLeft:120}}  />
      //   </TouchableOpacity>
      //   </View>
      // </View>
    )
  }
}
const styles=StyleSheet.create({
    header:{
        
        height:'8%',
        backgroundColor:'#d3f4ff'
        
    },
    brandname:{
        fontSize:27,
        paddingLeft:10,
        fontWeight:'bold',
        fontFamily:'Teko-Bold'
      
    },
})
