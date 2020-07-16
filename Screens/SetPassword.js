import React, { Component } from 'react';
import {
  StyleSheet,
  Text,
  View,
  TextInput,
  TouchableHighlight,
  ActivityIndicator,
} from 'react-native';
import  Entypo  from 'react-native-vector-icons/Entypo';
import AsyncStorage from '@react-native-community/async-storage';
import { CommonActions } from '@react-navigation/native';
const GLOBAL = require('../Global');

export default class SetPassword extends Component {
    state={
        password:'',
        confirmPassword:'',
        passwordError:'',
        loading:false
    }

    validatePassword(){
        if(this.state.password.length < 4) {
            this.setState({passwordError:'Password should contain atleast 4 letters'});
            return true;
        }
        else if(this.state.password!== this.state.confirmPassword){
            this.setState({passwordError:'Passwords does not match'})
            return true;
        }
    }

    login(){
        if(!this.validatePassword()){
            this.setState({ loading: true }, () => {
                fetch(GLOBAL.BASE_URL+"users/setPassword/",{
               method:"POST",
               body:JSON.stringify({userid:this.props.route.params.userid,password:this.state.password}),
               })
               .then(res => res.json())
               .then(
               async(result) => {
                   if(result.status){
                    AsyncStorage.setItem("userid",result.userid);
                    AsyncStorage.setItem("token",result.token);
                    AsyncStorage.setItem("name",result.username);
                    this.props.navigation.dispatch( CommonActions.reset({
                        index: 0,
                      routes: [
                        { name: 'Home' }]}));
                   }
                   else{
                     alert('Something went wrong try again')
                   }
                })
                .catch((error)=>Toast.show({
                  type:'error',
                  text1: 'Something went wrong try again later',
                }))
            })
        }
    }

    render(){
      console.log(this.props.route.params.userid)
        return(
            <View style={styles.container}>
            <View style={styles.inputContainer}>
            <Entypo name="key" size={32} style={{paddingLeft:20}} color="black" />
              <TextInput style={styles.inputs}
                  placeholder="Password"
                  secureTextEntry={true}
                  underlineColorAndroid='transparent'
                  onChangeText={(password) => this.setState({password})}/>
            </View>
            <Text style={{color:'red'}}>{this.state.passwordError}</Text>
            <View style={styles.inputContainer}>
            <Entypo name="key" size={32} style={{paddingLeft:20}} color="black" />
              <TextInput style={styles.inputs}
                  placeholder="Confirm Password"
                  secureTextEntry={true}
                  onChangeText={(confirmPassword) => this.setState({confirmPassword})}/>
            </View>
            <TouchableHighlight style={[styles.buttonContainer, styles.loginButton]} onPress={() => this.login()}>
              <Text style={styles.loginText}>Login</Text>
            </TouchableHighlight>
            {this.state.loading?<ActivityIndicator size="large" color="#0000ff" />:null}
            </View>
        )
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
          marginBottom:10,
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
      },
});