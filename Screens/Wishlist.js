import React, { Component } from 'react';
import {   Button, View, Text,StyleSheet,FlatList,Image } from 'react-native';
import { TouchableOpacity } from 'react-native-gesture-handler';
import HomeHeading from "../components/homeHeading";
import AsyncStorage from '@react-native-community/async-storage';
import { Card } from 'react-native-elements';
import Toast from 'react-native-toast-message'
const GLOBAL = require('../Global');
var tempuserid='';

export default class Wishlist extends Component {
        constructor(props){
          super(props)
          this.state={
            allItems:[],
            loading:true
        }
        this.props.navigation.addListener('focus', async () => {  
          tempuserid=await AsyncStorage.getItem("userid");
          this.componentDidMount();           
        }) 
      }

    componentDidMount(){
        fetch(GLOBAL.BASE_URL+"wishlist/allItems/",{
            method:"POST",
            headers:{
              'Content-Type':'application/json'
            },
            body:JSON.stringify({userid:tempuserid}),
            })
          .then(res => res.json())
          .then(
           (result) => {
             if(result.status){
                this.setState({allItems:result.allItems,loading:false});
             }
             else{
              alert("Something went wrong try later");
             }
           });
    }

    async addItems(e){
      fetch(GLOBAL.BASE_URL+"cartitems/add/",{
      method:"POST",
      headers:{
        'Content-Type':'application/json'
      },
      body:JSON.stringify({Name:e.name,link:e.link,price:e.price,Quantity:"1",productId:e.id,discountPercentage:e.discountPercentage,userid:await AsyncStorage.getItem("userid")}),
      })
      .then(res => res.json())
      .then(
      (result) => {
       if(!result.status){
        alert("Unauthorized Usage Need to Login again");
       }
       else{
        Toast.show({
          type:'success',
          text1: 'Item Added',
          visibilityTime: 500,
        })
       }
     });
    }

  render() {
    return (
      <View style={styles.header}>
        <HomeHeading navigation={this.props.navigation}/>
        <Toast ref={(ref) => Toast.setRef(ref)} />
        <View style={{alignContent:'center',alignItems:'center'}}>
        <Text style={{fontSize:20,paddingTop:20}}>Wishlist</Text></View>
        {this.state.allItems.length!==0?
          <FlatList numColumns={2}
            keyExtractor={(item)=>item.id}
            data={this.state.allItems}
            renderItem={({item})=>(
                  <Card style={styles.card}>
                      <View style={{paddingLeft:10}}>
                        <Image
                          style={styles.itemImages}
                          source={{uri: item.link}}/></View>
                            <View style={styles.textcontent}>
                                <Text style={styles.cardText}>{item.name}</Text>
                                <Text style={styles.priceText}>RS: {item.price}</Text>
                            </View>
                      <View>
                        <TouchableOpacity style={styles.button}>
                        <Button title='add'color="red" onPress={()=>{this.addItems(item)}}/></TouchableOpacity></View>
                  </Card>
          )} />:null}
      </View>
    )
  }
}

const styles=StyleSheet.create({
    header:{
      flex:1
    },
    detailstext:{
        fontSize:25,
        paddingBottom:10,
        fontFamily:'Teko-Bold'
    },
      card:{
        marginTop:10,
        flexDirection:'row',
        alignItems:'center',
        justifyContent:'center',
      },
      cardText:{
      fontSize:17,
      fontFamily:'SF-UI-Display-Bold'
      },
      itemImages:{
        width: 110, height: 98
      },
      textcontent:{
        alignItems:'center',
        alignContent:'center',
        marginTop:10,
        marginBottom:10
      },
      priceText:{
        fontSize:17,
      },
      button:{
        alignContent:'center',
        marginLeft:23,
      width:70
      }
})
