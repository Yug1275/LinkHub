import { useState } from "react";
import API from "../services/api";
import { useNavigate } from "react-router-dom";

const SignupPage = () => {

  const navigate = useNavigate();

  const [form, setForm] = useState({
    name: "",
    email: "",
    password: ""
  });

  const handleChange = (e) => {
    setForm({
      ...form,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {

    e.preventDefault();

    try {

      await API.post("/auth/signup", form);

      alert("Signup successful");

      navigate("/");

    } catch (error) {

      alert(error.response?.data?.message || "Signup failed");

    }

  };

  return (
    <div className="min-h-screen flex items-center justify-center">

      <form
        onSubmit={handleSubmit}
        className="bg-white p-8 rounded shadow w-96"
      >

        <h2 className="text-2xl font-bold mb-4">Signup</h2>

        <input
          type="text"
          name="name"
          placeholder="Name"
          onChange={handleChange}
          className="border p-2 w-full mb-3"
        />

        <input
          type="email"
          name="email"
          placeholder="Email"
          onChange={handleChange}
          className="border p-2 w-full mb-3"
        />

        <input
          type="password"
          name="password"
          placeholder="Password"
          onChange={handleChange}
          className="border p-2 w-full mb-3"
        />

        <button className="bg-black text-white w-full py-2">
          Signup
        </button>

      </form>

    </div>
  );
};

export default SignupPage;