import React, {useEffect, useReducer, useRef, useState} from "react";
import './Graph.css'
import { GraphInfo } from "./types";
import { convertMousePosToSVGPos, useFocus, useMousePosition, useSize } from "./utils";

type GraphProps = {
    graphInfo: GraphInfo,
    dispatcher: any
    width? :number
    height? :number
}

function Graph({graphInfo, dispatcher}:GraphProps){
    // const [scale, setScale] = useState(1);
    const [isMoveBG, setMoveBG] = useState(false)
    const [clickPosition, setClickPosition] = useState<{x: number, y:number} | null>(null);
    const [offset, setOffset] = useState({x: 0, y: 0})
    const [tempOffset, setTempOffset] = useState({x: 0, y: 0})
    const [focusRef, isFocused] = useFocus();
    const mousePosition = useMousePosition();
    const [matrix, setMatrix] = useState(document.createElementNS("http://www.w3.org/2000/svg", "svg").createSVGMatrix());
    // const [bgImagePosition, startMove, stopMove] = useMove({x: 0, y: 0})

    const handleWheel = (event: React.WheelEvent) => {
        event.stopPropagation()
        // console.log(event.deltaY)
        // if(event.deltaY > 0){
        //     var new_scale = Math.min(2, scale+0.1);
        //     setScale(new_scale)
        // }else{
        //     var new_scale = Math.max(0.1, scale-0.1);
        //     setScale(new_scale)
        // }
        const scale = 1.0 + (-event.deltaY * 0.001);
        const [x, y] = convertMousePosToSVGPos(event.clientX, event.clientY);
        setMatrix((old_matrix) => {
            const new_matrix = old_matrix.translate(x, y).scale(scale).translate(-x,-y);
            var transform = document.createElementNS("http://www.w3.org/2000/svg", "svg").createSVGTransform();
            transform.setMatrix(new_matrix);
            var container = document.getElementById("svg-container") as unknown as SVGGElement;
            container.transform.baseVal.initialize(transform);
            return new_matrix;
        });
    }

    const handleMouseDown = (event: React.MouseEvent) => {
        if(event.shiftKey || event.button == 2){
            setMoveBG(true)
            // console.log(event.target)
            const target = event.target as HTMLElement;
            target.style.cursor = 'grab'
            const [x,y] = convertMousePosToSVGPos(event.clientX, event.clientY)
            setClickPosition({x: x, y: y})
        }
    }

    const handleMouseUp = (event: React.MouseEvent) => {
        setMoveBG(false)
        const target = event.target as HTMLElement;
        target.style.cursor = 'auto'
        setClickPosition(null);
    }

    const handleRightMouse = (event: React.MouseEvent) => {
        event.stopPropagation();
        event.preventDefault();
        // setMoveBG(true)
        // // console.log(event.target)
        // const target = event.target as HTMLElement;
        // target.style.cursor = 'grab'
        // const [x,y] = convertMousePosToSVGPos(event.clientX, event.clientY)
        // setClickPosition({x: x, y: y})
    }

    useEffect(() => {

        function handleMove(event: MouseEvent){
            const [x, y] = convertMousePosToSVGPos(event.clientX, event.clientY)
            if(clickPosition == null) return;
            const dx = x - clickPosition.x
            const dy = y - clickPosition.y
            setMatrix((old_matrix) => {
                var new_matrix = old_matrix.translate(dx, dy);
                
                var transform = document.createElementNS("http://www.w3.org/2000/svg", "svg").createSVGTransform();
                transform.setMatrix(new_matrix);
                var container = document.getElementById("svg-container") as unknown as SVGGElement;
                container.transform.baseVal.initialize(transform);
                return new_matrix;
            })
        }

        if(isMoveBG){
            document.addEventListener("mousemove", handleMove)
        }

        return () => {
            document.removeEventListener("mousemove", handleMove)
        }
    }, [isMoveBG])

    useEffect(() => {
        function handleKeydown(event: KeyboardEvent){
            // console.log(event)
            if(event.key == 'v'){
                dispatcher({type: 'node-create', args: {mousePosition: mousePosition}})
            }
        }

        if(isFocused){
            window.addEventListener("keypress", handleKeydown)
        }

        return () => {
            window.removeEventListener('keypress', handleKeydown)
        }

    }, [isFocused, dispatcher, mousePosition])

    return (
        <div className="graph-container" onWheel={handleWheel} ref={focusRef}>
            <div className="hint">
                <p>
                    V - создать вершину<br/>
                    Ctrl - создать путь <br/>
                    Alt - выделить вершину<br/>
                    Shift - перемещение камеры
                </p>
            </div>
            <svg id="svg-main" viewBox={`${offset.x} ${offset.y} 5000 5000`} width="100%" height="90vmin" onMouseDown={handleMouseDown} onMouseUp={handleMouseUp} style={{userSelect: "none"}} onContextMenu={handleRightMouse}>
                <g id="svg-container">
                    <image id="bgImage" href="karta1.jpg" x={0} y={0} preserveAspectRatio="xMidYMid slice"/>
                    <g>
                        {
                            graphInfo.edges.map((v) => {
                                const nodes = graphInfo.nodes.filter(node => node.id in v.nodes);
                                console.log(nodes)
                                if(nodes.length < 2) return;
                                return <Edge key={v.id} startPos={nodes[0]} finishPos={nodes[1]} removePath={() => {dispatcher({type: "remove-path", args: {edgeId: v.id}})}}/>
                            })
                        }
                    </g>
                    <g>
                        {graphInfo.nodes.map((v) => {
                            if(v.id == -1) return;
                            return <Node 
                                        key={v.id} 
                                        nodeInfo={v}
                                        selected={graphInfo.selectedNodeId == v.id} 
                                        onMove={
                                            (event: any) => {
                                                var [x, y] = convertMousePosToSVGPos(event.clientX, event.clientY)
                                                dispatcher({type: "node-info-change", args: {nodeId: v.id, changes: [{key: "x", value: x}, {key: "y", value: y}]}})
                                            }
                                        }
                                        onSelect={
                                            () => {dispatcher({type: "node-select", args: {nodeId: v.id}})}
                                        }
                                        onPathCreate={
                                            () => {dispatcher({type: "create-path", args: {nodeId: v.id}})}
                                        }
                                        />
                        })}
                    </g>
                </g>
            </svg>
        </div>
    )
}

function Node(props:any){
    const [isMove, setMove] = useState(false)
    const handleMouseUp = (event: React.MouseEvent) => {
        event.stopPropagation()
        setMove(false)
    }
    const handleMouseDown = (event: React.MouseEvent) => {
        event.stopPropagation()
        if(event.altKey){
            props.onSelect()
            return
        }
        if(event.ctrlKey){
            props.onPathCreate()
            return;
        }
        setMove(true)
    }

    const handleMouseDoubleClick = (event : React.MouseEvent) => {
        event.stopPropagation();
        event.preventDefault();
        props.onSelect();
    }


    useEffect(() => {
        if(isMove){
            document.addEventListener('mousemove', props.onMove)
        }

        return () => {
            document.removeEventListener('mousemove', props.onMove)
        }
    }, [isMove, props.onMove])

    return (
        <g onMouseDown={handleMouseDown} onMouseUp={handleMouseUp} onDoubleClick={handleMouseDoubleClick}>
            <circle className={`${isMove ? "node-move": "node"} ${props.selected ? "node-selected":""}`} cx={props.nodeInfo.x} cy={props.nodeInfo.y}/>
            <text focusable={"false"} className="node-label" style={{pointerEvents: "none", userSelect: "none"}} x={props.nodeInfo.x} y={props.nodeInfo.y} onMouseDown={() => {}}>{props.nodeInfo.label}</text>
        </g>
    )
}

function Edge(props: any){
    return (
        <line className="path" x1={props.startPos.x} y1={props.startPos.y} x2={props.finishPos.x} y2={props.finishPos.y} onDoubleClick={props.removePath}/>
    )
}

export default Graph
