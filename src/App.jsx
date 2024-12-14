import React, { useState, useRef } from "react";
import "./App.css";

const App = () => {
  const [polygons, setPolygons] = useState([]);
  const [currentPolygon, setCurrentPolygon] = useState([]); 
  const [selectedPolygon, setSelectedPolygon] = useState(null); 
  const [undoStack, setUndoStack] = useState([]);
  const [redoStack, setRedoStack] = useState([]);
  const svgRef = useRef(null);

  const addVertex = (e) => {
    if (selectedPolygon !== null) return; 

    const { offsetX, offsetY } = e.nativeEvent;
    const newPoint = { x: offsetX, y: offsetY };

    if (currentPolygon.length > 2) {
      const [startX, startY] = [currentPolygon[0].x, currentPolygon[0].y];
      if (Math.hypot(offsetX - startX, offsetY - startY) < 10) {
        setPolygons([...polygons, currentPolygon]);
        setCurrentPolygon([]);
        saveState();
        return;
      }
    }

    setCurrentPolygon([...currentPolygon, newPoint]);
  };

  const saveState = () => {
    setUndoStack([...undoStack, { polygons, currentPolygon }]);
    setRedoStack([]);
  };

  const handleMouseMove = (e) => {
    if (!svgRef.current || selectedPolygon !== null) return;
    const { offsetX, offsetY } = e.nativeEvent;

    const previewLine = svgRef.current.querySelector(".preview-line");
    if (previewLine) {
      previewLine.setAttribute("x2", offsetX);
      previewLine.setAttribute("y2", offsetY);
    }
  };

  const startDrag = (polygonIndex, vertexIndex) => {
    setSelectedPolygon({ polygonIndex, vertexIndex });
  };

  const handleDrag = (e) => {
    if (!selectedPolygon) return;

    const { offsetX, offsetY } = e.nativeEvent;
    const { polygonIndex, vertexIndex } = selectedPolygon;

    const updatedPolygons = [...polygons];
    updatedPolygons[polygonIndex][vertexIndex] = { x: offsetX, y: offsetY };
    setPolygons(updatedPolygons);
  };

  const stopDrag = () => {
    if (selectedPolygon) {
      setSelectedPolygon(null);
      saveState();
    }
  };

  const deletePolygon = (index) => {
    const updatedPolygons = polygons.filter((_, i) => i !== index);
    setPolygons(updatedPolygons);
    saveState();
  };

  const undo = () => {
    if (undoStack.length > 0) {
      const lastState = undoStack.pop();
      setRedoStack([...redoStack, { polygons, currentPolygon }]);
      setPolygons(lastState.polygons);
      setCurrentPolygon(lastState.currentPolygon);
    }
  };

  const redo = () => {
    if (redoStack.length > 0) {
      const nextState = redoStack.pop();
      setUndoStack([...undoStack, { polygons, currentPolygon }]);
      setPolygons(nextState.polygons);
      setCurrentPolygon(nextState.currentPolygon);
    }
  };

  return (
    <div className="App" onMouseMove={handleMouseMove} onMouseUp={stopDrag}>
      <div className="controls">
        <button onClick={undo} disabled={!undoStack.length}>
          Undo
        </button>
        <button onClick={redo} disabled={!redoStack.length}>
          Redo
        </button>
      </div>
      <svg
        ref={svgRef}
        className="drawing-area"
        onClick={addVertex}
        onMouseLeave={stopDrag}
      >
        {polygons.map((polygon, i) => (
          <g key={i}>
            <polygon
              points={polygon.map(({ x, y }) => `${x},${y}`).join(" ")}
              fill="rgba(0, 128, 255, 0.3)"
              stroke="blue"
              strokeWidth="2"
            />
            {polygon.map((vertex, vi) => (
              <circle
                key={vi}
                cx={vertex.x}
                cy={vertex.y}
                r="5"
                fill="red"
                onMouseDown={() => startDrag(i, vi)}
              />
            ))}
            <text
              x={polygon[0].x}
              y={polygon[0].y - 10}
              fill="black"
              onClick={() => deletePolygon(i)}
              style={{ cursor: "pointer" }}
            >
              ❌
            </text>
          </g>
        ))}

        {currentPolygon.length > 0 && (
          <>
            <polyline
              points={currentPolygon.map(({ x, y }) => `${x},${y}`).join(" ")}
              fill="none"
              stroke="blue"
              strokeWidth="2"
            />
            <line
              className="preview-line"
              x1={currentPolygon[currentPolygon.length - 1].x}
              y1={currentPolygon[currentPolygon.length - 1].y}
              x2={currentPolygon[currentPolygon.length - 1].x}
              y2={currentPolygon[currentPolygon.length - 1].y}
              stroke="blue"
              strokeDasharray="5,5"
            />
          </>
        )}
      </svg>
    </div>
  );
};

export default App;
