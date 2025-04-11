import React, { useState, useCallback, useRef, useMemo, useEffect } from 'react';
import ReactFlow, {
  ReactFlowProvider,
  Background,
  Controls,
  MiniMap,
  addEdge,
  Panel,
  useNodesState,
  useEdgesState,
  Connection,
  Edge,
  Node,
  ConnectionLineType,
  MarkerType,
  Handle,
  Position
} from 'reactflow';
import 'reactflow/dist/style.css';

import { Button } from '@/components/ui/button';
import { 
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle
} from '@/components/ui/card';
import { 
  Dialog, 
  DialogContent, 
  DialogDescription, 
  DialogFooter, 
  DialogHeader, 
  DialogTitle 
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { useToast } from '@/hooks/use-toast';
import { Checkbox } from '@/components/ui/checkbox';
import { AlertTriangle, Play, CheckCircle } from 'lucide-react';

// Agent Node Types
export type AgentType = 'business-analyst' | 'developer' | 'qa-engineer' | 'devops' | 'product-manager' | 'custom';

// Custom Node Components
const AgentNode: React.FC<{
  data: {
    label: string;
    type: AgentType;
    description: string;
    instructions?: string;
    onEdit?: () => void;
    onConfigure?: () => void;
  };
  id: string;
}> = ({ data, id }) => {
  const getAgentColor = (type: AgentType) => {
    switch (type) {
      case 'business-analyst': return '#F59E0B';
      case 'developer': return '#3B82F6';
      case 'qa-engineer': return '#10B981';
      case 'devops': return '#8B5CF6';
      case 'product-manager': return '#EC4899';
      case 'custom': return '#6B7280';
      default: return '#6B7280';
    }
  };

  return (
    <div className="relative">
      {/* Source handle - top */}
      <Handle
        type="source"
        position={Position.Top}
        id={`source-${id}`}
        style={{
          width: '16px',
          height: '16px',
          border: '2px solid black',
          backgroundColor: 'white',
          cursor: 'crosshair',
          zIndex: 10,
          boxShadow: '2px 2px 0px 0px rgba(0,0,0,1)'
        }}
      />
      
      {/* Source handle - right */}
      <Handle
        type="source"
        position={Position.Right}
        id={`source-right-${id}`}
        style={{
          width: '16px',
          height: '16px',
          border: '2px solid black',
          backgroundColor: 'white',
          cursor: 'crosshair',
          zIndex: 10,
          boxShadow: '2px 2px 0px 0px rgba(0,0,0,1)'
        }}
      />
      
      {/* Target handle - bottom */}
      <Handle
        type="target"
        position={Position.Bottom}
        id={`target-${id}`}
        style={{
          width: '16px',
          height: '16px',
          border: '2px solid black',
          backgroundColor: 'white',
          cursor: 'crosshair',
          zIndex: 10,
          boxShadow: '2px 2px 0px 0px rgba(0,0,0,1)'
        }}
      />
      
      {/* Target handle - left */}
      <Handle
        type="target"
        position={Position.Left}
        id={`target-left-${id}`}
        style={{
          width: '16px',
          height: '16px',
          border: '2px solid black',
          backgroundColor: 'white',
          cursor: 'crosshair',
          zIndex: 10,
          boxShadow: '2px 2px 0px 0px rgba(0,0,0,1)'
        }}
      />
      
      <Card className="w-64 border-4 border-black brutal-shadow">
        <CardHeader 
          className="p-3"
          style={{ backgroundColor: getAgentColor(data.type) }}
        >
          <CardTitle className="text-lg font-bold text-black">{data.label}</CardTitle>
          <CardDescription className="text-xs text-black font-medium opacity-80">
            {data.type.split('-').map(word => 
              word.charAt(0).toUpperCase() + word.slice(1)
            ).join(' ')}
          </CardDescription>
        </CardHeader>
        <CardContent className="p-3 text-sm">
          <p>{data.description}</p>
        </CardContent>
        <CardFooter className="p-3 pt-0 gap-2 flex">
          <Button 
            size="sm" 
            variant="outline" 
            className="w-full border-2 border-black brutal-shadow brutal-button text-xs"
            onClick={(e) => {
              e.stopPropagation();
              if (data.onEdit) data.onEdit();
            }}
          >
            Edit
          </Button>
          <Button 
            size="sm" 
            variant="outline" 
            className="w-full border-2 border-black brutal-shadow brutal-button text-xs"
            onClick={(e) => {
              e.stopPropagation();
              if (data.onConfigure) data.onConfigure();
            }}
          >
            Configure
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
};

// Initial state setup
const initialNodeTypes = {
  agent: AgentNode,
};

// Edge definitions - these don't depend on functions
const initialEdges: Edge[] = [
  {
    id: 'e1-2',
    source: '1',
    target: '2',
    sourceHandle: 'source-1',
    targetHandle: 'target-left-2',
    animated: true,
    label: 'UI Requirements',
    labelStyle: { fill: 'black', fontWeight: 'bold' },
    style: { stroke: 'black', strokeWidth: 2 },
    markerEnd: {
      type: MarkerType.ArrowClosed,
    },
    data: {
      label: 'UI Requirements',
      dataType: 'requirements',
      description: 'User interface design requirements and specifications',
    }
  },
  {
    id: 'e1-3',
    source: '1',
    target: '3',
    sourceHandle: 'source-right-1',
    targetHandle: 'target-left-3',
    animated: true,
    label: 'API Requirements',
    labelStyle: { fill: 'black', fontWeight: 'bold' },
    style: { stroke: 'black', strokeWidth: 2 },
    markerEnd: {
      type: MarkerType.ArrowClosed,
    },
    data: {
      label: 'API Requirements',
      dataType: 'requirements',
      description: 'API specifications and data structure requirements',
    }
  },
  {
    id: 'e2-4',
    source: '2',
    target: '4',
    sourceHandle: 'source-2',
    targetHandle: 'target-left-4',
    animated: true,
    label: 'UI for Testing',
    labelStyle: { fill: 'black', fontWeight: 'bold' },
    style: { stroke: 'black', strokeWidth: 2 },
    markerEnd: {
      type: MarkerType.ArrowClosed,
    },
    data: {
      label: 'UI for Testing',
      dataType: 'code',
      description: 'User interface components ready for testing',
    }
  },
  {
    id: 'e3-4',
    source: '3',
    target: '4',
    sourceHandle: 'source-3',
    targetHandle: 'target-4',
    animated: true,
    label: 'API for Testing',
    labelStyle: { fill: 'black', fontWeight: 'bold' },
    style: { stroke: 'black', strokeWidth: 2 },
    markerEnd: {
      type: MarkerType.ArrowClosed,
    },
    data: {
      label: 'API for Testing',
      dataType: 'code',
      description: 'API endpoints ready for testing',
    }
  },
];

const AgentWorkflow: React.FC = () => {
  const { toast } = useToast();
  const reactFlowWrapper = useRef<HTMLDivElement>(null);

  // Define initialNodes within the component to have access to handleEditNode and handleConfigureNode
  const defaultInitialNodes: Node[] = [
    {
      id: '1',
      type: 'agent',
      position: { x: 250, y: 100 },
      data: { 
        label: 'Requirements Gathering', 
        type: 'business-analyst',
        description: 'Collect and analyze project requirements from stakeholders.',
      },
    },
    {
      id: '2',
      type: 'agent',
      position: { x: 250, y: 300 },
      data: { 
        label: 'UI Development',
        type: 'developer',
        description: 'Implement user interface components based on designs.',
      },
    },
    {
      id: '3',
      type: 'agent',
      position: { x: 500, y: 300 },
      data: { 
        label: 'API Integration',
        type: 'developer',
        description: 'Develop and integrate backend APIs with the frontend.',
      },
    },
    {
      id: '4',
      type: 'agent',
      position: { x: 350, y: 500 },
      data: { 
        label: 'Quality Assurance',
        type: 'qa-engineer',
        description: 'Test functionality and ensure quality standards are met.',
      },
    },
  ];

  // States
  const [nodes, setNodes, onNodesChange] = useNodesState(defaultInitialNodes);

  // Node edit and configuration
  const [isEditNodeModalOpen, setIsEditNodeModalOpen] = useState(false);
  const [isNodeConfigModalOpen, setIsNodeConfigModalOpen] = useState(false);
  const [selectedNode, setSelectedNode] = useState<Node | null>(null);
  const [editNodeName, setEditNodeName] = useState('');
  const [editNodeType, setEditNodeType] = useState<AgentType>('developer');
  const [editNodeDescription, setEditNodeDescription] = useState('');
  const [nodeInstructions, setNodeInstructions] = useState('');

  // Define node edit handlers
  const handleEditNode = (nodeId: string) => {
    const node = nodes.find(n => n.id === nodeId);
    if (node) {
      setSelectedNode(node);
      setEditNodeName(node.data.label);
      setEditNodeType(node.data.type);
      setEditNodeDescription(node.data.description);
      setIsEditNodeModalOpen(true);
    }
  };

  const handleConfigureNode = (nodeId: string) => {
    const node = nodes.find(n => n.id === nodeId);
    if (node) {
      setSelectedNode(node);
      setNodeInstructions(node.data.instructions || '');
      setIsNodeConfigModalOpen(true);
    }
  };
  
  // Add the event handlers to the initial nodes
  useEffect(() => {
    // Add event handlers to the nodes when the component mounts
    setNodes(nds => nds.map(node => ({
      ...node,
      data: {
        ...node.data,
        onEdit: () => handleEditNode(node.id),
        onConfigure: () => handleConfigureNode(node.id)
      }
    })));
  }, []);
  const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges);
  const [nodeName, setNodeName] = useState('');
  const [nodeType, setNodeType] = useState<AgentType>('developer');
  const [nodeDescription, setNodeDescription] = useState('');
  const [reactFlowInstance, setReactFlowInstance] = useState<any>(null);
  const [isAddingNode, setIsAddingNode] = useState(false);

  // Memoize nodeTypes to prevent recreation on every render
  const nodeTypes = useMemo(() => initialNodeTypes, []);

  // Connection handling
  const onConnect = useCallback(
    (connection: Connection) => {
      // Add a unique ID for the new edge
      const newEdge = {
        ...connection,
        id: `e${connection.source}-${connection.target}-${Date.now()}`,
        animated: true,
        label: 'New Connection',
        style: { stroke: 'black', strokeWidth: 2 },
        markerEnd: {
          type: MarkerType.ArrowClosed,
        },
        data: {
          label: 'New Connection',
          dataType: 'requirements',
          description: 'Define what information flows here',
        }
      };
      
      setEdges((eds) => addEdge(newEdge, eds));
      
      // Notify user that they can configure the new connection
      toast({
        title: 'Connection Created',
        description: 'Click on the connection line to configure it',
      });
    },
    [setEdges, toast]
  );

  // Drag handling
  const onDragOver = useCallback((event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    event.dataTransfer.dropEffect = 'move';
  }, []);

  // Add node to canvas
  const addNode = () => {
    if (!nodeName) {
      toast({
        title: "Error",
        description: "Please provide a name for the agent",
        variant: "destructive",
      });
      return;
    }

    const newNode: Node = {
      id: `${Date.now()}`,
      type: 'agent',
      position: {
        x: Math.random() * 500,
        y: Math.random() * 500,
      },
      data: {
        label: nodeName,
        type: nodeType,
        description: nodeDescription || `${nodeName} agent for the workflow.`,
        onEdit: () => handleEditNode(`${Date.now()}`),
        onConfigure: () => handleConfigureNode(`${Date.now()}`),
      },
    };

    setNodes((nds) => [...nds, newNode]);
    setNodeName('');
    setNodeDescription('');
    setIsAddingNode(false);

    toast({
      title: "Success",
      description: "Agent added to workflow",
    });
  };

  // Save workflow
  const saveWorkflow = () => {
    // This would typically save to the backend
    const workflowData = {
      nodes,
      edges,
    };
    
    console.log('Saving workflow data:', workflowData);
    localStorage.setItem('savedWorkflow', JSON.stringify(workflowData));
    
    toast({
      title: "Workflow Saved",
      description: "Your agent workflow has been saved",
    });
  };

  // Load workflow
  const loadWorkflow = () => {
    const savedData = localStorage.getItem('savedWorkflow');
    if (savedData) {
      const { nodes: savedNodes, edges: savedEdges } = JSON.parse(savedData);
      setNodes(savedNodes);
      setEdges(savedEdges);
      
      toast({
        title: "Workflow Loaded",
        description: "Your saved workflow has been loaded",
      });
    } else {
      toast({
        title: "No Saved Workflow",
        description: "No previously saved workflow found",
        variant: "destructive",
      });
    }
  };




  // Execute workflow state and functionality
  const [isExecuteModalOpen, setIsExecuteModalOpen] = useState(false);
  const [isExecuting, setIsExecuting] = useState(false);
  const [executionProgress, setExecutionProgress] = useState<{id: string, completed: boolean}[]>([]);
  
  // Execute the workflow
  const executeWorkflow = () => {
    // Start the execution process
    setIsExecuting(true);
    
    // Initialize progress tracking for all nodes
    const progress = nodes.map(node => ({
      id: node.id,
      completed: false
    }));
    setExecutionProgress(progress);
    
    // Create a visualization of executing each node in sequence
    // This is a mock implementation - in a real app, this would connect to actual AI services
    let currentIndex = 0;
    
    const processNextNode = () => {
      if (currentIndex >= nodes.length) {
        // All nodes processed
        setIsExecuting(false);
        
        toast({
          title: "Workflow Execution Complete",
          description: "All agents have successfully completed their tasks",
        });
        
        setIsExecuteModalOpen(false);
        return;
      }
      
      const currentNode = nodes[currentIndex];
      
      // Simulate processing time
      toast({
        title: "Executing Agent",
        description: `Running ${currentNode.data.label}...`,
      });
      
      setTimeout(() => {
        // Mark this node as completed
        setExecutionProgress(prev => 
          prev.map(item => 
            item.id === currentNode.id 
              ? { ...item, completed: true } 
              : item
          )
        );
        
        // Move to next node
        currentIndex++;
        processNextNode();
      }, 2000); // Simulate 2 seconds of processing per node
    };
    
    // Start the execution
    processNextNode();
  };

  // Connection configuration
  const [isConnectionModalOpen, setIsConnectionModalOpen] = useState(false);
  const [selectedEdge, setSelectedEdge] = useState<Edge | null>(null);

  // Connection data type
  type ConnectionData = {
    label: string;
    dataType: 'code' | 'requirements' | 'test-cases' | 'documentation' | 'custom';
    description: string;
    parameters?: { key: string; type: string; description: string }[];
  };

  // Handle edge click
  const onEdgeClick = (event: React.MouseEvent, edge: Edge) => {
    setSelectedEdge(edge);
    setIsConnectionModalOpen(true);
  };

  // Update edge with connection data
  const updateEdgeWithConnectionData = (edge: Edge, data: ConnectionData) => {
    setEdges((eds) =>
      eds.map((e) => {
        if (e.id === edge.id) {
          return {
            ...e,
            label: data.label,
            data: data,
          };
        }
        return e;
      })
    );

    toast({
      title: "Connection Updated",
      description: `Updated connection: ${data.label}`,
    });
  };

  return (
    <div className="flex flex-col w-full h-full">
      <div className="bg-white p-4 border-b-4 border-black">
        <h1 className="text-2xl font-bold font-heading">Agent Workflow Builder</h1>
        <p className="text-gray-600">Create and connect AI agents to build automated workflows</p>
      </div>

      <div className="flex flex-1 h-[calc(100vh-10rem)] min-h-[800px]">
        <div className="w-64 bg-white border-r-4 border-black p-4 flex flex-col">
          <h2 className="font-heading text-xl font-bold">Toolbox</h2>
          <Separator className="my-4 border-black" />
          
          <div className="flex flex-col gap-4">
            <Button 
              variant="outline" 
              className="border-2 border-black brutal-shadow brutal-button"
              onClick={() => setIsAddingNode(!isAddingNode)}
            >
              {isAddingNode ? 'Cancel' : '+ Add New Agent'}
            </Button>

            {isAddingNode && (
              <div className="flex flex-col gap-3 border-4 border-black p-3 brutal-shadow bg-gray-50">
                <div>
                  <Label htmlFor="agent-name" className="mb-1 block">Agent Name</Label>
                  <Input
                    id="agent-name"
                    value={nodeName}
                    onChange={(e) => setNodeName(e.target.value)}
                    className="border-2 border-black"
                    placeholder="e.g. Code Review"
                  />
                </div>
                
                <div>
                  <Label htmlFor="agent-type" className="mb-1 block">Agent Type</Label>
                  <select
                    id="agent-type"
                    value={nodeType}
                    onChange={(e) => setNodeType(e.target.value as AgentType)}
                    className="w-full border-2 border-black p-2"
                  >
                    <option value="business-analyst">Business Analyst</option>
                    <option value="developer">Developer</option>
                    <option value="qa-engineer">QA Engineer</option>
                    <option value="devops">DevOps</option>
                    <option value="product-manager">Product Manager</option>
                    <option value="custom">Custom</option>
                  </select>
                </div>
                
                <div>
                  <Label htmlFor="agent-description" className="mb-1 block">Description</Label>
                  <textarea
                    id="agent-description"
                    value={nodeDescription}
                    onChange={(e) => setNodeDescription(e.target.value)}
                    className="w-full border-2 border-black p-2 h-20"
                    placeholder="What does this agent do?"
                  />
                </div>
                
                <Button 
                  onClick={addNode}
                  className="bg-black text-white border-2 border-black brutal-shadow brutal-button"
                >
                  Add to Workflow
                </Button>
              </div>
            )}
          </div>

          <Separator className="my-4 border-black" />

          <div className="flex flex-col gap-2">
            <h3 className="font-bold">Workflow Actions</h3>
            <Button
              variant="outline"
              className="border-2 border-black brutal-shadow brutal-button"
              onClick={saveWorkflow}
            >
              Save Workflow
            </Button>
            <Button
              variant="outline"
              className="border-2 border-black brutal-shadow brutal-button"
              onClick={loadWorkflow}
            >
              Load Workflow
            </Button>
            <Button
              variant="outline"
              className="border-2 border-black brutal-shadow brutal-button"
              onClick={() => {
                // We'll define initialNodes later in the component
                const defaultNodes = [
                  {
                    id: '1',
                    type: 'agent',
                    position: { x: 250, y: 100 },
                    data: { 
                      label: 'Requirements Gathering', 
                      type: 'business-analyst',
                      description: 'Collect and analyze project requirements from stakeholders.',
                      onEdit: () => handleEditNode('1'),
                      onConfigure: () => handleConfigureNode('1'),
                    },
                  },
                  {
                    id: '2',
                    type: 'agent',
                    position: { x: 250, y: 300 },
                    data: { 
                      label: 'UI Development',
                      type: 'developer',
                      description: 'Implement user interface components based on designs.',
                      onEdit: () => handleEditNode('2'),
                      onConfigure: () => handleConfigureNode('2'),
                    },
                  },
                  {
                    id: '3',
                    type: 'agent',
                    position: { x: 500, y: 300 },
                    data: { 
                      label: 'API Integration',
                      type: 'developer',
                      description: 'Develop and integrate backend APIs with the frontend.',
                      onEdit: () => handleEditNode('3'),
                      onConfigure: () => handleConfigureNode('3'),
                    },
                  },
                  {
                    id: '4',
                    type: 'agent',
                    position: { x: 350, y: 500 },
                    data: { 
                      label: 'Quality Assurance',
                      type: 'qa-engineer',
                      description: 'Test functionality and ensure quality standards are met.',
                      onEdit: () => handleEditNode('4'),
                      onConfigure: () => handleConfigureNode('4'),
                    },
                  },
                ];
                
                setNodes(defaultNodes);
                setEdges(initialEdges);
              }}
            >
              Reset to Default
            </Button>
            
            <Button
              variant="outline"
              className="border-2 border-black bg-green-100 brutal-shadow brutal-button mt-4"
              onClick={() => setIsExecuteModalOpen(true)}
            >
              ▶️ Execute Workflow
            </Button>
          </div>
        </div>

        <div className="flex-1 bg-gray-50 border-black" ref={reactFlowWrapper}>
          <ReactFlowProvider>
            <ReactFlow
              nodes={nodes}
              edges={edges}
              onNodesChange={onNodesChange}
              onEdgesChange={onEdgesChange}
              onConnect={onConnect}
              onInit={setReactFlowInstance}
              onDragOver={onDragOver}
              nodeTypes={nodeTypes}
              onEdgeClick={onEdgeClick}
              fitView
              snapToGrid
              connectionLineType={ConnectionLineType.SmoothStep}
              defaultEdgeOptions={{
                style: { stroke: 'black', strokeWidth: 2 },
                markerEnd: {
                  type: MarkerType.ArrowClosed,
                }
              }}
              defaultViewport={{ x: 0, y: 0, zoom: 1.5 }}
            >
              <Background color="#aaa" gap={16} />
              <Controls />
              <MiniMap 
                nodeStrokeColor={(n) => 'black'}
                nodeColor={(n) => {
                  const type = n.data?.type || 'custom';
                  switch (type) {
                    case 'business-analyst': return '#F59E0B';
                    case 'developer': return '#3B82F6';
                    case 'qa-engineer': return '#10B981';
                    case 'devops': return '#8B5CF6';
                    case 'product-manager': return '#EC4899';
                    case 'custom': return '#6B7280';
                    default: return '#6B7280';
                  }
                }}
                maskColor="rgba(0, 0, 0, 0.1)"
              />
              <Panel position="top-right">
                <div className="space-y-2">
                  <Button 
                    variant="outline" 
                    className="bg-white border-2 border-black brutal-shadow brutal-button"
                    onClick={() => {
                      toast({
                        title: "Connection Instructions",
                        description: `Click on any line between agents to configure the data flow`,
                      });
                    }}
                  >
                    Configure Connections
                  </Button>
                </div>
              </Panel>
            </ReactFlow>
          </ReactFlowProvider>
        </div>
      </div>

      {/* Connection Configuration Modal */}
      <Dialog open={isConnectionModalOpen} onOpenChange={setIsConnectionModalOpen}>
        <DialogContent className="border-4 border-black brutal-shadow sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle className="text-xl font-heading font-bold">Configure Connection</DialogTitle>
            <DialogDescription>
              Define what information flows between these agents
            </DialogDescription>
          </DialogHeader>

          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="connection-name" className="text-right font-medium">
                Label
              </Label>
              <Input
                id="connection-name"
                defaultValue={selectedEdge?.label as string || ''}
                className="col-span-3 border-2 border-black"
                placeholder="e.g. API Requirements"
              />
            </div>

            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="dataType" className="text-right font-medium">
                Data Type
              </Label>
              <select
                id="dataType"
                defaultValue={(selectedEdge?.data?.dataType as string) || 'requirements'}
                className="col-span-3 border-2 border-black p-2"
              >
                <option value="requirements">Requirements</option>
                <option value="code">Code</option>
                <option value="test-cases">Test Cases</option>
                <option value="documentation">Documentation</option>
                <option value="custom">Custom</option>
              </select>
            </div>

            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="description" className="text-right font-medium">
                Description
              </Label>
              <textarea
                id="description"
                defaultValue={selectedEdge?.data?.description as string || ''}
                className="col-span-3 border-2 border-black p-2 h-20"
                placeholder="Describe what data passes through this connection"
              />
            </div>

            <div className="border-t-2 border-dashed border-black pt-4 mt-2">
              <div className="flex justify-between items-center mb-3">
                <h3 className="font-bold">Parameters</h3>
              </div>

              <div className="grid grid-cols-12 gap-2 mb-2">
                <Input
                  className="col-span-4 border-2 border-black"
                  placeholder="Parameter name"
                />
                
                <select
                  className="col-span-3 border-2 border-black p-2"
                >
                  <option value="string">String</option>
                  <option value="number">Number</option>
                  <option value="boolean">Boolean</option>
                  <option value="object">Object</option>
                  <option value="array">Array</option>
                </select>
                
                <Input
                  className="col-span-5 border-2 border-black"
                  placeholder="Description"
                />
              </div>

              <Button 
                variant="outline" 
                size="sm" 
                className="border-2 border-black brutal-shadow brutal-button w-full mt-2"
              >
                + Add Parameter
              </Button>
            </div>
          </div>

          <DialogFooter>
            <Button
              variant="outline"
              className="border-2 border-black brutal-shadow brutal-button"
              onClick={() => setIsConnectionModalOpen(false)}
            >
              Cancel
            </Button>
            <Button
              className="bg-black text-white border-2 border-black brutal-shadow brutal-button"
              onClick={() => {
                if (!selectedEdge) return;
                
                const label = (document.getElementById('connection-name') as HTMLInputElement).value;
                const dataType = (document.getElementById('dataType') as HTMLSelectElement).value as ConnectionData['dataType'];
                const description = (document.getElementById('description') as HTMLTextAreaElement).value;
                
                const connectionData: ConnectionData = {
                  label,
                  dataType,
                  description,
                };
                
                updateEdgeWithConnectionData(selectedEdge, connectionData);
                setIsConnectionModalOpen(false);
              }}
            >
              Save Connection
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit Node Modal */}
      <Dialog open={isEditNodeModalOpen} onOpenChange={setIsEditNodeModalOpen}>
        <DialogContent className="border-4 border-black brutal-shadow sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle className="text-xl font-heading font-bold">Edit Agent</DialogTitle>
            <DialogDescription>
              Modify the agent's details and behavior
            </DialogDescription>
          </DialogHeader>

          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="edit-agent-name" className="text-right font-medium">
                Name
              </Label>
              <Input
                id="edit-agent-name"
                value={editNodeName}
                onChange={(e) => setEditNodeName(e.target.value)}
                className="col-span-3 border-2 border-black"
                placeholder="e.g. Code Review"
              />
            </div>

            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="edit-agent-type" className="text-right font-medium">
                Agent Type
              </Label>
              <select
                id="edit-agent-type"
                value={editNodeType}
                onChange={(e) => setEditNodeType(e.target.value as AgentType)}
                className="col-span-3 border-2 border-black p-2"
              >
                <option value="business-analyst">Business Analyst</option>
                <option value="developer">Developer</option>
                <option value="qa-engineer">QA Engineer</option>
                <option value="devops">DevOps</option>
                <option value="product-manager">Product Manager</option>
                <option value="custom">Custom</option>
              </select>
            </div>

            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="edit-agent-description" className="text-right font-medium">
                Description
              </Label>
              <textarea
                id="edit-agent-description"
                value={editNodeDescription}
                onChange={(e) => setEditNodeDescription(e.target.value)}
                className="col-span-3 border-2 border-black p-2 h-20"
                placeholder="What does this agent do?"
              />
            </div>
          </div>

          <DialogFooter>
            <Button
              variant="outline"
              className="border-2 border-black brutal-shadow brutal-button"
              onClick={() => setIsEditNodeModalOpen(false)}
            >
              Cancel
            </Button>
            <Button
              className="bg-black text-white border-2 border-black brutal-shadow brutal-button"
              onClick={updateNode}
            >
              Save Changes
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Configure Node Modal */}
      <Dialog open={isNodeConfigModalOpen} onOpenChange={setIsNodeConfigModalOpen}>
        <DialogContent className="border-4 border-black brutal-shadow sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle className="text-xl font-heading font-bold">Configure Agent</DialogTitle>
            <DialogDescription>
              Set detailed instructions for how this agent should operate
            </DialogDescription>
          </DialogHeader>

          <div className="grid gap-4 py-4">
            <div>
              <Label htmlFor="agent-instructions" className="block mb-2 font-medium">
                Instructions
              </Label>
              <textarea
                id="agent-instructions"
                value={nodeInstructions}
                onChange={(e) => setNodeInstructions(e.target.value)}
                className="w-full border-2 border-black p-3 h-48 text-sm font-mono"
                placeholder="Enter detailed instructions for this agent. Use markdown formatting if needed."
              />
            </div>

            <div className="border-t-2 border-dashed border-black pt-4 mt-2">
              <div className="flex justify-between items-center mb-2">
                <h3 className="font-bold">Advanced Settings</h3>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div className="flex items-center space-x-2">
                  <Checkbox id="agent-autostart" />
                  <Label htmlFor="agent-autostart">Auto-start</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <Checkbox id="agent-debug" />
                  <Label htmlFor="agent-debug">Debug mode</Label>
                </div>
              </div>
            </div>
          </div>

          <DialogFooter>
            <Button
              variant="outline"
              className="border-2 border-black brutal-shadow brutal-button"
              onClick={() => setIsNodeConfigModalOpen(false)}
            >
              Cancel
            </Button>
            <Button
              className="bg-black text-white border-2 border-black brutal-shadow brutal-button"
              onClick={updateNodeConfig}
            >
              Save Configuration
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Execute Workflow Modal */}
      <Dialog open={isExecuteModalOpen} onOpenChange={setIsExecuteModalOpen}>
        <DialogContent className="border-4 border-black brutal-shadow sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle className="text-xl font-heading font-bold">Execute Workflow</DialogTitle>
            <DialogDescription>
              Run the entire agent workflow sequentially
            </DialogDescription>
          </DialogHeader>
          
          <div className="grid gap-4 py-4">
            {!isExecuting ? (
              <div className="space-y-4">
                <div className="flex items-start space-x-2">
                  <AlertTriangle className="h-6 w-6 text-yellow-500 mt-0.5" />
                  <div>
                    <h3 className="font-bold">Before you start</h3>
                    <p className="text-sm text-gray-600">
                      This will execute all agents in the workflow based on their dependencies.
                      Make sure all agent connections are properly set up.
                    </p>
                  </div>
                </div>
                
                <div className="border-2 border-black p-3 bg-gray-50">
                  <h4 className="font-bold mb-2">Execution Options</h4>
                  
                  <div className="space-y-2">
                    <div className="flex items-center space-x-2">
                      <Checkbox id="halt-on-error" defaultChecked />
                      <Label htmlFor="halt-on-error">Halt on error</Label>
                    </div>
                    
                    <div className="flex items-center space-x-2">
                      <Checkbox id="debug-mode" />
                      <Label htmlFor="debug-mode">Debug mode</Label>
                    </div>
                    
                    <div className="flex items-center space-x-2">
                      <Checkbox id="save-outputs" defaultChecked />
                      <Label htmlFor="save-outputs">Save outputs</Label>
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              <div className="space-y-3">
                <h3 className="font-bold">Execution Progress</h3>
                
                <div className="space-y-2">
                  {executionProgress.map((node) => {
                    const nodeData = nodes.find(n => n.id === node.id)?.data;
                    return (
                      <div key={node.id} className="flex items-center justify-between border-2 border-black p-2">
                        <div className="flex items-center space-x-2">
                          {node.completed ? (
                            <CheckCircle className="h-5 w-5 text-green-500" />
                          ) : (
                            <div className="h-5 w-5 rounded-full border-2 border-black animate-pulse bg-gray-200" />
                          )}
                          <span>{nodeData?.label || `Agent ${node.id}`}</span>
                        </div>
                        <div className="text-sm font-medium">
                          {node.completed ? 'Completed' : 'Waiting...'}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
          
          <DialogFooter>
            {!isExecuting ? (
              <>
                <Button
                  variant="outline"
                  className="border-2 border-black brutal-shadow brutal-button"
                  onClick={() => setIsExecuteModalOpen(false)}
                >
                  Cancel
                </Button>
                <Button
                  className="bg-green-600 hover:bg-green-700 text-white border-2 border-black brutal-shadow brutal-button"
                  onClick={executeWorkflow}
                >
                  Start Execution
                </Button>
              </>
            ) : (
              <Button
                variant="outline"
                className="border-2 border-black brutal-shadow brutal-button"
                disabled
              >
                Executing... Please wait
              </Button>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

const AgentWorkflowComponent: React.FC = AgentWorkflow;
export default AgentWorkflowComponent;