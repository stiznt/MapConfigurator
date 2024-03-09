import { useCallback, useReducer, useState } from 'react';
import './App.css';
import Graph from './Graph';
import { convertMousePosToSVGPos, generateEdgeId, generateNodeId } from './utils';
import { GraphInfo, NodeType, EdgeType } from './types';
import { AppBar, Box, Button, FormGroup, Grid, InputLabel, MenuItem, Select, Stack, TextField, Toolbar, ownerWindow } from '@mui/material';

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
			const new_id = state.selectedNodeId == action.args.nodeId ? -1: action.args.nodeId;

			return {
				...state,
				selectedNodeId: new_id
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
		case "selected-node-label-changed":
			const new_value = (action.args.event.target as HTMLInputElement).value
			const node1 = state.nodes.find((v) => {return v.id == state.selectedNodeId})
			
			const new_nodes1 = state.nodes.filter((node) => {return node.id !== state.selectedNodeId});
			node1!.label = new_value;
			new_nodes1.push(node1!)

			return {
				...state,
				nodes: [...new_nodes1]
			};
	}

	return state;
}

function App() {
	const [graphInfo, dispatch] = useReducer(reducer, {selectedNodeId: -1, nodes: [], edges: []})

	const getSelectedNode = useCallback(() : NodeType => {
		const emptyNode :NodeType = {x:0, y:0, label:"", id:-1};
		if(graphInfo.selectedNodeId == -1) return emptyNode;
		return graphInfo.nodes.find(v => v.id == graphInfo.selectedNodeId)!
	}, [graphInfo])

	return (
		<Box>

			<AppBar position='fixed'>
				<Toolbar>
					<Button color={"inherit"}>NEW</Button>
				</Toolbar>
			</AppBar>
			<Toolbar/>

			<Grid container>
				<Grid xs={9}>
					<Graph graphInfo={graphInfo} dispatcher={dispatch}/>
				</Grid>
				<Grid item xs>
					<TextField fullWidth label="Выбранная вершина" value={getSelectedNode().label} onChange={event => dispatch({type: 'selected-node-label-changed', args: {event: event}})}></TextField>
				</Grid>
			</Grid>

		</Box>
	);
}
{/* <Graph graphInfo={graphInfo} dispatcher={dispatch}/> */}
export default App;
