export enum CellValue {
    none,
    one,
    two, 
    three,
    four,
    five,
    six,
    seven,
    eight,
    bomb
} 

export enum CellState{
    open,
    visible,
    flagged
}

// this one is not an enum
export type Cell = {
    value: CellValue, 
    state: CellState
}


// enums dont have equal signs
export enum Face {
    smile = "😁",
    oh = "😵",
    lost = "🚩",
    won = "😎"
}