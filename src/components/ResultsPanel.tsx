import React from "react";

export interface AnalysisResult {
  pattern: string;
  includeTies: boolean;
  dragonAsTie: boolean;

  totalShoes: number;
  totalHands: number;
  averageHandsPerShoe: number;

  totalTies: number;
  totalDragons: number;

  totalPatterns: number;

  followDistribution: {
    B: number;
    P: number;
    T: number;
  };
}

interface ResultsPanelProps {
  result: AnalysisResult | null;
}

const ResultsPanel: React.FC<ResultsPanelProps> = ({
  result,
}) => {
  if (!result) {
    return (
      <section className="results-card">
        <div className="section-title">
          <span className="section-icon">📊</span>
          <span>Analysis Results</span>
        </div>

        <div className="empty-results">
          <div className="empty-icon">📈</div>

          <h3>No Simulation Results</h3>

          <p>
            Configure your target sequence and number of
            shoes, then press{" "}
            <strong>Run Simulation</strong>.
          </p>
        </div>
      </section>
    );
  }

  const lastPatternChar =
    result.pattern[result.pattern.length - 1];

  const distribution = result.followDistribution;

  let totalDecisions: number;

  if (result.includeTies) {
    totalDecisions =
      distribution.B +
      distribution.P +
      distribution.T;
  } else {
    totalDecisions =
      distribution.B +
      distribution.P;
  }

  const continuationCount =
    distribution[
      lastPatternChar as "B" | "P" | "T"
    ] ?? 0;

  const continuationPct =
    totalDecisions > 0
      ? (continuationCount / totalDecisions) * 100
      : 0;

  const opposite =
    lastPatternChar === "B" ? "P" : "B";

  const oppositeCount =
    distribution[
      opposite as "B" | "P" | "T"
    ] ?? 0;

  const oppositePct =
    totalDecisions > 0
      ? (oppositeCount / totalDecisions) * 100
      : 0;

  return (
    <section className="results-card">
      <div className="section-title">
        <span className="section-icon">📊</span>
        <span>Analysis Results</span>
      </div>

      <div className="result-content">
        {/* Configuration */}
        <div className="result-section">
          <h3>
            <span>⚙</span>
            Simulation Configuration
          </h3>

          <div className="result-table">
            <div className="result-row">
              <span>
                Include Ties in Pattern Check
              </span>

              <strong
                className={
                  result.includeTies
                    ? "status-on"
                    : "status-off"
                }
              >
                {result.includeTies
                  ? "[CHECKED]"
                  : "[UNCHECKED]"}
              </strong>
            </div>

            <div className="result-row">
              <span>Count Dragon 7 as Tie</span>

              <strong
                className={
                  result.dragonAsTie
                    ? "status-on"
                    : "status-off"
                }
              >
                {result.dragonAsTie
                  ? "[CHECKED]"
                  : "[UNCHECKED]"}
              </strong>
            </div>
          </div>
        </div>

        {/* Summary */}
        <div className="result-section">
          <h3>
            <span>📋</span>
            Simulation Execution Summary
          </h3>

          <div className="stats-grid">
            <div className="stat-box">
              <span className="stat-label">
                Shoes Evaluated
              </span>

              <strong>
                {result.totalShoes.toLocaleString()}
              </strong>
            </div>

            <div className="stat-box">
              <span className="stat-label">
                Hands Processed
              </span>

              <strong>
                {result.totalHands.toLocaleString()}
              </strong>
            </div>

            <div className="stat-box">
              <span className="stat-label">
                Average Hands / Shoe
              </span>

              <strong>
                {result.averageHandsPerShoe.toFixed(2)}
              </strong>
            </div>

            <div className="stat-box">
              <span className="stat-label">
                Observed Ties
              </span>

              <strong>
                {result.totalTies.toLocaleString()}
              </strong>
            </div>

            <div className="stat-box dragon-stat">
              <span className="stat-label">
                Dragon 7s
              </span>

              <strong>
                {result.totalDragons.toLocaleString()}
              </strong>
            </div>
          </div>
        </div>

        {/* Pattern */}
        <div className="result-section pattern-result">
          <h3>
            <span>🔎</span>
            Target Sequence
          </h3>

          <div className="target-pattern">
            {result.pattern
              .split("")
              .map((char, index) => (
                <span
                  key={`${char}-${index}`}
                  className={`pattern-chip pattern-${char}`}
                >
                  {char}
                </span>
              ))}
          </div>

          <div className="pattern-found">
            <span>Total Patterns Found</span>

            <strong>
              {result.totalPatterns.toLocaleString()}
            </strong>
          </div>
        </div>

        {/* Continuation */}
        <div className="result-section">
          <h3>
            <span>↪</span>
            Continuation vs Alternative Behavior
          </h3>

          {totalDecisions === 0 ? (
            <div className="no-data">
              No valid subsequent side determinations
              were mapped.
            </div>
          ) : (
            <>
              <div className="behavior-card continuation">
                <div className="behavior-header">
                  <span>
                    Continuation ({lastPatternChar})
                  </span>

                  <strong>
                    {continuationPct.toFixed(2)}%
                  </strong>
                </div>

                <div className="progress-track">
                  <div
                    className="progress-fill"
                    style={{
                      width: `${continuationPct}%`,
                    }}
                  />
                </div>

                <small>
                  {continuationCount.toLocaleString()}{" "}
                  matches
                </small>
              </div>

              {!result.includeTies ? (
                <div className="behavior-card opposite">
                  <div className="behavior-header">
                    <span>
                      Opposite Side ({opposite})
                    </span>

                    <strong>
                      {oppositePct.toFixed(2)}%
                    </strong>
                  </div>

                  <div className="progress-track">
                    <div
                      className="progress-fill"
                      style={{
                        width: `${oppositePct}%`,
                      }}
                    />
                  </div>

                  <small>
                    {oppositeCount.toLocaleString()}{" "}
                    matches
                  </small>
                </div>
              ) : (
                <div className="distribution-grid">
                  {(["B", "P", "T"] as const).map(
                    (outcome) => {
                      const count =
                        distribution[outcome];

                      const pct =
                        totalDecisions > 0
                          ? (count /
                              totalDecisions) *
                            100
                          : 0;

                      return (
                        <div
                          className={`distribution-card distribution-${outcome}`}
                          key={outcome}
                        >
                          <div className="distribution-symbol">
                            {outcome}
                          </div>

                          <strong>
                            {pct.toFixed(2)}%
                          </strong>

                          <small>
                            {count.toLocaleString()}{" "}
                            matches
                          </small>
                        </div>
                      );
                    },
                  )}
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </section>
  );
};

export default ResultsPanel;
