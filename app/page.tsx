"use client";
import { useEffect, useRef, useState } from "react";
import {
  ArrowDown,
  ArrowUpRight,
  ArrowRight,
  Braces,
  Check,
  CircleDashed,
  Code2,
  Layers,
  Menu,
  Pause,
  Play,
  Plus,
  Search,
  X,
} from "lucide-react";
import { BlurFade } from "@/components/ui/blur-fade";
import { Orbital } from "@/components/orbital";
import { ProjectArt } from "@/components/project-art";
import { profile, projects, type Project } from "@/lib/portfolio";

export default function Home() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [paused, setPaused] = useState(false);
  const [filter, setFilter] = useState("All work");
  const [selected, setSelected] = useState<Project | null>(null);
  const [contact, setContact] = useState(false);
  const dialog = useRef<HTMLDialogElement>(null);
  const opener = useRef<HTMLElement | null>(null);
  const menuButton = useRef<HTMLButtonElement>(null);
  const projectCount = String(projects.length).padStart(2, "0");
  useEffect(() => {
    if (!menuOpen) return;
    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setMenuOpen(false);
        menuButton.current?.focus();
      }
    };
    window.addEventListener("keydown", handleEscape);
    return () => window.removeEventListener("keydown", handleEscape);
  }, [menuOpen]);
  useEffect(() => {
    if (selected || contact) {
      opener.current = document.activeElement as HTMLElement;
      dialog.current?.showModal();
      const previous = document.body.style.overflow;
      document.body.style.overflow = "hidden";
      return () => {
        document.body.style.overflow = previous;
        opener.current?.focus();
      };
    }
    dialog.current?.close();
  }, [selected, contact]);
  const closeDialog = () => {
    setSelected(null);
    setContact(false);
  };
  const talk = () => {
    setMenuOpen(false);
    if (profile.email) window.location.href = `mailto:${profile.email}`;
    else setContact(true);
  };
  return (
    <>
      <a className="skip-link" href="#main">
        Skip to content
      </a>
      <header className="site-header">
        <a className="wordmark" href="#" aria-label={`${profile.name} home`}>
          <span className="brand-symbol">
            <span />
            <span />
            <span />
          </span>{" "}
          {profile.name}
          <span className="brand-dot">.</span>
        </a>
        <nav className="desktop-nav" aria-label="Main navigation">
          <a href="#work">
            Work <span>{projectCount}</span>
          </a>
          <a href="#about">About</a>
          <a href="#approach">Approach</a>
        </nav>
        <div className="header-actions">
          <button className="talk-button" onClick={talk}>
            Let&apos;s talk <ArrowUpRight size={16} aria-hidden="true" />
          </button>
          <button
            ref={menuButton}
            className="menu-button"
            aria-expanded={menuOpen}
            aria-controls="mobile-nav"
            aria-label={menuOpen ? "Close navigation" : "Open navigation"}
            onClick={() => setMenuOpen(!menuOpen)}
          >
            {menuOpen ? <X /> : <Menu />}
          </button>
        </div>
        {menuOpen && (
          <nav
            id="mobile-nav"
            className="mobile-nav"
            aria-label="Mobile navigation"
          >
            {["Work", "About", "Approach"].map((item) => (
              <a
                href={`#${item.toLowerCase()}`}
                key={item}
                onClick={() => setMenuOpen(false)}
              >
                {item}
                <ArrowUpRight size={20} />
              </a>
            ))}
          </nav>
        )}
      </header>
      <main id="main">
        <section className="hero" aria-labelledby="hero-title">
          <div className="hero-top">
            <span className="eyebrow">
              <span className="status-dot" /> FULLSTACK DEVELOPER & PROJECT
              MANAGER
            </span>
            <span className="hero-edition">
              INDEPENDENT THINKING. CONNECTED EXECUTION.
            </span>
          </div>
          <div className="hero-grid">
            <div className="hero-copy">
              <BlurFade delay={0.05} blur="0px">
                <h1 id="hero-title">
                  Turning
                  <br />
                  possibility
                  <br />
                  into <em>reality.</em>
                  <span className="heading-star" aria-hidden="true">
                    ✳
                  </span>
                </h1>
              </BlurFade>
              <BlurFade delay={0.15} blur="0px">
                <p>
                  I build the product.
                  <br />I connect the dots.
                  <br />
                  <span>I get it across the finish line.</span>
                </p>
                <a className="primary-button" href="#work">
                  Explore my work <ArrowUpRight size={18} aria-hidden="true" />
                </a>
              </BlurFade>
            </div>
            <div className="hero-visual">
              <Orbital paused={paused} />
              <div className="visual-footer">
                <span>
                  <span className="visual-dot" /> CODE × CLARITY × CURIOSITY
                </span>
                <button
                  className="motion-toggle"
                  onClick={() => setPaused(!paused)}
                  aria-label={
                    paused
                      ? "Play decorative animation"
                      : "Pause decorative animation"
                  }
                  aria-pressed={paused}
                >
                  {paused ? <Play size={13} /> : <Pause size={13} />}
                  <span>{paused ? "PLAY" : "PAUSE"}</span>
                </button>
              </div>
            </div>
          </div>
          <div className="hero-bottom">
            <span>THOUGHTFUL PRODUCTS. PURPOSEFUL DELIVERY.</span>
            <a href="#work">
              SCROLL TO DISCOVER <ArrowDown size={15} aria-hidden="true" />
            </a>
            <span>PORTFOLIO / V.01</span>
          </div>
        </section>
        <section className="intro section-shell">
          <div className="section-index">
            <Plus size={16} aria-hidden="true" /> THE SWEET SPOT
          </div>
          <BlurFade inView blur="0px">
            <h2>
              A developer&apos;s mind.
              <br />A project manager&apos;s <em>perspective.</em>
            </h2>
          </BlurFade>
          <div className="intro-bottom">
            <span className="intro-asterisk" aria-hidden="true">
              ✳
            </span>
            <p>
              Great products need more than good code. They need a clear
              direction, people on the same page, and someone who cares about
              the details. That&apos;s the space I work in.
            </p>
          </div>
        </section>
        <section id="work" className="work section-shell">
          <div className="section-index">
            <span>01 / SELECTED WORK</span>
            <span>IDEAS MADE TANGIBLE</span>
          </div>
          <div className="section-heading">
            <h2>
              A few things
              <br />
              <em>worth building.</em>
            </h2>
            <div className="work-heading-right">
              <p>
                A look at products, systems,
                <br />
                and the thinking behind them.
              </p>
              <span className="sample-note">
                Preview: illustrative project concepts
              </span>
            </div>
          </div>
          <div
            className="work-filters"
            role="group"
            aria-label="Filter projects"
          >
            {["All work", "Development", "Leadership"].map((item) => (
              <button
                key={item}
                aria-pressed={filter === item}
                className={filter === item ? "active" : ""}
                onClick={() => setFilter(item)}
              >
                {item}
                {item === "All work" && <span>{projectCount}</span>}
              </button>
            ))}
          </div>
          <div className="projects-grid">
            {projects
              .filter(
                (project) =>
                  filter === "All work" || project.category === filter,
              )
              .map((project) => (
                <article
                  className={`project-card project-${project.id}`}
                  key={project.id}
                >
                  <button
                    className={`project-visual ${project.color}`}
                    onClick={() => setSelected(project)}
                    aria-label={`Explore ${project.title}, sample case study`}
                  >
                    <ProjectArt id={project.id} />
                    <span className="project-open">
                      <ArrowUpRight size={24} aria-hidden="true" />
                    </span>
                  </button>
                  <div className="project-info">
                    <div>
                      <span className="project-type">{project.type}</span>
                      <h3>
                        <button onClick={() => setSelected(project)}>
                          {project.title}
                          <ArrowUpRight size={22} aria-hidden="true" />
                        </button>
                      </h3>
                      <p>{project.subtitle}</p>
                    </div>
                    <span className="project-year">CONCEPT / 2026</span>
                  </div>
                  <div className="project-tags">
                    {project.tags.map((tag) => (
                      <span key={tag}>{tag}</span>
                    ))}
                  </div>
                </article>
              ))}
          </div>
        </section>
        <section id="about" className="about section-shell">
          <div className="section-index">
            <span>02 / THE PERSON BEHIND THE PIXELS</span>
            <Plus size={16} aria-hidden="true" />
          </div>
          <div className="about-grid">
            <div className="about-heading">
              <h2>
                Two hats.
                <br />
                <em>One direction.</em>
              </h2>
              <p>{profile.bio}</p>
              <span className="about-signature">
                Always curious. Intentionally hands-on.
              </span>
            </div>
            <div className="capabilities">
              <article>
                <span className="capability-icon">
                  <Braces size={24} />
                </span>
                <div>
                  <span className="capability-number">01</span>
                  <h3>Build with intention.</h3>
                  <p>
                    From the interface to the API. Thoughtful architecture,
                    responsive experiences, and code that&apos;s made to evolve.
                  </p>
                  <div className="skill-tags">
                    <span>Frontend</span>
                    <span>Backend</span>
                    <span>APIs & databases</span>
                  </div>
                </div>
              </article>
              <article>
                <span className="capability-icon">
                  <Layers size={24} />
                </span>
                <div>
                  <span className="capability-number">02</span>
                  <h3>Lead with clarity.</h3>
                  <p>
                    Turn the big picture into actionable steps. Connect people,
                    manage the moving parts, and keep delivery focused.
                  </p>
                  <div className="skill-tags">
                    <span>Planning</span>
                    <span>Communication</span>
                    <span>Delivery</span>
                  </div>
                </div>
              </article>
              <article>
                <span className="capability-icon">
                  <CircleDashed size={24} />
                </span>
                <div>
                  <span className="capability-number">03</span>
                  <h3>Keep connecting dots.</h3>
                  <p>
                    Bridge the technical and the practical. Ask better
                    questions, explore possibilities, and make considered
                    decisions.
                  </p>
                  <div className="skill-tags">
                    <span>Problem solving</span>
                    <span>Product thinking</span>
                  </div>
                </div>
              </article>
            </div>
          </div>
        </section>
        <section id="approach" className="approach section-shell">
          <div className="section-index">
            <span>03 / HOW I THINK</span>
            <span>GOOD WORK HAS A GOOD PROCESS</span>
          </div>
          <div className="section-heading">
            <h2>
              From the first “what if”
              <br />
              to the final <em>“it&apos;s live.”</em>
            </h2>
            <p>
              Structure that creates room
              <br />
              for better ideas.
            </p>
          </div>
          <div className="process-grid">
            {[
              {
                title: "Understand.",
                text: "Start with people and the problem. Ask questions, find the constraints, and agree on what success looks like.",
                icon: <Search size={25} />,
              },
              {
                title: "Connect.",
                text: "Bring the plan and the people together. Map the system, choose the tools, and make the next steps clear.",
                icon: <Layers size={25} />,
              },
              {
                title: "Create.",
                text: "Build in small, meaningful steps. Share early, test assumptions, and refine both the experience and the code.",
                icon: <Code2 size={25} />,
              },
              {
                title: "Deliver.",
                text: "Make the handover count. Test the details, document the decisions, and give the product a strong start.",
                icon: <ArrowUpRight size={25} />,
              },
            ].map((step, index) => (
              <article className="process-card" key={step.title}>
                <div className="process-top">
                  <span>0{index + 1}</span>
                  {step.icon}
                </div>
                <h3>{step.title}</h3>
                <p>{step.text}</p>
                <span className="process-line" />
              </article>
            ))}
          </div>
        </section>
        <section id="contact" className="contact section-shell">
          <div className="section-index">
            <span>THE NEXT GOOD IDEA STARTS WITH A CONVERSATION.</span>
            <span>04 / SAY HELLO</span>
          </div>
          <button className="contact-title" onClick={talk}>
            Let&apos;s make
            <br />
            <em>something matter.</em>
            <span className="contact-arrow">
              <ArrowUpRight aria-hidden="true" />
            </span>
          </button>
          <div className="contact-bottom">
            <p>
              A product to build? A project to move forward?
              <br />
              I&apos;d love to hear what you&apos;re thinking.
            </p>
            <button className="contact-button" onClick={talk}>
              Start a conversation <ArrowUpRight size={18} aria-hidden="true" />
            </button>
          </div>
        </section>
      </main>
      <footer className="site-footer">
        <a className="wordmark" href="#">
          {profile.name}
          <span className="brand-dot">.</span>
        </a>
        <span>BUILT WITH INTENTION. AND A LITTLE CURIOSITY.</span>
        <a href="#">
          BACK TO TOP <ArrowUpRight size={14} aria-hidden="true" />
        </a>
        <div className="social-links">
          {profile.github && (
            <a href={profile.github} target="_blank" rel="noopener noreferrer">
              GitHub <ArrowUpRight size={14} />
            </a>
          )}
          {profile.linkedin && (
            <a
              href={profile.linkedin}
              target="_blank"
              rel="noopener noreferrer"
            >
              LinkedIn <ArrowUpRight size={14} />
            </a>
          )}
        </div>
        <div className="footer-note">
          <span>
            © {new Date().getFullYear()} {profile.name}
          </span>
          <span>Preview edition · Sample identity and projects</span>
        </div>
      </footer>
      <dialog
        ref={dialog}
        className="detail-dialog"
        aria-labelledby="dialog-title"
        onCancel={closeDialog}
        onClick={(event) => {
          if (event.target === event.currentTarget) closeDialog();
        }}
      >
        <button
          className="dialog-close"
          onClick={closeDialog}
          aria-label="Close dialog"
        >
          <X size={22} />
        </button>
        {selected ? (
          <>
            <span className="eyebrow">
              ILLUSTRATIVE CASE STUDY / {selected.category.toUpperCase()}
            </span>
            <h2 id="dialog-title">
              {selected.title}
              <span className="brand-dot">.</span>
            </h2>
            <p className="dialog-summary">{selected.summary}</p>
            <div className={`dialog-art ${selected.color}`}>
              <ProjectArt id={selected.id} />
            </div>
            <div className="case-sections">
              {[
                ["The challenge", selected.challenge],
                ["The approach", selected.approach],
                ["The outcome", selected.outcome],
              ].map(([title, text]) => (
                <section key={title}>
                  <h3>{title}</h3>
                  <p>{text}</p>
                </section>
              ))}
            </div>
            <div className="dialog-notice">
              <Check size={17} />
              <p>
                This is a sample concept, ready to replace with your real work.
              </p>
            </div>
          </>
        ) : (
          <>
            <span className="eyebrow">LET&apos;S CONNECT</span>
            <h2 id="dialog-title">
              Good things
              <br />
              start with <em>hello.</em>
            </h2>
            <p className="dialog-summary">Contact details are coming soon.</p>
            <div className="contact-placeholder">
              <ArrowRight size={22} />
              <p>
                Thanks for stopping by. This is a preview of the portfolio;
                direct contact links will be available when it launches.
              </p>
            </div>
            <button className="primary-button" onClick={closeDialog}>
              Keep exploring <ArrowRight size={18} />
            </button>
          </>
        )}
      </dialog>
    </>
  );
}
