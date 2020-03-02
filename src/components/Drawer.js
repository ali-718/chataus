import React from "react";
import {
  Text,
  View,
  SafeAreaView,
  Image,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  BackHandler,
  TouchableHighlight
} from "react-native";
import { DrawerNavigatorItems } from "react-navigation-drawer";
import { Avatar } from "react-native-elements";
import OutStyles from "../../constants/styles";
import { connect } from "react-redux";
import { LogoutUser } from "../actions/userAction";
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
  Switch,
  Badge
} from "native-base";

const LogoutButton = props => {
  props.navigation.navigate("Login");
  props.LogoutUser();
};

const NavigationOptions = props => (
  <SafeAreaView style={[OutStyles.SafeArea, { flex: 1, width: "100%" }]}>
    <View style={{ alignItems: "center", height: 250 }}>
      <View
        style={{
          flex: 1,
          width: "100%",
          alignItems: "center",
          justifyContent: "center",
          borderBottomWidth: 2,
          borderColor: "white",
          marginBottom: 20,
          backgroundColor: "white"
        }}
      >
        <View>
          <Avatar
            size="large"
            rounded
            source={{
              uri: props.user.user
                ? props.user.user.avatar
                : "https://via.placeholder.com/300"
            }}
          />
          {props.user.user.status == "admin" ? (
            <Badge
              primary
              style={{
                position: "absolute",
                top: -4,
                right: -4,
                justifyContent: "center",
                alignItems: "center"
              }}
            >
              <Icon
                name="verified"
                type="Octicons"
                style={{ fontSize: 15, color: "#fff" }}
              />
            </Badge>
          ) : null}
        </View>
        <Text
          style={{
            color: "black",
            fontWeight: "bold",
            fontSize: 20,
            marginTop: 10
          }}
        >
          {props.user.user.name}
        </Text>
        <Text style={{ color: "black" }}>
          {props.user.user.email ? props.user.user.email : "Email not given"}
        </Text>
        <TouchableOpacity
          activeOpacity={0.8}
          onPress={() => {
            props.LogoutUser(props.navigation);
          }}
          style={{
            width: 100,
            height: 40,
            backgroundColor: "#F56463",
            alignItems: "center",
            justifyContent: "center",
            marginTop: 20
          }}
        >
          <Text style={{ color: "white" }}>Logout</Text>
        </TouchableOpacity>
        {/* <TouchableOpacity
          onPress={() => props.navigation.navigate("Settings")}
          style={{
            width: 100,
            height: 40,
            backgroundColor: "#6A50E4",
            alignItems: "center",
            justifyContent: "center",
            marginTop: 20
          }}
        >
          <Text style={{ color: "white" }}>Settings</Text>
        </TouchableOpacity> */}
      </View>
    </View>
    <ScrollView style={{ flex: 1 }}>
      <View
        style={{
          width: "100%",
          justifyContent: "center",
          marginTop: 20
        }}
      >
        <ListItem
          onPress={() => props.navigation.navigate("Groups")}
          icon
          style={{ borderBottomWidth: 0, paddingBottom: 20 }}
        >
          <Left>
            <Button
              style={{
                backgroundColor: "#5ABAEE",
                borderRadius: 100,
                width: 50,
                height: 50
              }}
            >
              <Icon active name="group-work" type="MaterialIcons" />
            </Button>
          </Left>
          <Body style={{ borderBottomWidth: 0, paddingLeft: 10 }}>
            <Text style={{ fontSize: 20 }}>Chatroom</Text>
          </Body>
        </ListItem>
        <ListItem
          onPress={() => props.navigation.navigate("AllUser")}
          icon
          style={{ borderBottomWidth: 0, marginTop: 20, paddingBottom: 20 }}
        >
          <Left>
            <Button
              style={{
                backgroundColor: "#DC70E2",
                borderRadius: 100,
                width: 50,
                height: 50
              }}
            >
              <Icon active name="users" type="Feather" />
            </Button>
          </Left>
          <Body style={{ borderBottomWidth: 0, paddingLeft: 10 }}>
            <Text style={{ fontSize: 20 }}>All Users</Text>
          </Body>
        </ListItem>
        {props.user.user.status == "admin" ? (
          <ListItem
            activeOpacity={0.2}
            onPress={() => props.navigation.navigate("Complain")}
            icon
            style={{ borderBottomWidth: 0, marginTop: 20, paddingBottom: 20 }}
          >
            <Left>
              <Button
                style={{
                  backgroundColor: "#F56463",
                  borderRadius: 100,
                  width: 50,
                  height: 50
                }}
              >
                <Icon active name="file-contract" type="FontAwesome5" />
              </Button>
            </Left>
            <Body style={{ borderBottomWidth: 0, paddingLeft: 10 }}>
              <Text style={{ fontSize: 20 }}>Create Event</Text>
            </Body>
          </ListItem>
        ) : null}
        <ListItem
          onPress={() => props.navigation.navigate("ComplainStatus")}
          icon
          style={{ borderBottomWidth: 0, marginTop: 20, paddingBottom: 20 }}
        >
          <Left>
            <Button
              style={{
                backgroundColor: "#50E2BE",
                borderRadius: 100,
                width: 50,
                height: 50
              }}
            >
              <Icon active name="list" type="Entypo" />
            </Button>
          </Left>
          <Body style={{ borderBottomWidth: 0, paddingLeft: 10 }}>
            <Text style={{ fontSize: 20 }}>Events</Text>
          </Body>
        </ListItem>
        <ListItem
          onPress={() => props.navigation.navigate("NotificationsList")}
          icon
          style={{ borderBottomWidth: 0, marginTop: 20, paddingBottom: 20 }}
        >
          <Left>
            <Button
              style={{
                backgroundColor: "#EA4C89",
                borderRadius: 100,
                width: 50,
                height: 50
              }}
            >
              <Icon active name="notifications" type="MaterialIcons" />
            </Button>
          </Left>
          <Body style={{ borderBottomWidth: 0, paddingLeft: 10 }}>
            <Text style={{ fontSize: 20 }}>Notifications</Text>
          </Body>
        </ListItem>
        <ListItem
          onPress={() => props.navigation.navigate("About")}
          icon
          style={{ borderBottomWidth: 0, marginTop: 20, paddingBottom: 20 }}
        >
          <Left>
            <Button
              style={{
                backgroundColor: "#FFC850",
                borderRadius: 100,
                width: 50,
                height: 50
              }}
            >
              <Icon active name="customerservice" type="AntDesign" />
            </Button>
          </Left>
          <Body style={{ borderBottomWidth: 0, paddingLeft: 10 }}>
            <Text style={{ fontSize: 20 }}>About us</Text>
          </Body>
        </ListItem>
        <ListItem
          onPress={() => props.navigation.navigate("Jahanzeb")}
          icon
          style={{ borderBottomWidth: 0, marginTop: 20, paddingBottom: 20 }}
        >
          <Left>
            <Avatar
              rounded
              source={require("../assets/jahazeb.jpeg")}
              size="medium"
            />
          </Left>
          <Body style={{ borderBottomWidth: 0, paddingLeft: 10 }}>
            <Text style={{ fontSize: 20 }}>Jahanzeb</Text>
          </Body>
        </ListItem>

        <ListItem
          onPress={() => props.navigation.navigate("Obaid")}
          icon
          style={{ borderBottomWidth: 0, marginTop: 20, paddingBottom: 20 }}
        >
          <Left>
            <Avatar
              rounded
              source={require("../assets/obaid.jpeg")}
              size="medium"
            />
          </Left>
          <Body style={{ borderBottomWidth: 0, paddingLeft: 10 }}>
            <Text style={{ fontSize: 20 }}>Obaid</Text>
          </Body>
        </ListItem>
        <ListItem
          onPress={() => props.navigation.navigate("Settings")}
          icon
          style={{ borderBottomWidth: 0, marginTop: 10, marginBottom: 10 }}
        >
          <Left>
            <Button
              style={{
                backgroundColor: "#6A50E4",
                borderRadius: 100,
                width: 50,
                height: 50
              }}
            >
              <Icon active name="settings" type="Feather" />
            </Button>
          </Left>
          <Body style={{ borderBottomWidth: 0, paddingLeft: 10 }}>
            <Text style={{ fontSize: 20 }}>Settings</Text>
          </Body>
        </ListItem>
      </View>
    </ScrollView>
  </SafeAreaView>
);

const styles = StyleSheet.create({
  DrawerView: {
    flex: 1,
    width: "90%",
    alignItems: "center",
    justifyContent: "center",
    borderBottomWidth: 2,
    borderColor: "white",
    marginBottom: 20
  },
  DrawerIcon: {
    width: 24,
    height: 24,
    color: "white"
  }
});

const mapStateToProps = state => ({
  user: state.user
});

export default connect(mapStateToProps, { LogoutUser })(NavigationOptions);
