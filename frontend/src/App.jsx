import { BrowserRouter, Routes, Route } from "react-router-dom";
import Home from "./layout/Home";
import Login from "./layout/Login";
import Register from "./layout/Register";
import Success from "./layout/Success";
import Cancel from "./layout/Cancel";

function App() {
  return (
    <>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/success" element={<Success />} />
          <Route path="/cancel" element={<Cancel />} />
        </Routes>
      </BrowserRouter>
    </>
  );
}

export default App;
