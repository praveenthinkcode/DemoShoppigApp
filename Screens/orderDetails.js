import React, { Component } from 'react';
import {
  StyleSheet,
  Text,
  View,
  Button,
  Image,
  ActivityIndicator,
  TextInput
  } from 'react-native';
import AsyncStorage from '@react-native-community/async-storage';
import { FlatList } from 'react-native-gesture-handler';
import Toast from 'react-native-toast-message'
import { Overlay,Rating } from 'react-native-elements';
import  FontAwesome  from 'react-native-vector-icons/FontAwesome';
const GLOBAL = require('../Global');
var rating=5;
export default class OrderDetails extends Component {
    state={
        orderDetails:[],
        loading:true,
        overlay:false,
        feedbackText:'',
        feedbackItem:'',
        feedbackItemName:''
    }

async componentDidMount(){
    fetch(GLOBAL.BASE_URL+"orders?id="+this.props.route.params.orderId)
    .then(res => res.json())
    .then(
    async (result) => {
       this.setState({orderDetails:result});
       this.setState({loading:false})
    })
}

reviewOverlay(){
    return(
        <Overlay isVisible={this.state.overlay}>
        <View>
            <FontAwesome name="close" size={33}  onPress={()=>{this.setState({overlay:false})}} style={{position:'absolute',right:10,top:5}}/>
            <Text>Give your rating</Text>
            <Text>Product Name:{this.state.feedbackItemName}</Text>
            <Rating
                showRating
                startingValue={rating}
                onFinishRating={this.ratingCompleted}
                style={{ paddingVertical: 10 }}
                fractions={1}
            />
            <TextInput
                style={{ height: 40, borderColor: 'gray', borderWidth: 1 }}
                onChangeText={text => this.setState({feedbackText:text})}
                value={this.state.feedbackText}
                placeholder='Enter the review'
                style={{paddingBottom:20}}
            />
        <Button title='Post' onPress={()=>{this.updateFeedback()}}/>
        </View>
    </Overlay>
    )
}

async updateFeedback(){
    fetch(GLOBAL.BASE_URL+"feedback/addFeedback/",{
        method:"POST",
        headers:{
          'Content-Type':'application/json'
        },
        body:JSON.stringify({productId:this.state.feedbackItem,userid:await AsyncStorage.getItem('userid'),rating:rating,feedbackText:this.state.feedbackText}),
        })
        .then(res => res.json())
        .then(
          (result) => {
        if(result.status){  
            this.setState({overlay:false});
            Toast.show({
                type:'success',
                text1: 'Feedback posted',
              })
    }
    })
    .catch((error)=>Toast.show({
        type:'error',
        text1: 'Something went wrong try again later',
      }))
}

 ratingCompleted(value) {
    rating=value;
  }

  displayOrder(){
    var tempOrderDetail=this.state.orderDetails[0];
      return(
          <View>
            <View style={{alignItems:'center'}}>
                <Text>Details</Text>
                <Text >{tempOrderDetail.orderid}</Text>
                <Text>OrderStatus:{tempOrderDetail.orderStatus}</Text>
                {tempOrderDetail.orderStatus==='OrderDispatched'?
                <View><Text>Courier service: Bluedart</Text>
                <Text>Tracking Number:{tempOrderDetail.tracking_number}</Text></View>
                :null}
            </View>
             <View style={{flexDirection:'row'}}>
                <Text >TotalAmount: ₹ {(this.state.orderDetails[0].totalamount)/100}</Text>
                <Text > {this.state.orderDetails[0].date}</Text>
             </View>
          <View style={{flexDirection:'row'}}> 
            <Text>Paymet mode: {this.state.orderDetails[0].method}</Text>
            {(this.state.orderDetails[0].wallet&&this.state.orderDetails[0].wallet!==null)?<Text>Wallet: {this.state.orderDetails[0].wallet}</Text>:null}
            {(this.state.orderDetails[0].wallet&&this.state.orderDetails[0].bank!==null)?<Text >Bank: {this.state.orderDetails[0].bank}</Text>:null}
          </View>    
            <FlatList
                data={this.state.orderDetails[0].items}
                keyExtractor={(item)=>item.id}
                renderItem={({item})=>(
            <View  style={{flexDirection:'row',height:60,backgroundColor:'white', borderWidth:1,borderColor: '#ddd'}} >
             <View >
                 <Image
                     style={{marginTop:10,width: 60, height: 48}}
                     source={{uri: item.Link}}/>
             </View>
              <View>   
                     <Text >{item.Name}</Text>
                     <Text >PRICE: ${item.Price}</Text>
              </View>
              <View style={{paddingLeft:200,paddingTop:5,flexDirection:'row',position:'absolute'}}>
                     <Text>Quantity:{item.Quantity}</Text>  
              </View>
              <View style={{right:10,position:'absolute'}}>
                     <Text style={{color:'red',textDecorationLine:'underline'}} onPress={()=>this.setState({feedbackItem:item.productId,feedbackItemName:item.Name,overlay:true})}>Give review </Text>
              </View>
             </View>
        )}
        />
      </View>
      )
  }

render(){
    
    return(
        this.state.loading?<ActivityIndicator />:
            <View style={{flex: 1}}>
            <Toast ref={(ref) => Toast.setRef(ref)} />
                {this.displayOrder()}
                 {this.reviewOverlay()}
            </View>
    )
}
}

    