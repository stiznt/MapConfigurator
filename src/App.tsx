import { useCallback, useReducer, useState } from 'react';
import './App.css';
import Graph from './Graph';
import { convertMousePosToSVGPos, generateEdgeId, generateNodeId } from './utils';
import { GraphInfo, NodeType, EdgeType } from './types';
import { AppBar, Box, Button,Checkbox,Grid,List, ListItem,TextField, Toolbar} from '@mui/material';

function reducer(state: GraphInfo, action: {type:string, args: any}):GraphInfo{
	function updateKey<K extends keyof NodeType>(key: K, value: NodeType[K]){

	}
	switch(action.type){
		case 'node-move':
            var [x, y] = convertMousePosToSVGPos(action.args.event.clientX, action.args.event.clientY)
			let node = state.nodes.find((v) => {return v.id == action.args.nodeId})
			
			// const new_nodes = state.nodes.filter((node) => {return node.id !== action.args.nodeId});
			node!.x = x
			node!.y = y
			// new_nodes.push(node!)

			return state;
		case 'node-select':
			const new_id = state.selectedNodeId == action.args.nodeId ? -1: action.args.nodeId;
			state.selectedNodeInfo = state.nodes.find(v => v.id == new_id);
			return {
				...state,
				selectedNodeId: new_id
			};
		case 'node-create':
			var [x, y] = convertMousePosToSVGPos(action.args.mousePosition.x, action.args.mousePosition.y);
			var id = generateNodeId()
			return {
				...state,
				nodes: [...state.nodes, {id: id, x: x, y: y, label: `Точка ${id}`, mac: "", macEditable: false}]
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
			console.log(state.selectedNodeId, state.selectedNodeInfo)
			if(state.selectedNodeId != -1){
				state.selectedNodeInfo!.label = (action.args.event.target as HTMLInputElement).value;
				console.log(state.nodes.find(v => v.id == state.selectedNodeId));
			}
			console.log(state)
			return state;

		case "mac-editable-changed":
			var node2 = state.nodes.find((v) => v.id == state.selectedNodeId)
			var new_nodes2 = state.nodes.filter(node => node.id == state.selectedNodeId);

			node2!.macEditable = (action.args.event.target as HTMLInputElement).checked;
			new_nodes2.push(node2!);
			return {
				...state,
				nodes: [...new_nodes2]
			};

		case "mac-changed":
			var node3 = state.nodes.find((v) => v.id == state.selectedNodeId)
			var new_nodes3 = state.nodes.filter(node => node.id == state.selectedNodeId);

			node3!.mac = (action.args.evevnt.target as HTMLInputElement).value;
			new_nodes3.push(node3!);
			return {
				...state,
				nodes: [...new_nodes3]
			};
		case 'node-info-change':
			var changes :{key:keyof NodeType, value: any}[] = action.args.changes;
			let node4 = state.nodes.find(v => v.id == action.args.nodeId)!;
			console.log(changes);
			const updateNode = <K extends keyof NodeType>(key: K, value: NodeType[K]) => {
				node4[key] = value;
			}

			for(var i = 0; i < changes.length; i++){
				updateNode(changes[i].key, changes[i].value);
			}
			return state;

	}

	return state;
}

function App() {
	const [graphInfo, dispatch] = useReducer(reducer, {selectedNodeId: -1, nodes: [{x: 0, y: 0, label: "", id:-1}], edges: []})

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
					<TextField fullWidth label="Выбранная вершина" value={graphInfo.selectedNodeInfo?.label} onChange={event => dispatch({type: 'selected-node-label-changed', args: {event: event}})}></TextField>
					<TextField fullWidth label="ID" InputProps={{readOnly: true}} value={""} margin='dense'></TextField>

					<List>
						<ListItem alignItems="center" disablePadding>
							<TextField fullWidth disabled={false} label="MAC" value={""} onInput={event => dispatch({type: 'mac-changed', args: {event: event}})}/>
							<Checkbox checked={false} onChange={event => dispatch({type: 'mac-editable-changed', args: {event: event}})}/>
						</ListItem>

					</List>
				
				</Grid>
			</Grid>

		</Box>
	);
}
{/* <Graph graphInfo={graphInfo} dispatcher={dispatch}/> */}
export default App;
