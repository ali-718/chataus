import React, { Component } from "react";
import {
  Text,
  View,
  Image,
  TextInput,
  TouchableOpacity,
  AsyncStorage,
  ActivityIndicator,
  ScrollView,
  SafeAreaView,
  KeyboardAvoidingView,
  BackHandler,
  ImageBackground
} from "react-native";
import Logo from "../assets/logo.png";
import { Icon, Spinner } from "native-base";
import { connect } from "react-redux";
import axios from "axios";
import styles from "../../constants/styles";
import * as firebase from "firebase";
import { LoginAction } from "../actions/userAction";

class Register extends Component {
  state = {
    Email: "",
    Password: "",
    isLoading: false,
    Name: "",
    UserName: "",
    Phone: "",
    CNIC: "",
    ConfirmPassword: "",
    CompanyPin: "",
    JobTitle: "",
    Organization: "",
    Industry: "",
    Location: "",
    BaseEducation: "",
    Linkedin: ""
  };

  componentWillUnmount() {
    console.log("Home unmount");
    BackHandler.removeEventListener("hardwareBackPress", this.backPress);
  }

  componentDidMount() {
    BackHandler.addEventListener("hardwareBackPress", this.backPress);
  }

  backPress = () => {
    this.props.navigation.goBack();
    return true;
  };

  Login = () => {
    if (
      this.state.Name != "" &&
      this.state.Email != "" &&
      this.state.Phone != "" &&
      this.state.Password != "" &&
      this.state.ConfirmPassword != "" &&
      this.state.JobTitle != "" &&
      this.state.Location !== "" &&
      this.state.Organization != "" &&
      this.state.Industry != "" &&
      this.state.BaseEducation !== "" &&
      this.state.Linkedin !== ""
    ) {
      if (this.state.Password === this.state.ConfirmPassword) {
        firebase
          .auth()
          .createUserWithEmailAndPassword(this.state.Email, this.state.Password)
          .then(user => {
            console.log(user);
            firebase
              .database()
              .ref("users")
              .child(user.user.uid)
              .set({
                name: this.state.Name,
                username: this.state.UserName,
                email: this.state.Email,
                phone: this.state.Phone,
                jobtitle: this.state.JobTitle,
                location: this.state.Location,
                organization: this.state.Organization,
                industry: this.state.Industry,
                education: this.state.BaseEducation,
                password: this.state.Password,
                status: "member",
                avatar:
                  "https://cdn.shopify.com/s/files/1/0533/2089/files/placeholder-images-image_large.png?v=1530129081",
                areaid: 0,
                houseid: 0,
                shortMessage: "short message",
                linkedin: this.state.Linkedin
              })
              .then(() => {
                this.props.navigation.navigate("Edit", { fromLogin: true });
              });
            alert("user added succesfully");
          })
          .catch(e => {
            alert(e);
          });
      } else {
        alert("password did'nt match");
      }
    } else {
      this.setState({
        isLoading: false
      });
      alert("Please fill all fields");
    }
  };

  render() {
    return (
      <SafeAreaView
        style={[
          {
            width: "100%",
            flex: 1,
            backgroundColor: "white"
          },
          styles.safeArea
        ]}
      >
        <ImageBackground
          source={require("../assets/Message.png")}
          style={{ width: "100%", flex: 1 }}
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
              <Text style={{ color: "white", fontSize: 22 }}>
                Reset Password
              </Text>
            </View>
          </View>
          {this.state.isLoading ? (
            <Spinner size="large" color="blue" />
          ) : (
            <ScrollView
              style={{
                width: "100%",
                flex: 1
              }}
            >
              <KeyboardAvoidingView
                enabled={true}
                behavior="padding"
                style={{
                  width: "100%",
                  alignItems: "center",
                  marginTop: 50,
                  marginBottom: 50
                }}
              >
                <View
                  style={{ width: "100%", marginTop: 50, alignItems: "center" }}
                >
                  <TextInput
                    value={this.state.Name}
                    onChangeText={val => {
                      this.setState({
                        Name: val
                      });
                    }}
                    autoCapitalize="none"
                    style={{
                      borderWidth: 1,
                      width: "80%",
                      borderRadius: 5,
                      backgroundColor: "rgba(220,220,220,0.3)",
                      marginTop: 20,
                      height: 50,
                      fontSize: 20,
                      paddingLeft: 10
                    }}
                    placeholder="Name"
                    placeholderTextColor="#A9A9A9"
                  />
                  <TextInput
                    value={this.state.JobTitle}
                    onChangeText={val => {
                      this.setState({
                        JobTitle: val
                      });
                    }}
                    autoCapitalize="none"
                    style={{
                      borderWidth: 1,
                      width: "80%",
                      borderRadius: 5,
                      backgroundColor: "rgba(220,220,220,0.3)",
                      marginTop: 20,
                      height: 50,
                      fontSize: 20,
                      paddingLeft: 10
                    }}
                    placeholder="Job Title"
                    placeholderTextColor="#A9A9A9"
                  />
                  <TextInput
                    onChangeText={val => {
                      this.setState({
                        Organization: val
                      });
                    }}
                    autoCapitalize="none"
                    style={{
                      borderWidth: 1,
                      width: "80%",
                      borderRadius: 5,
                      backgroundColor: "rgba(220,220,220,0.3)",
                      marginTop: 20,
                      height: 50,
                      fontSize: 20,
                      paddingLeft: 10
                    }}
                    placeholder="Organization"
                    placeholderTextColor="#A9A9A9"
                    value={this.state.Organization}
                  />
                  <TextInput
                    onChangeText={val => {
                      this.setState({
                        Industry: val
                      });
                    }}
                    autoCapitalize="none"
                    style={{
                      borderWidth: 1,
                      width: "80%",
                      borderRadius: 5,
                      backgroundColor: "rgba(220,220,220,0.3)",
                      marginTop: 20,
                      height: 50,
                      fontSize: 20,
                      paddingLeft: 10
                    }}
                    placeholder="Industry"
                    placeholderTextColor="#A9A9A9"
                    value={this.state.Industry}
                  />
                  <TextInput
                    onChangeText={val => {
                      this.setState({
                        Location: val
                      });
                    }}
                    autoCapitalize="none"
                    style={{
                      borderWidth: 1,
                      width: "80%",
                      borderRadius: 5,
                      backgroundColor: "rgba(220,220,220,0.3)",
                      marginTop: 20,
                      height: 50,
                      fontSize: 20,
                      paddingLeft: 10
                    }}
                    placeholder="Location"
                    placeholderTextColor="#A9A9A9"
                    value={this.state.Location}
                  />
                  <TextInput
                    value={this.state.Email}
                    onChangeText={val => {
                      this.setState({
                        Email: val
                      });
                    }}
                    autoCapitalize="none"
                    style={{
                      borderWidth: 1,
                      width: "80%",
                      borderRadius: 5,
                      backgroundColor: "rgba(220,220,220,0.3)",
                      marginTop: 20,
                      height: 50,
                      fontSize: 20,
                      paddingLeft: 10
                    }}
                    placeholder="Email"
                    placeholderTextColor="#A9A9A9"
                  />
                  <TextInput
                    value={this.state.Linkedin}
                    onChangeText={val => {
                      this.setState({
                        Linkedin: val
                      });
                    }}
                    autoCapitalize="none"
                    style={{
                      borderWidth: 1,
                      width: "80%",
                      borderRadius: 5,
                      backgroundColor: "rgba(220,220,220,0.3)",
                      marginTop: 20,
                      height: 50,
                      fontSize: 20,
                      paddingLeft: 10
                    }}
                    placeholder="Linkedin Profile"
                    placeholderTextColor="#A9A9A9"
                  />
                  <TextInput
                    value={this.state.Phone}
                    onChangeText={val => {
                      this.setState({
                        Phone: val
                      });
                    }}
                    autoCapitalize="none"
                    style={{
                      borderWidth: 1,
                      width: "80%",
                      borderRadius: 5,
                      backgroundColor: "rgba(220,220,220,0.3)",
                      marginTop: 20,
                      height: 50,
                      fontSize: 20,
                      paddingLeft: 10
                    }}
                    placeholder="Phone"
                    placeholderTextColor="#A9A9A9"
                  />
                  <TextInput
                    value={this.state.BaseEducation}
                    onChangeText={val => {
                      this.setState({
                        BaseEducation: val
                      });
                    }}
                    autoCapitalize="none"
                    style={{
                      borderWidth: 1,
                      width: "80%",
                      borderRadius: 5,
                      backgroundColor: "rgba(220,220,220,0.3)",
                      marginTop: 20,
                      height: 50,
                      fontSize: 20,
                      paddingLeft: 10
                    }}
                    placeholder="Base Education"
                    placeholderTextColor="#A9A9A9"
                  />
                  <TextInput
                    value={this.state.Password}
                    onChangeText={val => {
                      this.setState({
                        Password: val
                      });
                    }}
                    secureTextEntry={true}
                    autoCapitalize="none"
                    style={{
                      borderWidth: 1,
                      width: "80%",
                      borderRadius: 5,
                      backgroundColor: "rgba(220,220,220,0.3)",
                      marginTop: 20,
                      height: 50,
                      fontSize: 20,
                      paddingLeft: 10
                    }}
                    placeholder="Password"
                    placeholderTextColor="#A9A9A9"
                  />
                  <TextInput
                    value={this.state.ConfirmPassword}
                    onChangeText={val => {
                      this.setState({
                        ConfirmPassword: val
                      });
                    }}
                    secureTextEntry={true}
                    autoCapitalize="none"
                    style={{
                      borderWidth: 1,
                      width: "80%",
                      borderRadius: 5,
                      backgroundColor: "rgba(220,220,220,0.3)",
                      marginTop: 20,
                      height: 50,
                      fontSize: 20,
                      paddingLeft: 10
                    }}
                    placeholder="Confirm Password"
                    placeholderTextColor="#A9A9A9"
                  />
                </View>
                <View
                  style={{ marginTop: 20, width: "100%", alignItems: "center" }}
                >
                  <TouchableOpacity
                    onPress={() => this.Login()}
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
                    <Text style={{ color: "white", fontWeight: "bold" }}>
                      Register
                    </Text>
                  </TouchableOpacity>
                </View>
              </KeyboardAvoidingView>
            </ScrollView>
          )}
        </ImageBackground>
      </SafeAreaView>
    );
  }
}

const mapStateToProps = state => ({
  user: state.user
});

export default connect(mapStateToProps, { LoginAction })(Register);
