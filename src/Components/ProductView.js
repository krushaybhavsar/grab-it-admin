import React from "react";
import { Box, Typography } from "@material-ui/core";
import { grey, green } from "@material-ui/core/colors";

const ProductView = (props) => {
  return (
    <Box
      p="18px"
      bgcolor="white"
      boxShadow="8px"
      mx="4px"
      borderRadius="16px"
      align="center"
    >
      <img
        src={props.item.image}
        style={{
          height: "120px",
          objectFit: "scale-down",
          width: "120px",
          backgroundColor: grey[50],
        }}
      />
      <Box width="110px" component="div" textOverflow="ellipsis">
        <Typography variant="subtitle1" align="center">
          {props.item.title}
        </Typography>
      </Box>
      <Box width="110px" component="div" textOverflow="ellipsis">
        <Typography variant="subtitle2" align="center">
          <span style={{ color: "#194B96" }}>{props.item.subtitle}</span>
        </Typography>
      </Box>
      <Typography variant="h6" align="center">
        ${props.item.price}
      </Typography>
    </Box>
  );
};

export default ProductView;
