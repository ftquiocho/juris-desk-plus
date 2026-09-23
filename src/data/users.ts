import type { User } from "../types";

export const users: User[] = [
  {
    id: "USR-001",
    name: "Atty. Matt Murdock",
    email: "matt@nelsonmurdock.ph",
    roles: ["MNG_PARTNER", "ATTORNEY"],
    title: "Co-Founder / Managing Partner",
  },
  {
    id: "USR-002",
    name: "Atty. Franklin Nelson",
    email: "foggy@nelsonmurdock.ph",
    roles: ["MNG_PARTNER", "ATTORNEY"],
    title: "Co-Founder / Managing Partner",
  },
  {
    id: "USR-003",
    name: "Karen Page",
    email: "karen@nelsonmurdock.ph",
    roles: ["PARALEGAL"],
    title: "Office Manager / Paralegal",
  },
  {
    id: "USR-004",
    name: "Atty. Marci Stahl",
    email: "marci@nelsonmurdock.ph",
    roles: ["ATTORNEY"],
    title: "Senior Associate",
  },
  {
    id: "USR-005",
    name: "Atty. Blake Tower",
    email: "blake@nelsonmurdock.ph",
    roles: ["ATTORNEY"],
    title: "Of Counsel",
  },
  {
    id: "USR-006",
    name: "Liza Cruz",
    email: "liza@nelsonmurdock.ph",
    roles: ["SECRETARY"],
    title: "Legal Secretary",
  },
  {
    id: "USR-007",
    name: "Carlo Garcia",
    email: "carlo@nelsonmurdock.ph",
    roles: ["BILLING"],
    title: "Billing Officer",
  },
  {
    id: "USR-008",
    name: "Rafael Lim",
    email: "rafael@nelsonmurdock.ph",
    roles: ["SYS_ADMIN"],
    title: "IT Administrator",
  },
];