'use client'

import { createContext, useCallback, useContext, useEffect, useState } from "react"

type status = {
    hp: number, 
    cond: number, 
    mental: number, 
}

type character = {
    name: string,
    status: status,
    working: number,  
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

// 0: breakfast, 2: lunch, 4: dinner, 
// 1: morning event, 3: afternoon event, 5: night event, 
const times = ['08:00', '09:00', '13:00', '14:00', '18:00', '19:00', '23:00'];
const eventNum = 5;
const maxHP = 100;
const maxCond = 100;
const maxMental = 100;
const sleepCondition = 5;
const mealCondition = 2;

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
    chars: new Array<character>(),
    /**
     * Function updating the data of the character chosen
     * @param id
     * id of the character
     * @param status
     * value increased; use minus value when decreased
     */
    updateChars: ({id, status, rand, length}: {id: number, status: charStatus, rand: charStatus, length: number}) => {},
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
    updateBase: ({status, rand}: {status: baseStatus, rand: baseStatus}) => {},
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
    avail: new Array<number>(), 
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
        if(time.time % 2 === 0) updateWorking();
        updateRandom();
    }
    const finishDay = () => {
        time.day++;
        time.time = 0;

        if(chars[0].status.mental < 50) updateChars({ id: 0, status: { hp: -2 }, rand: {}, length: 0 })
        if(chars[1].status.hp < 50) updateChars({ id: 1, status: { mental: -5 }, rand: {}, length: 0 })
        if(chars[2].status.hp + chars[2].status.cond + chars[2].status.mental < 240){
            updateChars({ id: 0, status: { mental: -5 }, rand: {}, length: 0 })
            updateChars({ id: 1, status: { mental: -5 }, rand: {}, length: 0 })
        }
        for(let i = 0; i < chars.length; i++){
            updateChars({ id: i, status: { hp: chars[i].status.cond + sleepCondition < maxCond ? 0 : 2, cond: sleepCondition, }, rand: {}, length: 0})
        }

        setTime({...time});
        setChars([...chars]);
        updateRandom();
    }

    const [chars, setChars] = useState<Array<character>>([
        { name: 'Imashino Misaki', status: { hp: 100, cond: 100, mental: 100, }, working: 0, }, 
        { name: 'Tsuchinaga Hiyori', status: { hp: 100, cond: 100, mental: 100, }, working: 0, },
        { name: 'Hakari Atsuko', status: { hp: 100, cond: 100, mental: 100, }, working: 0, },
    ])
    const updateChars = ({ id, status, rand, length }: { id: number, status: charStatus, rand: charStatus, length: number }) => {
        if(id < 0 || id >= chars.length) throw new Error('character index undefined');
        if(status.hp){
            const diff = status.hp + (rand.hp ? rand.hp : 0);
            chars[id].status.hp = chars[id].status.hp + diff < maxHP ? chars[id].status.hp + diff : maxHP;
        }
        if(status.cond){
            const diff = status.cond + (rand.cond ? rand.cond : 0);
            chars[id].status.cond = chars[id].status.cond + diff < maxCond ? chars[id].status.cond + diff : maxCond;
        }
        if(status.mental){
            const diff = status.mental + (rand.mental ? rand.mental : 0);
            chars[id].status.mental = chars[id].status.mental + diff < maxMental ? chars[id].status.mental + diff : maxMental;
        }
        if(length > 0) chars[id].working = length;
        setChars([...chars])
    }

    const [base, setBase] = useState<base>({ food: 50, ammo: 100, cash: 50000, });
    const updateBase = ({status, rand}: {status: baseStatus, rand: baseStatus}) => {
        if(status.food) base.food += status.food + (rand.food ? rand.food : 0);
        if(status.ammo) base.ammo += status.ammo + (rand.ammo ? rand.ammo : 0);
        if(status.cash) base.cash += status.cash + (rand.cash ? rand.cash : 0);
        setBase({...base});
    }

    const [events, setEvents] = useState<Array<event>>([
        { charEvent: { people: 0, status: { cond: mealCondition, }, length: 0, charList: [], rand: {}, }, baseEvent: { status: { food: -5 }, rand: {}, }, event: false, },
        { event: true, }, 
        { charEvent: { people: 3, status: { hp: 5 }, length: 1, charList: [], rand: {}, }, event: true, },
        { charEvent: { people: 2, status: { cond: -5 }, length: 2, charList: [], rand: {}, }, event: true, },
        { baseEvent: { status: { food: 10, ammo: 100, cash: 10000, }, rand: {}, }, event: true, },
        { charEvent: { people: 1, status: { mental: 10 }, length: 3, charList: [], rand: {} }, baseEvent: { status: { food: -2, }, rand: {}, }, event: true, },
    ]);

    const updateEvent = ({id}: {id: number}) => {
        const { charEvent, baseEvent, event } = events[id];
        if(event){
            if(charEvent){
                if(charEvent.charList)
                    for(const i of charEvent.charList)
                        updateChars({ id: i, status: charEvent.status, rand: charEvent.rand, length: charEvent.length })
            }
            if(baseEvent) updateBase({ status: baseEvent.status, rand: baseEvent.rand });
        }
        else{
            if(charEvent){
                for(let i = 0; i < avail.length; i++){
                    updateChars({ id: avail[i], status: charEvent.status, rand: charEvent.rand, length: charEvent.length});
                    if(baseEvent) updateBase({ status: baseEvent.status, rand: baseEvent.rand });
                }
            }
        }
        elapse();
    }

    function updateRandom(){
        for(const event of events){
            if(event.charEvent && event.charEvent.people <= avail.length){
                event.charEvent.charList = [...randomNums(event.charEvent.people, avail)].sort();
                event.charEvent.rand = { 
                    hp: event.charEvent.status.hp ? Math.trunc(dist() * event.charEvent.status.hp) : 0, 
                    cond: event.charEvent.status.cond ? Math.trunc(dist() * event.charEvent.status.cond) : 0,
                    mental: event.charEvent.status.mental ? Math.trunc(dist() * event.charEvent.status.mental) : 0,
                }
            }
            if(event.baseEvent){
                event.baseEvent.rand = { 
                    food: event.baseEvent.status.food ? Math.trunc(dist() * event.baseEvent.status.food) : 0, 
                    ammo: event.baseEvent.status.ammo ? Math.trunc(dist() * event.baseEvent.status.ammo) : 0,
                    cash: event.baseEvent.status.cash ? Math.trunc(dist() * event.baseEvent.status.cash) : 0,
                }
            }
        }
        setEvents([...events]);
    }

    // 일단 하기는 했는데 왜 updateRandom처럼 처음에 적용이 안 되는건지...
    const [avail, setAvail] = useState<Array<number>>(Array.from({length: chars.length}, (_, i) => i));
    function updateWorking(){
        let rtn = new Array<number>();
        for( let i = 0; i < chars.length; i++ ){
            if(chars[i].working > 0) chars[i].working--;
            if(chars[i].working === 0) rtn.push(i);
        }
        setChars([...chars]);
        setAvail([...rtn.sort()]);
    }

    useEffect(() => { // 초기 random 조건 생성
        updateWorking();
        updateRandom();
    }, [])

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
            avail: avail, 
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
    const { avail, chars } = useGame();
    return(
        <div>
            {
                chars.map(function(char: character){
                    return <div key={char.name}>{charToString(char)}</div>;
                })
            }
            Available characters:&nbsp;
            {   avail.length > 0 ? 
                avail.map(function(id, i){
                    return <div className="inline-block" key={i}>{i == 0 ? '' : ', '}{chars[id].name}</div>
                }) : <div className="inline-block">None</div>
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
    const { name, status, working } = char
    const { hp, cond, mental } = status
    const retVal = 'Name: ' + name + ', HP: ' + hp + ', Condition: ' + cond + ', Mental Health: ' + mental + ', Working: ' + working;
    return retVal;
}

type charStatus = {
    hp?: number, 
    cond?: number, 
    mental?: number, 
}

type charEvent = {
    people: number, 
    status: charStatus, 
    length: number, 
    charList: Array<number>, 
    rand: charStatus, 
}

type baseStatus = {
    food?: number, 
    ammo?: number, 
    cash?: number, 
}

type baseEvent = {
    status: baseStatus, 
    rand: baseStatus, 
}

type event = {
    charEvent?: charEvent, 
    baseEvent?: baseEvent,
    event: boolean,  
}

export function Event({ children, className, id }: { children: React.ReactNode, className?: string, id: number }){
    if(!className) className=""
    const { time, avail, events, chars, base, updateEvent } = useGame();
    if(id >= events.length) throw new Error('event index undefined');
    const { charEvent, baseEvent, event } = events[id];
    
    const available = () => {
        if(time.time % 2 === 0 && event) return false;
        else if(time.time % 2 === 1 && !event) return false;
        if(baseEvent){
            if(baseEvent.status.ammo && base.ammo + (baseEvent.status.ammo + (baseEvent.rand.ammo ? baseEvent.rand.ammo : 0)) * (event ? 1 : avail.length) < 0) return false;
            if(baseEvent.status.cash && base.cash + (baseEvent.status.cash + (baseEvent.rand.cash ? baseEvent.rand.cash : 0)) * (event ? 1 : avail.length) < 0) return false;
            if(baseEvent.status.food && base.food + (baseEvent.status.food + (baseEvent.rand.food ? baseEvent.rand.food : 0)) * (event ? 1 : avail.length) < 0) return false;
        }
        if(charEvent){
            if(charEvent.people > avail.length) return false;
            if(charEvent.charList){
                for(const id of charEvent.charList){
                    if(charEvent.status.hp && chars[id].status.hp + charEvent.status.hp + (charEvent.rand.hp ? charEvent.rand.hp : 0) < 0) return false;
                    if(charEvent.status.cond && chars[id].status.cond + charEvent.status.cond + (charEvent.rand.cond ? charEvent.rand.cond : 0) < 0) return false;
                    if(charEvent.status.mental && chars[id].status.mental + charEvent.status.mental + (charEvent.rand.mental ? charEvent.rand.mental : 0) < 0) return false;
                }
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
            }) : <div className="inline-block">{ event ? 'None' : 'Everyone available' }</div> }

            { charEvent ? <div>
                Effect to chosen characters:
                HP:&nbsp;{charEvent.status.hp ? // is HP affected?
                          (charEvent.status.hp + (charEvent.rand.hp ? charEvent.rand.hp : 0) > 0 ? '+' : '') // sign of value
                           + (charEvent.status.hp + (charEvent.rand.hp ? charEvent.rand.hp : 0)) // value
                           : 'Not affected'},
                Condition:&nbsp;{charEvent.status.cond ? 
                                 (charEvent.status.cond + (charEvent.rand.cond ? charEvent.rand.cond : 0) > 0 ? '+' : '')
                                 + (charEvent.status.cond + (charEvent.rand.cond ? charEvent.rand.cond : 0))
                                 : 'Not affected'},
                Mental:&nbsp;{charEvent.status.mental ? 
                              (charEvent.status.mental + (charEvent.rand.mental ? charEvent.rand.mental : 0) > 0 ? '+' : '') 
                              + (charEvent.status.mental + (charEvent.rand.mental ? charEvent.rand.mental : 0))
                              : 'Not affected'}
                </div> : <div></div> }

            { baseEvent ? <div>
                Effect to base: 
                Food:&nbsp;{baseEvent.status.food ?
                            ((baseEvent.status.food + (baseEvent.rand.food ? baseEvent.rand.food : 0)) * (event ? 1 : avail.length) > 0 ? '+' : '')
                            + (baseEvent.status.food + (baseEvent.rand.food ? baseEvent.rand.food : 0)) * (event ? 1 : avail.length)
                            : 'Not affected'},
                Ammo:&nbsp;{baseEvent.status.ammo ?
                            ((baseEvent.status.ammo + (baseEvent.rand.ammo ? baseEvent.rand.ammo : 0)) * (event ? 1 : avail.length) > 0 ? '+' : '')
                            + (baseEvent.status.ammo + (baseEvent.rand.ammo ? baseEvent.rand.ammo : 0)) * (event ? 1 : avail.length)
                            : 'Not affected'},
                Cash:&nbsp;{baseEvent.status.cash ?
                            ((baseEvent.status.cash + (baseEvent.rand.cash ? baseEvent.rand.cash : 0)) * (event ? 1 : avail.length) > 0 ? '+' : '')
                            + (baseEvent.status.cash + (baseEvent.rand.cash ? baseEvent.rand.cash : 0)) * (event ? 1 : avail.length)
                            : 'Not affected'}
            </div> : <div></div> }
            {/* <div>Base affected: { baseEvent ? 'Yes' : 'No' }</div> */}
        </div>
    )
}

function randomNums(n: number, set: Array<number>){
    if(n > set.length) throw new Error('cannot choose ' + n + ' numbers in set of ' + set.length + ' numbers');
    let ret = new Set<number>();
    while(ret.size < n){
        const rand = Math.floor(Math.random() * set.length);
        ret.add(set[rand]);
    }
    return ret;
}

function dist(){ // based on Box-Muller transform; https://stackoverflow.com/questions/25582882/javascript-math-random-normal-distribution-gaussian-bell-curve
    let u = 0, v = 0;
    while(u === 0) u = Math.random(); //Converting [0,1) to (0,1)
    while(v === 0) v = Math.random();
    let num = Math.sqrt( -2.0 * Math.log( u ) ) * Math.cos( 2.0 * Math.PI * v );
    num = num / 10.0;
    if (num > 0.5 || num < -0.5) return dist()// resample between -0.5 and 0.5
    return num
}
