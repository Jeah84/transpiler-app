import React from 'react';
import { JsonYamlFormatter } from '../components/JsonYamlFormatter';

const ToolsPage: React.FC = () => {
  return (
    <div className="max-w-4xl mx-auto p-6">
      <h1 className="text-2xl font-bold mb-4">JSON/YAML Formatter & Converter</h1>
      <div className="bg-white rounded shadow p-4 h-[600px]">
        <JsonYamlFormatter />
      </div>
    </div>
  );
};

export default ToolsPage;
