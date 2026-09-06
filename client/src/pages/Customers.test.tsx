// @vitest-environment jsdom
import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

const customer = {
  id: 7,
  name: "Acme Bank",
  code: "ACME-001",
  status: "active",
  primaryContactName: "Operations Desk",
  primaryContactEmail: "ops@acme.example",
  accounts: [],
  leads: [],
  recipients: [],
  assignments: [{ checklistId: "lifecycle-kyc" }, { checklistId: "daily-operational" }],
};

vi.mock("wouter", () => ({ useLocation: () => ["/customers", vi.fn()] }));
vi.mock("@/lib/trpc", () => ({
  trpc: {
    customers: {
      list: { useQuery: () => ({ data: [customer], isLoading: false, isError: false, refetch: vi.fn() }) },
      create: { useMutation: () => ({ isPending: false, error: null, mutate: vi.fn() }) },
      update: { useMutation: () => ({ isPending: false, error: null, mutate: vi.fn() }) },
      archive: { useMutation: () => ({ isPending: false, error: null, mutate: vi.fn() }) },
    },
    settings: {
      directory: { list: { useQuery: () => ({ data: [], isLoading: false }) } },
    },
    reviews: {
      history: { useQuery: () => ({ data: [], isLoading: false }) },
    },
  },
}));

import Customers from "./Customers";

describe("Customers lifecycle assignment view", () => {
  it("shows enabled section totals and individual lifecycle badges", () => {
    render(<Customers />);
    expect(screen.getByText("1/4 enabled")).toBeTruthy();
    expect(screen.getByText("Sales-to-Delivery KYC")).toBeTruthy();
    expect(screen.getByText("Not assigned")).toBeTruthy();
  });
});
