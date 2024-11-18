import React from "react";
import { Route, BrowserRouter as Router, Routes } from "react-router-dom";
import Layout from "./components/Layout";
import Home from "./pages/Home";
import Service from "./pages/Service";
import "./App.css"
const App = () => {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Layout />}>
          <Route index element={<Home />} />
          <Route path="/service" element={<Service />} />
        </Route>
      </Routes>
    </Router>
  );
};

export default App;
