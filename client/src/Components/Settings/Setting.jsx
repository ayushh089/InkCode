import React, { useContext, useState } from "react";
import { UserContext } from "../../pages/HomePage";

const Setting = () => {
  const { setSize, setTheme } = useContext(UserContext);

  const handleSizeChange = (event) => {
    setSize(event.target.value);
  };

  const handleThemeChange = (event) => {
    const selectedTheme = event.target.value;
    setTheme(selectedTheme);
  };

  return (
    <div className="p-4 bg-slate-800 h-full rounded-lg max-w-sm mx-auto">
      <h2 className="text-white text-xl font-semibold mb-4 ">
        Settings
      </h2>
      <div className="text-gray-400  mb-4">
        Adjust your preferences
      </div>

      <div className="mb-4">
        <label htmlFor="textSize" className="block text-white font-medium mb-2">
          Text Size:
        </label>
        <select
          id="textSize"
          className="w-full p-2 bg-gray-800 text-white rounded border border-gray-700 focus:ring-2 focus:ring-blue-400"
          onChange={handleSizeChange}
        >
    <option value="1">1</option>
    <option value="2">2</option>
    <option value="3">3</option>
    <option value="4">4</option>
    <option value="5">5</option>
    <option value="6">6</option>
    <option value="7">7</option>
    <option value="8">8</option>
    <option value="9">9</option>
        </select>
      </div>

      <div className="mb-4">
        <label
          htmlFor="themeSelect"
          className="block text-white font-medium mb-2"
        >
          Theme:
        </label>
        <select
          id="themeSelect"
          className="w-full p-2 bg-gray-800 text-white rounded border border-gray-700 focus:ring-2 focus:ring-blue-400"
          onChange={handleThemeChange}
        >
          <option value="dark">Dark</option>
          <option value="light">Light</option>
          <option value="dracula">Dracula</option>
          <option value="solarizedLight">Solarized Light</option>
          <option value="solarizedDark">Solarized Dark</option>
          <option value="duotoneDark">Duotone Dark</option>
          <option value="materialDark">Material Dark</option>
          <option value="materialLight">Material Light</option>
        </select>
      </div>
    </div>
  );
};

export default Setting;
