import React from "react";

interface ConfigPanelProps {
  pattern: string;
  shoes: string;
  includeTies: boolean;
  dragonAsTie: boolean;
  isRunning: boolean;

  onPatternChange: (value: string) => void;
  onShoesChange: (value: string) => void;
  onIncludeTiesChange: (value: boolean) => void;
  onDragonAsTieChange: (value: boolean) => void;
  onRun: () => void;
}

const ConfigPanel: React.FC<ConfigPanelProps> = ({
  pattern,
  shoes,
  includeTies,
  dragonAsTie,
  isRunning,
  onPatternChange,
  onShoesChange,
  onIncludeTiesChange,
  onDragonAsTieChange,
  onRun,
}) => {
  return (
    <section className="config-card">
      <div className="section-title">
        <span className="section-icon">⚙</span>
        <span>Simulation Configuration</span>
      </div>

      <div className="form-grid">
        <div className="form-group pattern-group">
          <label htmlFor="pattern">
            Target Sequence
          </label>

          <span className="input-help">
            Example: BBPP, PBPB, BBPPBB
          </span>

          <input
            id="pattern"
            type="text"
            value={pattern}
            onChange={(e) =>
              onPatternChange(
                e.target.value.toUpperCase(),
              )
            }
            maxLength={30}
            autoComplete="off"
            spellCheck={false}
            placeholder="BBPP"
          />
        </div>

        <div className="form-group">
          <label htmlFor="shoes">
            Number of Shoes
          </label>

          <span className="input-help">
            Positive whole number
          </span>

          <input
            id="shoes"
            type="number"
            min="1"
            step="1"
            value={shoes}
            onChange={(e) =>
              onShoesChange(e.target.value)
            }
          />
        </div>
      </div>

      <div className="options">
        <label className="checkbox-row">
          <input
            type="checkbox"
            checked={includeTies}
            onChange={(e) =>
              onIncludeTiesChange(e.target.checked)
            }
          />

          <span className="custom-checkbox" />

          <span>
            Include Ties in pattern comparison
          </span>
        </label>

        <label className="checkbox-row">
          <input
            type="checkbox"
            checked={dragonAsTie}
            onChange={(e) =>
              onDragonAsTieChange(e.target.checked)
            }
          />

          <span className="custom-checkbox" />

          <span>
            Count Dragon 7 as Tie
            <small>
              Otherwise Dragon 7 is counted as a Banker
              win.
            </small>
          </span>
        </label>
      </div>

      <button
        className="run-button"
        type="button"
        onClick={onRun}
        disabled={isRunning}
      >
        {isRunning ? (
          <>
            <span className="spinner" />
            Running Simulation...
          </>
        ) : (
          <>
            <span>▶</span>
            Run Simulation
          </>
        )}
      </button>
    </section>
  );
};

export default ConfigPanel;
