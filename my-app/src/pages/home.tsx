import React, {useState} from "react";


export function Home() {
  const [count, setCount] = useState<number>(0); // Type state as number

  return (
    <div className="flex flex-row">
      <Widget_Box />
      <Widget_Box />
    </div>
  );
}


const Widget_Box = () => {

  return(
    <div className="flex flex-col w-88 h-88 bg-white shadow-lg rounded-xl m-5">
        
    </div>
  )
}