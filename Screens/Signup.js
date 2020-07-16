import React, { Component } from 'react';
import {
  StyleSheet,
  Text,
  View,
  TextInput,
  TouchableHighlight,
  ActivityIndicator
} from 'react-native';
import { 
  AccessToken,
  LoginManager,
  GraphRequest,
  GraphRequestManager
} from 'react-native-fbsdk';
import  MaterialIcons  from 'react-native-vector-icons/MaterialIcons';
import  Entypo  from 'react-native-vector-icons/Entypo';
import { SocialIcon } from 'react-native-elements'
import  EvilIcons  from 'react-native-vector-icons/EvilIcons';
import AsyncStorage from '@react-native-community/async-storage';
import Toast from 'react-native-toast-message'
import { CommonActions } from '@react-navigation/native';
import { GoogleSignin,statusCodes } from 'react-native-google-signin';
const GLOBAL = require('../Global');

export default class Signupscreen extends Component {
  constructor(props) {
    super(props);
    this.state = {
      email   : '',
      password: '',
      username:'',
      number:'',
      visible:false
    }
  }

  componentDidMount(){
      //Google sign in configuration
      GoogleSignin.configure({
        scopes: ['https://www.googleapis.com/auth/drive.readonly'], 
        webClientId: '417002452476-2aq71gas67ft6veq2tpp1l7r46ouu43q.apps.googleusercontent.com',
        offlineAccess: true,
        hostedDomain: '',
        loginHint: '', 
        forceConsentPrompt: true, 
        accountName: '', 
       // iosClientId: '<FROM DEVELOPER CONSOLE>', // [iOS] optional, if you want to specify the client ID of type iOS (otherwise, it is taken from GoogleService-Info.plist)
      });
  }

  onClickListener = (viewId) => {
    let emailRegEx = /^[a-zA-Z0-9]+@[a-zA-Z0-9]+\.[A-Za-z]+$/;
    if(this.state.email === '' || this.state.password === '' || this.state.number==='') {
        alert('Credentials cannot be empty');
    } else if(!emailRegEx.test(this.state.email)) {
        alert('Please enter a valid Email Address');
    } else if(this.state.password.length < 4) {
        alert('Password must contain atleast 4 characters');
    }
    else if(this.state.number.length < 10) {
      alert('Enter a valid mobile number');
  } else {
    //signup with otp 
     this.setState({ visible: true }, () => {
       fetch(GLOBAL.BASE_URL+"users/signup/",{
      method:"POST",
      body:JSON.stringify({email:this.state.email,password:this.state.password,name:this.state.username,number:this.state.number}),
      })
      .then(res => res.json())
      .then(
      async(result) => {
        if(result.message==="Success"){
          this.setState({visible: false});
          AsyncStorage.setItem("email",result.email);
          AsyncStorage.setItem("secret",result.secret);
          AsyncStorage.setItem("name",result.username);
          Toast.show({
            type:'success',
            text1: 'OTP sent to your mobile number',
          })
          this.props.navigation.navigate('Verify');
        }
        else if("Exists"){
          alert("Email Already exists");
          this.setState({visible:false})
        }
        })
        .catch((error)=> Toast.show({
              type:'error',
              text1: 'Something went wrong try again later',
            }))
       })
          }
  };

 
  fbLogin() {
    LoginManager.logInWithPermissions(['public_profile','email']).then((result) => {
      if (result.error) {
          console.log('Error: ', result.error);
      } else {
          if (result.isCancelled) {
              console.log('Login is cancelled');
          } else {
            AccessToken.getCurrentAccessToken().then(data => {
              const { accessToken } = data;
              let graphRequest = new GraphRequest('/me?fields=name,email', {
                  accessToken,
              }, (error, result) => {
                this.setState({ visible: true }, () => {
                  fetch(GLOBAL.BASE_URL+"users/fbLogin/",{
                 method:"POST",
                 body:JSON.stringify({email:result.email,id:result.id,name:result.name}),
                 })
                 .then(res => res.json())
                 .then(
                 async(result) => {
                   if(result.message==='PasswordSet'){
                  this.setState({visible: false});
                  AsyncStorage.setItem("userid",result.userid.toString());
                 AsyncStorage.setItem("token",result.token);
                 AsyncStorage.setItem("name",result.username);
                 this.props.navigation.dispatch( CommonActions.reset({
                   index: 0,
                 routes: [
                   { name: 'DrawerRoute' }]}));
                 }
                 else if(result.message==='PasswordNotSet'){
                  this.setState({visible: false});
                   this.props.navigation.navigate('SetPassword',{userid:result.userid});
                 }
                 })
                 .catch((error)=> Toast.show({
                  type:'error',
                  text1: 'Something went wrong try again later',
                }))})
              });
              const graphRequestManager = new GraphRequestManager();
              graphRequestManager.addRequest(graphRequest).start();
          });
          }
      }
  })
  }
  
  async googleLogin(){
  
    try {
      await GoogleSignin.hasPlayServices();
      const userInfo = await GoogleSignin.signIn();
      this.setState({ visible: true }, () => {
        fetch(GLOBAL.BASE_URL+"users/fbLogin/",{
       method:"POST",
       body:JSON.stringify({email:userInfo['user'].email,id:userInfo['user'].id,name:userInfo['user'].name}),
       })
       .then(res => res.json())
       .then(
       async(result) => {
        if(result.message==='PasswordSet'){
          this.setState({visible: false});
          AsyncStorage.setItem("userid",result.userid.toString());
         AsyncStorage.setItem("token",result.token);
         AsyncStorage.setItem("name",result.username);
         this.props.navigation.dispatch( CommonActions.reset({
           index: 0,
         routes: [
           { name: 'DrawerRoute' }]}));
         }
         else if(result.message==='PasswordNotSet'){
          this.setState({visible: false});
           this.props.navigation.navigate('SetPassword',{userid:result.userid});
         }
       })
      })
      
    } catch (error) {
      Toast.show({
        type:'error',
        text1: 'Something went wrong',
      })
      if (error.code === statusCodes.SIGN_IN_CANCELLED) {
      } else if (error.code === statusCodes.IN_PROGRESS) {
        // operation (f.e. sign in) is in progress already
      } else if (error.code === statusCodes.PLAY_SERVICES_NOT_AVAILABLE) {
        // play services not available or outdated
      } else {
        // some other error happened
      }
    }
}

  render() {
    return (
      <View style={styles.container}>
          <Toast ref={(ref) => Toast.setRef(ref)} />
        <View style={styles.inputContainer}>
        <EvilIcons name="user" size={32} style={{paddingLeft:20}} color="black" />
          <TextInput style={styles.inputs}
              placeholder="UserName"
              onChangeText={(username) => this.setState({username})}/>
        </View>
        <View style={styles.inputContainer}>
        <MaterialIcons name="email" size={32} style={{paddingLeft:20}} color="black" />
          <TextInput style={styles.inputs}
              placeholder="Email"
              keyboardType="email-address"
              underlineColorAndroid='transparent'
              onChangeText={(email) => this.setState({email})}/>
        </View>
        <View style={styles.inputContainer}>
        <MaterialIcons name="phone" size={32} style={{paddingLeft:20}} color="black" />
          <TextInput style={styles.inputs}
              placeholder="Phone Number"
              keyboardType="number"
              underlineColorAndroid='transparent'
              onChangeText={(number) => this.setState({number})}/>
        </View>
        <View style={styles.inputContainer}>
        <Entypo name="key" size={32} style={{paddingLeft:20}} color="black" />
          <TextInput style={styles.inputs}
              placeholder="Password"
              secureTextEntry={true}
              onChangeText={(password) => this.setState({password})}/>
        </View>
        <TouchableHighlight style={[styles.buttonContainer, styles.loginButton]} onPress={() => this.onClickListener('login')}>
          <Text style={styles.loginText}>Signup</Text>
        </TouchableHighlight>
        <SocialIcon
          title='Sign In With Facebook'
          button
         type='facebook'
         onPress={()=>this.fbLogin()}/>
          <SocialIcon
          title='Sign In With Google'
          button
         type='google'
         onPress={()=>this.googleLogin()}/>
         {this.state.visible?<View style={styles.loader}>
                <ActivityIndicator size="large" color="#0000ff"/>
              </View>:null}
        <View style={{flexDirection:'row'}}>
        <Text>Already a Customer ?</Text>
        <TouchableHighlight  onPress={() => this.props.navigation.navigate('Login')}>
          <Text style={{color:'red'}}>  Login</Text>
        </TouchableHighlight>
        </View>
      </View>
    );
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: GLOBAL.Styling.Colors.containerBackground,
  },
  inputContainer: {
      borderBottomColor: GLOBAL.Styling.Colors.inputContainerBorder,
      backgroundColor: GLOBAL.Styling.Colors.inputContainerBackground,
      borderRadius:30,
      borderBottomWidth: 1,
      width:250,
      height:45,
      marginBottom:20,
      flexDirection: 'row',
      alignItems:'center'
  },
  inputs:{
      height:45,
      marginLeft:16,
      borderBottomColor: GLOBAL.Styling.Colors.textInputBorder,
      flex:1,
  },
  inputIcon:{
    width:30,
    height:30,
    marginLeft:15,
    justifyContent: 'center'
  },
  buttonContainer: {
    height:45,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom:20,
    width:250,
    borderRadius:30,
  },
  loginButton: {
    backgroundColor: GLOBAL.Styling.Colors.buttonBackground,
  },
  loginText: {
    color: GLOBAL.Styling.Colors.buttonText,
  }
});
