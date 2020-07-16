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
  GraphRequestManager,
} from 'react-native-fbsdk';
import Icon  from 'react-native-vector-icons/MaterialIcons';
import  Entypo  from 'react-native-vector-icons/Entypo';
import AsyncStorage from '@react-native-community/async-storage';
import { CommonActions } from '@react-navigation/native';
import { SocialIcon } from 'react-native-elements'
import Toast from 'react-native-toast-message'
const GLOBAL = require('../Global');
import { GoogleSignin,statusCodes } from 'react-native-google-signin';

export default class Loginscreen extends Component {
  
  constructor(props) {
    super(props);
    this.state = {
      email   : '',
      password: '',
      loading:false
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

  //validation
  onClickListener = async() => {
    let emailRegEx = /^[a-zA-Z0-9]+@[a-zA-Z0-9]+\.[A-Za-z]+$/;
    if(this.state.email === '' || this.state.password === '') {
        alert('Credentials cannot be empty');
    } else if(!emailRegEx.test(this.state.email)) {
        alert('Please enter a valid Email Address');
    } else if(this.state.password.length < 4) {
        alert('Password must contain atleast 4 characters');
    } else {
     this.setState({ loading: true });
      fetch(GLOBAL.BASE_URL+"users/login/",{
      method:"POST",
      body:JSON.stringify({email:this.state.email,password:this.state.password}),
      })
      .then(res => res.json())
      .then(
      async(result) => {
          if(result.message==="Success"){
            this.setState({loading: false});
             AsyncStorage.setItem("userid",result.userid.toString());
             AsyncStorage.setItem("token",result.token);
             AsyncStorage.setItem("name",result.username);
            this.props.navigation.dispatch( CommonActions.reset({
              index: 0,
            routes: [
              { name: 'DrawerRoute' }]}));
          }
          else{
            Toast.show({
                type:'error',
                text1: 'Invalid email and password',
              })
            this.setState({loading:false});
          }
          })
          .catch((error)=> Toast.show({
            type:'error',
            text1: 'Something went wrong try again later',
          }))
          }
    }

  //googlelogin function
  async googleLogin(){
    
      try {
        await GoogleSignin.hasPlayServices();
        const userInfo = await GoogleSignin.signIn();
        this.setState({ loading: true });
        fetch(GLOBAL.BASE_URL+"users/fbLogin/",{
         method:"POST",
         body:JSON.stringify({email:userInfo['user'].email,id:userInfo['user'].id,name:userInfo['user'].name}),
         })
         .then(res => res.json())
         .then(
         async(result) => {
           console.log('pa')
           console.log(result)
          if(result.message==='PasswordSet'){
            AsyncStorage.setItem("userid",result.userid);
            AsyncStorage.setItem("token",result.token);
            AsyncStorage.setItem("name",result.username);
            this.setState({loading: false},()=> this.props.navigation.dispatch( CommonActions.reset({
            index: 0,
            routes: [
              { name: 'DrawerRoute' }]})))
         }
         else if(result.message==='PasswordNotSet'){
          this.setState({loading: false});
          this.props.navigation.navigate('SetPassword',{userid:result.userid});
         }
          })
        
      } catch (error) {
        Toast.show({
          type:'error',
          text1: 'Something went wrong try again later',
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

  
  //facebooklogin function
  fbLogin() {
    console.log('i')
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
                
               
                this.setState({ loading: true });
                  fetch(GLOBAL.BASE_URL+"users/fbLogin/",{
                 method:"POST",
                 body:JSON.stringify({email:result.email,id:result.id,name:result.name}),
                 })
                 .then(res => res.json())
                 .then(
                 async(result) => {
                if(result.message==='PasswordSet'){
                    AsyncStorage.setItem("userid",result.userid);
                    AsyncStorage.setItem("token",result.token);
                    AsyncStorage.setItem("name",result.username);
                    this.setState({loading: false},()=> this.props.navigation.dispatch( CommonActions.reset({
                    index: 0,
                    routes: [
                      { name: 'DrawerRoute' }]})))
                 }
                 else if(result.message==='PasswordNotSet'){
                  this.setState({loading: false});
                  this.props.navigation.navigate('SetPassword',{userid:result.userid});
                 }
                 })
                 .catch((error)=> Toast.show({
                  type:'error',
                  text1: 'Something went wrong try again later',
                }))
              });
              const graphRequestManager = new GraphRequestManager();
              graphRequestManager.addRequest(graphRequest).start();
          });
          }
      }
    })
  }

  forgetPassword(){
      if(this.state.email===''){
        Toast.show({
          type:'error',
          text1: 'Enter a email id to reset',
        })
      }
      else{
        fetch(GLOBAL.BASE_URL+"users/resetPassword/",{
          method:"POST",
          body:JSON.stringify({email:this.state.email}),
          })
          .then(res => res.json())
          .then(
          (result) => {
            if(result.status){
              Toast.show({
                type:'success',
                text1: 'New password has been sent to your email',
              })
            }  
            else{
              Toast.show({
                type:'error',
                text1: 'Invalid email id',
              })
            }
          })
      }
  }

  render() {
    return (  
      <View style={styles.container}>
         <Toast ref={(ref) => Toast.setRef(ref)} />
        <View style={styles.inputContainer}>  
        <Icon name="email" size={32} style={{paddingLeft:20}} color="black" />
          <TextInput style={styles.inputs}
              placeholder="Email"
              keyboardType="email-address"
              underlineColorAndroid='transparent'
              onChangeText={(email) => this.setState({email})}/>
        </View>
        <View style={styles.inputContainer}>
        <Entypo name="key" size={32} style={{paddingLeft:20}} color="black" />
          <TextInput style={styles.inputs}
              placeholder="Password"
              secureTextEntry={true}
              onChangeText={(password) => this.setState({password})}/>
        </View>
        <TouchableHighlight style={[styles.buttonContainer, styles.loginButton]} onPress={() => this.onClickListener('login')}>
          <Text style={styles.loginText}>Login</Text>
        </TouchableHighlight>
        <TouchableHighlight  onPress={() => this.forgetPassword()}>
          <Text style={styles.loginText}>Forget Password?</Text>
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
         {this.state.loading?<ActivityIndicator size="large" color="#0000ff" />:null}
        <TouchableHighlight style={styles.buttonContainer} onPress={() => this.props.navigation.navigate('Signup')}>
            <Text>Register</Text>
        </TouchableHighlight>
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
    backgroundColor: "black",
  },
  loginText: {
    color: 'white',
  }
});
