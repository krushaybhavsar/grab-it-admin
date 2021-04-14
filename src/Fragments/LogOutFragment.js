import React from "react";
import { connect } from "react-redux";
import { signOut } from "../Components/Actions/authActions";
import {
  Container,
  Box,
  Typography,
  TextField,
  CircularProgress,
  Button,
} from "@material-ui/core";
import { Redirect } from "react-router";

const LogOutFragment = (props) => {
  return (
    <div>
      {props.signOut()}
      <Redirect to="/login" />
    </div>
  );
};

const mapDispatchToProps = (dispatch) => {
  return {
    signOut: () => dispatch(signOut()),
  };
};

export default connect(null, mapDispatchToProps)(LogOutFragment);
