import { useEffect, useRef } from 'react'
import { animate, useInView, useReducedMotion } from 'motion/react'

// Angka yang naik dari 0 ke `value` saat terlihat di layar
export default function CountUp({ value, duration = 1.4, className }) {
  const ref = useRef(null)
  const inView = useInView(ref, { once: true })
  const reduce = useReducedMotion()

  useEffect(() => {
    const el = ref.current
    if (!el || !inView) return
    if (reduce) {
      el.textContent = value
      return
    }
    const controls = animate(0, value, {
      duration,
      ease: 'easeOut',
      onUpdate: (v) => {
        el.textContent = Math.round(v)
      },
    })
    return () => controls.stop()
  }, [value, inView, reduce, duration])

  return (
    <span ref={ref} className={className}>
      0
    </span>
  )
}
