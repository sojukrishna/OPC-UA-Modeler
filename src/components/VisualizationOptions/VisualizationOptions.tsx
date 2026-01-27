import React from 'react';
import './VisualizationOptions.css';

// Define interfaces based on the technical details
interface ParsedNodeset {
  id: string;
  name: string;
  namespaces: { index: number; uri: string; prefix: string }[];
  nodeCount: number;
}

interface Node {
  nodeId: string;
  displayName: { text: string };
}

interface VisualizationOptionsProps {
  nodesetList: ParsedNodeset[];
  activeNodesetId: string;
  onNodesetSwitch: (nodesetId: string) => void;
  selectedNodeId?: string;
  onNodeSelect: (node: Node) => void;
  viewMode: 'tree' | 'graph';
  onViewModeChange: (mode: 'tree' | 'graph') => void;
}

const VisualizationOptions: React.FC<VisualizationOptionsProps> = ({
  nodesetList,
  activeNodesetId,
  onNodesetSwitch,
  viewMode,
  onViewModeChange,
}) => {
  const activeNodeset = nodesetList.find(ns => ns.id === activeNodesetId);

  return (
    <div className="visualization-options">
      <div className="nodeset-selector">
        <label htmlFor="nodeset-select">Active Nodeset: </label>
        <select
          id="nodeset-select"
          value={activeNodesetId}
          onChange={(e) => onNodesetSwitch(e.target.value)}
        >
          {nodesetList.map((nodeset) => (
            <option key={nodeset.id} value={nodeset.id}>
              {nodeset.name}
            </option>
          ))}
        </select>
        {activeNodeset && (
          <span className="nodeset-info">
            ({activeNodeset.nodeCount} nodes, {activeNodeset.namespaces.length} NS)
          </span>
        )}
      </div>
      <div className="view-mode-switcher">
        <button
          className={viewMode === 'tree' ? 'active' : ''}
          onClick={() => onViewModeChange('tree')}
        >
          🌳 Tree
        </button>
        <button
          className={viewMode === 'graph' ? 'active' : ''}
          onClick={() => onViewModeChange('graph')}
        >
          📊 Graph
        </button>
      </div>
    </div>
  );
};

export default VisualizationOptions;
