import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import Data from "../Data/Data.json";
import "../css/login.css";

function Login() {
  const [step, setStep] = useState(1);

  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState("");
  const [verificationToken, setVerificationToken] = useState("");

  const [first_name, setFirstName] = useState("");
  const [last_name, setLastName] = useState("");
  const [password, setPassword] = useState("");

  const [locationSearch, setLocationSearch] = useState("");
  const [selectedLocation, setSelectedLocation] = useState(null);
  const [showLocationSuggestions, setShowLocationSuggestions] = useState(false);

  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  const [timer, setTimer] = useState(0);
  const [canResend, setCanResend] = useState(false);

  const [isLogin, setIsLogin] = useState(true);

  const navigate = useNavigate();

  const filteredLocations = Data.filter((item) =>
    item.loc.toLowerCase().includes(locationSearch.toLowerCase())
  );

  useEffect(() => {
    if (timer <= 0) {
      setCanResend(true);
      return;
    }

    const interval = setInterval(() => {
      setTimer((prev) => prev - 1);
    }, 1000);

    return () => clearInterval(interval);
  }, [timer]);

  const sendOtp = async (e) => {
    e.preventDefault();

    if (!email.trim()) {
      setMessage("Email is required");
      return;
    }

    try {
      setLoading(true);
      setMessage("");

      const response = await fetch(
        "http://localhost:5000/api/otp/send-otp-email",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            email: email.trim(),
          }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        setMessage(data.message || data.error || "Failed to send OTP");
        return;
      }

      setMessage(data.message);
      setTimer(60);
      setCanResend(false);
      setStep(2);
    } catch (error) {
      setMessage("Unable to connect to server");
    } finally {
      setLoading(false);
    }
  };

  const verifyOtp = async (e) => {
    e.preventDefault();

    if (!otp.trim()) {
      setMessage("OTP is required");
      return;
    }

    try {
      setLoading(true);
      setMessage("");

      const response = await fetch(
        "http://localhost:5000/api/otp/verify-otp-email",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            email: email.trim(),
            otp: otp.trim(),
          }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        setMessage(data.message || data.error || "OTP verification failed");
        return;
      }

      setVerificationToken(data.verificationToken);
      setMessage(data.message);
      setStep(3);
    } catch (error) {
      setMessage("Unable to connect to server");
    } finally {
      setLoading(false);
    }
  };

  const selectLocation = (item) => {
    setSelectedLocation({
      locationName: item.loc,
      latitude: Number(item.lat),
      longitude: Number(item.long),
    });

    setLocationSearch(item.loc);
    setShowLocationSuggestions(false);
    setMessage("");
  };

  const register = async (e) => {
    e.preventDefault();

    if (!first_name.trim()) {
      setMessage("First name is required");
      return;
    }

    if (!last_name.trim()) {
      setMessage("Last name is required");
      return;
    }

    if (!selectedLocation) {
      setMessage("Please select a location");
      return;
    }

    if (!password) {
      setMessage("Password is required");
      return;
    }

    if (password.length < 6) {
      setMessage("Password must be at least 6 characters");
      return;
    }

    if (!verificationToken) {
      setMessage("Email verification is missing. Please verify your email again.");
      return;
    }

    try {
      setLoading(true);
      setMessage("");

      const registrationData = {
        email: email.trim(),
        first_name: first_name.trim(),
        last_name: last_name.trim(),
        password,
        verificationToken,
        locationName: selectedLocation.locationName,
        latitude: Number(selectedLocation.latitude),
        longitude: Number(selectedLocation.longitude),
      };

      const response = await fetch(
        "http://localhost:5000/api/auth/register",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(registrationData),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        setMessage(data.message || "Registration failed");
        return;
      }

      setMessage(data.message);

      setEmail("");
      setOtp("");
      setVerificationToken("");
      setFirstName("");
      setLastName("");
      setPassword("");
      setLocationSearch("");
      setSelectedLocation(null);
      setShowLocationSuggestions(false);

      setStep(1);
      setIsLogin(true);
    } catch (error) {
      setMessage("Unable to connect to server");
    } finally {
      setLoading(false);
    }
  };

  const login = async (e) => {
    e.preventDefault();

    if (!email.trim() || !password) {
      setMessage("Email and password are required");
      return;
    }

    try {
      setLoading(true);
      setMessage("");

      const response = await fetch(
        "http://localhost:5000/api/auth/login",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            email: email.trim(),
            password,
          }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        setMessage(data.message || "Login failed");
        return;
      }

      localStorage.setItem("token", data.token);
      localStorage.setItem("user", JSON.stringify(data.user));

      navigate("/dashboard");
    } catch (error) {
      setMessage("Unable to connect to server");
    } finally {
      setLoading(false);
    }
  };

  const resendOtp = () => {
    if (canResend) {
      sendOtp({
        preventDefault: () => {},
      });
    }
  };

  const switchToLogin = () => {
    setIsLogin(true);
    setStep(1);
    setMessage("");
    setEmail("");
    setPassword("");
    setOtp("");
    setVerificationToken("");
    setFirstName("");
    setLastName("");
    setLocationSearch("");
    setSelectedLocation(null);
    setShowLocationSuggestions(false);
  };

  const switchToRegister = () => {
    setIsLogin(false);
    setStep(1);
    setMessage("");
    setEmail("");
    setPassword("");
    setOtp("");
    setVerificationToken("");
    setFirstName("");
    setLastName("");
    setLocationSearch("");
    setSelectedLocation(null);
    setShowLocationSuggestions(false);
  };

  return (
    <div className="login">
      <div className="login-container">
        <h2>{isLogin ? "Login" : "Register"}</h2>

        {message && <p>{message}</p>}

        {isLogin ? (
          <>
            <form onSubmit={login}>
              <input
                type="email"
                placeholder="Email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />

              <input
                type="password"
                placeholder="Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />

              <button type="submit" disabled={loading}>
                {loading ? "Logging in..." : "Login"}
              </button>
            </form>

            <button
              type="button"
              className="switch-btn"
              onClick={switchToRegister}
            >
              Not register yet? Register
            </button>
          </>
        ) : (
          <>
            {step === 1 && (
              <form onSubmit={sendOtp}>
                <input
                  type="email"
                  placeholder="Email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />

                <button type="submit" disabled={loading}>
                  {loading ? "Sending..." : "Send OTP"}
                </button>
              </form>
            )}

            {step === 2 && (
              <>
                <form onSubmit={verifyOtp}>
                  <input
                    type="text"
                    placeholder="Enter OTP"
                    value={otp}
                    onChange={(e) => setOtp(e.target.value)}
                  />

                  <button type="submit" disabled={loading}>
                    {loading ? "Verifying..." : "Verify OTP"}
                  </button>
                </form>

                <button
                  type="button"
                  onClick={resendOtp}
                  disabled={!canResend || loading}
                >
                  {canResend ? "Resend OTP" : `Resend in ${timer}s`}
                </button>
              </>
            )}

            {step === 3 && (
              <form onSubmit={register}>
                <input
                  type="text"
                  placeholder="First Name"
                  value={first_name}
                  onChange={(e) => setFirstName(e.target.value)}
                />

                <input
                  type="text"
                  placeholder="Last Name"
                  value={last_name}
                  onChange={(e) => setLastName(e.target.value)}
                />

                <div className="location-selector">
                  <input
                    type="text"
                    placeholder="Search your location..."
                    value={locationSearch}
                    onChange={(e) => {
                      setLocationSearch(e.target.value);
                      setSelectedLocation(null);
                      setShowLocationSuggestions(true);
                    }}
                    onFocus={() => {
                      if (locationSearch) {
                        setShowLocationSuggestions(true);
                      }
                    }}
                  />

                  {showLocationSuggestions && locationSearch && (
                    <div className="dropdown">
                      {filteredLocations.length > 0 ? (
                        filteredLocations.map((item, index) => (
                          <div
                            key={index}
                            className="dropdown-item"
                            onClick={() => selectLocation(item)}
                          >
                            {item.loc}
                          </div>
                        ))
                      ) : (
                        <div className="no-result">
                          No location found
                        </div>
                      )}
                    </div>
                  )}
                </div>

                {selectedLocation && (
                  <div className="selected-location">
                    <p>
                      Selected Location:{" "}
                      <strong>{selectedLocation.locationName}</strong>
                    </p>
                  </div>
                )}

                <input
                  type="password"
                  placeholder="Password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />

                <button
                  type="submit"
                  disabled={loading || !selectedLocation}
                >
                  {loading ? "Registering..." : "Register"}
                </button>
              </form>
            )}

            <button
              type="button"
              className="switch-btn"
              onClick={switchToLogin}
            >
              Already have an account? Login
            </button>
          </>
        )}
      </div>
    </div>
  );
}

export default Login;
