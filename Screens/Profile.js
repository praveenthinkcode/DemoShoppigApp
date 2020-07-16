import React, { Component } from 'react';
import {
  StyleSheet,
  Text,
  View,
  TextInput,
  ActivityIndicator,
  Image,
} from 'react-native';
import  AntDesign  from 'react-native-vector-icons/AntDesign';
import AsyncStorage from '@react-native-community/async-storage';
import Homeheading from "../components/homeHeading.js";
import Toast from 'react-native-toast-message'
const GLOBAL = require('../Global');

export default class Profile extends Component {
    state={
       userData:[],
        loading:false,
        editUsername:false,
        editPassWord:false,
        newUsername:'',
        newPassword:'',
        oldPassword:''
    }

    async componentDidMount(){
        this.setState({ loading: true });
            fetch(GLOBAL.BASE_URL+"users/getProfileDetails/",{
           method:"POST",
           body:JSON.stringify({userid:await AsyncStorage.getItem('userid')}),
           })
           .then(res => res.json())
           .then(
           (result) => {
               if(result.status){
                   this.setState({userData:result['data'],loading:false});
               }
            else{
                Toast.show({
                    type:'error',
                    text1: 'Error getting user details',
                    visibilityTime: 3000,
                  })
            }})
            
    }

    validatePassword(){
        if(this.state.newPassword.length < 4) {
            this.setState({passwordError:'Password should contain atleast 4 letters'});
            return true;
        }
        else if(this.state.newPassword!== this.state.oldPassword){
            this.setState({passwordError:'Passwords does not match'})
            return true;
        }
    }

    async editUsernamee(){
        this.setState({ loading: true });
            fetch(GLOBAL.BASE_URL+"users/editProfile/",{
           method:"POST",
           body:JSON.stringify({userid:await AsyncStorage.getItem('userid'),newUserName:this.state.newUsername}),
           })
           .then(res => res.json())
           .then(
           async(result) => {
            if(result.message==='Success'){
                this.setState({loading:false,userData:result.userDetails[0],editUsername:true});
                this.userDetails();
               }
               else{
                this.setState({loading:false});
               }
           })
           .catch((error)=>Toast.show({
            type:'error',
            text1: 'Something went wrong try again later',
          }))
    }
    
    async editPassWord(){
        this.setState({ loading: true });
        fetch(GLOBAL.BASE_URL+"users/editProfile/",{
           method:"POST",
           body:JSON.stringify({userid:await AsyncStorage.getItem('userid'),oldPassword:this.state.oldPassword,newPassword:this.state.newPassword}),
           })
           .then(res => res.json())
           .then(
           async(result) => {
               if(result.message==='Success'){
                this.setState({loading:false,userData:result.userDetails[0],editPassWord:false});
               }
               else{
                this.setState({loading:false});
               }
           })
           .catch((error)=>Toast.show({
            type:'error',
            text1: 'Something went wrong try again later',
          }))
    }

    userDetails(){
        return(
        <View style={{marginTop:20}}>
              <View style={{alignItems:'center'}}>
                       <Image source={require('../person.png')} style={{width:100,height:100}}/>   
                           <View style={{flexDirection:'row'}}>
                               <Text>Username:{this.state.userData['name']}</Text>  
                               <Text style={{color:'red',marginLeft:10}} onPress={()=>this.setState({editUsername:true})}>Edit</Text>
                               </View>
                            <View style={{flexDirection:'row'}}>
                               <Text>Email:{this.state.userData['email']}</Text>  
                            </View>
                            <View style={{flexDirection:'row'}}>
                               <Text style={{color:'red',marginLeft:10}} onPress={()=>this.setState({editPassWord:true})}>Edit Password</Text>  
                            </View>
                             </View>

                             {this.state.editUsername?
                                 <View  style={{flexDirection:'row'}}>
                                 <TextInput style={styles.inputs}
                                 placeholder="New Username"
                                 keyboardDismissMode="on-drag"
                                 underlineColorAndroid='transparent' 
                                 onChangeText={(Text)=>{this.setState({newUsername:Text})}}/>
                                   <AntDesign  name="rightcircle" color='red' size={18} onPress={()=>this.editUsernamee()} />
                             </View>:null    
                            }
                            {this.state.editPassWord?
                         <View>
                            <TextInput placeholder='Old Password' 
                            keyboardDismissMode="on-drag"
                            underlineColorAndroid='transparent' 
                            onChangeText={(Text)=>{this.setState({oldPassword:Text})}}/>
                            <TextInput placeholder='New Password' 
                            keyboardDismissMode="on-drag"
                            underlineColorAndroid='transparent' 
                            onChangeText={(Text)=>{this.setState({newPassword:Text})}}
                         />
                        <AntDesign  name="rightcircle" color='red' size={18} onPress={()=>{this.editPassWord()}} />
                    </View>:null    
                    } 
                  </View>
        )
    }

    render(){
        return(
            <View style={styles.container}>
                 <Homeheading navigation={this.props.navigation}/>
                 <Toast ref={(ref) => Toast.setRef(ref)} />
                 {this.state.loading?<ActivityIndicator size="large" color="#0000ff" />:
                  this.userDetails()}
            </View>
        )
    }
}

const styles = StyleSheet.create({
  container:{
      flex:1,
      alignItems:'center'
  },
});