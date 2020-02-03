import React, { Component } from "react";
import {
  Text,
  View,
  SafeAreaView,
  Image,
  ActivityIndicator,
  TextInput,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  TouchableOpacity,
  StatusBar,
  KeyboardAvoidingViewComponent
} from "react-native";
import * as Permissions from "expo-permissions";
import * as ImagePicker from "expo-image-picker";
import { Button } from "react-native-elements";
import { Textarea } from "native-base";
import * as f from "firebase";
import { Icon } from "native-base";
const uuidv1 = require("uuid/v1");
export default class Complain extends Component {
  state = {
    isLogin: false,
    isLoading: true,
    Camera: null,
    CameraRoll: null,
    ImageId: null,
    ImageSelected: false,
    ImageUri: "",
    Caption: "",
    uploading: false,
    progress: 0,
    title: "",
    author: "",
    Topic: "",
    Time: "",
    Place: "",
    Details: ""
  };

  checkPermissions = () => {
    const { status } = Permissions.askAsync(Permissions.CAMERA);
    this.setState({
      Camera: status
    });
    const { statusRoll } = Permissions.askAsync(Permissions.CAMERA_ROLL);
    this.setState({
      CameraRoll: statusRoll
    });
  };

  fetchImage = async () => {
    this.checkPermissions();

    let result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      quality: 1,
      aspect: [4, 3]
    });

    if (!result.cancelled) {
      this.setState({
        ImageSelected: true,
        ImageUri: result.uri,
        ImageId: 1
      });
    } else {
      console.log("cancelled");
      this.setState({
        ImageSelected: false
      });
    }
  };

  uploadImage = async uri => {
    const userId = 2;
    const imageId = this.state.ImageId;
    const type = uri.split(".").pop();

    this.setState({
      uploading: true
    });

    const response = await fetch(uri);
    const Blob = await response.blob();

    let FilePath = imageId + "." + type;

    let uploadRef = f
      .storage()
      .ref(`/users/${uuidV1()}/images`)
      .child(FilePath)
      .put(Blob);

    uploadRef.on(
      "state_changed",
      snapshot => {
        let progress = (
          (snapshot.bytesTransferred / snapshot.totalBytes) *
          100
        ).toFixed(0);

        this.setState({ progress });
      },
      () => console.log(e),
      final => {
        uploadRef.snapshot.ref.getDownloadURL().then(download => {
          this.uploadProcess(
            download,
            this.state.Details,
            this.state.Topic,
            this.state.Time,
            this.state.Place
          );
        });
      }
    );
  };

  uploadProcess = (url, Details, Topic, Time, Place) => {
    const uploadData = {
      Topic,
      Details,
      url,
      Time,
      Place
    };

    f.database()
      .ref("Events")
      .push(uploadData)
      .then(res => {
        alert("data added successfully");
        this.sendPushNotification();
      })
      .catch(e => {
        console.log(e);
        alert("you might check your internet connection");
      });

    this.setState({
      progress: 100,
      uploading: false,
      ImageSelected: false,
      Caption: "",
      ImageId: null
    });
  };

  publishPost = () => {
    if (!this.state.uploading) {
      this.uploadImage(this.state.ImageUri);
    } else {
      console.log("ignore this message");
    }
  };

  sendPushNotification = (title, message, token) => {
    const AllUser = [];

    f.database()
      .ref("users")
      .once("value")
      .then(snapshot => {
        snapshot.forEach(res => {
          if (res.val().expoPushToken) {
            AllUser.push({
              title: this.state.Topic,
              body: `Time : ${this.state.Time}\n Place : ${this.state.Place} \n Details : ${this.state.Details}`,
              sound: "default",
              to: res.val().expoPushToken,
              badge: 1,
              _displayInForeground: true,
              data: {
                name: "ali haider"
              }
            });
          }
        });
      })
      .then(() => {
        fetch(`https://exp.host/--/api/v2/push/send`, {
          method: "POST",
          headers: {
            accept: "application/json",
            "content-type": "application/json"
          },
          body: JSON.stringify(AllUser)
        }).then(() => {
          console.log("Notification send to all users");
          console.log(AllUser);
        });
      });
  };

  cancelButton = () => {
    if (!this.state.uploading) {
      this.setState({
        ImageId: null,
        ImageSelected: false,
        ImageUri: "",
        Caption: "",
        uploading: false,
        progress: 0
      });
    } else {
      null;
    }
  };

  componentDidMount() {
    // auth.signOut();

    this.checkPermissions();

    const ImageProps = this.props.navigation.getParam("Image", null);

    if (ImageProps) {
      this.setState({
        ImageSelected: true,
        ImageUri: ImageProps,
        ImageId: 1
      });
    }
  }

  render() {
    return (
      <View
        style={[
          {
            justifyContent: "center",
            alignItems: "center",
            width: "100%",
            flex: 1
          }
        ]}
      >
        <View
          style={{
            width: "100%",

            flexDirection: "row",
            paddingTop: StatusBar.currentHeight || 30,
            backgroundColor: "#222222"
          }}
        >
          <TouchableOpacity
            style={{
              width: "20%",
              height: 50,
              justifyContent: "center",
              alignItems: "center"
            }}
            onPress={() => this.props.navigation.toggleDrawer()}
          >
            <Icon
              name="bars"
              type="FontAwesome"
              color="#517fa4"
              style={{ fontSize: 32, color: "white" }}
            />
          </TouchableOpacity>
          <View
            style={{
              width: "60%",
              height: 50,
              justifyContent: "center",
              alignItems: "center"
            }}
          ></View>
          <View
            style={{
              width: "20%",
              height: 50,
              justifyContent: "center",
              alignItems: "center"
            }}
          ></View>
        </View>
        {this.state.ImageSelected ? (
          <KeyboardAvoidingView
            style={{ width: "100%", flex: 1 }}
            enabled
            behavior="padding"
          >
            <ScrollView style={{ width: "100%", flex: 1 }}>
              <View
                style={{
                  justifyContent: "center",
                  alignItems: "center",
                  flex: 1,
                  width: "100%"
                }}
              >
                <View
                  style={{
                    width: "100%",
                    flex: 1,
                    padding: 5,
                    justifyContent: "center",
                    alignItems: "center"
                  }}
                >
                  <Image
                    source={{ uri: this.state.ImageUri }}
                    style={{ width: "100%", height: 300, marginTop: 20 }}
                  />
                  <TextInput
                    style={{
                      width: "90%",
                      padding: 10,
                      borderRadius: 10,
                      borderWidth: 1,
                      borderStyle: "solid",
                      borderColor: "gray",
                      marginTop: 20
                    }}
                    placeholderTextColor="gray"
                    placeholder="Topic"
                    value={this.state.Topic}
                    onChangeText={val => this.setState({ Topic: val })}
                  />
                  <TextInput
                    style={{
                      width: "90%",
                      padding: 10,
                      borderRadius: 10,
                      borderWidth: 1,
                      borderStyle: "solid",
                      borderColor: "gray",
                      marginTop: 20
                    }}
                    placeholderTextColor="gray"
                    placeholder="Time"
                    value={this.state.Time}
                    onChangeText={val => this.setState({ Time: val })}
                  />
                  <TextInput
                    style={{
                      width: "90%",
                      padding: 10,
                      borderRadius: 10,
                      borderWidth: 1,
                      borderStyle: "solid",
                      borderColor: "gray",
                      marginTop: 20
                    }}
                    placeholderTextColor="gray"
                    placeholder="Place"
                    value={this.state.Place}
                    onChangeText={val => this.setState({ Place: val })}
                  />
                  <Textarea
                    style={{
                      width: "90%",
                      marginTop: 20,
                      borderRadius: 10,
                      borderColor: "gray"
                    }}
                    rowSpan={5}
                    bordered
                    placeholder="Enter Event Details...!"
                    onChangeText={val => this.setState({ Details: val })}
                    value={this.state.Details}
                  />
                  <View
                    style={{
                      width: "100%",
                      justifyContent: "center",
                      alignItems: "center",
                      marginTop: 20
                    }}
                  >
                    {this.state.uploading ? (
                      <View>
                        <Text>{this.state.progress}%</Text>
                        {this.state.progress !== 100 ? (
                          <ActivityIndicator />
                        ) : null}
                      </View>
                    ) : null}
                  </View>
                  <View
                    style={{
                      width: "80%",
                      flexDirection: "row",
                      marginTop: 20
                    }}
                  >
                    <View
                      style={{
                        width: "50%",
                        justifyContent: "center",
                        alignItems: "center"
                      }}
                    >
                      <Button
                        buttonStyle={{
                          backgroundColor: "red",
                          justifyContent: "center",
                          alignItems: "center"
                        }}
                        title="Cancel"
                        onPress={() => this.cancelButton()}
                      />
                    </View>
                    <View
                      style={{
                        width: "50%",
                        justifyContent: "center",
                        alignItems: "center"
                      }}
                    >
                      <Button
                        disabled={this.state.uploading === true ? true : false}
                        buttonStyle={{
                          justifyContent: "center",
                          alignItems: "center"
                        }}
                        title="Publish"
                        onPress={() => this.publishPost()}
                      />
                    </View>
                  </View>
                </View>
              </View>
            </ScrollView>
          </KeyboardAvoidingView>
        ) : (
          <KeyboardAvoidingView
            style={{ width: "100%", flex: 1 }}
            enabled
            behavior="padding"
          >
            <View
              style={{
                justifyContent: "center",
                alignItems: "center",
                flex: 1,
                width: "100%"
              }}
            >
              <Text style={{ fontSize: 25, marginBottom: 10 }}>Upload</Text>
              <Button title="Select Photo" onPress={() => this.fetchImage()} />
              <TextInput
                style={{
                  width: "90%",
                  padding: 10,
                  borderRadius: 10,
                  borderWidth: 1,
                  borderStyle: "solid",
                  borderColor: "gray",
                  marginTop: 20
                }}
                placeholderTextColor="gray"
                placeholder="Topic"
                value={this.state.Topic}
                onChangeText={val => this.setState({ Topic: val })}
              />
              <TextInput
                style={{
                  width: "90%",
                  padding: 10,
                  borderRadius: 10,
                  borderWidth: 1,
                  borderStyle: "solid",
                  borderColor: "gray",
                  marginTop: 20
                }}
                placeholderTextColor="gray"
                placeholder="Time"
                value={this.state.Time}
                onChangeText={val => this.setState({ Time: val })}
              />
              <TextInput
                style={{
                  width: "90%",
                  padding: 10,
                  borderRadius: 10,
                  borderWidth: 1,
                  borderStyle: "solid",
                  borderColor: "gray",
                  marginTop: 20
                }}
                placeholderTextColor="gray"
                placeholder="Place"
                value={this.state.Place}
                onChangeText={val => this.setState({ Place: val })}
              />
              <Textarea
                style={{
                  width: "90%",
                  marginTop: 20,
                  borderRadius: 10,
                  borderColor: "gray"
                }}
                rowSpan={5}
                bordered
                placeholder="Enter Event Details...!"
                onChangeText={val => this.setState({ Details: val })}
                value={this.state.Details}
              />
            </View>
          </KeyboardAvoidingView>
        )}
      </View>
    );
  }
}
