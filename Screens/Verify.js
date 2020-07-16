import React, { Component } from 'react';
import {
  StyleSheet,
  Text,
  View,
} from 'react-native';
import AsyncStorage from '@react-native-community/async-storage';
import OTPInputView from '@twotalltotems/react-native-otp-input'
import { CommonActions } from '@react-navigation/native';
const GLOBAL = require('../Global');

export default class Verify extends Component {
  state={
    seconds:30,
    valid:false
  }

  componentDidMount(){
    setInterval(() => {
      this.setState({seconds:this.state.seconds-1});
    }, 1000);
  }

    async verfiyOtp(code){
        fetch(GLOBAL.BASE_URL+"users/confirmation/",{
            method:"POST",
            body:JSON.stringify({code:code,email:await AsyncStorage.getItem("email"),secret:await AsyncStorage.getItem("secret")}),
            })
            .then(res => res.json())
            .then(
            async(result) => {
                if(result.status){
                  this.setState({valid:true})
                  AsyncStorage.setItem("userid",result.userid.toString());
                  AsyncStorage.setItem("token",result.token);
                  this.props.navigation.dispatch( CommonActions.reset({
                    index: 0,
                    routes: [
                    { name: 'Home' 
                  }]}));
                }
                else{
                  alert("Invalid OTP");
                }  
            })
    }

render(){
    if(this.state.seconds===0&&this.state.valid===false){
      alert('Time expired retry');
      this.props.navigation.navigate('Signup')
    }

    return(
    <View style={{flex:1,alignItems:'center'}}>
      <OTPInputView
      style={{width: '80%', height: 200}}
      pinCount={6}
      codeInputFieldStyle={styles.underlineStyleBase}
      codeInputHighlightStyle={styles.underlineStyleHighLighted}
      onCodeFilled = {(code => {
      this.verfiyOtp(code)
      })}
      />
      <Text>00:{this.state.seconds}</Text>
    </View>
    )
}
}

const styles = StyleSheet.create({
    borderStyleBase: {
      width: 30,
      height: 45
    },
    borderStyleHighLighted: {
      borderColor: "#03DAC6",
    },
    underlineStyleBase: {
      width: 30,
      height: 45,
      borderWidth: 0,
      borderBottomWidth: 1,
      color:'black'
    },
    underlineStyleHighLighted: {
      borderColor: "#03DAC6",
    },
  });