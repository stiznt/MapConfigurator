import { useReducer } from 'react';
import './App.css';
import Graph from './Graph';
import { convertMousePosToSVGPos, generateEdgeId, generateNodeId } from './utils';
import { GraphInfo, NodeType, EdgeType } from './types';

function reducer(state: GraphInfo, action: {type:string, args: any}):GraphInfo{

	switch(action.type){
		case 'node-move':
            var [x, y] = convertMousePosToSVGPos(action.args.event.clientX, action.args.event.clientY)
			const node = state.nodes.find((v) => {return v.id == action.args.nodeId})
			
			const new_nodes = state.nodes.filter((node) => {return node.id !== action.args.nodeId});
			node!.x = x
			node!.y = y
			new_nodes.push(node!)

			return {
				...state,
				nodes: [...new_nodes]
			};
		case 'node-select':

			return {
				...state,
				selectedNodeId: state.selectedNodeId == action.args.nodeId ? -1: action.args.nodeId
			}
		case 'node-create':
			var [x, y] = convertMousePosToSVGPos(action.args.mousePosition.x, action.args.mousePosition.y);
			var id = generateNodeId()
			return {
				...state,
				nodes: [...state.nodes, {id: id, x: x, y: y, label: `Точка ${id}`}]
			};
		case 'create-path':
			if(state.selectedNodeId == -1 || state.selectedNodeId == action.args.nodeId) return state;
			
			const path1 = state.edges.filter((edge) => edge.firstNodeId == state.selectedNodeId || edge.firstNodeId == action.args.nodeId)
			const paths = path1.filter((edge) => edge.secondNodeId == state.selectedNodeId || edge.secondNodeId == action.args.nodeId)
			if(paths.length > 0){
				return state;
			}
			return {
				...state,
				edges: [...state.edges, {id: generateEdgeId(), firstNodeId: state.selectedNodeId, secondNodeId: action.args.nodeId}]
			};
		case 'remove-path':
			const new_edges = state.edges.filter((edge) => edge.id !== action.args.edgeId)
			return {
				...state,
				edges: new_edges
			}
	}

	return state;
}

function App() {
	const [graphInfo, dispatch] = useReducer(reducer, {selectedNodeId: -1, nodes: [], edges: []})

	return (
		<div className="App">
			<Graph graphInfo={graphInfo} dispatcher={dispatch} width={400} height={400}/>
		</div>
	);
}

export default App;
