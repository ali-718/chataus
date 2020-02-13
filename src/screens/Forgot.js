import React, { Component } from "react";
import {
  Text,
  View,
  Image,
  BackHandler,
  TextInput,
  TouchableOpacity,
  SafeAreaView,
  StatusBar,
  Platform,
  ImageBackground
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

  Send = () => {
    if (this.state.Email == "") {
      alert("Please fill all fields");
    } else {
      f.auth()
        .sendPasswordResetEmail(this.state.Email)
        .then(res => {
          alert("Email has been sent successfully");
        })
        .catch(e => alert("some error occoured please try again later"));
    }
  };

  render() {
    return (
      <ImageBackground
        source={require("../assets/Message.png")}
        style={{
          width: "100%",
          flex: 1,
          backgroundColor: "white",
          paddingTop: Platform.OS == "android" ? StatusBar.currentHeight : 10
        }}
      >
        <View
          style={{
            width: "100%",
            height: 50,
            alignItems: "center",
            justifyContent: "center",
            flexDirection: "row",
            marginTop: 20
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
            <Text style={{ color: "white", fontSize: 22 }}>Reset Password</Text>
          </View>
        </View>
        <View
          style={{
            width: "100%",
            flex: 1,
            alignItems: "center",
            justifyContent: "center"
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
          </View>
          <View style={{ marginTop: 20, width: "100%", alignItems: "center" }}>
            <TouchableOpacity
              onPress={() => this.Send()}
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
              <Text style={{ color: "white", fontWeight: "bold" }}>Send</Text>
            </TouchableOpacity>
            {/* Error fill all fields starts */}
          </View>
        </View>
      </ImageBackground>
    );
  }
}

const mapStateToProps = state => ({
  user: state.user
});

export default connect(mapStateToProps, { LoginAction })(Login);
