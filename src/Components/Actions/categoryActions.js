import { firestore } from "../../firebase";

export const loadCategories = (onSuccess, onError) => {
  return (dispatch, getState) => {
    firestore
      .collection("CATEGORIES")
      .orderBy("index")
      .get()
      .then((querySnapshot) => {
        let categories = [];
        if (!querySnapshot.empty) {
          querySnapshot.forEach((doc) => {
            categories.push(doc.data());
          });
          dispatch({ type: "LOAD_CATEGORIES", payload: categories });
          onSuccess();
        }
      })
      .catch((error) => {
        console.log(error);
        onError();
      });
  };
};

export const addCategory = (data, onSuccess, onError) => {
  return (dispatch, getState) => {
    firestore
      .collection("CATEGORIES")
      .doc(data.categoryName.toUpperCase())
      .set(data)
      .then(function (doc) {
        dispatch({ type: "ADD_CATEGORY", payload: data });
        onSuccess();
      })
      .catch((error) => {
        console.log(error);
        onError();
      });
  };
};
