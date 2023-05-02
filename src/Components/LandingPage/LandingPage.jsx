import React, { useState, useEffect } from "react";
import CloseIcon from "@mui/icons-material/Close";
import { Drawer, Box } from "@mui/material";
import LoadingSpinner from "../LoaderSpinner";
import "./LandingPage.css";
import Animation from "./Animation";
import Footer1 from "./Footer1";
import Footer2 from "./Footer2";
import { cities } from "../../data";
import { useNavigate } from "react-router-dom";
import Firebase from "../../Firebase";
let id;
function Card(props) {
  return (
    <>
      <div className="car">
        <div>
          <img
            style={{ width: props.widthy, height: props.heighty }}
            src={props.imgsrc}
          />
        </div>
        <div>
          <h3>{props.texty}</h3>
        </div>
        <div>
          <p>{props.para}</p>
        </div>
      </div>
    </>
  );
}

export function LandingPage() {
  const [isDraweropen, setisDraweropen] = useState(false);
  const [isLoading, setisLoading] = useState(false);
  const [query, setQuery] = useState("");
  const [res, setRes] = useState([]);
  const [login, setLogin] = useState(true);
  const [number, setNumber] = useState("");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [otp, setOtp] = useState(false);
  const [verificationId, setVerificationId] = useState("");
  const [otp_valid, setOtp_valid] = useState("");
  let navigate = useNavigate();
  let API_KEY = "5bdc9bb5e105da7714d3b4fda20a88c6";

  function check() {
    let user = JSON.parse(localStorage.getItem("user_details"));
    if (!query) {
      document.querySelector(".trip1").style.display = "block";
    } else if (user.name == "" || user.email == "" || user.number == "") {
      alert(
        "You can visit the restaurants page\nYou have to login to place orders"
      );
      navigate("/restaurants");
    } else {
      alert("Welcome to restaurant page");
      navigate("/restaurants");
    }
  }

  useEffect(() => {
    if (!query) return;

    let temp = document.querySelector(".trip1");
    if (temp) temp.style.display = "none";
    id = setTimeout(() => {
      let temp = [];
      let c = 0;
      for (let i = 0; i < cities.length; i++) {
        if (c === 5) break;
        if (cities[i].toLowerCase().includes(query.toLowerCase())) {
          temp.push(cities[i]);
          c++;
        }
      }
      setRes(temp);
    }, 300);
    return () => clearTimeout(id);
  }, [query]);

  function geoLocation() {
    setisLoading(true);
    navigator.geolocation.getCurrentPosition((success) => {
      let { latitude, longitude } = success.coords;
      fetch(
        `https://api.openweathermap.org/data/2.5/forecast?lat=${latitude}&lon=${longitude}&appid=${API_KEY}&units=metric&lang=en`
      )
        .then((response) => response.json())
        .then((name) => {
          setTimeout(() => {
            let fetch = `${name.city.name}, ${name.city.country}`;
            setQuery(fetch);
            setisLoading(false);
          }, 1000);
        })
        .catch(() => {
          setisLoading(false);
          setQuery("");
        });
    });
  }

  let text = [
    "It's Friday Evening",
    "It’s 5:30 pm and it’s time to decide where to have dinner",
    "Cooking Gone Wrong?",
    "Unexpected guests?",
    "Hungry?",
  ];
  const [change, setChange] = useState(text[0]);
  useEffect(() => {
    help();
  }, [change]);
  function help() {
    var i = 0;
    setInterval(() => {
      if (i === 6) {
        i = 0;
      }
      if (i < 6) {
        setChange(text[i]);
        i++;
      }
    }, 2000);
  }

  localStorage.setItem("Location", JSON.stringify(query));

  useEffect(() => {
    let id = JSON.parse(localStorage.getItem("verificationId"));
    let user = JSON.parse(localStorage.getItem("user_details"));
    if (
      user.name == "" ||
      user.email == "" ||
      user.number == "" ||
      id.verificationId == ""
    ) {
      let temp = {
        name: name,
        email: email,
        number: number,
      };
      localStorage.setItem("user_details", JSON.stringify(temp));
    }
  }, [name, email, number]);

  useEffect(() => {
    setOtp_valid(otp_valid);
  }, [otp_valid]);

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
        alert("Account created successfully Login Now !");
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
            "Verification failed ! \n No User ID found But you can visit the resturants page"
          );
          navigate("/restaurants");
        } else {
          alert("User Verified Success!");
          navigate("/restaurants");
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
                  spellCheck={false}
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
                  spellCheck={false}
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
                  autoFocus={true}
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

      <div
        className="split"
        onClick={() => {
          document.querySelector(".suggestion").style.display = "none";
        }}
      >
        <div className="left">
          <div className="check0">
            <div>
            <img
            style={{
              width: "200px",
              height: "100%",
           
            }}
            src="https://s3-us-west-2.amazonaws.com/cbi-image-service-prd/modified/419d634b-ce89-44bb-95cb-6fffbdb2878a.png"
          />
            </div>

            <div className="hing">
              <div>
                <button
                  id="login"
                  onClick={() => {
                    setLogin(true);
                    setisDraweropen(true);
                  }}
                >
                  Login
                </button>
              </div>
              <div>
                <button
                  id="signup"
                  onClick={() => {
                    setLogin(false);
                    setisDraweropen(true);
                  }}
                >
                  Sign up
                </button>
              </div>
            </div>
          </div>
          <Animation />
         
          <article
            className="suggestion"
            style={{
              display: query ? "" : "none",
            }}
          >
            {res.map((i, index) => (
              <div
                key={index}
                style={{
                  borderBottom:
                    index === res.length - 1
                      ? "0px"
                      : "1px solid rgb(229, 229, 229)",
                }}
                className="show"
              >
                <p
                  className="city-name show city"
                  onClick={() => {
                    setQuery(i);
                  }}
                >
                  <i className="fas fa-map-marker-alt"></i>&nbsp;&nbsp;&nbsp;{" "}
                  {i}
                </p>
              </div>
            ))}
          </article>
          <div style={{ marginBottom: "40px", marginTop: "50px" }}>
            <h3 style={{ fontSize: "18px", fontWeight: "600", color: "grey" }}>
              POPULAR CITIES IN INDIA
            </h3>
            <div style={{ paddingRight: "15px" }} className="popular alterflex">
              <div style={{ color: "grey" }}>Ahmedabad</div>
              <div style={{ color: "lightgray" }}>Bangalore</div>
              <div style={{ color: "grey" }}>Chennai</div>
              <div style={{ color: "lightgray" }}>Delhi</div>
              <div style={{ color: "grey" }}>Gurgaon</div>
              <div style={{ color: "lightgray" }}>Hyderabad</div>
              <div style={{ color: "grey" }}>Kolkata</div>
              <div style={{ color: "lightgray" }}>Mumbai</div>
              <div style={{ color: "grey" }}>Pune &nbsp;&</div>
              <div style={{ color: "lightgray" }}>more.</div>
            </div>
          </div>
        </div>

        <div className="right">
         
        </div>
      </div>
      <div className="two">
        <Card
          imgsrc="https://web.archive.org/web/20210903175337im_/https://res.cloudinary.com/swiggy/image/upload/fl_lossy,f_auto,q_auto,w_210,h_398/4x_-_No_min_order_x0bxuf"
          widthy="105px"
          heighty="199px"
          texty="No Minimum Order"
          para="Order in for yourself or for the group, with no restrictions on order value"
        />
        <Card
          imgsrc="https://web.archive.org/web/20210903175338im_/https://res.cloudinary.com/swiggy/image/upload/fl_lossy,f_auto,q_auto,w_224,h_412/4x_Live_order_zzotwy"
          widthy="112px"
          heighty="206px"
          texty="Live Order Tracking"
          para="Know where your order is at all times, from the restaurant to your doorstep"
        />
        <Card
          imgsrc="https://web.archive.org/web/20210903175339im_/https://res.cloudinary.com/swiggy/image/upload/fl_lossy,f_auto,q_auto,w_248,h_376/4x_-_Super_fast_delivery_awv7sn"
          widthy="124px"
          heighty="188px"
          texty="Lightning-Fast Delivery"
          para="Experience Swiggy's superfast delivery for food delivered fresh & on time
          "
        />
      </div>
      <div className="three">
        <div className="do">
          <h1>
            Restaurants in
            <br /> your pocket
          </h1>
          <p>
            Visit Your Favourite Restuarants 
          </p>
          <div className="do1">
            <a href="https://play.google.com/store/search?q=lighthall&c=apps">
              <img
                style={{ height: "54px" }}
                src="https://web.archive.org/web/20210903175340im_/https://res.cloudinary.com/swiggy/image/upload/fl_lossy,f_auto,q_auto,h_108/play_ip0jfp"
              />
            </a>
            
          </div>
        </div>
        <div className="do2">
          <div>
           
          </div>
          <div>
           
          </div>
        </div>
      </div>
      <Footer1 />
      <Footer2 />
      <footer>
        <img
          className="footer_logo"
          src="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAOEAAADhCAMAAAAJbSJIAAAAwFBMVEX/////xwD/1gD/xQD/++3+3TP/0DX/1wD/yAH//v//2nL/1AD+ygD///3/wwD//vf//vT+2V7/5HH/+ub/yyf/0AH/6q3//ez/4p7/4oz/0Uf/9dX/8Ln/+dr/76b/9cv/3kv/3CD/33H/1mX+5pr/6Hn/4EH/6IT/6Zf/zz7/0CP/3W7/3Hz/66f/4JL+87b9523/7JP+6o7/41r+2FP/7b//0Uz/11v/3oL/9cb/42X/1kf/3YT/67D/3Wf/zj/uHwKkAAAPD0lEQVR4nO1dC1viOhNum2qDbS0KqFgQYbkoNy/rbWXX7///qy9JS5veE+gU8Pg+u56zYJp5M5PJpZmJopQCm/yp6zejcd/QNK0/Hj1cOrZSs2vs21peOfa97Vw+fI77fVb48UZ3vC9s2y5Hvi2wlsBxn/qmqQUwtfGNWxd8SN29GWt8YfPorqtDiSwHv43tP5M+J6EvpzH5U8SRaE9xehPDK2xwpY3zjmgDgcIj2JschZJxP83+pFvwgJrSnfS1WGn2X9MYFRWuCvbNOKG/QNrxoqD0wzhRJsD4ZvfdkPgQ59kweQmNmLQjJTDmFIxYn41Q455hPDt5fqoaNH6bac0ffmY+ZivCXhfWYlZg+E8zfzcq5JKKgGAOzn23mGCqPxaW3TlF57OYoGZMmFeMmir5V31SXFYzPx2/xA6slTj6ZwF+5M+Tk5CPFH4SIEhKP1XPLMRDP633pcjZi5Zj6uyJldWMB69M9fQUpXvrN3Mh+g5fjumznpwjZGDs7oIchSPSjzw1mKNE6VFskMiG+eyk1F4FekfF0gWgLpE3tLqgjVIc7USJ1M2ImhnFKMZQWP8UVImVLzNqit4vFo3Tw2Wk+KWM/jWDjqjVu5oHGRVq2k2k8I0UQbNTOTuKcbFoPM4jOhjJFb7dBUFbTkbtNlwL2f44I4FdjIZ/5IxU6z9w85oHqT5MBoxejiRQeJJkGOmIUt2Q4nkHDD9lhbzjCt8JDvYBHnfAUKonUTrPTmClQquKCMY7YHhkSqrhPBwRL89lGR7tgqGkjCbHUP+eDEfhDmhdcjg8DIb/LSv9ngy1b98Pgy23H4aHy3Dw3RmaPMOB7KT2IBlKzYj2n6GhtU44hictQ27Kt/8MtThDydKHwNCKMLS+H0NTjTBUJV3NATBsoQhDJGmmB8DQijGUNNO9Z2i01BhDSTPde4aapaoxhnJK3HuGLTWhQ9ySGRH3mSG1RtNKMlQtGTvdZ4ZUU4RgkqFHUVCR+8xQYzaaxlBlUzcxivvNsIWTDOknpCsKP2OfGRomIYjSdIhVLNwV95kh9TIMSSulXfHw+6Fp+WRS+qEq7lD3l2GgwTSG2OuLIkvFvWXYWhPJ0qEqOPLvKUNioSGTNE/jcxSw1L1kaLZUHimjRajGQo7bM5R/T57L0CD6w2oOQxT9ElsF7+qKGBbLL8uwlsnQIJ7DbMX5xRjOkRr7BctqmcTlZNE8Kjh8uZa/zCOaR4RJCohxWkl6dND/CE+nOX9R/DeYIlst00x9rIyVZh6eqq3bwe49D16OC0F4YCsOjBPkAh0uOSGWaQxZQ+DUp1pWoTyrl6+hyyjYGapkXzp650U9RShdgLg0UkBXXGVXiQoKHidQG5H6VF119LyDjLbbtgS4FUiB00Qic1A+LuFKtn2EgaZtGquTbqluu4nSpCsDWLUuuKouwBgSjs2PbjrFf9db6K8YTf703esxYE1Ive6kEHSWGEJ3Ia7DY7A1xYVtTdQcct7FczuNL/oNJMVffDBa/RdgTQxfsTiNxhlom1LMIxXOYetDKjqLUHTewQniYWSUWkCai7drcuaE/sZunwLW56EZPT/Za8JWRydRbdtjWGMNyhajcP0Qq/dR72bfQ1WlrnW4HoEJwe41YG1rfMV896CCOu9df6Y2r6Ay1InNiDvgPZ9O9r1Q61fQYdAHVuKwigttB7Tu/OwtCXhtZ36PCDGrQIlqm07DuxZdskBXlYzrceEHKFWdknrtIXRFFFO2pIl0RGcFXisZ94e24hxXYC2n/xIqJP0ffhBW1WNH0SswFrRKC+ZtTKErpsO+riyq8NqLtNUa6x/QDgAtoF0anSeht/TkCC6b1wDWT3U4UMD7O2aT7jTYbRXSjXtzt5UC3RlIJW9ZIfWNCqaLUwW8K2A1Q4UK8BrKg6WAV4FeMgkqCuS6FHl9HJ4hzgysI1PxhgrqaigUcDtp56hQUe6gq8fQngbN8rMh1cloBeVO2WOn0KPFcVEovct2TuEsdaV8wT2ctKH1uu5xmehYkNsnZMT/B9nR8VDgvSTYkEGfi/4pOtDjWQVLb8s5Q4X+gphNbcCgK3WQNwjMME5nYhk7nBldR8FocuUo9gWEmVJxT88ui9kxXJ5BLBWZkV4R83HZ0cjyKzg9E8/w1AChSGBRV15Pfae+DTzXOBPVINPirGQZfHywDFW9KYAGcVsua46zhNhd9F8lOB/lP9pKXdXnwR4CUFw3c6O8dwj+EbbjDbKt2K+l7Ymt3fJ9MKHqRL/Y9sHqbLOsR265nRGr3MmBQYmuDKl3m6bl1NuYP9G3JU4H/LPPSjuEgd83SwPoTXB6L+UMXHT1O4s82p6V0nBIvV5w8m6C4RsuhSOe2Uokx299XgbF+3Zjm4xVTKbG8K0Einie6Cr14bZtdzr1zpVtytBmDOkb28VqS7+ArGE9aUdOMPJj8Q4Z/B5Cq9fGdsmcwtJ242LKt7es+0HTXsp8gzzfGUiqMfhthGduuZn/HPdM1qaw/xfhQbYs9Y/7dVuJPZ78Fm7eD2DSqXW+7puy3gHj+7nnzNOcHTWTy8XJWxOz45eoCCo+vv41X/RAMo15J0V7w/mv66aFi2Vh8jTfThZ6Fr0Q3c7Vsj07ycf87/Lq6uLVT0oOk9PQe6judi6urpYfBQKdnLSXi063UJAgxfqlXoAKEm7avCp2IVHUEkrWos1S6td2nen6Bz/4wQ9+8B+G6AyF+7XDG7ecogmEHllgrg8bw8F26hJzmnwV2d3OYtkunAV+LK8W/15dXeCJm8Jrsrr7erG4Wv6dC81LcxmyB+psbaF6sV0F83lsNcnaYtizcx66HezegqwtjgXWFmwtpAZrCyVpUn5cyfxeeruGrA+/gNaHA7I+RBKbb2wv4PgjezOTrfE32pBC+Mt1StWi48423TdC6iAleM3m92nEEG0KpE4vttyn4aRpvK5QuIMrKFbYIug4uU9jl7HXtrra+oImtlfnDqdl7LXFoJexX4rehg1eVknUWKlGu4wXRbH90ppiD8rZ88Zv2cf0xLDY/ryiR2W2HqQ9J0rf+pQSlIDUl96GKqRovJd3YOGMf/DgtJyjV+QhGOH2ptfe1e+IFZQghgf+3dNFaU/1sPn7w3ICzJC/ORwM025p74B90dDxq7iVBvP8Dn0HLPFGoRj3vm93AM4kWSLHvSIM7QXAe3yWxsGGCXa0lslruvJAA63LR7NHXV79A+bsnvx5mvKPKKK/dFR0gcLkaKixqBbBAq3pmSg7maKiHGAkca6txAMKEaALW3FWCOIEK/WJSPhsImtkkJamkV0Qz11jWbCd4P0EzeagA58RLrpnld6UPIQMF0AdZQAa7mAVr/5fLciwHfQFelYfC53Vh40ooZFdCKoNEfM2+UfAdOiA56kXMwPZE+5yGYKeYqfA8FFBaiNnE70HW30VkV1YRe85KnyBj9GtQIc5Q8YQPhGASjwNeCXXmTGkb9BVs8iuCmK52xn9EHSs97ECHvE93KcPit0yjlnmAtNztMDx+N4GXuqK316A1uzXv6ggpwLBNDWnAnDooxetrit1+HB1VT31whCjC+KLivJiZKWhLBeryEqRZahywJuWEqP9w61CiSjma2i9VaQ2suh+Ynq21JIRhgYEgM+BF+S9hU6dxmDx5Fh/hFchCsKQgbYTo7XFl8KdEt9QZGLud3/3HjqvAcEg9jrqC7xGMl0M3tgu/CR1kIjn3PsfaG14nfU2iKaG1yGfN7FWSec/5afDzrtIbuStEFlD1SqYdKP3yBjceEdlvpxMAsfzlwLWxYDigdYsBy0oxV/8ltTlO2BVDFwO2rWxDoF7xjU/rXGvQdsT4WX8HB/de+7AZm06/sMx7IA2J7pOy4BH0P1obutvcHCiI5laXyif91YHQvw462Y74+SSrTi9dmmx+Tj+r4gzTc1nUs6RHqvt5r0PcvTOiubVl6YgUHV+Xv0ta0N+Xv2XIK9+ytvZ9Ue2O/x6WRXfjYAxvQohjmwZ+Fdty2wqKaBVFV/W8DJoh2F0ZRxYPmJ3dSQuoki/34Iy/Bu6N3Z2INlT6S0eZtrtFlL3W2TSY8cCPccqdOg37xaW5B0lxAXNw6NSl/FbWNj1HWbOvUjy98wk5C/+QIKhZpgS98xgj99W98wIMJRG0V1BptmKcsy+K0it4q6g8hlq9NK83Pue/M+RyM1ke8rQv7OrwErZFYFFJPeVoaGFlpp975rIJY/7ylDjrpb7rnfnZd1/GBA8/PsPCUXM1tZpOsSiBPeboWbipA69fvg97iHVcu6SFb4sd98Z5t0H/D0YGhl3Ootcz3kYDL0rgZP3cktczL33DImdxnX4ze5W18wEQ3E/ehgMNSvG0JK5O/4gGLZiDOVUeAgMzdisTa70ITDUrAhDOT9zGAxbJ/w+jaSRHgRDM6LDb8lwwOlwIDFhO0iG+rdkqH1/huccw3PZwj8M94NhGMp2+cPw4Bl+UysdhYcx9NH++9LaVp7mYKxUbom3eT80dsNwLCUkwSS0UudZrqih3e6A4aMsQz6I7c6UNIDPHTB8lnQWxg1X+EaSoPm0A4Y9KYaG1n/gCj/05VrH/JMpBxhqtiTD2y53RqJ7K8VQ02AywuXCViSFHPFnB2zJ4WJcPUGCjpwS+W5ok44oA/MhUwpI6FLO4iiaQuJSasLQ3zRr0XaQG9QmXEkaFTSSKGs+e3lmKofr60FElwZ/QpjK2vCFFyl81NtR/lBbTImUgzlKlJaYfE8qSI+eDld45tZnKozowREeEm+3TuW3OcjALeRuDBpsEUble//TE/RU/d04Ul/eJwF25O+dk/ATNcW5E2P4bO/CyRDY1Oacz8LeZLBVRSwmiP2sTwS8lPm5s07oSdn4XewwzrNGM5HNjN+bXa5UIhhFQ8vWhvk728bsx4z2MfznmTsnWKMDvxHKZESEZKDjRGrqD/ZhOPAb3GPWhQ061O8+k7Z9kzNojKkjzJSRfLEY880RK3yzGxeTRHdk8NYWniLpT4qHsu4kMjAGZc3+xAvo2zVLVn+9c57UgmlMeslRIl7UVpw/k5AWx++Pnwps1wx96N27I5NTpElMzE1OZNJRd4mh84XN/lNwf9TuCa7b2Hb0m8cxtbh+f/z5oNPs14JOokYKdx9G4z71M/3x6Eavl8fr/y8qWH8fm/DNAAAAAElFTkSuQmCC"
          width="100px"
          height="60px"
        />
        <p style={{ color: "white", fontSize: "21px" }}>&copy; 2023 Restuarant </p>
        <div
          style={{
            width: "200px",
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
          }}
          className="icons"
        >
          <img
            src="https://res.cloudinary.com/swiggy/image/upload/fl_lossy,f_auto,q_auto,w_48,h_48/icon-facebook_tfqsuc"
            width="24"
            height="24"
          />
          <img
            src="https://res.cloudinary.com/swiggy/image/upload/fl_lossy,f_auto,q_auto,w_48,h_48/icon-pinterest_kmz2wd"
            width="24"
            height="24"
          />
          <img
            src="https://res.cloudinary.com/swiggy/image/upload/fl_lossy,f_auto,q_auto,w_48,h_48/icon-instagram_b7nubh"
            width="24"
            height="24"
          />
          <img
            src="https://res.cloudinary.com/swiggy/image/upload/fl_lossy,f_auto,q_auto,w_48,h_48/icon-twitter_gtq8dv"
            width="24"
            height="24"
          />
        </div>
      </footer>
    </>
  );
}
