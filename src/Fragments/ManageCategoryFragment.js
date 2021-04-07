import React, { Component } from "react";
import { Button, Container } from "@material-ui/core";
import MaterialTable from "material-table";
import { forwardRef } from "react";

import AddBox from "@material-ui/icons/AddBox";
import ArrowDownward from "@material-ui/icons/ArrowDownward";
import Check from "@material-ui/icons/Check";
import ChevronLeft from "@material-ui/icons/ChevronLeft";
import ChevronRight from "@material-ui/icons/ChevronRight";
import Clear from "@material-ui/icons/Clear";
import DeleteOutline from "@material-ui/icons/DeleteOutline";
import Edit from "@material-ui/icons/Edit";
import FilterList from "@material-ui/icons/FilterList";
import FirstPage from "@material-ui/icons/FirstPage";
import LastPage from "@material-ui/icons/LastPage";
import Remove from "@material-ui/icons/Remove";
import SaveAlt from "@material-ui/icons/SaveAlt";
import Search from "@material-ui/icons/Search";
import ViewColumn from "@material-ui/icons/ViewColumn";
import { connect } from "react-redux";
import { firestore, storageRef } from "../firebase";
import { addCategory } from "../Components/Actions/categoryActions";

const tableIcons = {
  Add: forwardRef((props, ref) => <AddBox {...props} ref={ref} />),
  Check: forwardRef((props, ref) => <Check {...props} ref={ref} />),
  Clear: forwardRef((props, ref) => <Clear {...props} ref={ref} />),
  Delete: forwardRef((props, ref) => <DeleteOutline {...props} ref={ref} />),
  DetailPanel: forwardRef((props, ref) => (
    <ChevronRight {...props} ref={ref} />
  )),
  Edit: forwardRef((props, ref) => <Edit {...props} ref={ref} />),
  Export: forwardRef((props, ref) => <SaveAlt {...props} ref={ref} />),
  Filter: forwardRef((props, ref) => <FilterList {...props} ref={ref} />),
  FirstPage: forwardRef((props, ref) => <FirstPage {...props} ref={ref} />),
  LastPage: forwardRef((props, ref) => <LastPage {...props} ref={ref} />),
  NextPage: forwardRef((props, ref) => <ChevronRight {...props} ref={ref} />),
  PreviousPage: forwardRef((props, ref) => (
    <ChevronLeft {...props} ref={ref} />
  )),
  ResetSearch: forwardRef((props, ref) => <Clear {...props} ref={ref} />),
  Search: forwardRef((props, ref) => <Search {...props} ref={ref} />),
  SortArrow: forwardRef((props, ref) => <ArrowDownward {...props} ref={ref} />),
  ThirdStateCheck: forwardRef((props, ref) => <Remove {...props} ref={ref} />),
  ViewColumn: forwardRef((props, ref) => <ViewColumn {...props} ref={ref} />),
};

class ManageCategoryFragment extends Component {
  constructor(props) {
    super(props);

    this.state = {
      columns: [
        { title: "Index", field: "index", type: "numeric" },
        { title: "Category", field: "categoryName" },
        {
          title: "Icon",
          field: "icon",
          editComponent: (props) => (
            <>
              <input
                accept="image/*"
                id="contained-button-file"
                onChange={(e) => {
                  if (e.target.files && e.target.files[0]) {
                    this.setState({
                      image: e.target.files[0],
                    });
                    props.onChange(e.target.value);
                    e.target.value = null;
                  }
                }}
                hidden
                name="image"
                type="file"
              />
              <label htmlFor="contained-button-file">
                {this.state.image ? (
                  <img
                    src={this.renderImageUrl(this.state.image)}
                    style={{ width: 25, height: 25 }}
                  />
                ) : (
                  <Button variant="contained" color="primary" component="span">
                    Add Image
                  </Button>
                )}
              </label>
            </>
          ),
          render: (rowData) => (
            <img src={rowData.icon} style={{ width: 25, height: 25 }} />
          ),
        },
      ],
    };
  }

  renderImageUrl = (item) => {
    try {
      return URL.createObjectURL(item);
    } catch (error) {
      return item;
    }
  };

  uploadImage = (onCompleted) => {
    let file = this.state.image;
    try {
      if (file.startsWith("https")) {
        onCompleted(file);
      }
    } catch (error) {
      var ts = String(new Date().getTime()),
        i = 0,
        out = "";

      for (i = 0; i < ts.length; i += 2) {
        out += Number(ts.substr(i, 2)).toString(36);
      }

      let filename = "category" + out;

      var uploadTask = storageRef
        .child("categories/" + filename + ".jpg")
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
            onCompleted(downloadUrl);
          });
        }
      );
    }
  };

  render() {
    return (
      <div>
        <Container maxWidth="md" fixed>
          <MaterialTable
            icons={tableIcons}
            title="Editable Example"
            columns={this.state.columns}
            data={this.props.categories}
            editable={{
              onRowAdd: (newData) =>
                new Promise((resolve) => {
                  if (newData.index && newData.categoryName && newData.icon) {
                    this.uploadImage((url) => {
                      newData["icon"] = url;
                      this.props.addCategory(
                        newData,
                        () => resolve(),
                        (error) => resolve()
                      );
                    });
                  } else {
                    resolve();
                    this.setState({
                      image: null,
                    });
                  }
                }),
              onRowUpdate: (newData, oldData) =>
                new Promise((resolve) => {
                  setTimeout(() => {
                    resolve();
                    if (oldData) {
                      this.setState((prevState) => {
                        const data = [...prevState.data];
                        data[data.indexOf(oldData)] = newData;
                        return { ...prevState, data };
                      });
                    }
                  }, 600);
                }),
              onRowDelete: (oldData) =>
                new Promise((resolve) => {
                  setTimeout(() => {
                    resolve();
                    this.setState((prevState) => {
                      const data = [...prevState.data];
                      data.splice(data.indexOf(oldData), 1);
                      return { ...prevState, data };
                    });
                  }, 600);
                }),
            }}
          />
        </Container>
      </div>
    );
  }
}

const mapStateToProps = (state) => {
  return {
    categories: state.categories,
  };
};

const mapDispatchToProps = (dispatch) => {
  return {
    addCategory: (data, onSuccess, onError) =>
      dispatch(addCategory(data, onSuccess, onError)),
  };
};

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(ManageCategoryFragment);
