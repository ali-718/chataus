import { StyleSheet, Platform } from "react-native";

export default styles = StyleSheet.create({
  SafeArea: {
    paddingTop: Platform.OS === "android" ? 25 : 0,
    flex: 1
  }
});
