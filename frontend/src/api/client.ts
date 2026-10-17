import {
  AnalysisResult,
  ConfigurationSnapshot,
  DemoScenario,
  EngineStatus,
  SimulateFixResult,
} from '../types';

const API_BASE = '/api';

export async function fetchHealth(): Promise<{ status: string; app: string; version: string; engine: EngineStatus }> {
  const res = await fetch(`${API_BASE}/health`);
  if (!res.ok) throw new Error(`Health check failed: ${res.statusText}`);
  return res.json();
}

export async function fetchDemoScenarios(): Promise<DemoScenario[]> {
  const res = await fetch(`${API_BASE}/demo/scenarios`);
  if (!res.ok) throw new Error(`Failed to load scenarios: ${res.statusText}`);
  return res.json();
}

export async function runAnalysis(
  baseline: ConfigurationSnapshot,
  candidate: ConfigurationSnapshot,
  scenarioId?: string
): Promise<AnalysisResult> {
  const res = await fetch(`${API_BASE}/analyze`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      scenario_id: scenarioId,
      baseline,
      candidate,
    }),
  });
  if (!res.ok) throw new Error(`Analysis failed: ${res.statusText}`);
  return res.json();
}

export async function fetchScan(scanId: string): Promise<AnalysisResult> {
  const res = await fetch(`${API_BASE}/scans/${scanId}`);
  if (!res.ok) throw new Error(`Failed to fetch scan: ${res.statusText}`);
  return res.json();
}

export async function simulateFix(
  scanId: string,
  candidate: ConfigurationSnapshot,
  edgeToRemove?: [string, string, string],
  remediationOptionId?: string
): Promise<SimulateFixResult> {
  const res = await fetch(`${API_BASE}/scans/${scanId}/simulate-fix`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      candidate,
      edge_to_remove: edgeToRemove,
      remediation_option_id: remediationOptionId,
    }),
  });
  if (!res.ok) throw new Error(`Simulate fix failed: ${res.statusText}`);
  return res.json();
}

export async function fetchScanMarkdown(scanId: string): Promise<string> {
  const res = await fetch(`${API_BASE}/scans/${scanId}/report.md`);
  if (!res.ok) throw new Error(`Failed to load markdown: ${res.statusText}`);
  return res.text();
}

export async function fetchScanSarif(scanId: string): Promise<Record<string, any>> {
  const res = await fetch(`${API_BASE}/scans/${scanId}/report.sarif`);
  if (!res.ok) throw new Error(`Failed to load SARIF: ${res.statusText}`);
  return res.json();
}
