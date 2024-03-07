import { useEffect, useLayoutEffect, useRef, useState } from "react";

var edgeId = -1;
var nodeId = -1;

function generateEdgeId(){
    edgeId++;
    return edgeId;
}

function generateNodeId(){
    nodeId++;
    return nodeId;
}

function convertMousePosToSVGPos(mouseX: number, mouseY: number){
    const pt = new DOMPointReadOnly(mouseX, mouseY);
    const mainSVG = document.getElementById('svg-container') as unknown as SVGSVGElement
    const {x, y} = pt.matrixTransform(mainSVG.getScreenCTM()?.inverse())
    return [x, y] as const
}

function useFocus(){
    const ref = useRef<any>();
    const [isFocused, setFocus] = useState(false);

    useEffect(() => {
        const handleMouseEnter = () => {setFocus(true)}
        const handleMouseLeave = () => {setFocus(false)}
        if(ref){
            ref.current?.addEventListener('mouseover', handleMouseEnter);
            ref.current?.addEventListener('mouseleave', handleMouseLeave);
        }
        return () => {
            ref.current?.removeEventListener('mouseover', handleMouseEnter);
            ref.current?.removeEventListener('mouseleave', handleMouseLeave);
        }
    }, [ref])

    return [ref, isFocused] as const;
}

function useMousePosition(){
    const [position, setPosition] = useState({x: 0, y: 0})

    useEffect(() => {

        function handleMouseMove(event: MouseEvent){
            setPosition({x: event.clientX, y: event.clientY})
        }
        window.addEventListener('mousemove', handleMouseMove)
        return () => {
            window.removeEventListener('mousemove', handleMouseMove)
        }
    }, [])

    return position
}

function useSize(initialRef?:any){
    const ref = useRef<any>(initialRef)
    const [size, setSize] = useState({width: 0, height: 0})

    useLayoutEffect( () => {

        function handleResize(){
            setSize({width: ref.current.clientWidth, height: ref.current.clientHeight})
        }

        handleResize()
        window.addEventListener('resize', handleResize)
        return () => {
            window.removeEventListener("resize", handleResize);
        }
    }, [ref])

    return [ref, size] as const
}

export {convertMousePosToSVGPos, generateEdgeId, generateNodeId, useFocus, useMousePosition, useSize}