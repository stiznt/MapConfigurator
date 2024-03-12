type NodeType = {
	id: number,
	label: string,
	x: number,
	y: number,
	mac?: string
	macEditable? :boolean
	message?: string
	isEndPoint?: boolean
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
	planURL: string
}
export type {NodeType, EdgeType, GraphInfo}