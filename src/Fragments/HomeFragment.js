import React, { Component } from "react";
import PropTypes from "prop-types";
import { makeStyles } from "@material-ui/core/styles";
import AppBar from "@material-ui/core/AppBar";
import Tabs from "@material-ui/core/Tabs";
import Tab from "@material-ui/core/Tab";
import Typography from "@material-ui/core/Typography";
import Box from "@material-ui/core/Box";
import {
  Container,
  Avatar,
  Backdrop,
  CircularProgress,
  Fab,
  Dialog,
  Toolbar,
  IconButton,
  Button,
  Slide,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  TextField,
  FormControlLabel,
  Checkbox,
  Snackbar,
} from "@material-ui/core";
import BannerSlider from "../Components/BannerSlider";
import ProductView from "../Components/ProductView";
import HorizontalScroller from "../Components/HorizontalScroller";
import StripAdView from "../Components/StripAdView";
import GridView from "../Components/GridView";
import { loadCategories } from "../Components/Actions/categoryActions";
import { connect } from "react-redux";
import {
  Home,
  Add,
  Close,
  Delete,
  ColorLens,
  Search,
} from "@material-ui/icons";
import { loadCategoryPage } from "../Components/Actions/categoryPageActions";
import { firestore, storageRef } from "../firebase";

const Transition = React.forwardRef(function Transition(props, ref) {
  return <Slide direction="up" ref={ref} {...props} />;
});

export class HomeFragment extends Component {
  constructor(props) {
    super(props);
    this.state = {
      loading: true,
      value: 0,
      Page: "HOME",
      addDialog: false,
      images: [],
      colors: [],
      selectedProducts: [],
      positionError: "",
      layout_titleError: "",
      snackbar: "",
      layout_bg: "#ffffff",
      view_type: 0,
    };
  }

  handleChange = (event, newValue) => {
    this.setState({
      value: newValue,
    });
  };

  loadLatestProducts = () => {
    firestore
      .collection("PRODUCTS")
      .orderBy("added_on", "desc")
      .limit(8)
      .get()
      .then((querySnapshot) => {
        let productlist = [];
        if (!querySnapshot.empty) {
          querySnapshot.forEach((doc) => {
            let data = {
              id: doc.id,
              image: doc.data().product_image_1,
              title: doc.data().product_title,
              price: doc.data().product_price,
            };
            productlist.push(data);
          });
        }
        this.setState({
          productlist,
        });
      })
      .catch((error) => {
        console.log(error);
      });
  };

  searchProducts = () => {
    if (!this.state.search) {
      this.loadLatestProducts();
      return;
    }

    this.setState({
      searching: true,
    });

    let keywords = this.state.search.split(" ");
    firestore
      .collection("PRODUCTS")
      .where("tags", "array-contains-any", keywords)
      .get()
      .then((querySnapshot) => {
        let productlist = [];
        if (!querySnapshot.empty) {
          querySnapshot.forEach((doc) => {
            let data = {
              id: doc.id,
              image: doc.data().product_image_1,
              title: doc.data().product_title,
              price: doc.data().product_price,
            };
            productlist.push(data);
          });
        }
        this.setState({
          productlist,
          searching: false,
        });
      })
      .catch((error) => {
        console.log(error);
        this.setState({
          searching: false,
        });
      });
  };

  componentDidMount() {
    if (this.props.categories == null) {
      this.props.loadCategories(
        () => {
          this.props.loadPage(
            "HOME",
            () => {
              this.setState({ loading: false });
            },
            () => {
              this.setState({ loading: false });
              //Error Handling
            }
          );
        },
        () => {
          this.setState({ loading: false });
          //Error Handling
        }
      );
    } else {
      this.setState({ loading: false });
    }
  }

  onFieldChange = (e) => {
    this.setState({
      [e.target.name]: e.target.value,
    });
  };

  removeImage = (index) => {
    let images = this.state.images;
    let colors = this.state.colors;

    let image = images[index];
    images.splice(index, 1);
    colors.splice(index, 1);
    try {
      if (image.startsWith("https")) {
        this.setState(
          { loading: true },
          this.deleteImages([image], 0, () => {
            this.setState({
              loading: false,
              images,
              colors,
            });
          })
        );
      }
    } catch (error) {
      this.setState({
        images,
        colors,
      });
    }
  };

  uploadProductSection = () => {
    this.setState({
      loading: true,
    });
    let data;
    if (this.state.editMode) {
      let products = [];
      this.state.selectedProducts.forEach((element) => {
        products.push(element.id);
      });
      data = {
        view_type: this.state.view_type,
        layout_title: this.state.layout_title,
        index: parseInt(this.state.position),
        layout_background: this.state.layout_bg,
        products,
      };
    } else {
      data = {
        view_type: this.state.view_type,
        layout_title: this.state.layout_title,
        index: parseInt(this.state.position),
        layout_background: this.state.layout_bg,
        products: this.state.selectedProducts,
      };
    }
    const onComplete = () => {
      let sections = this.props.categoryPages[this.state.Page];
      if (this.state.editMode) {
        data["id"] = this.state.doc_id;
        let section = sections.filter(
          (item) => item.id === this.state.doc_id
        )[0];
        sections[sections.indexOf(section)] = data;
      } else {
        sections.push(data);
        sections.sort((a, b) => a.index - b.index);
      }

      this.props.addSection(this.state.Page, sections);
      this.setState({
        position: null,
        images: [],
        view_type: 0,
        colors: [],
        loading: false,
        addDialog: false,
        editMode: false,
        selectedProducts: [],
        layout_title: null,
        layout_background: null,
      });
    };
    if (this.state.editMode) {
      firestore
        .collection("CATEGORIES")
        .doc(this.state.Page)
        .collection("TOP_DEALS")
        .doc(this.state.doc_id)
        .set(data)
        .then(function (doc) {
          onComplete();
        })
        .catch((err) => {
          this.setState({
            loading: false,
          });
          //Error
        });
    } else {
      firestore
        .collection("CATEGORIES")
        .doc(this.state.Page)
        .collection("TOP_DEALS")
        .add(data)
        .then(function (doc) {
          data["id"] = doc.id;
          onComplete();
        })
        .catch((err) => {
          this.setState({
            loading: false,
          });
          //Error
        });
    }
  };

  save = () => {
    this.setState({
      positionError: "",
      layout_titleError: "",
    });
    if (!this.state.position) {
      this.setState({
        positionError: "Required!",
      });
      return;
    }
    switch (this.state.view_type) {
      case 0:
        if (this.state.images.length < 3) {
          this.setState({
            snackbar: "A minimum of 3 images is required!",
          });
          return;
        }
        let index = 0;
        let urls = [];
        this.setState({
          loading: true,
        });
        this.uploadImages(this.state.images, index, urls, () => {
          let data = {
            view_type: 0,
            no_of_banners: urls.length,
            index: parseInt(this.state.position),
          };
          for (let x = 0; x < urls.length; x++) {
            data["banner_" + (x + 1)] = urls[x];
            data["banner_" + (x + 1) + "_background"] = this.state.colors[x];
          }
          const onComplete = () => {
            let sections = this.props.categoryPages[this.state.Page];
            if (this.state.editMode) {
              data["id"] = this.state.doc_id;
              let section = sections.filter(
                (item) => item.id === this.state.doc_id
              )[0];
              sections[sections.indexOf(section)] = data;
            } else {
              sections.push(data);
              sections.sort((a, b) => a.index - b.index);
            }
            this.props.addSection(this.state.Page, sections);
            this.setState({
              position: null,
              images: [],
              view_type: 0,
              colors: [],
              loading: false,
              addDialog: false,
              editMode: false,
              selectedProducts: [],
              layout_title: null,
              layout_background: null,
            });
          };
          if (this.state.editMode) {
            firestore
              .collection("CATEGORIES")
              .doc(this.state.Page)
              .collection("TOP_DEALS")
              .doc(this.state.doc_id)
              .set(data)
              .then(function (doc) {
                onComplete();
              })
              .catch((err) => {
                this.setState({
                  loading: false,
                });
                //Error
              });
          } else {
            firestore
              .collection("CATEGORIES")
              .doc(this.state.Page)
              .collection("TOP_DEALS")
              .add(data)
              .then(function (doc) {
                data["id"] = doc.id;
                onComplete();
              })
              .catch((err) => {
                this.setState({
                  loading: false,
                });
                //Error
              });
          }
        });
        break;
      case 1:
        if (this.state.images.length < 1) {
          this.setState({
            snackbar: "An image is required!",
          });
          return;
        }
        let index2 = 0;
        let urls2 = [];
        this.setState({
          loading: true,
        });
        this.uploadImages([this.state.images[0]], index2, urls2, () => {
          let data = {
            view_type: 1,
            strip_ad_banner: urls2[0],
            index: parseInt(this.state.position),
            background: this.state.colors[0],
          };
          const onComplete = () => {
            let sections = this.props.categoryPages[this.state.Page];

            if (this.state.editMode) {
              data["id"] = this.state.doc_id;
              let section = sections.filter(
                (item) => item.id === this.state.doc_id
              )[0];
              sections[sections.indexOf(section)] = data;
            } else {
              sections.push(data);
              sections.sort((a, b) => a.index - b.index);
            }

            this.props.addSection(this.state.Page, sections);

            this.setState({
              position: null,
              images: [],
              view_type: 0,
              colors: [],
              loading: false,
              addDialog: false,
              selectedProducts: [],
              editMode: false,
              layout_title: null,
              layout_background: null,
            });
          };

          if (this.state.editMode) {
            firestore
              .collection("CATEGORIES")
              .doc(this.state.Page)
              .collection("TOP_DEALS")
              .doc(this.state.doc_id)
              .set(data)
              .then(function (doc) {
                onComplete();
              })
              .catch((err) => {
                this.setState({
                  loading: false,
                });
                //Error
              });
          } else {
            firestore
              .collection("CATEGORIES")
              .doc(this.state.Page)
              .collection("TOP_DEALS")
              .add(data)
              .then(function (doc) {
                data["id "] = doc.id;
                onComplete();
              })
              .catch((err) => {
                this.setState({
                  loading: false,
                });
                //Error
              });
          }
        });

        break;
      case 2:
        if (!this.state.layout_title) {
          this.setState({
            layout_titleError: "Required!",
          });
          return;
        }
        if (this.state.selectedProducts.length < 8) {
          this.setState({
            snackbar:
              "At least 8 products are required to add a horizontal scroller!",
          });
        }
        this.uploadProductSection();
        break;
      case 3:
        if (!this.state.layout_title) {
          this.setState({
            layout_titleError: "Required!",
          });
          return;
        }
        if (this.state.selectedProducts.length < 4) {
          this.setState({
            snackbar: "At least 4 products are required to add a grid view!",
          });
        }
        this.uploadProductSection();
        break;
      default:
    }
  };

  deleteImages = (images, index, onComplete) => {
    const deleteAgain = (images, index, onComplete) =>
      this.deleteImages(images, index, onComplete);

    let splitted_link = images[index].split("/");
    let name = splitted_link[splitted_link.length - 1]
      .split("?")[0]
      .replace("banners%2F", "");

    storageRef
      .child("banners/" + name)
      .delete()
      .then(() => {
        index++;
        if (index < images.length) {
          deleteAgain(images, index, onComplete);
        } else {
          onComplete();
        }
      })
      .catch((err) => {
        this.setState({ loading: false });
      });
  };

  uploadImages = (images, index, urls, onCompleted) => {
    const uploadAgain = (images, index, urls, onCompleted) =>
      this.uploadImages(images, index, urls, onCompleted);

    let file = images[index];
    try {
      if (file.startsWith("https")) {
        urls.push(file);
        index++;
        if (index < images.length) {
          uploadAgain(images, index, urls, onCompleted);
        } else {
          onCompleted();
        }
      }
    } catch (error) {
      var ts = String(new Date().getTime()),
        i = 0,
        out = "";

      for (i = 0; i < ts.length; i += 2) {
        out += Number(ts.substr(i, 2)).toString(36);
      }

      let filename = "banner" + out;

      var uploadTask = storageRef
        .child("banners/" + filename + ".jpg")
        .put(file);
      uploadTask.on(
        "state_changed",
        function (snapshot) {
          var progress =
            (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
          console.log("Upload is " + progress + "% done");
        },
        function (error) {
          // Handle unsuccessful uploads
        },
        function () {
          uploadTask.snapshot.ref.getDownloadURL().then((downloadUrl) => {
            urls.push(downloadUrl);
            index++;
            if (index < images.length) {
              uploadAgain(images, index, urls, onCompleted);
            } else {
              onCompleted();
            }
          });
        }
      );
    }
  };

  renderImageUrl = (item) => {
    try {
      return URL.createObjectURL(item);
    } catch (error) {
      return item;
    }
  };

  render() {
    return (
      <div>
        <Container maxWidth="md" fixed>
          <AppBar position="static" color="white">
            <Tabs
              value={this.state.value}
              onChange={this.handleChange}
              indicatorColor="secondary"
              textColor="secondary"
              variant="scrollable"
              scrollButtons="auto"
              aria-label="scrollable auto tabs example"
            >
              {this.props.categories
                ? this.props.categories.map((category) => (
                    <Tab
                      icon={
                        <CategoryTab
                          icon={category.icon}
                          title={category.categoryName}
                        />
                      }
                      onClick={(e) => {
                        if (
                          this.props.categoryPages[
                            category.categoryName.toUpperCase()
                          ]
                        ) {
                          this.setState({
                            Page: category.categoryName.toUpperCase(),
                          });
                        } else {
                          this.setState({ loading: true });
                          this.props.loadPage(
                            category.categoryName.toUpperCase(),
                            () => {
                              this.setState({
                                loading: false,
                                Page: category.categoryName.toUpperCase(),
                              });
                            },
                            () => {
                              this.setState({ loading: false });
                              //Error Handling
                            }
                          );
                        }
                      }}
                    />
                  ))
                : null}
            </Tabs>
          </AppBar>

          {this.props.categoryPages
            ? this.props.categoryPages[this.state.Page].map(
                (item, indexMain) => {
                  switch (item.view_type) {
                    case 0:
                      let banners = [];
                      let images = [];
                      let colors = [];
                      for (
                        let index = 1;
                        index < item.no_of_banners + 1;
                        index++
                      ) {
                        const banner = item["banner_" + index];
                        const background =
                          item["banner_" + index + "_background"];
                        banners.push({ banner, background });
                        images.push(banner);
                        colors.push(background);
                      }
                      return (
                        <BannerSlider
                          edit={() => {
                            this.setState({
                              view_type: item.view_type,
                              position: item.index,
                              images: images,
                              colors: colors,
                              addDialog: true,
                              editMode: true,
                              doc_id: item.id,
                            });
                          }}
                          delete={() =>
                            this.setState(
                              {
                                loading: true,
                              },
                              this.deleteImages(images, 0, () => {
                                firestore
                                  .collection("CATEGORIES")
                                  .doc(this.state.Page)
                                  .collection("TOP_DEALS")
                                  .doc(item.id)
                                  .delete()
                                  .then(() => {
                                    this.props.categoryPages[
                                      this.state.Page
                                    ].splice(indexMain, 1);
                                    this.setState({
                                      loading: false,
                                    });
                                  })
                                  .catch((err) => {
                                    this.setState({
                                      loading: false,
                                    });
                                  });
                              })
                            )
                          }
                          Images={banners}
                        />
                      );
                    case 1:
                      return (
                        <StripAdView
                          edit={() => {
                            this.setState({
                              view_type: item.view_type,
                              position: item.index,
                              images: [item.strip_ad_banner],
                              colors: [item.background],
                              addDialog: true,
                              editMode: true,
                              doc_id: item.id,
                            });
                          }}
                          delete={() =>
                            this.setState(
                              {
                                loading: true,
                              },
                              this.deleteImages(
                                [item.strip_ad_banner],
                                0,
                                () => {
                                  firestore
                                    .collection("CATEGORIES")
                                    .doc(this.state.Page)
                                    .collection("TOP_DEALS")
                                    .doc(item.id)
                                    .delete()
                                    .then(() => {
                                      this.props.categoryPages[
                                        this.state.Page
                                      ].splice(indexMain, 1);
                                      this.setState({
                                        loading: false,
                                      });
                                    })
                                    .catch((err) => {
                                      this.setState({
                                        loading: false,
                                      });
                                    });
                                }
                              )
                            )
                          }
                          image={item.strip_ad_banner}
                          background={item.background}
                        />
                      );
                    case 2:
                      let productsData = [];
                      if (!item.loaded) {
                        item.products.forEach((id, index) => {
                          firestore
                            .collection("PRODUCTS")
                            .doc(id)
                            .get()
                            .then((document) => {
                              if (document.exists) {
                                let productData = {
                                  id: id,
                                  title: document.data()["product_title"],
                                  subtitle: document.data()["product_subtitle"],
                                  image: document.data()["product_image_1"],
                                  price: document.data()["product_price"],
                                };
                                productsData.push(productData);
                                if (index === item.products.length - 1) {
                                  item.products = productsData;
                                  item["loaded"] = true;
                                  this.setState({});
                                }
                              }
                            })
                            .catch((err) => {
                              //err
                            });
                        });
                      }

                      // let products = [];
                      // for (
                      //   let index = 1;
                      //   index < item.no_of_products + 1;
                      //   index++
                      // ) {
                      //   let data = {};
                      //   data["title"] = item["product_title_" + index];
                      //   data["subtitle"] = item["product_subtitle_" + index];
                      //   data["price"] = item["product_price_" + index];
                      //   data["image"] = item["product_image_" + index];
                      //   products.push(data);
                      // }
                      return (
                        <HorizontalScroller
                          edit={() => {
                            this.setState({
                              view_type: item.view_type,
                              position: item.index,
                              addDialog: true,
                              editMode: true,
                              doc_id: item.id,
                              selectedProducts: item.products,
                              layout_title: item.layout_title,
                              layout_bg: item.layout_background,
                            });
                          }}
                          delete={() =>
                            this.setState({ loading: true }, () => {
                              firestore
                                .collection("CATEGORIES")
                                .doc(this.state.Page)
                                .collection("TOP_DEALS")
                                .doc(item.id)
                                .delete()
                                .then(() => {
                                  this.props.categoryPages[
                                    this.state.Page
                                  ].splice(indexMain, 1);
                                  this.setState({
                                    loading: false,
                                  });
                                })
                                .catch((err) => {
                                  this.setState({
                                    loading: false,
                                  });
                                });
                            })
                          }
                          products={item.products}
                          title={item.layout_title}
                          background={item.layout_background}
                        />
                      );
                    case 3:
                      let gridData = [];
                      if (!item.loaded) {
                        item.products.forEach((id, index) => {
                          if (index < 4) {
                            firestore
                              .collection("PRODUCTS")
                              .doc(id)
                              .get()
                              .then((document) => {
                                if (document.exists) {
                                  let productData = {
                                    id: id,
                                    title: document.data()["product_title"],
                                    subtitle: document.data()[
                                      "product_subtitle"
                                    ],
                                    image: document.data()["product_image_1"],
                                    price: document.data()["product_price"],
                                  };
                                  gridData.push(productData);
                                  if (index === 3) {
                                    item.products = gridData;
                                    item["loaded"] = true;
                                    this.setState({});
                                  }
                                }
                              })
                              .catch((err) => {
                                //err
                              });
                          }
                        });
                      }
                      return (
                        <GridView
                          edit={() => {
                            this.setState({
                              view_type: item.view_type,
                              position: item.index,
                              addDialog: true,
                              editMode: true,
                              doc_id: item.id,
                              selectedProducts: item.products,
                              layout_title: item.layout_title,
                              layout_bg: item.layout_background,
                            });
                          }}
                          delete={() =>
                            this.setState({ loading: true }, () => {
                              firestore
                                .collection("CATEGORIES")
                                .doc(this.state.Page)
                                .collection("TOP_DEALS")
                                .doc(item.id)
                                .delete()
                                .then(() => {
                                  this.props.categoryPages[
                                    this.state.Page
                                  ].splice(indexMain, 1);
                                  this.setState({
                                    loading: false,
                                  });
                                })
                                .catch((err) => {
                                  this.setState({
                                    loading: false,
                                  });
                                });
                            })
                          }
                          products={item.products}
                          title={item.layout_title}
                          background={item.layout_background}
                        />
                      );
                    default:
                      break;
                  }
                }
              )
            : null}
          <Fab
            color="primary"
            aria-label="add"
            onClick={(e) => this.setState({ editMode: false, addDialog: true })}
            style={{ position: "fixed", bottom: "50px", right: "50px" }}
          >
            <Add />
          </Fab>
        </Container>
        <Dialog
          fullScreen
          open={this.state.addDialog}
          onClose={(e) =>
            this.setState({
              addDialog: false,
            })
          }
          TransitionComponent={Transition}
        >
          <AppBar>
            <Toolbar>
              <IconButton
                edge="start"
                color="inherit"
                onClick={(e) =>
                  this.setState({
                    addDialog: false,
                  })
                }
                aria-label="close"
              >
                <Close />
              </IconButton>
              <Typography variant="h6">
                {this.state.editMode ? "Edit Section" : "Add a Section"}
              </Typography>
              <Button
                autoFocus
                color="inherit"
                style={{ position: "absolute", right: 0 }}
                onClick={(e) => this.save()}
              >
                save
              </Button>
            </Toolbar>
          </AppBar>
          <Toolbar />
          <Box padding="16px">
            <FormControl>
              <InputLabel id="demo-simple-select-label">View Type</InputLabel>
              <Select
                labelId="demo-simple-select-label"
                id="demo-simple-select"
                onChange={(e) => {
                  this.onFieldChange(e);
                  this.setState({
                    colors: [],
                    images: [],
                    selectedProducts: [],
                  });
                }}
                name="view_type"
                defaultValue={this.state.view_type}
              >
                <MenuItem value={0}>Banner Slider</MenuItem>
                <MenuItem value={1}>Strip Ad</MenuItem>
                <MenuItem value={2}>Horizontal Scroller</MenuItem>
                <MenuItem value={3}>Grid View</MenuItem>
              </Select>
              <br />
              <TextField
                label="Position"
                id="outlined-size-small"
                variant="outlined"
                type="number"
                name="position"
                defaultValue={this.state.position}
                size="small"
                error={this.state.positionError !== ""}
                helperText={this.state.positionError}
                onChange={this.onFieldChange}
                margin="dense"
              />
            </FormControl>
            <br />
            <Box display="flex" flexWrap="true">
              {this.state.images.map((item, index) => (
                <Box margin="12px">
                  <img
                    src={this.renderImageUrl(item)}
                    style={{
                      height: "90px",
                      width:
                        this.state.view_type === 0
                          ? "160px"
                          : this.state.view_type === 1
                          ? "210px"
                          : 0,
                      objectFit: "scale-down",
                      backgroundColor: this.state.colors[index],
                    }}
                  />
                  <br />
                  <input
                    id={"contained-button-" + index}
                    type="color"
                    hidden
                    onChange={(e) => {
                      let colors = this.state.colors;
                      colors[index] = e.target.value;
                      this.setState({
                        colors,
                      });
                    }}
                    defaultValue="#000000"
                  />
                  <IconButton
                    aria-label="delete"
                    onClick={(e) => this.removeImage(index)}
                  >
                    <Delete />
                  </IconButton>
                  <label htmlFor={"contained-button-" + index}>
                    <IconButton aria-label="upload picture" component="span">
                      <ColorLens />
                    </IconButton>
                  </label>
                </Box>
              ))}
            </Box>
            <input
              accept="image/*"
              id="contained-button-file"
              onChange={(e) => {
                if (e.target.files && e.target.files[0]) {
                  let images = this.state.images;
                  images.push(e.target.files[0]);
                  this.state.colors.push("#ffffff");
                  this.setState({
                    images,
                  });
                  e.target.value = null;
                }
              }}
              hidden
              name="images"
              type="file"
            />
            <br />
            {this.state.view_type === 0 && this.state.images.length < 8 ? (
              <label htmlFor="contained-button-file">
                <Button variant="contained" color="primary" component="span">
                  Add Image
                </Button>
              </label>
            ) : null}
            {this.state.view_type === 1 && this.state.images.length < 1 ? (
              <label htmlFor="contained-button-file">
                <Button variant="contained" color="primary" component="span">
                  Add Image
                </Button>
              </label>
            ) : null}
            <br />
            {(this.state.view_type === 2 || this.state.view_type === 3) && (
              <div>
                {/* <Box style={{ backgroundColor: this.state.layout_bg }}> */}
                <TextField
                  id="filled-basic"
                  label="Title"
                  style={{ width: "21.8%" }}
                  onChange={this.onFieldChange}
                  error={this.state.layout_titleError !== ""}
                  helperText={this.state.layout_titleError}
                  name="layout_title"
                  defaultValue={this.state.layout_title}
                  variant="standard"
                />
                {/* </Box> */}

                <input
                  id={"contained-button-title"}
                  type="color"
                  hidden
                  onChange={this.onFieldChange}
                  name="layout_bg"
                  defaultValue="#ffffff"
                />
                <br />
                <br />
                <label htmlFor={"contained-button-title"}>
                  <Button
                    aria-label="upload picture"
                    component="span"
                    style={{
                      backgroundColor: this.state.layout_bg,
                    }}
                    variant="contained"
                  >
                    Set Layout Background Color
                  </Button>
                </label>

                <br />
                <br />
                <br />
                <h2>
                  Select a Product to Add ({this.state.selectedProducts.length}{" "}
                  items added)
                </h2>
                <Box display="flex">
                  <TextField
                    name="search"
                    style={{ flexGrow: 1, marginRight: 12 }}
                    onChange={this.onFieldChange}
                    label="Search"
                    variant="outlined"
                    size="small"
                  />
                  <Button
                    variant="contained"
                    color="primary"
                    onClick={(e) => this.searchProducts()}
                  >
                    Search
                  </Button>
                </Box>
                <br />
                {this.state.searching ? (
                  <Box display="flex" justifyContent="center">
                    <CircularProgress margin="dense" />
                  </Box>
                ) : (
                  <Box display="flex" flexWrap="true" bgcolor="#00000010">
                    {this.state.productlist === undefined
                      ? this.loadLatestProducts()
                      : this.state.productlist.map((item, index) => (
                          <FormControlLabel
                            control={
                              <Checkbox
                                defaultChecked={
                                  this.state.selectedProducts.filter(
                                    (x) => x.id === item.id
                                  ).length > 0
                                }
                                onChange={(e) => {
                                  if (e.target.checked) {
                                    this.state.selectedProducts.push(item.id);
                                  } else {
                                    let posi = this.state.selectedProducts.indexOf(
                                      item.id
                                    );
                                    this.state.selectedProducts.splice(posi, 1);
                                  }
                                  this.setState({});
                                }}
                              />
                            }
                            label={<ProductView item={item} />}
                            labelPlacement="bottom"
                            style={{ marginBottom: 20, marginTop: 7 }}
                          />
                        ))}
                  </Box>
                )}
              </div>
            )}
          </Box>
        </Dialog>
        <Backdrop style={{ zIndex: 1600 }} open={this.state.loading}>
          <CircularProgress color="primary" />
        </Backdrop>
        <Snackbar
          anchorOrigin={{
            vertical: "bottom",
            horizontal: "left",
          }}
          open={this.state.snackbar !== ""}
          autoHideDuration={3000}
          onClose={(e) =>
            this.setState({
              snackbar: "",
            })
          }
          message={this.state.snackbar}
        />
      </div>
    );
  }
}

export const CategoryTab = ({ icon, title }) => {
  return (
    <Box textAlign="center">
      {icon !== "null" ? (
        <img src={icon} style={{ height: "30px", width: "30px" }} />
      ) : (
        <Home style={{ fontSize: 35 }} color="secondary" />
      )}
      <Typography variant="body2" textAlign="center">
        {title}
      </Typography>
    </Box>
  );
};

const mapStateToProps = (state) => {
  return {
    categories: state.categories,
    categoryPages: state.categoryPages,
  };
};

const mapDispatchToProps = (dispatch) => {
  return {
    loadCategories: (onSuccess, onError) =>
      dispatch(loadCategories(onSuccess, onError)),
    loadPage: (category, onSuccess, onError) =>
      dispatch(loadCategoryPage(category, onSuccess, onError)),
    addSection: (page, list) =>
      dispatch({ type: "LOAD_PAGE", payload: list, category: page }),
  };
};

export default connect(mapStateToProps, mapDispatchToProps)(HomeFragment);
