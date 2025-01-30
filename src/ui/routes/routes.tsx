import React from "react";
import { Routes, Route } from "react-router-dom";
import NewItem from "../pages/newItem/NewItem";
import Calibrate from "../pages/calibrate/Calibrate";
import TestItem from "../pages/testItem/TestItem";
import Home from "../pages/home/Home";

const AppRoutes: React.FC = () => {
  return (
    <Routes>
      <Route path="/" element={<Home />} />
      <Route index element={<Home />} />
      <Route path="/calibrate" element={<Calibrate />} />
      <Route path="/new-item" element={<NewItem />} />
      <Route path="/test-item" element={<TestItem />} />
    </Routes>
  );
};

export default AppRoutes;
