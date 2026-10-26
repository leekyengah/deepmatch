import type { AdapterManifest, ProjectAdapter } from "./types.js";

const adapters = new Map<string, ProjectAdapter>();
const manifests = new Map<string, AdapterManifest>();

export function registerAdapter(
  adapter: ProjectAdapter,
  manifest: AdapterManifest,
): void {
  if (adapter.projectId !== manifest.projectId) {
    throw new Error("adapter.projectId must match manifest.projectId");
  }
  adapters.set(adapter.projectId, adapter);
  manifests.set(adapter.projectId, manifest);
}

export function getAdapter(projectId: string): ProjectAdapter {
  const a = adapters.get(projectId);
  const m = manifests.get(projectId);
  if (!a || !m) {
    throw new Error(`Unknown project adapter: ${projectId}`);
  }
  if (!m.enabled || !m.allowExecution) {
    throw new Error(
      `Adapter ${projectId} is not executable (${m.notes})`,
    );
  }
  return a;
}

export function listManifests(): AdapterManifest[] {
  return [...manifests.values()];
}

export function clearRegistry(): void {
  adapters.clear();
  manifests.clear();
}
