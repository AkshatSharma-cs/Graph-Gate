import React, { useEffect, useState } from 'react';
import {
  AnalysisResult,
  ConfigurationSnapshot,
  DemoScenario,
  EngineStatus,
  PathFinding,
} from './types';
import { fetchDemoScenarios, fetchHealth, runAnalysis } from './api/client';
import { Sidebar, NavTab } from './components/Sidebar';
import { TopNav } from './components/TopNav';
import { KPICards } from './components/KPICards';
import { GraphExplorer } from './components/GraphExplorer';
import { FindingsTable } from './components/FindingsTable';
import { FindingDetailDrawer } from './components/FindingDetailDrawer';
import { SimulateFixModal } from './components/SimulateFixModal';
import { CompareSnapshots } from './components/CompareSnapshots';
import { CIReportView } from './components/CIReportView';
import { PolicyList } from './components/PolicyList';
import { AlertCircle, RefreshCw } from 'lucide-react';

export function App() {
  const [currentTab, setCurrentTab] = useState<NavTab>('overview');
  const [scenarios, setScenarios] = useState<DemoScenario[]>([]);
  const [activeScenarioId, setActiveScenarioId] = useState<string>('scenario-risky');
  const [engineStatus, setEngineStatus] = useState<EngineStatus | null>(null);

  const [analysis, setAnalysis] = useState<AnalysisResult | null>(null);
  const [selectedFinding, setSelectedFinding] = useState<PathFinding | null>(null);
  const [isSimulateModalOpen, setIsSimulateModalOpen] = useState(false);
  const [findingToFix, setFindingToFix] = useState<PathFinding | null>(null);

  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Initial load
  useEffect(() => {
    async function init() {
      try {
        setIsLoading(true);
        const [healthData, scens] = await Promise.all([
          fetchHealth().catch(() => ({
            engine: { falkordb_connected: false, engine_mode: 'local_graph_engine_active', host: 'localhost', port: 6379 }
          })),
          fetchDemoScenarios(),
        ]);

        if (healthData && healthData.engine) {
          setEngineStatus(healthData.engine);
        }
        setScenarios(scens);

        // Run default scenario
        const defaultScen = scens.find(s => s.id === 'scenario-risky') || scens[0];
        if (defaultScen) {
          setActiveScenarioId(defaultScen.id);
          const res = await runAnalysis(defaultScen.baseline, defaultScen.candidate, defaultScen.id);
          setAnalysis(res);
          if (res.findings.length > 0) {
            setSelectedFinding(res.findings[0]);
          }
        }
      } catch (err: any) {
        setError(err.message || 'Initialization failed');
      } finally {
        setIsLoading(false);
      }
    }
    init();
  }, []);

  const handleSelectScenario = async (scenId: string) => {
    setActiveScenarioId(scenId);
    const scen = scenarios.find(s => s.id === scenId);
    if (!scen) return;

    try {
      setIsLoading(true);
      setError(null);
      const res = await runAnalysis(scen.baseline, scen.candidate, scen.id);
      setAnalysis(res);
      setSelectedFinding(res.findings.length > 0 ? res.findings[0] : null);
    } catch (err: any) {
      setError(err.message || 'Failed to analyze scenario');
    } finally {
      setIsLoading(false);
    }
  };

  const handleReRun = async () => {
    const scen = scenarios.find(s => s.id === activeScenarioId);
    if (!scen) return;
    try {
      setIsLoading(true);
      const res = await runAnalysis(scen.baseline, scen.candidate, scen.id);
      setAnalysis(res);
      setSelectedFinding(res.findings.length > 0 ? res.findings[0] : null);
    } catch (err: any) {
      setError(err.message || 'Re-run analysis failed');
    } finally {
      setIsLoading(false);
    }
  };

  const handleOpenSimulateFix = (f: PathFinding) => {
    setFindingToFix(f);
    setIsSimulateModalOpen(true);
  };

  const activeScenario = scenarios.find(s => s.id === activeScenarioId);

  return (
    <div className="flex h-screen bg-[#F5F6F4] text-[#17211F] overflow-hidden selection:bg-[#286A61]/20 select-none font-sans">
      {/* Precision Navigation Rail */}
      <Sidebar
        currentTab={currentTab}
        onTabChange={setCurrentTab}
        engineStatus={engineStatus}
        violationsCount={analysis?.summary.new_violations_count ?? 0}
      />

      {/* Main Workbench Area */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden select-text">
        {/* Command Bar */}
        <TopNav
          scenarios={scenarios}
          activeScenarioId={activeScenarioId}
          onSelectScenario={handleSelectScenario}
          onReRunAnalysis={handleReRun}
          isLoading={isLoading}
          ciStatus={analysis?.ci_status ?? 'pass'}
          scanId={analysis?.scan_id ?? ''}
        />

        {/* Workbench Content */}
        <main className="flex-1 overflow-y-auto p-6 space-y-6">
          {error && (
            <div className="p-3.5 bg-red-50 border border-red-200 text-[#B42318] rounded text-xs font-mono flex items-center gap-2">
              <AlertCircle size={16} />
              <span>{error}</span>
            </div>
          )}

          {isLoading && !analysis ? (
            <div className="flex flex-col items-center justify-center h-96 text-[#64716C] space-y-3">
              <RefreshCw size={26} className="animate-spin text-[#286A61]" />
              <div className="text-xs font-mono font-medium tracking-wide">
                TRAVERSING FALKORDB DATA-FLOW PATHS...
              </div>
            </div>
          ) : analysis ? (
            <>
              {/* Tab: Overview */}
              {currentTab === 'overview' && (
                <div className="space-y-6">
                  {/* Integrated Telemetry Strip */}
                  <KPICards
                    summary={analysis.summary}
                    ciStatus={analysis.ci_status}
                  />

                  {/* Clean Workbench Graph Canvas */}
                  <GraphExplorer
                    graphData={analysis.candidate_graph}
                    highlightedNodeIds={selectedFinding?.path_node_ids ?? []}
                    highlightedEdgeIds={selectedFinding?.path_edge_ids ?? []}
                    title="Candidate Graph — Selected Risk Path Highlighted"
                  />

                  {/* Security Audit Table */}
                  <FindingsTable
                    findings={analysis.findings}
                    selectedFindingId={selectedFinding?.id}
                    onSelectFinding={setSelectedFinding}
                    onSimulateFix={handleOpenSimulateFix}
                  />
                </div>
              )}

              {/* Tab: Compare Snapshots */}
              {currentTab === 'compare' && activeScenario && (
                <CompareSnapshots
                  baseline={activeScenario.baseline}
                  candidate={activeScenario.candidate}
                />
              )}

              {/* Tab: Graph Explorer Fullscreen */}
              {currentTab === 'graph' && (
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <h2 className="font-mono text-xs font-semibold text-[#17211F] uppercase tracking-wider">
                        Topology Workbench
                      </h2>
                      <p className="text-xs text-[#64716C] mt-0.5">
                        Interactive graph model representing tools, contexts, identities, and egress sinks
                      </p>
                    </div>
                  </div>
                  <GraphExplorer
                    graphData={analysis.candidate_graph}
                    highlightedNodeIds={selectedFinding?.path_node_ids ?? []}
                    highlightedEdgeIds={selectedFinding?.path_edge_ids ?? []}
                    title="Candidate Topology"
                  />
                </div>
              )}

              {/* Tab: Findings */}
              {currentTab === 'findings' && (
                <div className="space-y-4">
                  <FindingsTable
                    findings={analysis.findings}
                    selectedFindingId={selectedFinding?.id}
                    onSelectFinding={setSelectedFinding}
                    onSimulateFix={handleOpenSimulateFix}
                  />
                </div>
              )}

              {/* Tab: Policies */}
              {currentTab === 'policies' && <PolicyList />}

              {/* Tab: CI Report & SARIF */}
              {currentTab === 'report' && <CIReportView analysis={analysis} />}
            </>
          ) : null}
        </main>
      </div>

      {/* Path Witness Detail Drawer */}
      <FindingDetailDrawer
        finding={selectedFinding}
        onClose={() => setSelectedFinding(null)}
        onSimulateFix={handleOpenSimulateFix}
      />

      {/* Counterfactual Remediation Simulator */}
      {activeScenario && (
        <SimulateFixModal
          scanId={analysis?.scan_id ?? ''}
          candidateSnapshot={activeScenario.candidate}
          finding={findingToFix}
          isOpen={isSimulateModalOpen}
          onClose={() => setIsSimulateModalOpen(false)}
        />
      )}
    </div>
  );
}
