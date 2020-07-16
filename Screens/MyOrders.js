import React, { Component } from 'react';
import {
  StyleSheet,
  Text,
  View,
  Button,
  Image,
  ActivityIndicator,
  } from 'react-native';
import AsyncStorage from '@react-native-community/async-storage';
import Homeheading from "../components/homeHeading.js";
import { FlatList, TouchableOpacity } from 'react-native-gesture-handler';
import Toast from 'react-native-toast-message'
const GLOBAL = require('../Global');

export default class MyOrders extends Component {
    constructor(props){
        super(props);
        this.state={
        allOrders:[],
        loading:true
    }
    this.props.navigation.addListener('focus', async () => { 
        this.setState({loading:true})
        this.componentDidMount();
    })  
    }

    async componentDidMount(){
        fetch(GLOBAL.BASE_URL+"Orders?userid="+await AsyncStorage.getItem("userid"))
        .then(res => res.json())
        .then(
        (result) => {
            if(result){
            this.setState({allOrders:result,loading:false});
            }
            else{
                Toast.show({
                    type:'error',
                    text1: 'Someting went wrong',
                    visibilityTime: 3000,
                  })
            }
        })
    }

    displayOrders(){
        return(
                <View style={{flex:1}}>
                     <View style={styles.orderstext}>
                         <Text style={{fontSize:25,paddingTop:10,paddingBottom:10}}>Orders</Text></View>
                         {this.state.loading?<ActivityIndicator color="blue" />:this.state.allOrders.length!==0?
                         <FlatList
                         data={this.state.allOrders}
                         keyExtractor={(item)=>item.id}
                         renderItem={({item})=>(
                           <TouchableOpacity onPress={()=>this.props.navigation.navigate('orderDetails',{orderId:item.id})} style={{flexDirection:'row',height:70,marginTop:5,backgroundColor:'#fde2e2', borderWidth:1,borderColor: '#ddd'}}>
                                <View >
                                    <Text style={styles.ordertext} >OrderId: {item.orderid}</Text>
                                    <Text style={styles.totaltext}>TotalAmount: ₹ {(item.totalamount)/100}</Text>
                                </View>  
                                <View style={{alignItems:'center',alignContent:'center'}}>
                                    <Text style={styles.date}> {item.date}</Text> 
                                    <Text style={{paddingLeft:40,paddingTop:10}}>{item.time}</Text>
                                </View>
                                <View style={{right:150,marginBottom:10}}>
                                    <Text >Order Status:{item.orderStatus}</Text>
                                    </View>
                            </TouchableOpacity>
                        )} />:<Text>No previous orders</Text>}
                </View>
        )
    }

    
    render(){  
        return(
            <View style={{flex:1}}>
               <Toast ref={(ref) => Toast.setRef(ref)} />
            <Homeheading navigation={this.props.navigation}/>
            {this.displayOrders()}
         </View>
        )
    }
}

const styles = StyleSheet.create({
ordertext:{
    fontSize:15 ,
    fontFamily:'Nunito-Bold',
    color:'#f78259',
    paddingLeft:12,
    paddingTop:12
},
totaltext:{
    fontSize:15 ,
    color:'#eb4559',
    paddingLeft:12,
    paddingTop:10,
    fontFamily:'Nunito-Bold'
   
},date:{
    paddingLeft:60,paddingTop:10
},
orderstext:{
alignContent:'center',
justifyContent:'center',
alignItems:'center'
},
cardText:{
    fontSize:17,
    fontWeight:'bold',
    fontFamily:'Teko-Bold'
  },
  priceText:{
    fontSize:13,
    paddingTop:8
    
  },
  detailstext:{
      fontSize:17,
      paddingBottom:10,
      fontFamily:'Teko-Bold'
  }
})
