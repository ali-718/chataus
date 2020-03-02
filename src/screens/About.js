import React, { Component } from "react";
import {
  Text,
  View,
  SafeAreaView,
  ScrollView,
  TouchableOpacity,
  BackHandler,
  ImageBackground,
  Image
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
import { Linking } from "react-native";

export default class About extends Component {
  componentDidMount() {
    BackHandler.addEventListener("hardwareBackPress", () => {
      this.props.navigation.goBack();
    });
  }
  render() {
    return (
      <SafeAreaView style={[styles.SafeArea, { width: "100%", flex: 1 }]}>
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
                width: "80%"
              }}
            >
              <Text style={{ color: "black", fontSize: 22 }}>About us</Text>
            </View>
          </View>
          <View
            style={{
              width: "100%",
              padding: 30,
              alignItems: "center",
              justifyContent: "center"
            }}
          >
            <TouchableOpacity
              onPress={() => Linking.openURL("http://mediavessels.com/")}
            >
              <Image
                style={{ width: 300, height: 80 }}
                source={require("../../assets/company.png")}
              />
            </TouchableOpacity>
          </View>
          <View style={{ width: "100%", alignItems: "center", marginTop: 20 }}>
            <TouchableOpacity
              onPress={() =>
                Linking.openURL(
                  "https://m.facebook.com/Australian-Professional-Network-APN-100772051533023/"
                )
              }
              style={{
                backgroundColor: "#3498F1",
                width: "80%",
                height: 40,
                alignItems: "center",
                justifyContent: "center",
                borderRadius: 5,
                marginTop: 10,
                flexDirection: "row"
              }}
            >
              <Icon
                name="facebook-square"
                type="FontAwesome"
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
                Like us on Facebook
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              onPress={() =>
                Linking.openURL("https://www.linkedin.com/groups/10495680")
              }
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
                name="linkedin-square"
                type="AntDesign"
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
                Join us on Linkedin
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              onPress={() =>
                Linking.openURL(
                  "https://www.youtube.com/channel/UCZNg6iF2PhHU-TXDviX82E A"
                )
              }
              style={{
                backgroundColor: "#FF2500",
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
                name="youtube"
                type="AntDesign"
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
                Watch us on Youtube
              </Text>
            </TouchableOpacity>
          </View>
        </ImageBackground>
      </SafeAreaView>
    );
  }
}
