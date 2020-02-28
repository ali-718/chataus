import React, { Component } from "react";
import {
  Text,
  View,
  SafeAreaView,
  ScrollView,
  TouchableOpacity,
  BackHandler,
  ImageBackground
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

class Home extends Component {
  state = {
    isLoading: true,
    users: [],
    PressLong: "",
    backgroundColor: "",
    blocked: false,
    chats: [],
    currentUser: {}
  };

  DeleteUser = () => {
    this.state.chats.map(item => {
      console.log(item._id);
      f.database()
        .ref("users")
        .child(f.auth().currentUser.uid)
        .child("chats")
        .child(item._id)
        .remove()
        .then(() => {
          this.props.navigation.replace("Home");
        });
    });
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

  blockUser = () => {
    f.database()
      .ref("users")
      .child(this.state.PressLong)
      .update({ authority: "block" })
      .then(() => {
        alert("user blocked");
        this.props.navigation.replace("Home");
      });
  };

  UnblockUser = () => {
    f.database()
      .ref("users")
      .child(this.state.PressLong)
      .update({ authority: "unblock" })
      .then(() => {
        alert("user unblocked");
        this.props.navigation.replace("Home");
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
      })
      .then(() => {
        f.database()
          .ref("tokens")
          .push({
            Token: token
          });
      });
  };

  constructor(props) {
    super(props);
  }

  componentWillUnmount() {
    console.log("Home unmount");
    BackHandler.removeEventListener("hardwareBackPress", this.backPress);
  }

  backPress = () => {
    BackHandler.exitApp();
    return true;
  };

  componentDidMount() {
    BackHandler.addEventListener("hardwareBackPress", this.backPress);
    this.registerNotification();
    let filterArray = [];

    // f.database()
    //   .ref("chats")
    //   .once("value")
    //   .then(item => {
    //     item.forEach(data => {
    //       this.state.chats.push({
    //         ...data.val(),
    //         id: data.key
    //       });
    //     });
    //   });

    // setInterval(() => {
    f.database()
      .ref("users")
      .child(f.auth().currentUser.uid)
      .once("value")
      .then(res => {
        this.setState({ currentUser: { ...res.val(), id: res.key } });
      });

    f.database()
      .ref("users")
      .child(f.auth().currentUser.uid)
      .child("chats")
      .on(
        "value",
        snapshot => {
          snapshot.forEach(res => {
            // if (
            //   res.val().senderId == f.auth().currentUser.uid ||
            //   res.val().recieverId == f.auth().currentUser.uid
            // ) {
            // console.log(res.val().recieverId);
            let makers = [res.val().senderId, res.val().recieverId];
            filterArray.push(...makers);
            // }
          });

          let uniqueSet = new Set(filterArray);

          let UniqueArray = [...uniqueSet];
          let DletedUserAvailable = false;

          let AllUsers = UniqueArray.filter(item => {
            return item !== f.auth().currentUser.uid;
          });

          let ChatUsers = [];
          if (AllUsers.length > 0) {
            AllUsers.map(item => {
              f.database()
                .ref("users")
                .child(item)
                .once("value")
                .then(res => {
                  ChatUsers.push({
                    ...res.val(),
                    id: res.key,
                    status: false
                  });
                })
                .then(() => {
                  this.setState({
                    users: ChatUsers
                  });
                })
                .finally(() => {
                  this.setState({
                    isLoading: false
                  });
                });
            });
          } else {
            this.setState({
              isLoading: false
            });
          }
        },
        () => console.log(e)
      );
    // .then(() => {
    //   this.setState({ isLoading: false });
    // });
    // }, 2000);

    f.database()
      .ref("users")
      .child(f.auth().currentUser.uid)
      .once("value")
      .then(res => {
        this.setState({
          userProfile: { ...res.val(), id: res.key }
        });
      });

    // f.database()
    //   .ref("users")
    //   .once("value")
    //   .then(snapshot => {
    //     snapshot.forEach(res => {
    //       this.showStatus(res.key);
    //       this.state.users.push({ ...res.val(), id: res.key, status: false });
    //     });
    //     this.setState({
    //       isLoading: false
    //     });
    //   });
  }

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
          <ImageBackground
            source={require("../assets/Message.png")}
            style={{ width: "100%", flex: 1 }}
          >
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
                  width:
                    this.state.PressLong !== "" &&
                    this.props.user.user.status == "admin"
                      ? "40%"
                      : "60%"
                }}
              >
                <Text style={{ color: "black", fontSize: 22 }}>
                  Aus Pro Network
                </Text>
              </View>
              {this.state.PressLong !== "" &&
              this.props.user.user.status == "admin" ? (
                <TouchableOpacity
                  style={{
                    width: "20%",
                    justifyContent: "center",
                    alignItems: "center"
                  }}
                  onPress={() => {
                    if (this.state.blocked) {
                      this.UnblockUser();
                    } else {
                      this.blockUser();
                    }
                  }}
                >
                  <Icon
                    name="block"
                    type="Entypo"
                    style={{
                      color: this.state.blocked ? "blue" : "red",
                      fontSize: 18
                    }}
                  />
                  {this.state.blocked ? (
                    <Text style={{ fontSize: 10 }}>Unblock</Text>
                  ) : (
                    <Text style={{ fontSize: 10 }}>Block</Text>
                  )}
                </TouchableOpacity>
              ) : null}
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
            {this.state.users.length > 0 ? (
              <ScrollView style={{ width: "100%", flex: 1 }}>
                <List style={{ paddingTop: -20 }}>
                  {this.state.users.map((item, i) => {
                    if (item.id !== f.auth().currentUser.uid) {
                      return (
                        <TouchableOpacity
                          key={item.id}
                          style={{
                            width: "100%",
                            height: 60,
                            flexDirection: "row",
                            marginTop: 20,
                            borderWidth:
                              this.state.PressLong == item.id ? 1 : 0,
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
                                this.props.navigation.replace("Home");
                              }
                            }

                            // alert(item.id)
                          }}
                          onPress={() => {
                            if (this.state.PressLong == "") {
                              this.props.navigation.navigate("Chat", {
                                user: item
                              });
                            } else {
                              this.props.navigation.replace("Home");
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
            ) : (
              <View
                style={{
                  width: "100%",
                  flex: 1,
                  justifyContent: "center",
                  alignItems: "center"
                }}
              >
                <Text style={{ fontSize: 15 }}>No chats Available...!</Text>
              </View>
            )}
          </ImageBackground>
        )}
      </SafeAreaView>
    );
  }
}

const mapStateToProps = state => ({
  user: state.user
});

export default connect(mapStateToProps)(Home);
