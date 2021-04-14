import React, { Fragment, useState } from "react";
import { makeStyles } from "@material-ui/core/styles";
import Drawer from "@material-ui/core/Drawer";
import AppBar from "@material-ui/core/AppBar";
import CssBaseline from "@material-ui/core/CssBaseline";
import Toolbar from "@material-ui/core/Toolbar";
import List from "@material-ui/core/List";
import Typography from "@material-ui/core/Typography";
import Divider from "@material-ui/core/Divider";
import ListItem from "@material-ui/core/ListItem";
import ListItemIcon from "@material-ui/core/ListItemIcon";
import ListItemText from "@material-ui/core/ListItemText";
import {
  Home,
  Category,
  Phonelink,
  ShoppingCart,
  Settings,
  ExitToApp,
  PinDropSharp,
} from "@material-ui/icons";
import logoWord from "../media/logoWord.png";
import HomeFragment from "../Fragments/HomeFragment";
import ManageCategoryFragment from "../Fragments/ManageCategoryFragment";
import { signOut } from "../Components/Actions/authActions";
import LogOutFragment from "../Fragments/LogOutFragment";

const drawerWidth = 240;

const useStyles = makeStyles((theme) => ({
  root: {
    display: "flex",
  },
  appBar: {
    zIndex: theme.zIndex.drawer + 1,
  },
  drawer: {
    width: drawerWidth,
    flexShrink: 0,
  },
  drawerPaper: {
    width: drawerWidth,
  },
  drawerContainer: {
    overflow: "auto",
  },
  content: {
    flexGrow: 1,
    padding: theme.spacing(3),
  },
}));

const mapDispatchToProps = (dispatch) => {
  return {
    signOut: () => dispatch(signOut()),
  };
};

export default function ClippedDrawer() {
  const classes = useStyles();
  const [fragment, setfragment] = useState("HOME");
  const loadFragment = () => {
    switch (fragment) {
      case "HOME":
        return <HomeFragment />;
      case "MANAGE_CATEGORY":
        return <ManageCategoryFragment />;
      case "LOG_OUT":
        return <LogOutFragment />;
      default:
        break;
    }
  };

  return (
    <div className={classes.root}>
      <CssBaseline />
      <AppBar position="fixed" className={classes.appBar}>
        <Toolbar>
          <Typography variant="h6" noWrap>
            <img
              src={logoWord}
              height="40px"
              style={{ marginRight: "10px", marginTop: "10px" }}
            />
          </Typography>
        </Toolbar>
      </AppBar>
      <Drawer
        className={classes.drawer}
        variant="permanent"
        classes={{
          paper: classes.drawerPaper,
        }}
      >
        <Toolbar />
        <div className={classes.drawerContainer}>
          <List>
            <ListItem button onClick={(e) => setfragment("HOME")}>
              <ListItemIcon>
                <Home />
              </ListItemIcon>
              <ListItemText primary="Home" />
            </ListItem>

            <ListItem button onClick={(e) => setfragment("MANAGE_CATEGORY")}>
              <ListItemIcon>
                <Category />
              </ListItemIcon>
              <ListItemText primary="Categories" />
            </ListItem>

            <ListItem button>
              <ListItemIcon>
                <Phonelink />
              </ListItemIcon>
              <ListItemText primary="Products" />
            </ListItem>

            <ListItem button>
              <ListItemIcon>
                <ShoppingCart />
              </ListItemIcon>
              <ListItemText primary="Orders" />
            </ListItem>

            <ListItem button>
              <ListItemIcon>
                <Settings />
              </ListItemIcon>
              <ListItemText primary="Settings" />
            </ListItem>

            <Divider />

            <ListItem button onClick={(e) => setfragment("LOG_OUT")}>
              <ListItemIcon>
                <ExitToApp />
              </ListItemIcon>
              <ListItemText primary="Logout" />
            </ListItem>
          </List>
        </div>
      </Drawer>
      <main className={classes.content}>
        <Toolbar />
        {loadFragment()}
      </main>
    </div>
  );
}
