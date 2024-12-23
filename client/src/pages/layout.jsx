import React, { useState } from "react";
import { Menu } from "../Components/Menu";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import axios from "axios";
import Editor from "../Components/editor/Editor";

const javascriptDefault = `console.log("Hello World!");`;

export function Layout() {
  const [code, setCode] = useState(javascriptDefault);
  const [customInput, setCustomInput] = useState("");
  const [outputDetails, setOutputDetails] = useState(null);
  const [processing, setProcessing] = useState(false);

  const REACT_APP_RAPID_API_URL =
    "https://judge0-ce.p.rapidapi.com/submissions";
  const REACT_APP_RAPID_API_HOST = "judge0-ce.p.rapidapi.com";
  const REACT_APP_RAPID_API_KEY =
    "adc5cb09e3mshe2020c9ea40bd56p16e377jsn0da7994f0a20";

  const onChange = (action, data) => {
    if (action === "code") {
      setCode(data);
    }
  };

    const handleCompile = () => {
    console.log("handleCompile");

    setProcessing(true);
    const formData = {
      language_id: 63, // JavaScript (Node.js 12.14.0)
      source_code: btoa(code),
      stdin: btoa(customInput),
    };

    const options = {
      method: "POST",
      url: REACT_APP_RAPID_API_URL,
      params: { base64_encoded: "true", fields: "*" },
      headers: {
        "content-type": "application/json",
        "X-RapidAPI-Host": REACT_APP_RAPID_API_HOST,
        "X-RapidAPI-Key": REACT_APP_RAPID_API_KEY,
      },
      data: formData,
    };

    axios
      .request(options)
      .then(function (response) {
        const token = response.data.token;
        console.log(token);

        checkStatus(token);
      })
      .catch((err) => {
        let error = err.response ? err.response.data : err;
        setProcessing(false);
        console.log("catch block...", error);
        showErrorToast();
      });
  };

  const checkStatus = async (token) => {
    const options = {
      method: "GET",
      url: `${REACT_APP_RAPID_API_URL}/${token}`,
      params: { base64_encoded: "true", fields: "*" },
      headers: {
        "X-RapidAPI-Host": REACT_APP_RAPID_API_HOST,
        "X-RapidAPI-Key": REACT_APP_RAPID_API_KEY,
      },
    };
    try {
      let response = await axios.request(options);
      let statusId = response.data.status?.id;

      if (statusId === 1 || statusId === 2) {
        setTimeout(() => {
          checkStatus(token);
        }, 2000);
        return;
      } else {
        setProcessing(false);
        setOutputDetails(response.data);
        console.log("response.data", response.data);
        showSuccessToast();
      }
    } catch (err) {
      console.log("err", err);
      setProcessing(false);
      showErrorToast();
    }
  };

  const showSuccessToast = () => {
    toast.success("Compiled Successfully!", {
      position: "top-right",
      autoClose: 1000,
      hideProgressBar: false,
      closeOnClick: true,
      pauseOnHover: true,
      draggable: true,
      progress: undefined,
    });
  };

  const showErrorToast = () => {
    toast.error("Something went wrong! Please try again.", {
      position: "top-right",
      autoClose: 1000,
      hideProgressBar: false,
      closeOnClick: true,
      pauseOnHover: true,
      draggable: true,
      progress: undefined,
    });
  };

  return (
    <div className="flex h-screen bg-gray-100">
      <Menu
        handleCompile={handleCompile}
        customInput={customInput}
        setCustomInput={setCustomInput}
        outputDetails={outputDetails}
        processing={processing}
      />
      <div className="flex-1 flex flex-col overflow-hidden">
        <main className="flex-1 ">
          <Editor onChange={onChange} code={code} />
        </main>
      </div>
      <ToastContainer />
    </div>
  );
}
