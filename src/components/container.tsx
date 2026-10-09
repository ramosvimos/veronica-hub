import type { HTMLAttributes } from "react";
/** Shared width container retained for the isolated submission interface. */
export default function Container({className="",...props}:HTMLAttributes<HTMLDivElement>){return <div className={`pdf-container ${className}`} {...props}/>;}
