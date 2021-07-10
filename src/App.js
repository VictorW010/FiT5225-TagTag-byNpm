// import logo from './logo.svg';
import './App.css';
import React from "react";
import Amplify, {API,Storage} from "aws-amplify";
import {AmplifyAuthenticator, AmplifySignOut, AmplifySignUp} from "@aws-amplify/ui-react";
import { AuthState, onAuthUIStateChange } from '@aws-amplify/ui-components';
import awsconfig from "./aws-exports";
import { Button } from '@material-ui/core';
import Alert from '@material-ui/lab/Alert';
// import { useState } from 'react';

Amplify.configure(awsconfig);

const ImageComponent = props =>{
  const image = props.image
  const imageStyle = {
    width: "128px",
    height: "128px"
  }
  const [tag, setTag] = React.useState('')
  const [showAlert, setShowAlert] = React.useState('')
  const handleTagChange = (event) => {
    setTag = (event.target.value)
  }
  const addTag = () => {
  }
  const deleteImageFromDB = () =>{
  }

  return (
    <span>
      <div>
        <img style = {{imageStyle}} src={image['urnpm install @material-ui/corel']}/>
        <label> 
            add tags:
            <input type = 'text' name = 'tag' value = {tag} onChange={handleTagChange}></input>
            <Button onClick={() => addTag()}>Add</Button>
        </label>
        {showAlert != '' ?
          <Alert onClose = {() => {setShowAlert('')}}>{showAlert}</Alert>
          : null}
        <Button onClick = {() => deleteImageFromDB}>Delete</Button>
      </div>
    </span>
  )
}

const AuthStateApp = () => {
    const [authState, setAuthState] = React.useState();
    const [user, setUser] = React.useState();

    React.useEffect(() => {
      if (authState === AuthState.SignedIn && user){
        loadImageETag();
      }
      return onAuthUIStateChange((nextAuthState, authData) => {
          setAuthState(nextAuthState);
          setUser(authData)
      });
    }, []);

    // upload image
    const [uploadProgress, setUploadProgress] = React.useState('getUpload');
    const [uploadImage, setUploadImage] = React.useState();
    // eslint-disable-next-line 
    const [errorMessage, setErrorMessage] = React.useState();
    const upload = async() => {
      try{
        setUploadProgress('uploading')
        // await Storage.put(`${user.username+Date.now()}.jpg`, uploadImage, {level:'privated', contentType:'image/jpg'});
        await Storage.put(`${Date.now()}.jpg`, uploadImage, {level:'privated', contentType:'image/jpg'});
        setUploadProgress('uploaded')
      }catch (error){
        console.log("upload image error: "+ error)
        setErrorMessage(error.errorMessage)
        setUploadProgress('uploadError')
      }
    };

    // handle image:
    const [imgsProgress, setImgsProgress] = React.useState('loading');
    const [tagStr, setTagStr] = React.useState('');
    // from API -> DB
    const [eTags, setTags] = React.useState([]);
    // from S3
    const [image, setImages] = React.useState([]);

    const loadImageETag = async() => {
      setImgsProgress('loading')
      const tags = tagStr.split(',')
      let params = {}
      tags.forEach(function (value, index){
        params['tags' + index] = value;
      });
    
      API.get('api5225', '/images', {queryStringParameters: params})
      .then(response => {
        setTags(response);
      })
      .catch(error => {
        console.log(error);
      })
    }

    React.useEffect(() => {
      loadImage()
    }, [eTags])

    const loadImage = () => {
      Storage.list('', { level: 'private'})
      .then (async (result) => {
        var displayImages = []
        for (const [index, image] of result.entries()){
          if(!eTags.includes(Image['tags'])){
            continue
          }
          const singleURL = await Storage.get(image['key'], {level:"private"});
          const tempImage = image
          tempImage['url'] = singleURL
          displayImages.push(tempImage)
        }
        setImages(displayImages)
        setImgsProgress('loaded')
      })
    }

    const imgsContent = () => {
      switch (imgsProgress){
        case 'loading':
          return <h2> Loading Images</h2>
        case 'loaded' :

          break;
        default:
          break;
      }
    }

    const uploadContent = () => {
      switch (uploadProgress){
        case 'getUpload': return (
          <div>
            <input type = "file" accept ="image/*" onChange = {e => setUploadImage(e.target.files[0])} />
            <button onClick = {upload}>Upload Image</button>
          </div>
          )
        case 'uploading': return (
            <h2> Uploading </h2>
          ) 
        case 'uploaded': return (
          <div>
            <h2>uploading success</h2>
            <input type = "file" accept ="image/*" onChange = {e => setUploadImage(e.target.files[0])} />
            <button onClick = {upload}>Upload Image</button>
          </div> 
          )
        case 'uploadError': return (
          <div>
            <h2>uploading error</h2>
            <input type = "file" accept ="image/*" onChange = {e => setUploadImage(e.target.files[0])} />
            <button onClick = {upload}>Upload Image</button>
          </div> 
          )
        default:
          break;
      }
    }

    React.useEffect(() => {
      if (uploadProgress == 'upload'){
        loadImageETag()
      }
    }, [uploadProgress])

    return authState === AuthState.SignedIn && user ? (
        <div className="App">
          <header className ="App-header">
            <div> {uploadContent()}</div>
            <div>Hello, {user.username}</div>
            <AmplifySignOut />
          </header>
        </div>
        ):(
        <AmplifyAuthenticator>
          <AmplifySignUp
            slot = "sign-up"
            formFields={[
              {type:"username"},
              {type:"password"},
              {type:"given_name",
              label:"Given Name *",
              placeholder:"Please, Enter your given name.",
              required :true
              },
              {type:"family_name",
              label:"Family Name *",
              placeholder:"Please, Enter your family name.",
              required :true
              }
            ]}
          />
        </AmplifyAuthenticator>
      );
  }
  export default AuthStateApp;
