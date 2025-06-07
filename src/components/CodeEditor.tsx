'use client';

import Editor from '@monaco-editor/react';

const CodeEditor = ({ value, onChange, readOnly }: { value: string, onChange?: (value: string | undefined) => void, readOnly?: boolean }) => {
  return (
    <Editor
      height="400px"
      defaultLanguage="javascript"
      defaultValue="// some comment"
      value={value}
      onChange={onChange}
      theme="vs-dark"
      options={{ readOnly: readOnly || false }}
    />
  );
};

export default CodeEditor; 