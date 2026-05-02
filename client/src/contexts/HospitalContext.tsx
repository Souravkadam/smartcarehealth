import { Hospital } from "@/data/hospitals";
import React, { createContext, useContext, useState } from "react";

interface HospitalContextType {
  compareList: Hospital[];
  addToCompare: (hospital: Hospital) => void;
  removeFromCompare: (hospitalId: string) => void;
  clearCompare: () => void;
  isInCompare: (hospitalId: string) => boolean;
  canAddToCompare: () => boolean;
}

const HospitalContext = createContext<HospitalContextType | undefined>(
  undefined
);

export function HospitalProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const [compareList, setCompareList] = useState<Hospital[]>([]);

  const addToCompare = (hospital: Hospital) => {
    if (compareList.length < 4 && !isInCompare(hospital.id)) {
      setCompareList([...compareList, hospital]);
    }
  };

  const removeFromCompare = (hospitalId: string) => {
    setCompareList(compareList.filter((h) => h.id !== hospitalId));
  };

  const clearCompare = () => {
    setCompareList([]);
  };

  const isInCompare = (hospitalId: string) => {
    return compareList.some((h) => h.id === hospitalId);
  };

  const canAddToCompare = () => {
    return compareList.length < 4;
  };

  return (
    <HospitalContext.Provider
      value={{
        compareList,
        addToCompare,
        removeFromCompare,
        clearCompare,
        isInCompare,
        canAddToCompare,
      }}
    >
      {children}
    </HospitalContext.Provider>
  );
}

export function useHospitalContext() {
  const context = useContext(HospitalContext);
  if (context === undefined) {
    throw new Error(
      "useHospitalContext must be used within a HospitalProvider"
    );
  }
  return context;
}
