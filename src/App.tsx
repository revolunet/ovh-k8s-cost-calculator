import { ChangeEventHandler, ReactNode } from "react";
import { Rule } from "publicodes";
import { stringify } from "yaml";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import loader from "yaml.macro";

import { usePublicodesEngine } from "./usePublicodesEngine";

import "./styles.css";

type OvhRule = Rule & { meta?: any };
type IRules = Record<string, OvhRule>;

const parsedYaml = loader("./ovh.yaml");

const parsedRules: IRules = parsedYaml;

const sizeFmt = (size: number) => {
  if (size >= 1000) {
    return (size / 1000).toFixed(1) + " To";
  }
  return size + " Go";
};

const defaultSituation = {
  "inputs . machine": "ovh . compute . b2-30",
  "inputs . noeuds": 5,
  "inputs . clusters": 2,
  "inputs . storage block": 100,
  "inputs . storage object": 100,
  "inputs . storage object traffic": 1000,
};

function Range({
  label,
  min = 1,
  max = 100,
  step = 1,
  defaultValue,
  displayValue,
  onChange,
}: {
  onChange: ChangeEventHandler<HTMLInputElement>;
  defaultValue: string | number;
  displayValue: ReactNode;
  label: ReactNode;
  min: number;
  max: number;
  step?: number;
}) {
  return (
    <div>
      {label}&nbsp;
      <input
        type="range"
        min={min}
        max={max}
        step={step}
        defaultValue={defaultValue}
        onChange={onChange}
      />
      {displayValue !== undefined && <>&nbsp;{displayValue}</>}
    </div>
  );
}

function Calculator() {
  const { situation, evaluated, setSituationValue } = usePublicodesEngine({
    rules: parsedRules,
    rule: "markdown",
    situation: defaultSituation,
  });

  const strRules = stringify({
    ...parsedYaml,
    ...situation,
  });

  return (
    <div>
      Machine type :{" "}
      <select
        onChange={(e) => {
          console.log(e.currentTarget.value);
          setSituationValue("inputs . machine", e.currentTarget.value);
        }}
        defaultValue={defaultSituation["inputs . machine"]}
      >
        {Object.keys(parsedRules)
          .filter((key) => key.startsWith("ovh . compute . "))
          .map((key) => {
            return (
              <option key={key} value={key}>
                {parsedRules[key].description} : {parsedRules[key].meta.memory},{" "}
                {parsedRules[key].meta.vCore} vCores,{" "}
                {parsedRules[key].meta.storage}{" "}
              </option>
            );
          })}
      </select>
      <Range
        onChange={(e) =>
          setSituationValue("inputs . noeuds", e.currentTarget.value)
        }
        label="Noeuds par cluster"
        min={1}
        max={20}
        defaultValue={defaultSituation["inputs . noeuds"]}
        displayValue={situation && situation["inputs . noeuds"]}
      />
      <Range
        onChange={(e) =>
          setSituationValue("inputs . clusters", e.currentTarget.value)
        }
        label="Nombre de clusters"
        min={1}
        max={50}
        defaultValue={defaultSituation["inputs . clusters"]}
        displayValue={situation && situation["inputs . clusters"]}
      />
      <Range
        onChange={(e) =>
          setSituationValue("inputs . storage block", e.currentTarget.value)
        }
        label="Nombre de Go de Storage Block"
        min={100}
        max={50000}
        step={100}
        defaultValue={defaultSituation["inputs . storage block"]}
        displayValue={situation && sizeFmt(situation["inputs . storage block"])}
      />
      <Range
        onChange={(e) =>
          setSituationValue("inputs . storage object", e.currentTarget.value)
        }
        label="Nombre de Go de Storage Object"
        min={100}
        max={50000}
        step={100}
        defaultValue={defaultSituation["inputs . storage object"]}
        displayValue={
          situation && sizeFmt(situation["inputs . storage object"])
        }
      />
      <Range
        onChange={(e) =>
          setSituationValue(
            "inputs . storage object traffic",
            e.currentTarget.value
          )
        }
        label="Storage Object : Traffic public sortant"
        min={100}
        max={100000}
        step={100}
        defaultValue={defaultSituation["inputs . storage object traffic"]}
        displayValue={
          situation && sizeFmt(situation["inputs . storage object traffic"])
        }
      />
      <label style={{ display: "inline-block", marginRight: 10 }}>
        <input
          type="checkbox"
          onClick={(e) =>
            setSituationValue(
              "inputs . pro",
              e.currentTarget.checked ? "oui" : "non"
            )
          }
        />{" "}
        Support Pro HDS (+10%)
      </label>
      <label style={{ display: "inline-block" }}>
        <input
          type="checkbox"
          onClick={(e) =>
            setSituationValue(
              "inputs . ugap",
              e.currentTarget.checked ? "oui" : "non"
            )
          }
        />{" "}
        Commande UGAP (-10%)
      </label>
      {evaluated && evaluated.nodeValue && (
        <div style={{ textAlign: "left", margin: "0 auto" }}>
          <ReactMarkdown className="markdown" remarkPlugins={[remarkGfm]}>
            {evaluated.nodeValue.toString()}
          </ReactMarkdown>
        </div>
      )}
      <Footer strRules={strRules} />
    </div>
  );
}

const Footer = ({ strRules }: { strRules: string }) => (
  <>
    <a href="https://www.ovhcloud.com/fr/public-cloud/prices/#568">
      Official pricing
    </a>
    &nbsp;|&nbsp;
    <a
      target="_blank"
      rel="noopener noreferrer"
      href={`https://publi.codes/studio/mensuel-brut#${encodeURIComponent(
        strRules
      )}`}
    >
      Edit in publi.codes studio
    </a>
  </>
);

export default function App() {
  return (
    <div className="App">
      <h1>OVH k8s cost calculator</h1>
      <Calculator />
    </div>
  );
}
