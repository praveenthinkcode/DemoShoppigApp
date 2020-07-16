import React , {Component} from 'react';
import {
    StyleSheet,
    Text,
    View,
    Button,
    FlatList,
    Image,
    ActivityIndicator,
    PermissionsAndroid,
    Platform
  } from 'react-native';
import 'react-native-gesture-handler';
import { Card } from 'react-native-elements';
import AsyncStorage from '@react-native-community/async-storage';
import { SearchBar,Overlay } from 'react-native-elements';
import { TouchableOpacity } from 'react-native-gesture-handler';
import  MaterialIcons  from 'react-native-vector-icons/MaterialIcons';
import  FontAwesome  from 'react-native-vector-icons/FontAwesome';
import  MaterialCommunityIcons  from 'react-native-vector-icons/MaterialCommunityIcons';
import  Entypo  from 'react-native-vector-icons/Entypo';
import Geolocation from 'react-native-geolocation-service';
import HomeHeading from "../components/homeHeading";
import Geocoder from 'react-native-geocoding';
import Toast from 'react-native-toast-message'
import PushNotification from 'react-native-push-notification';
import {check, PERMISSIONS, RESULTS,request} from 'react-native-permissions';
const GLOBAL = require('../Global');

// Class for push notiication 
class NotificationHandler {
  onNotification(notification) {
    console.log('NotificationHandler:', notification);
    if (typeof this._onNotification === 'function') {
      this._onNotification(notification);
    }
  }
  onRegister(token) {
    console.log('NotificationHandler:', token);
    if (typeof this._onRegister === 'function') {
      this._onRegister(token);
    }
  }
  attachRegister(handler) {
    this._onRegister = handler;
  }
  attachNotification(handler) {
    this._onNotification = handler;
  }
}

const handler = new NotificationHandler();

export default class productsPage extends Component{
    state={
        allProducts:[],
        filteredProducts:[],
        filteredCat:[],
        filteredCategory:[],
        searchValue:"",
        wishlistItems:[],
        loading:true,
        displayChatbot:false,
        categoryFilterOverlay:false
    }

    async permission(){
      var permission;
      if(Platform.OS==="android"){
      permission=PERMISSIONS.ANDROID.ACCESS_FINE_LOCATION;
      }
      else{
        permission=PERMISSIONS.IOS.LOCATION_WHEN_IN_USE;
      }
      check(permission)
      .then((result) => {
        switch (result) {
          case RESULTS.UNAVAILABLE:
            console.log('This feature is not available (on this device / in this context)',);
            break;
          case RESULTS.DENIED:
            console.log(
              'The permission has not been requested / is denied but requestable',
            );
            request(permission).then((result) => {
              console.log(result);
            });
            break;
          case RESULTS.GRANTED:
            console.log('The permission is granted');
            break;
          case RESULTS.BLOCKED:
            console.log('The permission is denied and not requestable anymore');
            break;
        }
      })
      .catch((error) => {
        console.log(error)
      });
    }

    pushnotification(){
      PushNotification.configure({
        onNotification: handler.onNotification.bind(handler),
       });
    }

    async geolocation(){
      const granted = await PermissionsAndroid.check( PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION );
      if (granted) {
        Geolocation.getCurrentPosition(
          (position) => {
              console.log(position);
          },
          (error) => {
              console.log(error.code, error.message);
          },
          { enableHighAccuracy: true, timeout: 15000, maximumAge: 10000 }
      );
      Geocoder.init("AIzaSyDdYvZzsrY6lzPs46U0EilOurDfR9C-gIk");
        Geocoder.from(11.0223346, 76.9907622)
          .then(json => {
          var addressComponent = json.results[0].address_components[0];
          console.log(addressComponent);
          })
          .catch(error => console.log(error));
        console.log( "You can use the ACCESS_FINE_LOCATION" )
      } 
      else {
        console.log( "ACCESS_FINE_LOCATION permission denied" )
      }
    }

   async componentDidMount(){
    this.permission();
    this.pushnotification();
    fetch(GLOBAL.BASE_URL+"products/")
    .then(res => res.json())
    .then(
      async (result) => {
               this.setState({allProducts:result,loading:false});
              const allCat = [...new Set(this.state.allProducts.map(data => data.category))];
              this.setState({filteredCategory:allCat})
              this.geolocation();

            fetch(GLOBAL.BASE_URL+"wishlist/getItems/",{
              method:"POST",
              headers:{
                'Content-Type':'application/json'
              },
              body:JSON.stringify({userid:await AsyncStorage.getItem("userid")}),
              })
            .then(res => res.json())
            .then(
             (result) => {
               if(result.status){
                  this.setState({wishlistItems:result.items});
               }
               else{
                Toast.show({
                  type:'error',
                  text1: 'Something went wrong',
                  visibilityTime: 3000,
                })
               }
             });
          })   
    }

    searchFilter(text){
      this.setState({searchValue:text,loading:true},()=>{
      fetch(GLOBAL.BASE_URL+"products/searchFilter/",{
        method:"POST",
        headers:{
          'Content-Type':'application/json'
        },
        body:JSON.stringify({searchValue:this.state.searchValue}),
        })
      .then(res => res.json())
      .then(
       (result) => {
         if(result.status){
          this.setState({allProducts:result.products,loading:false})
         }
         else{
           this.setState({loading:false})
         }
        })
        .catch((error)=>Toast.show({
          type:'error',
          text1: 'Something went wrong try again later',
        }))
      })
    }

    categoryFilter(){
      this.setState({categoryFilterOverlay:false,loading:true});
      fetch(GLOBAL.BASE_URL+"products/categoryFilter/",{
        method:"POST",
        headers:{
          'Content-Type':'application/json'
        },
        body:JSON.stringify({filteredCategory:this.state.filteredCategory}),
        })
      .then(res => res.json())
      .then(
       (result) => {
         if(result.status){
          this.setState({filteredProducts:result.products,filteredCategory:result.filteredCategory,loading:false})
         }
         else{
           this.setState({loading:false})
         }
        })
        .catch((error)=>Toast.show({
          type:'error',
          text1: 'Something went wrong try again later',
        }))
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
       if(!result.status){
        Toast.show({
          type:'error',
          text1: 'Something went wrong',
          visibilityTime: 1000,
        })
       }
       else{
        Toast.show({
          type:'success',
          text1: 'Item Added',
          visibilityTime: 1000,
        })
       }
     });
    }

    //push notifications works on a button press (for testing)
    testPush(){
      PushNotification.localNotificationSchedule({
        title: "Shopping App",
        message: "Hello There...", 
        ticker: "My Notification Ticker",
        playSound: true, // (optional) default: true
        soundName: "default",
        color: "red",
        vibrate: true, // (optional) default: true
        vibration: 300,
        date: new Date(Date.now()), 
        foreground: true, // BOOLEAN: If the notification was received in foreground or not
        userInteraction: true,
        priority: "high", // (optional) set notification priority, default: high
        visibility: "private", // (optional) set notification visibility, default: private
        importance: "high",
      });
    }

    async wishlistRemove(id){
      fetch(GLOBAL.BASE_URL+"wishlist/remove/",{
        method:"POST",
        headers:{
          'Content-Type':'application/json'
        },
        body:JSON.stringify({productId:id,userid:await AsyncStorage.getItem("userid")}),
        })
      .then(res => res.json())
      .then(
       (result) => {
         if(result.status){
          Toast.show({
            type:'success',
            text1: 'Item removed from wishlist',
            visibilityTime: 1000,
          })
           this.componentDidMount();
         }
         else{
          Toast.show({
            type:'error',
            text1: 'Error removing item',
            visibilityTime: 1000,
          })
         }
       });
    }

    async wishlistAdd(id){
      fetch(GLOBAL.BASE_URL+"wishlist/add/",{
        method:"POST",
        headers:{
          'Content-Type':'application/json'
        },
        body:JSON.stringify({productId:id,userid:await AsyncStorage.getItem("userid")}),
        })
      .then(res => res.json())
      .then(
       (result) => {
         if(result.status){
          Toast.show({
            type:'success',
            text1: 'Item added to wishlist',
            visibilityTime: 1000,
          })
           this.componentDidMount();
         }     
         else{
          Toast.show({
            type:'error',
            text1: 'Error adding item',
            visibilityTime: 1000,
          })
         }
       });
    }

    // addCategory &  removeCategory -- for category filter option
    addCategory(data){
      var tempCategory=this.state.filteredCategory;
      tempCategory.push(data);
      this.setState({filteredCategory:tempCategory});
    }

    removeCategory(data){
      var tempCategory=this.state.filteredCategory;
      var index=tempCategory.indexOf(data);
      tempCategory.splice(index,1);
      this.setState({filteredCategory:tempCategory});
    }
    
    displayFilters(){
        const allCat = [...new Set(this.state.allProducts.map(data => data.category))];
      return(
        <View style={styles.SearchBarContainer}>
         <View style={{height:57}}>
           <SearchBar
              placeholder="Search Products..."
              onChangeText={(text)=>{this.searchFilter(text)}}
              value={this.state.searchValue}
              cancelIcon={true}
           />
         </View>
        <Text style={{backgroundColor:'orange',color:'white',padding:10,borderRadius:5}} onPress={()=>this.setState({categoryFilterOverlay:true})}>Filter Categories</Text>
         <Overlay isVisible={this.state.categoryFilterOverlay}>
          <View >
            <FontAwesome name="close" size={33}  onPress={()=>{this.setState({categoryFilterOverlay:false})}} style={{position:'absolute',right:10,top:5}}/>
              <Text style={{marginTop:30,marginRight:50,marginLeft:50,marginBottom:20 }}>Filter categories</Text>
              <View style={{paddingLeft:60,paddingBottom:30}}>
              {allCat.map((data,i)=>{
                const tempName=data;
          return(
            (this.state.filteredCategory.includes(data))?
                <View style={{flexDirection:'row'}}><MaterialCommunityIcons name="checkbox-intermediate" size={20} color="green" value={data} onPress={()=>this.removeCategory(data)} /><Text style={{fontSize:20}}>{data}</Text></View>:
                <View style={{flexDirection:'row'}}><MaterialCommunityIcons name="checkbox-blank-outline" size={20}  color="green" value={data} onPress={()=>this.addCategory(data)}/><Text style={{fontSize:20}}>{data}</Text></View>
          )
        })}
        </View>
            <Text style={{backgroundColor:'orange',color:'white',padding:10,borderRadius:5,textAlign:'center'}} onPress={()=>this.categoryFilter()}>Apply</Text>
          </View>
         </Overlay>
        </View>
      )
    }

    displayProducts(){
      var products=(this.state.filteredProducts.length!==0)?this.state.filteredProducts:this.state.allProducts;  
      return(
        <View style={{flex:1}}>
        {products.length!==0?
        <FlatList numColumns={2}
        keyExtractor={(item)=>item.id}
        data={products}
        renderItem={({item})=>(
             <Card style={styles.card} >
                {this.state.wishlistItems.includes(item.id)?<MaterialIcons name="favorite" color='red' size={22}  onPress={()=>this.wishlistRemove(item.id)}/>:<MaterialIcons name="favorite-border" size={22}  onPress={()=>this.wishlistAdd(item.id)}/>}
                {(item.discountPercentage)?<View style={{flexDirection:'row',position:'absolute',right:0}}><MaterialCommunityIcons  name="sale" color='red' size={18} /><Text>&nbsp;{item.discountPercentage}%</Text></View>:null}
                  <View style={{paddingLeft:10}}>
                  <TouchableOpacity onPress={()=>this.props.navigation.navigate('productDescription',{itemId:item.id})}><Image
                      style={styles.itemImages}
                      source={{uri: item.link}}/></TouchableOpacity></View>
                        <View style={styles.textcontent}>
                            <Text style={styles.cardText}>{item.name}</Text>
                            {(item.discountPercentage)?<View style={{flexDirection:'row'}}>
                              <Text style={styles.originalPriceText}>RS: {item.price}</Text>
                              <Text style={styles.discountpriceText}>&nbsp;RS: {((item.price*item.discountPercentage)/100).toFixed(2)}</Text>
                              </View>:
                            <Text style={styles.priceText}>RS: {item.price}</Text>}
                        </View>
                  <View>        
                    <TouchableOpacity style={styles.button}>
                    <Button title='add'color="red" onPress={()=>{this.addItems(item)}}/></TouchableOpacity></View>
              </Card>
       )} />:null}
    </View>
      )
    }

    render(){
      //var products -- for displaying products based on filtering categories
      return (
        <View style={{flex:1}}>
          <HomeHeading navigation={this.props.navigation}/>
          <Toast ref={(ref) => Toast.setRef(ref)} />
            {this.displayFilters()}
            {this.state.loading?<ActivityIndicator size="large" color="#0000ff" />:null}
            {/*for testing push notifiaction*/}
            <Button title='Push Notification' onPress={()=>this.testPush()} />
           {this.displayProducts()}
        <Entypo style={{position:'absolute',bottom:15,right:20}}name="chat" color='red' size={52}  onPress={()=>this.props.navigation.navigate('Chat')}/>
      </View>
      );
    }
}

const styles = StyleSheet.create({
    container: { flexDirection:'row'},
    cardbox:{},
    categoryName:{
      fontSize:15,
      paddingLeft:10,
      paddingTop:10,
      fontWeight:'bold'
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
    SearchBarContainer:{
        paddingTop:10,
        backgroundColor: GLOBAL.Styling.Colors.searchBarBackground,
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
    originalPriceText:{
      textDecorationLine:'line-through',
     color:'grey',
     fontSize:13
    },
    button:{
      alignContent:'center',
      marginLeft:23,
    width:70
    }
  })
