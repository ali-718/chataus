import React, { Component } from "react";
import {
  Text,
  View,
  Image,
  BackHandler,
  TextInput,
  TouchableOpacity
} from "react-native";
import { Icon, Spinner } from "native-base";
import * as Facebook from "expo-facebook";
import Logo from "../assets/logo.png";
import * as f from "firebase";
import { connect } from "react-redux";
import { LoginAction } from "../actions/userAction";
import AwesomeAlert from "react-native-awesome-alerts";

class Login extends Component {
  state = {
    Email: "",
    Password: "",
    isLoading: false,
    showAlert: false,
    showAlert2: false
  };

  componentWillUnmount() {
    console.log("Home unmount");
    BackHandler.removeEventListener("hardwareBackPress", this.backPress);
  }

  componentDidMount() {
    BackHandler.addEventListener("hardwareBackPress", this.backPress);
  }

  backPress = () => {
    BackHandler.exitApp();
    return true;
  };

  SimpleLogin = () => {
    this.setState({
      isLoading: true
    });

    if (this.state.Email !== "" && this.state.Password !== "") {
      f.auth()
        .signInWithEmailAndPassword(this.state.Email, this.state.Password)
        .then(user => {
          console.log(user);
          f.database()
            .ref("users")
            .child(user.user.uid)
            .once("value")
            .then(item => {
              if (item.val()) {
                console.log("res.val() is availaible");
                this.props.LoginAction(item.val());
                this.props.navigation.navigate("Edit", { fromLogin: true });
                this.setState({
                  isLoading: false
                });
              } else {
                f.database()
                  .ref("users")
                  .child(user.user.uid)
                  .set({
                    name: user.user.providerData[0].displayName,
                    email: user.user.providerData[0].email
                  })
                  .then(() => {
                    this.props.LoginAction(item.val());
                    console.log("res.val() not working");
                    console.log("user added succcessfully");
                    this.props.navigation.navigate("Edit");
                    this.setState({
                      isLoading: false
                    });
                  });
              }
            });
        })
        .catch(e => {
          this.setState({
            isLoading: false
          });
          this.showAlert();
        });
    } else {
      this.setState({
        isLoading: false
      });
      this.showAlert2();
    }
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

  FacebookLogin = async () => {
    this.setState({
      isLoading: true
    });
    const { type, token } = await Facebook.logInWithReadPermissionsAsync(
      "2262185377406886",
      {
        permissions: ["public_profile", "email"]
      }
    );

    console.log("here we go");
    if (type === "success") {
      const credentials = f.auth.FacebookAuthProvider.credential(token);

      f.auth()
        .signInWithCredential(credentials)
        .then(res => {
          console.log(res.additionalUserInfo.profile.picture.data.url);
          f.database()
            .ref("users")
            .child(res.user.uid)
            .once("value")
            .then(item => {
              if (item.val()) {
                console.log("res.val() is availaible");
                this.props.LoginAction(item.val());
                this.props.navigation.navigate("Edit", {
                  fromLogin: true,
                  fromFacebook: true
                });
                this.setState({
                  isLoading: false
                });
              } else {
                f.database()
                  .ref("users")
                  .child(res.user.uid)
                  .set({
                    name: res.user.providerData[0].displayName,
                    email: res.user.providerData[0].email,
                    avatar: res.additionalUserInfo.profile.picture.data.url,
                    status: "user",
                    areaid: 0,
                    houseid: 0,
                    shortMessage: "short message"
                  })
                  .then(() => {
                    this.props.LoginAction(item.val());
                    console.log("res.val() not working");
                    console.log("user added succcessfully");
                    this.props.navigation.navigate("Edit");
                    this.setState({
                      isLoading: false
                    });
                  });
              }
            });
        })
        .catch(e => console.log(e));
    }
  };

  render() {
    return (
      <View
        style={{
          width: "100%",
          flex: 1,
          backgroundColor: "white",
          justifyContent: "center",
          alignItems: "center"
        }}
      >
        <View style={{ width: "100%", marginTop: 50, alignItems: "center" }}>
          <TextInput
            onChangeText={val => {
              this.setState({ Email: val });
            }}
            value={this.state.Email}
            style={{
              borderWidth: 1,
              width: "80%",
              borderRadius: 5,
              backgroundColor: "rgba(220,220,220,0.3)",
              marginTop: 10,
              height: 50,
              fontSize: 20,
              paddingLeft: 10
            }}
            autoCapitalize="none"
            placeholder="Username or Email"
            placeholderTextColor="#A9A9A9"
          />
          <TextInput
            onChangeText={val => {
              this.setState({ Password: val });
            }}
            autoCapitalize="none"
            value={this.state.Password}
            style={{
              borderWidth: 1,
              width: "80%",
              borderRadius: 5,
              backgroundColor: "rgba(220,220,220,0.3)",
              marginTop: 10,
              height: 50,
              fontSize: 20,
              paddingLeft: 10
            }}
            placeholder="Password"
            placeholderTextColor="#A9A9A9"
          />
        </View>
        <View style={{ marginTop: 20, width: "100%", alignItems: "center" }}>
          <TouchableOpacity
            onPress={() => this.SimpleLogin()}
            style={{
              backgroundColor: "#3498F1",
              width: "80%",
              height: 40,
              alignItems: "center",
              justifyContent: "center",
              borderRadius: 5,
              marginTop: 10,
              marginBottom: 10
            }}
          >
            <Text style={{ color: "white", fontWeight: "bold" }}>Login</Text>
          </TouchableOpacity>
          <View
            style={{
              width: "80%",
              flexDirection: "row",
              justifyContent: "center",
              marginTop: 10
            }}
          >
            <Text style={{ color: "grey" }}>Don't have an account ? </Text>
            <TouchableOpacity
              onPress={() => this.props.navigation.navigate("Register")}
            >
              <Text style={{ color: "blue" }}>Signup</Text>
            </TouchableOpacity>
          </View>
          {this.state.isLoading ? (
            <Spinner color="blue" style={{ marginTop: 20 }} />
          ) : null}
        </View>

        {/* Error Login starts */}
        <AwesomeAlert
          show={this.state.showAlert}
          showProgress={false}
          title="Error"
          message="Wrong email or password!"
          closeOnTouchOutside={true}
          closeOnHardwareBackPress={false}
          showCancelButton={true}
          showConfirmButton={false}
          cancelText="Ok"
          cancelButtonColor="red"
          cancelButtonStyle={{ width: 50, alignItems: "center" }}
          onCancelPressed={() => {
            this.hideAlert();
          }}
        />
        {/* Error login fails */}

        {/* Error fill all fields starts */}
        <AwesomeAlert
          show={this.state.showAlert2}
          showProgress={false}
          title="Error"
          message="Please fill all fields...!"
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
      </View>
    );
  }
}

const mapStateToProps = state => ({
  user: state.user
});

export default connect(mapStateToProps, { LoginAction })(Login);
