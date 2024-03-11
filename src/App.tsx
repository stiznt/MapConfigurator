import { useCallback, useReducer, useState } from 'react';
import './App.css';
import Graph from './Graph';
import { convertMousePosToSVGPos, generateEdgeId, generateNodeId } from './utils';
import { GraphInfo, NodeType, EdgeType } from './types';
import { AppBar, Box, Button,Checkbox,CssBaseline,FormControl,Grid,InputLabel,List, ListItem,MenuItem,Select,Stack,TextField, Toolbar} from '@mui/material';

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
			return {
				...state,
				selectedNodeId: new_id
			};
		case 'node-create':
			var [x, y] = convertMousePosToSVGPos(action.args.mousePosition.x, action.args.mousePosition.y);
			var id = generateNodeId()
			return {
				...state,
				nodes: [...state.nodes, {id: id, x: x, y: y, label: `Точка ${id}`, mac: "", macEditable: false, message: ""}]
			};
		case 'create-path':
			if(state.selectedNodeId == -1 || state.selectedNodeId == action.args.nodeId) return state;
			
			const paths = state.edges.filter((edge) => state.selectedNodeId in edge.nodes && action.args.nodeId in edge.nodes)
			if(paths.length > 0){
				return state;
			}
			return {
				...state,
				edges: [...state.edges, {id: generateEdgeId(), nodes: {[state.selectedNodeId]: 1, [action.args.nodeId]: 1}, message: ""}]
			};
		case 'remove-path':
			const new_edges = state.edges.filter((edge) => edge.id !== action.args.edgeId)
			return {
				...state,
				edges: new_edges
			}
		case 'edge-update':
			let edge = state.edges.find(e => action.args.nodeId in e.nodes && state.selectedNodeId in e.nodes)
			console.log(action, edge)
			if(edge == undefined) return state;
			
			edge.message = action.args.changes[0].value
			console.log(edge)
			return {
				...state
			};
		case 'node-info-change':
			var changes :{key:keyof NodeType, value: any}[] = action.args.changes;
			let node4 = state.nodes.find(v => v.id == action.args.nodeId)!;
			const updateNode = <K extends keyof NodeType>(key: K, value: NodeType[K]) => {
				node4[key] = value;
			}

			for(var i = 0; i < changes.length; i++){
				updateNode(changes[i].key, changes[i].value);
			}
			return {
				...state
			};

	}

	return state;
}

function App() {
	const [graphInfo, dispatch] = useReducer(reducer, {selectedNodeId: -1, nodes: [{x: 0, y: 0, label: "", id:-1, mac:"", message: " "}], edges: []})
	const [selectorValue, setSelectorValue] = useState(-1);

	const getSelectedNode = () => {
		return graphInfo.nodes.find(v => v.id === graphInfo.selectedNodeId)
	}

	const selectedNodeChange = (changes: {key: keyof NodeType, value: any}[]) => {
		dispatch({type: "node-info-change", args: {nodeId: graphInfo.selectedNodeId, changes: changes}});
	}

	const getConnectedNodesById = (id: number) => {
		var edges = graphInfo.edges.filter(edge => id in edge.nodes);
		var ids = {[graphInfo.selectedNodeId]: 1};
		edges.forEach(elem => {ids = Object.assign(ids, elem.nodes)})
		
		delete ids[graphInfo.selectedNodeId];

		return graphInfo.nodes.filter(node => node.id in ids);
	}

	const getEdgeById = (id: number) => {
		let edge = graphInfo.edges.find(e => id in e.nodes && graphInfo.selectedNodeId in e.nodes)
		if(edge == undefined) return ({id: -1, nodes: [], message: ""} as EdgeType)
		return edge;
	}

	return (
		<Stack>
			<CssBaseline/>
			<AppBar position='sticky'>
				<Toolbar>
					<Button color="inherit">NEW</Button>
				</Toolbar>
			</AppBar>
			<Grid container marginTop={"5px"}>
				<Grid item xs={9}>
					<Graph graphInfo={graphInfo} dispatcher={dispatch}/>
				</Grid>
				<Grid item xs margin="5px" marginRight={"10px"}>
					<TextField fullWidth label="Выбранная вершина" value={getSelectedNode()?.label} onChange={event => selectedNodeChange([{key: "label", value: event.target.value}])}></TextField>
					<TextField fullWidth label="ID" InputProps={{readOnly: true}} value={getSelectedNode()?.id} margin='dense'></TextField>
					<List>
		 				<ListItem alignItems="center" disablePadding>
		 					<TextField fullWidth disabled={!getSelectedNode()?.macEditable} label="MAC" value={getSelectedNode()?.mac} onChange={event => selectedNodeChange([{key: "mac", value: event.target.value}])}/>
		 					<Checkbox checked={getSelectedNode()?.macEditable} onChange={event => selectedNodeChange([{key: 'macEditable', value: event.target.checked}])}/>
		 				</ListItem>
						<ListItem alignItems='center' disablePadding>
							<TextField fullWidth label="Координата X" value={getSelectedNode()?.x} onChange={event => selectedNodeChange([{key: "x", value: event.target.value}])} margin='dense'></TextField>
						</ListItem>
						<ListItem alignItems='center' disablePadding>
							<TextField fullWidth label="Координата Y" value={getSelectedNode()?.y} onChange={event => selectedNodeChange([{key: "y", value: event.target.value}])} margin='dense'></TextField>
						</ListItem>
						<ListItem alignItems='center' disablePadding>
							<TextField fullWidth label="Аудио-сообщение" value={getSelectedNode()!.message} onChange={event => selectedNodeChange([{key: "message", value: event.target.value}])} margin='dense'></TextField>
						</ListItem>
						<ListItem alignItems='center' disablePadding>
							<FormControl margin='dense' fullWidth>
                                <InputLabel id='link-select-label'>Смежная точка</InputLabel>
                                <Select labelId='link-select-label' label="Смежная точка" value={selectorValue} onChange={e => setSelectorValue(e.target.value as number)}>
                                    <MenuItem value={-1}>None</MenuItem>
									{
										getConnectedNodesById(graphInfo.selectedNodeId).map(node => {
											return <MenuItem value={node.id}>{node.label}</MenuItem>
										})
									}
                                </Select>
                            </FormControl>
						</ListItem>
						<ListItem alignItems='center' disablePadding>
							<TextField label="Link event" margin='dense' fullWidth value={getEdgeById(selectorValue)?.message} onChange={event => dispatch({type: "edge-update", args: {nodeId: selectorValue, changes: [{key: 'message', value: event.target.value}]}})}></TextField>
						</ListItem> 

		 			</List>
				</Grid>
			</Grid>
		</Stack>
		// <Box>
		// 	<CssBaseline/>
		// 	<AppBar position='sticky'>
		// 		<Toolbar>
		// 			<Button color={"inherit"}>NEW</Button>
		// 		</Toolbar>
		// 	</AppBar>
			
		// 	<Grid container>
		// 		<Grid xs={9}>
		// 			<Graph graphInfo={graphInfo} dispatcher={dispatch}/>
		// 		</Grid>
		// 		<Grid item xs>
		// 			<TextField fullWidth label="Выбранная вершина" value={graphInfo.selectedNodeInfo?.label} onChange={event => dispatch({type: 'selected-node-label-changed', args: {event: event}})}></TextField>
		// 			<TextField fullWidth label="ID" InputProps={{readOnly: true}} value={""} margin='dense'></TextField>

		// 			<List>
		// 				<ListItem alignItems="center" disablePadding>
		// 					<TextField fullWidth disabled={false} label="MAC" value={""} onInput={event => dispatch({type: 'mac-changed', args: {event: event}})}/>
		// 					<Checkbox checked={false} onChange={event => dispatch({type: 'mac-editable-changed', args: {event: event}})}/>
		// 				</ListItem>

		// 			</List>
				
		// 		</Grid>
		// 	</Grid>

		// </Box>
	);
}
{/* <Graph graphInfo={graphInfo} dispatcher={dispatch}/> */}
export default App;
