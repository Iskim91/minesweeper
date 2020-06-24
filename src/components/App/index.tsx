import React, {useEffect, useState} from 'react';

import NumberDisplay from '../NumberDisplay';
import Button from '../Button';

import {generateCells} from '../../utils';
import {Cell, Face, CellState} from '../../types';

import "./App.scss";

const App: React.FC = () => {
    const [cells, setCells] = useState<Cell[][]>(generateCells());
    const [face, setFace] = useState<Face>(Face.smile);
    const [time, setTime] = useState<number>(0);
    const [live, setLive] = useState<boolean>(false);
    const [bombCounter, setBombCounter] = useState<number>(10);
    
    
    useEffect(() => {
        const handleMousedown = (): void => {
            setFace(Face.oh)
        }
        const handleMouseup = (): void => {
            setFace(Face.smile)
        }
        window.addEventListener("mousedown", handleMousedown)
        window.addEventListener("mouseup", handleMouseup)

        return () => {
            window.removeEventListener('mousedown', handleMousedown);
            window.removeEventListener('mouseup', handleMouseup);
        }
    }, []);

    useEffect(() => {
        if (live && time < 999) {
            const timer = setInterval(() => {
                setTime(time + 1)
            }, 1000);
            return () => {
                clearInterval(timer);
            }
        }
    }, [live, time])


    const handleFaceClick = (): void => {
        if (live) {
            setLive(false);
            setTime(0);
            setCells(generateCells());
        }
    }

    const handleCellClick = (rowParam: number, colParam: number) => (): void => {
        // starting the game
        if (!live) {
            setLive(true);
        }
    }

    const handleCellContext = (rowParam: number, colParam: number) => (e: React.MouseEvent<HTMLDivElement, MouseEvent>): void => {
        e.preventDefault();

        if (!live) {
            return;
        }
        const currentCell = cells[rowParam][colParam]
        const currentCells = cells.slice();

        if (currentCell.state === CellState.visible) {
            return;
        } else if (currentCell.state === CellState.open) {
            currentCells[rowParam][colParam].state = CellState.flagged;
            setCells(currentCells)
            setBombCounter(bombCounter - 1)
        } else if (currentCell.state === CellState.flagged) {
            currentCells[rowParam][colParam].state = CellState.open;
            setCells(currentCells)
            setBombCounter(bombCounter + 1)
        }
    }
    const renderCells = (): React.ReactNode => {
        return cells.map((row, rowIndex) => row.map((cell, colIndex) =>  (
            <Button 
                key={`${rowIndex}=${colIndex}`} 
                row={rowIndex} 
                col={colIndex} 
                state={cell.state} 
                value={cell.value}
                onClick={handleCellClick} 
                onContext={handleCellContext}
            />
        )))
    }
    return (
        <div className="App">
            <div className="Header">
                <NumberDisplay value={bombCounter}/>
                <div className="Face">
                    <span role="img" aria-label="face" onClick={handleFaceClick}>{face}</span>
                </div>
                <NumberDisplay value={time}/>
            </div>
            <div className="Body">
                {renderCells()}
            </div>
        </div>
    );
}
export default App;