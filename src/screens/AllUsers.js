import React, { Component } from "react";
import {
  Text,
  View,
  SafeAreaView,
  ScrollView,
  TouchableOpacity,
  BackHandler
} from "react-native";
import {
  Container,
  Header,
  Content,
  List,
  ListItem,
  Left,
  Body,
  Right,
  Thumbnail,
  Icon,
  Spinner,
  Picker
} from "native-base";
import styles from "../../constants/styles";
import * as f from "firebase";
import { connect } from "react-redux";
import * as Permissions from "expo-permissions";
import { Notifications } from "expo";
import ModalDropdown from "react-native-modal-dropdown";

class Users extends Component {
  state = {
    isLoading: true,
    users: [],
    PressLong: "",
    backgroundColor: "",
    currentUser: {}
  };

  showStatus = id => {
    f.database()
      .ref("chats")
      .on("value", snapshot => {
        snapshot.forEach(item => {
          if (item.senderId == id) {
            console.log(item.status);
            return true;
          }
        });
      });
  };

  DeleteUser = () => {
    f.database()
      .ref("users")
      .child(this.state.PressLong)
      .update({ status: "delete" })
      .then(() => {
        this.setState({ users: [] });
        this.fetchUsers();
      });
  };

  registerNotification = async () => {
    const { status: existingStatus } = await Permissions.getAsync(
      Permissions.NOTIFICATIONS
    );
    let finalStatus = existingStatus;

    // only ask if permissions have not already been determined, because
    // iOS won't necessarily prompt the user a second time.
    if (existingStatus !== "granted") {
      // Android remote notification permissions are granted during the app
      // install, so this will only ask on iOS
      const { status } = await Permissions.askAsync(Permissions.NOTIFICATIONS);
      finalStatus = status;
    }

    // Stop here if the user did not grant permissions
    if (finalStatus !== "granted") {
      return;
    }

    // Get the token that uniquely identifies this device
    let token = await Notifications.getExpoPushTokenAsync();

    f.database()
      .ref("users")
      .child(f.auth().currentUser.uid)
      .update({
        expoPushToken: token
      });
  };

  PressLong = userId => {
    // console.log(this.state.PressLong);
    f.database()
      .ref("users")
      .child(this.state.PressLong)
      .once("value")
      .then(res => {
        if (res.val().authority == "block") {
          this.setState({ blocked: true });
        }
      });

    f.database()
      .ref("users")
      .child(f.auth().currentUser.uid)
      .child("chats")
      .once("value")
      .then(res => {
        res.forEach(childSnapshot => {
          if (
            (childSnapshot.val().senderId === f.auth().currentUser.uid &&
              childSnapshot.val().recieverId === userId) ||
            (childSnapshot.val().senderId === userId &&
              childSnapshot.val().recieverId === f.auth().currentUser.uid)
          ) {
            console.log("found chats");
            this.state.chats.push({
              _id: childSnapshot.key,
              text: childSnapshot.val().message.text,
              createdAt: childSnapshot.val().timeStamp,
              user: childSnapshot.val().user
            });
          }
        });
      });

    // setInterval(() => {
    //   console.log(this.state);
    // }, 1000);
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
    this.registerNotification();
    f.database()
      .ref("users")
      .child(f.auth().currentUser.uid)
      .once("value")
      .then(res => {
        this.setState({ currentUser: { ...res.val(), id: res.key } });
      })
      .then(() => {
        this.fetchUsers();
      });
  }

  fetchUsers = () => {
    f.database()
      .ref("users")
      .once("value")
      .then(snapshot => {
        snapshot.forEach(res => {
          this.showStatus(res.key);
          this.state.users.push({ ...res.val(), id: res.key });
        });
        this.setState({
          isLoading: false
        });
      });
  };

  render() {
    return (
      <SafeAreaView style={[styles.SafeArea, { width: "100%", flex: 1 }]}>
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
          <View style={{ width: "100%", flex: 1 }}>
            <View
              style={{
                width: "100%",
                height: 50,
                backgroundColor: "white",
                alignItems: "center",
                flexDirection: "row",

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
              <TouchableOpacity
                style={{
                  width: "20%",
                  justifyContent: "center",
                  alignItems: "center"
                }}
                onPress={() => this.props.navigation.toggleDrawer()}
              >
                <Icon name="ios-menu" style={{ color: "black" }} />
              </TouchableOpacity>
              <View
                style={{
                  width: "60%"
                }}
              >
                <Text style={{ color: "black", fontSize: 22 }}>All User</Text>
              </View>
              {this.state.PressLong !== "" ? (
                <TouchableOpacity
                  style={{
                    width: "20%",
                    justifyContent: "center",
                    alignItems: "center"
                  }}
                  onPress={() => this.DeleteUser()}
                >
                  <Icon
                    name="delete"
                    type="AntDesign"
                    style={{
                      color: "red",
                      fontSize: 18
                    }}
                  />
                  <Text style={{ fontSize: 10 }}>Delete</Text>
                </TouchableOpacity>
              ) : null}
            </View>
            <ScrollView style={{ width: "100%", flex: 1 }}>
              <List style={{ marginTop: 10 }}>
                {this.state.users.map(item => {
                  if (
                    item.id !== f.auth().currentUser.uid &&
                    item.status !== "delete"
                  ) {
                    return (
                      <TouchableOpacity
                        key={item.id}
                        style={{
                          width: "100%",
                          height: 60,
                          flexDirection: "row",
                          marginTop: 20,
                          borderWidth: this.state.PressLong == item.id ? 1 : 0,
                          borderColor: this.state.backgroundColor,
                          borderStyle: "solid"
                        }}
                        onLongPress={() => {
                          if (this.state.currentUser.status == "admin") {
                            if (
                              this.state.PressLong == "" &&
                              this.state.currentUser.status == "admin"
                            ) {
                              this.setState({
                                PressLong: item.id,
                                backgroundColor: "gray"
                              });

                              this.PressLong(item.id);
                            } else {
                              this.props.navigation.replace("AllUser");
                            }
                          }

                          // alert(item.id)
                        }}
                        onPress={() => {
                          if (this.state.PressLong == "") {
                            this.props.navigation.navigate("Profile", {
                              user: item
                            });
                          } else {
                            this.props.navigation.replace("AllUser");
                            this.setState({
                              PressLong: "",
                              backgroundColor: ""
                            });
                          }
                        }}
                      >
                        <View
                          style={{
                            width: "20%",
                            justifyContent: "center",
                            alignItems: "center"
                          }}
                        >
                          <Thumbnail
                            source={{
                              uri: item.avatar
                            }}
                          />
                        </View>
                        <View
                          style={{
                            width: "60%",
                            justifyContent: "center",
                            paddingLeft: 10
                            // borderBottomColor: "gainsboro",
                            // borderBottomWidth: 0.5,
                            // borderStyle: "solid"
                          }}
                        >
                          <Text style={{ fontSize: 18, fontWeight: "400" }}>
                            {item.name}
                          </Text>
                          <Text style={{ marginTop: 5, color: "grey" }}>
                            {item.shortMessage}
                          </Text>
                        </View>
                      </TouchableOpacity>
                    );
                  }
                })}
              </List>
            </ScrollView>
          </View>
        )}
      </SafeAreaView>
    );
  }
}

const mapStateToProps = state => ({
  user: state.user
});

export default connect(mapStateToProps)(Users);
