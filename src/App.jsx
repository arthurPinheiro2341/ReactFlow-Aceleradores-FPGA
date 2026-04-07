import React, { useState, useCallback } from 'react';
import ReactFlow, { Background, Controls, applyNodeChanges } from 'reactflow';
import 'reactflow/dist/style.css';
import './App.css';
import { fpgaStyle, digitPatterns, segmentStyle } from './fpga-styles';

// --- 1. COMPONENTES DOS NÓS CUSTOMIZADOS ---

// Componente de botão FPGA
// - clique esquerdo alterna o estado do botão
// - clique direito abre o menu de vínculo
const FPGA_Button = ({ data, id }) => {
  const { isOn, onToggle, label, isLinked, onContextMenuClick } = data;

  const handleContextMenu = (e) => {
    e.preventDefault();
    onContextMenuClick(id, 'fpga_button', e.clientX, e.clientY);
  };

  return (
    <div
      className="fpga-button"
      style={{
        ...fpgaStyle.buttonNode(isOn),
        border: isLinked ? '3px solid #ffff00' : '2px solid #707070',
        boxShadow: isLinked ? '0 0 10px rgba(255, 255, 0, 0.5)' : undefined,
      }}
      onClick={onToggle}
      onContextMenu={handleContextMenu}
    >
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
        <span>{label}</span>
      </div>
    </div>
  );
};

// Componente de LED FPGA
// - clique direito abre o menu de vínculo
const FPGA_LED = ({ data, id }) => {
  const { isOn, color, label, onContextMenuClick } = data;

  const handleContextMenu = (e) => {
    e.preventDefault();
    onContextMenuClick(id, 'fpga_led', e.clientX, e.clientY);
  };

  return (
    <div className="fpga-led" onContextMenu={handleContextMenu}>
      <div style={{ ...fpgaStyle.ledNode(isOn, color) }} />
      <div className="fpga-node-label">{label}</div>
    </div>
  );
};

// Componente de display de 7 segmentos FPGA
// - clique direito abre o menu de vínculo
const FPGA_Digit = ({ data, id }) => {
  const { value, label, onContextMenuClick } = data;
  const segments = digitPatterns[value] || digitPatterns[0];

  const handleContextMenu = (e) => {
    e.preventDefault();
    onContextMenuClick(id, 'fpga_digit', e.clientX, e.clientY);
  };

  return (
    <div className="fpga-digit" onContextMenu={handleContextMenu}>
      <div style={{ ...fpgaStyle.digitNode }}>
        <div style={{
          ...segmentStyle(segments[0]),//led de cima deitado
          width: '40px',
          height: '12px',
          top: '13px',
          left: '31px',
        }} />
        <div style={{
          ...segmentStyle(segments[1]),//led da esquerda em pé 
          width: '12px',
          height: '45px',
          top: '18px',
          left: '19px',
        }} />
        <div style={{
          ...segmentStyle(segments[2]),//led da direita em pé
          width: '12px',
          height: '45px',
          top: '18px',
          left: '71px',
        }} />
        
        <div style={{
          ...segmentStyle(segments[3]),//led da esquerda de baixo em pé 
          width: '12px',
          height: '45px',
          bottom: '15px',
          left: '19px',
        }} />
        <div style={{
          ...segmentStyle(segments[4]),//led da direita de baixo em pé
          width: '12px',
          height: '45px',
          bottom: '15px',
          left: '71px',
        }} />
        <div style={{
          ...segmentStyle(segments[5]),//led de baixo deitado
          width: '40px',
          height: '12px',
          bottom: '12px',
          left: '31px',
        }} />
        <div style={{
          ...segmentStyle(segments[6]),//led do meio deitado
          width: '40px',
          height: '12px',
          top: '52%',
          left: '31px',
          transform: 'translateY(-50%)',
        }} />
      </div>
      <div style={{ fontSize: '11px', marginTop: '6px', color: '#ffffff' }}>{label}</div>
      <div style={{ fontSize: '16px', marginTop: '4px', color: '#ffffff', fontWeight: 700 }}>{value}</div>
    </div>
  );
};

// --- 2. MAPEAMENTO DE TIPOS ---
const nodeTypes = {
  fpga_button: FPGA_Button,
  fpga_led: FPGA_LED,
  fpga_digit: FPGA_Digit,
};

// --- 3. CONFIGURAÇÃO INICIAL DOS NÓS ---
const initialNodes = [
  {
    id: 'node-btn-led',
    type: 'fpga_button',
    data: { label: '', isOn: true, onToggle: () => {} },
    position: { x: 120, y: 120 },
  },
  {
    id: 'node-led-1',
    type: 'fpga_led',
    data: { label: 'LED', isOn: false, color: 'off' },
    position: { x: 120, y: 220 },
  },
  {
    id: 'node-btn-timer',
    type: 'fpga_button',
    data: { label: '', isOn: true, onToggle: () => {} },
    position: { x: 320, y: 120 },
  },
  {
    id: 'node-digit-1',
    type: 'fpga_digit',
    data: { label: 'COUNT', value: 0 },
    position: { x: 320, y: 220 },
  },
];

// --- 4. COMPONENTE PRINCIPAL (APP) ---
export default function App() {
  const [nodes, setNodes] = useState(initialNodes);
  const [nextId, setNextId] = useState(5);
  const [linkedNodes, setLinkedNodes] = useState({});
  const [contextMenu, setContextMenu] = useState(null);
  const [contextNodeInfo, setContextNodeInfo] = useState(null);
  const [selectingSourceForLink, setSelectingSourceForLink] = useState(null);

  // Atualiza LED/contador vinculados ao botão clicado
  const toggleNodeState = useCallback((buttonId) => {
    setNodes((nds) =>
      nds.map((node) => {
        // Se é um LED/Contador que tem este botão vinculado
        if (linkedNodes[node.id] && linkedNodes[node.id].includes(buttonId)) {
          if (node.type === 'fpga_digit') {
            return {
              ...node,
              data: {
                ...node.data,
                value: (node.data.value + 1) % 10,
              },
            };
          }
          if (node.type === 'fpga_led') {
            const cycle = ['red', 'green', 'blue', 'off'];
            const current = node.data.color || 'off';
            const next = cycle[(cycle.indexOf(current) + 1) % cycle.length];

            return {
              ...node,
              data: {
                ...node.data,
                color: next,
                isOn: next !== 'off',
              },
            };
          }
        }

        return node;
      })
    );
  }, [linkedNodes]);

  const handleContextMenuClick = useCallback((nodeId, nodeType, clientX, clientY) => {
    setContextNodeInfo({ nodeId, nodeType });
    setContextMenu({ x: clientX, y: clientY });
  }, []);

  // Marca o botão como fonte de vínculo
  const handleSelectSourceForLink = useCallback(() => {
    if (contextNodeInfo?.nodeType === 'fpga_button') {
      setSelectingSourceForLink(contextNodeInfo.nodeId);
      setContextMenu(null);
      setContextNodeInfo(null);
    }
  }, [contextNodeInfo]);

  // Cria vínculo entre o botão selecionado e o alvo atual
  const handleVinculateToTarget = useCallback(() => {
    if (selectingSourceForLink && contextNodeInfo?.nodeType !== 'fpga_button') {
      const targetId = contextNodeInfo.nodeId;
      const buttonId = selectingSourceForLink;

      // Verificar se este botão já tem um vínculo
      const buttonAlreadyLinked = Object.values(linkedNodes).some(buttons => buttons.includes(buttonId));

      if (buttonAlreadyLinked) {
        alert('Este botão já está vinculado a outro componente. Desvincule antes de criar um novo vínculo.');
        setContextMenu(null);
        setContextNodeInfo(null);
        return;
      }

      // Adicionar este botão à lista de botões vinculados ao target
      setLinkedNodes((prev) => ({
        ...prev,
        [targetId]: [...(new Set([...(prev[targetId] || []), buttonId]))]
      }));

      setSelectingSourceForLink(null);
      setContextMenu(null);
      setContextNodeInfo(null);
    }
  }, [selectingSourceForLink, contextNodeInfo, linkedNodes]);

  // Remove vínculo entre botão e alvo
  const handleUnlink = useCallback((targetId, buttonId) => {
    setLinkedNodes((prev) => ({
      ...prev,
      [targetId]: (prev[targetId] || []).filter(id => id !== buttonId)
    }));
    setContextMenu(null);
    setContextNodeInfo(null);
  }, []);

  // Fecha menu de contexto e cancela seleção de vínculo
  const closeContextMenu = useCallback(() => {
    setContextMenu(null);
    setContextNodeInfo(null);
    setSelectingSourceForLink(null);
  }, []);

  const addButton = useCallback(() => {
    const newNode = {
      id: `node-btn-${nextId}`,
      type: 'fpga_button',
      data: { label: '', isOn: true, onToggle: () => {} },
      position: { x: 120 + Math.random() * 200, y: 120 + Math.random() * 200 },
    };
    setNodes((nds) => [...nds, newNode]);
    setNextId(nextId + 1);
  }, [nextId]);

  const addLED = useCallback(() => {
    const newNode = {
      id: `node-led-${nextId}`,
      type: 'fpga_led',
      data: { label: 'LED', isOn: false, color: 'off' },
      position: { x: 120 + Math.random() * 200, y: 220 + Math.random() * 200 },
    };
    setNodes((nds) => [...nds, newNode]);
    setNextId(nextId + 1);
  }, [nextId]);

  const addCounter = useCallback(() => {
    const newNode = {
      id: `node-digit-${nextId}`,
      type: 'fpga_digit',
      data: { label: 'COUNT', value: 0 },
      position: { x: 320 + Math.random() * 200, y: 120 + Math.random() * 200 },
    };
    setNodes((nds) => [...nds, newNode]);
    setNextId(nextId + 1);
  }, [nextId]);

  const nodesWithCallbacks = nodes.map((node) => {
    if (node.type === 'fpga_button') {
      return {
        ...node,
        data: {
          ...node.data,
          onToggle: () => toggleNodeState(node.id),
        },
      };
    }
    return node;
  });

  const onNodesChange = useCallback((changes) => setNodes((nds) => applyNodeChanges(changes, nds)), []);

  // Wrapper para adicionar isLinked e onContextMenuClick aos nós
  const getEnhancedNodes = () => {
    return nodesWithCallbacks.map((node) => {
      // Apenas botões mostram borda quando selecionados para vincular
      const isBeingSelectedForLink = node.type === 'fpga_button' && selectingSourceForLink === node.id;

      return {
        ...node,
        data: {
          ...node.data,
          isLinked: isBeingSelectedForLink,
          onContextMenuClick: handleContextMenuClick,
        },
      };
    });
  };

  return (
    <div style={fpgaStyle.canvas} onClick={closeContextMenu}>
      <div className="fpga-panel">
        <label className="fpga-panel__heading">
          Adicionar Nós:
        </label>
        <button onClick={addButton} className="fpga-panel__button" style={{ background: '#4a7c21' }}>
          + Botão
        </button>
        <button onClick={addLED} className="fpga-panel__button" style={{ background: '#a62d3d' }}>
          + LED
        </button>
        <button onClick={addCounter} className="fpga-panel__button" style={{ background: '#2f5f84' }}>
          + Contador
        </button>
        <div className="fpga-panel__section">
          <label className="fpga-panel__heading">
            Vincular:
          </label>
          <div className="fpga-panel__hint">
            {selectingSourceForLink ? (
              <span className="fpga-panel__hint--active">✓ Clique direito no LED/Contador</span>
            ) : (
              <span className="fpga-panel__hint--waiting">Clique direito no Botão</span>
            )}
          </div>
          <div className="fpga-panel__subtext">
            • 1 botão = 1 vínculo<br/>
            • 1 LED/Contador = vários vínculos
          </div>
          {selectingSourceForLink && (
            <button onClick={closeContextMenu} className="fpga-panel__button fpga-panel__button--cancel">
              Cancelar
            </button>
          )}
        </div>
      </div>

      {contextMenu && (
        <div
          className="fpga-menu"
          style={{ top: `${contextMenu.y}px`, left: `${contextMenu.x}px` }}
          onClick={(e) => e.stopPropagation()}
        >
          {contextNodeInfo?.nodeType === 'fpga_button' && !selectingSourceForLink && (
            <button onClick={handleSelectSourceForLink} className="fpga-menu__button">
              ✓ Selecionar para vincular
            </button>
          )}

          {contextNodeInfo?.nodeType !== 'fpga_button' && selectingSourceForLink && (
            <button onClick={handleVinculateToTarget} className="fpga-menu__button fpga-menu__button--action">
              ✓ Vincular para aqui
            </button>
          )}

          {contextNodeInfo?.nodeType !== 'fpga_button' && Object.entries(linkedNodes).some(([targetId, buttons]) => targetId === contextNodeInfo.nodeId && buttons.length > 0) && (
            <>
              {linkedNodes[contextNodeInfo.nodeId]?.map((buttonId) => {
                return (
                  <button
                    key={buttonId}
                    onClick={() => handleUnlink(contextNodeInfo.nodeId, buttonId)}
                    className="fpga-menu__button fpga-menu__button--unlink"
                  >
                    ✕ Desvincular botão
                  </button>
                );
              })}
            </>
          )}

          <button onClick={closeContextMenu} className="fpga-menu__button fpga-menu__button--cancel">
            Cancelar
          </button>
        </div>
      )}

      <ReactFlow 
        nodes={getEnhancedNodes()}
        onNodesChange={onNodesChange}
        nodeTypes={nodeTypes}
        fitView
      >
        <Background />
        <Controls />
      </ReactFlow>
    </div>
  );
}
