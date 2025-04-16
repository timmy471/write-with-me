import React from "react";
import GeminiAutocomplete from "../components/AutoComplete";

const HomePage = () => {
  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center">
      <div className="bg-white p-8 rounded-lg shadow-md w-full max-w-md">
        <h1 className="text-2xl text-gray-700 font-semibold mb-6 text-center">
          Gemini Autocomplete
        </h1>
        <GeminiAutocomplete />
      </div>
    </div>
  );
};

export default HomePage;
