import React from "react";
import { StyleSheet, View } from "react-native";

import LinkedInModal from "react-native-linkedin";

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
    justifyContent: "center",
    alignItems: "center"
  }
});

export default class AppContainer extends React.Component {
  render() {
    return (
      <View style={styles.container}>
        <LinkedInModal
          clientID="81ksg80x2hp2o4"
          clientSecret="iGDLnlTvPPaIPKSj"
          onSuccess={token => console.log(token)}
          redirectUri="https://www.linkedin.com/company/auspronetwork/about/"
        />
        <Button title="Log Out" />
      </View>
    );
  }
}
