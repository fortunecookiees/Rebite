import { motion, useReducedMotion } from 'motion/react'

// Bungkus section supaya muncul halus saat di-scroll ke layar.
// as="section" / "div", delay dalam detik.
export default function Reveal({ as = 'div', delay = 0, className, children, ...rest }) {
  const reduce = useReducedMotion()
  const Tag = motion[as]

  return (
    <Tag
      initial={reduce ? false : { opacity: 0, y: 24 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.15 }}
      transition={{ duration: 0.5, ease: 'easeOut', delay }}
      className={className}
      {...rest}
    >
      {children}
    </Tag>
  )
}
