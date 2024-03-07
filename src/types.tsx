type NodeType = {
	id: number,
	label: string,
	x: number,
	y: number
}

type EdgeType = {
	id: number,
	firstNodeId: number,
	secondNodeId: number
}

type GraphInfo = {
	selectedNodeId: number,
	nodes: NodeType[],
	edges: EdgeType[]
}

export type {NodeType, EdgeType, GraphInfo}