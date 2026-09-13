import { useState } from "react";
import ConfigPanel from "./components/ConfigPanel";
import ResultsPanel from "./components/ResultsPanel";
import type { AnalysisResult } from "./components/ResultsPanel";
import {
  EZBaccaratEngine,
} from "./engine/EZBaccaratEngine";
import type { RawOutcome } from "./engine/EZBaccaratEngine";

function App() {
  const [pattern, setPattern] = useState("BBPP");
  const [shoes, setShoes] = useState("100");

  const [includeTies, setIncludeTies] =
    useState(false);

  const [dragonAsTie, setDragonAsTie] =
    useState(false);

  const [isRunning, setIsRunning] =
    useState(false);

  const [result, setResult] =
    useState<AnalysisResult | null>(null);

  const [error, setError] = useState("");

  const executeAnalysis = () => {
    setError("");

    const rawPattern = pattern
      .trim()
      .toUpperCase();

    if (!rawPattern) {
      setError(
        "Please provide a valid pattern sequence.",
      );
      return;
    }

    const validChars = includeTies
      ? ["B", "P", "T"]
      : ["B", "P"];

    const invalidCharacter = rawPattern
      .split("")
      .find(
        (char) => !validChars.includes(char),
      );

    if (invalidCharacter) {
      setError(
        includeTies
          ? "Pattern characters must only consist of B, P, and T."
          : "Pattern characters must only consist of B and P.",
      );
      return;
    }

    const totalShoes = Number(shoes);

    if (
      !Number.isInteger(totalShoes) ||
      totalShoes <= 0
    ) {
      setError(
        "Please input a positive whole number for the shoe count.",
      );
      return;
    }

    // Protect the browser from accidentally enormous simulations.
    if (totalShoes > 1_000_000) {
      setError(
        "For browser performance, please use 1,000,000 shoes or fewer.",
      );
      return;
    }

    setIsRunning(true);

    // Allow React to update the UI before starting
    // a potentially large simulation.
    setTimeout(() => {
      try {
        const engine = new EZBaccaratEngine();

        const patternLength =
          rawPattern.length;

        let totalHands = 0;
        let totalPatterns = 0;
        let totalTies = 0;
        let totalDragons = 0;

        const followDistribution = {
          B: 0,
          P: 0,
          T: 0,
        };

        for (
          let shoe = 0;
          shoe < totalShoes;
          shoe++
        ) {
          const shoeResult =
            engine.simulateShoe();

          totalHands +=
            shoeResult.results.length;

          const filteredShoe: string[] = [];

          for (const outcome of shoeResult.results) {
            let parsedOutcome: RawOutcome | string =
              outcome;

            // Dragon 7
            if (outcome === "D7") {
              totalDragons++;

              parsedOutcome = dragonAsTie
                ? "T"
                : "B";
            }

            // Normal Tie
            else if (outcome === "T") {
              totalTies++;
            }

            // Ignore Ties if disabled
            if (
              parsedOutcome === "T" &&
              !includeTies
            ) {
              continue;
            }

            filteredShoe.push(
              parsedOutcome,
            );
          }

          // Search for pattern windows.
          //
          // This intentionally matches the Python
          // implementation:
          //
          // range(len(filtered_shoe) - pattern_len)
          //
          // Therefore a matching pattern must also
          // have a subsequent outcome available.
          for (
            let i = 0;
            i <
            filteredShoe.length -
              patternLength;
            i++
          ) {
            const window = filteredShoe
              .slice(
                i,
                i + patternLength,
              )
              .join("");

            if (window === rawPattern) {
              totalPatterns++;

              const nextOutcome =
                filteredShoe[
                  i + patternLength
                ];

              if (
                nextOutcome === "B" ||
                nextOutcome === "P" ||
                nextOutcome === "T"
              ) {
                followDistribution[
                  nextOutcome
                ]++;
              }
            }
          }
        }

        setResult({
          pattern: rawPattern,
          includeTies,
          dragonAsTie,

          totalShoes,

          totalHands,

          averageHandsPerShoe:
            totalShoes > 0
              ? totalHands / totalShoes
              : 0,

          totalTies,

          totalDragons,

          totalPatterns,

          followDistribution,
        });
      } catch (simulationError) {
        console.error(simulationError);

        setError(
          "An unexpected error occurred during the simulation.",
        );
      } finally {
        setIsRunning(false);
      }
    }, 50);
  };

  return (
    <div className="app">
      <header className="app-header">
        <div className="header-inner">
          <div className="brand">
            <div className="brand-icon">
              ♠
            </div>

            <div>
              <h1>
                EZ Baccarat
                <span>
                  Pattern Frequency Analyzer
                </span>
              </h1>

              <p>
                8-Deck Monte Carlo Simulation
              </p>
	      <p>
	      <br/>
                Developed by: Long Nguyen
              </p>
            </div>
          </div>

          <div className="version">
            VER. 4
          </div>
        </div>
      </header>

      <main className="main-content">
        <div className="educational-warning">
          <div className="warning-icon">
            ⚠
          </div>

          <div>
            <strong>
              EDUCATIONAL PURPOSE ONLY
            </strong>

            <p>
              This application simulates EZ Baccarat
              outcomes for statistical and educational
              analysis. Simulation results do not
              predict future casino outcomes or
              guarantee winning results.
            </p>
          </div>
        </div>

        {error && (
          <div className="error-message">
            <span>⚠</span>
            <div>{error}</div>

            <button
              type="button"
              onClick={() => setError("")}
              aria-label="Close error"
            >
              ×
            </button>
          </div>
        )}

        <ConfigPanel
          pattern={pattern}
          shoes={shoes}
          includeTies={includeTies}
          dragonAsTie={dragonAsTie}
          isRunning={isRunning}
          onPatternChange={setPattern}
          onShoesChange={setShoes}
          onIncludeTiesChange={
            setIncludeTies
          }
          onDragonAsTieChange={
            setDragonAsTie
          }
          onRun={executeAnalysis}
        />

        <ResultsPanel result={result} />
      </main>

      <footer className="app-footer">
        <div>
          EZ Baccarat Pattern Frequency Analyzer
        </div>

        <div>
          Educational Simulation • 8-Deck Shoe
        </div>
      </footer>
    </div>
  );
}

export default App;
