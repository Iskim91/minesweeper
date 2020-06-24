import React, {useEffect, useState} from 'react';

import NumberDisplay from '../NumberDisplay';
import Button from '../Button';

import {generateCells, openMultipleCells} from '../../utils';
import {Cell, Face, CellState, CellValue} from '../../types';

import "./App.scss";
import { MAX_ROWS, MAX_COLS } from '../../constants';

const App: React.FC = () => {
    const [cells, setCells] = useState<Cell[][]>(generateCells());
    const [face, setFace] = useState<Face>(Face.smile);
    const [time, setTime] = useState<number>(0);
    const [live, setLive] = useState<boolean>(false);
    const [bombCounter, setBombCounter] = useState<number>(10);
    const [lost, setLost] = useState<boolean>(false);
    const [won, setWon] = useState<boolean>(false);
    
    
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

    useEffect(() => {
        if (lost === true) {
            setFace(Face.lost);
            setLive(false)
        }
    }, [lost])

    useEffect(() => {
        if (won) {
            setLive(false);
            setFace(Face.won)
        }
    }, [won])

    const showAllBombs = (): Cell[][] => {
        const currentCells = cells.slice();
        return currentCells.map(row => 
            row.map(cell => {
                if (cell.value === CellValue.bomb ) {
                    return {
                        ...cell,
                        state: CellState.visible
                    };
                };
                return cell;
            })
        )
    }

    const handleFaceClick = (): void => {
        setLive(false);
        setTime(0);
        setCells(generateCells());
        setLost(false);
        setWon(false);
        setBombCounter(10)
    }

    const handleCellClick = (rowParam: number, colParam: number) => (): void => {
        // starting the game
        if (!live) {
            setLive(true);
        }

        const currentCell = cells[rowParam][colParam];
        let newCells = cells.slice();

        if (currentCell.state === CellState.flagged || currentCell.state === CellState.visible) {
            return;
        }

        if (currentCell.value === CellValue.bomb) {
            setLost(true);
            newCells = showAllBombs();
            newCells[rowParam][colParam].red = true;
            setCells(newCells);
            return;
        } else if (currentCell.value === CellValue.none) {
            newCells = openMultipleCells(cells, rowParam, colParam)
        } else {
            newCells[rowParam][colParam].state = CellState.visible;
        }

        // Checks if you won
        let safeCells = false;
        for(let row=0; row < MAX_ROWS; row++) {
            for(let col = 0; col < MAX_COLS; col++) {
                const currentCell = newCells[row][col]

                if (currentCell.value !== CellValue.bomb && currentCell.state === CellState.open) {
                    safeCells = true;
                    break
                }
            }
        }

        if(!safeCells) {
            newCells = newCells.map(row => row.map(cell => {
                if(cell.value === CellValue.bomb) {
                    return {
                        ...cell,
                        state: CellState.flagged
                    }
                }
                return cell;
            }))
            setWon(true);
        }
        setCells(newCells);
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
                red={cell.red}
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