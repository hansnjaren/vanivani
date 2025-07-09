'use client'

import { createContext, Dispatch, SetStateAction, useCallback, useContext, useEffect, useState } from "react"
import { blackletter, batang } from "./fonts"
import type { status, character, time, base } from "@/app/lib/types"
import { times, eventNum, maxHP, maxCond, maxMental, sleepCondition, mealCondition, maxShopAmmo, maxShopFood, charList, eventList } from "@/app/lib/consts"

export const timeDef: time = {
    day: 0,
    time: 0,
    events: 0,
}

export const baseDef: base = {
    food: 0, 
    ammo: 0, 
    cash: 0, 
}

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
    shopVisible: false,
    shopKey : () => {},
    maxShopFood: maxShopFood,
    setMaxShopFood: (c: number) => {},
    maxShopAmmo: maxShopAmmo,
    setMaxShopAmmo: (c: number) => {},
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
    const [time, setTime] = useState<time>({ day: 1, time: 0, events: times.length })
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
        if((time.day % 7) == 0){ // refresh shop
            setMaxShopFood(maxShopFood);
            setMaxShopAmmo(maxShopAmmo);
        }

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

    const [chars, setChars] = useState<Array<character>>(charList);
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

    const [events, setEvents] = useState<Array<event>>(eventList);

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

    const [shopVisible, setShopVisible] = useState(false); // false for default
    const shopKey = () => {
        setShopVisible(!shopVisible);
    }

    
    const [ maxFood, setMaxFood ] = useState(maxShopFood);
    const [ maxAmmo, setMaxAmmo ] = useState(maxShopAmmo);
    
    const setMaxShopFood = (c: number) => {
        setMaxFood(c);
    }

    const setMaxShopAmmo = (c: number) => {
        setMaxAmmo(c);
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
            avail: avail, 
            shopVisible: shopVisible,
            shopKey: shopKey,
            maxShopFood: maxFood,
            setMaxShopFood: setMaxShopFood,
            maxShopAmmo: maxAmmo,
            setMaxShopAmmo: setMaxShopAmmo,
        }}>
            {children}
        </GameContext.Provider>
    )
}

export function Time(){
    const { time, elapse, finishDay } = useGame();
    return(
        <div style={{userSelect: 'none'}}>
            <span>Buttons For Debug</span>
            <div onClick={elapse} className="border-black border-solid border-2 inline-block">Time elapse</div>
            <div onClick={finishDay} className="border-black border-solid border-2 inline-block">Finish this day</div>
            <div>Day { time.day }, { times[time.time] }</div>
        </div>
    )
}


export function Chars(){
    const { avail, chars } = useGame();
    return(
        <div>
            {
                chars.map(function(char: character){
                    // return <div key={char.name}>{charToString(char)}</div>;
                    return charToUI(char);
                })
            }
            <br></br>
            {/* Available characters:&nbsp;
            {   avail.length > 0 ? 
                avail.map(function(id, i){
                    return <div className="inline-block" key={i}>{i == 0 ? '' : ', '}{chars[id].name}</div>
                }) : <div className="inline-block">None</div>
            } */}
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

function charToString(char: character){
    const { name, status, working } = char
    const { hp, cond, mental } = status
    const retVal = 'Name: ' + name + ', HP: ' + hp + ', Condition: ' + cond + ', Mental Health: ' + mental + ', Working: ' + working;
    return retVal;
}

function charToUI(char: character){
    const { name, status, working, img } = char
    const { hp, cond, mental } = status
    const gaugeWidth = 200;
    return(
        <div key={name} className="my-1 mr-1 inline-block border-black border-2 border-solid" style={{userSelect: "none"}}>
            <div className="align-middle w-32 inline-block m-2 top-0">
                <img src={img} alt="No Image"></img>
            </div>
            <div className="align-middle relative inline-block m-2">
                <div className="m-1 inline-block">{name}</div>
                <div className="m-1 absolute top-0 right-0">Working: {working}</div>
                <div className="m-1">
                    <div className="inline-block w-6">HP</div>
                    <div className="gauge bg-red-200" style={{width: gaugeWidth}}>
                        <div className="h-full bg-red-600" style={{width: (hp * gaugeWidth / 100)}}></div>
                    </div>
                    {hp}
                </div>
                <div className="m-1">
                    <div className="inline-block w-6">Co</div>
                    <div className="gauge bg-green-200" style={{width: gaugeWidth}}>
                        <div className="h-full bg-green-600" style={{width: (cond * gaugeWidth / 100)}}></div>
                    </div>
                    {cond}</div>
                <div className="m-1">
                    <div className="inline-block w-6">Me</div>
                    <div className="gauge bg-blue-200" style={{width: gaugeWidth}}>
                        <div className="h-full bg-blue-600" style={{width: (mental * gaugeWidth / 100)}}></div>
                    </div>
                    {mental}</div>
            </div>
        </div>
    )
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
    className = "event " + className;
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
            style={{userSelect: 'none', backgroundColor: available() ? '' : 'rgb(229 231 235)', display: available() ? '' : 'none'}}>
            <div>{ children }</div>
            <div className="flex">
                <div className="mx-auto">
                    {/* <div className="inline-block">Characters affected:&nbsp;</div> */}
                    { charEvent?.charList && charEvent.charList.length > 0 ? charEvent.charList.map((id, i) => {
                        return <img key={chars[id].name} className="w-12 inline-block" src={chars[id].img}></img>
                    }) : <div className="inline-block">{ event ? '' : chars.map((char, i) => {
                        return char.working > 0 ? <span key={`span-${char.name}-${i}`}></span>: <img key={`img-${char.name}-${i}`} className="w-12 inline-block" src={char.img}></img>
                    }) }</div> }
                </div>
            </div>
            { charEvent ? <div className="status left-0 bottom-0">
                <div>
                    HP:&nbsp;{charEvent.status.hp ? // is HP affected?
                                (charEvent.status.hp + (charEvent.rand.hp ? charEvent.rand.hp : 0) > 0 ? '+' : '') // sign of value
                                + (charEvent.status.hp + (charEvent.rand.hp ? charEvent.rand.hp : 0)) // value
                                : 0}
                </div>
                <div>
                    Co:&nbsp;{charEvent.status.cond ? 
                                    (charEvent.status.cond + (charEvent.rand.cond ? charEvent.rand.cond : 0) > 0 ? '+' : '')
                                    + (charEvent.status.cond + (charEvent.rand.cond ? charEvent.rand.cond : 0))
                                    : 0}
                </div>
                <div>
                    Me:&nbsp;{charEvent.status.mental ? 
                                (charEvent.status.mental + (charEvent.rand.mental ? charEvent.rand.mental : 0) > 0 ? '+' : '') 
                                + (charEvent.status.mental + (charEvent.rand.mental ? charEvent.rand.mental : 0))
                                : 0}
                </div>
                </div> : <div className="status left-0 bottom-0">
                <div>HP: 0</div>
                <div>Co: 0</div>
                <div>Me: 0</div>
                </div> }

            { baseEvent ? <div className="status right-0 bottom-0">
                <div>
                    Fo:&nbsp;{baseEvent.status.food ?
                                ((baseEvent.status.food + (baseEvent.rand.food ? baseEvent.rand.food : 0)) * (event ? 1 : avail.length) > 0 ? '+' : '')
                                + (baseEvent.status.food + (baseEvent.rand.food ? baseEvent.rand.food : 0)) * (event ? 1 : avail.length)
                                : 0}
                </div>
                <div>
                    Am:&nbsp;{baseEvent.status.ammo ?
                                ((baseEvent.status.ammo + (baseEvent.rand.ammo ? baseEvent.rand.ammo : 0)) * (event ? 1 : avail.length) > 0 ? '+' : '')
                                + (baseEvent.status.ammo + (baseEvent.rand.ammo ? baseEvent.rand.ammo : 0)) * (event ? 1 : avail.length)
                                : 0}
                </div>
                <div>
                    Ca:&nbsp;{baseEvent.status.cash ?
                                ((baseEvent.status.cash + (baseEvent.rand.cash ? baseEvent.rand.cash : 0)) * (event ? 1 : avail.length) > 0 ? '+' : '')
                                + (baseEvent.status.cash + (baseEvent.rand.cash ? baseEvent.rand.cash : 0)) * (event ? 1 : avail.length)
                                : 0}
                </div>
            </div> : <div className="status right-0 bottom-0">
                <div>Fo: 0</div>
                <div>Am: 0</div>
                <div>Ca: 0</div>
            </div> }
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

export function Counter({children, value, modifier, maxVal, className}: {children?: string, value: number, modifier: Dispatch<SetStateAction<number>>, maxVal?: number, className?: string}){
    // const [count, setCount] = useState(0);
    const decrease = () => modifier((c) => c > 0 ? c - 1 : c)
    const increase = () => modifier((c) => typeof(maxVal) == "number" && c >= maxVal ? c : c + 1)

    if(!className) className = "";
    const leftButton = "inline-block size-8 border-solid border-black border-y-2 border-l-2 align-center text-center" + className;
    const contentHolder = "inline-block size-8 border-solid border-black border-2 align-center text-center" + className
    const rightButton = "inline-block size-8 border-solid border-black border-y-2 border-r-2 align-center text-center" + className;

    return(
        <div style={{userSelect: 'none'}} className="m-3">
            <div className={className}>{children}</div>
            <div onClick={decrease} className={leftButton} 
            style={{
                backgroundColor: value > 0 ? 'transparent' : '#ccc',
                color: value > 0 ? 'black' : '#888',
                borderColor: value > 0 ? 'black' : '#888',
            }}>-</div>
            <div className={contentHolder}>{value}</div>
            <div onClick={increase} className={rightButton}
            style={{
                backgroundColor: typeof(maxVal) == "number" && value >= maxVal ? '#ccc' : 'transparent',
                color: typeof(maxVal) == "number" && value >= maxVal ? '#888' : 'black',
                borderColor: typeof(maxVal) == "number" && value >= maxVal ? '#888' : 'black',
            }}>+</div>
        </div>
    )
}


export function Shop(){
    const { base, maxShopFood, setMaxShopFood, maxShopAmmo, setMaxShopAmmo, shopVisible, shopKey } = useGame(); // consider moving it here
    const [ foodBuy, setFoodBuy ] = useState(0);
    const [ ammoBuy, setAmmoBuy ] = useState(0);

    const buyFood = () => {
        base.food += foodBuy * 10;
        setMaxShopFood(maxShopFood - foodBuy)
        setFoodBuy(0);
    }

    const buyAmmo = () => {
        base.ammo += ammoBuy * 100;
        setMaxShopAmmo(maxShopAmmo - ammoBuy)
        setAmmoBuy(0);
    }

    return(
        <>
            <div onClick={shopKey} className="border-black border-solid border-2 inline-block">Open Shop</div>
            { shopVisible ? <>
                                {/* <div className="fixed top-0 left-0 w-full h-full bg-gray-300 opacity-90 z-10"></div> */}
                                <div className="shop-background" style={{display: (shopVisible ? "" : "none")}}>
                                    <div className="fixed top-0 left-0 w-full h-full bg-gray-300 opacity-90 z-10" onClick={shopKey}></div>
                                    {/* Shop Header */}
                                    <div className="w-full h-1/6 items-center text-center flex" onClick={shopKey}>
                                        <div className="w-full text-center z-20" style={{userSelect: 'none'}}>
                                            <div className="text-2xl md:text-5xl m-3">Shop</div>
                                            <div>Cash: {base.cash}</div>
                                        </div>
                                    </div>
                                    {/* Food */}
                                    <div className="absolute top-1/4 w-4/12 inline-block bg-gray-500 z-20" style={{left: '8.3%', userSelect: 'none'}}>
                                        <div className="relative w-full text-center bg-white text-2xl">Food</div>
                                        <div className="m-3">Current food: {base.food}</div>
                                        <div className="m-3">Chosen: {foodBuy}</div>
                                        <div className="m-3">Max: {maxShopFood}</div>
                                        <Counter maxVal={maxShopFood} value={foodBuy} modifier={setFoodBuy}>Food * 10</Counter>
                                        <div className="bg-blue-500 text-center" onClick={buyFood}>Buy</div>
                                    </div>
                                    {/* Ammo */}
                                    <div className="absolute top-1/4 w-4/12 inline-block bg-gray-500 z-20" style={{right: '8.3%', userSelect: 'none'}}>
                                        <div className="relative w-full text-center bg-white text-2xl">Ammo</div>
                                        <div className="m-3">Current ammo: {base.ammo}</div>
                                        <div className="m-3">Chosen: {ammoBuy}</div>
                                        <div className="m-3">Max: {maxShopAmmo}</div>
                                        <Counter maxVal={maxShopAmmo} value={ammoBuy} modifier={setAmmoBuy}>Ammo * 100</Counter>
                                        <div className="bg-blue-500 text-center" onClick={buyAmmo}>Buy</div>
                                    </div>
                                    {/* <div className="w-1/12 inline-block"></div> */}
                                </div>
                            </>
                          : <></>}
        </>
    )
}

export function Opening(){
    const [openingVisible, setOpeningVisible] = useState(true); // true for default
    return(
        <div className="fixed top-0 right-0 size-full bg-white z-10" style={{display: (openingVisible ? "" : "none")}}>
            <div className={`${blackletter.className} title text-5xl w-full text-center`}>earum vana vita</div>
            <div className={`${batang.className} subtitle text-2xl text-gray-500 w-full text-center`}>그녀들의 헛된 생존기</div>
            <div className="w-1/2 h-3/4 absolute left-1/2 -translate-x-1/2">
                <div className="Misaki border-black border-solid border-2 w-full h-1/3 overflow-hidden m-3 flex items-center">{/* absolute left-1/4 */}
                    <div className="w-1/4 m-3 inline-block">
                        <img className="rotate-[-15deg]" src="Imashino_Misaki.jpg"></img>
                    </div>
                    <div className={`${batang.className} inline-block`}>모든 것은 헛되고 헛될텐데 이 모든 것에 무슨 의미가 있지...</div>
                </div>
                <div className="Hiyori border-black border-solid border-2 w-full h-1/3 overflow-hidden m-3 flex items-center">
                    <div className={`${batang.className} inline-block ml-auto`}>으아아앙- 오늘도 허탕이에요...</div>
                    <div className="w-1/4 m-3 inline-block">
                        <img className="rotate-[15deg]" src="Tsuchinaga_Hiyori.jpg"></img>
                    </div>
                </div>
                <div className="Atsuko border-black border-solid border-2 w-full h-1/3 overflow-hidden m-3 flex items-center">
                    <div className="w-1/4 m-3 inline-block">
                        <img className="rotate-[-15deg]" src="Hakari_Atsuko.jpg"></img>
                    </div>
                    <div className={`${batang.className} p-3 inline-block text-3xl border-black border-solid border-2 absolute left-1/2 -translate-x-1/2`} onClick={() => setOpeningVisible(false)} style={{userSelect: 'none'}}>START</div>
                </div>
            </div>
        </div>
    )
}
