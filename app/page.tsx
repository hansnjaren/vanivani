import Game, { Time, Atsuko, Hiyori, Misaki, EventExample, Event } from "./ui/components";

export default function Home(){
  return (
    <>
      Vanitas Vanitatum, et Omnia Vanitas

      <Game>
        <Time></Time>
        <Misaki></Misaki>
        <Hiyori></Hiyori>
        <Atsuko></Atsuko>
        <EventExample className="bg-gray-200">Event</EventExample>
        <Event id={0}>Event 0</Event>
        <Event id={1}>Event 1</Event>
        <Event id={2}>Event 2</Event>
        <Event id={3}>Event 3</Event>
        <Event id={4}>Event 4</Event>
      </Game>
    </>
  )
}