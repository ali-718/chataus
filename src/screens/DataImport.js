import React, { Component } from "react";
import { Text, View, TouchableOpacity } from "react-native";
import * as f from "firebase";
import { WebView } from "react-native-webview";
import exportFromJSON from "export-from-json";
import * as FileSystem from "expo-file-system";
import axios from "axios";

export default class DataImport extends Component {
  state = {
    isLoading: true,
    users: []
  };

  componentDidMount() {
    f.database()
      .ref("users")
      .once("value")
      .then(snapshot => {
        snapshot.forEach(res => {
          this.state.users.push({ ...res.val(), id: res.key });
        });
        this.setState({
          isLoading: false
        });
      });
  }

  Download = () => {
    // exportFromJSON({ data, fileName, exportType });
    const json = '{"test":true,"test2":false}';
    axios
      .post(`https://json-csv.com/api/getcsv`, {
        email: "alimurtuza718@gmail.com",
        json: json
      })
      .then(res => {
        console.log("Successfull");
        console.log(res.data);
      })
      .catch(e => console.log(e));
  };

  render() {
    return (
      <View
        style={{
          width: "100%",
          flex: 1,
          alignItems: "center",
          justifyContent: "center"
        }}
      >
        <TouchableOpacity onPress={() => this.Download()}>
          <Text>Download</Text>
        </TouchableOpacity>
      </View>
    );
  }
}
