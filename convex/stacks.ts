/** The "What do you use today?" choices, shared by the intake mutation and the notifiers. */
export const STACKS = ["netsuite", "epicor-p21", "sap-b1", "spreadsheets", "other"] as const;

export const STACK_LABELS: Record<string, string> = {
  netsuite: "NetSuite",
  "epicor-p21": "Epicor Prophet 21",
  "sap-b1": "SAP Business One",
  spreadsheets: "Excel / spreadsheets",
  other: "Something else",
};

export const stackLabel = (stack: string) => STACK_LABELS[stack] ?? stack;
