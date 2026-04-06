interface IlustracaoSobrancelhaProps {
  intensidade: number
  className?: string
}

export default function IlustracaoSobrancelha({ intensidade, className = "" }: IlustracaoSobrancelhaProps) {
  const op = intensidade / 100

  return (
    <svg viewBox="0 0 60 60" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>
      <circle cx="30" cy="30" r="26" fill={`hsl(25 45% 35% / ${op * 0.8})`} />
      <circle cx="30" cy="30" r="26" stroke={`hsl(25 35% 30% / ${op * 0.2})`} strokeWidth="1" />
    </svg>
  )
}
