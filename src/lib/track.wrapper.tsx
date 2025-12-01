"use client";
import { createContext, useContext, useState } from "react";

export const UserContext = createContext<IContext | null>(null);

export const UserContextProvider = ({
  children,
}: {
  children: React.ReactNode;
}) => {
  const [userInfoId, setUserInfoId] = useState<string>("");

  return (
    <UserContext.Provider value={{ userInfoId, setUserInfoId }}>
      {children}
    </UserContext.Provider>
  );
};

export const useInfoContext = () => useContext(UserContext);
