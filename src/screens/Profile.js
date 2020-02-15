import React, { Component } from "react";
import {
  Text,
  View,
  SafeAreaView,
  StatusBar,
  Platform,
  TouchableOpacity,
  ScrollView,
  ImageBackground,
  Linking
} from "react-native";
import { Avatar } from "react-native-elements";
import * as f from "firebase";
import {
  Input,
  Item,
  Icon,
  Button,
  Label,
  Textarea,
  Spinner,
  Picker,
  Right
} from "native-base";

export default class Profile extends Component {
  state = {
    user: ""
  };

  componentDidMount() {
    const user = this.props.navigation.getParam("user");

    this.setState({
      user
    });
    // if (user) {
    //   f.database()
    //     .ref("users")
    //     .child(user)
    //     .once("value")
    //     .then(item => {
    //       this.setState({
    //         user: item.val()
    //       });
    //     });
    // }
  }

  render() {
    return (
      <ImageBackground
        source={require("../assets/Message.png")}
        style={{ width: "100%", flex: 1 }}
      >
        <SafeAreaView
          style={{
            marginTop: Platform.OS == "android" ? StatusBar.currentHeight : 0,
            width: "100%",
            flex: 1
          }}
        >
          <ScrollView style={{ width: "100%", flex: 1 }}>
            <View
              style={{ width: "100%", height: 40, justifyContent: "center" }}
            >
              <Icon
                name="arrowleft"
                type="AntDesign"
                style={{ fontSize: 20, marginLeft: 20 }}
                onPress={() => this.props.navigation.goBack()}
              />
            </View>
            <View
              style={{
                width: "100%",
                alignItems: "center",
                justifyContent: "center",
                marginTop: 20
              }}
            >
              <Avatar
                source={{
                  uri: this.state.user.avatar
                }}
                size="large"
                rounded
              />
              <Text
                style={{
                  marginTop: 20,
                  fontSize: 20,
                  letterSpacing: 1
                }}
              >
                {this.state.user.name}
              </Text>
              <Text
                style={{
                  marginTop: 10,
                  fontSize: 15
                }}
              >
                {this.state.user.description}
              </Text>
              <TouchableOpacity
                onPress={() => {
                  Linking.openURL(
                    this.state.user.linkedin || "https://www.linkedin.com/"
                  );
                }}
                style={{
                  backgroundColor: "#0077B5",
                  width: "80%",
                  height: 40,
                  alignItems: "center",
                  justifyContent: "center",
                  borderRadius: 5,
                  marginTop: 20,
                  flexDirection: "row"
                }}
              >
                <Icon
                  name="linkedin"
                  type="Entypo"
                  style={{ color: "white" }}
                />
                <Text
                  style={{
                    color: "white",
                    fontWeight: "bold",
                    alignItems: "center",
                    justifyContent: "center",
                    marginLeft: 20
                  }}
                >
                  Linkedin Profile
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={{
                  padding: 10,
                  alignItems: "center",
                  justifyContent: "center",
                  backgroundColor: "#6a5acd",
                  width: "80%",
                  borderRadius: 5,
                  marginTop: 10
                }}
                onPress={() =>
                  this.props.navigation.navigate("Chat", {
                    user: this.state.user
                  })
                }
              >
                <Text style={{ color: "white" }}>Message</Text>
              </TouchableOpacity>
            </View>
            <View
              style={{ width: "100%", marginTop: 50, alignItems: "center" }}
            >
              <Item style={{ width: "90%" }} floatingLabel>
                <Label>Address</Label>
                <Input disabled value={this.state.user.address} />
              </Item>
              <Item style={{ width: "90%", marginTop: 20 }} floatingLabel>
                <Label>Email</Label>
                <Input disabled value={this.state.user.email} />
              </Item>
              <Item style={{ width: "90%", marginTop: 20 }} floatingLabel>
                <Label>Phone</Label>
                <Input disabled value={this.state.user.phone} />
              </Item>
              <Item style={{ width: "90%", marginTop: 20 }} floatingLabel>
                <Label>Job Title</Label>
                <Input disabled value={this.state.user.jobtitle} />
              </Item>
              <Item style={{ width: "90%", marginTop: 20 }} floatingLabel>
                <Label>Location</Label>
                <Input disabled value={this.state.user.location} />
              </Item>
              <Item style={{ width: "90%", marginTop: 20 }} floatingLabel>
                <Label>Organization</Label>
                <Input disabled value={this.state.user.organization} />
              </Item>
              <Item style={{ width: "90%", marginTop: 20 }} floatingLabel>
                <Label>Industry</Label>
                <Input disabled value={this.state.user.industry} />
              </Item>
              <Item style={{ width: "90%", marginTop: 20 }} floatingLabel>
                <Label>Base Education</Label>
                <Input disabled value={this.state.user.education} />
              </Item>
            </View>
          </ScrollView>
        </SafeAreaView>
      </ImageBackground>
    );
  }
}
