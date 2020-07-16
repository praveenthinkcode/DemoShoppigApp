import { createDrawerNavigator } from '@react-navigation/drawer';
import React, { Component } from 'react';
import ProductsPage from "../Screens/ProductsPage.js";
import CartPage from "../Screens/CartPage.js";
import MyOrders from "../Screens/MyOrders.js";
import Wishlist from "../Screens/Wishlist.js";
import Profile from "../Screens/Profile.js"; 
import productDescription from "../Screens/productDescription.js";
import {
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  SafeAreaView,
  ScrollView,
  ActivityIndicator
} from 'react-native';
import { Avatar } from 'react-native-elements';
import AsyncStorage from '@react-native-community/async-storage';
import  MaterialCommunityIcons  from 'react-native-vector-icons/MaterialCommunityIcons';
import ImagePicker from 'react-native-image-picker';
import { CommonActions } from '@react-navigation/native';
const GLOBAL = require('../Global');
const options = {
  title: 'Select Profile Photo',
  storageOptions: {
    skipBackup: true,
    path: 'images',
  },
};
const Drawer = createDrawerNavigator();

class CustomDrawerContent extends Component {

  state={
    userData:[],
    loading:true
  }

  async componentDidMount(){
    if(await AsyncStorage.getItem('userid')===null){
      AsyncStorage.removeItem("userid");
      this.props.navigation.navigate('Login');
    }
    else{
    this.setState({ loading: false });
        fetch(GLOBAL.BASE_URL+"users/getProfileDetails/",{
       method:"POST",
       body:JSON.stringify({userid:await AsyncStorage.getItem('userid')}),
       })
       .then(res => res.json())
       .then(
       async(result) => {
           if(result.status){
               this.setState({userData:result['data'],loading:true});
           }
        else{
            alert('Error retrieveing user profile');
        }})
      }
  }

async profilePictureUpload(){
  ImagePicker.showImagePicker(options, async (response) => {
    fetch(GLOBAL.BASE_URL+"Users/addProfilePicture/",{
      method:"POST",
      headers:{
        'Content-Type':'application/json'
      },
      body:JSON.stringify({userid:await AsyncStorage.getItem('userid'),profilePictureURI:response.uri}),
      })
    .then(res => res.json())
    .then(
     (result) => {
       if(result.status) {
        this.setState({userData:result['data'][0]});
         }
        else{
          alert('Error uploading profile picture')
        }})
  })
}

profileView(){
  return(
    this.state.loading?
      <View style={{flexDirection:'row'}}>
        <Avatar
      onPress={()=>this.profilePictureUpload()}
      rounded
      size="large"
      source={{
      uri:this.state.userData['profilePictureURI']
     }}
      />
      <Text style={styles.username}>{this.state.userData['name']}</Text>
      </View>:<ActivityIndicator color="green" />     
  )
}

  render(){
  
  return (
    <ScrollView contentContainerStyle={{flex: 1,  flexDirection: 'column', justifyContent: 'space-between' }}>
    <SafeAreaView forceInset={{ top: 'always', horizontal: 'never' }}>
  <TouchableOpacity style={styles.viewbox} onPress={()=>this.props.navigation.navigate('Profile')}>
     {this.profileView()}
      </TouchableOpacity>
      <TouchableOpacity style={styles.buttonOpac} onPress={()=>{this.props.navigation.navigate('ProductsPage')}}>
        <Text style={styles.drawertext}>Home</Text>
      </TouchableOpacity>
      <TouchableOpacity style={styles.buttonOpac} onPress={()=>{this.props.navigation.navigate('CartPage')}}>
        <Text style={styles.drawertext}>Cart</Text>
      </TouchableOpacity>
      <TouchableOpacity style={styles.buttonOpac} onPress={()=>{this.props.navigation.navigate('MyOrders')}}>
        <Text style={styles.drawertext}>MyOrders</Text>
      </TouchableOpacity>
  </SafeAreaView>
    <TouchableOpacity onPress={()=>{AsyncStorage.removeItem("userid");this.props.navigation.dispatch( CommonActions.reset({
              index: 0,
            routes: [
              { name: 'Login' }]
            }))}}>
      <View style={styles.item}>
        <Text style={styles.label}>Logout</Text>
        <MaterialCommunityIcons name="logout" size={32} style={styles.logoutbutton}  color="black" />
      </View>
    </TouchableOpacity>
</ScrollView>
  );
}
}

export default class Home extends Component{
  render(){
  return (
    <Drawer.Navigator drawerContent={(props) => <CustomDrawerContent {...props} />}>
      <Drawer.Screen name="ProductsPage" component={ProductsPage} />
      <Drawer.Screen name="CartPage" component={CartPage} />
      <Drawer.Screen name="MyOrders" component={MyOrders} />
      <Drawer.Screen name="Wishlist" component={Wishlist} />
      <Drawer.Screen name="Profile" component={Profile} />
      <Drawer.Screen name="productDescription" component={productDescription} />
    </Drawer.Navigator>
  );
  }
}


const styles = StyleSheet.create({
  item: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  logoutbutton:{paddingLeft:20},
  label: {
    paddingRight:20,
    margin: 16,
    fontSize:20,
    color: 'rgba(0, 0, 0, .87)',
  },
  iconContainer: {
    marginHorizontal: 16,
    width: 24,
    alignItems: 'center',
  },
  icon: {
    width: 24,
    height: 24,
  },
  username:{
    fontSize:25,
    fontFamily:'Teko-Bold',
    paddingLeft:20,
    paddingTop:25,
    alignContent:'center',
    color:"#ffaaa5"
  },
  drawertext:{fontSize:20,paddingLeft:20},
  drawerback:{paddingLeft:40,paddingBottom:40},
  viewbox:{height:130,paddingLeft:20,paddingTop:20,flexDirection:'row',backgroundColor:'#d3f4ff'},
  buttonOpac:{
    paddingTop:30
  }
});