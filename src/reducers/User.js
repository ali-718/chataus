import { USER } from "../actions/types";

const initalstate = {
  user: {}
};

export default function(state = initalstate, action) {
  switch (action.type) {
    case USER:
      return {
        user: action.payload
      };
    default:
      return state;
  }
}
