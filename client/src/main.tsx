import { createRoot } from "react-dom/client";
import App from "./App";
import "./index.css";
import { injectStructuredData } from "./lib/structured-data";

injectStructuredData();
createRoot(document.getElementById("root")!).render(<App />);
