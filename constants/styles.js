import { StyleSheet, Platform, StatusBar } from "react-native";

export default styles = StyleSheet.create({
  SafeArea: {
    paddingTop: Platform.OS === "android" ? StatusBar.currentHeight : 0,
    flex: 1
  }
});
