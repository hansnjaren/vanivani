'use client'

import { createContext, useContext, useState } from "react"

type character = {
    name: string,
    hp: number,
    mental: number,
}

const charDef: character = {
    name: '',
    hp: 0,
    mental: 0,
}

type time = {
    day: number,
    time: number,
    events: number,
}

const timeDef: time = {
    day: 0,
    time: 0,
    events: 0,
}

const times = ['08:00', '10:00', '12:00', '14:00', '16:00', '18:00', '20:00', '22:00'];

const GameContext = createContext({
    time: timeDef,
    elapse: () => {},
    finishDay: () => {},
    misaki: charDef,
    hiyori: charDef,
    atsuko: charDef,
    updateMisaki: ({hp, mental}: {hp?: number, mental?: number}) => {},
    updateHiyori: ({hp, mental}: {hp?: number, mental?: number}) => {},
    updateAtsuko: ({hp, mental}: {hp?: number, mental?: number}) => {},
})

export function useGame(){
    const game = useContext(GameContext);
    if(!game) throw new Error('context error');
    return game;
}

export default function Game({ children }: { children: React.ReactNode }){
    const [time, setTime] = useState<time>({ day: 0, time: 0, events: times.length })
    const elapse = () => {
        time.time++;
        if(time.time >= time.events){
            time.day += (time.time / time.events);
            time.time %= time.events;
        }
        setTime({...time});
    }
    const finishDay = () => {
        time.day++;
        time.time = 0;
        setTime({...time});
    }
    const [misaki, setMisaki] = useState<character>({ name: 'Imashino Misaki', hp: 100, mental: 100, })
    const [hiyori, setHiyori] = useState<character>({ name: 'Tsuchinaga Hiyori', hp: 100, mental: 100, })
    const [atsuko, setAtsuko] = useState<character>({ name: 'Hakari Atsuko', hp: 100, mental: 100, })
    const updateMisaki = ({hp, mental}: {hp?: number, mental?: number}) => {
        if(hp) misaki.hp += hp;
        if(mental) misaki.mental += mental;
        setMisaki({...misaki})
    }
    const updateHiyori = ({hp, mental}: {hp?: number, mental?: number}) => {
        if(hp) hiyori.hp += hp;
        if(mental) hiyori.mental += mental;
        setHiyori({...hiyori})
    }
    const updateAtsuko = ({hp, mental}: {hp?: number, mental?: number}) => {
        if(hp) atsuko.hp += hp;
        if(mental) atsuko.mental += mental;
        setAtsuko({...atsuko})
    }
    return(
        <GameContext.Provider value={{
            time: time,
            elapse: elapse,
            finishDay: finishDay,
            misaki: misaki,
            hiyori: hiyori,
            atsuko: atsuko,
            updateMisaki: updateMisaki,
            updateHiyori: updateHiyori,
            updateAtsuko: updateAtsuko,
        }}>
            {children}
        </GameContext.Provider>
    )
}

export function Time(){
    const { time, elapse, finishDay } = useGame();
    return(
        <div>
            <div onClick={elapse} className="border-black border-solid border-2 inline-block">Time elapse</div>
            <div onClick={finishDay} className="border-black border-solid border-2 inline-block">Finish this day</div>
            <div>{ [ time.day, times[time.time], time.events ].toString() }</div>
        </div>
    )
}

export function Misaki(){
    const { misaki } = useGame();
    return(
        <div>{charToString(misaki)}</div>
    )
}

export function Hiyori(){
    const { hiyori } = useGame();
    return(
        <div>{charToString(hiyori)}</div>
    )
}

export function Atsuko(){
    const { atsuko } = useGame();
    return(
        <div>{charToString(atsuko)}</div>
    )
}

export function charToString(char: character){
    const { name, hp, mental } = char
    const retVal = 'Name: ' + name + ', HP: ' + hp + ', Mental Health: ' + mental;
    return retVal;
}

export function EventExample({ children, className }: { children: React.ReactNode, className?: string }){
    if(!className) className = ""
    const { elapse, updateMisaki, updateHiyori, updateAtsuko } = useGame();
    const updateTest = () => {
        updateMisaki({hp: 1});
        updateHiyori({mental: 2});
        updateAtsuko({hp: 3, mental: 4});
        elapse();
    }
    return(
        <div className={className} onClick={updateTest}>{ children }</div>
    )
}

type event = {
    hpMisaki?: number, 
    mentalMisaki?: number, 
    hpHiyori?: number, 
    mentalHiyori?: number, 
    hpAtsuko?: number, 
    mentalAtsuko?: number, 
}

const events: event[] = [
    {},
    { hpMisaki: 5, hpHiyori: 5, hpAtsuko: 5 },
    { hpMisaki: -5, hpHiyori: -5, hpAtsuko: -5 },
    { mentalMisaki: 5, mentalHiyori: 5, mentalAtsuko: 5 },
    { mentalMisaki: -5, mentalHiyori: -5, mentalAtsuko: -5 },
]

export function Event({ children, className, id }: { children: React.ReactNode, className?: string, id: number }){
    if(!className) className=""
    if(id >= events.length) throw new Error('event index undefined');
    const { elapse, updateMisaki, updateHiyori, updateAtsuko } = useGame();
    const { hpMisaki, mentalMisaki, hpHiyori, mentalHiyori, hpAtsuko, mentalAtsuko } = events[id];
    const update = () => {
        updateMisaki({ hp: hpMisaki, mental: mentalMisaki });
        updateHiyori({ hp: hpHiyori, mental: mentalHiyori });
        updateAtsuko({ hp: hpAtsuko, mental: mentalAtsuko });
        elapse();
    }
    return(
        <div className={className} onClick={update}>{children}</div>
    )
}