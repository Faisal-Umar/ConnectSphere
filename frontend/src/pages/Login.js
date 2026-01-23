import axios from "axios";
import { useState, useContext } from "react";
import { AuthContext } from "../context/AuthContext";
import { useNavigate } from "react-router-dom";

const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const { login } = useContext(AuthContext);
  const navigate = useNavigate();

  const submitHandler = async () => {
    const { data } = await axios.post(
      "http://localhost:5000/api/auth/login",
      { email, password }
    );

    login(data);
    navigate("/chat");
  };

  return (
    <div>
      <h2>Login</h2>
      <input placeholder="Email" onChange={(e) => setEmail(e.target.value)} />
      <input placeholder="Password" type="password"
        onChange={(e) => setPassword(e.target.value)} />
      <button onClick={submitHandler}>Login</button>
    </div>
  );
};

export default Login;
