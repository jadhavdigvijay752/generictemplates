import React, { useState, useEffect } from "react";
import "./Employee.css";
import firebase from "../../firebase/Firebase";
import MaterialTable from "material-table";
import {
  Backdrop,
  Button,
  Fade,
  InputLabel,
  makeStyles,
  Modal,
  TextField,
} from "@material-ui/core";
import Loader from "../generic/loader/Loader";
const useStyles = makeStyles((theme) => ({
  modal: {
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    border: "none",
  },
  paper: {
    backgroundColor: theme.palette.background.paper,
    boxShadow: "rgba(99, 99, 99, 0.2) 0px 2px 8px 0px",
    padding: theme.spacing(2, 4, 3),
  },
}));

function Employee() {
  const [loading, setLoading] = useState(false);
  const [loader, setLoader] = useState(false);
  const classes = useStyles();
  const [inputWarnings, setInputWarnings] = useState({
    currentWarning: {
      emailIdWarning: "Please add a proper email",
      passwordWarning:
        "Password should be alphanumeric and must contain minimum 6 letters",
      fullNameWarning: "Name must contain more than three letters",
      phoneNumberWarning: "Incorrect phone number",
    },
  });
  const [inputValidStatus, setInputValidStatus] = useState({
    currentValidStatus: {
      emailIdWarning: null,
      passwordWarning: null,
      fullNameWarning: null,
      phoneNumberWarning: null,
    },
  });
  const [employeeDetails, setEmployeeDetails] = useState({
    currentEmployee: {
      fullName: "",
      emailId: "",
      password: "",
      phoneNumber: "",
      timestamp: "",
    },
  });
  const db = firebase.firestore();
  const [employee, setemployee] = useState([]);
  const [employeeId, setemployeeId] = useState([]);
  const [open, setOpen] = React.useState(false);
  const [passwordWarning, setPasswordWarning] = useState(false);
  const [formSubmit, setFormSubmit] = useState(0);
  // email regex
  var mailformat = /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/;
  async function fetchEmployee() {
    setemployee([]);
    await db
      .collection("Employee")
      .get()
      .then((res) => {
        res.forEach((item) => {
          setemployee((employee) => [...employee, item.data()]);
          setemployeeId((employeeId) => [...employeeId, item.id]);
        });
        setLoading(false);
      })
      .catch((err) => {
        console.log("Error while fetching employee", err);
      });
  }

  useEffect(() => {
    setLoading(true);
    fetchEmployee();
  }, []);

  const columns = [
    { title: "Full Name", field: "fullName" },
    {
      title: "Email",
      field: "emailId",
    },
    {
      title: "Phone",
      field: "phoneNumber",
    },
    // { title: "Joining date", field: "timestamp" },
  ];
  function checkPasswordComplexity(pwd) {
    var letter = /[a-zA-Z]/;
    var number = /[0-9]/;
    var valid = number.test(pwd) && letter.test(pwd) && pwd.length >= 6; //match a letter _and_ a number
    return valid;
  }
  async function validateInput(name, field) {
    if (name === "fullName") {
      if (field.length < 4) {
        // second parameter of this is callback function
        setFormSubmit(0, () => {
          setInputValidStatus({
            currentValidStatus: {
              ...inputValidStatus.currentValidStatus,
              fullNameWarning: true,
            },
          });
        });
        return;
      } else {
        setInputValidStatus({
          currentValidStatus: {
            ...inputValidStatus.currentValidStatus,
            fullNameWarning: false,
          },
        });
      }
    } else if (name === "password") {
      if (checkPasswordComplexity(field)) {
        setInputValidStatus({
          currentValidStatus: {
            ...inputValidStatus.currentValidStatus,
            passwordWarning: false,
          },
        });
      } else {
        setFormSubmit(0, () => {
          setInputValidStatus({
            currentValidStatus: {
              ...inputValidStatus.currentValidStatus,
              passwordWarning: true,
            },
          });
        });
        return;
      }
    } else if (name === "emailId") {
      if (!field.match(mailformat)) {
        setFormSubmit(0, () => {
          setInputValidStatus({
            currentValidStatus: {
              ...inputValidStatus.currentValidStatus,
              emailIdWarning: true,
            },
          });
        });

        return;
      } else {
        setInputValidStatus({
          currentValidStatus: {
            ...inputValidStatus.currentValidStatus,
            emailIdWarning: false,
          },
        });
        console.log("email right");
      }
    } else if (name === "phoneNumber") {
      if (field.length === 10) {
        console.log("phone right", field.length);
        setInputValidStatus({
          currentValidStatus: {
            ...inputValidStatus.currentValidStatus,
            phoneNumberWarning: false,
          },
        });
      } else {
        setFormSubmit(0, () => {
          setInputValidStatus({
            currentValidStatus: {
              ...inputValidStatus.currentValidStatus,
              phoneNumberWarning: true,
            },
          });
        });

        return;
      }
    }
    if (
      inputValidStatus.currentValidStatus.fullNameWarning === false &&
      inputValidStatus.currentValidStatus.emailIdWarning === false &&
      inputValidStatus.currentValidStatus.passwordWarning === false &&
      inputValidStatus.currentValidStatus.phoneNumberWarning === false
    ) {
      setFormSubmit(1);
    }
  }
  const handleChange = (e) => {
    setFormSubmit(0);

    validateInput(e.target.name, e.target.value); //validating input
    setEmployeeDetails({
      currentEmployee: {
        ...employeeDetails.currentEmployee,
        [e.target.name]: e.target.value,
      },
    });
  };
  const handleOpen = () => {
    setEmployeeDetails({
      currentEmployee: {
        fullName: "",
        emailId: "",
        password: "",
        phoneNumber: "",
        timestamp: "",
      },
    });
    setOpen(true);
  };

  const handleClose = () => {
    setOpen(false);
  };
  const handleAddEmployee = (e) => {
    e.preventDefault();
    setLoader(true);
    console.log("users", employeeDetails);
    firebase
      .auth()
      .createUserWithEmailAndPassword(
        employeeDetails.currentEmployee.emailId,
        employeeDetails.currentEmployee.password
      )
      .then((userCredential) => {
        // Signed in
        var user = userCredential.user;
        db.collection("Employee")
          .add({
            fullName: employeeDetails.currentEmployee.fullName,
            emailId: employeeDetails.currentEmployee.emailId,
            password: employeeDetails.currentEmployee.password,
            phoneNumber: employeeDetails.currentEmployee.phoneNumber,
            uid: user.uid,
            type: "employee",
            timestamp: firebase.firestore.FieldValue.serverTimestamp(),
          })
          .then((res) => {
            console.log("Data added successfully", res);
            setOpen(false);
            window.location.reload();
          })
          .catch((err) => {
            console.log("Error in adding new category", err);
          });
      })
      .catch((error) => {
        var errorCode = error.code;
        var errorMessage = error.message;
        console.log(errorCode, errorMessage);
        // ..
      });
  };
  if (loading) {
    return <Loader />;
  }
  return (
    <>
      <Modal
        aria-labelledby="transition-modal-title"
        aria-describedby="transition-modal-description"
        className={classes.modal}
        open={open}
        onClose={handleClose}
        closeAfterTransition
        BackdropComponent={Backdrop}
        BackdropProps={{
          timeout: 500,
        }}
      >
        <Fade in={open}>
          <div className={classes.paper} style={{ width: "40%" }}>
            <h2>Add Employee</h2>
            <form onSubmit={handleAddEmployee}>
              <InputLabel className="label">Employee Name</InputLabel>
              <TextField
                placeholder="Full Name"
                onChange={handleChange}
                variant="outlined"
                name="fullName"
                fullWidth
                required
                value={employeeDetails?.currentEmployee?.fullName}
              />
              {inputValidStatus.currentValidStatus.fullNameWarning && (
                <small style={{ color: "red" }}>
                  {inputWarnings.currentWarning.fullNameWarning}
                </small>
              )}
              <InputLabel className="label">Employee Email</InputLabel>
              <TextField
                fullWidth
                placeholder="Email"
                onChange={handleChange}
                name="emailId"
                type="email"
                variant="outlined"
                required
                value={employeeDetails?.currentEmployee?.emailId}
              />
              {inputValidStatus.currentValidStatus.emailIdWarning && (
                <small style={{ color: "red" }}>
                  {inputWarnings.currentWarning.emailIdWarning}
                </small>
              )}
              <InputLabel className="label">Employee Phone</InputLabel>
              <TextField
                fullWidth
                required
                placeholder="Phone Number"
                onChange={handleChange}
                name="phoneNumber"
                type="number"
                variant="outlined"
                value={employeeDetails?.currentEmployee?.phoneNumber}
              />
              {inputValidStatus.currentValidStatus.phoneNumberWarning && (
                <small style={{ color: "red" }}>
                  {inputWarnings.currentWarning.phoneNumberWarning}
                </small>
              )}
              <InputLabel className="label">Password</InputLabel>
              <TextField
                fullWidth
                required
                placeholder="Password"
                onChange={handleChange}
                name="password"
                type="text"
                variant="outlined"
                value={employeeDetails?.currentEmployee?.password}
              />
              {inputValidStatus.currentValidStatus.passwordWarning && (
                <small style={{ color: "red" }}>
                  {inputWarnings.currentWarning.passwordWarning}
                </small>
              )}
              <p>Flag : {formSubmit}</p>
              <div
                style={{
                  display: "flex",
                  justifyContent: "center",
                  marginTop: "2%",
                }}
              >
                {loader ? (
                  <Loader />
                ) : (
                  <>
                    {formSubmit === 1 ? (
                      <Button
                        variant="contained"
                        color="secondary"
                        fullWidth
                        type="submit"
                        style={{
                          background: "#5e5df0",
                          color: "white",
                        }}
                      >
                        Add Employee {formSubmit} : {typeof formSubmit}
                      </Button>
                    ) : (
                      <Button
                        variant="contained"
                        color="secondary"
                        fullWidth
                        disabled
                        type="submit"
                      >
                        Add Employee {formSubmit} : {typeof formSubmit}
                      </Button>
                    )}
                  </>
                )}
              </div>
            </form>
          </div>
        </Fade>
      </Modal>
      <div style={{ display: "flex", justifyContent: "right" }}>
        <Button
          onClick={handleOpen}
          variant="contained"
          color="secondary"
          style={{ marginBottom: "2%", background: "#5e5df0" }}
        >
          Add Employee
        </Button>
      </div>

      <MaterialTable
        title="Employees"
        columns={columns}
        data={employee}
        editable={{
          onRowUpdate: (newData, oldData) =>
            new Promise((resolve, reject) => {
              setTimeout(() => {
                const dataUpdate = [...employee];
                const index = oldData.tableData.id;
                dataUpdate[index] = newData;
                setemployee([...dataUpdate]);
                db.collection("Employee")
                  .doc(employeeId[index])
                  .update({
                    name: newData.name,
                    description: newData.description,
                    timestamp: firebase.firestore.FieldValue.serverTimestamp(),
                  })
                  .then((res) => {
                    console.log("Data updated successfully");
                  })
                  .catch((err) => {
                    console.log("Error in adding new Employee", err);
                  });
                resolve();
              }, 1000);
            }),
          onRowDelete: (oldData) =>
            new Promise((resolve, reject) => {
              setTimeout(() => {
                const dataDelete = [...employee];
                const index = oldData.tableData.id;
                dataDelete.splice(index, 1);
                setemployee([...dataDelete]);
                db.collection("Employee")
                  .doc(employeeId[index])
                  .delete()
                  .then((res) => {
                    console.log("Data updated successfully");
                  })
                  .catch((err) => {
                    console.log("Error in adding new Employee", err);
                  });
                resolve();
              }, 1000);
            }),
        }}
      />
    </>
  );
}

export default Employee;
