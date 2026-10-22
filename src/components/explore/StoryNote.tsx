/** A committee's scribbled note on a slip of paper, in a handwritten-style face. */
export default function StoryNote({ text, siteName, className = '' }: { text: string; siteName: string; className?: string }) {
  return (
    <p
      className={`w-[8.5rem] rounded-[2px] bg-accent-bg px-2 py-1.5 font-hand text-[15px] leading-[1.15] text-ink shadow-float sm:w-[9.5rem] sm:text-base ${className}`}
    >
      <span className="sr-only">{siteName}’s old note: </span>
      {text}
    </p>
  )
}
