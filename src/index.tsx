import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import GitHubForkRibbon from "react-github-fork-ribbon";

import App from "./App";

const Ribbon = () => (
  <GitHubForkRibbon
    href="//github.com/revolunet/ovh-k8s-cost-calculator"
    target="_blank"
    position="right"
  >
    Fork me on GitHub
  </GitHubForkRibbon>
);

const rootElement = document.getElementById("root");
const root = createRoot(rootElement!);

root.render(
  <StrictMode>
    <App />
    <Ribbon />
  </StrictMode>
);
