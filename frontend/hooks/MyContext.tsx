// context/MyContext.tsx
import { createContext, useState, ReactNode } from 'react';

// 1. Define the shape of the context
interface MyContextType {
  role: { name: string } | null;
  setRole: React.Dispatch<React.SetStateAction<{ name: string } | null>>;
}

// 2. Provide a default value (can be undefined initially)
export const MyContext = createContext<MyContextType | undefined>(undefined);

// 3. Type the provider props
interface MyProviderProps {
  children: ReactNode;
}

export const MyProvider = ({ children }: MyProviderProps) => {
  // Corrected state variable names
  const [role, setRole] = useState<{ name: string } | null>(null);

  return (
    <MyContext.Provider value={{ role, setRole }}>
      {children}
    </MyContext.Provider>
  );
};
