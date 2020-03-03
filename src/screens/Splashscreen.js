import React, { Component } from "react";
import { Text, View, Image, BackHandler } from "react-native";
import Logo from "../assets/logo.png";
import * as f from "firebase";
import { connect } from "react-redux";
import { LoginAction } from "../actions/userAction";
import { Icon, Spinner } from "native-base";

class Splashscreen extends Component {
  state = {
    isLoading: true,
    connection: ""
  };

  didBlurSubscription = this.props.navigation.addListener(
    "didFocus",
    async () => {
      f.auth().onAuthStateChanged(user => {
        if (user) {
          console.log(user.uid);
          f.database()
            .ref("users")
            .child(user.uid)
            .once("value")
            .then(item => {
              console.log(item.val());
              console.log("item val");
              if (
                item.val().description &&
                item.val().phone &&
                item.val().cnic &&
                item.val().address
              ) {
                this.props.LoginAction(item.val());
                this.props.navigation.navigate("Groups");
                clearTimeout(this.timer);
              } else {
                this.props.LoginAction(item.val());
                this.props.navigation.navigate("Edit", { fromLogin: true });
              }
            });
        } else {
          this.props.navigation.navigate("Login");
        }
      });
    }
  );

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
    // this.timer = setTimeout(() => {
    //   this.setState({
    //     connection: "You might check your internet connection"
    //   });
    // }, 6000);
    f.auth().onAuthStateChanged(user => {
      if (user) {
        console.log(user.uid);
        f.database()
          .ref("users")
          .child(user.uid)
          .once("value")
          .then(item => {
            console.log(item.val());
            console.log("item val");
            if (
              item.val().description &&
              item.val().phone &&
              item.val().cnic &&
              item.val().address
            ) {
              this.props.LoginAction(item.val());
              this.props.navigation.navigate("Groups");
              clearTimeout(this.timer);
            } else {
              this.props.LoginAction(item.val());
              this.props.navigation.navigate("Edit", { fromLogin: true });
            }
          });
      } else {
        this.props.navigation.navigate("Login");
      }
    });
  }

  render() {
    return (
      <View
        style={{
          width: "100%",
          flex: 1,
          justifyContent: "center",
          alignItems: "center"
        }}
      >
        <Image source={Logo} style={{ width: 100, height: 100 }} />
        {this.state.isLoading ? (
          <View>
            <Spinner style={{ marginTop: 20 }} color="blue" size="large" />
            <Text style={{ marginTop: 20 }}>{this.state.connection}</Text>
          </View>
        ) : null}
        <View
          style={{
            flex: 0.3,
            alignItems: "center",
            justifyContent: "flex-end"
          }}
        >
          <Text style={{ marginTop: 5 }}>Powered by</Text>
          <Image
            style={{ width: 130, height: 40 }}
            source={require("../../assets/company.png")}
          />
        </View>
      </View>
    );
  }
}

const mapStateToProps = state => ({
  user: state.user
});

export default connect(mapStateToProps, { LoginAction })(Splashscreen);
