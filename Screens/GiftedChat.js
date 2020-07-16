import React from 'react'
import { ActivityIndicator } from 'react-native'
import AsyncStorage from '@react-native-community/async-storage';
import ChatBox from 'react-native-simple-chatbot'
import images from '../images';
const GLOBAL = require('../Global');
export default class chat extends React.Component {
    constructor(props) {
        super(props);
        this.state={
            userData:[],
            loader:true
        }
    }

    async componentDidMount(){
        fetch(GLOBAL.BASE_URL+"users/getProfileDetails/",{
            method:"POST",
            body:JSON.stringify({userid:await AsyncStorage.getItem('userid')}),
            })
            .then(res => res.json())
            .then(
            async(result) => {
                if(result.status){
                    this.setState({userData:result['data'],loader:false});
                }}
                )
    }
 
  render() {
    return (
        this.state.loader?<ActivityIndicator color="green" />:
         <ChatBox
        ChatBotID="ChatBot ID"
        ref="ChatBot"
        questions={
            [
                {
                    "id": "1",
                    "message": "Hello "+this.state.userData.name,
                    "user": "false",
                    "options": [],
                    "slider": [],
                    "custom": "false",
                    "customid": "",
                    "trigger": "2",
                    "end": "false"
                },
                {
                    "id": "2",
                    "message": "",
                    "user": "true",
                    "options": [],
                    "slider": [],
                    "custom": "false",
                    "customid": "",
                    "trigger": "3",
                    "end": "false"
                },
                {
                    "id": "3",
                    "message": "Do u Have an issue?",
                    "user": "false",
                    "options": [],
                    "slider": [],
                    "custom": "false",
                    "customid": "",
                    "trigger": "4",
                    "end": "false"
                },
                {
                    "id": "4",
                    "message": "",
                    "user": "true",
                    "multipleOptionsSelect": "false",
                    "options": [
                        {"value": "Yes", "trigger": "5","imageU": "", "imageS": ""},
                        {"value": "No", "trigger": "4","imageU": "", "imageS": ""}
                    ],
                    "slider": [],
                    "custom": "false",
                    "customid": "",
                    "trigger": "",
                    "end": "false"
                },
                {
                    "id": "5",
                    "message": "OK ",
                    "user": "false",
                    "options": [],
                    "slider": [],
                    "custom": "false",
                    "customid": "",
                    "trigger": "6",
                    "end": "false"
                },
                {
                    "id": "6",
                    "message": "",
                    "user": "true",
                    "multipleOptionsSelect": "false",
                    "options": [
                        {"value": "Yes", "trigger": "7","imageU": "", "imageS": ""},
                        {"value": "No", "trigger": "8","imageU": "", "imageS": ""}
                    ],
                    "slider": [],
                    "trigger": "",
                    "end": "false"
                },
                {
                    "id": "7",
                    "message": "Good day",
                    "user": "false",
                    "options": [],
                    "slider": [],
                    "trigger": "7",
                    "end": "true"
                },
                {
                    "id": "8",
                    "message": "Good day",
                    "user": "false",
                    "options": [],
                    "slider": [],
                    "trigger": "7",
                    "end": "true"
                },
               
            ]
                
        } 
        chatHeader={(new Date()).toDateString()}
        onChatEndCallback={()=>console.log('End')}
        userIcon={images.UserIcon}
        cpuIcon={images.CPUIcon}
        imagesArray={images}
    />
    )
  }
}