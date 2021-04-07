import React from "react";
import { Box, Typography } from "@material-ui/core";
import ProductView from "./ProductView";
import { IconButton, Menu, MenuItem } from "@material-ui/core";
import { MoreVert } from "@material-ui/icons";

const GridView = (props) => {
  const [anchorEl, setAnchorEl] = React.useState(null);
  const open = Boolean(anchorEl);

  const handleClick = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };
  return (
    <>
      <div style={{ backgroundColor: "#e8e8e8", textAlign: "right" }}>
        <IconButton
          aria-label="more"
          aria-controls="long-menu"
          aria-haspopup="true"
          onClick={handleClick}
          //style={{ color: "white" }}
        >
          <MoreVert />
        </IconButton>
        <Menu
          id="long-menu"
          anchorEl={anchorEl}
          keepMounted
          open={open}
          onClose={handleClose}
          PaperProps={{
            style: {
              width: "20ch",
            },
          }}
        >
          <MenuItem
            onClick={() => {
              props.edit();
              handleClose();
            }}
          >
            Edit
          </MenuItem>
          <MenuItem
            onClick={() => {
              props.delete();
              handleClose();
            }}
          >
            Delete
          </MenuItem>
        </Menu>
      </div>
      <Box maxWidth style={{ background: props.background }} p="16px" mx="auto">
        <Typography variant="h5">{props.title}</Typography>
        <Box display="flex" p="16px" justifyContent="center">
          <ProductView item={props.products[0]} />
          <ProductView item={props.products[1]} />
        </Box>
        <Box display="flex" p="16px" justifyContent="center">
          <ProductView item={props.products[2]} />
          <ProductView item={props.products[3]} />
        </Box>
      </Box>
    </>
  );
};

export default GridView;
