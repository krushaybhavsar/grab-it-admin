import React, { useEffect } from "react";
import "./App.css";
import { Switch, Route, Redirect } from "react-router-dom";
import Login from "./Pages/Login";
import Dashboard from "./Pages/Dashboard";
import Authenticated from "./Components/Authenticated";
import {
  Container,
  Box,
  Typography,
  TextField,
  CircularProgress,
  Button,
} from "@material-ui/core";

function App() {
  useEffect(() => {
    document.title = "Grab It Admin Panel";
  }, []);
  return (
    <Switch>
      <Route exact path="/">
        <Authenticated>
          <Dashboard />
        </Authenticated>
      </Route>
      <Route exact path="/login">
        <Authenticated nonAuthenticated={true}>
          <Login />
        </Authenticated>
      </Route>
      {/* <Route path="*" render={() => "404 Not Found"} /> */}
      <Route
        path="*"
        render={() => (
          <div style={{ textAlign: "center" }}>
            <div style={{ paddingTop: "35vh" }}>
              <Typography variant="h1" color="textSecondary">
                404
              </Typography>
              <Typography variant="h5" color="textSecondary">
                Page not found
              </Typography>
            </div>
          </div>
        )}
      />
    </Switch>
  );
}

export default App;
