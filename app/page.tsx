import Game, { Time, Event, Base, Chars, Shop, Opening } from "./ui/components";

export default function Home(){
  return (
    <div className="wrapper">
      Earum Vana Vita - 그녀들의 바니바니한 생존기
      <Opening></Opening>
      <Game>
        <Time></Time>
        <Shop></Shop>
        <Base></Base>
        <Chars></Chars>
        <div className="event-wrapper">
          <div>Shift + wheel scroll for side-to-side scroll.  </div>
          <Event id={0} className="bg-red-200">식사</Event>
          <Event id={1} className="bg-blue-200">Event 1</Event>
          <Event id={2} className="bg-green-200">Event 2</Event>
          <Event id={3} className="bg-cyan-200">Event 3</Event>
          <Event id={4} className="bg-fuchsia-200">Event 4</Event>
          <Event id={5} className="bg-yellow-200">Event 5</Event>
        </div>
      </Game>
    </div>
  )
}