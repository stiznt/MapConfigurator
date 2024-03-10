type NodeType = {
	id: number,
	label: string,
	x: number,
	y: number,
	mac?: string
	macEditable? :boolean
	message?: string
}

type EdgeType = {
	id: number,
	nodes: any
	message?: string
}

type GraphInfo = {
	selectedNodeId: number,
	nodes: NodeType[],
	edges: EdgeType[],
	selectedNodeInfo? : NodeType
}

export type {NodeType, EdgeType, GraphInfo}