import { useCallback, useReducer, useState } from 'react';
import './App.css';
import Graph from './Graph';
import { convertMousePosToSVGPos, generateEdgeId, generateNodeId } from './utils';
import { GraphInfo, NodeType, EdgeType, FloorInfo } from './types';
import { AppBar, Box, Button,Checkbox,CssBaseline,Dialog,DialogTitle,FormControl,FormControlLabel,FormGroup,Grid,IconButton,InputLabel,List, ListItem,MenuItem,Select,Stack,TextField, Toolbar, Typography, createSvgIcon} from '@mui/material';
import PlanLoadDialog from './PlanLoadDialog';

function reducer(state: GraphInfo, action: {type:string, args: any}):GraphInfo{
	switch(action.type){
		case 'node-select':
			const new_id = state.floors[state.currentFloor].selectedNodeId == action.args.nodeId ? -1: action.args.nodeId;
			state.floors[state.currentFloor].selectedNodeId = new_id;
			console.log(state, action.args.nodeId, new_id)
			return {
				...state
			};
		case 'node-create':
			var [x, y] = convertMousePosToSVGPos(action.args.mousePosition.x, action.args.mousePosition.y);
			var id = generateNodeId()
			const new_node = {
				id: id, 
				x: x, 
				y: y, 
				label: `Точка ${id}`, 
				mac: "", 
				macEditable: false, 
				message: "", 
				isEndPoint: false
			}
			state.floors[state.currentFloor].nodes.push(new_node)
			return {
				...state,
			};
		case 'node-change':
			var changes : {key:keyof NodeType, value: any}[] = action.args.changes;
			let node4 = state.floors[state.currentFloor].nodes.find(v => v.id == action.args.nodeId)!;
			const updateNode = <K extends keyof NodeType>(key: K, value: NodeType[K]) => {
				node4[key] = value;
			}

			for(var i = 0; i < changes.length; i++){
				updateNode(changes[i].key, changes[i].value);
			}
			return {
				...state
			};
		case 'node-remove':
			if(action.args.nodeId == -1) return state;
			state.floors[state.currentFloor].nodes = state.floors[state.currentFloor].nodes.filter(node => node.id != action.args.nodeId);
			state.floors[state.currentFloor].selectedNodeId = -1;
			return {
				...state
			};
		case 'edge-create':
			if(state.floors[state.currentFloor].selectedNodeId == -1 || state.floors[state.currentFloor].selectedNodeId == action.args.nodeId) return state;
			
			const paths = state.floors[state.currentFloor].edges.filter((edge) => state.floors[state.currentFloor].selectedNodeId in edge.nodes && action.args.nodeId in edge.nodes)
			if(paths.length > 0){
				return state;
			}
			const new_edge = {
				id: generateEdgeId(), 
				nodes: {[state.floors[state.currentFloor].selectedNodeId]: 1, [action.args.nodeId]: 1}, 
				message: ""
			}
			state.floors[state.currentFloor].edges.push(new_edge);
			return {
				...state
			};
		case 'edge-remove':
			state.floors[state.currentFloor].edges = state.floors[state.currentFloor].edges.filter((edge) => edge.id !== action.args.edgeId)
			return {
				...state
			}
		case 'edge-update':
			let edge = state.floors[state.currentFloor].edges.find(e => action.args.nodeId in e.nodes && state.floors[state.currentFloor].selectedNodeId in e.nodes)
			if(edge == undefined) return state;
			
			edge.message = action.args.changes[0].value
			return {
				...state
			};
		case 'set-plan':
			state.floors[state.currentFloor].planURL = action.args.url
			return{
				...state
			}
		case 'set-current-floor':
			return{
				...state,
				currentFloor: action.args.value
			}
		case 'floor-create':
			state.floors.push(emptyFloor());
			state.currentFloor += 1;
			return {
				...state
			}
		case 'floor-remove':
			if(state.floors.length == 1) return state;
			state.floors.splice(state.currentFloor, 1);
			state.currentFloor -= 1;
			return {
				...state
			}
	}

	return state;
}

function initGraphInfo(): GraphInfo{
	return {
		floors: [emptyFloor()],
		currentFloor: 0
	}
}

function emptyFloor() :FloorInfo{
	const emptyNode: NodeType = {
		id: -1,
		label: "",
		x: 0,
		y: 0,
		isEndPoint: false,
		mac: "",
		macEditable: false,
		message: ""
	};
	return {
			selectedNodeId: -1,
			nodes: [emptyNode],
			edges: [],
			planURL: ""
	}
}

function App() {
	const [graphInfo, dispatch] = useReducer(reducer, initGraphInfo());
	const [selectorValue, setSelectorValue] = useState(-1);
	const [planLoadDialog, setPlanLoadDialogOpen] = useState(false);

	const getSelectedNode = () => {
		return graphInfo.floors[graphInfo.currentFloor].nodes.find(v => v.id === graphInfo.floors[graphInfo.currentFloor].selectedNodeId)
	}

	const selectedNodeChange = (changes: {key: keyof NodeType, value: any}[]) => {
		dispatch({type: "node-change", args: {nodeId: graphInfo.floors[graphInfo.currentFloor].selectedNodeId, changes: changes}});
	}

	const getConnectedNodesById = (id: number) => {
		var edges = graphInfo.floors[graphInfo.currentFloor].edges.filter(edge => id in edge.nodes);
		var ids = {[graphInfo.floors[graphInfo.currentFloor].selectedNodeId]: 1};
		edges.forEach(elem => {ids = Object.assign(ids, elem.nodes)})
		
		delete ids[graphInfo.floors[graphInfo.currentFloor].selectedNodeId];

		return graphInfo.floors[graphInfo.currentFloor].nodes.filter(node => node.id in ids);
	}

	const getEdgeById = (id: number) => {
		let edge = graphInfo.floors[graphInfo.currentFloor].edges.find(e => id in e.nodes && graphInfo.floors[graphInfo.currentFloor].selectedNodeId in e.nodes)
		if(edge == undefined) return ({id: -1, nodes: [], message: ""} as EdgeType)
		return edge;
	}

	const handlePlanDialogClose = (url: string) => {
		console.log(url)
		setPlanLoadDialogOpen(false);
		dispatch({type:'set-plan', args: {url: url}});
	}

	return (
		<Stack>
			<PlanLoadDialog open={planLoadDialog} onClose={handlePlanDialogClose}/>
			<CssBaseline/>
			<AppBar position='sticky'>
				<Toolbar>
					<Stack direction={'row'} spacing={3}>
						<Button color="inherit" onClick={() => dispatch({type: 'floor-create', args: {}})}>NEW</Button>
						<Button color="inherit" onClick={() => dispatch({type: 'floor-remove', args: {}})}>DELETE</Button>
						<Button color="inherit" onClick={() => dispatch({type: 'set-current-floor', args: {value: graphInfo.currentFloor + 1 >= graphInfo.floors.length? graphInfo.floors.length-1: graphInfo.currentFloor+1}})}>UP</Button>
						<Typography  variant="h5" textAlign={"center"} width={"100%"}>{graphInfo.currentFloor + 1}</Typography>
						<Button color="inherit" onClick={() => dispatch({type: 'set-current-floor', args: {value: graphInfo.currentFloor - 1 < 0? 0: graphInfo.currentFloor-1}})}>DOWN</Button>
						<Button color="inherit" onClick={e => setPlanLoadDialogOpen(true)}>PLAN</Button>
					</Stack>
				</Toolbar>
			</AppBar>
			<Grid container marginTop={"5px"}>
				<Grid item xs={9}>
					<Graph graphInfo={graphInfo.floors[graphInfo.currentFloor]} dispatcher={dispatch}/>
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
										getConnectedNodesById(graphInfo.floors[graphInfo.currentFloor].selectedNodeId).map(node => {
											return <MenuItem value={node.id}>{node.label}</MenuItem>
										})
									}
                                </Select>
                            </FormControl>
						</ListItem>
						<ListItem alignItems='center' disablePadding>
							<TextField label="Link event" margin='dense' fullWidth value={getEdgeById(selectorValue)?.message} onChange={event => dispatch({type: "edge-update", args: {nodeId: selectorValue, changes: [{key: 'message', value: event.target.value}]}})}></TextField>
						</ListItem> 
						<ListItem alignItems='center' disablePadding>
							<FormGroup row>
								<FormControlLabel control={<Checkbox value={getSelectedNode()?.isEndPoint} onChange={e => selectedNodeChange([{key: "isEndPoint", value: e.target.checked}])}/>} label={"Конечная точка"}/>
								{/* <FormControlLabel control={<Checkbox defaultChecked/>} label={"Route spelling"}/> */}
							</FormGroup>
						</ListItem>
						<ListItem alignItems='center' disablePadding>
							<Button fullWidth variant='contained'>экспортировать</Button>
						</ListItem>
						<ListItem alignItems='center' disableGutters>
							<Button fullWidth variant='contained'>импортировать</Button>
						</ListItem>

		 			</List>
				</Grid>
			</Grid>
		</Stack>
	);
}

const UpIcon = createSvgIcon(<svg width="800px" height="800px" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
<path fill-rule="evenodd" clip-rule="evenodd" d="M12 7C12.2652 7 12.5196 7.10536 12.7071 7.29289L19.7071 14.2929C20.0976 14.6834 20.0976 15.3166 19.7071 15.7071C19.3166 16.0976 18.6834 16.0976 18.2929 15.7071L12 9.41421L5.70711 15.7071C5.31658 16.0976 4.68342 16.0976 4.29289 15.7071C3.90237 15.3166 3.90237 14.6834 4.29289 14.2929L11.2929 7.29289C11.4804 7.10536 11.7348 7 12 7Z" fill="#000000"/>
</svg>, "UP")

const DownIcon = createSvgIcon(<svg width="800px" height="800px" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
<path fill-rule="evenodd" clip-rule="evenodd" d="M4.29289 8.29289C4.68342 7.90237 5.31658 7.90237 5.70711 8.29289L12 14.5858L18.2929 8.29289C18.6834 7.90237 19.3166 7.90237 19.7071 8.29289C20.0976 8.68342 20.0976 9.31658 19.7071 9.70711L12.7071 16.7071C12.3166 17.0976 11.6834 17.0976 11.2929 16.7071L4.29289 9.70711C3.90237 9.31658 3.90237 8.68342 4.29289 8.29289Z" fill="#000000"/>
</svg>, "DOWN")

export default App;
