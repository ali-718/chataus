import React, { Component } from "react";
import {
  BackHandler,
  Text,
  View,
  ScrollView,
  Image,
  ImageBackground
} from "react-native";
import * as f from "firebase";
import { Icon, Spinner } from "native-base";

export default class EventDetails extends Component {
  state = {
    Details: ""
  };

  componentDidMount() {
    BackHandler.addEventListener("hardwareBackPress", () => {
      this.props.navigation.goBack();
      return true;
    });
    f.database()
      .ref("Events")
      .child(this.props.navigation.getParam("Event"))
      .once("value")
      .then(res => {
        this.setState({ Details: res.val() });
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
        {console.log(this.state)}
        {this.state.Details == "" ? (
          <Spinner color="blue" />
        ) : (
          <ImageBackground
            source={require("../assets/Message.png")}
            style={{ width: "100%", flex: 1 }}
          >
            <ScrollView style={{ marginTop: 25, width: "100%", flex: 1 }}>
              <View
                style={{
                  width: "100%",
                  height: 50,
                  justifyContent: "center",
                  marginTop: 10
                }}
              >
                <Icon
                  name="ios-arrow-round-back"
                  style={{ marginLeft: 20 }}
                  onPress={() => this.props.navigation.goBack()}
                />
              </View>
              <View style={{ width: "100%", alignItems: "center" }}>
                <Image
                  style={{ width: "90%", height: 200 }}
                  source={{ uri: this.state.Details.url }}
                />
                <Text
                  style={{ marginTop: 30, fontSize: 22, fontWeight: "bold" }}
                >
                  {this.state.Details.Topic}
                </Text>
                <View style={{ width: "90%" }}>
                  <Text style={{ marginTop: 20 }}>
                    {this.state.Details.Details}
                  </Text>
                  <Text style={{ marginTop: 20 }}>
                    Time: {this.state.Details.Time}
                  </Text>
                  <Text style={{ marginTop: 20 }}>
                    Place: {this.state.Details.Place}
                  </Text>
                </View>
              </View>
            </ScrollView>
          </ImageBackground>
        )}
      </View>
    );
  }
}
