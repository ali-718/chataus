import React from "react";
import { GiftedChat, Actions, Bubble } from "react-native-gifted-chat";
import {
  View,
  KeyboardAvoidingView,
  TouchableOpacity,
  Platform,
  Text,
  SafeAreaView,
  BackHandler
} from "react-native";
import { Icon, Spinner, Thumbnail } from "native-base";
import styles from "../../constants/styles";
import * as f from "firebase";
import { Avatar } from "react-native-elements";
import CustomActions from "./CustomActions";

const auth = f.auth();

export default class Messages extends React.Component {
  state = {
    messages: [],
    user: {},
    isLoading: true
  };

  renderActions = props => {
    const options = {
      "Action 1": props => {
        alert("option 1");
      },
      "Action 2": props => {
        alert("option 2");
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
              user: childSnapshot.val().user
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
    console.log(messages);
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
              renderBubble={this.renderBubble}
            ></GiftedChat>
          </KeyboardAvoidingView>
        )}
      </SafeAreaView>
    );
  }
}
