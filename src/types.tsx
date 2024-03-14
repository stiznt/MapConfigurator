

type NodeType = {
	id: number,
	label: string,
	x: number,
	y: number,
	mac?: string
	macEditable? :boolean
	message?: string
	isEndPoint: boolean,
	type: string
	description: string
}

type EdgeType = {
	id: number,
	nodes: any
	message?: string
}

type GraphInfo = {
	floors: FloorInfo[]
	currentFloorId: number
}

type FloorInfo = {
	id: number
	selectedNodeId?: number,
	nodes: NodeType[],
	edges: EdgeType[],
	planURL: string
}
export type {NodeType, EdgeType, GraphInfo, FloorInfo}