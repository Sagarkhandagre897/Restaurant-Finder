import React, { useState, useEffect } from "react";
import Logo from "../Assets/swiggy.svg";
import Arrow from "../Assets/arrow.svg";
import Cart from "../Assets/cart.png";
import Search from "../Assets/search.svg";
import Discount from "../Assets/discount.svg";
import Help from "../Assets/help.svg";
import User from "../Assets/user.png";
import CloseIcon from "@mui/icons-material/Close";
import { Drawer, Box } from "@mui/material";
import { Link, useNavigate } from "react-router-dom";
import "./navbar.css";
import Firebase from "../../Firebase";

export function Navbar() {
  const [isDraweropen, setisDraweropen] = useState(false);
  const [user_signin, setUser_signin] = useState(false);
  const [user_details, setUser_details] = useState(null);
  const [login, setLogin] = useState(true);
  const [signIn, setsignIn] = useState(false);
  const [number, setNumber] = useState("");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [len, setLen] = useState(0);
  const [verificationId, setVerificationId] = useState("");
  const [otp, setOtp] = useState(false);
  const [otp_valid, setOtp_valid] = useState("");

  const location = JSON.parse(localStorage.getItem("Location"));
  let cart = JSON.parse(localStorage.getItem("Cart")) || [];
  const navigate = useNavigate();
  useEffect(() => {
    let user = JSON.parse(localStorage.getItem("user_details"));
    if (user.name !== "") {
      setUser_details(user);
      setUser_signin(true);
      setsignIn(true);
    }
  }, []);

  useEffect(() => {
    setLen(cart.length);
  }, [cart]);

  useEffect(() => {
    setOtp_valid(otp_valid);
  }, [otp_valid]);

  useEffect(() => {
    let user = JSON.parse(localStorage.getItem("user_details"));
    let id = JSON.parse(localStorage.getItem("verificationId"));
    if (user.name == "" || user.email == "" || user.number == "" || id.verificationId == "") {
      let temp = {
        name: name,
        email: email,
        number: number,
      };
      localStorage.setItem("user_details", JSON.stringify(temp));
    }
  }, [name, email, number]);

  // Firebase OTP Authentication
  function handleSubmit_Otp_sigin(e) {
    e.preventDefault();
    const code = otp_valid;
    window.confirmationResult
      .confirm(code)
      .then((result) => {
        const user = result.user;
        setVerificationId(user.uid);
        localStorage.setItem("verificationId", JSON.stringify(user.uid));
        alert("Account created successfully");
        window.location.reload(true);
      })
      .catch((error) => {
        alert(error.message);
      });
    setOtp(false);
    setisDraweropen(false);

  }

  function handleSubmit_Otp_login(e) {
    e.preventDefault();
    const code = otp_valid;
    window.confirmationResult
      .confirm(code)
      .then((result) => {
        const user = result.user;
        let id = JSON.parse(localStorage.getItem("verificationId"));
        if (id !== user.uid) {
          alert(
            "Verification failed ! To Place the Order account must be verified"
          );
        } else {
          alert("User Verified Success!");
        }
      })
      .catch((error) => {
        alert(error.message);
      });
    setOtp(false);
    setisDraweropen(false);
  }

  const configureCaptcha_signIn = () => {
    window.recaptchaVerifier = new Firebase.auth.RecaptchaVerifier(
      "sign-in-button",
      {
        size: "invisible",
        callback: () => {
          onSigninSubmit();
          alert("Recaptcha verified");
        },
        defaultCountry: "IN",
      }
    );
  };
  const configureCaptcha_login = () => {
    window.recaptchaVerifier = new Firebase.auth.RecaptchaVerifier(
      "sign-in-button",
      {
        size: "invisible",
        callback: () => {
          onLogInSubmit();
          alert("Recaptcha verified");
        },
        defaultCountry: "IN",
      }
    );
  };

  const onSigninSubmit = (e) => {
    e.preventDefault();
    let user = JSON.parse(localStorage.getItem("user_details"));
    if (user.name !== "" || user.email !== "" || user.number !== "") {
      configureCaptcha_signIn();
      const phoneNumber = "+91" + number;
      const appVerifier = window.recaptchaVerifier;
      Firebase.auth()
        .signInWithPhoneNumber(phoneNumber, appVerifier)
        .then((confirmationResult) => {
          window.confirmationResult = confirmationResult;
          alert("OTP Sent Successfully !");
        })
        .catch((error) => {
          alert(error.message);
        });
      setOtp(true);
      setisDraweropen(true);
    }
  };
  const onLogInSubmit = (e) => {
    e.preventDefault();
    let user = JSON.parse(localStorage.getItem("user_details"));
    if (user.number !== "") {
      configureCaptcha_login();
      const phoneNumber = "+91" + number;
      const appVerifier = window.recaptchaVerifier;
      Firebase.auth()
        .signInWithPhoneNumber(phoneNumber, appVerifier)
        .then((confirmationResult) => {
          window.confirmationResult = confirmationResult;
          alert("OTP Sent Successfully !");
        })
        .catch((error) => {
          alert(error.message);
        });
      setOtp(true);
      setisDraweropen(true);
    }
  };

  return (
    <>
      <Drawer
        anchor="right"
        open={isDraweropen}
        onClose={() => {
          setisDraweropen(false);
        }}
      >
        <Box role="presentation" p={4} width="500px">
          <CloseIcon
            className="close_icon"
            onClick={() => {
              setisDraweropen(false);
            }}
            style={{ cursor: "pointer" }}
          />
          {login ? (
            <div className="login_form">
              <div className="left_div">
                <h2>Login</h2>
                <p className="link_register">
                  or{" "}
                  <a
                    onClick={() => setLogin(false)}
                    style={{ cursor: "pointer" }}
                  >
                    create an account
                  </a>
                </p>
              </div>
              <hr className="hr_line_drawer" />
              <div className="right_div">
                <img
                  src="https://res.cloudinary.com/swiggy/image/upload/fl_lossy,f_auto,q_auto/Image-login_btpq7r"
                  alt=""
                  className="food_wrap"
                />
              </div>
              <form>
                <div id="sign-in-button"></div>
                <input
                  type="number"
                  name="Number"
                  placeholder="Phone Number"
                  className="Number_input"
                  autoFocus={true}
                  spellCheck="false"
                  value={number}
                  onChange={(e) => {
                    setNumber(e.target.value);
                  }}
                />
                <br />
                <input
                  type="submit"
                  value="CONTINUE"
                  className="login_btn"
                  onClick={onLogInSubmit}
                />
              </form>
              <div className="foot_text">
                <p>
                  By clicking on Login, I accept the terms & Conditions &
                  Privacy Policy
                </p>
              </div>
            </div>
          ) : (
            <div className="login_form">
              <div className="left_div">
                <h2>Sign up</h2>
                <p className="link_register">
                  or{" "}
                  <a
                    style={{ cursor: "pointer" }}
                    onClick={() => setLogin(true)}
                  >
                    login to your account
                  </a>
                </p>
              </div>
              <hr className="hr_line_drawer" />
              <div className="right_div">
                <img
                  src="https://res.cloudinary.com/swiggy/image/upload/fl_lossy,f_auto,q_auto/Image-login_btpq7r"
                  alt=""
                  className="food_wrap"
                />
              </div>
              <form>
                <div id="sign-in-button"></div>
                <input
                  type="number"
                  name="Number"
                  placeholder="Phone Number"
                  className="Number_input_1"
                  autoFocus={true}
                  spellCheck="false"
                  value={number}
                  onChange={(e) => {
                    setNumber(e.target.value);
                  }}
                />
                <br />
                <input
                  type="text"
                  name="user_name"
                  placeholder="Name"
                  className="Number_input_1"
                  value={name}
                  onChange={(e) => {
                    setName(e.target.value);
                  }}
                />
                <br />
                <input
                  type="text"
                  name="email"
                  placeholder="Email"
                  className="Number_input_1"
                  value={email}
                  onChange={(e) => {
                    setEmail(e.target.value);
                  }}
                />
                <br />
                <input
                  type="password"
                  name="password"
                  placeholder="Password"
                  className="Number_input"
                  value={password}
                  onChange={(e) => {
                    setPassword(e.target.value);
                  }}
                />
                <br />

                <input
                  type="submit"
                  value="CONTINUE"
                  className="login_btn"
                  onClick={onSigninSubmit}
                />
              </form>

              <div className="foot_text">
                <p>
                  By clicking on Login, I accept the terms & Conditions &
                  Privacy Policy
                </p>
              </div>
            </div>
          )}
        </Box>
      </Drawer>

      {otp ? (
        <Drawer
          anchor="right"
          open={isDraweropen}
          onClose={() => {
            setisDraweropen(false);
          }}
        >
          <Box role="presentation" p={4} width="500px">
            <CloseIcon
              className="close_icon"
              onClick={() => {
                setisDraweropen(false);
              }}
              style={{ cursor: "pointer" }}
            />
            <div className="login_form">
              <div className="left_div">
                <h2>Enter OTP</h2>
              </div>
              <form>
                <input
                  type="number"
                  name="Number"
                  placeholder="Enter the OTP"
                  className="Number_input"
                  value={otp_valid}
                  onChange={(e) => {
                    setOtp_valid(e.target.value);
                  }}
                />
                <br />
                <input
                  type="submit"
                  value="SUBMIT"
                  className="login_btn"
                  onClick={
                    login ? handleSubmit_Otp_login : handleSubmit_Otp_sigin
                  }
                />
              </form>
              <div className="foot_text">
                <p>
                  By clicking on Login, I accept the terms & Conditions &
                  Privacy Policy
                </p>
              </div>
            </div>
          </Box>
        </Drawer>
      ) : (
        ""
      )}

      <nav className="navbar">
        <img src= "data:image/png;base64,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" alt="" className="logo" />
        <div className="div1_nav">
          <p className="other">Other</p>
          <div className="location">
            {location} &nbsp;
            <img src={Arrow} alt="" className="arrow" />
          </div>
        </div>
        <div className="div2_nav">
          <p className="search">
            <img src={Search} alt="" className="search_icon" />
            Search{" "}
          </p>
        </div>
        <div className="div3_nav">
          <p className="offers">
            <img src={Discount} alt="" className="discount_icon" />
            Offers <span className="new">NEW</span>{" "}
          </p>
        </div>
        <div className="div4_nav">
          <p className="help">
            <img src={Help} alt="" className="help_icon" />
            Help
          </p>
        </div>
        <div className="div5_nav">
          <p
            className="sign_in"
            onClick={() => {
              signIn
                ? setisDraweropen(false)
                : setisDraweropen(true) && setLogin(true);
            }}
          >
            <img src={User} alt="" className="user_icon" />
            {user_signin ? user_details.name : "Sign In"}
          </p>
        </div>
        <div className="div6_nav">
          {len !== 0 ? (
            <Link to="/payment" style={{ textDecoration: "none" }}>
              <p className="cart">
                <img src={Cart} alt="" className="cart_icon" />
                Cart
              </p>
            </Link>
          ) : (
            <p className="cart">
              <img src={Cart} alt="" className="cart_icon" />
              Cart
            </p>
          )}
          <span className="cart_num">{len}</span>
        </div>
      </nav>
    </>
  );
}
