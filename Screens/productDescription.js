import React, { Component } from 'react';
import {   Button, View, Text,StyleSheet,ActivityIndicator,Image,TextInput } from 'react-native';
import HomeHeading from "../components/homeHeading";
import { TouchableOpacity, ScrollView } from 'react-native-gesture-handler';
import AsyncStorage from '@react-native-community/async-storage';
import { Rating } from 'react-native-elements';
import  AntDesign  from 'react-native-vector-icons/AntDesign';
import  FontAwesome  from 'react-native-vector-icons/FontAwesome';
import {  Overlay } from 'react-native-elements';
import Toast from 'react-native-toast-message'
// import styled from 'styled-components'
const GLOBAL = require('../Global');
let rating=3;

export default class productDescription extends Component {
    constructor(props) {
        super(props);
    this.state={
        details:[],
        loading:true,
        feedback:[],
        overlay:false,
        allFeedback:[],
        feedbackText:''
    }
    this.props.navigation.addListener('focus', async () => {  
        this.setState({loading:true});
        this.componentDidMount();
        })
    }
  
    componentDidMount(){
    fetch(GLOBAL.BASE_URL+"products?id="+this.props.route.params.itemId)
    .then(res => res.json())
    .then(
    async (result) => {
        this.setState({details:result,loading:false});
        fetch(GLOBAL.BASE_URL+"feedback/getDetails/",{
            method:"POST",
            headers:{
              'Content-Type':'application/json'
            },
            body:JSON.stringify({productId:this.props.route.params.itemId}),
            })
            .then(res => res.json())
            .then(
            (result) => {
             if(result.status){
                this.setState({feedback:result.feedback});
            }
        });
    });
    }

    ratingCompleted(value) {
        rating=value;
      }

    async updateFeedback(){
        fetch(GLOBAL.BASE_URL+"feedback/addFeedback/",{
            method:"POST",
            headers:{
              'Content-Type':'application/json'
            },
            body:JSON.stringify({productId:this.props.route.params.itemId,userid:await AsyncStorage.getItem('userid'),rating:rating,feedbackText:this.state.feedbackText}),
            })
            .then(res => res.json())
            .then(
              (result) => {
            if(result.status){  
                this.setState({feedback:result.data});
                this.displayFeedback();
                this.averageRating();
                this.setState({overlay:false});
        }
        })
        .catch((error)=>Toast.show({
            type:'error',
            text1: 'Something went wrong try again later',
          }))
    }

      displayFeedback(){
          return(
            (this.state.feedback.length!==0)?
                this.state.feedback.map((data,i)=>{
                    return(
                        <View key={i}>
                            <View style={{flexDirection:'row'}}>
                            <Text>{data.username}</Text>
                            <Text style={{marginLeft:10,color:'orange'}}>{data.rating}/5</Text>
                            <Text style={{position:'absolute',right:10,color:'red'}}>{new Date(data.createdAt).toLocaleDateString("en-US")}</Text>
                        </View>
                        <Text style={{color:'grey'}}>{data.feedbackText}</Text>
                        </View>)   
            }):<Text>No reviews</Text>
          )
      }

      onChangeText(value){
        this.setState({feedbackText:value});
      }

      averageRating(){
          var average=0;
          var oneRating=0;
          var twoRating=0;
          var threeRating=0;
          var fourRating=0;
          var fiveRating=0;
          
          this.state.feedback.map((data,i)=>{
                average=data.rating+average;
                if(data.rating===1){oneRating=oneRating+1}
                else if(data.rating===2){twoRating=twoRating+1}
                else if(data.rating===3){threeRating=threeRating+1}
                else if(data.rating===4){fourRating=fourRating+1}
                else if(data.rating===5){fiveRating=fiveRating+1}
          })
          average=average/this.state.feedback.length;
          return(
            <View  >
             {(this.state.feedback.length!==0)? 
             <View style={{width:'100%',backgroundColor:'white',flexDirection:'row'}}>
                 <View style={{width:'50%',alignItems:'center',justifyContent:'center'}}>
                  <Text style={{color:'orange'}}>{average.toFixed(2)}/5</Text>
                  <Text>{this.state.feedback.length} ratings</Text>
              </View>
              <View style={{
                        borderStyle: 'dotted',
                        height:100,
                        borderLeftWidth:2
                    }}/>
              <View style={{width:'50%',alignItems:'center'}}>
              <Text><AntDesign name="star" size={13} /><AntDesign name="staro" size={13} /><AntDesign name="staro" size={13} /><AntDesign name="staro" size={13} /><AntDesign name="staro" size={13} /> - {oneRating}</Text>
              <Text><AntDesign name="star" size={13} /><AntDesign name="star" size={13} /><AntDesign name="staro" size={13} /><AntDesign name="staro" size={13} /><AntDesign name="staro" size={13} /> - {twoRating}</Text>
              <Text><AntDesign name="star" size={13} /><AntDesign name="star" size={13} /><AntDesign name="star" size={13} /><AntDesign name="staro" size={13} /><AntDesign name="staro" size={13} /> - {threeRating}</Text>
              <Text><AntDesign name="star" size={13} /><AntDesign name="star" size={13} /><AntDesign name="star" size={13} /><AntDesign name="star" size={13} /><AntDesign name="staro" size={13} /> - {fourRating}</Text>
              <Text><AntDesign name="star" size={13} /><AntDesign name="star" size={13} /><AntDesign name="star" size={13} /><AntDesign name="star" size={13} /><AntDesign name="star" size={13} /> - {fiveRating}</Text>
          </View>
          </View>:<Text style={{alignItems:'center',justifyContent:'center'}}>No ratings</Text>}
          </View>
          )
      }

      overlay(){
          return(
            <Overlay isVisible={this.state.overlay}>
                <View>
                    <FontAwesome name="close" size={33}  onPress={()=>{this.setState({overlay:false})}} style={{position:'absolute',right:10,top:5}}/>
                    <Text>Give your rating</Text>
                    <Rating
                        showRating
                        startingValue={3}
                        onFinishRating={this.ratingCompleted}
                        style={{ paddingVertical: 10 }}
                        fractions={1}
                    />
                    <TextInput
                        style={{ height: 40, borderColor: 'gray', borderWidth: 1 }}
                        onChangeText={text => this.onChangeText(text)}
                        value={this.state.feedbackText}
                        placeholder='Enter the review'
                        style={{paddingBottom:20}}
                    />
                <Button title='Post' onPress={()=>{this.updateFeedback()}}/>
                </View>
            </Overlay>
         
          )
      }

      async addItems(e){
        fetch(GLOBAL.BASE_URL+"cartitems/add/",{
        method:"POST",
        headers:{
          'Content-Type':'application/json'
        },
        body:JSON.stringify({Name:e.name,link:e.link,price:e.price,Quantity:"1",productId:e.id,discountPercentage:e.discountPercentage,weight:e.weight,width:e.width,height:e.height,depth:e.depth,userid:await AsyncStorage.getItem("userid")}),
        })
      .then(res => res.json())
      .then(
       (result) => {
         if(result.status){
            Toast.show({
                type:'error',
                text1: 'somethingwent wrong',
                visibilityTime: 3000,
              })
         }
       })
       .catch((error)=>Toast.show({
        type:'error',
        text1: 'Something went wrong try again later',
      }))
      }

 render(){ 
    return(
        <View style={{flex:1}}>
            <ScrollView>
            <HomeHeading navigation={this.props.navigation}/> 
            <Toast ref={(ref) => Toast.setRef(ref)} />
            {this.state.loading?<ActivityIndicator size="large" color="#0000ff" />:
            this.state.details.map((data,i)=>{
                return(
                    <View key={i}>
                    <View style={styles.imageView}> 
                     <Image style={ styles.itemImage} source={{uri: data.link}}/>
                    </View>
                    <Text style={styles.prodName}>{data.name}</Text>
                    <View style={{flexDirection:'row'}}>
                    <View style={{width:60,marginLeft:20,marginTop:10}}>
                     <Button title='Add' onPress={()=>{this.addItems(data)}} />
                     </View>
                     <View style={{marginTop:10,position:'absolute',right:20}}>
                         <Text style={{fontSize:20}}>$ {data.price}</Text>
                     </View>
                     </View>
                       <View style={{marginTop:20,marginLeft:10}}>
                             <Text style={{fontSize:20,fontWeight:'bold'}}>Description</Text>
                             <Text style={{margin:10}}>Lorem Ipsum is simply dummy text of the printing and typesetting industry. Lorem Ipsum has been the industry's standard dummy text ever since the 1500s, when an unknown printer took a galley of type and scrambled it to</Text>
                       </View>
                       <View style={{marginTop:20,marginLeft:10}}>
                             <Text style={{fontSize:20,fontWeight:'bold'}}>Rating</Text>
                                 {this.averageRating()}
                            <TouchableOpacity style={{width:'100%',height:30,backgroundColor:'grey',alignItems:'center',justifyContent:'center'}} onPress={()=>{this.setState({overlay:true})}}>
                                <Text>Add a review</Text>
                            </TouchableOpacity>
                                <View style={{width:'100%',backgroundColor:'white'}}> 
                                {this.displayFeedback()}
                                </View>
                            {this.overlay()}
                        </View>    
                 </View>
                 )
            })}
            <View> 
                <Text>Footer</Text>
            </View>
        </ScrollView>
        </View>
    )
}
}

const styles=StyleSheet.create({
    itemImage:{
        width:350,
        height:300
    },
    imageView:{
        marginTop:30,
        alignItems:'center',
        width:'100%'
    },
    prodName:{
        fontSize:24,
     color:'#ff9234',
     fontFamily:'Nunito-Bold'
    }
})