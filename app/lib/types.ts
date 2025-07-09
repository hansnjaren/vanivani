export type status = {
    hp: number, 
    cond: number, 
    mental: number, 
}

export type character = {
    name: string,
    status: status,
    working: number,  
    img: string, 
}

export type time = {
    day: number,
    time: number,
    events: number,
}

export type base = {
    food: number, 
    ammo: number, 
    cash: number, 
}
