export interface DocTemplate {
  id: string;
  category: string;
  name: string;
  /** Variables auto-substituted from matter + client */
  body?: string;
}

export const documentTemplates: DocTemplate[] = [
  // Civil Litigation
  { id: "TPL-001", category: "Civil Litigation", name: "Complaint" },
  { id: "TPL-002", category: "Civil Litigation", name: "Answer" },
  { id: "TPL-003", category: "Civil Litigation", name: "Motion for Reconsideration" },
  { id: "TPL-004", category: "Civil Litigation", name: "Motion to Dismiss" },
  { id: "TPL-005", category: "Civil Litigation", name: "Pre-Trial Brief" },
  { id: "TPL-006", category: "Civil Litigation", name: "Position Paper" },

  // Criminal
  { id: "TPL-007", category: "Criminal", name: "Judicial Affidavit" },
  { id: "TPL-008", category: "Criminal", name: "Motion to Quash" },
  { id: "TPL-009", category: "Criminal", name: "Bail Application" },

  // Family Law
  { id: "TPL-010", category: "Family Law", name: "Petition for Annulment" },
  { id: "TPL-011", category: "Family Law", name: "Petition for Nullity" },
  { id: "TPL-012", category: "Family Law", name: "Deed of Separation" },

  // Corporate
  { id: "TPL-013", category: "Corporate", name: "Board Resolution" },
  { id: "TPL-014", category: "Corporate", name: "Secretary's Certificate" },
  { id: "TPL-015", category: "Corporate", name: "Articles of Incorporation" },

  // Notarial
  { id: "TPL-016", category: "Notarial", name: "Deed of Absolute Sale" },
  { id: "TPL-017", category: "Notarial", name: "Deed of Donation" },
  { id: "TPL-018", category: "Notarial", name: "Special Power of Attorney" },
  { id: "TPL-019", category: "Notarial", name: "Affidavit of Loss" },

  // Labor
  { id: "TPL-020", category: "Labor", name: "Complaint for Illegal Dismissal" },
  { id: "TPL-021", category: "Labor", name: "Position Paper (Labor)" },

  // Special Proceedings
  { id: "TPL-022", category: "Special Proceedings", name: "Petition for Letters of Administration" },
  { id: "TPL-023", category: "Special Proceedings", name: "Petition for Guardianship" },
];