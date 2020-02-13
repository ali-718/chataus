import React from "react";
import { GiftedChat, Actions, Bubble } from "react-native-gifted-chat";
import { uid } from "react-uid";
import {
  View,
  KeyboardAvoidingView,
  TouchableOpacity,
  Platform,
  Text,
  SafeAreaView,
  BackHandler,
  ActivityIndicator,
  StatusBar,
  Image,
  TextInput,
  ImageBackground
} from "react-native";
import { Icon, Spinner, Thumbnail } from "native-base";
import styles from "../../constants/styles";
import * as f from "firebase";
import { Avatar } from "react-native-elements";
import CustomActions from "./CustomActions";
import * as Permissions from "expo-permissions";
import * as ImagePicker from "expo-image-picker";
import Modal from "react-native-modal";
// import { Video } from "expo";
// import { Video } from "expo-av";
import Video from "react-native-video";
const uuidv1 = require("uuid/v1");
const auth = f.auth();

export default class Messages extends React.Component {
  state = {
    messages: [],
    user: {},
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
    Details: "",
    isModal: false,
    imageTextInput: "",
    mediaType: ""
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
      mediaTypes: ImagePicker.MediaTypeOptions.All,
      allowsEditing: true,
      quality: 0.2,
      aspect: [4, 3]
    });

    console.log(result);

    if (!result.cancelled) {
      this.setState({
        ImageSelected: true,
        ImageUri: result.uri,
        ImageId: 1,
        isModal: true,
        mediaType: result.type
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
      .ref(`/users/${uuidv1()}/images`)
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
          this.uploadProcess(download, this.state.imageTextInput);
        });
      }
    );
  };

  uploadProcess = (url, userMessage) => {
    const message = {
      id: uuidv1(),
      text: userMessage
    };

    let imageData =
      this.state.mediaType == "image"
        ? {
            message,
            senderId: auth.currentUser.uid,
            recieverId: this.props.navigation.getParam("user").id,
            user: this.state.user,
            timeStamp: new Date().getTime(),
            status: false,
            image: url
          }
        : {
            message,
            senderId: auth.currentUser.uid,
            recieverId: this.props.navigation.getParam("user").id,
            user: this.state.user,
            timeStamp: new Date().getTime(),
            status: false,
            video: url
          };

    f.database()
      .ref("chats")
      .push(imageData)
      .then(() => {
        f.database()
          .ref("users")
          .child(this.props.navigation.getParam("user").id)
          .update({
            shortMessage: message.text
          });

        f.database()
          .ref("users")
          .child(this.props.navigation.getParam("user").id)
          .child("chats")
          .push({
            message,
            senderId: auth.currentUser.uid,
            recieverId: this.props.navigation.getParam("user").id,
            user: this.state.user,
            timeStamp: new Date().getTime(),
            status: false,
            image: url
          });

        f.database()
          .ref("users")
          .child(f.auth().currentUser.uid)
          .child("chats")
          .push({
            message,
            senderId: auth.currentUser.uid,
            recieverId: this.props.navigation.getParam("user").id,
            user: this.state.user,
            timeStamp: new Date().getTime(),
            status: false,
            image: url
          });
      });

    f.database()
      .ref("users")
      .child(f.auth().currentUser.uid)
      .once("value")
      .then(snapshot => {
        this.sendPushNotification(
          snapshot.val().name,
          message.text,
          this.props.navigation.getParam("user").expoPushToken
        );

        f.database()
          .ref("Notifications")
          .push({
            group: false,
            user: {
              id: snapshot.key,
              name: snapshot.val().name,
              avatar: snapshot.val().avatar
            },
            NewTime: `${new Date().getUTCHours()}:${new Date().getUTCMinutes()}`,
            recieverId: this.props.navigation.getParam("user").id
          });
      });

    this.setState({
      progress: 100,
      uploading: false,
      ImageSelected: false,
      Caption: "",
      ImageId: null,
      isModal: false
    });
  };

  publishPost = () => {
    if (!this.state.uploading) {
      this.uploadImage(this.state.ImageUri);
    } else {
      console.log("ignore this message");
    }
  };

  renderActions = props => {
    const options = {
      "Upload Media": props => {
        this.fetchImage();
      },
      Cancel: () => {}
    };
    return <Actions {...props} options={options} />;
  };

  renderBubble = props => {
    return (
      <Bubble
        {...props}
        wrapperStyle={{
          left: {
            backgroundColor: "#f0f0f0"
          }
        }}
      />
    );
  };

  sendPushNotification = (title, message, token) => {
    fetch(`https://exp.host/--/api/v2/push/send`, {
      method: "POST",
      headers: {
        accept: "application/json",
        "content-type": "application/json"
      },
      body: JSON.stringify({
        title: title,
        body: message,
        sound: "default",
        to: token,
        badge: 1,
        _displayInForeground: true,
        data: {
          name: "ali haider"
        }
      })
    });
  };

  componentWillUnmount() {
    console.log("Home unmount");
    BackHandler.removeEventListener("hardwareBackPress", this.backPress);
  }

  backPress = () => {
    this.props.navigation.goBack();
    return true;
  };

  componentDidMount() {
    BackHandler.addEventListener("hardwareBackPress", this.backPress);

    f.database()
      .ref("users")
      .child(auth.currentUser.uid)
      .once("value")
      .then(res => {
        this.setState({
          user: {
            _id: auth.currentUser.uid,
            name: res.val().name,
            avatar: res.val().avatar
          }
        });
      })
      .then(() => {
        this.fetchMessage();
      });

    // database.ref("chats").once("value", snapshot => {
    //   snapshot.forEach(childSnapshot => {
    //     if (
    //       (childSnapshot.val().senderId === auth.currentUser.uid &&
    //         childSnapshot.val().recieverId ===
    //           this.props.navigation.getParam("user").userId) ||
    //       (childSnapshot.val().senderId ===
    //         this.props.navigation.getParam("user").userId &&
    //         childSnapshot.val().recieverId === auth.currentUser.uid)
    //     ) {
    //       this.setState({
    //         messages: GiftedChat.append(this.state.messages, {
    //           _id: childSnapshot.key,
    //           text: childSnapshot.val().message.text,
    //           createdAt: new Date(),
    //           user: childSnapshot.val().user
    //         })
    //       });
    //     }
    //   });
    // });

    // this.setState({
    //   messages: [
    //     {
    //       _id: 1,
    //       text: "Hello developer",
    //       createdAt: new Date(),
    //       user: {
    //         _id: 2,
    //         name: "React Native",
    //         avatar: "https://placeimg.com/140/140/any"
    //       }
    //     }
    //   ]
    // });
  }

  fetchMessage = () => {
    f.database()
      .ref("chats")
      .on("child_added", childSnapshot => {
        // snapshot.forEach(childSnapshot => {
        // console.log(childSnapshot.val());
        if (
          (childSnapshot.val().senderId === auth.currentUser.uid &&
            childSnapshot.val().recieverId ===
              this.props.navigation.getParam("user").id) ||
          (childSnapshot.val().senderId ===
            this.props.navigation.getParam("user").id &&
            childSnapshot.val().recieverId === auth.currentUser.uid)
        ) {
          this.setState({
            messages: GiftedChat.append(this.state.messages, {
              _id: childSnapshot.key,
              text: childSnapshot.val().message.text,
              createdAt: childSnapshot.val().timeStamp,
              user: childSnapshot.val().user,
              image: childSnapshot.val().image,
              video: childSnapshot.val().video
            })
          });
        }
        // });
        this.setState({
          isLoading: false
        });
      });

    this.setState({
      isLoading: false
    });
    // .then(() => {
    //   f.database()
    //     .ref("chats")
    //     .off();
    // })
    // .then(() => {
    //   f.database()
    //     .ref("chats")
    //     .on("child_added", childSnapshot => {
    //       console.log(childSnapshot.val());
    //       if (
    //         (childSnapshot.val().senderId === auth.currentUser.uid &&
    //           childSnapshot.val().recieverId ===
    //             this.props.navigation.getParam("user").id) ||
    //         (childSnapshot.val().senderId ===
    //           this.props.navigation.getParam("user").id &&
    //           childSnapshot.val().recieverId === auth.currentUser.uid)
    //       ) {
    //         this.setState({
    //           messages: GiftedChat.append(this.state.messages, {
    //             _id: childSnapshot.key,
    //             text: childSnapshot.val().message.text,
    //             createdAt: childSnapshot.val().timeStamp,
    //             user: childSnapshot.val().user
    //           })
    //         });
    //       }
    //     });
    // });
  };

  onSend(messages) {
    // console.log(messages);
    const OriginalMessage = messages[0];
    const message = {
      id: OriginalMessage._id,
      text: OriginalMessage.text
    };
    f.database()
      .ref("chats")
      .push({
        message,
        senderId: auth.currentUser.uid,
        recieverId: this.props.navigation.getParam("user").id,
        user: OriginalMessage.user,
        timeStamp: new Date().getTime(),
        status: false
      })
      .then(() => {
        f.database()
          .ref("users")
          .child(this.props.navigation.getParam("user").id)
          .update({
            shortMessage: message.text
          });

        f.database()
          .ref("users")
          .child(this.props.navigation.getParam("user").id)
          .child("chats")
          .push({
            message,
            senderId: auth.currentUser.uid,
            recieverId: this.props.navigation.getParam("user").id,
            user: OriginalMessage.user,
            timeStamp: new Date().getTime(),
            status: false
          });

        f.database()
          .ref("users")
          .child(f.auth().currentUser.uid)
          .child("chats")
          .push({
            message,
            senderId: auth.currentUser.uid,
            recieverId: this.props.navigation.getParam("user").id,
            user: OriginalMessage.user,
            timeStamp: new Date().getTime(),
            status: false
          });
      });

    f.database()
      .ref("users")
      .child(f.auth().currentUser.uid)
      .once("value")
      .then(snapshot => {
        this.sendPushNotification(
          snapshot.val().name,
          OriginalMessage.text,
          this.props.navigation.getParam("user").expoPushToken
        );

        f.database()
          .ref("Notifications")
          .push({
            group: false,
            user: {
              id: snapshot.key,
              name: snapshot.val().name,
              avatar: snapshot.val().avatar
            },
            NewTime: `${new Date().getUTCHours()}:${new Date().getUTCMinutes()}`,
            recieverId: this.props.navigation.getParam("user").id
          });
      });
  }

  render() {
    return (
      <SafeAreaView style={styles.SafeArea}>
        {this.state.isLoading ? (
          <View
            style={{
              width: "100%",
              flex: 1,
              justifyContent: "center",
              alignItems: "center"
            }}
          >
            <Spinner color="blue" size="large" />
          </View>
        ) : (
          <KeyboardAvoidingView
            behavior="padding"
            enabled={true}
            style={{ width: "100%", flex: 1 }}
          >
            <Modal
              isVisible={this.state.isModal}
              style={{ width: "100%", flex: 1, margin: 0 }}
            >
              <SafeAreaView
                style={{
                  width: "100%",
                  flex: 1,
                  backgroundColor: "black",
                  margin: 0
                }}
              >
                <View
                  style={{
                    width: "100%",
                    alignItems: "flex-end",
                    paddingHorizontal: 20,
                    marginTop: 10
                  }}
                >
                  <Icon
                    onPress={() => this.setState({ isModal: false })}
                    name="cross"
                    type="Entypo"
                    style={{ color: "white" }}
                  />
                </View>
                <View
                  style={{
                    width: "100%",
                    flex: 1,
                    alignItems: "center",
                    justifyContent: "center"
                  }}
                >
                  <Image
                    source={{ uri: this.state.ImageUri }}
                    style={{ width: "100%", height: 300 }}
                  />
                </View>

                <View
                  style={{
                    width: "100%",
                    flexDirection: "row",
                    marginBottom: 10
                  }}
                >
                  <View style={{ width: "80%" }}>
                    <TextInput
                      style={{
                        borderColor: "gray",
                        borderBottomWidth: 1,
                        borderStyle: "solid",
                        width: "100%",
                        padding: 20,
                        color: "white"
                      }}
                      placeholder="Write Message...!"
                      placeholderTextColor="white"
                      multiline
                      value={this.state.imageTextInput}
                      onChangeText={val =>
                        this.setState({ imageTextInput: val })
                      }
                    />
                  </View>
                  {this.state.uploading ? (
                    <View
                      style={{
                        width: "20%",
                        alignItems: "center",
                        justifyContent: "center"
                      }}
                    >
                      <ActivityIndicator />
                    </View>
                  ) : (
                    <TouchableOpacity
                      style={{
                        width: "20%",
                        alignItems: "center",
                        justifyContent: "center"
                      }}
                      onPress={() => this.publishPost()}
                    >
                      <Text style={{ fontWeight: "bold", color: "blue" }}>
                        Send
                      </Text>
                    </TouchableOpacity>
                  )}
                </View>
              </SafeAreaView>
            </Modal>
            {console.log(this.state)}
            <View
              style={{
                width: "100%",
                height: 50,
                justifyContent: "center",
                borderBottomWidth: Platform.OS == "ios" ? 0.2 : 0,
                borderBottomColor: "gainsboro",
                borderStyle: "solid",
                shadowColor: "#000",
                shadowOffset: {
                  width: 0,
                  height: 1
                },
                shadowOpacity: 0.18,
                shadowRadius: 1.0,

                elevation: 1
              }}
            >
              <View
                style={{
                  width: "90%",
                  height: 50,
                  justifyContent: "center"
                }}
              >
                <View
                  style={{
                    width: "100%",
                    flexDirection: "row",
                    height: 50
                  }}
                >
                  <TouchableOpacity
                    style={{
                      width: "20%",
                      height: 50,
                      alignItems: "center",
                      justifyContent: "center",
                      flexDirection: "row"
                    }}
                    onPress={() => this.props.navigation.goBack()}
                  >
                    <View
                      style={{
                        width: "100%",
                        height: 20,
                        alignItems: "center",
                        justifyContent: "center"
                      }}
                    >
                      <Icon
                        name="arrowleft"
                        type="AntDesign"
                        style={{ fontSize: 20 }}
                      />
                    </View>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={{
                      width: "70%",
                      height: 50,
                      alignItems: "center",
                      flexDirection: "row"
                    }}
                    onPress={() =>
                      this.props.navigation.navigate("Profile", {
                        user: this.props.navigation.getParam("user")
                      })
                    }
                  >
                    <Avatar
                      source={{
                        uri: this.props.navigation.getParam("user").avatar
                      }}
                      size="small"
                      rounded
                    />
                    <Text style={{ fontWeight: "bold", marginLeft: 10 }}>
                      {this.props.navigation.getParam("user").name}
                    </Text>
                  </TouchableOpacity>
                </View>
              </View>
            </View>
            <GiftedChat
              messages={this.state.messages}
              showUserAvatar={true}
              onSend={messages => this.onSend(messages)}
              user={this.state.user}
              alwaysShowSend={true}
              renderActions={this.renderActions}
            ></GiftedChat>
          </KeyboardAvoidingView>
        )}
      </SafeAreaView>
    );
  }
}
