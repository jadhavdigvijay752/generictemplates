import React, { useState, useEffect } from "react";
import "./Employee.css";

function Employee() {
  const [loading, setLoading] = useState(false);
  const [loader, setLoader] = useState(false);
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

  const [formSubmit, setFormSubmit] = useState(0); // form submit button disabling and enabling

  // email regex
  const mailformat = /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/;

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

  return (
    <>
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
    </>
  );
}

export default Employee;
