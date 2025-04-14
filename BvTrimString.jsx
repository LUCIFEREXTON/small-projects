import { useEffect, useRef, useState } from "react"
import BvTooltip from "./BvTooltip"

export const trimString = (string, length, from = 'end') => {
  if (string?.length > length && ['start', 'center', 'end'].includes(from)) {
    const dots = '...'
    if (from === 'start') {
      return `${dots}${string?.slice(string?.length - length + dots.length)}`
    } else if (from === 'center') {
      const left = Math.ceil((length - dots.length) / 2)
      const right = Math.floor((length - dots.length) / 2)
      return `${string?.slice(0, left)}${dots}${string?.slice(string?.length - right)}`
    } else {
      return `${string?.slice(0, length - dots.length)}${dots}`
    }
  }
  return string
}

export default function BvTrimString({ string, length, from, side = 'top', align = 'center', className, ...props }) {
  const textRef = useRef(null)
  const [isOverflowing, setIsOverflowing] = useState(length ? string?.length > length : false)

  useEffect(() => {
    if (from && !length) console.warn('BvTrimString: "from" prop is only applicable when "length" is provided')
    if (from && !['start', 'center', 'end'].includes(from)) console.warn('BvTrimString: "from" prop should be either "start", "center" or "end"')
  }, [from, length])

  useEffect(() => {
    if (length) {
      setIsOverflowing(string?.length > length)
    } else {
      const handleTextResize = () => {
        const element = textRef.current
        setIsOverflowing(element.offsetWidth < element.scrollWidth)
      }

      handleTextResize()

      window.addEventListener('resize', handleTextResize)
      return () => window.removeEventListener('resize', handleTextResize)
    }
  }, [string, length])

  return <BvTooltip tooltip={isOverflowing ? string : null} side={side} align={align}>
    <div {...props} className={length ? className : `text-ellipsis whitespace-nowrap overflow-hidden ${className}`} ref={textRef}>
      {length ? trimString(string, length, from) : string}
    </div>
  </BvTooltip>
}
