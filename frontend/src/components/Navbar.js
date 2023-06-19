import React from "react";
import { useNavigate } from "react-router-dom";

const Navbar = () => {
  const navigate = useNavigate();

  const handleUploadClick = () => {
    navigate("/upload");
  };

  return (
    <nav className="py-4 bg-gray-800">
      <div className="container flex items-center justify-between px-4 mx-auto">
        <span
          onClick={() => navigate("/")}
          className="text-2xl font-bold text-white cursor-pointer"
        >
          Asset Management App
        </span>
        <div className="end-btns">
          <button
            onClick={() => navigate("/")}
            className="px-4 py-2 mr-4 text-white bg-blue-500 rounded-md hover:bg-blue-600"
          >
            Home
          </button>
          <button
            onClick={handleUploadClick}
            className="px-4 py-2 text-white bg-blue-500 rounded-md hover:bg-blue-600"
          >
            Upload
          </button>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
