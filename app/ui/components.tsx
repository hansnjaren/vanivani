'use client'

import { createContext, useContext, useEffect, useState } from "react"

type status = {
    hp: number, 
    cond: number, 
    mental: number, 
}

type character = {
    name: string,
    status: status, 
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

type base = {
    food: number, 
    ammo: number, 
    cash: number, 
}

const baseDef: base = {
    food: 0, 
    ammo: 0, 
    cash: 0, 
}

const times = ['08:00', '09:00', '13:00', '14:00', '18:00', '19:00', '23:00', '00:00'];
const charNum = 3;
const eventNum = 5;

const GameContext = createContext({
    /**
     * Constant holding the data of the time. 
     * Use with times to express time. 
     */
    time: timeDef,
    /**
     * Function let the time elapse. 
     */
    elapse: () => {},
    /**
     * Function finishing day and change status based on character's status and characteristics. 
     */
    finishDay: () => {},
    /**
     * Constant holding the data of the time
     */
    chars: new Array<character>(charNum),
    /**
     * Function updating the data of the character chosen
     * @param id
     * id of the character
     * @param status
     * value increased; use minus value when decreased
     */
    updateChars: ({id, status}: {id: number, status: statusEvent}) => {},
    /**
     * Constant holding the data of the base
     */
    base: baseDef,
    /**
     * Function updating the data of the base
     * @param food
     * food obtained; use minus value when decreased
     * @param ammo
     * ammo obtained; use minus value when decreased
     * @param cash
     * cash obtained; use minus value when decreased
     */
    updateBase: ({food, ammo, cash}: {food?: number, ammo?: number, cash?: number}) => {},
    /**
     * Constant holding the data of the events
     */
    events: new Array<event>(eventNum), 
    /**
     * Function updating the status of the game based on the event happened
     * @param id
     * Id of the event happened
     */
    updateEvent: ({id}: {id: number}) => {}, 
})

/**
 * Get the data of the game. 
 * @returns 
 * Context of the game
 */
export function useGame(){
    const game = useContext(GameContext);
    if(!game) throw new Error('context error');
    return game;
}

export default function Game({ children }: { children: React.ReactNode }){
    const [time, setTime] = useState<time>({ day: 0, time: 0, events: times.length })
    const elapse = () => {
        time.time++;
        if(time.time === times.length){
            finishDay();
            return;
        }
        setTime({...time});
        updateRandom();
    }
    const finishDay = () => {
        time.day++;
        time.time = 0;
        setTime({...time});
        updateRandom();
    }

    const [chars, setChars] = useState<Array<character>>([
        { name: 'Imashino Misaki', status: { hp: 100, cond: 100, mental: 100, }}, 
        { name: 'Tsuchinaga Hiyori', status: { hp: 100, cond: 100, mental: 100, }},
        { name: 'Hakari Atsuko', status: { hp: 100, cond: 100, mental: 100, }},
    ])
    const updateChars = ({ id, status }: { id: number, status: statusEvent }) => {
        if(id < 0 || id >= chars.length) throw new Error('character index undefined');
        if(status.hp) chars[id].status.hp += status.hp;
        if(status.cond) chars[id].status.cond += status.cond;
        if(status.mental) chars[id].status.mental += status.mental;
        setChars([...chars])
    }

    const [base, setBase] = useState<base>({ food: 0, ammo: 0, cash: 0, });
    const updateBase = ({food, ammo, cash}: {food?: number, ammo?: number, cash?: number}) => {
        if(food) base.food += food;
        if(ammo) base.ammo += ammo;
        if(cash) base.cash += cash;
        setBase({...base});
    }

    const [events, setEvents] = useState<Array<event>>([
        {},
        { charEvent: { people: 3, status: { hp: 5 }, charList: [], } },
        { charEvent: { people: 2, status: { cond: -5 }, charList: [], } },
        { baseEvent: { food: 10, ammo: 100, cash: 10000 }, },
        { charEvent: { people: 1, status: { mental: 10 }, charList: [], }, baseEvent: { food: -2 }, },
    ]);

    useEffect(() => { // 초기 random 조건 생성
        for(const event of events){
            if(event.charEvent) event.charEvent.charList = [...randomNums(event.charEvent.people, charNum)].sort();
        }
        setEvents([...events]);
    }, [])

    const updateEvent = ({id}: {id: number}) => {
        const { charEvent, baseEvent } = events[id];
        if(charEvent){
            if(charEvent.charList) for(const i of charEvent.charList) updateChars({ id: i, status: charEvent.status })
        }
        if(baseEvent) updateBase({ food: baseEvent.food, ammo: baseEvent.ammo, cash: baseEvent.cash });
        elapse();
    }

    /**
     * @todo
     * Set value of status random based on default value
     */
    function updateRandom(){
        for(const event of events){
            if(event.charEvent) event.charEvent.charList = [...randomNums(event.charEvent.people, charNum)].sort();
        }
        setEvents([...events]);
    }

    return(
        <GameContext.Provider value={{
            time: time,
            elapse: elapse,
            finishDay: finishDay,
            chars: chars,
            updateChars: updateChars,
            base: base,
            updateBase: updateBase,
            events: events, 
            updateEvent: updateEvent, 
        }}>
            {children}
        </GameContext.Provider>
    )
}

export function Time(){
    const { time, elapse, finishDay } = useGame();
    return(
        <div style={{userSelect: 'none'}}>
            <div onClick={elapse} className="border-black border-solid border-2 inline-block">Time elapse</div>
            <div onClick={finishDay} className="border-black border-solid border-2 inline-block">Finish this day</div>
            <div>{ [ time.day, times[time.time], time.events ].toString() }</div>
        </div>
    )
}


export function Chars(){
    const { chars } = useGame();
    return(
        <div>
            {
                chars.map(function(char: character){
                    return <div key={char.name}>{charToString(char)}</div>;
                })
            }
        </div>
    )
}

export function Base(){
    const { base } = useGame();
    const { food, ammo, cash } = base
    const baseStr = 'Food: ' + food + ', Ammo: ' + ammo + ', Cash: ' + cash;
    return(
        <div>{ baseStr }</div>
    )
}

export function charToString(char: character){
    const { name, status } = char
    const { hp, cond, mental } = status
    const retVal = 'Name: ' + name + ', HP: ' + hp + ', Condition: ' + cond + ', Mental Health: ' + mental;
    return retVal;
}

type statusEvent = {
    hp?: number, 
    cond?: number, 
    mental?: number, 
}

type charEvent = {
    people: number, 
    status: statusEvent, 
    charList: Array<number>, 
}

type baseEvent = {
    food?: number, 
    ammo?: number, 
    cash?: number, 
}

type event = {
    charEvent?: charEvent, 
    baseEvent?: baseEvent, 
}

export function Event({ children, className, id }: { children: React.ReactNode, className?: string, id: number }){
    if(!className) className=""
    const { events, chars, base, updateEvent } = useGame();
    if(id >= events.length) throw new Error('event index undefined');
    const { charEvent, baseEvent } = events[id];
    
    const available = () => {
        if(baseEvent){
            if(baseEvent.ammo && base.ammo + baseEvent.ammo < 0) return false;
            if(baseEvent.cash && base.cash + baseEvent.cash < 0) return false;
            if(baseEvent.food && base.food + baseEvent.food < 0) return false;
        }
        if(charEvent?.charList){
            for(const id of charEvent.charList){
                if(charEvent.status.hp && chars[id].status.hp + charEvent.status.hp < 0) return false;
                if(charEvent.status.cond && chars[id].status.cond + charEvent.status.cond < 0) return false;
                if(charEvent.status.mental && chars[id].status.mental + charEvent.status.mental < 0) return false;
            }
        }
        return true;
    }

    return(
        <div className={className} onClick={available()?() => updateEvent({id}):()=>{}} 
            style={{userSelect: 'none', backgroundColor: available() ? '' : 'rgb(229 231 235)'}}>
            <div>{ children }</div>
            <div className="inline-block">Characters affected:&nbsp;</div>
            { charEvent?.charList && charEvent.charList.length > 0 ? charEvent.charList.map((id, i) => {
                return <div className="inline-block" key={ chars[id].name }>{ i > 0 ? ', ' : '' }{ chars[id].name }</div>
            }) : <div className="inline-block">None</div> }
            { charEvent ? <div>
                Effect to chosen characters:
                HP:&nbsp;{charEvent.status.hp ? (charEvent.status.hp > 0 ? '+' : '') + charEvent.status.hp : 'Not affected'},
                Condition:&nbsp;{charEvent.status.cond ? (charEvent.status.cond > 0 ? '+' : '') + charEvent.status.cond : 'Not affected'},
                HP:&nbsp;{charEvent.status.mental ? (charEvent.status.mental > 0 ? '+' : '') + charEvent.status.mental : 'Not affected'}
                </div> : <div></div> }
            <div>Base affected: { baseEvent ? 'Yes' : 'No' }</div>
        </div>
    )
}

function randomNums(n: number, max: number){
    if(n > max) throw new Error('cannot choose ' + n + ' numbers in set of ' + max + ' numbers');
    let ret = new Set<number>();
    while(ret.size < n){
        const rand = Math.floor(Math.random() * max);
        ret.add(rand);
    }
    return ret;
}

// export function EventExample({ children, className }: { children: React.ReactNode, className?: string }){
//     if(!className) className = ""
//     const { elapse, updateChars } = useGame();
//     const updateTest = () => {
//         updateChars({id: 0, status: {hp: 1}});
//         updateChars({id: 1, status: {mental: 2}});
//         updateChars({id: 2, status: {hp: 3, mental: 4}});
//         elapse();
//     }
//     return(
//         <div className={className} onClick={updateTest}>{ children }</div>
//     )
// }