import React from "react";
import { GiftedChat } from "react-native-gifted-chat";
import {
  View,
  KeyboardAvoidingView,
  TouchableOpacity,
  Platform,
  Text,
  SafeAreaView,
  BackHandler,
  ScrollView
} from "react-native";
import {
  Icon,
  Spinner,
  Button,
  Thumbnail,
  List,
  ListItem,
  Left,
  Body,
  Right
} from "native-base";
import styles from "../../constants/styles";
import * as f from "firebase";
import { Avatar } from "react-native-elements";
import Modal from "react-native-modal";

const auth = f.auth();

export default class GroupChat extends React.Component {
  state = {
    messages: [],
    user: {},
    isLoading: true,
    visibleModal: false
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

    this.setState({
      user: this.props.navigation.getParam("user")
    });

    f.database()
      .ref("users")
      .child(auth.currentUser.uid)
      .once("value")
      .then(res => {
        // this.setState({
        //   user: {
        //     _id: auth.currentUser.uid,
        //     name: res.val().username,
        //     avatar: res.val().avatar
        //   }
        // });
        console.log("ignore it");
      })
      .then(() => {
        this.fetchMessage();
      });
  }

  fetchMessage = () => {
    f.database()
      .ref("chats")
      .on("child_added", childSnapshot => {
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
        this.setState({
          isLoading: false
        });
      });

    this.setState({
      isLoading: false
    });
  };

  onSend(messages) {
    const OriginalMessage = Object.assign({}, messages[0]);
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

        f.database()
          .ref("users")
          .child(f.auth().currentUser.uid)
          .child("deletedUsers")
          .once("value")
          .then(res => {
            res.forEach(item => {
              console.log(`data ${item.val()}`);
              if (item.val() == this.props.navigation.getParam("user").id) {
                f.database()
                  .ref("users")
                  .child(f.auth().currentUser.uid)
                  .child("deletedUsers")
                  .child(item.key)
                  .remove();
              }
            });
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
            {/* Complain modal starts */}
            <Modal
              isVisible={this.state.visibleModal}
              animationIn="slideInLeft"
              animationOut="slideOutRight"
              style={{ paddingTop: 30, paddingBottom: 30 }}
            >
              {this.state.isLoading ? (
                <View
                  style={{
                    width: "100%",
                    borderRadius: 20,
                    backgroundColor: "white",
                    padding: 20
                  }}
                >
                  <Spinner color="blue" size="large" />
                </View>
              ) : (
                <View
                  style={{
                    width: "100%",
                    borderRadius: 20,
                    backgroundColor: "white",
                    padding: 20
                  }}
                >
                  <Text style={{ fontSize: 20, fontWeight: "bold" }}>
                    {this.state.user.name}
                  </Text>
                  <Text style={{ marginTop: 30 }}>Members</Text>
                  <ScrollView
                    style={{ width: "100%", marginTop: 10, height: 300 }}
                    showsVerticalScrollIndicator={false}
                  >
                    <List>
                      {this.state.user.members.map(item => (
                        <ListItem key={item.id} avatar>
                          <Left>
                            <Thumbnail
                              source={{
                                uri: item.avatar
                              }}
                            />
                          </Left>
                          <Body>
                            <Text style={{ fontWeight: "bold" }}>
                              {item.name}
                            </Text>
                            <Text note>
                              {item.shortMessage ? item.shortMessage : ""}
                              {item.shortMessage
                                ? item.shortMessage.length < 35
                                  ? "\n"
                                  : ""
                                : "\n"}
                            </Text>
                          </Body>
                          <Right>
                            <Text>3:43 pm</Text>
                          </Right>
                        </ListItem>
                      ))}
                    </List>
                  </ScrollView>
                  <View
                    style={{
                      marginTop: 50,
                      width: "100%",
                      justifyContent: "center",
                      alignItems: "center",
                      paddingBottom: 10
                    }}
                  >
                    <Button
                      onPress={() => this.setState({ visibleModal: false })}
                      style={{
                        width: "30%",
                        justifyContent: "center",
                        alignItems: "center"
                      }}
                      rounded
                      danger
                    >
                      <Text style={{ color: "white" }}>close</Text>
                    </Button>
                  </View>
                </View>
              )}
            </Modal>
            {/* Complain Modal Ends */}
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
                        style={{ fontSize: 25 }}
                      />
                    </View>
                  </TouchableOpacity>
                  <TouchableOpacity
                    onPress={() => this.setState({ visibleModal: true })}
                    style={{
                      width: "70%",
                      height: 50,
                      alignItems: "center",
                      flexDirection: "row"
                    }}
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
            />
          </KeyboardAvoidingView>
        )}
      </SafeAreaView>
    );
  }
}
