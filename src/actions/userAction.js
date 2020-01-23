import { USER, NOTHING } from "./types";
import * as f from "firebase";

export const LoginAction = userDetails => dispatch => {
  console.log("LoginAction called");
  dispatch({
    type: USER,
    payload: userDetails
  });
};

export const LogoutUser = navigation => dispatch => {
  f.auth()
    .signOut()
    .then(() => {
      navigation.navigate("Login");
      dispatch({
        type: NOTHING
      });
    });
};
