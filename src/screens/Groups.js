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
  Picker,
  Item,
  Label,
  Input,
  Button
} from "native-base";
import styles from "../../constants/styles";
import * as f from "firebase";
import { connect } from "react-redux";
import * as Permissions from "expo-permissions";
import { Notifications } from "expo";
import ModalDropdown from "react-native-modal-dropdown";
import Modal from "react-native-modal";
import AwesomeAlert from "react-native-awesome-alerts";

class Groups extends Component {
  state = {
    isLoading: true,
    groups: [],
    users: [],
    PressLong: "",
    backgroundColor: "",
    visibleModal: false,
    selectedMembers: [],
    groupName: "",
    isModalLoading: false,
    showAlert: false
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

  newGroup = () => {
    this.setState({
      visibleModal: true
    });
  };

  createGroup = () => {
    if (this.state.groupName.trim() == "") {
      alert("Please provide the name of the group");
    } else {
      this.setState({
        isModalLoading: true
      });
      f.database()
        .ref("groups")
        .push({
          name: this.state.groupName,
          avatar:
            "https://images.pexels.com/photos/1092644/pexels-photo-1092644.jpeg?auto=compress&cs=tinysrgb&dpr=2&h=650&w=940"
        })
        .then(() => {
          this.props.navigation.replace("Groups");
          this.setState({
            PressLong: "",
            backgroundColor: "",
            visibleModal: false,
            selectedMembers: [],
            groupName: "",
            isModalLoading: false,
            showAlert: true
          });
        });
    }
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
    f.database()
      .ref("users")
      .once("value")
      .then(snapshot => {
        snapshot.forEach(res => {
          this.showStatus(res.key);
          this.state.users.push({ ...res.val(), id: res.key });
        });
      });

    f.database()
      .ref("groups")
      .once("value")
      .then(snapshot => {
        if (!snapshot.val()) {
          this.setState({
            isLoading: false
          });
        }
        snapshot.forEach(res => {
          this.state.groups.push({ ...res.val(), id: res.key });
          console.log(res.val());
        });
      })
      .then(() => {
        this.setState({
          isLoading: false
        });
      });
  }

  SelectMembers = user => {
    this.state.selectedMembers.push({
      description: user.description ? user.description : "",
      email: user.email ? user.email : "",
      expoPushToken: user.expoPushToken ? user.expoPushToken : "",
      id: user.id ? user.id : "",
      name: user.name ? user.name : "",
      shortMessage: user.shortMessage ? user.shortMessage : "",
      username: user.username ? user.username : "",
      avatar: user.avatar ? user.avatar : ""
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
            {console.log(this.state.groups)}
            <View
              style={{
                width: "100%",
                height: 50,
                backgroundColor: "white",
                alignItems: "center",
                justifyContent: "center",
                flexDirection: "row"
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
                    this.state.PressLong == ""
                      ? this.props.user.user.status == "admin"
                        ? "60%"
                        : "80%"
                      : this.props.user.user.status == "admin"
                      ? "40%"
                      : "60%"
                }}
              >
                <Text style={{ color: "black", fontSize: 22 }}>Chatroom</Text>
              </View>
              {this.state.PressLong !== "" ? (
                <TouchableOpacity
                  style={{
                    width: "20%",
                    justifyContent: "center",
                    alignItems: "center"
                  }}
                  onPress={() => alert("this is user is blocked")}
                >
                  <Icon
                    name="block"
                    type="Entypo"
                    style={{ color: "red", fontSize: 18 }}
                  />
                  <Text style={{ fontSize: 10 }}>Delete</Text>
                </TouchableOpacity>
              ) : null}
              {this.props.user.user.status == "admin" ? (
                <TouchableOpacity
                  style={{
                    width: "20%",
                    justifyContent: "center",
                    alignItems: "center"
                  }}
                  onPress={() => {
                    this.newGroup();
                  }}
                >
                  <Icon
                    name="plus"
                    type="AntDesign"
                    style={{
                      fontSize: 18,
                      color: "black"
                    }}
                  />
                  <Text style={{ fontSize: 10 }}>New Group</Text>
                </TouchableOpacity>
              ) : null}
            </View>
            {this.state.groups.length == 0 ? (
              <View
                style={{
                  width: "100%",
                  flex: 1,
                  alignItems: "center",
                  justifyContent: "center"
                }}
              >
                <Text>You are not added in any group...!</Text>
              </View>
            ) : (
              <ImageBackground
                source={require("../assets/Message.png")}
                style={{ width: "100%", flex: 1 }}
              >
                <ScrollView style={{ width: "100%", flex: 1 }}>
                  <List style={{ marginTop: 10 }}>
                    {this.state.groups.map(item => {
                      return (
                        <TouchableOpacity
                          onPress={() => {
                            if (this.state.PressLong == "") {
                              this.props.navigation.navigate("GroupChat", {
                                user: item
                              });
                            } else {
                              this.props.navigation.replace("Groups");
                            }
                          }}
                          key={item.id}
                          style={{
                            width: "100%",
                            height: 70,
                            flexDirection: "row",
                            marginTop: 20
                          }}
                        >
                          <View
                            style={{
                              width: "100%",
                              justifyContent: "center",
                              borderBottomColor: "gainsboro",
                              borderBottomWidth: 0.5,
                              borderStyle: "solid",
                              paddingHorizontal: 20
                            }}
                          >
                            <Text style={{ fontSize: 22 }}>{item.name}</Text>
                          </View>
                        </TouchableOpacity>
                      );
                    })}
                  </List>
                </ScrollView>
              </ImageBackground>
            )}
          </View>
        )}
        <Modal
          isVisible={this.state.visibleModal}
          animationIn="slideInLeft"
          animationOut="slideOutRight"
          style={{ paddingTop: 30, paddingBottom: 30 }}
        >
          {this.state.isModalLoading ? (
            <View
              style={{
                width: "100%",
                alignItems: "center",
                justifyContent: "center",
                backgroundColor: "white"
              }}
            >
              <Spinner color="blue" size="large" />
            </View>
          ) : (
            <View
              style={{
                width: "100%",
                alignItems: "center",
                backgroundColor: "white",
                borderRadius: 20
              }}
            >
              <View style={{ width: "80%", marginTop: 50 }}>
                <Item floatingLabel>
                  <Label style={{ color: "gray" }}>Group Name</Label>
                  <Input
                    onChangeText={val =>
                      this.setState({
                        groupName: val
                      })
                    }
                    value={this.state.groupName}
                    placeholder="Group Name...!"
                  />
                </Item>
              </View>
              <View style={{ width: "100%", flexDirection: "row" }}>
                <View style={{ width: "50%", alignItems: "center" }}>
                  <View
                    style={{
                      marginTop: 50,
                      width: "80%",
                      justifyContent: "center",
                      alignItems: "center",
                      marginBottom: 20
                    }}
                  >
                    <Button
                      // disabled={this.state.uploading == true ? true : false}
                      onPress={() =>
                        this.setState({
                          visibleModal: false,
                          selectedMembers: [],
                          groupName: ""
                        })
                      }
                      style={{
                        width: "50%",
                        justifyContent: "center",
                        alignItems: "center"
                      }}
                      rounded
                      danger
                    >
                      <Text style={{ color: "white" }}>Cancel</Text>
                    </Button>
                  </View>
                </View>
                <View style={{ width: "50%", alignItems: "center" }}>
                  <View
                    style={{
                      marginTop: 50,
                      width: "80%",
                      justifyContent: "center",
                      alignItems: "center"
                    }}
                  >
                    <Button
                      // disabled={this.state.uploading == true ? true : false}
                      onPress={() => this.createGroup()}
                      style={{
                        width: "50%",
                        justifyContent: "center",
                        alignItems: "center"
                      }}
                      rounded
                      primary
                    >
                      <Text style={{ color: "white" }}>Save</Text>
                    </Button>
                  </View>
                </View>
              </View>
            </View>
          )}
        </Modal>
        {/* Group created starts */}
        <AwesomeAlert
          show={this.state.showAlert}
          showProgress={false}
          title="Success"
          message="Group has been created successfully...!"
          closeOnTouchOutside={true}
          closeOnHardwareBackPress={false}
          showCancelButton={true}
          showConfirmButton={false}
          cancelText="Ok"
          cancelButtonColor="blue"
          cancelButtonStyle={{ width: 50, alignItems: "center" }}
          onCancelPressed={() => {
            this.setState({
              showAlert: false
            });
          }}
        />
        {/* group created fails */}
      </SafeAreaView>
    );
  }
}

const mapStateToProps = state => ({
  user: state.user
});

export default connect(mapStateToProps)(Groups);
