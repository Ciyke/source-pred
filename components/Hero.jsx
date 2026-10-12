import './Hero.css'

export default function Hero() {
  return (
    <section id="hero" className="hero">
      <video
        className="hero__video"
        src="/trailer_compressed.mp4"
        autoPlay
        muted
        loop
        playsInline
      />
      <div className="hero__overlay" />
      <div className="hero__content">
        <h1 className="hero__title">Welcome to the Rumbleverse</h1>
        <a href="https://playrumble.gitbook.io/playrumble" target="_blank" rel="noopener noreferrer" className="hero__learn-more">Learn More</a>
      </div>
    </section>
  )
}
