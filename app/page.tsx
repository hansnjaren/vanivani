import Game, { Time, Event, Base, Chars } from "./ui/components";

export default function Home(){
  return (
    <>
      Vanitas Vanitatum, et Omnia Vanitas

      <Game>
        <Time></Time>
        <Chars></Chars>
        <Base></Base>
        <Event id={0} className="bg-red-200">Event 0</Event>
        <Event id={1} className="bg-blue-200">Event 1</Event>
        <Event id={2} className="bg-green-200">Event 2</Event>
        <Event id={3} className="bg-cyan-200">Event 3</Event>
        <Event id={4} className="bg-fuchsia-200">Event 4</Event>
        <Event id={5} className="bg-yellow-200">Event 5</Event>
      </Game>
    </>
  )
}