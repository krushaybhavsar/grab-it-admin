import React, { useEffect } from "react";
import "./App.css";
import { Switch, Route, Redirect } from "react-router-dom";
import Login from "./Pages/Login";
import Dashboard from "./Pages/Dashboard";
import Authenticated from "./Components/Authenticated";

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
      <Route path="*" render={() => "404 Not Found"} />
    </Switch>
  );
}

export default App;
