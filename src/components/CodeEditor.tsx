'use client';

import Editor from '@monaco-editor/react';

const CodeEditor = ({ value, onChange }: { value: string, onChange: (value: string | undefined) => void }) => {
  return (
    <Editor
      height="400px"
      defaultLanguage="javascript"
      defaultValue="// some comment"
      value={value}
      onChange={onChange}
      theme="vs-dark"
    />
  );
};

export default CodeEditor; 