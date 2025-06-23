import { useRef } from "react";
import { RefDemo } from "./RefDemo";

export const ParentComponent = () => {
  const refDemoRef = useRef<{ focusInput: () => void }>(null);

  const handleFocus = () => {
    refDemoRef.current?.focusInput();
  };

  return (
    <div>
      <RefDemo ref={refDemoRef} />
      <button onClick={handleFocus} style={{ marginTop: 8 }}>
        Focus the input in child
      </button>
    </div>
  );
};
