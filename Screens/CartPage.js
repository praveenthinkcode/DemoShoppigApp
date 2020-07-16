import React , {Component} from 'react';
import RazorpayCheckout from 'react-native-razorpay';
import { ProgressSteps, ProgressStep } from 'react-native-progress-steps';
import { AirbnbRating } from 'react-native-elements';
import { Overlay,CheckBox } from 'react-native-elements';
import {
    StyleSheet,
    Text,
    View,
    TextInput,
    Button,
    FlatList,
    TouchableOpacity,
    Image,
    ActivityIndicator
  } from 'react-native';
import  Ionicons  from 'react-native-vector-icons/Ionicons';
import  AntDesign  from 'react-native-vector-icons/AntDesign';
import { Input } from 'react-native-elements';
import AsyncStorage from '@react-native-community/async-storage';
import HomeHeading from '../components/homeHeading';
import CountryPicker from 'react-native-country-picker-modal'
import Toast from 'react-native-toast-message'
const GLOBAL = require('../Global');
var rating=5;

 export default class cartPage extends Component{
    constructor(props) {
        super(props);
        this.state = {
          orderId:"",
          isModalVisible:false,
          allData:[],
          allProducts: [],
          totalAmount:"0",
          loading:true,
          couponText:'',
          couponLoading:false,
          couponTextError:'',
          allCoupons:'',
          validated:false,
          addressLine1:'',
          pincode:'',
          mobile:'',
          state:'',
          city:'',
          country:'',
          feedbackText:'',
          feedbackUpdated:false,
          couponApplied:false,
          itemClicked:false,
          incrementLoading:false,
          userId:'',
          orderPlacedLoader:false,
          cashClicked:'',
          onlinePaymentClicked:'true'
        }
        this.props.navigation.addListener('focus', async () => 
        { 
        this.setState({loading:true,userId:await AsyncStorage.getItem("userid")})
          this.componentDidMount();
        })
    }

    //remove item in cart by making req to server with product id and userid
    async removeItem(id){
      fetch(GLOBAL.BASE_URL+"cartitems/remove/",{
      method:"POST",
      body:JSON.stringify({productId:id,userid:this.state.userId}),
      })
      .then(res => res.json())
      .then(
      (result) => {
        if(result.status){
         this.setState({allProducts:result.cartItems});
         this.totalAmount();
        }
       })
       .catch((error)=>Toast.show({
        type:'error',
        text1: 'Something went wrong try again later',
      }))

    }

    //increment item in cart by making req to server with product id and userid
    increment(id){
      this.setState({incrementLoading:true})
      fetch(GLOBAL.BASE_URL+"cartitems/increment/",{
        method:"POST",
        body:JSON.stringify({productId:id,userid:this.state.userId}),
      })
     .then(res => res.json())
     .then(
       (result) => {
        this.setState({allProducts:result});
        this.totalAmount();
        this.setState({incrementLoading:false});
         })
      .catch((error)=>Toast.show({
          type:'error',
          text1: 'Something went wrong try again later',
        })
      )
    }

    //decrement item in cart by making req to server with product id and userid
   decrement(id){
    this.setState({incrementLoading:true})
      fetch(GLOBAL.BASE_URL+"cartitems/decrement/",{
        method:"POST",
        body:JSON.stringify({productId:id,userid:this.state.userId}),
      })
     .then(res => res.json())
     .then(
       (result) => { 
        this.setState({allProducts:result});
        this.totalAmount(); 
        this.setState({incrementLoading:false});
    })
    .catch((error)=>Toast.show({
      type:'error',
      text1: 'Something went wrong try again later',
    }))
    }

    //getting the totalAmount of cart
    totalAmount(){
      fetch(GLOBAL.BASE_URL+"cartitems/totalAmount",{
        method:"POST",
        body:JSON.stringify({userid:this.state.userId,couponCode:this.state.couponText,totalAmount:this.state.totalAmount})
      })
     .then(res => res.json())
     .then(
       (result) => {  
         this.setState({totalAmount:result})
       })
       .catch((error)=>Toast.show({
        type:'error',
        text1: 'Something went wrong try again later',
      }))
    }

    async componentDidMount(){
      this.setState({userId:await AsyncStorage.getItem("userid")});
      fetch(GLOBAL.BASE_URL+"cartitems/getCartitems/",{
        method:"POST",
        body:JSON.stringify({userid:this.state.userId}),
        })
        .then(res => res.json())
        .then(
        async(result) => {
          if(result.status){
            this.setState({allProducts:result.data,loading:false});
            this.totalAmount();
          }
     })
     .catch((error)=>Toast.show({
      type:'error',
      text1: 'Something went wrong try again later',
    }))
    //getting available coupon details   
    fetch(GLOBAL.BASE_URL+"coupon/")
        .then(res => res.json())
        .then(
        (result) => {
          this.setState({allCoupons:result})
        })    
  }

  //oncick to payment and checkout
  //getting the order api and and initiating payment
    orderplaced(){
      if(this.state.onlinePaymentClicked){
      fetch(GLOBAL.BASE_URL+"Orders/orderid/",{
        method:"POST",
        headers:{
          'Content-Type':'application/json'
        },
        body:JSON.stringify({totalamount:this.state.totalAmount}),
      })
     .then(res => res.json())
     .then(
       (result) => {
         if(!result.status){
          Toast.show({
            type:'error',
            text1: 'Error placing order try again later',
            visibilityTime: 1000,
          })
         }
         else{
           console.log(result)
           this.setState({orderid:result.id});
           var options = {
            description: 'Credits towards consultation',
            image: 'https://i.imgur.com/3g7nmJC.png',
            currency: 'INR',
            key: 'rzp_test_wwfPnacJ10szIa',
            amount: '5000',
            name: 'Shopping Cart',
            order_id:this.state.orderid,
            prefill: {
              email: '',
              contact: '',
              name: ''
            },
            theme: {color: '#F37254'}
          }
       
          return(
            RazorpayCheckout.open(options).then(async (data) => {
              // this.setState({orderPlacedLoader:true})
              //generating a order api
              fetch(GLOBAL.BASE_URL+"Orders/add/",{
                method:"POST",
                headers:{
                  'Content-Type':'application/json'
                },
              body:JSON.stringify({orderid:data.razorpay_order_id,paymentid:data.razorpay_payment_id,signature:data.razorpay_signature,totalamount:this.state.totalAmount,items:this.state.allProducts,userid:this.state.userId,couponCode:this.state.couponText,addressLine1:this.state.addressLine1,pincode:this.state.pincode,mobile:this.state.mobile,city:this.state.city,state:this.state.state}),
              })
              .then(res => res.json())
              .then(
                async (result) => {
                  //to remove the items of placed order frm cart
                  fetch(GLOBAL.BASE_URL+"cartitems/itemsremoval/",{
                    method:"POST",
                    body:JSON.stringify({userid:this.state.userId}),
                 })
                 .then(res => res.json())
                 .then(
                   (result) => {
                     if(result.status){
                    this.setState({orderId:data.razorpay_payment_id,isModalVisible:true});
                     }
                  })  
              });
             }).catch((error) => {
               this.props.navigation.navigate('ProductsPage');
            alert(`Error: ${error.code} | ${error.description}`);
              })
          )
         }
       });
      }
      else{
        this.setState({orderPlacedLoader:true});
        fetch(GLOBAL.BASE_URL+"orders/cashOrder/",{
          method:"POST",
          body:JSON.stringify({totalamount:this.state.totalAmount,items:this.state.allProducts,userid:this.state.userId,couponCode:this.state.couponText,addressLine1:this.state.addressLine1,pincode:this.state.pincode,mobile:this.state.mobile,city:this.state.city,state:this.state.state}),
       })
       .then(res => res.json())
       .then(
         (result) => {
           if(result.status){
            this.setState({orderId:result.orderId,orderPlacedLoader:false,isModalVisible:true});
              fetch(GLOBAL.BASE_URL+"cartitems/itemsremoval/",{
                method:"POST",
                body:JSON.stringify({userid:this.state.userId}),
             })
             .then(res => res.json())
             .then(
               (result) => {
                 if(result.status){
                 }
              }) 
           }
           else{
             this.setState({orderPlacedLoader:false});
             alert("Something went wrong try again later")
           }
      })
    
      }
    }

    onChangeCouponText(text){
      this.setState({couponText:text})
    }

    checkCoupon(){
      if(this.state.couponText ===''){this.setState({couponTextError:'Enter a valid coupon code'})}
      else{
        this.setState({couponTextError:'',couponLoading:true});
        fetch(GLOBAL.BASE_URL+"coupon/checkCoupon/",{
          method:"POST",
          body:JSON.stringify({couponCode:this.state.couponText,totalAmount:this.state.totalAmount,userid:this.state.userId}),
       })
       .then(res => res.json())
       .then(
         (result) => {
           if(result.status){
            Toast.show({
              type:'success',
              text1: 'Coupon Applied',
              visibilityTime: 1000,
            })
             this.setState({couponCode:result.couponCode,couponLoading:false,couponApplied:true});
             this.totalAmount();
           }
           else{
            this.setState({couponLoading:false,couponTextError:'Invalid Coupon'})
             this.displayCart();
           }
         })
         .catch((error)=>Toast.show({
          type:'error',
          text1: 'Something went wrong try again later',
        }))
      }
    }

    removeCoupon(){
      this.setState({couponLoading:true});
      fetch(GLOBAL.BASE_URL+"coupon/removeCoupon/",{
        method:"POST",
        body:JSON.stringify({totalAmount:this.state.totalAmount,userid:this.state.userId}),
     })
     .then(res => res.json())
     .then(
       (result) => {
         if(result.status){
           this.setState({couponLoading:false,couponApplied:false,couponText:''});
           this.totalAmount();
           Toast.show({
            type:'error',
            text1: 'Coupon Removed',
            visibilityTime: 1000,
          })
         }
         else{
          Toast.show({
            type:'error',
            text1: 'Something went wrong',
            visibilityTime: 1000,
          })
          this.setState({couponLoading:false});
         }
        })
    }

  //diplaying the cartitems 
  displayCart(){
    return(
      <View style={{flex:1}}>
         {this.state.loading?<View style={styles.loader}><ActivityIndicator size="large" color="#0000ff" /></View>:(this.state.allProducts.length)?
          <FlatList
          data={this.state.allProducts}
          keyExtractor={(item)=>item.id}
          renderItem={({item})=>(
              <View  style={styles.displayViewbox} >
                <View >
                  <Image
                    style={styles.itemLink}
                    source={{uri: item.Link}}/>
                 </View>
                 <View >
                    <Text style={styles.cardText}>{item.Name}</Text>
                    <Text style={styles.priceText}>PRICE: ₹ {item.Price}</Text>
                      <TouchableOpacity style={{paddingTop:15}} onPress={()=>{this.removeItem(item.productId)}}>
                        <Ionicons name="md-remove-circle" size={22} style={{paddingLeft:20}} color="red" />
                      </TouchableOpacity>
                  </View>
                    <View style={styles.Quantity}>
                       {this.state.incrementLoading?<View style={{flexDirection:'row'}}><AntDesign name="minussquareo" color={"grey"} size={22} >  <Text>{item.Quantity}</Text>  </AntDesign><AntDesign name="plussquareo" size={22} color={"grey"}></AntDesign></View>: <View style={{flexDirection:'row'}}><AntDesign name="minussquareo" color={"black"} size={22}  onPress={()=>{(item.Quantity<2)?this.removeItem(item.productId):this.decrement(item.productId)}} >  <Text>{item.Quantity}</Text>  </AntDesign><AntDesign name="plussquareo" size={22} onPress={()=>{this.increment(item.productId)}}></AntDesign></View>}
                    </View>
              </View>
          )}
          />
          :<View style={styles.noitemView}>
              <Image
                style={styles.noitemImage}
                 source={{uri:"data:image/png;base64,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"}} />
           </View>
        }
      {//to check the length of added items to decide whether to display totalAmount
       (this.state.allProducts.length)?
            <View>
              <View style={{marginTop:10,marginBottom:20}}>
                <Text style={{marginLeft:10}}>Have a coupon code?</Text>
               <View style={{flexDirection:'row',marginLeft:10}}>
                  <TextInput
                        style={{  borderColor:' gray', borderWidth: 1,width:'70%' }}
                        onChangeText={text => this.onChangeCouponText (text)}
                        value={this.state.couponText}
                        placeholder='Enter the code'
                    />
                <View style={{alignItems:'center',width:'30%',justifyContent:'center'}}>
              {(!this.state.couponApplied)?
               <TouchableOpacity onPress={()=>this.checkCoupon()}><Text style={{backgroundColor:'orange',color:'white',padding:10,borderRadius:12}}>Apply</Text></TouchableOpacity>:
               <TouchableOpacity onPress={()=>this.removeCoupon()}><Text style={{backgroundColor:'red',color:'white',padding:10,borderRadius:12}}>Remove</Text></TouchableOpacity>}
                </View>
                </View>
                <View>
                <Text style={{marginLeft:10,color:'red'}}>{this.state.couponTextError}</Text>
                </View>
                </View>
              {(this.state.allCoupons.length!==0)?this.state.allCoupons.map((data,i)=>{
                   return(
                      <View style={{marginBottom:20}} key={i}>
                       <Text style={{fontSize:20,fontWeight:'bold'}}>Offers</Text>
                      <View style={{flexDirection:'row'}}><Text>{data.couponCode}</Text>
                        <Text style={{paddingLeft:30}}>{data.discountPercentage}</Text>
                      </View>
                    </View>
                    )
              }):null}  
              <View style={styles.totalView}>
                <Text style={styles.totalAmount}>TotalAmount  </Text>{(this.state.couponLoading)?<ActivityIndicator style={styles.amount} size="large" color="#0000ff" />:<Text style={styles.amount}> ₹ {this.state.totalAmount} </Text>}
              </View>
            </View>
        :null}
        </View>
    )
  }

validateAddress(){
  if(this.state.addressLine1==='' ||this.state.pincode==='' || this.state.pincode.length!==6 || this.state.city==='' || this.state.mobile=== '' || this.state.mobile.length!==10){
    this.setState({proceedToPay:false})
  }
  else{
    this.setState({proceedToPay:true});
  }
}

onChangeText(value){
  this.setState({feedbackText:value});
}

ratingCompleted(value) {
  rating=value;
}


async updateFeedback(){
  fetch(GLOBAL.BASE_URL+"feedback/addOrderFeedback/",{
      method:"POST",
      headers:{
        'Content-Type':'application/json'
      },
      body:JSON.stringify({orderId:this.state.orderId,userid:this.state.userId,rating:rating,feedbackText:this.state.feedbackText}),
      })
      .then(res => res.json())
      .then(
        (result) => {
        if(result.status){
        this.setState({feedbackUpdated:true});
        setInterval(()=>{this.setState({isModalVisible:false})},2000);
  }
  })
  }

  shippingAddressScreen(){
    return(
      <View style={{ alignItems: 'center' }}>
                <Input
                placeholder='Address Line 1'
                errorStyle={{ color: 'red' }}
                errorMessage=''
                onChangeText={value=>{this.setState({addressLine1:value},()=>{this.validateAddress()})}}
              />
              <Input
                placeholder='Pincode'
                errorStyle={{ color: 'red' }}
                errorMessage=''
                onChangeText={value=>this.setState({pincode:value},()=>{this.validateAddress()})}
              />
              <Input
                placeholder='City'
                errorStyle={{ color: 'red' }}
                errorMessage=''
                onChangeText={(value)=>{this.setState({city:value},()=>this.validateAddress())}}
              />
                <Input
                placeholder='State'
                errorStyle={{ color: 'red' }}
                errorMessage=''
                onChangeText={(value)=>{this.setState({state:value},()=>this.validateAddress())}}
              />
              <CountryPicker
            onSelect={(value)=>{this.setState({country:value.name,mobile:value.callingCode.toString()})}}
              />
              <Input
                placeholder='Country'
                errorStyle={{ color: 'red' }}
                errorMessage=''
                value={this.state.country}
                onChangeText={(value)=>this.setState({country:value})}
              />
              <Input
                placeholder='Mobile Number'
                errorStyle={{ color: 'red' }}
                errorMessage=''
                value={this.state.mobile}
                keyboardType={'number-pad'}
                onChangeText={(value)=>{this.setState({mobile:value},()=>this.validateAddress())}}
              />
            </View>
    )
  }

  paymentMode(){
    return(
      <View style={{alignItems:'center',alignContent:'center'}}>
      <Text >Payment Method</Text>
    <CheckBox
    center
    title='Cash On Delivery'
    checkedIcon='dot-circle-o'
    uncheckedIcon='circle-o'
    checked={this.state.cashClicked}
    onPress={()=>{this.setState({cashClicked:true,onlinePaymentClicked:false})}}
    />
    <CheckBox
    center
    title='Online Payment'
    checkedIcon='dot-circle-o'
    uncheckedIcon='circle-o'
    checked={this.state.onlinePaymentClicked}
    onPress={()=>{this.setState({cashClicked:false,onlinePaymentClicked:true})}}
    />
    </View>
    )
  }

      render(){        
          return(
            <View style={{flex:1,backgroundColor:'white'}}>
              <HomeHeading navigation={this.props.navigation}/>  
              <Toast ref={(ref) => Toast.setRef(ref)} /> 
              {this.state.orderPlacedLoader?<ActivityIndicator />:<ProgressSteps>
                <ProgressStep label="Checkout" style={{marginBottom:10}} nextBtnDisabled={(this.state.allProducts)?false:true} nextBtnText={'Checkout'} nextBtnTextStyle={{backgroundColor:'green',alignItems:'center',color:'white',padding:10,borderRadius:12}}>
                  <View style={{ alignItems: 'center'}}>
                  {this.displayCart()}
                  </View>
                </ProgressStep>
             <ProgressStep label="Shipping Address"  nextBtnText={'Proceed To Pay'} nextBtnDisabled={(this.state.proceedToPay)?false:true} nextBtnTextStyle={{backgroundColor:'green',color:'white',padding:10,borderRadius:12}} previousBtnText={'Go Back'} previousBtnTextStyle={{backgroundColor:'red',color:'white',padding:10,borderRadius:12}}>
               {this.shippingAddressScreen()}
          </ProgressStep>
          <ProgressStep label="Payment" onSubmit={()=>this.orderplaced()} nextBtnTextStyle={{backgroundColor:'green',color:'white',padding:10,borderRadius:12}} finishBtnText={'Place Order'} finishBtnTextStyle={{backgroundColor:'green',color:'white',padding:10,borderRadius:12}} previousBtnText={' Address'} previousBtnTextStyle={{backgroundColor:'red',color:'white',padding:10,borderRadius:12}}>
              {this.paymentMode()}
          </ProgressStep>
        </ProgressSteps>
      }
        {/*Overlay after order placed to get the feedback*/}
          <Overlay isVisible={this.state.isModalVisible} >
              <View style={{margin:30,alignItems:'center'}}>
                  <Image
                      style={styles.modalImage}
                      source={{uri:"https://graphicriver.img.customer.envatousercontent.com/files/270440720/CartoonDogPointer%20p.jpg?auto=compress%2Cformat&q=80&fit=crop&crop=top&max-h=8000&max-w=590&s=d7ccf47eef9f9a8f679c134cc70bffa5"}} />
                  <Text style={{fontSize:20}}>Order Placed !</Text>
                  <Text style={{fontSize:20}}>Order Id: {this.state.orderId}</Text> 
                {(this.state.feedbackUpdated)?<View><Text>Thanks for the Feedback</Text>
                  <Button title='OK' onPress={()=>this.props.navigation.navigate('ProductsPage')} />
              </View>:
                  <View>
                    <Text>Give your rating</Text>
                 <AirbnbRating
                        count={5}
                        reviews={["Very Bad","Bad","Good","Very Good","Awesome"]}
                        onFinishRating={this.ratingCompleted}
                        style={{ paddingVertical: 10 }}
                        defaultRating={5}
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
               }
                 </View>
              </Overlay>  
            </View>
          )
        }
}

  const styles = StyleSheet.create({
   modalImage:
   {
     width: 150,
    height: 158
  },
  inputs:{
    height:45,
    marginLeft:16,
    borderBottomColor: 'black',
  },
     cartBox:{
        width:10,
        height:70,
    },
    itemLink:{
      marginTop:10,
      width: 110,
      height: 98
    },
    checkout:{
      fontSize:20,
      marginTop:10,
      color:'white'
    },
    noitemView:{
      flex:1,
      backgroundColor: GLOBAL.Styling.Colors.noItemViewBackground,
      alignItems:'center'
    },
    noitemImage:{
      width: 200,
      height: 158,
      marginTop:200
    },
    modalView:{
      alignItems:'center',
    flex: 1,
    marginTop:150,
    marginLeft:10,
    backgroundColor: GLOBAL.Styling.Colors.modalViewBackground,
    height:'50%',
    marginBottom:200,
    width:300
  },
  Quantity:{
    paddingLeft:280,
    paddingTop:50,
    flexDirection:'row',
    position:'absolute'
  },
    Col:{
     height:140,width:30
    },
    totalView:{
      height:70,
      flexDirection:'row',
      backgroundColor:GLOBAL.Styling.Colors.totalViewBackground
    },
    checkoutView:{
      height:50,
      backgroundColor: GLOBAL.Styling.Colors.checkoutViewBackground,
      alignItems:'center'
    },
    cardText:{
      fontSize:18,
      fontWeight:'bold'
    },
    priceText:{
      fontSize:13,
      paddingTop:8
    },
    totalAmount:{
      fontWeight:'bold',
      fontSize:17,
      marginTop:15,
      marginLeft:15,
      alignContent:'center'
    },
    amount:{
      fontWeight:'bold',
      fontSize:17,
      marginTop:15,
      marginLeft:180,
    },
    displayViewbox:{
        flexDirection:'row',
        height:120,
        marginTop:10,
        backgroundColor:'white',
        borderWidth:1,
        borderColor: '#ddd'
    },
    loader:{
      paddingTop:250
    }
  });
  