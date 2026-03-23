export const phaseDefinitions = {
  quietPier: {
    id: "quietPier",
    label: "Quiet Pier",
    uiTone: "cozy",
    description: "A warm, manual dockside start focused on learning the loop.",
  },
  skiffOperator: {
    id: "skiffOperator",
    label: "Skiff Operator",
    uiTone: "cozy",
    description: "Short-range trips add hold space, fuel pressure, and routing.",
  },
  docksideGear: {
    id: "docksideGear",
    label: "Dockside Gear",
    uiTone: "operational",
    description: "Passive gear starts competing with storage and timing.",
  },
  fleetOps: {
    id: "fleetOps",
    label: "Fleet Ops",
    uiTone: "operational",
    description: "The shell hardens as boats, maintenance, and crew demands rise.",
  },
  processingContracts: {
    id: "processingContracts",
    label: "Processing & Contracts",
    uiTone: "industrial",
    description: "Raw catch becomes throughput, queues, and timed obligations.",
  },
  regionalExtraction: {
    id: "regionalExtraction",
    label: "Regional Extraction",
    uiTone: "industrial",
    description: "Long-term depletion, trust, and reset pressure dominate.",
  },
} as const;

export function getPhaseDefinition(phaseId: keyof typeof phaseDefinitions) {
  return phaseDefinitions[phaseId];
}
