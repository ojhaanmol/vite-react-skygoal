import { useEffect, useState } from "react";
import { BrowserRouter as Router, Routes, Route, Navigate, useNavigate } from "react-router-dom";
import axios from "axios";

export type signupResponse = { data: { data: { userId: string } } }

function Signin() {
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [name, setName] = useState("")
  const [lastName, setLastName] = useState("")
  const [mobileNumber, setMobileNumber] = useState("")
  const [password, setPassword] = useState("")
  const navigate = useNavigate();

  const handleSignin = async () => {
    try {
      const res = (await axios.post("http://localhost:3000/user/signup", { email, name, lastName, mobileNumber: +mobileNumber, password }) as signupResponse);
      console.log(res)
      localStorage.setItem("identifire", res.data.data.userId);
      setMessage("OTP sent. Check your email.");
      navigate("/verify");
    } catch (error: any) {
      setMessage(error.response?.data?.error || "Signin failed");
    }
  };

  return (
    <div className="flex flex-col gap-4 items-center">

      <input placeholder="name" onChange={(e)=> setName(e.target.value)} className="border px-4 py-2 rounded w-64"/>
      <input placeholder="lastName" onChange={(e)=> setLastName(e.target.value)} className="border px-4 py-2 rounded w-64"/>
      <input placeholder="mobileNumber" onChange={(e)=> setMobileNumber(e.target.value)} className="border px-4 py-2 rounded w-64"/>
      <input placeholder="password" onChange={(e)=> setPassword(e.target.value)} className="border px-4 py-2 rounded w-64"/>

      <input
        type="email"
        placeholder="Enter your email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        className="border px-4 py-2 rounded w-64"
      />
      <button
        onClick={handleSignin}
        className="bg-blue-500 text-white px-4 py-2 rounded"
      >
        Send OTP
      </button>
      {message && <p className="text-sm text-gray-600">{message}</p>}
    </div>
  );
}

function VerifyOtp() {
  const [otp, setOtp] = useState("");
  const [message, setMessage] = useState("");
  const navigate = useNavigate();
  const identifire = localStorage.getItem("identifire") || "";

  const handleVerify = async () => {
    try {
      const res = await axios.post("http://localhost:3000/user/verify", { otp, identifire });
      // localStorage.setItem("access_token", res.data.token);
      console.log(res.data)
      localStorage.removeItem("identifire");
      navigate("/login");
    } catch (error: any) {
      setMessage(error.response?.data?.error || "Verification failed");
    }
  };

  return (
    <div className="flex flex-col gap-4 items-center">
      <input
        type="text"
        placeholder="Enter OTP"
        value={otp}
        onChange={(e) => setOtp(e.target.value)}
        className="border px-4 py-2 rounded w-64"
      />
      <button
        onClick={handleVerify}
        className="bg-green-500 text-white px-4 py-2 rounded"
      >
        Verify OTP
      </button>
      {message && <p className="text-sm text-gray-600">{message}</p>}
    </div>
  );
}

function Login() {
  const [id, setId] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState("");
  const navigate = useNavigate();

  const handleLogin = async () => {
    try {
      const res = await axios.post("http://localhost:3000/user/login", {
        id,
        password,
      });

      localStorage.setItem("access_token", res.data.accessToken);
      localStorage.setItem("refresh_token", res.data.refreshToken);
      setMessage("Login successful!");
      navigate("/home");
    } catch (error: any) {
      setMessage(error.response?.data?.error || "Login failed");
    }
  };

  return (
    <div className="flex flex-col gap-4 items-center">
      <input
        type="text"
        placeholder="username"
        value={id}
        onChange={(e) => setId(e.target.value)}
        className="border px-4 py-2 rounded w-64"
      />
      <input
        type="password"
        placeholder="Enter password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        className="border px-4 py-2 rounded w-64"
      />
      <button
        onClick={handleLogin}
        className="bg-blue-600 text-white px-4 py-2 rounded"
      >
        Login
      </button>
      {message && <p className="text-sm text-gray-600">{message}</p>}
    </div>
  );
}


function Home() {
  const [message, setMessage] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    async function fetchData() {
      try {
        const token = localStorage.getItem("access_token");
        const res = await axios.get("http://localhost:3000/api/user", {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        setMessage(res.data.message);
      } catch {
        localStorage.removeItem("access_token");
        navigate("/signin");
      }
    }
    fetchData();
  }, [navigate]);

  return <div className="text-lg">{message || "Welcome Home!"}</div>;
}

function ProtectedRoute({ children }: { children: JSX.Element }) {
  const token = localStorage.getItem("access_token");
  return token ? children : <Navigate to="/signin" />;
}

export default function App() {
  return (
    <Router>
      <div className="min-h-screen flex flex-col items-center justify-center gap-4 p-4 text-center">
        <h1 className="text-2xl font-bold">SKYGOAL</h1>
        <Routes>
          <Route path="/signin" element={<Signin />} />
          <Route path="/verify" element={<VerifyOtp />} />
          <Route path="/login" element={<Login />} />
          <Route path="/home" element={<ProtectedRoute><Home /></ProtectedRoute>} />
          <Route path="*" element={<Navigate to="/signin" />} />
        </Routes>
      </div>
    </Router>
  );
}
