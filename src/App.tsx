import { LazyMotion, MotionConfig, domMax, m, useScroll, useSpring } from 'motion/react'
import { Contact } from './components/Contact'
import { Faq } from './components/Faq'
import { Footer } from './components/Footer'
import { Header } from './components/Header'
import { Hero } from './components/Hero'
import { OsBand } from './components/OsBand'
import { Process } from './components/Process'
import { Projects } from './components/Projects'
import { Reviews } from './components/Reviews'
import { Services } from './components/Services'
import { Story } from './components/Story'
import { PreviewBar } from './preview/PreviewBar'
import { usePreview } from './preview/PreviewContext'

export function App() {
  const { motionLevel } = usePreview()
  return (
    <LazyMotion features={domMax} strict>
      {/* „user”: követi a rendszer csökkentett-mozgás beállítását; a „Minimális” mód mindig kikapcsolja a mozgó transzformációkat */}
      <MotionConfig reducedMotion={motionLevel === 'off' ? 'always' : 'user'}>
        <a className="skip-link" href="#main">
          Ugrás a tartalomra
        </a>
        <ScrollProgress />
        <Header />
        <main id="main">
          <Hero />
          <Projects />
          <Services />
          <Process />
          <Story />
          <Reviews />
          <OsBand />
          <Faq />
          <Contact />
        </main>
        <Footer />
        <PreviewBar />
      </MotionConfig>
    </LazyMotion>
  )
}

function ScrollProgress() {
  const { scrollYProgress } = useScroll()
  const scaleX = useSpring(scrollYProgress, { stiffness: 200, damping: 40, restDelta: 0.001 })
  return <m.div className="scroll-progress" style={{ scaleX }} aria-hidden="true" />
}
