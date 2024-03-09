type NodeType = {
	id: number,
	label: string,
	x: number,
	y: number,
	mac?: string
	macEditable? :boolean;
}

type EdgeType = {
	id: number,
	firstNodeId: number,
	secondNodeId: number
}

type GraphInfo = {
	selectedNodeId: number,
	nodes: NodeType[],
	edges: EdgeType[],
	selectedNodeInfo? : NodeType
}

export type {NodeType, EdgeType, GraphInfo}