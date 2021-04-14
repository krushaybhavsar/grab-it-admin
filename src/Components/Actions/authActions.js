import React from "react";
import { Redirect } from "react-router";
import { firebaseAuth } from "../../firebase";

export const signOut = () => {
  return (dispatch, getState) => {
    firebaseAuth.signOut();
  };
};
