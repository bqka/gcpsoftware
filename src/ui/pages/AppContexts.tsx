import React, { createContext, useContext, useEffect, useState } from "react"

/* ---------------- Username Context ---------------- */
const UsernameContext = createContext<{
  username: string | null
  setUsername: (name: string) => void
}>({
  username: null,
  setUsername: () => {},
})

export const UsernameProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [username, setUsernameState] = useState<string | null>(null)

  useEffect(() => {
    const stored = localStorage.getItem("username");
    if (stored) {
      setUsernameState(stored);
    }
  }, []);

  const setUsername = (name: string | null) => {
    if (name) {
      localStorage.setItem("username", name);
    } else {
      localStorage.removeItem("username");
    }
    setUsernameState(name);
  };

  return (
    <UsernameContext.Provider value={{ username, setUsername }}>
      {children}
    </UsernameContext.Provider>
  )
}

export const useUsername = () => useContext(UsernameContext)

/* ---------------- WireType Context ---------------- */
const WireTypeContext = createContext<{
  selectedWireType: string
  setSelectedWireType: (type: string) => void
}>({
  selectedWireType: "singlewire",
  setSelectedWireType: () => {},
})

export const WireTypeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [selectedWireType, setSelectedWireType] = useState<string>("singlewire")
  return (
    <WireTypeContext.Provider value={{ selectedWireType, setSelectedWireType }}>
      {children}
    </WireTypeContext.Provider>
  )
}

export const useWireType = () => useContext(WireTypeContext)