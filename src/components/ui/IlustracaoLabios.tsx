interface IlustracaoLabiosProps {
  intensidade: number
  className?: string
}

export default function IlustracaoLabios({ intensidade, className = "" }: IlustracaoLabiosProps) {
  const op = intensidade / 100

  return (
    <svg viewBox="0 0 60 60" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>
      <circle cx="30" cy="30" r="26" fill={`hsl(350 55% 58% / ${op * 0.85})`} />
      <circle cx="30" cy="30" r="26" stroke={`hsl(350 45% 50% / ${op * 0.2})`} strokeWidth="1" />
    </svg>
  )
}
