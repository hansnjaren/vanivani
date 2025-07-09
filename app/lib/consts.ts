// 0: breakfast, 2: lunch, 4: dinner, 
// 1: morning event, 3: afternoon event, 5: night event, 
export const times = ['08:00', '09:00', '13:00', '14:00', '18:00', '19:00'];
export const eventNum = 5;
export const maxHP = 100;
export const maxCond = 100;
export const maxMental = 100;
export const sleepCondition = 5;
export const mealCondition = 2;
export const maxShopFood = 5;
export const maxShopAmmo = 5;

export const charList = [
    { name: 'Imashino Misaki', status: { hp: 100, cond: 100, mental: 100, }, working: 0, img: "Imashino_Misaki.jpg", }, 
    { name: 'Tsuchinaga Hiyori', status: { hp: 100, cond: 100, mental: 100, }, working: 0, img: "Tsuchinaga_Hiyori.jpg", },
    { name: 'Hakari Atsuko', status: { hp: 100, cond: 100, mental: 100, }, working: 0, img: "Hakari_Atsuko.jpg", },
]

export const eventList = [
    { charEvent: { people: 0, status: { cond: mealCondition, }, length: 0, charList: [], rand: {}, }, baseEvent: { status: { food: -5 }, rand: {}, }, event: false, },
    { event: true, }, 
    { charEvent: { people: 3, status: { hp: -5 }, length: 1, charList: [], rand: {}, }, event: true, },
    { charEvent: { people: 2, status: { cond: -5 }, length: 2, charList: [], rand: {}, }, event: true, },
    { baseEvent: { status: { food: 10, ammo: 100, cash: 10000, }, rand: {}, }, event: true, },
    { charEvent: { people: 1, status: { mental: 10 }, length: 3, charList: [], rand: {} }, baseEvent: { status: { food: -2, }, rand: {}, }, event: true, },
]