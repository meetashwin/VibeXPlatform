import React, { useState, useCallback, useRef, useEffect, useMemo } from 'react';
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
  Position,
  NodeChange,
  EdgeChange,
  useReactFlow,
  NodeTypes
} from 'reactflow';
import 'reactflow/dist/style.css';
import gsap from 'gsap';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Separator } from '@/components/ui/separator';
import { useToast } from '@/hooks/use-toast';
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
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { AgentType } from './AgentWorkflow';

// Import necessary icons
import { Check, Plus, Settings, Save, Upload, RefreshCw, Eye, EyeOff, ChevronDown, ChevronUp, X, AlertTriangle } from 'lucide-react';

// Data types for connections
type ConnectionDataType = 'code' | 'requirements' | 'test-cases' | 'documentation' | 'custom';

// Connection data structure
interface ConnectionData {
  label: string;
  dataType: ConnectionDataType;
  description: string;
  action?: string;
  parameters?: { key: string; type: string; description: string }[];
}

// Enhanced Agent Node Component with Robot Design
const AgentNode: React.FC<{
  data: {
    label: string;
    type: AgentType;
    description: string;
    instructions?: string;
    active?: boolean;
    onEdit?: () => void;
    onConfigure?: () => void;
  };
  id: string;
  selected: boolean;
  isConnectable: boolean;
}> = ({ data, id, selected, isConnectable }) => {
  const [isHovered, setIsHovered] = useState(false);
  const nodeRef = useRef<HTMLDivElement>(null);
  const robotRef = useRef<HTMLDivElement>(null);
  const animateRef = useRef<any>(null);
  const armAnimationRef = useRef<any[]>([]);
  
  // Get color based on agent type
  const getAgentColor = (type: AgentType): string => {
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

  // Start animation when component mounts
  useEffect(() => {
    // Simple bounce animation using GSAP
    if (robotRef.current) {
      // Clear any existing animation
      if (animateRef.current) {
        animateRef.current.kill();
      }
      
      // Create bounce animation for the robot
      animateRef.current = gsap.to(robotRef.current, {
        y: '-=5',
        duration: 1.5,
        ease: 'power1.inOut',
        yoyo: true,
        repeat: -1
      });
    }
    
    // Animate the robot arms
    const arms = document.querySelectorAll(`.arm-${id}`);
    
    // Kill any existing arm animations
    if (armAnimationRef.current) {
      armAnimationRef.current.forEach(anim => anim?.kill());
      armAnimationRef.current = [];
    }
    
    // Create new arm animations
    arms.forEach((arm, index) => {
      const timeline = gsap.timeline({ repeat: -1, yoyo: true });
      
      // Different animation for each arm
      if (index === 0) { // Top arm
        timeline.to(arm, { rotation: -5, transformOrigin: "bottom center", duration: 2, ease: "sine.inOut" });
      } else if (index === 1) { // Right arm
        timeline.to(arm, { rotation: 5, transformOrigin: "left center", duration: 1.8, ease: "sine.inOut" });
      } else if (index === 2) { // Bottom arm
        timeline.to(arm, { rotation: 5, transformOrigin: "top center", duration: 2.2, ease: "sine.inOut" });
      } else if (index === 3) { // Left arm
        timeline.to(arm, { rotation: -5, transformOrigin: "right center", duration: 1.7, ease: "sine.inOut" });
      }
      
      armAnimationRef.current.push(timeline);
    });
    
    return () => {
      if (animateRef.current) {
        animateRef.current.kill();
      }
      
      if (armAnimationRef.current) {
        armAnimationRef.current.forEach(anim => anim?.kill());
      }
    };
  }, [id]);
  
  // Enhanced animation when selected or hovered
  useEffect(() => {
    if (nodeRef.current) {
      if (selected || isHovered) {
        gsap.to(nodeRef.current, {
          scale: 1.05,
          boxShadow: '8px 8px 0px 0px rgba(0,0,0,1)',
          duration: 0.3
        });
      } else {
        gsap.to(nodeRef.current, {
          scale: 1,
          boxShadow: '4px 4px 0px 0px rgba(0,0,0,1)',
          duration: 0.3
        });
      }
    }
  }, [selected, isHovered]);

  const mainColor = getAgentColor(data.type);
  
  return (
    <div 
      ref={nodeRef}
      className="relative robot-node"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Robot Container */}
      <div ref={robotRef} className="relative z-10 mb-4">
        {/* Top Connection Arm */}
        <div className={`absolute top-0 left-1/2 transform -translate-x-1/2 -translate-y-[40px] arm-${id}`}>
          <div className="w-8 h-10 bg-gray-300 border-2 border-black rounded-t-full relative flex justify-center">
            <div className="absolute w-4 h-4 bg-gray-200 border-2 border-black rounded-full -top-2"></div>
            <Handle
              type="source"
              position={Position.Top}
              id={`source-${id}`}
              isConnectable={isConnectable}
              style={{
                width: '18px',
                height: '18px',
                top: '-9px',
                border: '3px solid black',
                backgroundColor: selected || isHovered ? mainColor : 'white',
                cursor: 'crosshair',
                zIndex: 20,
                boxShadow: '2px 2px 0px 0px rgba(0,0,0,1)',
                transition: 'all 0.2s ease'
              }}
            />
          </div>
        </div>
        
        {/* Right Connection Arm */}
        <div className={`absolute top-1/2 right-0 transform translate-x-[40px] -translate-y-1/2 arm-${id}`}>
          <div className="h-8 w-10 bg-gray-300 border-2 border-black rounded-r-full relative flex items-center">
            <div className="absolute h-4 w-4 bg-gray-200 border-2 border-black rounded-full -right-2"></div>
            <Handle
              type="source"
              position={Position.Right}
              id={`source-right-${id}`}
              isConnectable={isConnectable}
              style={{
                width: '18px',
                height: '18px',
                right: '-9px',
                border: '3px solid black',
                backgroundColor: selected || isHovered ? mainColor : 'white',
                cursor: 'crosshair',
                zIndex: 20,
                boxShadow: '2px 2px 0px 0px rgba(0,0,0,1)',
                transition: 'all 0.2s ease'
              }}
            />
          </div>
        </div>
        
        {/* Bottom Connection Arm */}
        <div className={`absolute bottom-0 left-1/2 transform -translate-x-1/2 translate-y-[40px] arm-${id}`}>
          <div className="w-8 h-10 bg-gray-300 border-2 border-black rounded-b-full relative flex justify-center">
            <div className="absolute w-4 h-4 bg-gray-200 border-2 border-black rounded-full -bottom-2"></div>
            <Handle
              type="target"
              position={Position.Bottom}
              id={`target-${id}`}
              isConnectable={isConnectable}
              style={{
                width: '18px',
                height: '18px',
                bottom: '-9px',
                border: '3px solid black',
                backgroundColor: selected || isHovered ? mainColor : 'white',
                cursor: 'crosshair',
                zIndex: 20,
                boxShadow: '2px 2px 0px 0px rgba(0,0,0,1)',
                transition: 'all 0.2s ease'
              }}
            />
          </div>
        </div>
        
        {/* Left Connection Arm */}
        <div className={`absolute top-1/2 left-0 transform -translate-x-[40px] -translate-y-1/2 arm-${id}`}>
          <div className="h-8 w-10 bg-gray-300 border-2 border-black rounded-l-full relative flex items-center">
            <div className="absolute h-4 w-4 bg-gray-200 border-2 border-black rounded-full -left-2"></div>
            <Handle
              type="target"
              position={Position.Left}
              id={`target-left-${id}`}
              isConnectable={isConnectable}
              style={{
                width: '18px',
                height: '18px',
                left: '-9px',
                border: '3px solid black',
                backgroundColor: selected || isHovered ? mainColor : 'white',
                cursor: 'crosshair',
                zIndex: 20,
                boxShadow: '2px 2px 0px 0px rgba(0,0,0,1)',
                transition: 'all 0.2s ease'
              }}
            />
          </div>
        </div>

        {/* Robot Card */}
        <div
          className={`w-64 border-4 border-black brutal-shadow rounded-2xl overflow-hidden ${selected ? 'ring-4 ring-offset-2 ring-black' : ''}`}
          style={{ 
            boxShadow: '4px 4px 0px 0px rgba(0,0,0,1)',
            transform: data.active ? 'translateY(-3px)' : 'none',
            transition: 'transform 0.3s ease, box-shadow 0.3s ease'
          }}
        >
          {/* Robot Head */}
          <div 
            className="p-3 flex flex-col items-center gap-2 relative"
            style={{ backgroundColor: mainColor }}
          >
            {/* Robot Face */}
            <div 
              className="w-20 h-20 rounded-full border-4 border-black bg-white flex items-center justify-center relative"
              style={{ boxShadow: '2px 2px 0px 0px rgba(0,0,0,1)' }}
            >
              {/* Robot Eyes */}
              <div className="absolute flex space-x-2 top-6">
                <div className={`w-3 h-3 rounded-full ${data.active ? 'bg-green-500' : 'bg-gray-400'} border-2 border-black`}></div>
                <div className={`w-3 h-3 rounded-full ${data.active ? 'bg-green-500' : 'bg-gray-400'} border-2 border-black`}></div>
              </div>
              
              {/* Robot Mouth - Smiley */}
              <div className="absolute w-10 h-5 border-b-2 border-black rounded-b-full top-10"></div>
              
              {/* Robot Antenna */}
              <div className="absolute w-2 h-6 bg-gray-300 border-2 border-black -top-7 rounded-t-lg">
                <div className="w-4 h-4 rounded-full bg-red-500 border-2 border-black absolute -top-3 left-1/2 transform -translate-x-1/2"></div>
              </div>
            </div>
            
            {/* Robot Name and Type */}
            <div className="text-center">
              <h3 className="text-lg font-bold text-black">{data.label}</h3>
              <p className="text-xs text-black font-medium opacity-80">
                {data.type.split('-').map(word => 
                  word.charAt(0).toUpperCase() + word.slice(1)
                ).join(' ')}
              </p>
            </div>
          </div>
          
          {/* Robot Body */}
          <div className="p-3 bg-white text-sm border-t-2 border-black">
            {/* Description */}
            <p className="mb-3">{data.description}</p>
            
            {/* Control Buttons */}
            <div className="flex justify-between gap-2">
              <Button 
                size="sm" 
                variant="outline" 
                className="flex-1 border-2 border-black brutal-shadow brutal-button text-xs"
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
                className="flex-1 border-2 border-black brutal-shadow brutal-button text-xs"
                onClick={(e) => {
                  e.stopPropagation();
                  if (data.onConfigure) data.onConfigure();
                }}
              >
                Configure
              </Button>
            </div>
          </div>
          
          {/* Control Panel */}
          <div className="bg-gray-200 p-2 border-t-2 border-black flex justify-between">
            <div className="flex space-x-2">
              <div className="w-4 h-4 rounded-full bg-yellow-500 border border-black"></div>
              <div className="w-4 h-4 rounded-full bg-green-500 border border-black"></div>
            </div>
            <div className="flex space-x-2 items-center">
              <div className="w-10 h-3 bg-black rounded-full"></div>
              <div className="w-3 h-3 rounded-full bg-red-500 border border-black"></div>
            </div>
          </div>
        </div>
      </div>
      
      {/* Add a name underneath */}
      <div 
        className="absolute bottom-0 left-1/2 transform -translate-x-1/2 translate-y-[110px] whitespace-nowrap"
      >
        <div 
          className="px-3 py-1 border-2 border-black rounded-full bg-white"
          style={{ boxShadow: '2px 2px 0px 0px rgba(0,0,0,1)' }}
        >
          <span className="text-sm font-bold">{data.label}</span>
        </div>
      </div>
    </div>
  );
};

// Custom Edge Component with Neobrutalist Design
const CustomEdge: React.FC<{
  id: string;
  sourceX: number;
  sourceY: number;
  targetX: number;
  targetY: number;
  sourcePosition: Position;
  targetPosition: Position;
  style?: React.CSSProperties;
  data?: {
    label?: string;
    type?: ConnectionDataType;
  };
  markerEnd?: string;
  selected: boolean;
}> = ({
  id,
  sourceX,
  sourceY,
  targetX,
  targetY,
  sourcePosition,
  targetPosition,
  style = {},
  data,
  markerEnd,
  selected,
}) => {
  // Get connection path
  const [edgePath, labelX, labelY] = getBezierPath({
    sourceX,
    sourceY,
    sourcePosition,
    targetX,
    targetY,
    targetPosition,
  });

  // Determine connection color based on data type
  const getConnectionColor = (type?: ConnectionDataType) => {
    switch (type) {
      case 'code': return '#3B82F6';
      case 'requirements': return '#F59E0B';
      case 'test-cases': return '#10B981';
      case 'documentation': return '#8B5CF6';
      case 'custom': return '#EC4899';
      default: return '#6B7280';
    }
  };

  return (
    <>
      <path
        id={id}
        style={{
          ...style,
          strokeWidth: selected ? 5 : 3,
          stroke: getConnectionColor(data?.type),
        }}
        className={`react-flow__edge-path ${selected ? 'selected' : ''}`}
        d={edgePath}
        markerEnd={markerEnd}
      />
      {data?.label && (
        <foreignObject
          width={150}
          height={40}
          x={labelX - 75}
          y={labelY - 20}
          className="edge-label-container"
          requiredExtensions="http://www.w3.org/1999/xhtml"
        >
          <div
            className="nodrag nopan edge-label"
            style={{
              background: 'white',
              color: 'black',
              padding: '4px 8px',
              borderRadius: '4px',
              fontSize: '10px',
              fontWeight: 'bold',
              border: '2px solid black',
              boxShadow: '2px 2px 0px 0px rgba(0,0,0,1)',
              display: 'flex',
              justifyContent: 'center',
              alignItems: 'center',
              textAlign: 'center',
            }}
          >
            {data.label}
          </div>
        </foreignObject>
      )}
    </>
  );
};

// Helper function to generate bezier path
function getBezierPath({
  sourceX,
  sourceY,
  sourcePosition,
  targetX,
  targetY,
  targetPosition,
}: {
  sourceX: number;
  sourceY: number;
  sourcePosition: Position;
  targetX: number;
  targetY: number;
  targetPosition: Position;
}): [string, number, number] {
  const offsetX = Math.abs(targetX - sourceX) * 0.5;
  
  // Create control points for Bezier curve
  let sourceControlX = sourceX;
  let sourceControlY = sourceY;
  let targetControlX = targetX;
  let targetControlY = targetY;
  
  // Adjust control points based on positions
  if (sourcePosition === Position.Left) {
    sourceControlX = sourceX - offsetX;
  } else if (sourcePosition === Position.Right) {
    sourceControlX = sourceX + offsetX;
  } else if (sourcePosition === Position.Top) {
    sourceControlY = sourceY - offsetX;
  } else if (sourcePosition === Position.Bottom) {
    sourceControlY = sourceY + offsetX;
  }
  
  if (targetPosition === Position.Left) {
    targetControlX = targetX - offsetX;
  } else if (targetPosition === Position.Right) {
    targetControlX = targetX + offsetX;
  } else if (targetPosition === Position.Top) {
    targetControlY = targetY - offsetX;
  } else if (targetPosition === Position.Bottom) {
    targetControlY = targetY + offsetX;
  }
  
  // Generate bezier path
  const path = `M${sourceX},${sourceY} C${sourceControlX},${sourceControlY} ${targetControlX},${targetControlY} ${targetX},${targetY}`;
  
  // Calculate label position (center of the path)
  const labelX = (sourceX + targetX) / 2;
  const labelY = (sourceY + targetY) / 2;
  
  return [path, labelX, labelY];
}

// Define node types outside component to avoid recreating on every render
const nodeTypes = { agent: AgentNode };

// Define edge types outside component
const edgeTypes = { custom: CustomEdge as any };

// The main workflow component
const WorkflowContainer: React.FC = () => {
  const { toast } = useToast();
  const reactFlowWrapper = useRef<HTMLDivElement>(null);
  const [reactFlowInstance, setReactFlowInstance] = useState<any>(null);
  
  // Node and edge states
  const [nodes, setNodes, onNodesChange] = useNodesState([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState([]);
  
  // Form states
  const [nodeName, setNodeName] = useState('');
  const [nodeType, setNodeType] = useState<AgentType>('developer');
  const [nodeDescription, setNodeDescription] = useState('');
  const [isAddingNode, setIsAddingNode] = useState(false);
  
  // Edge dialog states
  const [selectedEdge, setSelectedEdge] = useState<Edge | null>(null);
  const [connectionLabel, setConnectionLabel] = useState('');
  const [connectionType, setConnectionType] = useState<ConnectionDataType>('code');
  const [connectionDescription, setConnectionDescription] = useState('');
  const [isConnectionModalOpen, setIsConnectionModalOpen] = useState(false);
  
  // Execute workflow states
  const [isExecuteModalOpen, setIsExecuteModalOpen] = useState(false);
  const [isExecuting, setIsExecuting] = useState(false);
  const [executionProgress, setExecutionProgress] = useState<{id: string, completed: boolean}[]>([]);

  // Node dialog states
  const [selectedNode, setSelectedNode] = useState<Node | null>(null);
  const [isNodeModalOpen, setIsNodeModalOpen] = useState(false);
  
  // Define nodeTypes and edgeTypes for ReactFlow
  const nodeTypes = useMemo(() => ({ agent: AgentNode }), []);
  const edgeTypes = useMemo(() => ({ custom: CustomEdge }), []);
  
  // Initialize empty canvas with demo agents
  useEffect(() => {
    // Create initial nodes
    const initialNodes = [
      {
        id: '1',
        type: 'agent',
        position: { x: 50, y: 100 },
        data: {
          label: 'Business Requirements',
          type: 'business-analyst',
          description: 'Analyzes business needs and creates requirements',
          active: true,
          onEdit: () => handleEditNode('1'),
          onConfigure: () => handleConfigureNode('1')
        }
      },
      {
        id: '2',
        type: 'agent',
        position: { x: 400, y: 100 },
        data: {
          label: 'API Development',
          type: 'developer',
          description: 'Creates RESTful APIs and backend services',
          active: false,
          onEdit: () => handleEditNode('2'),
          onConfigure: () => handleConfigureNode('2')
        }
      },
      {
        id: '3',
        type: 'agent',
        position: { x: 750, y: 100 },
        data: {
          label: 'Quality Assurance',
          type: 'qa-engineer',
          description: 'Tests functionality and ensures quality',
          active: false,
          onEdit: () => handleEditNode('3'),
          onConfigure: () => handleConfigureNode('3')
        }
      }
    ];
    
    // Create initial connections
    const initialEdges = [
      {
        id: 'e1-2',
        source: '1',
        target: '2',
        type: 'custom',
        data: {
          label: 'API Requirements',
          type: 'requirements'
        },
        markerEnd: {
          type: MarkerType.ArrowClosed,
          width: 20,
          height: 20
        }
      },
      {
        id: 'e2-3',
        source: '2',
        target: '3',
        type: 'custom',
        data: {
          label: 'API Implementation',
          type: 'code'
        },
        markerEnd: {
          type: MarkerType.ArrowClosed,
          width: 20,
          height: 20
        }
      }
    ];
    
    setNodes(initialNodes);
    setEdges(initialEdges);
  }, []);
  
  // Handle edit node action
  const handleEditNode = (nodeId: string) => {
    const node = nodes.find(n => n.id === nodeId);
    if (node) {
      setSelectedNode(node);
      setNodeName(node.data.label);
      setNodeType(node.data.type);
      setNodeDescription(node.data.description);
      setIsNodeModalOpen(true);
    }
  };
  
  // Handle configure node action
  const handleConfigureNode = (nodeId: string) => {
    toast({
      title: "Configure Agent",
      description: "Configuration options for this agent will be available soon.",
      duration: 3000
    });
  };
  
  // Handle new node creation
  const handleAddNode = () => {
    if (!nodeName || !nodeDescription) {
      toast({
        title: "Validation Error",
        description: "Please provide a name and description for the agent.",
        variant: "destructive"
      });
      return;
    }
    
    const newId = (nodes.length + 1).toString();
    const newNode = {
      id: newId,
      type: 'agent',
      position: {
        x: Math.random() * 300 + 200,
        y: Math.random() * 200 + 100
      },
      data: {
        label: nodeName,
        type: nodeType,
        description: nodeDescription,
        active: false,
        onEdit: () => handleEditNode(newId),
        onConfigure: () => handleConfigureNode(newId)
      }
    };
    
    setNodes(prev => [...prev, newNode]);
    
    // Reset form
    setNodeName('');
    setNodeDescription('');
    setNodeType('developer');
    setIsAddingNode(false);
    
    toast({
      title: "Agent Added",
      description: `${nodeName} has been added to the workflow.`,
      duration: 3000
    });
  };
  
  // Handle updating existing node
  const handleUpdateNode = () => {
    if (!selectedNode) return;
    
    if (!nodeName || !nodeDescription) {
      toast({
        title: "Validation Error",
        description: "Please provide a name and description for the agent.",
        variant: "destructive"
      });
      return;
    }
    
    const updatedNodes = nodes.map(node => {
      if (node.id === selectedNode.id) {
        return {
          ...node,
          data: {
            ...node.data,
            label: nodeName,
            type: nodeType,
            description: nodeDescription
          }
        };
      }
      return node;
    });
    
    setNodes(updatedNodes);
    setIsNodeModalOpen(false);
    setSelectedNode(null);
    
    toast({
      title: "Agent Updated",
      description: `${nodeName} has been updated.`,
      duration: 3000
    });
  };
  
  // Handle edge connections
  const onConnect = useCallback((connection: Connection) => {
    // Open dialog to set connection properties
    setConnectionLabel('');
    setConnectionType('code');
    setConnectionDescription('');
    setSelectedEdge({
      id: `e${connection.source}-${connection.target}`,
      source: connection.source!,
      target: connection.target!,
      // Add more properties as needed
    } as Edge);
    setIsConnectionModalOpen(true);
  }, []);
  
  // Create new edge with custom data
  const handleCreateConnection = () => {
    if (!selectedEdge) return;
    
    if (!connectionLabel) {
      toast({
        title: "Validation Error", 
        description: "Please provide a label for the connection.",
        variant: "destructive"
      });
      return;
    }
    
    const newEdge = {
      ...selectedEdge,
      type: 'custom',
      data: {
        label: connectionLabel,
        type: connectionType,
        description: connectionDescription
      },
      markerEnd: {
        type: MarkerType.ArrowClosed,
        width: 20,
        height: 20
      }
    };
    
    setEdges(eds => addEdge(newEdge, eds));
    setIsConnectionModalOpen(false);
    setSelectedEdge(null);
    
    toast({
      title: "Connection Created",
      description: `${connectionLabel} connection has been created.`,
      duration: 3000
    });
  };
  
  // Handle edge click to edit
  const onEdgeClick = useCallback((event: React.MouseEvent, edge: Edge) => {
    event.stopPropagation();
    setSelectedEdge(edge);
    setConnectionLabel(edge.data?.label || '');
    setConnectionType(edge.data?.type || 'code');
    setConnectionDescription(edge.data?.description || '');
    setIsConnectionModalOpen(true);
  }, []);
  
  // Update existing edge
  const handleUpdateConnection = () => {
    if (!selectedEdge) return;
    
    if (!connectionLabel) {
      toast({
        title: "Validation Error",
        description: "Please provide a label for the connection.",
        variant: "destructive"
      });
      return;
    }
    
    const updatedEdges = edges.map(edge => {
      if (edge.id === selectedEdge.id) {
        return {
          ...edge,
          data: {
            ...edge.data,
            label: connectionLabel,
            type: connectionType,
            description: connectionDescription
          }
        };
      }
      return edge;
    });
    
    setEdges(updatedEdges);
    setIsConnectionModalOpen(false);
    setSelectedEdge(null);
    
    toast({
      title: "Connection Updated",
      description: `${connectionLabel} connection has been updated.`,
      duration: 3000
    });
  };
  
  // Save workflow to localStorage
  const saveWorkflow = () => {
    if (nodes.length === 0) {
      toast({
        title: "No Workflow to Save",
        description: "Please create at least one agent before saving.",
        variant: "destructive"
      });
      return;
    }
    
    const workflow = {
      nodes,
      edges
    };
    
    localStorage.setItem('immersiveWorkflow', JSON.stringify(workflow));
    
    toast({
      title: "Workflow Saved",
      description: "Your workflow has been saved successfully.",
      duration: 3000
    });
  };
  
  // Load workflow from localStorage
  const loadWorkflow = () => {
    const savedWorkflow = localStorage.getItem('immersiveWorkflow');
    
    if (!savedWorkflow) {
      toast({
        title: "No Saved Workflow",
        description: "No previously saved workflow found.",
        variant: "destructive"
      });
      return;
    }
    
    try {
      const { nodes: savedNodes, edges: savedEdges } = JSON.parse(savedWorkflow);
      
      // Add handlers to the loaded nodes
      const nodesWithHandlers = savedNodes.map((node: Node) => ({
        ...node,
        data: {
          ...node.data,
          onEdit: () => handleEditNode(node.id),
          onConfigure: () => handleConfigureNode(node.id)
        }
      }));
      
      setNodes(nodesWithHandlers);
      setEdges(savedEdges);
      
      toast({
        title: "Workflow Loaded",
        description: "Your saved workflow has been loaded successfully.",
        duration: 3000
      });
    } catch (error) {
      toast({
        title: "Error Loading Workflow",
        description: "There was an error loading your workflow.",
        variant: "destructive"
      });
    }
  };
  
  // Execute the workflow
  const executeWorkflow = () => {
    if (nodes.length === 0) {
      toast({
        title: "No Workflow to Execute",
        description: "Please create at least one agent before executing.",
        variant: "destructive"
      });
      return;
    }
    
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
      
      // Update node to show it's active
      setNodes(nds => nds.map(node => {
        if (node.id === currentNode.id) {
          return {
            ...node,
            data: {
              ...node.data,
              active: true
            }
          };
        }
        return node;
      }));
      
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
  
  return (
    <div className="flex flex-col h-full">
      <div 
        className="flex-grow"
        style={{ height: 'calc(100vh - 120px)', width: '100%' }}
        ref={reactFlowWrapper}
      >
        <ReactFlow
          nodes={nodes}
          edges={edges}
          onNodesChange={onNodesChange}
          onEdgesChange={onEdgesChange}
          onConnect={onConnect}
          onEdgeClick={onEdgeClick}
          onInit={setReactFlowInstance}
          nodeTypes={nodeTypes}
          connectionLineType={ConnectionLineType.Bezier}
          defaultEdgeOptions={{
            type: 'custom',
            markerEnd: {
              type: MarkerType.ArrowClosed,
              width: 20,
              height: 20
            }
          }}
          fitView
          snapToGrid
          edgeTypes={edgeTypes}
        >
          <Controls 
            position="bottom-right"
            showInteractive={false}
            className="controls-container"
            style={{
              marginBottom: '20px',
              marginRight: '20px',
              padding: '8px',
              border: '3px solid black',
              borderRadius: '8px',
              background: 'white',
              boxShadow: '4px 4px 0px 0px rgba(0,0,0,1)'
            }}
          />
          <MiniMap
            nodeStrokeWidth={3}
            zoomable
            pannable
            style={{
              border: '3px solid black',
              borderRadius: '8px',
              background: 'white',
              boxShadow: '4px 4px 0px 0px rgba(0,0,0,1)'
            }}
          />
          <Background 
            gap={20} 
            color="#aaa" 
            style={{ 
              background: '#f0f0f0'
            }}
          />
          <Panel position="top-left">
            <div className="flex gap-2 mb-2">
              <Button 
                onClick={() => setIsAddingNode(true)}
                className="brutal-shadow border-2 border-black bg-white text-black hover:bg-gray-100 hover:text-black"
              >
                <Plus className="w-4 h-4 mr-2" />
                Add Agent
              </Button>
              <Button 
                onClick={() => {
                  if (reactFlowInstance) {
                    reactFlowInstance.fitView();
                  }
                }}
                className="brutal-shadow border-2 border-black bg-white text-black hover:bg-gray-100 hover:text-black"
                variant="outline"
              >
                <RefreshCw className="w-4 h-4" />
              </Button>
            </div>
            <div className="flex gap-2 mb-2">
              <Button 
                onClick={saveWorkflow}
                className="brutal-shadow border-2 border-black bg-white text-black hover:bg-gray-100 hover:text-black"
                variant="outline"
              >
                <Save className="w-4 h-4 mr-2" />
                Save Workflow
              </Button>
              <Button 
                onClick={loadWorkflow}
                className="brutal-shadow border-2 border-black bg-white text-black hover:bg-gray-100 hover:text-black"
                variant="outline"
              >
                <Upload className="w-4 h-4 mr-2" />
                Load Workflow
              </Button>
            </div>
            <Button 
              onClick={() => setIsExecuteModalOpen(true)}
              className="brutal-shadow border-2 border-black bg-green-100 text-black hover:bg-green-200 hover:text-black w-full"
              variant="outline"
            >
              ▶️ Execute Workflow
            </Button>
          </Panel>
        </ReactFlow>
      </div>
      
      {/* Agent Dialog */}
      <Dialog open={isAddingNode} onOpenChange={setIsAddingNode}>
        <DialogContent className="border-4 border-black brutal-shadow">
          <DialogHeader>
            <DialogTitle className="text-xl font-bold">Add New Agent</DialogTitle>
            <DialogDescription>
              Create a new workflow agent with a specific role and function.
            </DialogDescription>
          </DialogHeader>
          
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="name" className="text-right font-bold">
                Name
              </Label>
              <Input
                id="name"
                value={nodeName}
                onChange={(e) => setNodeName(e.target.value)}
                className="col-span-3 border-2 border-black brutal-input"
                placeholder="e.g. API Developer"
              />
            </div>
            
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="agent-type" className="text-right font-bold">
                Type
              </Label>
              <Select
                value={nodeType}
                onValueChange={(value) => setNodeType(value as AgentType)}
              >
                <SelectTrigger className="col-span-3 border-2 border-black brutal-input">
                  <SelectValue placeholder="Select agent type" />
                </SelectTrigger>
                <SelectContent className="border-2 border-black">
                  <SelectItem value="business-analyst">Business Analyst</SelectItem>
                  <SelectItem value="developer">Developer</SelectItem>
                  <SelectItem value="qa-engineer">QA Engineer</SelectItem>
                  <SelectItem value="devops">DevOps</SelectItem>
                  <SelectItem value="product-manager">Product Manager</SelectItem>
                  <SelectItem value="custom">Custom</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="description" className="text-right font-bold">
                Description
              </Label>
              <Textarea
                id="description"
                value={nodeDescription}
                onChange={(e) => setNodeDescription(e.target.value)}
                className="col-span-3 border-2 border-black brutal-input"
                placeholder="Describe the agent's responsibilities"
                rows={3}
              />
            </div>
          </div>
          
          <DialogFooter>
            <Button 
              variant="outline"
              onClick={() => setIsAddingNode(false)}
              className="border-2 border-black brutal-shadow"
            >
              Cancel
            </Button>
            <Button 
              onClick={handleAddNode}
              className="border-2 border-black brutal-shadow bg-black text-white hover:bg-gray-800"
            >
              <Plus className="w-4 h-4 mr-2" />
              Add Agent
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      
      {/* Edit Node Dialog */}
      <Dialog open={isNodeModalOpen} onOpenChange={setIsNodeModalOpen}>
        <DialogContent className="border-4 border-black brutal-shadow">
          <DialogHeader>
            <DialogTitle className="text-xl font-bold">Edit Agent</DialogTitle>
            <DialogDescription>
              Update this agent's properties and behavior.
            </DialogDescription>
          </DialogHeader>
          
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="edit-name" className="text-right font-bold">
                Name
              </Label>
              <Input
                id="edit-name"
                value={nodeName}
                onChange={(e) => setNodeName(e.target.value)}
                className="col-span-3 border-2 border-black brutal-input"
              />
            </div>
            
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="edit-agent-type" className="text-right font-bold">
                Type
              </Label>
              <Select
                value={nodeType}
                onValueChange={(value) => setNodeType(value as AgentType)}
              >
                <SelectTrigger className="col-span-3 border-2 border-black brutal-input">
                  <SelectValue placeholder="Select agent type" />
                </SelectTrigger>
                <SelectContent className="border-2 border-black">
                  <SelectItem value="business-analyst">Business Analyst</SelectItem>
                  <SelectItem value="developer">Developer</SelectItem>
                  <SelectItem value="qa-engineer">QA Engineer</SelectItem>
                  <SelectItem value="devops">DevOps</SelectItem>
                  <SelectItem value="product-manager">Product Manager</SelectItem>
                  <SelectItem value="custom">Custom</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="edit-description" className="text-right font-bold">
                Description
              </Label>
              <Textarea
                id="edit-description"
                value={nodeDescription}
                onChange={(e) => setNodeDescription(e.target.value)}
                className="col-span-3 border-2 border-black brutal-input"
                rows={3}
              />
            </div>
          </div>
          
          <DialogFooter>
            <Button 
              variant="outline"
              onClick={() => setIsNodeModalOpen(false)}
              className="border-2 border-black brutal-shadow"
            >
              Cancel
            </Button>
            <Button 
              onClick={handleUpdateNode}
              className="border-2 border-black brutal-shadow bg-black text-white hover:bg-gray-800"
            >
              <Save className="w-4 h-4 mr-2" />
              Save Changes
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      
      {/* Execute Workflow Modal */}
      <Dialog open={isExecuteModalOpen} onOpenChange={setIsExecuteModalOpen}>
        <DialogContent className="border-4 border-black brutal-shadow">
          <DialogHeader>
            <DialogTitle className="text-xl font-bold">Execute Workflow</DialogTitle>
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
                      This will execute all agents in the workflow based on their connections.
                      Make sure all agent connections are properly set up.
                    </p>
                  </div>
                </div>
                
                <div className="border-2 border-black p-3 bg-gray-50">
                  <h4 className="font-bold mb-2">Execution Options</h4>
                  
                  <div className="space-y-2">
                    <div className="flex items-center space-x-2">
                      <Switch id="halt-on-error" defaultChecked />
                      <Label htmlFor="halt-on-error">Halt on error</Label>
                    </div>
                    
                    <div className="flex items-center space-x-2">
                      <Switch id="debug-mode" />
                      <Label htmlFor="debug-mode">Debug mode</Label>
                    </div>
                    
                    <div className="flex items-center space-x-2">
                      <Switch id="save-outputs" defaultChecked />
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
                            <Check className="h-5 w-5 text-green-500" />
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
      
      {/* Connection Dialog */}
      <Dialog open={isConnectionModalOpen} onOpenChange={setIsConnectionModalOpen}>
        <DialogContent className="border-4 border-black brutal-shadow">
          <DialogHeader>
            <DialogTitle className="text-xl font-bold">
              {selectedEdge?.data ? 'Edit Connection' : 'New Connection'}
            </DialogTitle>
            <DialogDescription>
              Define how these agents interact and what data they exchange.
            </DialogDescription>
          </DialogHeader>
          
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="connection-label" className="text-right font-bold">
                Label
              </Label>
              <Input
                id="connection-label"
                value={connectionLabel}
                onChange={(e) => setConnectionLabel(e.target.value)}
                className="col-span-3 border-2 border-black brutal-input"
                placeholder="e.g. API Requirements"
              />
            </div>
            
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="connection-type" className="text-right font-bold">
                Type
              </Label>
              <Select
                value={connectionType}
                onValueChange={(value) => setConnectionType(value as ConnectionDataType)}
              >
                <SelectTrigger className="col-span-3 border-2 border-black brutal-input">
                  <SelectValue placeholder="Select data type" />
                </SelectTrigger>
                <SelectContent className="border-2 border-black">
                  <SelectItem value="code">Code</SelectItem>
                  <SelectItem value="requirements">Requirements</SelectItem>
                  <SelectItem value="test-cases">Test Cases</SelectItem>
                  <SelectItem value="documentation">Documentation</SelectItem>
                  <SelectItem value="custom">Custom</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="connection-description" className="text-right font-bold">
                Description
              </Label>
              <Textarea
                id="connection-description"
                value={connectionDescription}
                onChange={(e) => setConnectionDescription(e.target.value)}
                className="col-span-3 border-2 border-black brutal-input"
                placeholder="Describe the data being exchanged"
                rows={3}
              />
            </div>
          </div>
          
          <DialogFooter>
            <Button 
              variant="outline"
              onClick={() => setIsConnectionModalOpen(false)}
              className="border-2 border-black brutal-shadow"
            >
              Cancel
            </Button>
            <Button 
              onClick={selectedEdge?.data ? handleUpdateConnection : handleCreateConnection}
              className="border-2 border-black brutal-shadow bg-black text-white hover:bg-gray-800"
            >
              <Save className="w-4 h-4 mr-2" />
              {selectedEdge?.data ? 'Update Connection' : 'Create Connection'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

// Wrap component with ReactFlowProvider
const ImmersiveWorkflow: React.FC = () => {
  return (
    <div className="h-full w-full">
      <ReactFlowProvider>
        <WorkflowContainer />
      </ReactFlowProvider>
    </div>
  );
};

export default ImmersiveWorkflow;