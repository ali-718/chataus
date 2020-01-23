import React, { Component } from "react";
import {
  Text,
  View,
  SafeAreaView,
  BackHandler,
  TouchableOpacity
} from "react-native";
import {
  Container,
  Header,
  Content,
  Button,
  ListItem,
  Icon,
  Left,
  Body,
  Right,
  Switch
} from "native-base";
import { connect } from "react-redux";
import styles from "../../constants/styles";
import { LoginAction } from "../actions/userAction";
import DialogInput from "react-native-dialog-input";
import * as f from "firebase";
import AwesomeAlert from "react-native-awesome-alerts";

class Settings extends Component {
  state = {
    isDialogVisible: false,
    showAlert: false,
    showAlert2: false
  };

  showAlert = () => {
    this.setState({
      showAlert: true
    });
  };

  hideAlert = () => {
    this.setState({
      showAlert: false
    });
  };

  showAlert2 = () => {
    this.setState({
      showAlert2: true
    });
  };

  hideAlert2 = () => {
    this.setState({
      showAlert2: false
    });
  };

  openCompanyDailog = () => {
    this.showDialog();
  };

  showDialog = val => {
    this.setState({
      isDialogVisible: true
    });
  };

  closeDailog = () => {
    this.setState({
      isDialogVisible: false
    });
  };

  makeAdmin = inputText => {
    let value = false;
    console.log(f.auth().currentUser.uid);
    f.database()
      .ref("keys")
      .on("value", res => {
        Object.values(res.val()).map(item => {
          if (item == inputText) {
            value = true;
          }

          if (value) {
            f.database()
              .ref("users")
              .child(f.auth().currentUser.uid)
              .update({
                status: "admin"
              });
            this.setState({
              isDialogVisible: false
            });

            setTimeout(() => {
              this.showAlert();
            }, 800);
          } else {
            alert("Wrong Pin...!");
          }
        });
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
  }

  render() {
    return (
      <SafeAreaView style={[styles.SafeArea, { flex: 1 }]}>
        {/* Admin Dailog starts */}
        <DialogInput
          isDialogVisible={this.state.isDialogVisible}
          title={"Enter Pin"}
          submitInput={inputText => {
            this.makeAdmin(inputText);
            // console.log(inputText);
          }}
          closeDialog={() => {
            this.closeDailog();
          }}
        ></DialogInput>
        {/* Admin Dailog ends */}
        <View
          style={{
            width: "100%",
            height: 50,
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
            onPress={() => this.props.navigation.goBack()}
          >
            <Icon name="ios-arrow-back" style={{ color: "black" }} />
            {/* {console.log(this.props.company)} */}
          </TouchableOpacity>
          <View style={{ width: "80%" }}>
            <Text style={{ color: "black", fontSize: 22 }}>Settings</Text>
          </View>
        </View>
        <View style={{ width: "100%", flex: 1, paddingTop: 20 }}>
          <ListItem onPress={() => this.props.navigation.navigate("Edit")} icon>
            <Left>
              <Button style={{ backgroundColor: "red" }}>
                <Icon active name="person" type="MaterialIcons" />
              </Button>
            </Left>
            <Body>
              <Text>Edit Profile</Text>
            </Body>
            <Right>
              <Icon active name="arrow-forward" />
            </Right>
          </ListItem>
          {/* {this.props.user.user.status == "admin" ? null : (
            <ListItem
              onPress={() => this.setState({ isDialogVisible: true })}
              icon
            >
              <Left>
                <Button style={{ backgroundColor: "orange" }}>
                  <Icon active name="verified-user" type="MaterialIcons" />
                </Button>
              </Left>
              <Body>
                <Text>Become Admin</Text>
              </Body>
              <Right>
                <Icon active name="arrow-forward" />
              </Right>
            </ListItem>
          )} */}
        </View>
        {/* Error Login starts */}
        <AwesomeAlert
          show={this.state.showAlert}
          showProgress={false}
          title="Congratulations!"
          message="You are now an Admin...!"
          closeOnTouchOutside={true}
          closeOnHardwareBackPress={false}
          showCancelButton={true}
          showConfirmButton={false}
          cancelText="Ok"
          cancelButtonColor="green"
          cancelButtonStyle={{ width: 50, alignItems: "center" }}
          onCancelPressed={() => {
            f.database()
              .ref("users")
              .child(f.auth().currentUser.uid)
              .once("value")
              .then(item => {
                if (item.val()) {
                  this.props.LoginAction(item.val());
                  console.log("admin approved");
                }
              });

            this.hideAlert();
          }}
        />
        {/* Error login fails */}

        {/* Error fill all fields starts */}
        <AwesomeAlert
          show={this.state.showAlert2}
          showProgress={false}
          title="Error"
          message="Wrong pin...!"
          closeOnTouchOutside={true}
          closeOnHardwareBackPress={false}
          showCancelButton={true}
          showConfirmButton={false}
          cancelText="Ok"
          cancelButtonColor="red"
          cancelButtonStyle={{ width: 50, alignItems: "center" }}
          onCancelPressed={() => {
            this.hideAlert2();
          }}
        />
        {/* Error fill all fields starts */}
      </SafeAreaView>
    );
  }
}

const mapStateToProps = state => ({
  user: state.user
});

export default connect(mapStateToProps, { LoginAction })(Settings);
