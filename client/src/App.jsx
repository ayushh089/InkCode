import Editor from "./Components/editor/Editor";
import { Layout } from "./pages/layout";
import InputArea from "./Components/input/InputArea";
import OutputArea from "./Components/output/OutputArea";
import { useState } from "react";

function App() {
  const [outputDetails, setOutputDetails] = useState(null);
  return (
    <>
      <Layout>

      </Layout>
    </>
  );
}

export default App;