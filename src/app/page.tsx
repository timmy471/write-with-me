import GeminiAutocomplete from "../components/AutoComplete";

const Home = () => {
  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center">
      <div className="bg-white p-8 rounded-lg shadow-md w-full max-w-2xl">
        <h1 className="text-2xl text-gray-700 font-semibold mb-6 text-center">
          Gemini Autocomplete
        </h1>
        <GeminiAutocomplete />
      </div>
    </div>
  );
};

export default Home;
