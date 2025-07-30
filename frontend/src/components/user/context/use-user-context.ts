"use client";

import { useContext } from "react";

import { UserContext } from "./user-context";

// ----------------------------------------------------------------------

export function useUserContext() {
  const context = useContext(UserContext);

  if (!context) throw new Error("useUserContext must be use inside UserProvider");

  return context;
}
