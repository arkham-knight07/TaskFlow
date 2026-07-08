import React from "react";

const Button = ({ text, onClick, type = "button", loading }) => {
  return (
    <button
      type={type}
      onClick={onClick}
      disabled={loading}
      className="w-full rounded-lg bg-blue-600 text-white py-3 font-semibold hover:bg-blue-700 transition disabled:bg-gray-400"
    >
      {loading ? "Please wait..." : text}
    </button>
  );
};

export default Button;