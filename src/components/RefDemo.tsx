import { useRef, useImperativeHandle } from "react";

// We do not require forwardRef in 19th version
export const RefDemo = ({ref,...props}) => {
  const inputRef = useRef<HTMLInputElement>(null);

  useImperativeHandle(ref, () => ({
    focusInput: () => {
      inputRef.current?.focus();
    }
  }));

  return (
    <div>
      <input ref={inputRef} type="text" placeholder="Click button to focus me" />
    </div>
  );
};